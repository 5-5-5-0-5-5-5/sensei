// SPDX-License-Identifier: MIT
import { promises as fs } from 'node:fs';

import { config } from '@core/config/config.js';
import { isMetaPath } from '@core/config/paths.js';
import { getMessages } from '@core/messages/index.js';
import { InquisidorMensagens } from '@core/messages/pt/core/inquisidor-messages.js';
import { lerEstado } from '@shared/persistence/persistencia.js';
import * as path from 'path';

import type { CacheValor, EstadoIncArquivo, FileEntry, FileEntryWithAst, InquisicaoOptions, MetricasGlobais, OcorrenciaParseErro, ResultadoInquisicaoCompleto, SimbolosLog, Tecnica } from '@';
import { ocorrenciaParseErro } from '@';

import { executarInquisicao as executarExecucao, registrarUltimasMetricas } from './executor.js';
import { scanRepository } from './scanner.js';

const { log, InquisidorExtraMensagens } = getMessages();
// Fallback de símbolos para cenários de teste onde o mock de log não inclui `simbolos`.
const SIMBOLOS_ALTERNATIVA: SimbolosLog = {
  info: 'ℹ️',
  sucesso: '✅',
  erro: '❌',
  aviso: '⚠️',
  debug: '🐞',
  fase: '🔶',
  passo: '▫️',
  scan: '🔍',
  guardian: '🛡️',
  pasta: '📂'
};
const S: SimbolosLog = typeof (log as unknown as {
  simbolos?: SimbolosLog;
}).simbolos === 'object' ? (log as unknown as {
  simbolos: SimbolosLog;
}).simbolos : SIMBOLOS_ALTERNATIVA;
// Fallback seguro para infoDestaque quando mocks de teste não expõem o método
const __infoDestaque = (mensagem: string) => {
  const l = log as unknown as {
    infoDestaque?: (m: string) => void;
    info: (m: string) => void;
  };
  if (typeof l.infoDestaque === 'function') return l.infoDestaque(mensagem);
  return l.info(mensagem);
};

