// SPDX-License-Identifier: MIT

/**
 * @fileoverview 集約結果検出器向けの診断メッセージ。
 * セキュリティ、パフォーマンス、ドキュメント、重複の問題に対する
 * 要約テキストテンプレートを結果のページネーションサポート付きで提供します。
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : '不明なエラー';
}
export const DetectorAgregadosMensagens = {
  problemasSegurancaResumo: (severidade: string, resumo: string, total: number) => `セキュリティの問題 (${severidade}): ${resumo}${total > 3 ? ` (他+${total - 3}件)` : ''}`,
  erroAnalisarSeguranca: (erro: ErroUnknown) => `セキュリティ分析エラー: ${erroToMessage(erro)}`,
  problemasPerformanceResumo: (impacto: string, resumo: string, total: number) => `パフォーマンスの問題 (${impacto}): ${resumo}${total > 3 ? ` (他+${total - 3}件)` : ''}`,
  erroAnalisarPerformance: (erro: ErroUnknown) => `パフォーマンス分析エラー: ${erroToMessage(erro)}`,
  problemasDocumentacaoResumo: (prioridade: string, resumo: string, total: number) => `ドキュメントの問題 (${prioridade}): ${resumo}${total > 3 ? ` (他+${total - 3}件)` : ''}`,
  erroAnalisarDocumentacao: (erro: ErroUnknown) => `ドキュメント分析エラー: ${erroToMessage(erro)}`,
  duplicacoesResumo: (tipo: string, resumo: string, total: number) => `${tipo}の重複: ${resumo}${total > 3 ? ` (他+${total - 3}件)` : ''}`,
  erroAnalisarDuplicacoes: (erro: ErroUnknown) => `重複分析エラー: ${erroToMessage(erro)}`
} as const;
