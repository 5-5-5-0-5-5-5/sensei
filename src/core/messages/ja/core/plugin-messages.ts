// SPDX-License-Identifier: MIT
// @prometheus-disable seguranca vulnerabilidade-seguranca
/**
 * プラグインアナリストのメッセージ
 *
 * 以下のすべてのプラグインメッセージを一元化します：
 * - React
 * - React Hooks
 * - Tailwind
 * - CSS
 * - HTML
 * - Python
 */

  /* -------------------------- REACTメッセージ -------------------------- */

export const ReactMensagens = {
  linkTargetBlank: 'target="_blank" のリンクに rel="noreferrer"/"noopener" がありません。',
  dangerouslySetInnerHTML: 'dangerouslySetInnerHTML が使用されています。必要性を確認してください。',
  imgWithoutAlt: '画像に alt 属性がありません（アクセシビリティ）。',
  httpFetch: 'TLSなしのHTTP呼び出しが検出されました。HTTPSを優先してください。',
  hardcodedCredential: 'ハードコードされた認証情報の可能性があります。環境変数を使用してください。',
  locationHrefRedirect: 'location.href への直接代入です。オープンリダイレクトを防ぐため送信元を検証してください。',
  listItemNoKey: 'リストアイテム（map）に key 属性がありません。',
  indexAsKey: 'インデックスを key として使用しています（並べ替えの問題を引き起こす可能性があります）。',
  inlineHandlerJsx: 'JSXにインラインハンドラーが検出されました。安定した関数（useCallback）を優先するか、レンダ―外に抽出してください。',
  deprecatedLifecycleMethod: (name: string) => `非推奨のライフサイクルメソッド: ${name}。componentDidMount、componentDidUpdate、またはフックを使用してください。`,
  complexInlineStyles: '複雑なインラインスタイルが検出されました。パフォーマンスと整理のため、CSSモジュールまたはstyled-componentsの使用を検討してください。'
} as const;

  /* -------------------------- REACT HOOKSメッセージ -------------------------- */

export const ReactHooksMensagens = {
  useEffectNoDeps: 'useEffect に依存配列がありません（ループを避けるため依存関係を確認してください）。',
  memoCallbackNoDeps: 'フックに依存配列がありません（useMemo/useCallback）。',
  hookInConditional: '条件分岐内でフックが宣言されています（フックのルールに違反）。'
} as const;

  /* -------------------------- TAILWINDメッセージ -------------------------- */

export const TailwindMensagens = {
  conflictingClasses: (key: string, tokens: string[]) => `${key} の競合の可能性あり（${tokens.slice(0, 4).join(', ')}）。重複を確認してください。`,
  repeatedClass: (token: string) => `重複したクラスが検出されました（${token}）。冗長性を排除することを検討してください。`,
  importantUsage: (token: string) => `!（important）の使用が検出されました（${token}）。important の代わりにユーティリティクラスまたはスコープの強化を優先してください。`,
  variantConflict: (prop: string, variants: string[]) => `${prop} のバリアント競合の可能性あり（バリアント: ${variants.slice(0, 6).join(', ')}）。順序/スコープを確認してください。`,
  dangerousArbitraryValue: (token: string) => `潜在的に危険な url を含む任意の値（${token}）。javascript:/data:text/html は避けてください。`,
  arbitraryValue: (token: string) => `任意の値を含むクラス（${token}）。デザインと一致しているか確認してください。`
} as const;

  /* -------------------------- CSSメッセージ -------------------------- */

