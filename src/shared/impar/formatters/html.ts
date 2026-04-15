// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { formatarJavaScriptMinimo } from './code.js';
import { formatarCssMinimo } from './css.js';
import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

const HTML_VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const HTML_BLOCK_ELEMENTS = new Set([
  'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
  'div', 'section', 'article', 'aside', 'header', 'footer', 'nav',
  'main', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'form', 'fieldset', 'blockquote', 'pre', 'figure', 'figcaption',
  'details', 'summary', 'dialog', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'dl', 'dt', 'dd',
]);

function isHtmlVoidTag(tagName: string): boolean {
  return HTML_VOID_ELEMENTS.has(tagName.toLowerCase());
}

function isHtmlBlockTag(tagName: string): boolean {
  return HTML_BLOCK_ELEMENTS.has(tagName.toLowerCase());
}

function extractTagName(tag: string): string | null {
  const m = tag.match(/^<\/?([a-zA-Z][\w-]*)/);
  return m?.[1] ?? null;
}

function normalizeHtmlTag(tag: string): string {
  let out = tag;
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
  return out;
}

function tokenizeHtml(src: string): Array<{ kind: 'tag' | 'text' | 'script' | 'style' | 'comment'; value: string }> {
  const re = /(<!--[\s\S]*?-->)|(<script\b[^>]*>[\s\S]*?<\/script>)|(<style\b[^>]*>[\s\S]*?<\/style>)|(<\/?[^>]+?>)/gi;
  const out: Array<{ kind: 'tag' | 'text' | 'script' | 'style' | 'comment'; value: string }> = [];
  let last = 0;
  for (const m of src.matchAll(re)) {
    const start = m.index ?? -1;
    if (start < 0) continue;
    if (start > last) {
      const text = src.slice(last, start);
      if (text.trim()) out.push({ kind: 'text', value: text });
    }
    if (m[1]) {
      out.push({ kind: 'comment', value: m[1] });
    } else if (m[2]) {
      out.push({ kind: 'script', value: m[2] });
    } else if (m[3]) {
      out.push({ kind: 'style', value: m[3] });
    } else {
      out.push({ kind: 'tag', value: m[4] ?? '' });
    }
    last = start + (m[0]?.length ?? 0);
  }
  if (last < src.length) {
    const remaining = src.slice(last);
    if (remaining.trim()) out.push({ kind: 'text', value: remaining });
  }
  return out;
}

export function formatarHtmlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens = tokenizeHtml(normalized);
  const outLines: string[] = [];
  let indent = 0;
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));
  let i = 0;
  while (i < tokens.length) {
    const tok = tokens[i];
    if (!tok) {
      i++;
      continue;
    }

    if (tok.kind === 'comment') {
      outLines.push(indentStr(indent) + tok.value.trim());
      i++;
      continue;
    }

    if (tok.kind === 'script' || tok.kind === 'style') {
      const isScript = tok.kind === 'script';
      const openTagMatch = tok.value.match(/^(<(?:script|style)\b[^>]*>)/i);
      const closeTagMatch = tok.value.match(/(<\/(?:script|style)>)$/i);
      if (openTagMatch && closeTagMatch) {
        const openTag = normalizeHtmlTag(openTagMatch[1]);
        const closeTag = normalizeHtmlTag(closeTagMatch[1]);
        const innerContent = tok.value.slice(openTagMatch[1].length, -closeTagMatch[1].length);
        outLines.push(indentStr(indent) + openTag);
        if (innerContent.trim()) {
          let formattedInner = innerContent;
          if (isScript) {
            const res = formatarJavaScriptMinimo(innerContent, 'inline.js');
            if (res.ok) formattedInner = res.formatted;
          } else {
            const res = formatarCssMinimo(innerContent);
            if (res.ok) formattedInner = res.formatted;
          }
          const lines = formattedInner.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              outLines.push(indentStr(indent + 1) + line);
            } else {
              outLines.push('');
            }
          }
        }
        outLines.push(indentStr(indent) + closeTag);
      } else {
        outLines.push(indentStr(indent) + tok.value);
      }
      i++;
      continue;
    }

    if (tok.kind === 'text') {
      const trimmed = tok.value.replace(/\s+/g, ' ').trim();
      if (trimmed) {
        outLines.push(indentStr(indent) + trimmed);
      }
      i++;
      continue;
    }

    const tag = normalizeHtmlTag(tok.value);
    const tagName = extractTagName(tag);
    const isClosing = tag.startsWith('</');
    const isSelfClosing = tag.endsWith('/>');
    const isVoid = tagName ? isHtmlVoidTag(tagName) : false;
    const isBlock = tagName ? isHtmlBlockTag(tagName) : false;
    const isDoctype = /^<!doctype/i.test(tag);
    if (isDoctype) {
      outLines.push(indentStr(indent) + tag);
      i++;
      continue;
    }
    if (isVoid || isSelfClosing) {
      outLines.push(indentStr(indent) + tag);
      i++;
      continue;
    }
    if (isClosing) {
      if (indent > 0) indent--;
      outLines.push(indentStr(indent) + tag);
      i++;
      continue;
    }
    const nextTok = tokens[i + 1];
    const nextNextTok = tokens[i + 2];
    const hasOnlyTextBetween = nextTok && nextTok.kind === 'text' && nextNextTok && nextNextTok.kind === 'tag' && nextNextTok.value.startsWith('</');
    if (hasOnlyTextBetween) {
      const content = nextTok.value.replace(/\s+/g, ' ').trim();
      outLines.push(indentStr(indent) + tag + content + '</' + (tagName ?? '') + '>');
      i += 3;
      continue;
    }
    if (isBlock) {
      outLines.push(indentStr(indent) + tag);
      indent++;
      i++;
      continue;
    }
    outLines.push(indentStr(indent) + tag);
    i++;
  }
  const formatted = normalizarNewlinesFinais(outLines.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'html',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-html',
  };
}
