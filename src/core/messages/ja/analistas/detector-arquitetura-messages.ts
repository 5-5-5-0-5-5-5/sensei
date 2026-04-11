// SPDX-License-Identifier: MIT

/**
 * @fileoverview アーキテクチャ検出器向けの診断メッセージ。
 * 特定されたアーキテクチャパターン、違反、
 * 結合度/凝集度メトリクス、分析エラーを報告するためのテキストテンプレートを提供します。
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : '不明なエラー';
}
export const DetectorArquiteturaMensagens = {
  padraoArquitetural: (padraoIdentificado: string | undefined, confianca: number) => `アーキテクチャパターン: ${padraoIdentificado} (信頼度${confianca}%)`,
  caracteristicas: (caracteristicas: string[]) => `特徴: ${caracteristicas.slice(0, 3).join(', ')}`,
  violacao: (violacao: string) => `アーキテクチャ違反: ${violacao}`,
  metricas: (acoplamento: number, coesao: number) => `メトリクス: 結合度=${(acoplamento * 100).toFixed(0)}%、凝集度=${(coesao * 100).toFixed(0)}%`,
  erroAnalisarArquitetura: (erro: ErroUnknown) => `アーキテクチャ分析エラー: ${erroToMessage(erro)}`
} as const;
