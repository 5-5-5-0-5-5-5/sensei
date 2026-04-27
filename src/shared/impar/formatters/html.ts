// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { formatarJavaScriptMinimo } from './code.js';
import { formatarCssMinimo } from './css.js';
import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

/* ═══════════════════════════════════════════════════════════════
   CONSTANTES
   ═══════════════════════════════════════════════════════════════ */

const HTML_VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const HTML_BLOCK_ELEMENTS = new Set([
  'html', 'head', 'body', 'title', 'meta', 'link', 'script', 'style',
  'div', 'section', 'article', 'aside', 'header', 'footer', 'nav',
  'main', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th',
  'form', 'fieldset', 'blockquote', 'pre', 'figure', 'figcaption',
  'details', 'summary', 'dialog', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'dl', 'dt', 'dd', 'colgroup', 'caption', 'picture', 'video',
  'audio', 'canvas', 'map', 'object', 'template', 'noscript',
  'select', 'option', 'optgroup', 'textarea', 'button', 'datalist',
]);

const HTML_INLINE_ELEMENTS = new Set([
  'a', 'abbr', 'b', 'bdi', 'bdo', 'cite', 'code', 'data', 'dfn',
  'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's', 'samp',
  'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr',
  'label',
]);

/* ═══════════════════════════════════════════════════════════════
   TIPOS
   ═══════════════════════════════════════════════════════════════ */

type HtmlTokenKind = 'tag' | 'text' | 'script' | 'style' | 'comment' | 'pre' | 'doctype';
type HtmlToken = { kind: HtmlTokenKind; value: string };
type HtmlTag = {
  raw: string;
  name: string | null;
  attrs: Array<{ name: string; value: string }>;
  isClosing: boolean;
  isSelfClosing: boolean;
  isVoid: boolean;
  isBlock: boolean;
  isInline: boolean;
};

/* ═══════════════════════════════════════════════════════════════
   HELPER FUNCTIONS
   ═══════════════════════════════════════════════════════════════ */

function extractTagName(tag: string): string | null {
  const m = tag.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)/);
  return m?.[1] ?? null;
}

