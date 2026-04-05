// SPDX-License-Identifier: MIT
import crypto from 'node:crypto';

import { config } from '@core/config/config.js';
import { formatMs } from '@core/config/format.js';
import { traverse } from '@core/config/traverse.js';
import { getMessages } from '@core/messages/index.js';
import { logAnalistas } from '@core/messages/pt/log/log-helper.js';
import { createDefaultReporter } from '@core/reporting/default-reporter.js';
import { WorkerPool } from '@core/workers/worker-pool.js';
import { lerEstado, salvarEstado } from '@shared/persistence/persistencia.js';
import XXH from 'xxhashjs';

import type { ContextoExecucao, EstadoIncremental, FileEntryWithAst, GuardianResult, MetricaAnalista, MetricaExecucao, MetricasGlobais, Ocorrencia, ResultadoInquisicao, Tecnica } from '@';
import { ocorrenciaErroAnalista } from '@';

import type { ExecutorEventEmitter } from '../../types/core/config/config.js';

const { log, logCore, ExecutorExtraMensagens } = getMessages();

export type { ExecutorEventEmitter };
// Fallback para infoDestaque quando mock de log não implementa
const __infoD = (msg: string) => {
  const l = log as unknown as {
    infoDestaque?: (m: string) => void;
    info: (m: string) => void;
  };
  if (typeof l.infoDestaque === 'function') return l.infoDestaque(msg);
  return l.info(msg);
};

