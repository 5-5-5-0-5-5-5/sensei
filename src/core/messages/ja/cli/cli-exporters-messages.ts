// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_RELATORIO } from '../../shared/icons.js';

export const CliExportersMessages = {
  poda: {
    reportsExported: (dir: string) => `Pruning レポートs exported to: ${dir}`,
    exportFailed: (erroMensagem: string) => `Failed to export pruning レポートs: ${erroMensagem}`
  },
  guardian: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} guardian reports exported:`,
  markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
  jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
  exportFailed: (erroMensagem: string) => `Failed to export guardian reports: ${erroMensagem}`
  },
  fixTypes: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} Fix-types レポートs exported:`,
    markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
    jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
    exportFailed: (erroMensagem: string) => `Failed to export fix-types レポートs: ${erroMensagem}`
  },
  reestruturacao: {
    reportsExported: (modoPrefixo: string, dir: string) => `Restructuring レポートs ${modoPrefixo}exported to: ${dir}`,
    exportFailed: (modoPrefixo: string, erroMensagem: string) => `Failed to export ${modoPrefixo}restructuring レポートs: ${erroMensagem}`
  }
} as const;