function parseTagAttributes(tagContent: string): Array<{ name: string; value: string }> {
  const attrs: Array<{ name: string; value: string }> = [];

  // Skip tag name at the start
  const afterTagName = tagContent.replace(/^[a-zA-Z][a-zA-Z0-9-]*/, '');

  if (!afterTagName.trim()) return attrs;

  // Match only actual attributes (name=value or just name)
  const regex = /\s*([a-zA-Z][a-zA-Z0-9-]*)(?:=(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  let m;

  while ((m = regex.exec(afterTagName)) !== null) {
    const name = m[1];
    if (!name) continue;
    const value = m[2] ?? m[3] ?? m[4] ?? '';
    attrs.push({ name, value });
  }

  return attrs;
}

function buildTagString(name: string, attrs: Array<{ name: string; value: string }>, isClosing: boolean, isSelfClosing: boolean): string {
  const parts: string[] = [];

  if (isClosing) {
    parts.push('</');
  } else {
    parts.push('<');
  }

  parts.push(name);

  if (!isClosing) {
    for (const attr of attrs) {
      if (attr.value) {
        parts.push(` ${attr.name}="${attr.value}"`);
      } else {
        parts.push(` ${attr.name}`);
      }
    }

    if (isSelfClosing) {
      parts.push('/');
    }
  }

  parts.push('>');

  return parts.join('');
}

function normalizeHtmlTag(tag: string): string {
  let out = tag;

  // Clean up ALL spacing around angle brackets
  out = out.replace(/\s*<\s*/g, '<');
  out = out.replace(/\s*>\s*/g, '>');
  out = out.replace(/\s*\/\s*>/g, '/>');

  // Normalize whitespace inside the tag (but preserve quoted attribute values)
  let buf = '';
  let inQuote: '"' | "'" | null = null;
  let prevWasSpace = false;
  let afterOpenBracket = false;
  let justHadQuote = false;

  for (let i = 0; i < out.length; i++) {
    const ch = out[i] ?? '';

    // Track position relative to angle bracket
    if (ch === '<' || ch === '/') {
      afterOpenBracket = true;
      justHadQuote = false;
    } else if (ch === '>') {
      afterOpenBracket = false;
      justHadQuote = false;
    }

    if (inQuote) {
      buf += ch;
      if (ch === inQuote) {
        inQuote = null;
        justHadQuote = true;
      }
      continue;
    }

    if (ch === '"' || ch === "'") {
      inQuote = ch as '"' | "'";
      buf += ch;
      prevWasSpace = false;
      afterOpenBracket = false;
      continue;
    }

    if (/\s/.test(ch)) {
      // Skip space right after < or </ or before >
      // But allow space after a quote (e.g., <div class="foo">)
      if (afterOpenBracket && !justHadQuote) continue;
      if (!prevWasSpace) {
        buf += ' ';
        prevWasSpace = true;
      }
      continue;
    }

    prevWasSpace = false;
    afterOpenBracket = false;
    justHadQuote = false;
    buf += ch;
  }

  return buf;
}

function parseTag(raw: string): HtmlTag {
  const isClosing = raw.startsWith('</');
  const isSelfClosing = raw.endsWith('/>') && !raw.endsWith('/>');
  const tagName = extractTagName(raw);
  const isVoid = tagName ? HTML_VOID_ELEMENTS.has(tagName.toLowerCase()) : false;
  const isBlock = tagName ? HTML_BLOCK_ELEMENTS.has(tagName.toLowerCase()) : false;
  const isInline = tagName ? HTML_INLINE_ELEMENTS.has(tagName.toLowerCase()) : false;

  // Extract content between < and > for attribute parsing
  const contentMatch = raw.match(/^<\/?([a-zA-Z][a-zA-Z0-9-]*)([^>]*)>?$/);
  const attrsStr = contentMatch?.[2] ?? '';
  const attrs = parseTagAttributes(attrsStr);

  return {
    raw,
    name: tagName,
    attrs,
    isClosing,
    isSelfClosing: isSelfClosing || isVoid,
    isVoid,
    isBlock,
    isInline,
  };
}

/* ═══════════════════════════════════════════════════════════════
   TOKENIZER
   ═══════════════════════════════════════════════════════════════ */

function tokenizeHtml(src: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];

  // Match comments (including permissive --!> ending), pre, script, style, and tags
  const re = /(<!--[\s\S]*?--!?>)|(<pre\b[^>]*>[\s\S]*?<\/pre>)|(<script\b[^>]*>[\s\S]*?<\/script>)|(<style\b[^>]*>[\s\S]*?<\/style>)|(<\/?[^>]+?>)/gi;
  let last = 0;

  for (const m of src.matchAll(re)) {
    const start = m.index ?? -1;
    if (start < 0) continue;

    if (start > last) {
      const text = src.slice(last, start);
      if (text.trim()) {
        tokens.push({ kind: 'text', value: text });
      }
    }

    if (m[1]) {
      tokens.push({ kind: 'comment', value: m[1] });
    } else if (m[2]) {
      tokens.push({ kind: 'pre', value: m[2] });
    } else if (m[3]) {
      tokens.push({ kind: 'script', value: m[3] });
    } else if (m[4]) {
      tokens.push({ kind: 'style', value: m[4] });
    } else if (m[5]) {
      const tag = m[5];
      if (/^<!doctype/i.test(tag)) {
        tokens.push({ kind: 'doctype', value: tag });
      } else {
        tokens.push({ kind: 'tag', value: tag });
      }
    }

    last = start + (m[0]?.length ?? 0);
  }

  if (last < src.length) {
    const remaining = src.slice(last);
    if (remaining.trim()) {
      tokens.push({ kind: 'text', value: remaining });
    }
  }

  return tokens;
}

/* ═══════════════════════════════════════════════════════════════
   FORMATTER
   ═══════════════════════════════════════════════════════════════ */

const MAX_INLINE_LENGTH = 80;
const MAX_ATTRIBUTES_PER_LINE = 3;

export function formatarHtmlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens = tokenizeHtml(normalized);

  const outLines: string[] = [];
  let indent = 0;
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));
  let i = 0;
  let _lastWasBlock = false;

  while (i < tokens.length) {
    const tok = tokens[i];
    if (!tok) { i++; continue; }

    /* ═══════════════════════════════════════════════════════════════
       COMMENTS
       ═══════════════════════════════════════════════════════════════ */
    if (tok.kind === 'comment') {
      const commentLines = tok.value.trim().split('\n');
      for (const cl of commentLines) {
        outLines.push(indentStr(indent) + cl.trim());
      }
      _lastWasBlock = false;
      i++;
      continue;
    }

    /* ═══════════════════════════════════════════════════════════════
       DOCTYPE
       ═══════════════════════════════════════════════════════════════ */
    if (tok.kind === 'doctype') {
      outLines.push(indentStr(indent) + tok.value.toUpperCase());
      _lastWasBlock = false;
      i++;
      continue;
    }

    /* ═══════════════════════════════════════════════════════════════
       PRE BLOCKS (preserve content as-is)
       ═══════════════════════════════════════════════════════════════ */
    if (tok.kind === 'pre') {
      const openTagMatch = tok.value.match(/^(<pre\b[^>]*>)/i);
      const closeTagMatch = tok.value.match(/(<\/pre>)$/i);

      if (openTagMatch && closeTagMatch) {
        const openTag = normalizeHtmlTag(openTagMatch[1]);
        const closeTag = closeTagMatch[1];
        const innerContent = tok.value.slice(openTagMatch[1].length, -closeTagMatch[1].length);

        outLines.push(indentStr(indent) + openTag);

        const preLines = innerContent.split('\n');
        for (const pl of preLines) {
          outLines.push(pl);
        }

        outLines.push(indentStr(indent) + closeTag);
      } else {
        outLines.push(indentStr(indent) + tok.value);
      }

      i++;
      continue;
    }

    /* ═══════════════════════════════════════════════════════════════
       SCRIPT / STYLE
       ═══════════════════════════════════════════════════════════════ */
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

          const contentLines = formattedInner.split('\n');
          for (const line of contentLines) {
            if (line.trim()) {
              outLines.push(indentStr(indent + 1) + line.trim());
            }
          }
        }

        outLines.push(indentStr(indent) + closeTag);
      } else {
        outLines.push(indentStr(indent) + tok.value);
      }

      _lastWasBlock = true;
      i++;
      continue;
    }

    /* ═══════════════════════════════════════════════════════════════
       TEXT
       ═══════════════════════════════════════════════════════════════ */
    if (tok.kind === 'text') {
      // Normalize whitespace but preserve meaningful spacing
      const trimmed = tok.value.replace(/\s+/g, ' ').trim();
      if (trimmed) {
        // If we're inside an inline element, just return trimmed content
        // The parent tag handling will include it
        outLines.push(indentStr(indent) + trimmed);
      }
      _lastWasBlock = false;
      i++;
      continue;
    }

    /* ═══════════════════════════════════════════════════════════════
       TAGS
       ═══════════════════════════════════════════════════════════════ */
    const tag = parseTag(normalizeHtmlTag(tok.value));
    const isInline = tag.name ? HTML_INLINE_ELEMENTS.has(tag.name.toLowerCase()) : false;

    // Void / self-closing tags
    if (tag.isVoid || tag.isSelfClosing) {
      const tagStr = buildTagString(tag.name ?? '', tag.attrs, false, tag.isVoid || tag.isSelfClosing);
      outLines.push(indentStr(indent) + tagStr);
      _lastWasBlock = tag.isBlock;
      i++;
      continue;
    }

    // Closing tag
    if (tag.isClosing) {
      if (indent > 0) indent--;
      outLines.push(indentStr(indent) + tag.raw);
      _lastWasBlock = tag.isBlock;
      i++;
      continue;
    }

    // Check for inline element with text content - keep on same line
    const nextTok = tokens[i + 1];
    const nextNextTok = tokens[i + 2];

    // For inline tags: check if the pattern is <inline>text</inline> or <inline>text</inline>moreText
    if (isInline && nextTok?.kind === 'text' && nextNextTok?.kind === 'tag' && nextNextTok.value.startsWith('</')) {
      const closeTagName = extractTagName(nextNextTok.value);
      if (closeTagName?.toLowerCase() === tag.name?.toLowerCase()) {
        const content = nextTok.value.replace(/\s+/g, ' ').trim();
        const tagStr = buildTagString(tag.name ?? '', tag.attrs, false, false);

        // Check if we have more content after the closing tag
        const followingTok = tokens[i + 3];
        if (followingTok?.kind === 'text') {
          // <inline>text</inline>moreText - put text inline, then continue
          outLines.push(`${indentStr(indent)}${tagStr}${content}</${tag.name}>${followingTok.value.replace(/\s+/g, ' ').trim()}`);
          i += 4;
          _lastWasBlock = false;
          continue;
        } else {
          // Just <inline>text</inline> - keep inline
          outLines.push(`${indentStr(indent)}${tagStr}${content}</${tag.name}>`);
          i += 3;
          _lastWasBlock = false;
          continue;
        }
      }
    }

    // Check for block tags with short text content
    if (tag.isBlock && nextTok?.kind === 'text' && nextNextTok?.kind === 'tag' && nextNextTok.value.startsWith('</')) {
      const closeTagName = extractTagName(nextNextTok.value);
      if (closeTagName?.toLowerCase() === tag.name?.toLowerCase()) {
        const content = nextTok.value.replace(/\s+/g, ' ').trim();

        // Keep inline if content is short and no/many attributes
        if (content.length <= MAX_INLINE_LENGTH && tag.attrs.length <= MAX_ATTRIBUTES_PER_LINE) {
          const tagStr = buildTagString(tag.name ?? '', tag.attrs, false, false);
          outLines.push(`${indentStr(indent)}${tagStr}${content}</${tag.name}>`);
          i += 3;
          _lastWasBlock = false;
          continue;
        }

        // Multiple attrs - format each on its own line
        if (tag.attrs.length > MAX_ATTRIBUTES_PER_LINE) {
          outLines.push(`${indentStr(indent)  }<${tag.name}`);
          for (const attr of tag.attrs) {
            const attrStr = attr.value
              ? ` ${attr.name}="${attr.value}"` 
              : ` ${attr.name}`;
            outLines.push(indentStr(indent + 1) + attrStr);
          }
          outLines.push(`${indentStr(indent)  }>${content}</${tag.name}>`);
          i += 3;
          _lastWasBlock = false;
          continue;
        }

        // Content too long or other case - treat as block
        if (tag.attrs.length > 0) {
          const attrsStr = tag.attrs.map(a => a.value ? ` ${a.name}="${a.value}"` : ` ${a.name}`).join('');
          outLines.push(`${indentStr(indent)  }<${tag.name}${attrsStr}>`);
        } else {
          outLines.push(`${indentStr(indent)  }<${tag.name}>`);
        }
        indent++;
        i += 3;
        _lastWasBlock = true;
        continue;
      }
    }

    // Opening block tag - indent children
    if (tag.isBlock) {
      // Format tag with attributes
      if (tag.attrs.length > 0 && tag.attrs.length <= MAX_ATTRIBUTES_PER_LINE) {
        const attrsStr = tag.attrs.map(a => a.value ? ` ${a.name}="${a.value}"` : ` ${a.name}`).join('');
        outLines.push(`${indentStr(indent)  }<${tag.name}${attrsStr}>`);
      } else if (tag.attrs.length > MAX_ATTRIBUTES_PER_LINE) {
        outLines.push(`${indentStr(indent)  }<${tag.name}`);
        for (const attr of tag.attrs) {
          const attrStr = attr.value
            ? ` ${attr.name}="${attr.value}"` 
            : ` ${attr.name}`;
          outLines.push(indentStr(indent + 1) + attrStr);
        }
        outLines.push(`${indentStr(indent)  }>`);
      } else {
        outLines.push(`${indentStr(indent)  }<${tag.name}>`);
      }

      indent++;
      _lastWasBlock = true;
      i++;
      continue;
    }

    // Unknown / other tags - just output normalized tag
    const tagStr = buildTagString(tag.name ?? '', tag.attrs, tag.isClosing, tag.isSelfClosing);
    outLines.push(indentStr(indent) + tagStr);
    void (_lastWasBlock = false);
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
