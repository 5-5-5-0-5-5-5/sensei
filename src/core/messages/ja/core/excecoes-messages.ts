// SPDX-License-Identifier: MIT

/**
 * @fileoverview Prometheusコアの例外・エラーステータスメッセージ。
 * CLI、プラグイン、アナリスト、バリデーション、セキュリティ、永続化、スキーマ、
 * スキャナー、ロールバック、レポートに関連するエラーメッセージを一元化します。
 */

export const ExcecoesMensagens = {
  // CLI
  exit1: 'exit:1',
  requireMutateFsAutoFix: '自動修正は利用できません',
  autoFixTimeout: (timeoutMs: number) => `自動修正が${timeoutMs}ms後にタイムアウトしました`,
  // プラグイン / セーフインポート
  pluginsDesabilitadosSafeMode: 'SAFE_MODEではプラグインの読み込みが無効です。許可するには PROMETHEUS_ALLOW_PLUGINS=1 を設定してください。',
  pluginBloqueado: (erro: string) => `プラグインがブロックされました: ${erro}`,
  caminhoPluginNaoResolvido: 'プラグインパスが解決できませんでした',
  // プラグインレジストリ
  pluginRegistradoNaoPodeSerObtido: (name: string) => `プラグイン ${name} は登録されていますが取得できません`,
  pluginCarregandoPromiseNaoPodeSerObtida: (name: string) => `プラグイン ${name} は読み込み中ですがpromiseを取得できません`,
  naoFoiPossivelCarregarPlugin: (name: string, errMsg: string) => `プラグイン「${name}」を読み込めませんでした: ${errMsg}`,
  pluginDeveTerNomeValido: 'プラグインには有効な名前が必要です',
  pluginDeveTerVersaoValida: 'プラグインには有効なバージョンが必要です',
  pluginDeveDefinirPeloMenosUmaExtensao: 'プラグインは少なくとも1つの拡張機能を定義する必要があります',
  pluginDeveImplementarMetodoParse: 'プラグインは parse() メソッドを実装する必要があります',
  // 型/アナリスト
  definicaoAnalistaInvalida: '無効なアナリスト定義です',
  analistaSemFuncaoAplicar: (nome: string) => `アナリスト ${nome} に apply 関数がありません`,
  // バリデーション / セキュリティ
  caminhoForaDaCwdNaoPermitido: (p: string) => `CWD外のパスは許可されていません: ${p}`,
  persistenciaNegadaForaRaizProjeto: (caminho: string) => `永続化が拒否されました: プロジェクトルートの外のパス: ${caminho}`,
  // 永続化（環境）
  fsWriteFileBinaryIndisponivel: '現在の環境では fs.writeFile（バイナリ）は利用できません',
  fsReadFileIndisponivel: '現在の環境では fs.readFile は利用できません',
  fsWriteFileIndisponivel: '現在の環境では fs.writeFile は利用できません',
  fsRenameIndisponivel: '現在の環境では fs.rename は利用できません',
  fsMkdirIndisponivel: '現在の環境では fs.mkdir は利用できません',
  // スキーマ
  versaoSchemaDesconhecida: (versao: string) => `不明なスキーマバージョン: ${versao}`,
  relatorioSchemaInvalido: (erros: string) => `無効なスキーマのレポート: ${erros}`,
  // ファイルレジストリ
  arquivoNaoEncontrado: (fileCaminho: string) => `ファイルが見つかりません: ${fileCaminho}`,
  validacaoFalhouPara: (fileCaminho: string) => `${fileCaminho} のバリデーションに失敗しました`,
  erroAoLer: (fileCaminho: string, errMsg: string) => `${fileCaminho} の読み込みエラー: ${errMsg}`,
  erroAoEscrever: (fileCaminho: string, errMsg: string) => `${fileCaminho} の書き込みエラー: ${errMsg}`,
  erroAoDeletar: (fileCaminho: string, errMsg: string) => `${fileCaminho} の削除エラー: ${errMsg}`,
  // スキャナー
  statIndefinidoPara: (fullCaminho: string) => `${fullCaminho} の stat が未定義です`,
  // ロールバック
  mapaReversaoCorrompido: 'ロールバックマップが破損しています',
  // レポート
  semPkg: 'pkg なし'
} as const;
