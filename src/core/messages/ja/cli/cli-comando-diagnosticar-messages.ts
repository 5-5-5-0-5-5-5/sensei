// SPDX-License-Identifier: MIT

export const CliComandoDiagnosticarMessages = {
  linhaEmBranco: '',
  fastModeTipo: 'diagnostico',
  sugestoesHeader: '┌── Quick suggestions ─────────────────────────────────────────',
  sugestoesFooter: '└───────────────────────────────────────────────────────────────',
  nenhumaFlagRelevante: 'No relevant flag detected — run with --help to see all.',
  detalheLinha: (texto: string) => `  ${texto}`,
  detalheSaidaEstruturada: 'Structured output: prints JSON (useful for CI). Combine with --export to save file.',
  detalheGuardian: 'Guardian: runs integrity check (recommended for deploys).',
  detalheExecutive: 'Executive: shows only critical issues (ideal for executive meetings).',
  detalheFull: 'Full: generates detailed report locally (can be verbose).',
  detalheFast: 'Fast: parallel processing with Workers (ideal for large projects and CI).',
  detalheCompact: 'Compact: consolidates progress and shows only the essentials.',
  detalheAutoFix: 'Auto-fix: applies quick fixes. Use with caution.',
  detalheAutoFixConservative: 'Shortcut: equivalent to --auto-fix --auto-fix-mode conservative',
  detalheIncludePatterns: (count: number, joined: string) => `パターンを含む: ${count} (${joined})`,
  detalheExcludePatterns: (count: number, joined: string) => `パターンを除外: ${count} (${joined})`,
  detalheExport: (relDir: string) => `Export: 要約が保存されました ./${relDir} (default).`,
  detalheExportFull: 'Export-full: generates gzip shards and a manifest (can be large). Use only when you need the full dump.',
  detalheLogLevel: (logNivel: string) => `log-level: ${String(logNivel)} (より詳細な情報は--log-level debugを使用)`,
  dicaPrefiraLogLevelDebug: 'Tip: prefer --log-level debug instead of legacy --debug/--dev.',
  dicaAutoFixConservative: 'Tip: --auto-fix-conservative is a shortcut; prefer using explicitly --auto-fix --auto-fix-mode conservative for clarity.',
  spinnerExecutando: '[SCAN] Diagnosis in progress...',
  spinnerFase: (titulo: string) => `[スキャン] ${titulo}...`,
  spinnerConcluido: 'Diagnosis completed.',
  spinnerFalhou: 'Diagnosis failed.'
} as const;
export const CliComandoDiagnosticarMensagens = CliComandoDiagnosticarMessages;
