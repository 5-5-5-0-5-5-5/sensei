// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom, limitarLinhasEmBranco } from './utils.js';

export function formatarKotlinMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let inMultilineString = false;
  let inMultilineComment = false;
  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    if (inMultilineString) {
      out.push(trimmed);
      if (trimmed.includes('"""')) {
        inMultilineString = false;
      }
      continue;
    }
    if (trimmed.includes('"""') && !trimmed.endsWith('"""')) {
      out.push(trimmed);
      inMultilineString = true;
      continue;
    }
    if (inMultilineComment) {
      out.push(trimmed);
      if (trimmed.includes('*/')) {
        inMultilineComment = false;
      }
      continue;
    }
    if (trimmed.startsWith('/*')) {
      out.push(trimmed);
      if (!trimmed.includes('*/')) {
        inMultilineComment = true;
      }
      continue;
    }
    if (trimmed.startsWith('//')) {
      out.push(trimmed);
      continue;
    }
    if (!trimmed.trim()) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    const closeCount = (trimmed.match(/[})\\]]/g) || []).length;
    const openCount = (trimmed.match(/[{(\[]/g) || []).length;
    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      indent = Math.max(0, indent - 1);
    }
    const line = `${'    '.repeat(indent)}${trimmed}`;
    out.push(line);
    if (openCount > closeCount) {
      indent += openCount - closeCount;
    }
  }
  const { code: limitado } = limitarLinhasEmBranco(out.join('\n'), 2);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'kotlin',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-kotlin',
  };
}