export const CssMensagens = {
  duplicatePropertySame: (prop: string) => `同一値の重複プロパティ（${prop}）: エラーが検出されました。`,
  duplicatePropertyDifferent: (prop: string, prev: string, curr: string) => `異なる値の重複プロパティ（${prop}）。エラーの可能性: "${prev}" 対 "${curr}"。`,
  importantUsage: '!important の使用が検出されました。適切な詳細度を優先してください。',
  httpImport: 'HTTPインポートが検出されました。HTTPSまたはローカルバンドルを優先してください。',
  httpUrl: 'url() 内のHTTP経由外部リソース。HTTPSを優先してください。',
  unifySelectors: (selectors: string[], propsCount: number) => `同一のCSSルール（${propsCount}個のプロパティ）がセレクター（${selectors.slice(0, 6).join(', ')}）にあります。ユーティリティクラスまたは共有セレクターへの統合・一元化を検討してください。`,
  idSelectorPreferClass: (selector: string) => `IDセレクター（${selector}）が検出されました。再利用性と一貫性のため、可能な限りクラスを優先してください。`,
  invalidProperty: (prop: string) => `無効または不明なCSSプロパティ（${prop}）。綴りまたはブラウザーのサポートを確認してください。`,
  malformedSelector: (selector: string) => `不正または無効なCSSセレクター（${selector}）。レンダリングの問題を引き起こす可能性があります。`,
  emptyRule: '空のCSSルールが検出されました。宣言のないルールは削除してください。',
  vendorPrefixDeprecated: (prop: string) => `非推奨のベンダープレフィックス（${prop}）。サポートされている場合は標準プロパティを使用してください。`,
  cssHackDetected: (hack: string) => `CSSハックが検出されました（${hack}）。最新のアプローチまたはフィーチャークエリを検討してください。`
} as const;

  /* -------------------------- HTMLメッセージ -------------------------- */

export const HtmlMensagens = {
  // 構造
  doctype: '<!DOCTYPE html> が宣言されていません。',
  htmlLang: '<html> 要素に lang 属性がありません（アクセシビリティ）。',
  metaCharset: 'ドキュメントに <meta charset="utf-8"> がありません。',
  viewport: 'レスポンシブ対応の viewport メタがありません。',
  title: 'ドキュメントに <title> が定義されていません。',
  // リンク
  linkTargetBlank: 'target="_blank" のリンクに rel="noreferrer"/"noopener" がありません。',
  linkNoHref: '有効な href またはハンドラーのないリンク（UX）。<button> または role="button" を使用してください。',
  // 画像
  imgWithoutAlt: '画像に alt 属性またはアクセシビリティ設定がありません（WCAG 2.1）。',
  imgWithoutLoading: '画像に loading 属性がありません（パフォーマンス）。loading="lazy" の使用を検討してください。',
  imgWithoutDimensions: '画像に width/height がありません（レイアウトシフト）。CLS を防ぐため寸法を定義してください。',
  // フォーム
  formWithoutMethod: 'フォームに method が指定されていません（GET/POST）。',
  formWithoutAction: 'フォームに action または処理用の data-attribute がありません。',
  inputWithoutLabel: '入力フィールドに name、id、または aria-label がありません（アクセシビリティ/ユーザビリティ）。',
  passwordWithoutAutocomplete: 'パスワードフィールドに autocomplete が指定されていません（セキュリティ）。',
  inputWithoutType: '入力フィールドに type が指定されていません（text が想定されますが、明示してください）。',
  // ハンドラー
  inlineHandler: 'インラインハンドラー（on*）が検出されました。外部リスナーまたは JS 付き data-attribute を優先してください。',
  // スクリプト/スタイル
  inlineScript: 'インラインスクリプトが検出されました。より良いキャッシングと CSP のため外部ファイルを優先してください。',
  inlineStyle: 'インラインスタイルが検出されました。より良いキャッシングのため外部CSSファイルを優先してください。',
  scriptWithoutDefer: 'スクリプトに defer/async がありません。レンダリングをブロックする可能性があります。defer を検討してください。',
  // アクセシビリティ
  headingSkipped: (current: number, expected: number) => `見出しがスキップされました: h${current} の前に h${expected} がありません（セマンティック構造）。`,
  buttonWithoutText: 'ボタンにテキストまたは aria-label がありません（アクセシビリティ）。',
  tableWithoutCaption: 'テーブルに <caption> または aria-label がありません（アクセシビリティ）。',
  iframeWithoutTitle: 'iframe に title がありません（アクセシビリティ）。',
  // パフォーマンス
  largeInlineScript: 'インラインスクリプトが大きすぎます。外部ファイルに移動してください。',
  multipleH1: '複数の <h1> が検出されました。SEO/アクセシビリティのため、1ページに1つだけ使用してください。'
} as const;

  /* -------------------------- XMLメッセージ -------------------------- */

