// SPDX-License-Identifier: MIT
/**
 * Mensagens em Português (Brasil)
 */

export * from './analistas/index.js';
export * from './cli/index.js';
export * from './core/index.js';
export { VigiaOcultaMensagens } from './guardian/index.js';
export { LicensasMensagens } from './licensas/index.js';
export { log, logAnalistas, logAuto, logConselheiro, LogContextConfiguracao, logCore, logEngine, LogEngineAdaptativo, logFiltros, logGuardian, LogMensagens, logMetricas, logOcorrencias, logProjeto, logRelatorio, logSistema, logVarredor } from './log/index.js';
export { escreverRelatorioMarkdown, formatMessage, gerarFooterRelatorio, gerarHeaderRelatorio, gerarSecaoEstatisticas, gerarSecaoGuardian, gerarSecaoProblemasAgrupados, gerarTabelaDuasColunas, gerarTabelaOcorrencias, gerarTabelaResumoTipos, getDescricaoCampo, JsonMensagens, type MetadadosRelatorioEstendido, pluralize, RelatorioMensagens, separator, wrapComMetadados } from './relatorios/index.js';
export { RelatorioAsyncPatternsMensagens } from './relatorios/relatorio-async-patterns-messages.js';
export { RelatorioZeladorSaudeMensagens } from './relatorios/relatorio-zelador-saude-messages.js';
export { PluginCoreMensagens, PluginRegistryMensagens } from './shared/index.js';
export { type AgrupamentoConfig, AGRUPAMENTOS_MENSAGEM, type ConfigPrioridade, contarPorPrioridade, findAgrupamento, formatarSugestoes, gerarSugestoesContextuais, getIcone, getPrioridade, type IconeAcao, type IconeArquivo, type IconeComando, type IconeDiagnostico, type IconeFeedback, type IconeNivel, type IconeRelatorio, ICONES_ACAO, ICONES_ARQUIVO, ICONES as ICONES_CENTRAL, ICONES_COMANDO, ICONES_DIAGNOSTICO as ICONES_DIAGNOSTICO_CENTRAL, ICONES_FEEDBACK, ICONES_NIVEL, ICONES_RELATORIO, ICONES_STATUS, ICONES_TIPOS, ICONES_ZELADOR as ICONES_ZELADOR_CENTRAL, type IconeStatus, type IconeTipo, type IconeZelador, ordenarPorPrioridade, type PrioridadeNivel, PRIORIDADES, SUGESTOES, SUGESTOES_ARQUETIPOS, SUGESTOES_AUTOFIX, SUGESTOES_COMANDOS, SUGESTOES_DIAGNOSTICO, SUGESTOES_GUARDIAN, SUGESTOES_METRICAS, SUGESTOES_PODAR, SUGESTOES_REESTRUTURAR, SUGESTOES_TIPOS, SUGESTOES_ZELADOR, suportaCores } from './ui/index.js';
export { SugestoesContextuaisMensagens } from './ui/sugestoes-contextuais-messages.js';
export { ERROS_IMPORTS, formatarComTimestamp, formatarDuracao, formatarEstatistica, formatarListaArquivos, gerarResumoImports, ICONES_ZELADOR, MENSAGENS_ESTRUTURA, MENSAGENS_IMPORTS, MENSAGENS_TIPOS, MENSAGENS_ZELADOR_GERAL, MODELOS_SAIDA, PROGRESSO_IMPORTS, SAIDA_CODIGOS } from './zeladores/index.js';
