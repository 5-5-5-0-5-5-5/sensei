// SPDX-License-Identifier: MIT
// @sensei-disable tipo-literal-inline-complexo
// Justification: inline types for logging system
/**
 * Unified log helper system
 * Consolidation of log-helpers.ts and log-helpers-inteligente.ts
 * Removes duplication and centralizes logic via log-engine
 */

import { config } from '@core/config/config.js';
import { ICONES_ARQUIVO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_STATUS } from '@core/messages/shared/icons.js';

import { logEngine } from './log-engine.js';
import { LogMensagens } from './log-messages.js';

/**
 * Logging system for analysts with unified spam control
 */
export const logAnalistas = {
  ultimoProgressoGlobal: 0,
  contadorArquivos: 0,
  totalArquivos: 0,
  ultimoEmitMs: 0,
  /** Initializes analysis batch */
  iniciarBatch(totalArquivos: number): void {
    this.totalArquivos = totalArquivos;
    this.contadorArquivos = 0;
    this.ultimoProgressoGlobal = 0;
    this.ultimoEmitMs = 0;

    // Uses logEngine for consistent formatting only in complex/verbose mode
    if (logEngine.contexto === 'complexo' || config.VERBOSE) {
      logEngine.log('info', LogMensagens.analistas.execucao.inicio_detalhado, {
        totalArquivos: totalArquivos.toString()
      });
    }
    // In simple mode, do not emit redundant message (progress already shows it)
  },
  /** Analyst start log (now only registers) */
  iniciandoAnalista(nomeAnalista: string, arquivo: string, tamanho: number): void {
    // 🔕 ANTI-SPAM: Only logs individual analysts in specific contexts
    const deveLogarIndividual = logEngine.contexto === 'complexo' || config.DEV_MODE || process.env.VERBOSE === 'true';
    if (deveLogarIndividual) {
      logEngine.log('debug', LogMensagens.analistas.execucao.inicio_detalhado, {
        analista: nomeAnalista,
        arquivo,
        tamanho: tamanho.toString()
      });
    }
  },
  /** Increments counter when file is processed */
  arquivoProcessado(): void {
    this.contadorArquivos++;
    if (logEngine.contexto !== 'complexo' && !config.DEV_MODE) {
      this.logProgressoGrupado();
    }
  },
  /** Analyst completion log */
  concluido(nomeAnalista: string, arquivo: string, ocorrencias: number, duracao: number): void {
    const deveLogarIndividual = logEngine.contexto === 'complexo' || config.DEV_MODE || process.env.VERBOSE === 'true';
    if (deveLogarIndividual) {
      logEngine.log('info', LogMensagens.analistas.execucao.sucesso_detalhado, {
        analista: nomeAnalista,
        ocorrencias: ocorrencias.toString(),
        tempo: duracao.toFixed(2)
      });
    }
  },
  /** Smart and grouped progress log */
  logProgressoGrupado(): void {
    const porcentagem = Math.round(this.contadorArquivos / this.totalArquivos * 100);
    const agora = Date.now();

    // Adaptive density: 5% for small projects, 10% for large ones
    const passo = this.totalArquivos < 200 ? 5 : 10;
    // Frequency limit: at most 2 updates per second
    const minIntervalMs = 500;

    // Updates progress at adaptive intervals with anti-spam
    if (porcentagem - this.ultimoProgressoGlobal >= passo || this.contadorArquivos === this.totalArquivos) {
      if (agora - this.ultimoEmitMs >= minIntervalMs || this.contadorArquivos === this.totalArquivos) {
        logEngine.log('info', `${ICONES_DIAGNOSTICO.progresso} Progress: {arquivosProcessados}/{totalArquivos} ({percentual}%)`, {
          arquivosProcessados: this.contadorArquivos.toString(),
          totalArquivos: this.totalArquivos.toString(),
          percentual: porcentagem.toString()
        });
        this.ultimoProgressoGlobal = porcentagem;
        this.ultimoEmitMs = agora;
      }
    }
  },
  /** Finalizes analysis batch */
  finalizarBatch(totalOcorrencias: number, duracaoTotal: number): void {
    if (logEngine.contexto === 'simples') {
      logEngine.log('info', `${ICONES_STATUS.ok} Analysis completed - {totalOcorrencias} problems found`, {
        totalOcorrencias: totalOcorrencias.toString()
      });
    } else {
      logEngine.log('info', `${ICONES_STATUS.ok} Checks completed - {totalOcorrencias} problems detected in {duracao}s`, {
        totalOcorrencias: totalOcorrencias.toString(),
        duracao: (duracaoTotal / 1000).toFixed(1)
      });
    }
  },
  /** Timeout is always important - uses logEngine */
  timeout(nomeAnalista: string, duracao: number): void {
    logEngine.log('aviso', LogMensagens.analistas.execucao.timeout, {
      analista: nomeAnalista,
      tempo: duracao.toString()
    });
  },
  /** Errors are always important - uses logEngine */
  erro(nomeAnalista: string, erro: string): void {
    logEngine.log('erro', LogMensagens.analistas.execucao.erro, {
      analista: nomeAnalista,
      erro
    });
  },
  /** Performance for complex projects */
  performance(dados: {
    analistas: number;
    media: number;
    total: number;
  }): void {
    if (logEngine.contexto === 'complexo' || config.DEV_MODE) {
      logEngine.log('info', LogMensagens.analistas.metricas.performance, {
        analistas: dados.analistas.toString(),
        media: dados.media.toFixed(1)
      });
    }
  }
};