// Extensões consideradas para tentativa de AST. Observações:
// - .d.ts é propositalmente excluída pelo parser (retorna null) e aqui não entra.
// - .map (source maps) não deve ser parseado – marcamos como NÃO pertencente ao conjunto.
const EXTENSOES_COM_AST = new Set(
  Array.isArray(config.SCANNER_EXTENSOES_COM_AST)
    ? config.SCANNER_EXTENSOES_COM_AST
    : ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs'],
);
export async function prepararComAst(
  entries: FileEntry[],
  baseDir: string,
): Promise<FileEntryWithAst[]> {
  // Cache em memória (process-level). Chave: relPath
  // Guarda: { mtimeMs, size, ast } - tipo importado de @types
  const globalStore = globalThis as unknown as Record<string, unknown>;
  const cache: Map<string, CacheValor> = globalStore.__SENSEI_AST_CACHE__ as Map<string, CacheValor> || new Map();
  if (!globalStore.__SENSEI_AST_CACHE__) globalStore.__SENSEI_AST_CACHE__ = cache;
  const metricas: MetricasGlobais = globalStore.__SENSEI_METRICAS__ as MetricasGlobais || {
    parsingTimeMs: 0,
    cacheHits: 0,
    cacheMiss: 0
  };
  // Reset métricas de parsing a cada preparação completa
  metricas.parsingTimeMs = 0;
  metricas.cacheHits = 0;
  metricas.cacheMiss = 0;
  globalStore.__SENSEI_METRICAS__ = metricas;
  return Promise.all(entries.map(async (entry): Promise<FileEntryWithAst> => {
    let ast: import('@babel/traverse').NodePath<import('@babel/types').Node> | undefined = undefined;
    const ext = path.extname(entry.relPath);
    const absCaminho = typeof entry.fullCaminho === 'string' ? entry.fullCaminho : path.resolve(baseDir, entry.relPath);
    let stats: import('node:fs').Stats | undefined;
    try {
      stats = await fs.stat(absCaminho);
    } catch {
      stats = undefined;
    }

    // Detecção de extensão com suporte a sufixos compostos (ex.: .d.ts, .js.map)
    const nomeLower = entry.relPath.toLowerCase();
    const extEfetiva = nomeLower.endsWith('.d.ts') ? '.d.ts' : nomeLower.endsWith('.map') ? '.map' : ext;
    if (entry.content && EXTENSOES_COM_AST.has(extEfetiva)) {
      const chave = entry.relPath;
      if (config.ANALISE_AST_CACHE_ENABLED && stats) {
        const anterior = cache.get(chave);
        if (anterior && anterior.mtimeMs === stats.mtimeMs && anterior.size === stats.size) {
          // Se o cache tinha AST válida, reutiliza; caso contrário, mantém undefined para obrigar tentative parsing novamente.
          ast = anterior.ast;
          metricas.cacheHits++;
        }
      }
      try {
        if (!ast) {
          const inicioParse = performance.now();
          // Usa a API decifrarSintaxe esperada pelos testes (com spies)
          const parsed = await import('@core/parsing/parser.js').then(m => m.decifrarSintaxe(entry.content || '', extEfetiva, {
            relPath: entry.relPath
          }));
          if (parsed && typeof parsed === 'object') {
            // Mantém ast undefined quando parsed é objeto vazio (forma inválida)
            if (Object.keys(parsed as unknown as Record<string, unknown>).length > 0) {
              // Sentinel convertida para o tipo NodePath via unknown cast – suficiente para diferenciar truthy
              ast = {} as unknown as import('@babel/traverse').NodePath<import('@babel/types').Node>;
            }
          } else if (parsed == null) {
            // Politica: para arquivos em node_modules, não tratar falha de parsing como erro;
            // em vez disso, seguimos com um sentinel de AST para permitir analistas que não dependem de AST completa.
            const inNodeModules = /(^|\/)node_modules(\/|\\)/.test(entry.relPath);
            if (inNodeModules) {
              ast = {} as unknown as import('@babel/traverse').NodePath<import('@babel/types').Node>;
            } else {
              // Tentar extrair linha/coluna do parser executando uma parse rápida
              // que lança uma exceção com informação de localização (quando disponível).
              const globalStore2 = globalStore as unknown as Record<string, unknown>;
              const lista = globalStore2.__SENSEI_PARSE_ERROS__ as OcorrenciaParseErro[] | undefined || [];
              try {
                // Importar babel parser diretamente e forçar parse para capturar erro com loc
                const babel = await import('@babel/parser');
                try {
                  // tentativa intencional para capturar a exceção com posição
                  const parseOpts = {
                    sourceType: 'unambiguous',
                    plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties']
                  };
                  babel.parse(entry.content || '', parseOpts as unknown as import('@babel/parser').ParserOptions);
                  // se por algum motivo não lançar, registra erro genérico
                  lista.push(ocorrenciaParseErro({
                    mensagem: InquisidorMensagens.parseAstNaoGerada,
                    relPath: entry.relPath,
                    origem: 'parser'
                  }));
                } catch (e) {
                  type ParserErrorLike = {
                    loc?: {
                      line?: number;
                      column?: number;
                    };
                    message?: string;
                  };
                  const err = e as unknown as ParserErrorLike;
                  const linha = typeof err.loc?.line === 'number' ? err.loc.line : undefined;
                  const coluna = typeof err.loc?.column === 'number' ? err.loc.column : undefined;
                  const detalhe = err && err.message ? String(err.message) : undefined;
                  lista.push(ocorrenciaParseErro({
                    mensagem: InquisidorMensagens.parseErro(detalhe || InquisidorMensagens.parseAstNaoGerada),
                    relPath: entry.relPath,
                    origem: 'parser',
                    linha,
                    coluna,
                    detalhe
                  }));
                }
              } catch {
                // Se não conseguimos importar/usar o babel parser, fallback para mensagem genérica
                lista.push(ocorrenciaParseErro({
                  mensagem: InquisidorMensagens.parseAstNaoGerada,
                  relPath: entry.relPath,
                  origem: 'parser'
                }));
              }
              globalStore2.__SENSEI_PARSE_ERROS__ = lista;
            }
          }
          metricas.parsingTimeMs += performance.now() - inicioParse;
          metricas.cacheMiss++;
          if (config.ANALISE_AST_CACHE_ENABLED && stats) {
            cache.set(entry.relPath, {
              mtimeMs: stats.mtimeMs,
              size: stats.size,
              ast
            });
          }
        }
      } catch (e) {
        const err = e as Error;
        log.erro(InquisidorMensagens.falhaGerarAst(entry.relPath, err.message));
        // Registra ocorrência de parse erro
        const lista = globalStore.__SENSEI_PARSE_ERROS__ as OcorrenciaParseErro[] | undefined || [];
        lista.push(ocorrenciaParseErro({
          mensagem: InquisidorMensagens.parseErro(err.message),
          relPath: entry.relPath,
          origem: 'parser'
        }));
        globalStore.__SENSEI_PARSE_ERROS__ = lista;
      }
    }
    return {
      ...entry,
      ast,
      content: entry.content ?? null,
      fullCaminho: typeof entry.fullCaminho === 'string' ? entry.fullCaminho : path.resolve(baseDir, entry.relPath)
    } as FileEntryWithAst;
  }));
}
export async function iniciarInquisicao(
  baseDir: string = process.cwd(),
  options: InquisicaoOptions = {},
  tecnicas?: Tecnica[],
): Promise<ResultadoInquisicaoCompleto> {
  const {
    includeContent = true,
    incluirMetadados = true,
    skipExec = false
  } = options;
  log.info(InquisidorExtraMensagens.iniciandoInquisicao.replace('{icone}', S.scan).replace('{diretorio}', baseDir));
  const fileMap = await scanRepository(baseDir, {
    includeContent,
    onProgress: msg => {
      // Só exibe diretórios e erros, e em formato legível por máquina/pessoa
      try {
        const progressData = JSON.parse(msg);
        if (progressData.tipo === 'diretorio') {
          // Atualiza contador e amostra em memória, sem emitir logs incrementais.
          // A política semântica correta: não mostrar progresso parcial durante a varredura;
          // em vez disso, exibimos apenas um resumo final após a conclusão da varredura.
          const g = globalThis as unknown as {
            __SENSEI_DIR_COUNT__?: number;
            __SENSEI_DIR_SAMPLES__?: string[];
          };
          g.__SENSEI_DIR_COUNT__ = (g.__SENSEI_DIR_COUNT__ || 0) + 1;
          // Armazena primeiros N diretórios como amostra para diagnóstico posterior
          const SAMPLE_MAX = 5;
          if (!g.__SENSEI_DIR_SAMPLES__) g.__SENSEI_DIR_SAMPLES__ = [];
          if (g.__SENSEI_DIR_SAMPLES__.length < SAMPLE_MAX) {
            g.__SENSEI_DIR_SAMPLES__.push(progressData.caminho);
          }
          // contador atualizado em g.__SENSEI_DIR_COUNT__ (não usado diretamente aqui)
          // Em modo verbose original poderíamos mostrar mais detalhes, mas por padrão
          // evitamos ruído progressivo. Erros continuam sendo reportados abaixo.
        } else if (progressData.tipo === 'erro') {
          log.erro(`Erro ao ${progressData.acao} ${progressData.caminho}: ${progressData.mensagem}`);
        }
      } catch {
        // fallback para logs antigos
        if (msg && msg.includes('⚠️')) log.aviso(msg);
      }
    }
  });
  let fileEntries: FileEntryWithAst[];
  let entriesBase = Object.values(fileMap);
  // Filtra arquivos meta com helper central: tudo fora de src/ é meta por padrão
  const metaSet = new Set(entriesBase.filter(e => isMetaPath(e.relPath)).map(e => e.relPath));
  // Priorização (usa estado incremental anterior somente para ordenar)
  if (config.ANALISE_PRIORIZACAO_ENABLED && config.ANALISE_INCREMENTAL_STATE_PATH) {
    try {
      type EstadoIncremental = {
        arquivos: Record<string, EstadoIncArquivo>;
      };
      const inc = await lerEstado<EstadoIncremental>(config.ANALISE_INCREMENTAL_STATE_PATH).catch(() => null);
      if (inc && inc.arquivos) {
        const pesos = (config.ANALISE_PRIORIZACAO_PESOS || {
          duracaoMs: 1,
          ocorrencias: 2,
          penalidadeReuso: 0.5
        }) as {
          duracaoMs: number;
          ocorrencias: number;
          penalidadeReuso: number;
        };
        const scored = entriesBase.map(e => {
          const hist = inc.arquivos[e.relPath];
          if (!hist) return {
            ...e,
            __score: 0
          } as FileEntry & {
            __score: number;
          };
          let dur = 0;
          let occ = 0;
          if (hist.analistas) {
            for (const a of Object.values(hist.analistas)) {
              dur += a.duracaoMs;
              occ += a.ocorrencias;
            }
          } else {
            occ = hist.ocorrencias?.length || 0;
          }
          const reuso = hist.reaproveitadoCount || 0;
          const score = dur * pesos.duracaoMs + occ * pesos.ocorrencias - reuso * pesos.penalidadeReuso;
          return {
            ...e,
            __score: score
          } as FileEntry & {
            __score: number;
          };
        });
        scored.sort((a, b) => (b as unknown as {
          __score: number;
        }).__score - (a as unknown as {
          __score: number;
        }).__score);
        // Reorganiza empurrando meta para o final
        const prioritarios: (FileEntry & {
          __score: number;
        })[] = [];
        const metas: (FileEntry & {
          __score: number;
        })[] = [];
        for (const s of scored) (metaSet.has(s.relPath) ? metas : prioritarios).push(s);
        const reconstituido = [...prioritarios, ...metas];
        entriesBase = reconstituido as unknown as typeof entriesBase;
        const somentePrioritarios = reconstituido.filter(e => !metaSet.has(e.relPath));
        if (config.LOG_ESTRUTURADO) {
          log.info(JSON.stringify({
            tipo: 'priorizacao',
            estrategia: 'historico-incremental',
            top: somentePrioritarios.slice(0, 10).map(e => ({
              arq: e.relPath,
              score: (e as unknown as {
                __score: number;
              }).__score
            })),
            metaEmpurrados: metas.length
          }));
        } else {
          const exibidos = somentePrioritarios.slice(0, 5).map(e => e.relPath).join(', ') || '—';
          log.info(InquisidorExtraMensagens.priorizacaoAplicada.replace('{exibidos}', exibidos));
          if (metas.length) {
            log.info(InquisidorExtraMensagens.arquivosMetaMovidos.replace('{icone}', S.info).replace('{total}', String(metas.length)));
          }
        }
      }
    } catch (e) {
      if (config.DEV_MODE) log.erro(`Falha priorização: ${(e as Error).message}`);
    }
  }
  if (incluirMetadados) {
    fileEntries = await prepararComAst(entriesBase, baseDir);
  } else {
    fileEntries = entriesBase.map(entry => ({
      ...entry,
      ast: undefined,
      fullCaminho: typeof entry.fullCaminho === 'string' ? entry.fullCaminho : path.resolve(baseDir, entry.relPath)
    }));
  }

  // Exibe um resumo único da varredura preliminar, imediatamente antes da análise principal.
  try {
    const g = globalThis as unknown as {
      __SENSEI_DIR_COUNT__?: number;
      __SENSEI_DIR_SAMPLES__?: string[];
    };
    const totalDirs = g.__SENSEI_DIR_COUNT__ || 0;
    // Não exibir caminhos nem moldura — apenas resumo simples em texto.
    const amostra = Array.isArray(g.__SENSEI_DIR_SAMPLES__) ? g.__SENSEI_DIR_SAMPLES__ : [];
    if (config.LOG_ESTRUTURADO) {
      log.info(JSON.stringify({
        tipo: 'varredura_preliminar',
        totalDiretorios: totalDirs,
        amostraDiretorios: amostra
      }));
    } else {
      // Em modo simples, não emite resumo redundante
      // A mensagem "✅ Varredura concluída: X arquivos em Y diretórios" já cobre isso
    }
  } catch {
    /* ignore */
  }

  // Agora fileEntries é FileEntryWithAst[]
  let totalArquivos = fileEntries.length;
  let ocorrencias: Array<OcorrenciaParseErro | import('@').Ocorrencia> = [];
  if (!skipExec) {
    // Inversão de Controle: tecnicas devem ser fornecidas pelo chamador sempre que skipExec=false.
    // Para compatibilidade retroativa, se não vierem definidas carregamos dinamicamente o registro.
    let tecnicasEfetivas = tecnicas;
    if (!tecnicasEfetivas) {
      const { registroAnalistas } = await import(
        '@analistas/registry/registry.js'
      );
      tecnicasEfetivas = registroAnalistas as Tecnica[];
    }
    const execRes = await executarExecucao(
      fileEntries,
      tecnicasEfetivas,
      baseDir,
      undefined,
    );
    totalArquivos = execRes.totalArquivos;
    ocorrencias = execRes.ocorrencias;
  }

  // Anexa ocorrências de parse se existirem
  const parseErros: OcorrenciaParseErro[] = (globalThis as unknown as Record<string, unknown>).__SENSEI_PARSE_ERROS__ as OcorrenciaParseErro[] || [];
  if (parseErros.length) {
    // Armazena contagem original para métricas (usado em saída JSON)
    (globalThis as unknown as {
      __SENSEI_PARSE_ERROS_ORIGINAIS__?: number;
    }).__SENSEI_PARSE_ERROS_ORIGINAIS__ = parseErros.length;
    if (config.PARSE_ERRO_AGRUPAR) {
      const porArquivo: Record<string, OcorrenciaParseErro[]> = {};
      for (const pe of parseErros) {
        const k = pe.relPath || '__desconhecido__';
        (porArquivo[k] = porArquivo[k] || []).push(pe);
      }
      for (const [arq, lista] of Object.entries(porArquivo)) {
        if (lista.length <= (config.PARSE_ERRO_MAX_POR_ARQUIVO || 1)) {
          ocorrencias.push(...lista);
        } else {
          // Consolida em uma única ocorrência representativa
          ocorrencias.push(ocorrenciaParseErro({
            mensagem: InquisidorMensagens.parseErrosAgregados(lista.length),
            relPath: arq || '',
            origem: 'parser'
          }));
        }
      }
    } else {
      ocorrencias.push(...parseErros);
    }
  }
  if (!skipExec) {
    log.sucesso(InquisidorExtraMensagens.inquisicaoConcluida.replace('{total}', String(ocorrencias.length)));
  } else if (!config.COMPACT_MODE) {
    __infoDestaque(`Varredura concluída: total de arquivos: ${fileEntries.length}`);
  }
  return {
    totalArquivos,
    ocorrencias,
    arquivosAnalisados: fileEntries.map(f => f.relPath),
    timestamp: Date.now(),
    duracaoMs: 0,
    fileEntries,
    guardian: undefined
  };
}
export { executarExecucao as executarInquisicao, registrarUltimasMetricas };