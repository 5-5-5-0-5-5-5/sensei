// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

function tokenizeCssBlocks(src: string): Array<{ kind: 'rule' | 'at-rule' | 'comment' | 'text'; value: string }> {
  const out: Array<{ kind: 'rule' | 'at-rule' | 'comment' | 'text'; value: string }> = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] === '/' && src[i + 1] === '*') {
      const end = src.indexOf('*/', i + 2);
      if (end === -1) {
        out.push({ kind: 'comment', value: src.slice(i) });
        break;
      }
      out.push({ kind: 'comment', value: src.slice(i, end + 2) });
      i = end + 2;
    }
    else if (src[i] === '"') {
      const strStart = i;
      i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === '"') { i++; break; }
        i++;
      }
      out.push({ kind: 'rule', value: src.slice(strStart, i) });
    }
    else if (src[i] === "'") {
      const strStart = i;
      i++;
      while (i < src.length) {
        if (src[i] === '\\') { i += 2; continue; }
        if (src[i] === "'") { i++; break; }
        i++;
      }
      out.push({ kind: 'rule', value: src.slice(strStart, i) });
    }
    else if (src[i] === '(') {
      const parenStart = i;
      let parenDepth = 1;
      i++;
      while (i < src.length && parenDepth > 0) {
        if (src[i] === '(') parenDepth++;
        else if (src[i] === ')') parenDepth--;
        i++;
      }
      out.push({ kind: 'rule', value: src.slice(parenStart, i) });
    }
    else if (src[i] === '@') {
      let depth = 0;
      const atStart = i;
      let blockStarted = false;
      while (i < src.length) {
        if (src[i] === '(') {
          let parenDepth = 1;
          i++;
          while (i < src.length && parenDepth > 0) {
            if (src[i] === '(') parenDepth++;
            else if (src[i] === ')') parenDepth--;
            i++;
          }
          continue;
        }
        if (src[i] === '{') {
          depth++;
          blockStarted = true;
        }
        if (src[i] === '}') {
          if (depth === 0) {
            i++;
            break;
          }
          depth--;
          if (depth === 0 && blockStarted) {
            i++;
            break;
          }
        }
        if (src[i] === ';' && depth === 0) {
          i++;
          break;
        }
        i++;
      }
      out.push({ kind: 'at-rule', value: src.slice(atStart, i) });
    }
    else if (src[i] === '{' || src[i] === '}' || src[i] === ';') {
      out.push({ kind: 'text', value: src[i] });
      i++;
    }
    else {
      const ruleStart = i;
      while (i < src.length &&
        src[i] !== '{' &&
        src[i] !== '}' &&
        src[i] !== ';' &&
        src[i] !== '@' &&
        !(src[i] === '/' && src[i + 1] === '*')
      ) {
        i++;
      }
      const chunk = src.slice(ruleStart, i);
      if (chunk.trim()) {
        out.push({ kind: 'rule', value: chunk });
      }
    }
  }
  return out;
}

function findColonOutsideParens(str: string): number {
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    else if (str[i] === ':' && depth === 0) return i;
  }
  return -1;
}

type CssItem = { kind: 'prop'; prop: string; value: string } | { kind: 'comment'; text: string } | { kind: 'block'; selector: string; items: CssItem[] };

function parseCssTokens(tokenList: Array<{ kind: string; value: string }>): CssItem[] {
  const items: CssItem[] = [];
  let currentSelector = '';
  function flushSelector() {
    if (currentSelector.trim()) {
      items.push({ kind: 'block', selector: currentSelector.trim(), items: [] });
      currentSelector = '';
    }
  }
  let idx = 0;
  while (idx < tokenList.length) {
    const tok = tokenList[idx];
    if (!tok) break;
    if (tok.kind === 'comment') {
      items.push({ kind: 'comment', text: tok.value.trim() });
      idx++;
      continue;
    }
    if (tok.kind === 'text') {
      if (tok.value === '{') {
        flushSelector();
        const lastBlock = items[items.length - 1];
        if (lastBlock?.kind === 'block') {
          idx++;
          const innerTokens: Array<{ kind: string; value: string }> = [];
          let depth = 1;
          while (idx < tokenList.length) {
            const innerTok = tokenList[idx];
            if (!innerTok) break;
            if (innerTok.kind === 'text') {
              if (innerTok.value === '{') depth++;
              else if (innerTok.value === '}') depth--;
            }
            if (depth > 0) innerTokens.push(innerTok);
            idx++;
          }
          lastBlock.items = parseCssTokens(innerTokens);
        } else {
          idx++;
        }
      } else if (tok.value === '}') {
        flushSelector();
        idx++;
      } else if (tok.value === ';') {
        idx++;
      } else {
        idx++;
      }
      continue;
    }
    if (tok.kind === 'at-rule') {
      const trimmed = tok.value.trim();
      if (trimmed.includes('{')) {
        const selector = trimmed.split('{')[0]?.trim() ?? '';
        const firstBrace = trimmed.indexOf('{');
        const lastBrace = trimmed.lastIndexOf('}');
        const innerContent = trimmed.slice(firstBrace + 1, lastBrace).trim();
        const block: CssItem = { kind: 'block', selector, items: [] };
        if (innerContent) {
          const innerTokens = tokenizeCssBlocks(innerContent);
          block.items = parseCssTokens(innerTokens);
        }
        items.push(block);
      } else {
        items.push({ kind: 'block', selector: trimmed.replace(/;\s*$/, '').trim(), items: [] });
      }
      idx++;
      continue;
    }
    if (tok.kind === 'rule') {
      const trimmed = tok.value.trim();
      if (!trimmed) { idx++; continue; }
      const colonIdx = findColonOutsideParens(trimmed);
      if (colonIdx > 0 && !trimmed.includes('{') && !trimmed.includes('}')) {
        const prop = trimmed.slice(0, colonIdx).trim();
        const value = trimmed.slice(colonIdx + 1).trim();
        const isPseudoLike = value.startsWith(':') || value.startsWith('::');
        if (!isPseudoLike && prop.length > 0 && !prop.includes(' ') && !prop.startsWith('.') &&
          !prop.startsWith('#') && !prop.startsWith(':') && !prop.startsWith('@')) {
          items.push({ kind: 'prop', prop, value });
          idx++;
          continue;
        }
      }
      currentSelector = (currentSelector ? `${currentSelector  } ` : '') + trimmed;
      idx++;
      continue;
    }
    idx++;
  }
  flushSelector();
  return items;
}