/**
 * Logging system for scanner (now via logEngine)
 */
export const logVarredor = {
  iniciarVarredura(diretorio: string): void {
    if (logEngine.contexto !== 'simples') {
      logEngine.log('info', LogMensagens.scanner.inicio, {
        diretorio
      });
    }
  },
  progresso(diretorio: string, arquivos: number): void {
    if (logEngine.contexto === 'complexo' || config.VERBOSE) {
      const nomeDiretorio = diretorio.split('/').pop() || diretorio;
      logEngine.log('info', LogMensagens.scanner.progresso, {
        diretorio: nomeDiretorio,
        arquivos: arquivos.toString()
      });
    }
  },
  filtros(includeCount: number, excludeCount: number): void {
    if (logEngine.contexto !== 'simples' && (includeCount > 0 || excludeCount > 0)) {
      logEngine.log('info', LogMensagens.scanner.filtros, {
        include: includeCount.toString(),
        exclude: excludeCount.toString()
      });
    }
  },
  completo(arquivos: number, diretorios: number): void {
    logEngine.log('info', LogMensagens.scanner.completo, {
      arquivos: arquivos.toString(),
      diretorios: diretorios.toString()
    });
  }
};

/**
 * Logging system for the main system (via logEngine)
 */
export const logSistema = {
  inicializacao(): void {
    if (logEngine.contexto !== 'simples') {
      logEngine.log('info', LogMensagens.sistema.inicializacao.sucesso, {});
    }
  },
  shutdown(): void {
    if (logEngine.contexto !== 'simples') {
      logEngine.log('info', LogMensagens.sistema.shutdown, {});
    }
  },
  erro(mensagem: string, detalhes?: string): void {
    const detalhesStr = detalhes ? ` - ${detalhes}` : '';
    logEngine.log('erro', `${ICONES_STATUS.falha} Error: ${mensagem}${detalhesStr}`, {});
  },
  // Auto fixes
  autoFixNenhumaCorrecao(): void {
    logEngine.log('info', LogMensagens.sistema.correcoes.nenhuma_disponivel, {});
  },
  autoFixAplicando(modo: string): void {
    logEngine.log('info', LogMensagens.sistema.correcoes.aplicando, {
      modo
    });
  },
  autoFixArquivoNaoEncontrado(arquivo: string): void {
    logEngine.log('aviso', LogMensagens.sistema.correcoes.arquivo_nao_encontrado, {
      arquivo
    });
  },
  autoFixAplicada(titulo: string, confianca: number): void {
    if (config.VERBOSE) {
      logEngine.log('info', LogMensagens.sistema.correcoes.aplicada, {
        titulo,
        confianca: confianca.toString()
      });
    }
  },
  autoFixCorrigido(arquivo: string): void {
    if (config.VERBOSE) {
      logEngine.log('info', LogMensagens.sistema.correcoes.corrigido, {
        arquivo
      });
    }
  },
  autoFixFalha(id: string, erro: string): void {
    logEngine.log('aviso', LogMensagens.sistema.correcoes.falha, {
      id,
      erro
    });
  },
  autoFixNenhumaAplicada(): void {
    logEngine.log('aviso', LogMensagens.sistema.correcoes.nenhuma_aplicada, {});
  },
  autoFixEstatisticas(estatisticas: string[]): void {
    logEngine.log('info', LogMensagens.sistema.correcoes.estatisticas, {
      estatisticas: estatisticas.join(', ')
    });
  },
  autoFixESLintHarmonia(): void {
    logEngine.log('info', LogMensagens.sistema.correcoes.eslint_harmonia, {});
  },
  autoFixESLintAjustes(): void {
    logEngine.log('info', LogMensagens.sistema.correcoes.eslint_ajustes, {});
  },
  autoFixESLintFalha(erro: string): void {
    logEngine.log('aviso', LogMensagens.sistema.correcoes.eslint_falha, {
      erro
    });
  },
  // Diagnostic processing
  processamentoFixDetectada(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.fix_detectada, {});
  },
  processamentoESLintOutput(output: string): void {
    logEngine.log('info', LogMensagens.sistema.processamento.eslint_output, {
      output
    });
  },
  processamentoResumoOcorrencias(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.resumo_ocorrencias, {
      total: total.toString()
    });
  },
  processamentoDicasContextuais(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.dicas_contextuais, {});
  },
  processamentoDetalhamentoOcorrencias(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.detalhamento_ocorrencias, {
      total: total.toString()
    });
  },
  processamentoErrosCriticos(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.erros_criticos, {
      total: total.toString()
    });
  },
  processamentoAvisosEncontrados(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.avisos_encontrados, {
      total: total.toString()
    });
  },
  processamentoQuickFixesMuitos(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.quick_fixes_muitos, {
      total: total.toString()
    });
  },
  processamentoQuickFixesComando(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.quick_fixes_comando, {});
  },
  processamentoQuickFixesExecutar(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.quick_fixes_executar, {});
  },
  processamentoTodosMuitos(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.todos_muitos, {
      total: total.toString()
    });
  },
  processamentoTodosPoucos(total: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.todos_poucos, {
      total: total.toString()
    });
  },
  processamentoMuitasOcorrencias(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.muitas_ocorrencias, {});
  },
  processamentoFiltrarPasta(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.filtrar_pasta, {});
  },
  processamentoUsarFull(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.usar_full, {});
  },
  processamentoUsarJson(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.usar_json, {});
  },
  processamentoProjetoLimpo(): void {
    logEngine.log('info', LogMensagens.sistema.processamento.projeto_limpo, {});
  },
  processamentoAnalistasProblemas(quantidade: number): void {
    logEngine.log('info', LogMensagens.sistema.processamento.analistas_problemas, {
      quantidade: quantidade.toString()
    });
  },
  // System update
  atualizacaoExecutando(comando: string): void {
    logEngine.log('info', LogMensagens.sistema.atualizacao.executando, {
      comando
    });
  },
  atualizacaoSucesso(): void {
    logEngine.log('info', LogMensagens.sistema.atualizacao.sucesso, {});
  },
  atualizacaoFalha(): void {
    logEngine.log('erro', LogMensagens.sistema.atualizacao.falha, {});
  },
  atualizacaoDetalhes(detalhe: string): void {
    logEngine.log('aviso', LogMensagens.sistema.atualizacao.detalhes, {
      detalhe
    });
  },
  // Performance
  performanceRegressaoDetectada(limite: number): void {
    logEngine.log('aviso', LogMensagens.sistema.performance.regressao_detectada, {
      limite: limite.toString()
    });
  },
  performanceSemRegressoes(): void {
    logEngine.log('info', LogMensagens.sistema.performance.sem_regressoes, {});
  },
  // Pruning
  podaCancelada(): void {
    logEngine.log('info', LogMensagens.sistema.poda.cancelada, {});
  },
  podaConcluida(): void {
    logEngine.log('info', LogMensagens.sistema.poda.concluida, {});
  },
  // Reversal
  reversaoNenhumMove(arquivo: string): void {
    logEngine.log('erro', LogMensagens.sistema.reversao.nenhum_move, {
      arquivo
    });
  },
  reversaoRevertendo(arquivo: string): void {
    logEngine.log('info', LogMensagens.sistema.reversao.revertendo, {
      arquivo
    });
  },
  reversaoSucesso(arquivo: string): void {
    logEngine.log('info', LogMensagens.sistema.reversao.sucesso, {
      arquivo
    });
  },
  reversaoFalha(arquivo: string): void {
    logEngine.log('erro', LogMensagens.sistema.reversao.falha, {
      arquivo
    });
  }
};

