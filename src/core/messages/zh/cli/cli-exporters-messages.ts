// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_RELATORIO } from '../../shared/icons.js';

export const CliExportersMessages = {
  poda: {
    reportsExported: (dir: string) => `Pruning 报告s exported to: ${dir}`,
    exportFailed: (erroMensagem: string) => `Failed to export pruning 报告s: ${erroMensagem}`
  },
  guardian: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} guardian reports exported:`,
  markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
  jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
  exportFailed: (erroMensagem: string) => `Failed to export guardian reports: ${erroMensagem}`
  },
  fixTypes: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} Fix-types 报告s exported:`,
    markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
    jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
    exportFailed: (erroMensagem: string) => `Failed to export fix-types 报告s: ${erroMensagem}`
  },
  reestruturacao: {
    reportsExported: (modoPrefixo: string, dir: string) => `Restructuring 报告s ${modoPrefixo}exported to: ${dir}`,
    exportFailed: (modoPrefixo: string, erroMensagem: string) => `Failed to export ${modoPrefixo}restructuring 报告s: ${erroMensagem}`
  }
} as const;
export const CliExportersMensagens = CliExportersMessages;
