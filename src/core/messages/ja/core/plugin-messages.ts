// SPDX-License-Identifier: MIT
// @prometheus-disable seguranca vulnerabilidade-seguranca
/**
 * Plugin Analyst Messages
 *
 * Centralizes all plugin messages:
 * - React
 * - React Hooks
 * - Tailwind
 * - CSS
 * - HTML
 * - Python
 */

  /* -------------------------- REACT MESSAGES -------------------------- */

export const ReactMensagens = {
  linkTargetBlank: 'Link with target="_blank" without rel="noreferrer"/"noopener".',
  dangerouslySetInnerHTML: 'Use of dangerouslySetInnerHTML found; validate the need.',
  imgWithoutAlt: 'Image without alt attribute (accessibility).',
  httpFetch: 'HTTP call without TLS detected; prefer HTTPS.',
  hardcodedCredential: 'Possible hardcoded credential; use environment variables.',
  locationHrefRedirect: 'Direct assignment to location.href; validate origin to prevent open redirect.',
  listItemNoKey: 'Item in list (map) without key attribute.',
  indexAsKey: 'Using index as key (may cause reordering issues).',
  inlineHandlerJsx: 'Inline handler detected in JSX; prefer stable functions (useCallback) or extract outside render.',
  deprecatedLifecycleMethod: (name: string) => `Deprecated lifecycle method: ${name}. Use componentDidMount, componentDidUpdate or hooks.`,
  complexInlineStyles: 'Complex inline styles detected. Consider using CSS modules or styled-components for better performance and organization.'
} as const;

  /* -------------------------- REACT HOOKS MESSAGES -------------------------- */

export const ReactHooksMensagens = {
  useEffectNoDeps: 'useEffect without dependency array (evaluate deps to avoid loops).',
  memoCallbackNoDeps: 'Hook without dependency array (useMemo/useCallback).',
  hookInConditional: 'Hook declared inside conditional (breaks Rules of Hooks).'
} as const;

  /* -------------------------- TAILWIND MESSAGES -------------------------- */

export const TailwindMensagens = {
  conflictingClasses: (key: string, tokens: string[]) => `Possible conflict ${key} (${tokens.slice(0, 4).join(', ')}). Check for duplicates.`,
  repeatedClass: (token: string) => `Repeated class detected (${token}). Consider removing redundancy.`,
  importantUsage: (token: string) => `Use of ! (important) detected in (${token}). Prefer utility classes or scope reinforcement instead of important.`,
  variantConflict: (prop: string, variants: string[]) => `Possible variant conflict for ${prop} (variants: ${variants.slice(0, 6).join(', ')}). Check order/scope.`,
  dangerousArbitraryValue: (token: string) => `Arbitrary value with potentially dangerous url (${token}). Avoid javascript:/data:text/html.`,
  arbitraryValue: (token: string) => `Class with arbitrary value (${token}). Confirm it aligns with the design.`
} as const;

  /* -------------------------- CSS MESSAGES -------------------------- */

export const CssMensagens = {
  duplicatePropertySame: (prop: string) => `Duplicated property with identical value (${prop}): error detected.`,
  duplicatePropertyDifferent: (prop: string, prev: string, curr: string) => `Duplicated property (${prop}) with different values. Possible エラー: "${prev}" vs "${curr}".`,
  importantUsage: 'Use of !important detected; prefer adequate specificity.',
  httpImport: 'HTTP import detected; prefer HTTPS or local bundling.',
  httpUrl: 'External resource via HTTP in url(); prefer HTTPS.',
  unifySelectors: (selectors: string[], propsCount: number) => `Identical CSS rules (${propsCount} properties) in selectors (${selectors.slice(0, 6).join(', ')}). Consider unifying/centralizing into a utility class or shared selector.`,
  idSelectorPreferClass: (selector: string) => `ID selector (${selector}) detected. For reuse and consistency, prefer classes when possible.`,
  invalidProperty: (prop: string) => `Invalid or unknown CSS property (${prop}). Check spelling or browser support.`,
  malformedSelector: (selector: string) => `Malformed or invalid CSS selector (${selector}). May cause rendering issues.`,
  emptyRule: 'Empty CSS rule detected. Remove rules without declarations.',
  vendorPrefixDeprecated: (prop: string) => `Deprecated vendor prefix (${prop}). Use standard properties when supported.`,
  cssHackDetected: (hack: string) => `CSS hack detected (${hack}). Consider modern approaches or feature queries.`
} as const;

  /* -------------------------- HTML MESSAGES -------------------------- */

