// SPDX-License-Identifier: MIT

import { XMLValidator } from 'fast-xml-parser';

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom, removerEspacosFinaisPorLinha } from './utils.js';

function tokenizeXml(src: string): Array<{
  kind: 'tag' | 'text';
  value: string;
}> {
  const re = /(<\?[\s\S]*?\?>|<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<!DOCTYPE[\s\S]*?>|<\/?[^>\n]+?>)/gi;
  const out: Array<{
    kind: 'tag' | 'text';
    value: string;
  }> = [];
  let last = 0;
  for (const m of src.matchAll(re)) {
    const start = m.index ?? -1;
    if (start < 0) continue;
    if (start > last) out.push({
      kind: 'text',
      value: src.slice(last, start)
    });
    out.push({
      kind: 'tag',
      value: m[0] ?? ''
    });
    last = start + (m[0]?.length ?? 0);
  }
  if (last < src.length) out.push({
    kind: 'text',
    value: src.slice(last)
  });
  return out;
}

function normalizeXmlTagToken(tag: string): {
  tag: string;
  changed: boolean;
} {
  if (tag.startsWith('<!--') || tag.startsWith('<![CDATA[')) return {
    tag,
    changed: false
  };
  if (tag.startsWith('<?')) return {
    tag,
    changed: false
  };
  if (tag.startsWith('<!')) return {
    tag,
    changed: false
  };
  let out = tag;
  const original = tag;
  out = out.replace(/^<\s+/, '<');
  out = out.replace(/^<\/\s+/, '</');
  out = out.replace(/\s+\/>$/, '/>');
  out = out.replace(/\s+>$/, '>');
  let buf = '';
  let inQuote: '"' | "'" | null = null;
  let prevWasSpace = false;
  for (let i = 0; i < out.length; i++) {
    const ch = out[i] ?? '';
    if (inQuote) {
      buf += ch;
      if (ch === inQuote) inQuote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      inQuote = ch as '"' | "'";
      buf += ch;
      prevWasSpace = false;
      continue;
    }
    if (/\s/.test(ch)) {
      if (!prevWasSpace) {
        buf += ' ';
        prevWasSpace = true;
      }
      continue;
    }
    prevWasSpace = false;
    buf += ch;
  }
  out = buf;
  out = out.replace(/^<\s+/, '<');
  out = out.replace(/^<\/\s+/, '</');
  out = out.replace(/\s+\/>$/, '/>');
  out = out.replace(/\s+>$/, '>');
  return {
    tag: out,
    changed: out !== original
  };
}

function hasXmlMixedContent(tokens: Array<{
  kind: 'tag' | 'text';
  value: string;
}>): boolean {
  for (const t of tokens) {
    if (t.kind !== 'text') continue;
    if (/[\S]/.test(t.value)) return true;
  }
  return false;
}

function prettyPrintXmlIfSafe(xml: string): {
  xml: string;
  changed: boolean;
} {
  const tokens = tokenizeXml(xml);
  if (hasXmlMixedContent(tokens)) return {
    xml,
    changed: false
  };
  let changed = false;
  let indent = 0;
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));
  const outLines: string[] = [];
  const pushLine = (line: string) => {
    if (!line) return;
    outLines.push(line);
  };
  for (const tok of tokens) {
    if (tok.kind === 'text') {
      continue;
    }
    const raw = tok.value.trim();
    if (!raw) continue;
    const isClosing = /^<\//.test(raw);
    const isSelfClosing = /\/>$/.test(raw);
    const isDecl = /^<\?xml\b/i.test(raw) || /^<\?/.test(raw);
    const isDoctype = /^<!DOCTYPE\b/i.test(raw);
    const isComment = /^<!--/.test(raw);
    const isCdata = /^<!\[CDATA\[/.test(raw);
    if (isClosing) indent = Math.max(0, indent - 1);
    const line = `${indentStr(indent)}${raw}`;
    pushLine(line);
    if (!isClosing && !isSelfClosing && !isDecl && !isDoctype && !isComment && !isCdata) {
      indent += 1;
    }
  }
  const out = `${outLines.join('\n').trimEnd()}\n`;
  if (out !== xml) changed = true;
  return {
    xml: out,
    changed
  };
}

export function formatarXmlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const semEspacosFinais = removerEspacosFinaisPorLinha(normalized);
  const tokens = tokenizeXml(semEspacosFinais);
  let changedTokens = false;
  const rebuilt = tokens.map(t => {
    if (t.kind === 'text') return t.value;
    const r = normalizeXmlTagToken(t.value);
    if (r.changed) changedTokens = true;
    return r.tag;
  }).join('');
  let pretty = rebuilt;
  let changedPretty = false;
  const valid = XMLValidator.validate(pretty);
  if (valid === true) {
    const pp = prettyPrintXmlIfSafe(pretty);
    pretty = pp.xml;
    changedPretty = pp.changed;
  } else {
    pretty = `${pretty.trimEnd()}\n`;
  }
  const formatted = normalizarNewlinesFinais(pretty);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'xml',
    formatted,
    changed: formatted !== baseline,
    reason: changedPretty ? 'xml-pretty' : changedTokens ? 'xml-normalizacao-tags' : 'normalizacao-basica'
  };
}