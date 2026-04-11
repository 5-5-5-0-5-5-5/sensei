// SPDX-License-Identifier: MIT

/**
 * @fileoverview 審問（ASTパーサー）の診断メッセージ。
 * パースエラー、ASTエラー、抑制されたパースエラーの集約を報告するための
 * テキストテンプレートを提供します。
 */

export const InquisidorMensagens = {
  parseAstNaoGerada: 'パースエラー: ASTが生成されませんでした（コードが無効な可能性があります）。',
  parseErro: (erro: string) => `パースエラー: ${erro}`,
  parseErrosAgregados: (quantidade: number) => `集約されたパースエラー: このファイルで${quantidade}件の発生が抑制されています（1件を表示）。`,
  falhaGerarAst: (relPath: string, erro: string) => `${relPath} のAST生成に失敗しました: ${erro}`
} as const;
