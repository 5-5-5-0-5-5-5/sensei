export const LicensasMensagens = {
  generatedNotices: 'Generated notices:',
  disclaimerInserted: 'Disclaimer inserted into files:',
  missingDisclaimer: 'Missing disclaimer in files:',
  allIncludeDisclaimer: 'All markdown files include the disclaimer.',
  erroObterLicenca: 'Failed to obtain license information via cache, API or npx',
  disclaimerNaoEncontrado: 'Disclaimer not found: {caminho}',
  validacaoContexto: '[Validation] Failed{contexto}, using fallback',
  exclusaoInsegura: '⚠️ Some exclusion patterns were considered unsafe and were ignored: {padroes}',
  erroValidarSeguranca: '⚠️ Error validating correction safety {fixId}: {erro}',
  detectorMarkdownPath: 'detector-markdown: fullPath not provided for {arquivo}',
} as const;