/**
 * Logging system for filters (via logEngine)
 */
export const logFiltros = {
  incluindo(pattern: string, matches: number): void {
    if (config.VERBOSE || logEngine.contexto === 'complexo') {
      logEngine.log('info', LogMensagens.filtros.incluindo, {
        pattern,
        matches: matches.toString()
      });
    }
  },
  excluindo(pattern: string, matches: number): void {
    if (config.VERBOSE || logEngine.contexto === 'complexo') {
      logEngine.log('info', LogMensagens.filtros.excluindo, {
        pattern,
        matches: matches.toString()
      });
    }
  },
  supressao(count: number, motivo: string): void {
    if (count > 0) {
      logEngine.log('info', LogMensagens.filtros.supressao, {
        count: count.toString(),
        motivo
      });
    }
  }
};

/**
 * Logging system for project (via logEngine)
 */
export const logProjeto = {
  detectado(tipo: string, confianca: number): void {
    logEngine.log('info', LogMensagens.projeto.detectado, {
      tipo,
      confianca: confianca.toString()
    });
  },
  estrutura(arquivos: number, linguagens: number): void {
    if (logEngine.contexto !== 'simples') {
      logEngine.log('info', LogMensagens.projeto.estrutura, {
        arquivos: arquivos.toString(),
        linguagens: linguagens.toString()
      });
    }
  },
  complexidade(nivel: string, metricas: string): void {
    if (logEngine.contexto === 'complexo') {
      logEngine.log('info', LogMensagens.projeto.complexidade, {
        nivel,
        metricas
      });
    }
  },
  recomendacao(acao: string): void {
    logEngine.log('info', LogMensagens.projeto.recomendacao, {
      acao
    });
  },
  performance(dados: {
    analistas: number;
    duracao: number;
    throughput?: number;
  }): void {
    if (logEngine.contexto === 'complexo' || config.DEV_MODE) {
      const throughput = dados.throughput ? ` (${dados.throughput.toFixed(1)} files/s)` : '';
      logEngine.log('info', `${ICONES_DIAGNOSTICO.stats} Performance: {analistas} analysts in {duracao}s{throughput}`, {
        analistas: dados.analistas.toString(),
        duracao: (dados.duracao / 1000).toFixed(1),
        throughput
      });
    }
  }
};

