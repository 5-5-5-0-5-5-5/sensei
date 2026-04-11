// SPDX-License-Identifier: MIT

export const CliFormatarExtraMensagens = {
  titulo: '🧽 フォーマット',
  scanOnlyAtivo: 'SCAN_ONLYが有効です。フォーマットコマンドはコンテンツの読み取りが必要です。',
  falhaFormatar: '{arquivo} のフォーマットに失敗しました: {erro}',
  errosEncontrados: 'エラー: {total}件',
  precisaFormatacao: 'フォーマットが必要なファイルが {total}件見つかりました。適用するには --write を使用してください。',
  tudoFormatado: 'すべてフォーマット済みです。',
  arquivosFormatados: '{total}ファイルをフォーマットしました。',
  nenhumaMudanca: '変更不要です。',
} as const;