export const XmlMensagens = {
  xmlPrologAusente: 'XML に <?xml ...?> 宣言がありません（任意ですが、互換性が向上します）。',
  doctypeDetectado: 'XML に <!DOCTYPE> が含まれています。XXE ベクター（外部エンティティ）に注意してください。',
  doctypeExternoDetectado: 'XML に外部識別子（SYSTEM/PUBLIC）付きの DOCTYPE が含まれています。パーサーが安全でない場合、XXE リスクが高くなります。',
  entidadeDetectada: 'XML に <!ENTITY> が含まれています。展開/XXE のリスクがないか確認してください。',
  entidadeExternaDetectada: 'XML に外部エンティティ（SYSTEM/PUBLIC）が含まれています。パーサーが安全でない場合、XXE リスクが高くなります。',
  entidadeParametroDetectada: 'XML にパラメータエンティティ（<!ENTITY % ...>）が含まれています。XXE/DTD インジェクションに使用される可能性があります。注意して確認してください。',
  xincludeDetectado: 'XML に XInclude（<xi:include>）が含まれています。外部リソースを読み込む可能性があります。送信元とパーサーを検証してください。',
  namespaceUndeclared: (prefix: string) => `名前空間プレフィックス "${prefix}" が xmlns:${prefix} 宣言なしで使用されています。`,
  invalidXmlStructure: '無効な XML 構造が検出されました（閉じられていないタグ、または不適切なネスト）。',
  encodingMismatch: (declared: string, detected: string) => `宣言されたエンコーディング（${declared}）が検出されたエンコーディング（${detected}）と一致しません。`,
  largeEntityExpansion: '非常に大きな展開を持つエンティティの可能性。Billion Laughs 攻撃のリスク。',
  cdataInAttribute: '属性値に CDATA が検出されました（XML で無効）。'
} as const;

  /* -------------------------- フォーマッターメッセージ（最小限） -------------------------- */

export const FormatadorMensagens = {
  naoFormatado: (parser: string, detalhes?: string) => {
    const base = `ファイルがフォーマットされていない可能性があります（パーサー: ${parser}）。Prometheus フォーマッターで正規化することを検討してください。`;
    if (!detalhes) return base;
    return `${base}（${detalhes}）`;
  },
  parseErro: (parser: string, err: string) => `内部フォーマットの検証に失敗しました（パーサー: ${parser}）: ${err}`
} as const;

  /* -------------------------- SVGメッセージ（最適化） -------------------------- */

export const SvgMensagens = {
  naoPareceSvg: '.svg ファイルに有効な <svg> タグが含まれていません。',
  semViewBox: 'SVG に viewBox がありません（レスポンシブ対応に悪影響を与える可能性があります）。',
  scriptInline: 'SVG に <script> が含まれています。セキュリティリスク: 埋め込みスクリプト付き SVG は避けてください。',
  eventoInline: 'SVG にインラインハンドラー（on*）が含まれています。アセットのインラインイベントは避けてください。',
  javascriptUrl: 'SVG の URL/href に javascript: が含まれています。セキュリティリスク。',
  podeOtimizar: (originalBytes: number, optimizedBytes: number, mudancas: string[]) => `SVG を最適化できます（${originalBytes}B → ${optimizedBytes}B）。変更: ${mudancas.join(', ')}。`
} as const;

  /* -------------------------- CSS-IN-JSメッセージ -------------------------- */

