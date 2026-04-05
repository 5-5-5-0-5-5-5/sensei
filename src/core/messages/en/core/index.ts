// SPDX-License-Identifier: MIT
/**
 * Core Messages: Fixes, Diagnosis, Exceptions, Fix-Types, Inquisitor, Plugins
 */

export { MENSAGENS_ARQUETIPOS_HANDLER, MENSAGENS_AUTOFIX, MENSAGENS_CORRECAO_TIPOS, MENSAGENS_CORRECOES, MENSAGENS_EXECUTOR, MENSAGENS_PLUGINS, MENSAGENS_RELATORIOS_ANALISE } from './correcoes-messages.js';
export { CABECALHOS, formatarBlocoSugestoes, formatarModoJson, formatarResumoStats, ICONES_DIAGNOSTICO, MENSAGENS_ARQUETIPOS, MENSAGENS_AVISO, MENSAGENS_CONCLUSAO, MENSAGENS_ERRO, MENSAGENS_ESTATISTICAS, MENSAGENS_FILTROS, MENSAGENS_GUARDIAN, MENSAGENS_INICIO, MENSAGENS_PROGRESSO, MODELOS_BLOCO } from './diagnostico-messages.js';
export { ExcecoesMensagens } from './excecoes-messages.js';
export { ExecutorExtraMensagens } from './executor-extra-messages.js';
export { ACOES_SUGERIDAS, CATEGORIAS_TIPOS, DEPURACAO, DICAS, formatarComContexto, formatarOcorrencia, formatarSugestao, formatarTipoInseguro, gerarResumoCategoria, ICONES as ICONES_FIX_TYPES, MENSAGENS_CLI_CORRECAO_TIPOS, MENSAGENS_ERRO as MENSAGENS_ERRO_FIX_TYPES, MENSAGENS_INICIO as MENSAGENS_INICIO_FIX_TYPES, MENSAGENS_PROGRESSO as MENSAGENS_PROGRESSO_FIX_TYPES, MENSAGENS_RESUMO, MENSAGENS_SUCESSO as MENSAGENS_SUCESSO_FIX_TYPES, TEMPLATE_RESUMO_FINAL, TEXTOS_CATEGORIZACAO_CORRECAO_TIPOS } from './fix-types-messages.js';
export { InquisidorExtraMensagens } from './inquisidor-extra-messages.js';
export { InquisidorMensagens } from './inquisidor-messages.js';
export { ParserExtraMensagens } from './parser-extra-messages.js';
export { AnalystOrigens, AnalystTipos, CssInJsMensagens,CssMensagens, FormatadorMensagens, HtmlMensagens, PythonMensagens, ReactHooksMensagens, ReactMensagens, SeverityNiveis, SvgMensagens, TailwindMensagens, XmlMensagens } from './plugin-messages.js';
