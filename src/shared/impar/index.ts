// SPDX-License-Identifier: MIT

export * from './formater.js';
export * from './formatter-registry.js';
export * from './stylelint.js';
export * from './svgs.js';
export * from './syntax-map.js';

export type { FormatadorMinimoResult, FormatadorMinimoParser, MarkdownFenceMatch } from '@';
export type { FormatterFn } from './formatter-registry.js';

export { registerFormatter, getFormatterForPath } from './formatter-registry.js';
export { getRegisteredFormatter } from './formater.js';
export { getSyntaxInfoForPath } from './syntax-map.js';

export { formatarPrettierMinimo } from './formater.js';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerEspacosFinaisPorLinha } from './formatters/utils.js';
import { getFormatterForPath } from './formatter-registry.js';

export function formatarCodeMinimo(code: string, opts?: {
  normalizarSeparadoresDeSecao?: boolean;
  relPath?: string;
  parser?: string;
}) {
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

