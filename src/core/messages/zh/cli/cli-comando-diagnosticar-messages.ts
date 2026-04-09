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
  detalheIncludePatterns: (count: number, joined: string) => `包含模式: ${count} (${joined})`,
  detalheExcludePatterns: (count: number, joined: string) => `排除模式: ${count} (${joined})`,
  detalheExport: (relDir: string) => `Export: 摘要已保存在 ./${relDir} (default).`,
  detalheExportFull: 'Export-full: generates gzip shards and a manifest (can be large). Use only when you need the full dump.',
  detalheLogLevel: (logNivel: string) => `log-level: ${String(logNivel)} (使用--log-level debug获得更多详细信息)`,
  dicaPrefiraLogLevelDebug: 'Tip: prefer --log-level debug instead of legacy --debug/--dev.',
  dicaAutoFixConservative: 'Tip: --auto-fix-conservative is a shortcut; prefer using explicitly --auto-fix --auto-fix-mode conservative for clarity.',
  spinnerExecutando: '[SCAN] Diagnosis in progress...',
  spinnerFase: (titulo: string) => `[扫描] ${titulo}...`,
  spinnerConcluido: 'Diagnosis completed.',
  spinnerFalhou: 'Diagnosis failed.'
} as const;