export const HtmlMensagens = {
  // Structure
  doctype: 'Document without <!DOCTYPE html> declared.',
  htmlLang: '<html> element without lang attribute (accessibility).',
  metaCharset: 'Missing <meta charset="utf-8"> in document.',
  viewport: 'Missing viewport meta for responsiveness.',
  title: 'Document without <title> defined.',
  // Links
  linkTargetBlank: 'Link with target="_blank" without rel="noreferrer"/"noopener".',
  linkNoHref: 'Link without valid href or handler (UX). Use <button> or role="button".',
  // Images
  imgWithoutAlt: 'Image without alt attribute or accessibility (WCAG 2.1).',
  imgWithoutLoading: 'Image without loading attribute (performance). Consider loading="lazy".',
  imgWithoutDimensions: 'Image without width/height (layout shift). Set dimensions to prevent CLS.',
  // Forms
  formWithoutMethod: 'Form without method specified (GET/POST).',
  formWithoutAction: 'Form without action or data-attribute for processing.',
  inputWithoutLabel: 'Input without name, id or aria-label (accessibility/usability).',
  passwordWithoutAutocomplete: 'Password field without autocomplete specified (security).',
  inputWithoutType: 'Input without type specified (assumes text, but be explicit).',
  // Handlers
  inlineHandler: 'Inline handler detected (on*). Prefer external listeners or data-attributes with JS.',
  // Scripts/Styles
  inlineScript: 'Inline script detected. Prefer external files for better caching and CSP.',
  inlineStyle: 'Inline style detected. Prefer external CSS files for better caching.',
  scriptWithoutDefer: 'Script without defer/async. May block rendering; consider defer.',
  // Accessibility
  headingSkipped: (current: number, expected: number) => `Skipped heading: h${current} without preceding h${expected} (semantic structure).`,
  buttonWithoutText: 'Button without text or aria-label (accessibility).',
  tableWithoutCaption: 'Table without <caption> or aria-label (accessibility).',
  iframeWithoutTitle: 'Iframe without title (accessibility).',
  // Performance
  largeInlineScript: 'Very large inline script. Move to external file.',
  multipleH1: 'Multiple <h1> detected. Use only one per page for SEO/accessibility.'
} as const;

  /* -------------------------- XML MESSAGES -------------------------- */

export const XmlMensagens = {
  xmlPrologAusente: 'XML without <?xml ...?> declaration (optional, but improves compatibility).',
  doctypeDetectado: 'XML contains <!DOCTYPE>. Watch out for XXE vectors (external entities).',
  doctypeExternoDetectado: 'XML contains DOCTYPE with external identifier (SYSTEM/PUBLIC). High XXE risk if parser is not secure.',
  entidadeDetectada: 'XML contains <!ENTITY>. Review if there is expansion/XXE risk.',
  entidadeExternaDetectada: 'XML contains external entity (SYSTEM/PUBLIC). High XXE risk if parser is not secure.',
  entidadeParametroDetectada: 'XML contains parameter entity (<!ENTITY % ...>). May be used for XXE/DTD injection; review carefully.',
  xincludeDetectado: 'XML contains XInclude (<xi:include>). May load external resources; validate origin and parser.',
  namespaceUndeclared: (prefix: string) => `Namespace prefix "${prefix}" used without xmlns:${prefix} declaration.`,
  invalidXmlStructure: 'Invalid XML structure detected (unclosed or poorly nested tags).',
  encodingMismatch: (declared: string, detected: string) => `Declared encoding (${declared}) does not match detected (${detected}).`,
  largeEntityExpansion: 'Possible entity with very large expansion. Risk of Billion Laughs attack.',
  cdataInAttribute: 'CDATA detected in attribute value (invalid in XML).'
} as const;

  /* -------------------------- FORMATTER MESSAGES (MIN) -------------------------- */

export const FormatadorMensagens = {
  naoFormatado: (parser: string, detalhes?: string) => {
    const base = `ファイル appears to be unformatted (parser: ${parser}). Consider normalizing with Prometheus formatter.`;
    if (!detalhes) return base;
    return `${base} (${detalhes})`;
  },
  parseErro: (parser: string, err: string) => `Failed to validate internal formatting (parser: ${parser}): ${err}`
} as const;

  /* -------------------------- SVG MESSAGES (OPTIMIZATION) -------------------------- */

