// SPDX-License-Identifier: MIT

/**
 * @fileoverview コード使用パターンアナライザー向けの診断メッセージ。
 * `var`、`eval`、TypeScriptにおける`require`、
 * 匿名関数、その他非推奨の構文の使用を検出するためのテキストテンプレートを提供します。
 */

export const PadroesUsoMensagens = {
  varUsage: "'var'の使用が検出されました。'let'または'const'を優先してください。",
  letUsage: "'let'の使用。再代入がない場合は'const'を検討してください。",
  requireInTs: "TypeScriptファイルでの'require'の使用。'import'を優先してください。",
  evalUsage: "'eval'の使用が検出されました。セキュリティおよびパフォーマンスの観点から避けてください。",
  moduleExportsInTs: "TypeScriptファイルでの'module.exports'または'exports'の使用。'export'を優先してください。",
  withUsage: "'with'の使用が検出されました。可読性およびスコープの観点から避けてください。",
  anonymousFunction: '匿名関数が検出されました。トレース性を向上させるため、関数に名前を付けることを検討してください。',
  arrowAsClassMethod: 'クラスメソッドとしてアロー関数が使用されています。継承の観点から従来のメソッド構文を優先してください。',
  erroAnalise: (relPath: string, erro: string) => `${relPath}の使用パターン分析に失敗しました: ${erro}`
} as const;
