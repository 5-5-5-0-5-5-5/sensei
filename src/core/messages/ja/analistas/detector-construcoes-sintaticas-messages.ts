// SPDX-License-Identifier: MIT

/**
 * @fileoverview 構文構築検出器向けの診断メッセージ。
 * 特定された構文構築および分析中のエラーを報告するための
 * テキストテンプレートを提供します。
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : '不明なエラー';
}
export const DetectorConstrucoesSintaticasMensagens = {
  identificadas: (mensagemFinal: string) => `特定された構文構築: ${mensagemFinal}`,
  erroAnalisar: (erro: ErroUnknown) => `構文構築分析エラー: ${erroToMessage(erro)}`
} as const;
