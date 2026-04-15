// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { limitarLinhasEmBranco,normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

export function formatarShellMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let inHereDoc = false;
  let hereDocDelimiter = '';
  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    if (inHereDoc) {
      out.push(trimmed);
      if (trimmed.trim() === hereDocDelimiter) {
        inHereDoc = false;
        hereDocDelimiter = '';
      }
      continue;
    }
    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('#')) {
      out.push(trimmed);
      continue;
    }
    const hereDocMatch = trimmed.match(/<<-?\s*['"]?(\w+)['"]?/);
    if (hereDocMatch) {
      inHereDoc = true;
      hereDocDelimiter = hereDocMatch[1] ?? '';
      out.push(trimmed);
      continue;
    }
    out.push(trimmed.replace(/[ \t]+$/, ''));
  }
  const { code: limitedBlanks } = limitarLinhasEmBranco(out.join('\n'), 2);
  const formatted = normalizarNewlinesFinais(limitedBlanks);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'shell',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-shell',
  };
}