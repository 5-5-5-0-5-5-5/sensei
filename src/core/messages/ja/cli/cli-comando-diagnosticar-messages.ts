// SPDX-License-Identifier: MIT

export const CliComandoDiagnosticarMensagens = {
  linhaEmBranco: '',
  fastModeTipo: 'diagnostico',
  sugestoesHeader: '┌── クイック提案 ─────────────────────────────────────────',
  sugestoesFooter: '└───────────────────────────────────────────────────────────────',
  nenhumaFlagRelevante: '関連するフラグは検出されませんでした -- すべてのフラグを表示するには --help を実行してください。',
  detalheLinha: (texto: string) => `  ${texto}`,
  detalheSaidaEstruturada: '構造化出力: JSONを出力します（CIに便利）。--export と組み合わせてファイルに保存してください。',
  detalheGuardian: 'Guardian: 整合性チェックを実行します（デプロイに推奨）。',
  detalheExecutive: 'エグゼクティブ: 重大な問題のみを表示します（経営会議に最適）。',
  detalheFull: 'フル: 詳細なレポートをローカルに生成します（冗長になる場合があります）。',
  detalheFast: '高速: Workerによる並列処理（大規模プロジェクトとCIに最適）。',
  detalheCompact: 'コンパクト: プログレスを統合し、 essential な項目のみを表示します。',
  detalheAutoFix: '自動修正: クイック修正を適用します。注意して使用してください。',
  detalheAutoFixConservative: 'ショートカット: --auto-fix --auto-fix-mode conservative と同等',
  detalheIncludePatterns: (count: number, joined: string) => `含めるパターン: ${count}件 (${joined})`,
  detalheExcludePatterns: (count: number, joined: string) => `除外パターン: ${count}件 (${joined})`,
  detalheExport: (relDir: string) => `エクスポート: 要約が ./${relDir} に保存されます（デフォルト）。`,
  detalheExportFull: 'エクスポート-フル: gzipシャードとマニフェストを生成します（大容量になる場合があります）。完全なダンプが必要な場合のみ使用してください。',
  detalheLogLevel: (logNivel: string) => `ログレベル: ${String(logNivel)}（詳細な情報を表示するには --log-level debug を使用）`,
  dicaPrefiraLogLevelDebug: 'ヒント: レガシーな --debug/--dev の代わりに --log-level debug を使用してください。',
  dicaAutoFixConservative: 'ヒント: --auto-fix-conservative はショートカットです。明確性のために --auto-fix --auto-fix-mode conservative を明示的に使用してください。',
  spinnerExecutando: '[スキャン] 診断を実行中...',
  spinnerFase: (titulo: string) => `[スキャン] ${titulo}...`,
  spinnerConcluido: '診断が完了しました。',
  spinnerFalhou: '診断に失敗しました。'
} as const;
