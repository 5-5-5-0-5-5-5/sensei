// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_RELATORIO } from '../../shared/icons.js';

export const CliExportersMensagens = {
  poda: {
    relatoriosExportados: (dir: string) => `整理レポートをエクスポートしました: ${dir}`,
    falhaExportar: (erroMensagem: string) => `整理レポートのエクスポートに失敗しました: ${erroMensagem}`
  },
  guardian: {
    relatoriosExportadosTitulo: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} Guardianレポートをエクスポートしました:`,
    caminhoMarkdown: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
    caminhoJson: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
    falhaExportar: (erroMensagem: string) => `Guardianレポートのエクスポートに失敗しました: ${erroMensagem}`
  },
  fixTypes: {
    relatoriosExportadosTitulo: `${ICONES_ACAO.export} ${ICONES_RELATORIO.detalhado} fix-typesレポートをエクスポートしました:`,
    caminhoMarkdown: (caminhoMd: string) => `   Markdown: ${caminhoMd}`,
    caminhoJson: (caminhoJson: string) => `   JSON: ${caminhoJson}`,
    falhaExportar: (erroMensagem: string) => `fix-typesレポートのエクスポートに失敗しました: ${erroMensagem}`
  },
  reestruturacao: {
    relatoriosExportados: (modoPrefixo: string, dir: string) => `再構築レポートを${modoPrefixo}エクスポートしました: ${dir}`,
    falhaExportar: (modoPrefixo: string, erroMensagem: string) => `再構築レポートの${modoPrefixo}エクスポートに失敗しました: ${erroMensagem}`
  }
} as const;