/**
 * Logging system for occurrences (via logEngine)
 */
export const logOcorrencias = {
  critica(mensagem: string, arquivo: string, linha?: number): void {
    logEngine.log('erro', LogMensagens.ocorrencias.critica, {
      mensagem,
      arquivo,
      linha: linha?.toString() || ''
    });
  },
  resumo(total: number, criticos: number, avisos: number): void {
    logEngine.log('info', LogMensagens.relatorio.resumo, {
      total: total.toString(),
      criticos: criticos.toString(),
      avisos: avisos.toString()
    });
  }
};

/**
 * Logging system for reports (via logEngine)
 */
export const logRelatorio = {
  gerado(caminho: string, formato: string): void {
    logEngine.log('info', `${ICONES_ARQUIVO.arquivo} ${formato} report generated: ${caminho}`, {});
  },
  erro(erro: string): void {
    logEngine.log('erro', `${ICONES_STATUS.falha} Error generating report: ${erro}`, {});
  },
  repositorioImpecavel(): void {
    logEngine.log('info', LogMensagens.relatorio.repositorio_impecavel, {});
  },
  ocorrenciasEncontradas(total: number): void {
    logEngine.log('aviso', LogMensagens.relatorio.ocorrencias_encontradas, {
      total: total.toString()
    });
  },
  fimPadroesUso(): void {
    logEngine.log('info', LogMensagens.relatorio.fim_padroes_uso, {});
  },
  funcoesLongas(): void {
    logEngine.log('aviso', LogMensagens.relatorio.funcoes_longas, {});
  }
};

