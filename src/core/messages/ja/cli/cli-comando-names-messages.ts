// SPDX-License-Identifier: MIT

export const CliComandoNamesMensagens = {
  descricao: 'リポジトリをスキャンして変数名を検索し、マッピングファイルを生成します（names/内に断片化された構造）。',
  opcaoAgregado: '単一の names/name.txt も生成します（古いフローとの互換性）。',
  iniciandoVarredura: '変数名のスキャンを開始します...',
  avisoErroProcessar: '[警告] {arquivo} の処理中にエラーが発生しました',
  varreduraConcluidaFragmentada: 'スキャン完了! {arquivos}ファイル中{variaveis}個の変数。断片化されたマッピングは{pastaFragmentada}に、集約は{pastaAgregada}に保存されました。',
  varreduraConcluidaEspelhada: 'スキャン完了! {arquivos}ファイル中{variaveis}個の変数。マッピングは{pasta}に保存されました（ミラー構造）。',
} as const;
