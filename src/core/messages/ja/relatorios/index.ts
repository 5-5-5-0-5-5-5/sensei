// SPDX-License-Identifier: MIT
/**
 * MD/JSON Report Messages
 */

export { getDescricaoCampo, JsonMensagens, wrapComMetadados } from './json-messages.js';
export { RelatorioAsyncPatternsMensagens } from './relatorio-async-patterns-messages.js';
export { formatMessage, pluralize, RelatorioMensagens, separator } from './relatorio-messages.js';
export { escreverRelatorioMarkdown, gerarFooterRelatorio, gerarHeaderRelatorio, gerarSecaoEstatisticas, gerarSecaoGuardian, gerarSecaoProblemasAgrupados, gerarTabelaDuasColunas, gerarTabelaOcorrencias, gerarTabelaResumoTipos, type MetadadosRelatorioEstendido } from './relatorio-templates.js';
export { RelatorioZeladorSaudeMensagens } from './relatorio-zelador-saude-messages.js';