export const SvgMensagens = {
  naoPareceSvg: 'File .svg does not contain a valid <svg> tag.',
  semViewBox: 'SVG without viewBox detected (may harm responsiveness).',
  scriptInline: 'SVG contains <script>. Security risk: avoid SVGs with embedded script.',
  eventoInline: 'SVG contains inline handlers (on*). Avoid inline events in assets.',
  javascriptUrl: 'SVG contains javascript: in URL/href. Security risk.',
  podeOtimizar: (originalBytes: number, optimizedBytes: number, mudancas: string[]) => `SVG can be optimized (${originalBytes}B → ${optimizedBytes}B). Changes: ${mudancas.join(', ')}.`
} as const;

  /* -------------------------- CSS-IN-JS MESSAGES -------------------------- */

export const CssInJsMensagens = {
  detectedStyledComponents: 'styled-components patterns detected (CSS-in-JS).',
  detectedStyledJsx: 'styled-jsx patterns detected (CSS-in-JS in React).',
  globalStyles: (fonte: 'styled-components' | 'styled-jsx') => `Global styles detected (${fonte}). Prefer local scope when possible.`,
  importantUsage: 'Use of !important in CSS-in-JS detected; prefer adequate specificity.',
  httpUrl: 'External resource via HTTP in url(); prefer HTTPS.'
} as const;

  /* -------------------------- PYTHON MESSAGES -------------------------- */

export const PythonMensagens = {
  // Imports & Dependencies
  missingTypeHints: 'Function without type hints detected; add type hints for better readability.',
  hardcodedString: (string: string) => `Hardcoded string detected (${string.slice(0, 30)}...); consider using constants.`,
  httpWithoutVerify: 'HTTP request without verify=True detected; validate SSL certificates.',
  sqlInjection: 'Possible SQL injection detected; use prepared statements.',
  // Code Quality
  broadExcept: 'Generic exception (except:) detected; be specific.',
  bareRaise: 'raise without context detected; always pass the exception to maintain stack trace.',
  passInExcept: 'pass in except block; implement appropriate error handling.',
  // Best Practices
  printInsteadOfLog: 'print() detected; prefer logging module for production.',
  evalUsage: 'eval() detected; avoid using eval - security vulnerability.',
  execUsage: 'exec() detected; avoid using exec - security vulnerability.',
  subprocessShellTrue: 'subprocess with shell=True detected; risk of command injection. Prefer args list and shell=False.',
  pickleUsage: 'pickle load(s) detected; never deserialize untrusted data (RCE). Prefer safe formats (JSON).',
  yamlUnsafeLoad: 'yaml.load without safe Loader detected; prefer yaml.safe_load (prevents execution).',
  globalKeyword: 'Use of global keyword detected; prefer passing as parameter.',
  mutableDefault: 'Argument with mutable default value (list/dict) detected; use None as default.',
  // Performance
  listComprehensionOpportunity: 'Loop that could be list comprehension detected.',
  loopingOverDict: 'Iteration over dict without .items(); consider using .items().'
} as const;

  /* -------------------------- Severity Levels -------------------------- */

export const SeverityNiveis = {
  error: 'error',
  warning: 'warning',
  info: 'info',
  suggestion: 'suggestion'
} as const;

  /* -------------------------- Analyst Categories/Types -------------------------- */

export const AnalystTipos = {
  react: 'react/rule',
  reactHooks: 'react-hooks/rule',
  tailwind: 'tailwindcss/rule',
  css: 'css/rule',
  html: 'html/rule',
  python: 'python/rule',
  xml: 'xml/rule',
  formatador: 'formatter/rule',
  svg: 'svg/rule',
  cssInJs: 'css-in-js/rule'
} as const;
export const AnalystOrigens = {
  react: 'analyst-react',
  reactHooks: 'analyst-react-hooks',
  tailwind: 'analyst-tailwind',
  css: 'analyst-css',
  html: 'analyst-html',
  python: 'analyst-python',
  xml: 'analyst-xml',
  formatador: 'analyst-formatter',
  svg: 'analyst-svg',
  cssInJs: 'analyst-css-in-js'
} as const;
