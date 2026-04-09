// SPDX-License-Identifier: MIT
/**
 * Centralized and contextual log message system
 * Automatically adapts to project type and complexity
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_NIVEL, ICONES_RELATORIO, ICONES_STATUS } from '../../shared/icons.js';

export const LogMensagens = {
  sistema: {
    inicializacao: {
      sucesso: `${ICONES_FEEDBACK.foguete} Prometheus initialized in {tempo}ms`,
      falha: `${ICONES_STATUS.falha} Initialization failure: {erro}`,
      configuracao: `${ICONES_ARQUIVO.config} Configuration loaded: {fonte} ({campos} fields)`
    },
    shutdown: `${ICONES_STATUS.ok} 分析 completed gracefully`,
    atualizacao: {
      executando: `${ICONES_ACAO.import} Running: {comando}`,
      sucesso: `${ICONES_STATUS.ok} Update completed 成功fully!`,
      falha: `${ICONES_STATUS.falha} Update aborted or failed.`,
      detalhes: `${ICONES_FEEDBACK.atencao} {detalhe}`
    },
    performance: {
      regressao_detectada: `${ICONES_FEEDBACK.atencao} Regression above {limite}% detected.`,
      sem_regressoes: `${ICONES_STATUS.ok} No significant regressions.`
    },
    poda: {
      cancelada: `${ICONES_STATUS.falha} Pruning canceled.`,
      concluida: `${ICONES_STATUS.ok} Pruning completed: Orphan files removed 成功fully!`
    },
    reversao: {
      nenhum_move: `${ICONES_STATUS.falha} No move found for ファイル: {arquivo}`,
      revertendo: `${ICONES_COMANDO.reverter} Reverting moves for: {arquivo}`,
      sucesso: `${ICONES_STATUS.ok} File reverted 成功fully: {arquivo}`,
      falha: `${ICONES_STATUS.falha} Failed to revert ファイル: {arquivo}`
    },
    auto: {
      mapa_reversao: {
        erro_carregar: `${ICONES_STATUS.falha} エラー loading reversal map: {erro}`,
        erro_salvar: `${ICONES_STATUS.falha} エラー saving reversal map: {erro}`,
        move_nao_encontrado: `${ICONES_STATUS.falha} Move not found: {id}`,
        arquivo_destino_nao_encontrado: `${ICONES_STATUS.falha} Destination ファイル not found: {destino}`,
        arquivo_existe_origem: `${ICONES_FEEDBACK.atencao} ファイル already exists at origin: {origem}`,
        erro_reverter: `${ICONES_STATUS.falha} エラー reverting move: {erro}`,
        nenhum_move: `${ICONES_FEEDBACK.atencao} No move found for: {arquivo}`,
        revertendo_move: `${ICONES_COMANDO.reverter} Reverting move: {id}`,
        move_revertido: `${ICONES_STATUS.ok} Move reverted 成功fully: {id}`,
        falha_reverter_move: `${ICONES_STATUS.falha} Failed to revert move: {id}`,
        carregado: `${ICONES_RELATORIO.lista} Reversal map loaded: {moves} moves registered`,
        nenhum_encontrado: `${ICONES_RELATORIO.lista} No reversal map found, starting new one`
      },
      poda: {
        nenhum_arquivo: `${ICONES_STATUS.ok} No ファイル to prune this cycle.\n`,
        podando: `${ICONES_COMANDO.podar} Pruning {quantidade} ファイル...`,
        podando_simulado: `${ICONES_COMANDO.podar} Pruning {quantidade} ファイル... (SIMULATED)`,
        arquivo_movido: `${ICONES_STATUS.ok} {arquivo} に移動 abandoned.`
      },
      corretor: {
        erro_criar_diretorio: `${ICONES_STATUS.falha} Failed to create directory for {destino}: {erro}`,
        destino_existe: `${ICONES_FEEDBACK.atencao} Destination already exists: {arquivo} → {destino}`,
        erro_mover: `${ICONES_STATUS.falha} Failed to move {arquivo} via rename: {erro}`
      }
    },
    correcoes: {
      nenhuma_disponivel: `${ICONES_STATUS.ok} No automatic corrections available`,
      aplicando: `${ICONES_ACAO.correcao} Applying automatic corrections in {modo} mode...`,
      arquivo_nao_encontrado: `${ICONES_FEEDBACK.atencao} ファイル not found for correction: {arquivo}`,
      aplicada: `${ICONES_STATUS.ok} {titulo} (confidence: {confianca}%)`,
      corrigido: `${ICONES_STATUS.ok} Fixed: {arquivo}`,
      falha: `${ICONES_FEEDBACK.atencao} Failed to apply quick fix {id}: {erro}`,
      nenhuma_aplicada: `${ICONES_FEEDBACK.atencao} No corrections could be applied`,
      estatisticas: `${ICONES_STATUS.ok} {estatisticas}`,
      eslint_harmonia: `${ICONES_STATUS.ok} ESLint validation completed - harmony maintained`,
      eslint_ajustes: `${ICONES_STATUS.ok} ESLint applied additional adjustments for full harmony`,
      eslint_falha: `${ICONES_STATUS.falha} ESLint validation failed: {erro}`
    },
    processamento: {
      fix_detectada: `${ICONES_ACAO.correcao} --fix flag detected: enabling automatic corrections`,
      eslint_output: `${ICONES_RELATORIO.lista} ESLint output: {output}`,
      resumo_ocorrencias: `${ICONES_DIAGNOSTICO.stats} Summary of {total} occurrences:`,
      dicas_contextuais: `${ICONES_FEEDBACK.dica} Contextual tips:`,
      detalhamento_ocorrencias: `${ICONES_DIAGNOSTICO.stats} 詳細 of {total} occurrences:`,
      erros_criticos: `${ICONES_RELATORIO.error} {total} critical エラーs found - prioritize these first`,
      avisos_encontrados: `${ICONES_RELATORIO.warning} {total} 警告s found`,
      quick_fixes_muitos: `${ICONES_ACAO.correcao} {total} automatic corrections available:`,
      quick_fixes_comando: '   → PROMETHEUS_ALLOW_MUTATE_FS=1 npm run diagnosticar --fix',
      quick_fixes_executar: '   (command ready to run)',
      todos_muitos: `${ICONES_RELATORIO.lista} {total} TODOs found - consider --include to focus on a specific area`,
      todos_poucos: `${ICONES_RELATORIO.lista} {total} TODOs found - good control!`,
      muitas_ocorrencias: `${ICONES_FEEDBACK.atencao} Many occurrences - use --executive for a high-level view`,
      filtrar_pasta: `${ICONES_ARQUIVO.diretorio} Or filter by folder: --include "src/cli" or --include "src/analistas"`,
      usar_full: `${ICONES_DIAGNOSTICO.completo} Use --full for complete 詳細`,
      usar_json: `${ICONES_ARQUIVO.json} Use --json for structured output (CI/scripts)`,
      projeto_limpo: `${ICONES_STATUS.ok} Clean project! Use --guardian-check for integrity verification`,
      analistas_problemas: `${ICONES_DIAGNOSTICO.inicio} Analysts that found problems: {quantidade}`
    }
  },
  scanner: {
    inicio: `${ICONES_DIAGNOSTICO.inicio} Starting scan in: {diretorio}`,
    progresso: `${ICONES_ARQUIVO.diretorio} Scanning: {diretorio} ({arquivos} ファイル)`,
    filtros: `${ICONES_DIAGNOSTICO.stats} Filters applied: {include} includes, {exclude} excludes`,
    completo: `${ICONES_STATUS.ok} Scan completed: {arquivos} ファイル in {diretorios} directories`
  },
  analistas: {
    execucao: {
      // Simple logs for small projects
      inicio_simples: `${ICONES_DIAGNOSTICO.inicio} Analyzing {arquivo}`,
      sucesso_simples: `${ICONES_STATUS.ok} {arquivo}: {ocorrencias} issues`,
      // Detailed logs for complex projects
      inicio_detalhado: `${ICONES_DIAGNOSTICO.inicio} Running '{analista}' on {arquivo} ({tamanho}kb)`,
      sucesso_detalhado: `${ICONES_STATUS.ok} '{analista}' completed: {ocorrencias} occurrences ({tempo}ms)`,
      timeout: `${ICONES_FEEDBACK.atencao} Analyst '{analista}' timeout after {tempo}ms`,
      erro: `${ICONES_STATUS.falha} エラー in analyst '{analista}': {erro}`,
      skip: `${ICONES_STATUS.pulado} Skipping '{arquivo}' (suppressed by configuration)`
    },
    metricas: {
      performance: `${ICONES_DIAGNOSTICO.stats} Performance: {analistas} analysts, {media}ms/ファイル average`,
      cache_hit: `${ICONES_DIAGNOSTICO.rapido} Cache hit: {hits}/{total} ({percentual}%)`,
      worker_pool: `${ICONES_STATUS.executando} Worker pool: {ativos}/{total} active workers`
    }
  },
  filtros: {
    incluindo: ` ${ICONES_ACAO.criar} Including: {パターン} ({matches} files)`,
    excluindo: ` ${ICONES_ACAO.deletar} Excluding: {パターン} ({matches} files)`,
    supressao: `${ICONES_STATUS.pausado} Suppressed {count} occurrences: {motivo}`,
    cli_override: `${ICONES_DIAGNOSTICO.stats} CLI override: {tipo} patterns overriding configuration`
  },
  projeto: {
    detectado: `${ICONES_RELATORIO.lista} Project detected: {tipo} ({confianca}% confidence)`,
    estrutura: `${ICONES_DIAGNOSTICO.stats} Structure: {arquivos} ファイル, {linguagens} languages`,
    complexidade: `${ICONES_DIAGNOSTICO.stats} Complexity: {nivel} (based on {metricas})`,
    recomendacao: `${ICONES_FEEDBACK.dica} Recommendation: {acao} for this type of project`
  },
  contexto: {
    desenvolvedor_novo: `${ICONES_FEEDBACK.info} Simple project detected - simplified logs enabled`,
    equipe_experiente: `${ICONES_FEEDBACK.info} Enterprise project detected - detailed logs enabled`,
    ci_cd: `${ICONES_FEEDBACK.info} CI/CD environment detected - structured logs enabled`,
    debug_mode: `${ICONES_FEEDBACK.info} Debug mode active - verbose logs enabled`
  },
  ocorrencias: {
    critica: `${ICONES_NIVEL.critico} CRITICAL: {mensagem} in {arquivo}:{linha}`,
    aviso: `${ICONES_NIVEL.aviso} 警告: {mensagem} ({categoria})`,
    info: `${ICONES_NIVEL.info} 情報: {mensagem}`,
    sugestao: `${ICONES_FEEDBACK.dica} Suggestion: {mensagem} - {acao_sugerida}`
  },
  relatorio: {
    resumo: `${ICONES_DIAGNOSTICO.stats} Summary: {total} issues ({criticos} critical, {avisos} 警告s)`,
    categorias: `${ICONES_RELATORIO.lista} Top: {top_categorias}`,
    arquivo_problema: `${ICONES_FEEDBACK.atencao} Most issues: {arquivo} ({count} occurrences)`,
    tendencia: `${ICONES_DIAGNOSTICO.stats} Trend: {direcao} compared to baseline`,
    repositorio_impecavel: 'Impeccable repository',
    ocorrencias_encontradas: 'Found {total} occurrences',
    fim_padroes_uso: `\n${ICONES_STATUS.ok} End of usage patterns report.\n`,
    funcoes_longas: `${ICONES_FEEDBACK.atencao} Long functions found:`
  },
  conselheiro: {
    volume_alto: `${ICONES_FEEDBACK.info} High volume of tasks? The コード doesn't run away; burnout does.`,
    respira: `${ICONES_FEEDBACK.info} Hey, real quick: just breathe for a moment.`,
    cuidado: `${ICONES_FEEDBACK.info} Take care of yourself: drink some water, stretch, close your eyes for 5 min. We'll continue after.\n`,
    madrugada: `${ICONES_FEEDBACK.atencao} It's already past {hora}. コード compiles tomorrow; you rest now.`
  },
  guardian: {
    integridade_ok: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.ok} guardian: integrity preserved.`,
    baseline_criado: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.info} guardian baseline created.`,
    baseline_aceito: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} guardian: new baseline accepted — run again.`,
    alteracoes_detectadas: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.erro} guardian: suspicious changes detected! Consider running 'prometheus guardian --diff'.`,
    bloqueado: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.falha} guardian blocked: suspicious changes or fatal error.`,
    modo_permissivo: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} Permissive mode: proceeding at your own risk.`,
    scan_only: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.info} Scan-only mode: {arquivos} files mapped.`,
    avisos_encontrados: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} There are warning-level occurrences`,
    // Guardian command
    full_scan_aviso: `${ICONES_NIVEL.aviso} --full-scan active: baseline will NOT be persisted with expanded scope.`,
    full_scan_warning_baseline: `${ICONES_NIVEL.aviso} --full-scan active, but baseline will be created with temporarily expanded scope.`,
    aceitando_baseline: `\n${ICONES_COMANDO.atualizar} Accepting new integrity baseline...\n`,
    baseline_aceito_sucesso: `${ICONES_STATUS.ok} New integrity baseline accepted 成功fully!`,
    comparando_integridade: `\n${ICONES_DIAGNOSTICO.stats} Comparing Prometheus integrity with baseline...\n`,
    diferencas_detectadas: `${ICONES_RELATORIO.error} Differences detected:`,
    diferenca_item: '  - {diferenca}',
    comando_diff_recomendado: 'Run with --diff to show detailed differences or --accept to accept new baseline.',
    integridade_preservada: `${ICONES_STATUS.ok} No differences detected. Integrity preserved.`,
    verificando_integridade: `\n${ICONES_DIAGNOSTICO.guardian} Checking Prometheus integrity...\n`,
    baseline_criado_console: `${ICONES_DIAGNOSTICO.guardian} guardian baseline created`,
    baseline_atualizado: `${ICONES_DIAGNOSTICO.guardian} Baseline updated and accepted`,
    alteracoes_suspeitas: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.erro} Suspicious changes detected!`,
    erro_guardian: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.falha} guardian error: {erro}`
  },
  metricas: {
    execucoes_registradas: `\n${ICONES_DIAGNOSTICO.stats} Registered executions: {quantidade}`,
    nenhum_historico: 'No metrics history found yet. Run a diagnostic with --metricas active.'
  },
  auto: {
    plugin_ignorado: `${ICONES_NIVEL.aviso} プラグイン ignored ({plugin}): {erro}`,
    caminho_nao_resolvido: `${ICONES_NIVEL.aviso} プラグイン path not resolved: {plugin}`,
    plugin_falhou: `${ICONES_STATUS.falha} プラグイン failed: {plugin} — {erro}`,
    move_removido: `${ICONES_ACAO.deletar} Move removed from map: {id}`
  },
  core: {
    parsing: {
      erro_babel: `${ICONES_NIVEL.aviso} Babel parsing エラー in {arquivo}: {erro}`,
      erro_ts: `${ICONES_NIVEL.aviso} TS compiler parse エラー in {arquivo}: {erro}`,
      erro_xml: `${ICONES_NIVEL.aviso} XML parse エラー in {arquivo}: {erro}`,
      erro_html: `${ICONES_NIVEL.aviso} HTML parse エラー in {arquivo}: {erro}`,
      erro_css: `${ICONES_NIVEL.aviso} CSS parse エラー in {arquivo}: {erro}`,
      nenhum_parser: `${ICONES_NIVEL.aviso} No parser available for extension: {extensao}`,
      timeout_parsing: `${ICONES_NIVEL.aviso} Parsing timeout after {timeout}ms for extension {extensao}`,
      plugin_nao_encontrado: `${ICONES_NIVEL.aviso} プラグイン not found for {extensao}, using legacy system`,
      sistema_plugins_falhou: `${ICONES_STATUS.falha} プラグイン system failed: {erro}, using legacy system`,
      plugins_registrados: `${ICONES_DIAGNOSTICO.inicio} Default プラグインs registered in system`,
      usando_plugin: `${ICONES_DIAGNOSTICO.inicio} Using プラグイン '{nome}' for {extensao}`
    },
    plugins: {
      erro_carregar: `${ICONES_STATUS.falha} Error loading プラグイン {nome}: {erro}`,
      tentando_autoload: `${ICONES_DIAGNOSTICO.inicio} Trying autoload for extension {extensao}`,
      autoload_falhou: `${ICONES_STATUS.falha} Autoload failed for {nome}`,
      extensao_nao_suportada: `${ICONES_NIVEL.aviso} Extension {extensao} not supported by core プラグイン`,
      registrando: `${ICONES_DIAGNOSTICO.inicio} Registering プラグイン: {nome} v{versao}`
    },
    executor: {
      reaproveitado_incremental: `${ICONES_DIAGNOSTICO.rapido} Reused {arquivo} (incremental)`
    }
  }
} as const;

/**
 * Adaptive context configuration for different project types
 */
export const LogContextConfiguracao = {
  // Simple project: few files, one developer
  simples: {
    nivel_detalhamento: 'basico',
    mostrar_performance: false,
    mostrar_cache: false,
    mostrar_workers: false,
    formato_arquivo: 'nome_apenas',
    // file name only, not full path
    agrupar_ocorrencias: true
  },
  // Medium project: small team, multiple languages
  medio: {
    nivel_detalhamento: 'moderado',
    mostrar_performance: true,
    mostrar_cache: false,
    mostrar_workers: false,
    formato_arquivo: 'relativo',
    // relative path
    agrupar_ocorrencias: true
  },
  // Complex project: large team, CI/CD, multiple modules
  complexo: {
    nivel_detalhamento: 'completo',
    mostrar_performance: true,
    mostrar_cache: true,
    mostrar_workers: true,
    formato_arquivo: 'completo',
    // full path + metadata
    agrupar_ocorrencias: false
  },
  // CI/CD environment: structured logs, no colors
  ci: {
    nivel_detalhamento: 'estruturado',
    mostrar_performance: true,
    mostrar_cache: true,
    mostrar_workers: true,
    formato_arquivo: 'relativo',
    agrupar_ocorrencias: false,
    formato_saida: 'json_lines'
  }
} as const;
