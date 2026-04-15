// SPDX-License-Identifier: MIT

import { createRequire } from 'node:module';

import type { MarkdownFenceMatch } from '@';

export type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';

export function normalizarFimDeLinha(code: string): string {
  return code.replace(/\r\n?/g, '\n');
}

export function removerBom(code: string): string {
  return code.length > 0 && code.charCodeAt(0) === 0xfeff ? code.slice(1) : code;
}

export function normalizarNewlinesFinais(code: string): string {
  const normalized = normalizarFimDeLinha(code);
  return `${normalized.replace(/\n+$/g, '')}\n`;
}

export function removerEspacosFinaisPorLinha(code: string): string {
  return removerEspacosFinaisPorLinhaComProtecao(code);
}

export function removerEspacosFinaisPorLinhaComProtecao(code: string, protectedLines?: ReadonlySet<number> | null): string {
  return code.split('\n').map((l, idx) => {
    const lineNo = idx + 1;
    if (protectedLines && protectedLines.has(lineNo)) return l;
    return l.replace(/[ \t]+$/g, '');
  }).join('\n');
}

export function matchMarkdownFence(line: string): MarkdownFenceMatch | null {
  const trimmedLeft = line.replace(/^\s+/, '');
  const m = trimmedLeft.match(/^([`~])\1{2,}/);
  if (!m) return null;
  const ch = (m[1] ?? '`') as '`' | '~';
  const len = (m[0] ?? '').length;
  const rest = trimmedLeft.slice(len);
  return {
    ch,
    len,
    rest
  };
}

export function isMarkdownFenceCloser(match: MarkdownFenceMatch, fenceChar: '`' | '~' | null, fenceLen: number): boolean {
  return fenceChar !== null && match.ch === fenceChar && match.len >= fenceLen && match.rest.trim() === '';
}

export function isJsTsFile(relPath?: string): boolean {
  const rp = (relPath ?? '').toLowerCase();
  return rp.endsWith('.ts') || rp.endsWith('.tsx') || rp.endsWith('.cts') || rp.endsWith('.mts') || rp.endsWith('.js') || rp.endsWith('.jsx') || rp.endsWith('.mjs') || rp.endsWith('.cjs');
}

export function getProtectedLinesFromTemplateLiterals(code: string, relPath: string): Set<number> | null {
  try {
    const req = createRequire(import.meta.url);
    const parser = req('@babel/parser') as {
      parse: (src: string, opts: Record<string, unknown>) => unknown;
    };
    const rp = (relPath ?? '').toLowerCase();
    const plugins: string[] = ['importMeta', 'dynamicImport', 'topLevelAwait', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'classStaticBlock', 'optionalChaining', 'nullishCoalescingOperator', 'numericSeparator', 'logicalAssignment', 'privateIn', 'objectRestSpread', 'decorators-legacy'];
    const isTs = rp.endsWith('.ts') || rp.endsWith('.tsx') || rp.endsWith('.cts') || rp.endsWith('.mts');
    const isJsx = rp.endsWith('.jsx') || rp.endsWith('.tsx');
    if (isTs) plugins.push('typescript');
    if (isJsx) plugins.push('jsx');
    const ast = parser.parse(code, {
      sourceType: 'unambiguous',
      errorRecovery: true,
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      plugins
    });
    const protectedLines = new Set<number>();
    const seen = new Set<object>();
    const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
    const walk = (node: unknown) => {
      if (!isObject(node)) return;
      if (seen.has(node as object)) return;
      seen.add(node as object);
      const anyNode = node as Record<string, unknown>;
      if (anyNode.type === 'TemplateLiteral') {
        const loc = anyNode.loc as {
          start: {
            line: number;
          };
          end: {
            line: number;
          };
        } | undefined;
        if (loc?.start?.line && loc?.end?.line) {
          for (let ln = loc.start.line; ln <= loc.end.line; ln++) {
            protectedLines.add(ln);
          }
        }
      }
      for (const k of Object.keys(anyNode)) {
        if (k === 'loc' || k === 'start' || k === 'end') continue;
        const v = anyNode[k];
        if (Array.isArray(v)) {
          for (const item of v) walk(item);
          continue;
        }
        if (isObject(v)) {
          const child = v as Record<string, unknown>;
          if (typeof child.type === 'string') walk(child);
        }
      }
    };
    walk(ast);
    return protectedLines.size > 0 ? protectedLines : null;
  } catch {
    return null;
  }
}

export function limitarLinhasEmBranco(code: string, maxConsecutivas = 2, protectedLines?: ReadonlySet<number> | null): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let consecutive = 0;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;
    if (protectedLines && protectedLines.has(lineNo)) {
      out.push(line);
      consecutive = 0;
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

const SPECIAL_TITLES_BY_SYMBOL: Record<string, string> = {
  FormatadorMensagens: 'MENSAGENS FORMATADOR (MIN)',
  SvgMensagens: 'MENSAGENS SVG (OTIMIZAÇÃO)'
};

export function normalizarSeparadoresDeSecao(code: string, opts: {
  relPath?: string;
  protectedLines?: ReadonlySet<number> | null;
} = {}): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let changed = false;
  const toUpperTitle = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed) return trimmed;
    const withSpaces = trimmed.replace(/([a-z\d])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2').replace(/[_\-]+/g, ' ').replace(/\s+/g, ' ').trim();
    const upper = withSpaces.toUpperCase();
    return upper;
  };
  const inferTitleFromNextSymbol = (fromIndex: number): string | null => {
    for (let j = fromIndex + 1; j < Math.min(lines.length, fromIndex + 35); j++) {
      const l = (lines[j] ?? '').trim();
      if (!l) continue;
      if (l.startsWith('//')) continue;
      if (l.startsWith('/*')) continue;
      const m = l.match(/^(?:export\s+)?(?:const|function|class|interface|type)\s+([A-Za-z_$][\w$]*)\b/);
      if (!m) continue;
      const symbol = m[1] ?? '';
      if (!symbol) continue;
      const special = SPECIAL_TITLES_BY_SYMBOL[symbol];
      if (special) return special;
      if (symbol.endsWith('Messages')) {
        const base = symbol.slice(0, -'Messages'.length);
        const baseTitle = toUpperTitle(base);
        return baseTitle ? `MENSAGENS ${baseTitle}` : 'MENSAGENS';
      }
      return toUpperTitle(symbol);
    }
    const relPath = (opts.relPath ?? '').toLowerCase();
    if (relPath.includes('/messages/') || relPath.includes('messages')) return 'MENSAGENS';
    return null;
  };
  const parseNovoSeparadorComMarcacao = (line: string): {
    titulo: string | null;
  } | null => {
    const m = line.match(/^\s*\/\*\s*-{10,}\s*substituir\s+por\s+titulo\s+@prometheus-secao(?:\((.+?)\))?\s*-{10,}\s*\*\/\s*$/i);
    if (!m) return null;
    const raw = (m[1] ?? '').trim();
    return {
      titulo: raw ? raw : null
    };
  };
  const isSeparadorSemTitulo = (line: string): boolean => {
    return /^\s*\/\*\s*-{10,}\s*substituir\s+por\s+titulo\s*-{10,}\s*\*\/\s*$/i.test(line) || /^\s*\/\*\s*-{10,}\s*-\s*-{10,}\s*\*\/\s*$/.test(line) || /^\s*\/\*\s*-{10,}\s*@prometheus-secao\s*-{10,}\s*\*\/\s*$/i.test(line);
  };
  const buildSeparatorWithTitle = (title: string): string => {
    return `  /* -------------------------- ${title} -------------------------- */`;
  };
  const isDivider = (line: string): boolean => /^\s*\/\/\s*(?:[=\-_*]){8,}\s*$/.test(line) || /^\s*\/\*\s*(?:[=\-_*]){8,}\s*\*\/\s*$/.test(line);
  const extractTitleFromLineComment = (line: string): string | null => {
    const m = line.match(/^\s*\/\/\s*(.+?)\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    if (!t) return null;
    if (/^(?:[=\-_*]){5,}$/.test(t)) return null;
    return t;
  };
  const extractTitleFromBlockComment = (line: string): string | null => {
    const m = line.match(/^\s*\/\*\s*(.+?)\s*\*\/\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    if (!t) return null;
    if (/^(?:[=\-_*]){5,}$/.test(t)) return null;
    return t;
  };
  const extractTitleFromSingleLine = (line: string): string | null => {
    const m = line.match(/^\s*\/\/\s*(?:[=\-_*]){5,}\s*(.+?)\s*(?:[=\-_*]){5,}\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    return t ? t : null;
  };
  const extractTitleFromSingleBlockLine = (line: string): string | null => {
    const m = line.match(/^\s*\/\*\s*(?:[=\-_*]){5,}\s*(.+?)\s*(?:[=\-_*]){5,}\s*\*\/\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    return t ? t : null;
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;
    if (opts.protectedLines && opts.protectedLines.has(lineNo)) {
      out.push(line);
      continue;
    }
    if (isSeparadorSemTitulo(line)) {
      const inferred = inferTitleFromNextSymbol(i);
      if (inferred) {
        out.push(buildSeparatorWithTitle(inferred));
        changed = true;
      } else {
        out.push(line);
      }
      continue;
    }
    const novo = parseNovoSeparadorComMarcacao(line);
    if (novo) {
      if (novo.titulo) {
        out.push(buildSeparatorWithTitle(novo.titulo));
        changed = true;
      } else {
        const inferred = inferTitleFromNextSymbol(i);
        if (inferred) {
          out.push(buildSeparatorWithTitle(inferred));
          changed = true;
        } else {
          out.push(line);
        }
      }
      continue;
    }
    if (isDivider(line) && i + 2 < lines.length && isDivider(lines[i + 2] ?? '')) {
      if (opts.protectedLines && (opts.protectedLines.has(i + 1) || opts.protectedLines.has(i + 2) || opts.protectedLines.has(i + 3))) {
        out.push(line);
        continue;
      }
      const middle = lines[i + 1] ?? '';
      const title = extractTitleFromLineComment(middle) ?? extractTitleFromBlockComment(middle);
      if (title) {
        out.push(buildSeparatorWithTitle(title));
        i += 2;
        changed = true;
        continue;
      }
    }
    const singleLine = extractTitleFromSingleLine(line);
    const singleBlock = extractTitleFromSingleBlockLine(line);
    const single = singleLine ?? singleBlock;
    if (single) {
      out.push(buildSeparatorWithTitle(single));
      changed = true;
      continue;
    }
    out.push(line);
  }
  return {
    code: out.join('\n'),
    changed
  };
}