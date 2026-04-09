// SPDX-License-Identifier: MIT

import { ICONES_ACAO } from '../../shared/icons.js';

export const CliComandoMetricasMessages = {
  blankLine: '',
  historyExported: (destino: string) => `${ICONES_ACAO.export} Metrics history exported to ${destino}`,
  executionLine: (timestampISO: string, totalArquivos: number, duracaoAnalise: string, duracaoParsing: string, cacheHits: number, cacheMiss: number) => `- ${timestampISO} | files=${totalArquivos} 分析=${duracaoAnalise} parsing=${duracaoParsing} cache(h/m)=${cacheHits}/${cacheMiss}`,
  topAnalystsTitle: (iconeInfo: string) => `${iconeInfo} Top analysts (by accumulated time):`,
  topAnalystLine: (nome: string, total: string, media: string, execucoes: number, ocorrencias: number) => `  • ${nome} total=${total} avg=${media} exec=${execucoes} occ=${ocorrencias}`,
  averages: (mediaAnalise: string, mediaParsing: string) => `\nAverages: 分析=${mediaAnalise} parsing=${mediaParsing}`
} as const;