/**
 * Logging system for automation (via logEngine)
 */
export const logAuto = {
  // Reversal map
  mapaReversaoErroCarregar(erro: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.erro_carregar, {
      erro
    });
  },
  mapaReversaoErroSalvar(erro: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.erro_salvar, {
      erro
    });
  },
  mapaReversaoMoveNaoEncontrado(id: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.move_nao_encontrado, {
      id
    });
  },
  mapaReversaoArquivoDestinoNaoEncontrado(destino: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.arquivo_destino_nao_encontrado, {
      destino
    });
  },
  mapaReversaoArquivoExisteOrigem(origem: string): void {
    logEngine.log('aviso', LogMensagens.sistema.auto.mapa_reversao.arquivo_existe_origem, {
      origem
    });
  },
  mapaReversaoErroReverter(erro: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.erro_reverter, {
      erro
    });
  },
  mapaReversaoNenhumMove(arquivo: string): void {
    logEngine.log('aviso', LogMensagens.sistema.auto.mapa_reversao.nenhum_move, {
      arquivo
    });
  },
  mapaReversaoRevertendoMove(id: string): void {
    logEngine.log('info', LogMensagens.sistema.auto.mapa_reversao.revertendo_move, {
      id
    });
  },
  mapaReversaoMoveRevertido(id: string): void {
    logEngine.log('info', LogMensagens.sistema.auto.mapa_reversao.move_revertido, {
      id
    });
  },
  mapaReversaoFalhaReverterMove(id: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.mapa_reversao.falha_reverter_move, {
      id
    });
  },
  mapaReversaoCarregado(moves: number): void {
    logEngine.log('info', LogMensagens.sistema.auto.mapa_reversao.carregado, {
      moves: moves.toString()
    });
  },
  mapaReversaoNenhumEncontrado(): void {
    logEngine.log('info', LogMensagens.sistema.auto.mapa_reversao.nenhum_encontrado, {});
  },
  // Pruning
  podaNenhumArquivo(): void {
    logEngine.log('info', LogMensagens.sistema.auto.poda.nenhum_arquivo, {});
  },
  podaPodando(quantidade: number): void {
    logEngine.log('aviso', LogMensagens.sistema.auto.poda.podando, {
      quantidade: quantidade.toString()
    });
  },
  podaPodandoSimulado(quantidade: number): void {
    logEngine.log('aviso', LogMensagens.sistema.auto.poda.podando_simulado, {
      quantidade: quantidade.toString()
    });
  },
  podaArquivoMovido(arquivo: string): void {
    logEngine.log('info', LogMensagens.sistema.auto.poda.arquivo_movido, {
      arquivo
    });
  },
  // Structure corrector
  corretorErroCriarDiretorio(destino: string, erro: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.corretor.erro_criar_diretorio, {
      destino,
      erro
    });
  },
  corretorDestinoExiste(arquivo: string, destino: string): void {
    logEngine.log('aviso', LogMensagens.sistema.auto.corretor.destino_existe, {
      arquivo,
      destino
    });
  },
  corretorErroMover(arquivo: string, erro: string): void {
    logEngine.log('erro', LogMensagens.sistema.auto.corretor.erro_mover, {
      arquivo,
      erro
    });
  },
  // Specific plugin
  pluginIgnorado(plugin: string, erro: string): void {
    logEngine.log('aviso', LogMensagens.auto.plugin_ignorado, {
      plugin,
      erro
    });
  },
  caminhoNaoResolvido(plugin: string): void {
    logEngine.log('aviso', LogMensagens.auto.caminho_nao_resolvido, {
      plugin
    });
  },
  pluginFalhou(plugin: string, erro: string): void {
    logEngine.log('aviso', LogMensagens.auto.plugin_falhou, {
      plugin,
      erro
    });
  },
  moveRemovido(id: string): void {
    logEngine.log('info', LogMensagens.auto.move_removido, {
      id
    });
  }
};

