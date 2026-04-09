// SPDX-License-Identifier: MIT

export const CliFormatarExtraMensagens = {
  titulo: '🧽 FORMAT',
  scanOnlyAtivo: 'SCAN_ONLY active; the format command needs to read content.',
  falhaFormatar: 'Failed to format {arquivo}: {erro}',
  errosEncontrados: 'Errors: {total}',
  precisaFormatacao: 'Found {total} file(s) that need formatting. Use --write to apply.',
  tudoFormatado: 'All formatted.',
  arquivosFormatados: 'Formatted {total} file(s).',
  nenhumaMudanca: 'No changes needed.',
} as const;