export const CssInJsMensagens = {
  detectedStyledComponents: 'styled-components パターンが検出されました（CSS-in-JS）。',
  detectedStyledJsx: 'styled-jsx パターンが検出されました（React の CSS-in-JS）。',
  globalStyles: (fonte: 'styled-components' | 'styled-jsx') => `グローバルスタイルが検出されました（${fonte}）。可能であればローカルスコープを優先してください。`,
  importantUsage: 'CSS-in-JS で !important の使用が検出されました。適切な詳細度を優先してください。',
  httpUrl: 'url() 内のHTTP経由外部リソース。HTTPSを優先してください。'
} as const;

  /* -------------------------- PYTHONメッセージ -------------------------- */

export const PythonMensagens = {
  // インポートと依存関係
  missingTypeHints: '型ヒントのない関数が検出されました。可読性向上のため型ヒントを追加してください。',
  hardcodedString: (string: string) => `ハードコードされた文字列が検出されました（${string.slice(0, 30)}...）。定数の使用を検討してください。`,
  httpWithoutVerify: 'verify=True なしでHTTPリクエストが検出されました。SSL証明書を検証してください。',
  sqlInjection: 'SQL インジェクションの可能性が検出されました。プリペアドステートメントを使用してください。',
  // コード品質
  broadExcept: '汎用例外（except:）が検出されました。具体的に指定してください。',
  bareRaise: 'コンテキストなしの raise が検出されました。スタックトレースを維持するため、必ず例外を渡してください。',
  passInExcept: 'except ブロック内の pass。適切なエラー処理を実装してください。',
  // ベストプラクティス
  printInsteadOfLog: 'print() が検出されました。本番環境では logging モジュールを優先してください。',
  evalUsage: 'eval() が検出されました。eval の使用は避けてください - セキュリティ脆弱性。',
  execUsage: 'exec() が検出されました。exec の使用は避けてください - セキュリティ脆弱性。',
  subprocessShellTrue: 'shell=True の subprocess が検出されました。コマンドインジェクションのリスク。引数リストと shell=False を優先してください。',
  pickleUsage: 'pickle load(s) が検出されました。信頼できないデータの逆シリアル化は絶対に行わないでください（RCE）。安全なフォーマット（JSON）を優先してください。',
  yamlUnsafeLoad: '安全な Loader なしで yaml.load が検出されました。yaml.safe_load を優先してください（実行を防止）。',
  globalKeyword: 'global キーワードの使用が検出されました。パラメータとして渡すことを優先してください。',
  mutableDefault: '変更可能なデフォルト値（list/dict）を持つ引数が検出されました。デフォルトとして None を使用してください。',
  // パフォーマンス
  listComprehensionOpportunity: 'リスト内包表記にできるループが検出されました。',
  loopingOverDict: '.items() なしで dict を反復処理しています。.items() の使用を検討してください。'
} as const;

  /* -------------------------- 重要度レベル -------------------------- */

export const SeverityNiveis = {
  error: 'エラー',
  warning: '警告',
  info: '情報',
  suggestion: '提案'
} as const;

  /* -------------------------- アナリストカテゴリ/型 -------------------------- */

export const AnalystTipos = {
  react: 'react/ルール',
  reactHooks: 'react-hooks/ルール',
  tailwind: 'tailwindcss/ルール',
  css: 'css/ルール',
  html: 'html/ルール',
  python: 'python/ルール',
  xml: 'xml/ルール',
  formatador: 'フォーマッター/ルール',
  svg: 'svg/ルール',
  cssInJs: 'css-in-js/ルール'
} as const;
export const AnalystOrigens = {
  react: 'アナリスト-react',
  reactHooks: 'アナリスト-react-hooks',
  tailwind: 'アナリスト-tailwind',
  css: 'アナリスト-css',
  html: 'アナリスト-html',
  python: 'アナリスト-python',
  xml: 'アナリスト-xml',
  formatador: 'アナリスト-フォーマッター',
  svg: 'アナリスト-svg',
  cssInJs: 'アナリスト-css-in-js'
} as const;
