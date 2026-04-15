// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

export function formatarJsonMinimo(code: string): FormatadorMinimoResult {
  try {
    const normalizedInput = normalizarFimDeLinha(removerBom(code));
    const parsed = JSON.parse(normalizedInput) as unknown;
    const formatted = normalizarNewlinesFinais(JSON.stringify(parsed, null, 2));
    const normalizedForComparison = normalizarNewlinesFinais(normalizedInput);
    const changed = formatted !== normalizedForComparison;
    return {
      ok: true,
      parser: 'json',
      formatted,
      changed
    };
  } catch (err) {
    return {
      ok: false,
      parser: 'json',
      error: err instanceof Error ? err.message : String(err)
    };
  }
}