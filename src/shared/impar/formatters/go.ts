// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom, limitarLinhasEmBranco } from './utils.js';

export function formatarGoMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let inComment = false;
  let inString = false;
  let stringChar = '';
  let inBacktick = false;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('//')) {
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }
    if (trimmed.startsWith('/*')) {
      inComment = true;
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      if (trimmed.endsWith('*/')) inComment = false;
      continue;
    }
    if (inComment) {
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      if (trimmed.endsWith('*/')) inComment = false;
      continue;
    }
    if (inBacktick) {
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      if (trimmed.endsWith('`')) inBacktick = false;
      continue;
    }
    if (trimmed.includes('`') && !trimmed.endsWith('`')) {
      inBacktick = true;
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }
    const singleQuotes = (trimmed.match(/(?<!\\)'/g) || []).length;
    const doubleQuotes = (trimmed.match(/(?<!\\)"/g) || []).length;
    if (singleQuotes % 2 === 1) {
      inString = true;
      stringChar = "'";
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }
    if (doubleQuotes % 2 === 1) {
      inString = true;
      stringChar = '"';
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }
    if (inString) {
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      if (trimmed.endsWith(stringChar) && !trimmed.endsWith(`\\${stringChar}`)) inString = false;
      continue;
    }
    const closeBraces = (trimmed.match(/}/g) || []).length;
    const openBraces = (trimmed.match(/{/g) || []).length;
    if (trimmed.startsWith('}') || trimmed.startsWith(')')) {
      indent = Math.max(0, indent - 1);
    }
    const line = `${'  '.repeat(indent)}${trimmed}`;
    out.push(line);
    if (trimmed.endsWith('{') || (openBraces > closeBraces)) {
      indent += openBraces - closeBraces;
    }
  }
  const { code: limitado } = limitarLinhasEmBranco(out.join('\n'), 2);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'go',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-go',
  };
}