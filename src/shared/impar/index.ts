// SPDX-License-Identifier: MIT

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerEspacosFinaisPorLinha } from './formatters/utils.js';

export * from './formater.js';
export { getRegisteredFormatter } from './formater.js';
export { formatarPrettierMinimo } from './formater.js';
export type { FormatterFn } from './formatter-registry.js';
export * from './formatter-registry.js';
export { getFormatterForPath,registerFormatter } from './formatter-registry.js';
export * from './stylelint.js';
export * from './svgs.js';
export * from './syntax-map.js';
export { getSyntaxInfoForPath } from './syntax-map.js';
export type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';

export function formatarCodeMinimo(code: string, opts?: {
  normalizarSeparadoresDeSecao?: boolean;
  relPath?: string;
  parser?: string;
}): { ok: boolean; parser: string; formatted: string; changed: boolean } {
  const normalized = normalizarFimDeLinha(code);
  const formatted = normalizarNewlinesFinais(
    removerEspacosFinaisPorLinha(normalized),
  );
  return {
    ok: true,
    parser: opts?.parser ?? 'code',
    formatted,
    changed: formatted !== normalizarNewlinesFinais(normalized),
  };
}