function renderCssItems(items: CssItem[], depth: number): string[] {
  const lines: string[] = [];
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));
  for (const item of items) {
    if (item.kind === 'comment') {
      lines.push(`${indentStr(depth)}${item.text}`);
    } else if (item.kind === 'prop') {
      lines.push(`${indentStr(depth)}${item.prop}: ${item.value};`);
    } else if (item.kind === 'block') {
      lines.push(`${indentStr(depth)}${item.selector} {`);
      if (item.items.length > 0) {
        lines.push(...renderCssItems(item.items, depth + 1));
      }
      lines.push(`${indentStr(depth)}}`);
    }
  }
  return lines;
}

export function formatarCssMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens = tokenizeCssBlocks(normalized);
  const treeItems = parseCssTokens(tokens);
  const outLines = renderCssItems(treeItems, 0);
  const formatted = normalizarNewlinesFinais(outLines.join('\n').replace(/\n{3,}/g, '\n\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'css',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-css',
  };
}

export function formatarScssMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let currentBlockProps: Array<{ prop: string; value: string; isComment: boolean }> = [];
  const flushBlock = () => {
    if (currentBlockProps.length > 0) {
      for (const p of currentBlockProps) {
        if (p.isComment) {
          out.push(`${'  '.repeat(indent)}${p.prop}`);
        } else {
          out.push(`${'  '.repeat(indent)}${p.prop}: ${p.value};`);
        }
      }
      currentBlockProps = [];
    }
  };
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i] ?? '';
    const trimmed = raw.trim();
    if (!trimmed) {
      flushBlock();
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) {
      flushBlock();
      out.push(`${'  '.repeat(indent)}${trimmed}`);
      continue;
    }
    if (trimmed === '}') {
      flushBlock();
      indent = Math.max(0, indent - 1);
      out.push(`${'  '.repeat(indent)}}`);
      continue;
    }
    if (trimmed.endsWith('{')) {
      flushBlock();
      const selector = trimmed.slice(0, -1).trim();
      out.push(`${'  '.repeat(indent)}${selector} {`);
      indent++;
      continue;
    }
    if (trimmed.includes('{')) {
      flushBlock();
      const parts = trimmed.split('{');
      const selector = parts[0]?.trim() ?? '';
      out.push(`${'  '.repeat(indent)}${selector} {`);
      indent++;
      const rest = parts.slice(1).join('{').replace(/\s+/g, ' ').trim();
      if (rest && rest !== '}') {
        const props = rest.split(';').filter(p => p.trim());
        for (const prop of props) {
          const tp = prop.trim();
          if (tp && tp !== '}') {
            const colonIdx = tp.indexOf(':');
            if (colonIdx > 0) {
              currentBlockProps.push({
                prop: tp.slice(0, colonIdx).trim(),
                value: tp.slice(colonIdx + 1).replace(/;$/, '').trim(),
                isComment: false,
              });
            } else {
              out.push(`${'  '.repeat(indent)}${tp.endsWith(';') ? tp : `${tp};`}`);
            }
          }
        }
      }
      if (rest.endsWith('}')) {
        flushBlock();
        indent = Math.max(0, indent - 1);
      }
      continue;
    }
    if (trimmed.endsWith(';') || trimmed.includes(':')) {
      const prop = trimmed.endsWith(';') ? trimmed.slice(0, -1) : trimmed;
      const colonIdx = prop.indexOf(':');
      if (colonIdx > 0) {
        currentBlockProps.push({
          prop: prop.slice(0, colonIdx).trim(),
          value: prop.slice(colonIdx + 1).trim(),
          isComment: false,
        });
      } else {
        flushBlock();
        out.push(`${'  '.repeat(indent)}${trimmed.endsWith(';') ? trimmed : `${trimmed};`}`);
      }
      continue;
    }
    flushBlock();
    out.push(`${'  '.repeat(indent)}${trimmed}`);
  }
  flushBlock();
  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'scss',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-scss',
  };
}

export function formatarLessMinimo(code: string): FormatadorMinimoResult {
  return formatarScssMinimo(code);
}