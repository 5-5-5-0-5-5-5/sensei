// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom, removerEspacosFinaisPorLinha } from './utils.js';

const SQL_KEYWORDS = new Set([
  'select', 'from', 'where', 'insert', 'into', 'values', 'update', 'set',
  'delete', 'create', 'table', 'drop', 'alter', 'add', 'column', 'index',
  'join', 'left', 'right', 'inner', 'outer', 'on', 'and', 'or', 'not',
  'in', 'is', 'null', 'as', 'order', 'by', 'group', 'having', 'limit',
  'offset', 'union', 'all', 'distinct', 'case', 'when', 'then', 'else',
  'end', 'exists', 'between', 'like', 'asc', 'desc', 'primary', 'key',
  'foreign', 'references', 'constraint', 'default', 'check', 'unique',
  'if', 'begin', 'commit', 'rollback', 'transaction', 'grant', 'revoke',
  'with', 'recursive', 'over', 'partition', 'window',
]);

export function formatarSqlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens: Array<{ type: 'keyword' | 'ident' | 'string' | 'number' | 'op' | 'punct' | 'ws' | 'comment'; value: string }> = [];
  let i = 0;
  while (i < normalized.length) {
    if (normalized[i] === '-' && normalized[i + 1] === '-') {
      const end = normalized.indexOf('\n', i);
      tokens.push({ type: 'comment', value: end === -1 ? normalized.slice(i) : normalized.slice(i, end) });
      i = end === -1 ? normalized.length : end;
      continue;
    }
    if (normalized[i] === '/' && normalized[i + 1] === '*') {
      const end = normalized.indexOf('*/', i + 2);
      tokens.push({ type: 'comment', value: end === -1 ? normalized.slice(i) : normalized.slice(i, end + 2) });
      i = end === -1 ? normalized.length : end + 2;
      continue;
    }
    if (normalized[i] === "'" || normalized[i] === '"') {
      const q = (normalized[i] ?? '"') as '"' | "'";
      let j = i + 1;
      while (j < normalized.length && normalized[j] !== q) {
        if (normalized[j] === '\\') j++;
        j++;
      }
      tokens.push({ type: 'string', value: normalized.slice(i, j + 1) });
      i = j + 1;
      continue;
    }
    if (/\d/.test(normalized[i] ?? '') && (i === 0 || !/\w/.test(normalized[i - 1] ?? ''))) {
      let j = i;
      while (j < normalized.length && /[\d.]/.test(normalized[j] ?? '')) j++;
      tokens.push({ type: 'number', value: normalized.slice(i, j) });
      i = j;
      continue;
    }
    if (/[a-zA-Z_]/.test(normalized[i] ?? '')) {
      let j = i;
      while (j < normalized.length && /[\w]/.test(normalized[j] ?? '')) j++;
      const word = normalized.slice(i, j);
      tokens.push({ type: SQL_KEYWORDS.has(word.toLowerCase()) ? 'keyword' : 'ident', value: word });
      i = j;
      continue;
    }
    if (/[=<>!+\-*/%&|^~]/.test(normalized[i] ?? '')) {
      let j = i;
      while (j < normalized.length && /[=<>!+\-*/%&|^~]/.test(normalized[j] ?? '')) j++;
      tokens.push({ type: 'op', value: normalized.slice(i, j) });
      i = j;
      continue;
    }
    if (/[(),.;:]/.test(normalized[i] ?? '')) {
      const ch = normalized[i] ?? '';
      tokens.push({ type: 'punct', value: ch });
      i++;
      continue;
    }
    if (/\s/.test(normalized[i] ?? '')) {
      let j = i;
      while (j < normalized.length && /\s/.test(normalized[j] ?? '')) j++;
      tokens.push({ type: 'ws', value: normalized.slice(i, j) });
      i = j;
      continue;
    }
    i++;
  }
  const out: string[] = [];
  let indent = 0;
  let lineStart = true;
  let inSelectClause = false;
  let prevWasKeyword = false;
  for (let t = 0; t < tokens.length; t++) {
    const tok = tokens[t];
    if (!tok) continue;
    if (tok.type === 'comment') {
      if (!lineStart) out.push('\n');
      out.push(`${'  '.repeat(indent)}${tok.value}`);
      lineStart = true;
      continue;
    }
    if (tok.type === 'ws') continue;
    if (tok.type === 'keyword') {
      const upper = tok.value.toUpperCase();
      const majorKeywords = new Set(['SELECT', 'FROM', 'WHERE', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'DROP', 'ALTER', 'ORDER', 'GROUP', 'HAVING', 'LIMIT', 'UNION', 'SET', 'VALUES', 'INTO', 'BEGIN', 'COMMIT', 'ROLLBACK', 'WITH']);
      const joinKeywords = new Set(['JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'CROSS', 'NATURAL']);
      if (majorKeywords.has(upper)) {
        if (upper === 'ORDER' || upper === 'GROUP') {
          const next = tokens[t + 1];
          if (next?.type === 'keyword' && next.value.toUpperCase() === 'BY') {
            if (!lineStart) out.push('\n');
            out.push(`${'  '.repeat(indent)}${upper} BY`);
            t++;
            lineStart = false;
            prevWasKeyword = true;
            continue;
          }
        }
        if (!lineStart) out.push('\n');
        out.push(`${'  '.repeat(indent)}${upper}`);
        lineStart = false;
        prevWasKeyword = true;
        if (upper === 'SELECT') inSelectClause = true;
        continue;
      }
      if (joinKeywords.has(upper)) {
        if (!lineStart) out.push('\n');
        out.push(`${'  '.repeat(indent)}${upper}`);
        lineStart = false;
        prevWasKeyword = true;
        continue;
      }
      if (lineStart) {
        out.push(`${'  '.repeat(indent)}${upper}`);
      } else if (prevWasKeyword) {
        out.push(` ${upper}`);
      } else {
        out.push(` ${upper}`);
      }
      prevWasKeyword = true;
      lineStart = false;
      continue;
    }
    if (tok.type === 'punct') {
      if (tok.value === '(') {
        out.push('(');
        indent++;
        out.push('\n');
        lineStart = true;
        prevWasKeyword = false;
        continue;
      }
      if (tok.value === ')') {
        indent = Math.max(0, indent - 1);
        out.push('\n');
        out.push(`${'  '.repeat(indent)})`);
        lineStart = false;
        prevWasKeyword = false;
        continue;
      }
      if (tok.value === ',') {
        if (inSelectClause) {
          out.push(',\n');
          lineStart = true;
        } else {
          out.push(', ');
        }
        prevWasKeyword = false;
        continue;
      }
      if (tok.value === ';') {
        out.push(';\n\n');
        lineStart = true;
        inSelectClause = false;
        prevWasKeyword = false;
        continue;
      }
      out.push(tok.value);
      prevWasKeyword = false;
      lineStart = false;
      continue;
    }
    if (lineStart) {
      out.push(`${'  '.repeat(indent)}${tok.value}`);
    } else {
      out.push(` ${tok.value}`);
    }
    lineStart = false;
    prevWasKeyword = false;
  }
  const raw = out.join('').replace(/\n{3,}/g, '\n\n').trimEnd();
  const formatted = normalizarNewlinesFinais(raw);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'sql',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-sql',
  };
}