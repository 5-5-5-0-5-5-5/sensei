// SPDX-License-Identifier: MIT

import { ICONES_ACAO } from '../../shared/icons.js';

export const CliComandoMetricasMensagens = {
  linhaEmBranco: '',
  historicoExportado: (destino: string) => `${ICONES_ACAO.export} メトリクス履歴を ${destino} にエクスポートしました`,
  linhaExecucao: (timestampISO: string, totalArquivos: number, duracaoAnalise: string, duracaoParsing: string, cacheHits: number, cacheMiss: number) => `- ${timestampISO} | ファイル数=${totalArquivos} 分析=${duracaoAnalise} パース=${duracaoParsing} キャッシュ(ヒ/ミ)=${cacheHits}/${cacheMiss}`,
  tituloTopAnalistas: (iconeInfo: string) => `${iconeInfo} トップアナリスト（累積時間順）:`,
  linhaTopAnalista: (nome: string, total: string, media: string, execucoes: number, ocorrencias: number) => `  • ${nome} 合計=${total} 平均=${media} 実行=${execucoes} 発生=${ocorrencias}`,
  medias: (mediaAnalise: string, mediaParsing: string) => `\n平均: 分析=${mediaAnalise} パース=${mediaParsing}`
} as const;