export async function executarInquisicao(fileEntriesComAst: FileEntryWithAst[], tecnicas: Tecnica[], baseDir: string, guardianResultado: GuardianResult, opts?: {
  verbose?: boolean;
  compact?: boolean;
  fast?: boolean;
  /** Opcional: emissor de eventos para file:processed e analysis:complete */
  events?: ExecutorEventEmitter;
}): Promise<ResultadoInquisicao> {
  const ocorrencias: Ocorrencia[] = [];
  const metricasAnalistas: MetricaAnalista[] = [];
  const arquivosValidosSet = new Set(fileEntriesComAst.map(f => f.relPath));
  const emitter = opts?.events;
  const contextoGlobalBase: ContextoExecucao = {
    baseDir,
    arquivos: fileEntriesComAst,
    ambiente: {
      arquivosValidosSet,
      guardian: guardianResultado
    }
  };
  const reporter = createDefaultReporter();
  const inicioExecucao = performance.now();

  // Narrowing helper: detecta se um objeto se parece com NodePath do babel
  function isNodePath(x // Type guard intencional: aceita entrada arbitrária para validação estrutural
  : unknown): x is import('@babel/traverse').NodePath<import('@babel/types').Node> {
    if (typeof x !== 'object' || x === null) return false;
    const maybe = x as Record<string, unknown>;
    if (!('node' in maybe)) return false;
    const node = maybe.node as unknown;
    if (typeof node !== 'object' || node === null) return false;
    return 'type' in (node as Record<string, unknown>);
  }

  // Incremental: carregar estado anterior (tipo importado de @types)
  let estadoIncremental: EstadoIncremental | null = null;
  if (config.ANALISE_INCREMENTAL_ENABLED) {
    const lido = await lerEstado<EstadoIncremental>(config.ANALISE_INCREMENTAL_STATE_PATH).catch(() => null);
    if (lido && lido.versao === config.ANALISE_INCREMENTAL_VERSION) estadoIncremental = lido;
  }
  const novoEstado: EstadoIncremental = {
    versao: config.ANALISE_INCREMENTAL_VERSION,
    arquivos: {},
    estatisticas: {
      totalReaproveitamentos: 0,
      totalArquivosProcessados: 0,
      ultimaDuracaoMs: 0
    }
  };
  function hashConteudo(c: string) {
    try {
      // Usa xxhash64 (seed arbitrária) para performance
      return XXH.h64(c, 0xabcd).toString(16);
    } catch {
      // Fallback para SHA1 se algo der errado
      // SHA1 usado apenas para cache de AST (fingerprinting de conteúdo)
      // Não é usado para segurança/criptografia - contexto: deduplicação de parsing
      return crypto.createHash('sha1').update(c).digest('hex');
    }
  }

  // Técnicas globais
  for (const tecnica of tecnicas) {
    if (tecnica.global) {
      // início medido apenas por analista específico (inicioAnalista)
      const timeoutMs = config.ANALISE_TIMEOUT_POR_ANALISTA_MS;
      try {
        const inicioAnalista = performance.now();

        // Implementa timeout para analistas globais se configurado
        let resultado: Awaited<ReturnType<typeof tecnica.aplicar>> | undefined;
        if (timeoutMs > 0) {
          // Promise.race entre execução do analista global e timeout
          const execPromise = tecnica.aplicar('', '', null, undefined, contextoGlobalBase);
          resultado = await (async () => {
            let timer: NodeJS.Timeout | null = null;
            try {
              const race = Promise.race([execPromise, new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error(ExecutorExtraMensagens.timeoutGlobal.replace('{nome}', tecnica.nome || 'desconhecido').replace('{timeout}', String(timeoutMs)))), timeoutMs);
              })]);
              return await race;
            } finally {
              if (timer) clearTimeout(timer);
            }
          })();
        } else {
          // Execução sem timeout
          resultado = await tecnica.aplicar('', '', null, undefined, contextoGlobalBase);
        }
        if (Array.isArray(resultado)) {
          ocorrencias.push(...resultado);
        }
        const duracaoMs = performance.now() - inicioAnalista;
        if (config.ANALISE_METRICAS_ENABLED) {
          metricasAnalistas.push({
            nome: tecnica.nome || 'desconhecido',
            duracaoMs,
            ocorrencias: Array.isArray(resultado) ? resultado.length : resultado ? 1 : 0,
            global: true
          });
        }
        if (opts?.verbose) {
          log.sucesso(ExecutorExtraMensagens.tecnicaGlobal.replace('{nome}', tecnica.nome || 'desconhecido'));
        }
        if (config.LOG_ESTRUTURADO) {
          log.info(JSON.stringify({
            tipo: 'analista',
            escopo: 'global',
            nome: tecnica.nome,
            duracaoMs,
            ocorrencias: metricasAnalistas.at(-1)?.ocorrencias
          }));
        }
      } catch (error) {
        const err = error as Error;
        const isTempoLimite = err.message.includes('Timeout: analista global');
        const nivelLog = isTempoLimite ? 'aviso' : 'erro';
        const prefixo = isTempoLimite ? '⏰' : '❌';

        // Log apropriado baseado no tipo de erro
        if (nivelLog === 'aviso') {
          log.aviso(`${prefixo} ${err.message}`);
        } else {
          log.erro(`${prefixo} ${ExecutorExtraMensagens.erroTecnicaGlobal.replace('{prefixo}', prefixo).replace('{nome}', tecnica.nome || 'desconhecido').replace('{erro}', err.message)}`);
          // Exibe stack trace em modo verbose ou debug
          if (err.stack) {
            if (opts?.verbose || config.DEV_MODE) {
              log.info(ExecutorExtraMensagens.stackTrace);
              log.info(err.stack);
            }
          }
        }

        // Registra ocorrência de erro/timeout
        ocorrencias.push(ocorrenciaErroAnalista({
          mensagem: isTempoLimite ? `Timeout na técnica global '${tecnica.nome}': ${timeoutMs}ms excedido` : `Falha na técnica global '${tecnica.nome}': ${err.message}`,
          relPath: '[execução global]',
          origem: tecnica.nome,
          stack: !isTempoLimite && err.stack ? err.stack : undefined
        }));
      }
    }
  }

  // Modo Fast: usar WorkerPool para processamento paralelo
  if (opts?.fast && fileEntriesComAst.length > 0) {
    log.info(ExecutorExtraMensagens.modoRapido);
    const workerPool = new WorkerPool({
      enabled: true,
      maxWorkers: config.WORKER_POOL_MAX_WORKERS || undefined,
      batchSize: 10,
      timeoutMs: config.ANALISE_TIMEOUT_POR_ANALISTA_MS
    });
    // Importante: não passar funções (ex.: contexto.report) para worker threads.
    const resultadoWorkers = await workerPool.processFiles(
      fileEntriesComAst,
      tecnicas.filter(t => !t.global),
      // Apenas técnicas não-globais
      contextoGlobalBase,
    );
    ocorrencias.push(...resultadoWorkers.occurrences);
    metricasAnalistas.push(...resultadoWorkers.metrics);
    const duracaoTotal = performance.now() - inicioExecucao;
    log.sucesso(ExecutorExtraMensagens.analiseRapidaConcluida.replace('{arquivos}', String(fileEntriesComAst.length)).replace('{duracao}', formatMs(duracaoTotal)));

    // Salvar estado incremental (se habilitado)
    if (config.ANALISE_INCREMENTAL_ENABLED) {
      try {
        for (const entry of fileEntriesComAst) {
          const hash = hashConteudo(entry.content ?? '');
          novoEstado.arquivos[entry.relPath] = {
            hash,
            ocorrencias: [],
            reaproveitadoCount: 0
          };
        }
        if (novoEstado.estatisticas) {
          novoEstado.estatisticas.totalArquivosProcessados = fileEntriesComAst.length;
          novoEstado.estatisticas.ultimaDuracaoMs = duracaoTotal;
        }
        await salvarEstado(config.ANALISE_INCREMENTAL_STATE_PATH, novoEstado);
      } catch {
        /* Ignora erro ao salvar cache */
      }
    }
    const metricasExecucao: MetricaExecucao = {
      totalArquivos: fileEntriesComAst.length,
      tempoTotal: duracaoTotal,
      ocorrenciasEncontradas: ocorrencias.length,
      analistas: metricasAnalistas,
      workerPool: {
        workersAtivos: resultadoWorkers.totalProcessed,
        duracaoTotalMs: resultadoWorkers.duration
      }
    };

    // Retorna resultado do processamento paralelo
    const resultadoFast: ResultadoInquisicao = {
      totalArquivos: fileEntriesComAst.length,
      arquivosAnalisados: fileEntriesComAst.map(e => e.relPath),
      ocorrencias,
      timestamp: Date.now(),
      duracaoMs: duracaoTotal,
      metricas: metricasExecucao
    };
    if (emitter) {
      emitter.emit('analysis:complete', resultadoFast);
    }
    return resultadoFast;
  }

  // Técnicas por arquivo (modo sequencial padrão)
  const contextoGlobal: ContextoExecucao = {
    ...contextoGlobalBase,
    report: (event) => {
      try {
        ocorrencias.push(reporter(event));
      } catch (e) {
        // Reporter nunca deve quebrar a análise; se falhar, emite ocorrência genérica.
        ocorrencias.push(ocorrenciaErroAnalista({
          mensagem: `Falha no reporter: ${(e as Error).message}`,
          relPath: event?.relPath || '[report]',
          origem: 'reporter'
        }));
      }
    }
  };

  // Otimização: Identifica analistas que usam visitor compartilhado
  const analistasComVisitor = (tecnicas as any[]).filter(t => typeof t.visitor === 'object' && t.visitor !== null);
  const visitorCombinado: Record<string, any> = {};
  if (analistasComVisitor.length > 0) {
    for (const a of analistasComVisitor) {
      for (const [key, val] of Object.entries(a.visitor)) {
        if (!visitorCombinado[key]) {
          visitorCombinado[key] = val;
        } else {
          // Wrap both visitors to execute in sequence
          const prev = visitorCombinado[key];
          visitorCombinado[key] = (path: any, state: any) => {
            // Se prev for função ou objeto com enter/exit
            if (typeof prev === 'function') {
              prev(path, state);
            } else if (prev.enter) {
              prev.enter(path, state);
            }
            if (typeof val === 'function') {
              val(path, state);
            } else if ((val as any).enter) {
              (val as any).enter(path, state);
            }
          };
        }
      }
    }
  }

  let arquivoAtual = 0;
  const totalArquivos = fileEntriesComAst.length;
  // Limiar para logs detalhados por arquivo
  const LIMIAR_DETALHE_TOTAL = 100; // até aqui permite detalhar por arquivo
  const LIMIAR_DETALHE_LIMITADO_MAX = 250; // até aqui permite "Arquivo X/Y" com throttle
  // Define passo de logging quando em modo verbose para evitar spam massivo

  function passoDeLog(total: number): number {
    // Assumimos faixas: até 100 => cada arquivo; 101-250 => a cada 10; 251-500 => a cada 25; >500 => a cada 100
    if (total <= 100) return 1;
    if (total <= 250) return 10;
    if (total <= 500) return 25;
    return 100;
  }
  const frames = ['->', '=>', '>>', '=>'] as const;
  const stepVerbose = passoDeLog(totalArquivos);
  const detalharPorArquivo = (opts?.verbose ?? false) && totalArquivos <= LIMIAR_DETALHE_TOTAL;
  const permitirArquivoXY = (opts?.verbose ?? false) && totalArquivos <= LIMIAR_DETALHE_LIMITADO_MAX;

  // Inicializa sistema de logs inteligente
  logAnalistas.iniciarBatch(totalArquivos);
  for (const entry of fileEntriesComAst) {
    arquivoAtual++;
    if (opts?.compact) {
      if (arquivoAtual === totalArquivos) {
        log.info(ExecutorExtraMensagens.arquivosAnalisados.replace('{total}', String(totalArquivos)));
      }
    } else if (opts?.verbose) {
      // Em verbose: detalha por arquivo somente até o limiar; entre 101-250 mostra "Arquivo X/Y" com throttle; acima disso, só resumo de progresso.
      if (permitirArquivoXY) {
        if (arquivoAtual === 1 || arquivoAtual % stepVerbose === 0 || arquivoAtual === totalArquivos) {
          const seta = frames[arquivoAtual % frames.length];
          log.info(ExecutorExtraMensagens.arquivoAtual.replace('{seta}', seta).replace('{atual}', String(arquivoAtual)).replace('{total}', String(totalArquivos)).replace('{arquivo}', entry.relPath));
        }
      } else {
        if (arquivoAtual === 1 || arquivoAtual % stepVerbose === 0 || arquivoAtual === totalArquivos) {
          log.info(ExecutorExtraMensagens.progresso.replace('{atual}', String(arquivoAtual)).replace('{total}', String(totalArquivos)));
        }
      }
    } else if (arquivoAtual % 50 === 0 || arquivoAtual === totalArquivos) {
      // Modo padrão: log apenas a cada 50 arquivos para reduzir ruído
      if (arquivoAtual === totalArquivos) {
        __infoD(ExecutorExtraMensagens.progresso.replace('{atual}', String(arquivoAtual)).replace('{total}', String(totalArquivos)));
      }
    }
    // Verifica incremento
    const conteudo = entry.content ?? '';
    const h = hashConteudo(conteudo);
    const cacheAnterior = estadoIncremental?.arquivos[entry.relPath];
    let reaproveitou = false;
    if (config.ANALISE_INCREMENTAL_ENABLED && cacheAnterior && cacheAnterior.hash === h) {
      // Reaproveita ocorrências anteriores do arquivo
      ocorrencias.push(...cacheAnterior.ocorrencias);
      novoEstado.arquivos[entry.relPath] = cacheAnterior; // mantém
      novoEstado.arquivos[entry.relPath].reaproveitadoCount = (cacheAnterior.reaproveitadoCount || 0) + 1;
      if (novoEstado.estatisticas) {
        novoEstado.estatisticas.totalReaproveitamentos = (novoEstado.estatisticas.totalReaproveitamentos || 0) + 1;
      }
      reaproveitou = true;
      if (detalharPorArquivo) logCore.reaproveitadoIncremental(entry.relPath);
      if (config.LOG_ESTRUTURADO) {
          log.info(JSON.stringify({
          tipo: 'incremental-reuse',
          arquivo: entry.relPath,
          ocorrencias: cacheAnterior.ocorrencias.length
        }));
      }
    }
    if (reaproveitou) continue; // pula analistas

    // Otimização: Travessia única para analistas com visitor
    const resultadosOtimizados = new Map<string, any[]>();
    if (Object.keys(visitorCombinado).length > 0 && entry.ast) {
      try {
        const astParam = isNodePath(entry.ast) ? (entry.ast as any).node : entry.ast;
        // Injetar contexto para os visitors se necessário (através de state)
        traverse(astParam, visitorCombinado, undefined, {
          relPath: entry.relPath,
          contexto: contextoGlobal,
          resultados: resultadosOtimizados // Mapa de analista -> achados
        });
      } catch (err) {
        log.aviso(`⏰ Falha na travessia otimizada para ${entry.relPath}: ${(err as Error).message}`);
      }
    }

    for (const tecnica of tecnicas) {
      if (tecnica.global) continue;
      if (tecnica.test && !tecnica.test(entry.relPath)) continue;
      // início medido apenas por analista específico (inicioAnalista)
      const timeoutMs = config.ANALISE_TIMEOUT_POR_ANALISTA_MS;
      try {
        const inicioAnalista = performance.now();

        // Log adaptativo: início da análise
        const tamanhoArquivo = entry.content ? Math.round(entry.content.length / 1024) : 0;
        logAnalistas.iniciandoAnalista(tecnica.nome || 'analista-desconhecido', entry.relPath, tamanhoArquivo);

        // Implementa timeout por analista se configurado
        let resultado: Awaited<ReturnType<typeof tecnica.aplicar>> | undefined;
        if (timeoutMs > 0) {
          // Promise.race entre execução do analista e timeout
          const astParam = (tecnica as any).visitor
            ? { node: isNodePath(entry.ast) ? (entry.ast as any).node : entry.ast, preColetado: resultadosOtimizados.get(tecnica.nome || '') }
            : (isNodePath(entry.ast) ? entry.ast as any : null);
          const execPromise = tecnica.aplicar(entry.content ?? '', entry.relPath, astParam, entry.fullCaminho, contextoGlobal);
          resultado = await (async () => {
            let timer: any = null;
            try {
              const race = Promise.race([execPromise, new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error(ExecutorExtraMensagens.timeoutAnalista.replace('{nome}', tecnica.nome || 'desconhecido').replace('{timeout}', String(timeoutMs)).replace('{arquivo}', entry.relPath))), timeoutMs);
              })]);
              return await race;
            } finally {
              if (timer) clearTimeout(timer);
            }
          })();
        } else {
          // Execução sem timeout
          const astParam2 = (tecnica as any).visitor
            ? { node: isNodePath(entry.ast) ? (entry.ast as any).node : entry.ast, preColetado: resultadosOtimizados.get(tecnica.nome || '') }
            : (isNodePath(entry.ast) ? (entry.ast as any) : null);
          resultado = await tecnica.aplicar(entry.content ?? '', entry.relPath, astParam2, entry.fullCaminho, contextoGlobal);
        }
        if (Array.isArray(resultado)) {
          ocorrencias.push(...resultado);
        }
        const duracaoMs = performance.now() - inicioAnalista;
        if (config.ANALISE_METRICAS_ENABLED) {
          metricasAnalistas.push({
            nome: tecnica.nome || 'desconhecido',
            duracaoMs,
            ocorrencias: Array.isArray(resultado) ? resultado.length : resultado ? 1 : 0,
            global: false
          });
        }

        // Log adaptativo: conclusão da análise
        const ocorrenciasContagem = Array.isArray(resultado) ? resultado.length : resultado ? 1 : 0;
        logAnalistas.concluido(tecnica.nome || 'analista-desconhecido', entry.relPath, ocorrenciasContagem, duracaoMs);
        if (detalharPorArquivo) {
          log.info(`📄 '${tecnica.nome}' analisou ${entry.relPath} em ${formatMs(duracaoMs)}`);
        }
        if (config.LOG_ESTRUTURADO) {
          log.info(JSON.stringify({
            tipo: 'analista',
            arquivo: entry.relPath,
            nome: tecnica.nome,
            duracaoMs,
            ocorrencias: metricasAnalistas.at(-1)?.ocorrencias
          }));
        }
      } catch (error) {
        const err = error as Error;
        const isTempoLimite = err.message.includes('Timeout: analista');
        const nivelLog = isTempoLimite ? 'aviso' : 'erro';
        const prefixo = isTempoLimite ? '⏰' : '❌';

        // Log adaptativo para erros e timeouts
        if (isTempoLimite) {
          const duracaoEstimada = config.ANALISE_TIMEOUT_POR_ANALISTA_MS || 30000;
          logAnalistas.timeout(tecnica.nome || 'analista-desconhecido', duracaoEstimada);
        } else {
          logAnalistas.erro(tecnica.nome || 'analista-desconhecido', err.message);
        }

        // Log apropriado baseado no tipo de erro
        if (nivelLog === 'aviso') {
          log.aviso(`${prefixo} ${err.message}`);
        } else {
          log.erro(`${prefixo} Erro em '${tecnica.nome}' para ${entry.relPath}: ${err.message}`);
          // Exibe stack trace em modo verbose ou debug
          if (err.stack) {
            if (opts?.verbose || config.DEV_MODE) {
              log.info(ExecutorExtraMensagens.stackTrace);
              log.info(err.stack);
            }
          }
        }

        // Registra ocorrência de erro/timeout com stack trace
        ocorrencias.push(ocorrenciaErroAnalista({
          mensagem: isTempoLimite ? `Timeout na técnica '${tecnica.nome}' para ${entry.relPath}: ${timeoutMs}ms excedido` : `Falha na técnica '${tecnica.nome}' para ${entry.relPath}: ${err.message}`,
          relPath: entry.relPath,
          origem: tecnica.nome,
          stack: !isTempoLimite && err.stack ? err.stack : undefined
        }));
      }
    }
    // Salva estado incremental do arquivo processado
    if (config.ANALISE_INCREMENTAL_ENABLED) {
      const ocorrArq = ocorrencias.filter(o => o.relPath === entry.relPath);
      // Extrai métricas por analista específicas do arquivo
      const analistasArquivo: Record<string, {
        ocorrencias: number;
        duracaoMs: number;
      }> = {};
      for (const m of metricasAnalistas.filter(m => !m.global)) {
        analistasArquivo[m.nome] = {
          ocorrencias: m.ocorrencias,
          duracaoMs: m.duracaoMs
        };
      }
      novoEstado.arquivos[entry.relPath] = {
        hash: h,
        ocorrencias: ocorrArq,
        analistas: analistasArquivo,
        ultimaExecucaoMs: Date.now(),
        reaproveitadoCount: 0
      };
      if (novoEstado.estatisticas) {
        novoEstado.estatisticas.totalArquivosProcessados = (novoEstado.estatisticas.totalArquivosProcessados || 0) + 1;
      }
    }

    // NOVO: Atualiza progresso por arquivo (não por analista)
    logAnalistas.arquivoProcessado();
    if (emitter) {
      const ocorrArquivo = ocorrencias.filter(o => o.relPath === entry.relPath);
      emitter.emit('file:processed', { relPath: entry.relPath, ocorrencias: ocorrArquivo.length });
    }
  }
  const fimExecucao = performance.now();
  const duracaoMs = Math.round(fimExecucao - inicioExecucao);

  // Finaliza sistema de logs inteligente
  logAnalistas.finalizarBatch(ocorrencias.length, duracaoMs);

  // Agregação de métricas
  let metricasExecucao: MetricaExecucao | null = null;
  if (config.ANALISE_METRICAS_ENABLED) {
    const metricasGlobais: MetricasGlobais = (globalThis as unknown as Record<string, unknown>).__SENSEI_METRICAS__ as MetricasGlobais || {
      parsingTimeMs: 0,
      cacheHits: 0,
      cacheMiss: 0
    };
    metricasExecucao = {
      totalArquivos: fileEntriesComAst.length,
      tempoParsingMs: Math.round(metricasGlobais.parsingTimeMs),
      tempoAnaliseMs: duracaoMs,
      cacheAstHits: metricasGlobais.cacheHits,
      cacheAstMiss: metricasGlobais.cacheMiss,
      analistas: metricasAnalistas
    };
    if (config.LOG_ESTRUTURADO) {
      log.info(JSON.stringify({
        tipo: 'metricas',
        ...metricasExecucao
      }));
    }
    // Persistir histórico
    try {
      const historicoCaminho = config.ANALISE_METRICAS_HISTORICO_PATH as string | undefined;
      if (historicoCaminho) {
        type RegistroHistorico = MetricaExecucao & {
          timestamp: number;
        };
        const anterior = await lerEstado<unknown>(historicoCaminho).catch(() => [] as RegistroHistorico[]);
        const lista = Array.isArray(anterior) ? anterior as RegistroHistorico[] : [];
        lista.push({
          ...metricasExecucao,
          timestamp: Date.now()
        });
        const max = config.ANALISE_METRICAS_HISTORICO_MAX || 200;
        const recortado = lista.slice(-max);
        await salvarEstado(historicoCaminho, recortado);
      }
    } catch (e) {
      // Sempre registra em DEV e também em execução normal para visibilidade dos testes
      log.erro(`Falha ao persistir histórico de métricas: ${(e as Error).message}`);
    }
  }

  // Persistir incremental
  if (config.ANALISE_INCREMENTAL_ENABLED) {
    if (novoEstado.estatisticas) {
      novoEstado.estatisticas.ultimaDuracaoMs = duracaoMs;
    }
    await salvarEstado(config.ANALISE_INCREMENTAL_STATE_PATH, novoEstado);
    if (config.LOG_ESTRUTURADO) {
      log.info(JSON.stringify({
        tipo: 'incremental-salvo',
        arquivos: Object.keys(novoEstado.arquivos).length,
        totalReaproveitamentos: novoEstado.estatisticas?.totalReaproveitamentos,
        processados: novoEstado.estatisticas?.totalArquivosProcessados
      }));
    }
  }
  const resultado: ResultadoInquisicao = {
    totalArquivos: fileEntriesComAst.length,
    arquivosAnalisados: fileEntriesComAst.map(e => e.relPath),
    ocorrencias,
    timestamp: Date.now(),
    duracaoMs,
    metricas: metricasExecucao || undefined
  };
  if (emitter) {
    emitter.emit('analysis:complete', resultado);
  }
  return resultado;
}

// Hook simples para expor última métrica de execução (consumido por comando perf baseline)

export function registrarUltimasMetricas(metricas: MetricaExecucao | undefined): void {
  try {
    (globalThis as unknown as {
      __ULTIMAS_METRICAS_SENSEI__?: MetricaExecucao | null;
    }).__ULTIMAS_METRICAS_SENSEI__ = metricas || null;
  } catch {
    /* ignore */
  }
}