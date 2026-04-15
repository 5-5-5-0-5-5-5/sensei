// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import {
  isMarkdownFenceCloser,
  matchMarkdownFence,
  normalizarFimDeLinha,
  normalizarNewlinesFinais,
  removerEspacosFinaisPorLinha
} from './utils.js';

function stripDiacritics(input: string): string {
  return input.normalize('NFD').replace(/\p{M}+/gu, '').normalize('NFC');
}

function normalizarCercasMarkdown(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  let changed = false;
  const out = lines.map(line => {
    const typo = line.match(/^(\s*)``è(.*)$/);
    if (typo) {
      const prefix = typo[1] ?? '';
      const after = typo[2] ?? '';
      const normalized = `${prefix}\`\`\`${after}`;
      if (normalized !== line) changed = true;
      return normalized;
    }
    const m = line.match(/^(\s*)(`{3,}|~{3,})(.*)$/);
    if (!m) return line;
    const prefix = m[1] ?? '';
    const fence = m[2] ?? '';
    const afterFence = m[3] ?? '';
    const info = afterFence.match(/^(\s*)(\S+)(.*)$/);
    if (!info) return line;
    const lead = info[1] ?? '';
    const token = info[2] ?? '';
    const tail = info[3] ?? '';
    const shouldNormalizeToken = /[^\x00-\x7F]/.test(token);
    if (!shouldNormalizeToken) return line;
    const normalizedToken = stripDiacritics(token);
    const normalized = `${prefix}${fence}${lead}${normalizedToken}${tail}`;
    if (normalized !== line) changed = true;
    return normalized;
  });
  return {
    code: out.join('\n'),
    changed
  };
}

function corrigirHtmlInlineEmMarkdown(text: string): {
  text: string;
  changed: boolean;
} {
  let changed = false;
  const fixed = text.replace(/<[^>\n]+>/g, tag => {
    if (tag.startsWith('<!--') || tag.startsWith('<!')) return tag;
    let t = tag;
    t = t.replace(/^<\s+/, '<').replace(/^<\/\s+/, '</');
    t = t.replace(/\s+\/>$/, '/>').replace(/\s+>$/, '>');
    t = t.replace(/^<\/\s+/, '</');
    if (t !== tag) changed = true;
    return t;
  });
  return {
    text: fixed,
    changed
  };
}

function corrigirEnfaseMarkdown(text: string): {
  text: string;
  changed: boolean;
} {
  let changed = false;
  let out = text;
  const apply = (re: RegExp, replacer: string) => {
    const next = out.replace(re, replacer);
    if (next !== out) changed = true;
    out = next;
  };
  apply(/\*\*([^\s*][^*\n]*?)\*\*\*(?!\*)/g, '**$1**');
  apply(/(^|[^*])\*([^\s*][^*\n]*?)\*\*(?!\*)/g, '$1*$2*');
  apply(/(^|[^*])\*([^\s*][^*\n]*?)\*\*\*(?!\*)/g, '$1*$2*');
  return {
    text: out,
    changed
  };
}

function corrigirMarkdownInlineForaDeCodigo(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  const processOutsideCodigoSpans = (text: string): string => {
    let i = 0;
    let acc = '';
    while (i < text.length) {
      const tickInicio = text.indexOf('`', i);
      if (tickInicio === -1) {
        const chunk = text.slice(i);
        let next = chunk;
        const e = corrigirEnfaseMarkdown(next);
        next = e.text;
        const h = corrigirHtmlInlineEmMarkdown(next);
        next = h.text;
        if (next !== chunk) changed = true;
        acc += next;
        break;
      }
      const chunk = text.slice(i, tickInicio);
      let next = chunk;
      const e = corrigirEnfaseMarkdown(next);
      next = e.text;
      const h = corrigirHtmlInlineEmMarkdown(next);
      next = h.text;
      if (next !== chunk) changed = true;
      acc += next;
      let runFim = tickInicio;
      while (runFim < text.length && text[runFim] === '`') runFim++;
      const run = text.slice(tickInicio, runFim);
      const closeIndex = text.indexOf(run, runFim);
      if (closeIndex === -1) {
        acc += text.slice(tickInicio);
        break;
      }
      acc += text.slice(tickInicio, closeIndex + run.length);
      i = closeIndex + run.length;
    }
    return acc;
  };
  for (const line of lines) {
    const fence = matchMarkdownFence(line);
    if (!inFence && fence) {
      inFence = true;
      fenceChar = fence.ch;
      fenceLen = fence.len;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    out.push(processOutsideCodigoSpans(line));
  }
  return {
    code: out.join('\n'),
    changed
  };
}

function assegurarLinhaVaziaAposTitulosMarkdown(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fence = matchMarkdownFence(line);
    if (!inFence && fence) {
      inFence = true;
      fenceChar = fence.ch;
      fenceLen = fence.len;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    out.push(line);
    const ehHeading = /^#{1,6}\s+\S/.test(line.trim());
    const proxima = lines[i + 1];
    const precisaEspaco = ehHeading && proxima !== undefined && proxima.trim() !== '';
    if (precisaEspaco) {
      out.push('');
      changed = true;
    }
  }
  return {
    code: out.join('\n'),
    changed
  };
}

function formatarListasMarkdown(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fence = matchMarkdownFence(line);
    if (!inFence && fence) {
      inFence = true;
      fenceChar = fence.ch;
      fenceLen = fence.len;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const listMatch = line.match(/^(\s*)([*+\-])\s+(.*)$/);
    if (listMatch) {
      const indent = listMatch[1] ?? '';
      const content = listMatch[3] ?? '';
      const normalized = `${indent}- ${content}`;
      if (normalized !== line) {
        changed = true;
      }
      out.push(normalized);
      continue;
    }
    out.push(line);
  }
  return {
    code: out.join('\n'),
    changed
  };
}

function formatarTabelasMarkdown(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  const changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  let inTable = false;
  let tableRows: string[][] = [];
  const processTable = () => {
    if (tableRows.length === 0) return;
    const colCount = Math.max(...tableRows.map(r => r.length));
    const colWidths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const maxWidth = Math.max(...tableRows.map(row => {
        const cell = row[c] ?? '';
        return cell.length;
      }));
      colWidths.push(maxWidth);
    }
    for (let r = 0; r < tableRows.length; r++) {
      const row = tableRows[r] ?? [];
      const cells = row.map((cell, c) => {
        const width = colWidths[c] ?? 0;
        return ` ${cell.padEnd(width)} `;
      });
      let line = `|${cells.join('|')}|`;
      if (r === 1) {
        const separators = colWidths.map(w => ` ${'-'.repeat(Math.max(w, 3))} `);
        line = `|${separators.join('|')}|`;
      }
      out.push(line);
    }
    tableRows = [];
    inTable = false;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const fence = matchMarkdownFence(line);
    if (!inFence && fence) {
      if (inTable) {
        processTable();
      }
      inFence = true;
      fenceChar = fence.ch;
      fenceLen = fence.len;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      if (inTable) {
        processTable();
      }
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const tableMatch = line.match(/^\s*\|(.+)\|\s*$/);
    if (tableMatch || (inTable && line.trim().startsWith('|'))) {
      if (!inTable) {
        inTable = true;
        tableRows = [];
      }
      if (tableMatch) {
        const content = tableMatch[1] ?? '';
        const cells = content.split('|').map(cell => cell.trim());
        tableRows.push(cells);
      } else {
        const content = line.trim();
        const cells = content.replace(/^\|/, '').replace(/\|$/, '').split('|').map(cell => cell.trim());
        tableRows.push(cells);
      }
      continue;
    } else if (inTable) {
      processTable();
    }
    out.push(line);
  }
  if (inTable) {
    processTable();
  }
  return {
    code: out.join('\n'),
    changed
  };
}

function limitarLinhasEmBrancoMarkdown(code: string, maxConsecutivas = 2): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let consecutive = 0;
  let changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  for (const line of lines) {
    const fence = matchMarkdownFence(line);
    if (!inFence && fence) {
      inFence = true;
      fenceChar = fence.ch;
      fenceLen = fence.len;
      consecutive = 0;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      consecutive = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const isBlank = line.trim() === '';
    if (isBlank) {
      consecutive += 1;
      if (consecutive > maxConsecutivas) {
        changed = true;
        continue;
      }
    } else {
      consecutive = 0;
    }
    out.push(line);
  }
  return {
    code: out.join('\n'),
    changed
  };
}

export function formatarMarkdownMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(code);
  const trimmed = removerEspacosFinaisPorLinha(normalized);
  const {
    code: cercasNormalizadas,
    changed: changedFences
  } = normalizarCercasMarkdown(trimmed);
  const {
    code: markdownCorrigido,
    changed: changedInline
  } = corrigirMarkdownInlineForaDeCodigo(cercasNormalizadas);
  const {
    code: comEspacoTitulos,
    changed: changedHeadings
  } = assegurarLinhaVaziaAposTitulosMarkdown(markdownCorrigido);
  const {
    code: comListasFormatadas,
    changed: changedListas
  } = formatarListasMarkdown(comEspacoTitulos);
  const {
    code: comTabelasFormatadas,
    changed: changedTabelas
  } = formatarTabelasMarkdown(comListasFormatadas);
  const {
    code: semBlanks,
    changed: changedBlanks
  } = limitarLinhasEmBrancoMarkdown(comTabelasFormatadas, 2);
  const formatted = normalizarNewlinesFinais(semBlanks);
  return {
    ok: true,
    parser: 'markdown',
    formatted,
    changed: formatted !== normalizarNewlinesFinais(normalized),
    reason: changedFences || changedInline || changedHeadings || changedListas || changedTabelas || changedBlanks ? 'estilo-prometheus-markdown' : 'normalizacao-basica'
  };
}