/**
 * Logging system for Guardian (via logEngine)
 */
export const logGuardian = {
  integridadeOk(): void {
    logEngine.log('info', LogMensagens.guardian.integridade_ok, {});
  },
  baselineCriado(): void {
    logEngine.log('info', LogMensagens.guardian.baseline_criado, {});
  },
  baselineAceito(): void {
    logEngine.log('aviso', LogMensagens.guardian.baseline_aceito, {});
  },
  alteracoesDetectadas(): void {
    logEngine.log('aviso', LogMensagens.guardian.alteracoes_detectadas, {});
  },
  bloqueado(): void {
    logEngine.log('erro', LogMensagens.guardian.bloqueado, {});
  },
  modoPermissivo(): void {
    logEngine.log('aviso', LogMensagens.guardian.modo_permissivo, {});
  },
  scanOnly(arquivos: number): void {
    logEngine.log('info', LogMensagens.guardian.scan_only, {
      arquivos: arquivos.toString()
    });
  },
  avisosEncontrados(): void {
    logEngine.log('aviso', LogMensagens.guardian.avisos_encontrados, {});
  },
  // Guardian command specific
  fullScanAviso(): void {
    logEngine.log('aviso', LogMensagens.guardian.full_scan_aviso, {});
  },
  fullScanWarningBaseline(): void {
    logEngine.log('aviso', LogMensagens.guardian.full_scan_warning_baseline, {});
  },
  aceitandoBaseline(): void {
    logEngine.log('info', LogMensagens.guardian.aceitando_baseline, {});
  },
  baselineAceitoSucesso(): void {
    logEngine.log('info', LogMensagens.guardian.baseline_aceito_sucesso, {});
  },
  comparandoIntegridade(): void {
    logEngine.log('info', LogMensagens.guardian.comparando_integridade, {});
  },
  diferencasDetectadas(): void {
    logEngine.log('aviso', LogMensagens.guardian.diferencas_detectadas, {});
  },
  diferencaItem(diferenca: string): void {
    logEngine.log('info', LogMensagens.guardian.diferenca_item, {
      diferenca
    });
  },
  comandoDiffRecomendado(): void {
    logEngine.log('aviso', LogMensagens.guardian.comando_diff_recomendado, {});
  },
  integridadePreservada(): void {
    logEngine.log('info', LogMensagens.guardian.integridade_preservada, {});
  },
  verificandoIntegridade(): void {
    logEngine.log('info', LogMensagens.guardian.verificando_integridade, {});
  },
  baselineCriadoConsole(): void {
    logEngine.log('info', LogMensagens.guardian.baseline_criado_console, {});
  },
  baselineAtualizado(): void {
    logEngine.log('info', LogMensagens.guardian.baseline_atualizado, {});
  },
  alteracoesSuspeitas(): void {
    logEngine.log('aviso', LogMensagens.guardian.alteracoes_suspeitas, {});
  },
  erroGuardian(erro: string): void {
    logEngine.log('erro', LogMensagens.guardian.erro_guardian, {
      erro
    });
  },
  // Generic method for other Guardian messages
  info(mensagem: string): void {
    logEngine.log('info', `${ICONES_FEEDBACK.info} ${mensagem}`, {});
  },
  aviso(mensagem: string): void {
    logEngine.log('aviso', `${ICONES_FEEDBACK.atencao} ${mensagem}`, {});
  }
};

