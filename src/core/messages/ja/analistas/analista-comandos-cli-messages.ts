// SPDX-License-Identifier: MIT

/**
 * @fileoverview CLIコマンドアナリストの診断メッセージ。
 * コマンドファイル内の重複コマンド、匿名ハンドラー、
 * エラー処理の欠如、その他の不良習慣を検出するための
 * テキストテンプレートを提供します。
 */

function comandoLabel(comandoNome?: string): string {
  return comandoNome ? ` "${comandoNome}"` : "";
}
export const ComandosCliMensagens = {
  padraoAusente: '登録のないコマンドファイルの可能性があります。このファイルにコマンドが含まれるべき場合は、「onCommand」、「registerCommand」、またはフレームワーク固有のメソッド（例：Discord.jsのSlashCommandBuilder）の使用を検討してください。',
  comandosDuplicados: (duplicados: string[]) => `重複したコマンドが検出されました: ${[...new Set(duplicados)].join(", ")}`,
  handlerAnonimo: (comandoNome: string) => `コマンド「${comandoNome}」のハンドラーは匿名関数です。デバッグと追跡を容易にするため、名前付き関数を優先してください。`,
  handlerMuitosParametros: (comandoNome: string | undefined, paramContagem: number) => `コマンド${comandoLabel(comandoNome)}のハンドラーにはパラメータが多すぎます（${paramContagem}個）。インターフェースの簡素化を検討してください。`,
  handlerMuitoLongo: (comandoNome: string | undefined, statements: number) => `コマンド${comandoLabel(comandoNome)}のハンドラーが長すぎます（${statements}文）。補助関数の抽出を検討してください。`,
  handlerSemTryCatch: (comandoNome: string | undefined) => `コマンド${comandoLabel(comandoNome)}のハンドラーにtry/catchブロックがありません。エラーを明示的に処理することを推奨します。`,
  handlerSemFeedback: (comandoNome: string | undefined) => `コマンド${comandoLabel(comandoNome)}のハンドラーがログ出力やユーザー応答をしていません。フィードバック/ログの追加を検討してください。`,
  multiplosComandos: (count: number) => `このファイルに複数のコマンドが登録されています（${count}個）。保守性向上のため、各コマンドを独立したモジュールに分離することを検討してください。`
} as const;
