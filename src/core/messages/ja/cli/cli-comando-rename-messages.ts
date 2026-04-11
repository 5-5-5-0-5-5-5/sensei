// SPDX-License-Identifier: MIT

export const CliComandoRenameMensagens = {
  descricao: 'names/内のマッピングファイルに基づいて変数のリネームを適用します。',
  nenhumArquivoMapeamento: '{pasta}にマッピングファイルがありません。先に {comando}コマンドを実行してください。',
  pastaNaoEncontrada: 'マッピングフォルダが見つかりません: {pasta}。先に {comando}コマンドを実行してください。',
  nenhumMapeamento: '翻訳マッピングが見つかりません（形式: 1行につき oldName = newName）。',
  conflitoMapeamento: '"{nome}" のマッピング競合: {arquivo}は "{novo}" を使用、以前は "{anterior}" でした（最後の設定が優先）。',
  iniciandoRenomeacao: '変数のリネームを開始します（{total}件のマッピング）...',
  arquivoAtualizado: '更新済み: {arquivo}',
  renomeacaoConcluida: 'リネームが完了しました! {total}ファイルを更新しました。',
} as const;
