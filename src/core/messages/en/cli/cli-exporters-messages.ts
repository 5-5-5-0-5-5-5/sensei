// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_RELATORIO } from '../../shared/icons.js';

export const CliExportersMessages = {
  poda: {
    reportsExported: (dir: string) => `Pruning reports exported to: ${dir}`,
    exportFailed: (erroMensagem: string) => `Failed to export pruning reports: ${erroMensagem}`
  },
  guardian: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} Guardian reports exported:`,
  markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
  jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
  exportFailed: (erroMensagem: string) => `Failed to export Guardian reports: ${erroMensagem}`
  },
  fixTypes: {
    reportsExportedTitle: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} Fix-types reports exported:`,
    markdownPath: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
    jsonPath: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
    exportFailed: (erroMensagem: string) => `Failed to export fix-types reports: ${erroMensagem}`
  },
  reestruturacao: {
    reportsExported: (modoPrefixo: string, dir: string) => `Restructuring reports ${modoPrefixo}exported to: ${dir}`,
    exportFailed: (modoPrefixo: string, erroMensagem: string) => `Failed to export ${modoPrefixo}restructuring reports: ${erroMensagem}`
  }
} as const;
export const CliExportersMensagens = CliExportersMessages;