/**
 * Wise advisor for developer well-being
 */
export const logConselheiro = {
  volumeAlto(): void {
    logEngine.log('aviso', LogMensagens.conselheiro.volume_alto, {});
  },
  respira(): void {
    logEngine.log('aviso', LogMensagens.conselheiro.respira, {});
  },
  cuidado(): void {
    logEngine.log('aviso', LogMensagens.conselheiro.cuidado, {});
  },
  madrugada(hora: string): void {
    logEngine.log('aviso', LogMensagens.conselheiro.madrugada, {
      hora
    });
  }
};

/**
 * Logging system for Metrics
 */
export const logMetricas = {
  execucoesRegistradas(quantidade: number): void {
    logEngine.log('info', LogMensagens.metricas.execucoes_registradas, {
      quantidade: quantidade.toString()
    });
  },
  nenhumHistorico(): void {
    logEngine.log('aviso', LogMensagens.metricas.nenhum_historico, {});
  }
};

/**
 * Logging system for Core (parsing, etc.)
 */
export const logCore = {
  erroBabel(erro: string, arquivo?: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.erro_babel, {
      erro,
      arquivo: arquivo || 'unknown'
    });
  },
  erroTs(erro: string, arquivo?: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.erro_ts, {
      erro,
      arquivo: arquivo || 'unknown'
    });
  },
  erroCss(erro: string, arquivo?: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.erro_css, {
      erro,
      arquivo: arquivo || 'unknown'
    });
  },
  erroXml(erro: string, arquivo?: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.erro_xml, {
      erro,
      arquivo: arquivo || 'unknown'
    });
  },
  erroHtml(erro: string, arquivo?: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.erro_html, {
      erro,
      arquivo: arquivo || 'unknown'
    });
  },
  nenhumParser(extensao: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.nenhum_parser, {
      extensao
    });
  },
  timeoutParsing(timeout: number, extensao: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.timeout_parsing, {
      timeout: timeout.toString(),
      extensao
    });
  },
  pluginNaoEncontrado(extensao: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.plugin_nao_encontrado, {
      extensao
    });
  },
  sistemaPluginsFalhou(erro: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.sistema_plugins_falhou, {
      erro
    });
  },
  // Plugins
  erroCarregarPlugin(nome: string, erro: string): void {
    logEngine.log('debug', LogMensagens.core.plugins.erro_carregar, {
      nome,
      erro
    });
  },
  tentandoAutoload(extensao: string): void {
    logEngine.log('debug', LogMensagens.core.plugins.tentando_autoload, {
      extensao
    });
  },
  autoloadFalhou(nome: string): void {
    logEngine.log('debug', LogMensagens.core.plugins.autoload_falhou, {
      nome
    });
  },
  extensaoNaoSuportada(extensao: string): void {
    logEngine.log('debug', LogMensagens.core.plugins.extensao_nao_suportada, {
      extensao
    });
  },
  pluginsRegistrados(): void {
    logEngine.log('debug', LogMensagens.core.parsing.plugins_registrados, {});
  },
  usandoPlugin(nome: string, extensao: string): void {
    logEngine.log('debug', LogMensagens.core.parsing.usando_plugin, {
      nome,
      extensao
    });
  },
  registrandoPlugin(nome: string, versao: string): void {
    logEngine.log('debug', LogMensagens.core.plugins.registrando, {
      nome,
      versao
    });
  },
  reaproveitadoIncremental(arquivo: string): void {
    logEngine.log('info', LogMensagens.core.executor.reaproveitado_incremental, {
      arquivo
    });
  }
};
