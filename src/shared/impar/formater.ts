// SPDX-License-Identifier: MIT

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { XMLValidator } from 'fast-xml-parser';

import type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';

import type { FormatterFn } from './formatter-registry.js';
import { getFormatterForPath, registerFormatter } from './formatter-registry.js';
import { otimizarSvgLikeSvgo } from './svgs.js';
import { getSyntaxInfoForPath } from './syntax-map.js';

// Re-exportar para compatibilidade com código existente
export type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';
function normalizarFimDeLinha(code: string): string {
  return code.replace(/\r\n?/g, '\n');
}
function removerBom(code: string): string {
  return code.length > 0 && code.charCodeAt(0) === 0xfeff ? code.slice(1) : code;
}
function normalizarNewlinesFinais(code: string): string {
  // Mantém exatamente uma quebra de linha no final.
  const normalized = normalizarFimDeLinha(code);
  return `${normalized.replace(/\n+$/g, '')}\n`;
}
function removerEspacosFinaisPorLinha(code: string): string {
  return removerEspacosFinaisPorLinhaComProtecao(code);
}
function removerEspacosFinaisPorLinhaComProtecao(code: string, protectedLines?: ReadonlySet<number> | null): string {
  return code.split('\n').map((l, idx) => {
    const lineNo = idx + 1;
    if (protectedLines && protectedLines.has(lineNo)) return l;
    return l.replace(/[ \t]+$/g, '');
  }).join('\n');
}
function matchMarkdownFence(line: string): MarkdownFenceMatch | null {
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
function isMarkdownFenceCloser(match: MarkdownFenceMatch, fenceChar: '`' | '~' | null, fenceLen: number): boolean {
  return fenceChar !== null && match.ch === fenceChar && match.len >= fenceLen && match.rest.trim() === '';
}
function isJsTsFile(relPath?: string): boolean {
  const rp = (relPath ?? '').toLowerCase();
  return rp.endsWith('.ts') || rp.endsWith('.tsx') || rp.endsWith('.cts') || rp.endsWith('.mts') || rp.endsWith('.js') || rp.endsWith('.jsx') || rp.endsWith('.mjs') || rp.endsWith('.cjs');
}
function getProtectedLinesFromTemplateLiterals(code: string, relPath: string): Set<number> | null {
  // Protege conteúdo de template literals (backticks) contra transforms line-based.
  // Isso evita quebrar strings multilinha que pareçam comentários/divisores.
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
function limitarLinhasEmBranco(code: string, maxConsecutivas = 2, protectedLines?: ReadonlySet<number> | null): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let consecutivas = 0;
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;
    if (protectedLines && protectedLines.has(lineNo)) {
      out.push(line);
      consecutivas = 0;
      continue;
    }
    const isBlank = line.trim() === '';
    if (isBlank) {
      consecutivas += 1;
      if (consecutivas > maxConsecutivas) {
        changed = true;
        continue;
      }
    } else {
      consecutivas = 0;
    }
    out.push(line);
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
function stripDiacritics(input: string): string {
  // Remove acentos sem alterar espaçamento; útil para info string de cercas (```èxemplo -> ```exemplo)
  return input.normalize('NFD').replace(/\p{M}+/gu, '').normalize('NFC');
}
function normalizarCercasMarkdown(code: string): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  let changed = false;
  const out = lines.map(line => {
    // Corrige erro comum de teclado: "``è" como se fosse "```".
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

    // Não adiciona/remover espaços após a cerca; só normaliza o primeiro token da info string.
    const info = afterFence.match(/^(\s*)(\S+)(.*)$/);
    if (!info) return line;
    const lead = info[1] ?? '';
    const token = info[2] ?? '';
    const tail = info[3] ?? '';

    // Só mexe no token se houver diacríticos (ou não-ASCII). Mantém resto intacto.
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
    // Normaliza fechamento com espaço: </ div> -> </div>
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

  // Casos explícitos do pedido:
  // - **exemplo*** -> **exemplo**
  // - *exemplo**  -> *exemplo*
  // Sem inserir espaços e sem atravessar quebras de linha.
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
    // Tokeniza code spans por runs de backticks e não altera dentro deles.
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
        // Sem fechamento; preserva o resto como está.
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
function limitarLinhasEmBrancoMarkdown(code: string, maxConsecutivas = 2): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let consecutivas = 0;
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
      consecutivas = 0;
      out.push(line);
      continue;
    }
    if (inFence && fence && isMarkdownFenceCloser(fence, fenceChar, fenceLen)) {
      inFence = false;
      fenceChar = null;
      fenceLen = 0;
      consecutivas = 0;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    const isBlank = line.trim() === '';
    if (isBlank) {
      consecutivas += 1;
      if (consecutivas > maxConsecutivas) {
        changed = true;
        continue;
      }
    } else {
      consecutivas = 0;
    }
    out.push(line);
  }
  return {
    code: out.join('\n'),
    changed
  };
}
function normalizarSeparadoresDeSecao(code: string, opts: {
  relPath?: string;
  protectedLines?: ReadonlySet<number> | null;
} = {}): {
  code: string;
  changed: boolean;
} {
  const lines = normalizarFimDeLinha(code).split('\n');
  const out: string[] = [];
  let changed = false;
  const specialTitlesBySymbol: Record<string, string> = {
    FormatadorMensagens: 'MENSAGENS FORMATADOR (MIN)',
    SvgMensagens: 'MENSAGENS SVG (OTIMIZAÇÃO)'
  };
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
      const special = specialTitlesBySymbol[symbol];
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
    // Formato legado aceito (compat): /* -------------------------- substituir por titulo (opcionalmente com um título embutido) -------------------------- */
    const m = line.match(/^\s*\/\*\s*-{10,}\s*substituir\s+por\s+titulo\s+@prometheus-secao(?:\((.+?)\))?\s*-{10,}\s*\*\/\s*$/i);
    if (!m) return null;
    const raw = (m[1] ?? '').trim();
    return {
      titulo: raw ? raw : null
    };
  };
  const isSeparadorSemTitulo = (line: string): boolean => {
    // Ex.: /* -------------------------- substituir por titulo -------------------------- */
    // Ex.: /* -------------------------- - -------------------------- */
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
    // ignora divisores e comentários "vazios"
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
    // Ex.: // ======= TITULO =======
    const m = line.match(/^\s*\/\/\s*(?:[=\-_*]){5,}\s*(.+?)\s*(?:[=\-_*]){5,}\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    return t ? t : null;
  };
  const extractTitleFromSingleBlockLine = (line: string): string | null => {
    // Ex.: /* ======= TITULO ======= */
    const m = line.match(/^\s*\/\*\s*(?:[=\-_*]){5,}\s*(.+?)\s*(?:[=\-_*]){5,}\s*\*\/\s*$/);
    if (!m) return null;
    const t = m[1].trim();
    return t ? t : null;
  };
  const buildSeparator = (originalTitle: string): string => buildSeparatorWithTitle(originalTitle);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const lineNo = i + 1;
    if (opts.protectedLines && opts.protectedLines.has(lineNo)) {
      out.push(line);
      continue;
    }

    // Caso -1: separador placeholder (sem título) -> tenta inferir pelo contexto.
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

    // Caso 0: separador já no formato novo com marcação; promover para título correto.
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

    // Caso 1: bloco de 3 linhas
    // // ======
    // // TITULO
    // // ======
    if (isDivider(line) && i + 2 < lines.length && isDivider(lines[i + 2] ?? '')) {
      if (opts.protectedLines && (opts.protectedLines.has(i + 1) || opts.protectedLines.has(i + 2) || opts.protectedLines.has(i + 3))) {
        out.push(line);
        continue;
      }
      const middle = lines[i + 1] ?? '';
      const title = extractTitleFromLineComment(middle) ?? extractTitleFromBlockComment(middle);
      if (title) {
        out.push(buildSeparator(title));
        i += 2;
        changed = true;
        continue;
      }
    }

    // Caso 2: linha única com título centralizado
    const singleLine = extractTitleFromSingleLine(line);
    const singleBlock = extractTitleFromSingleBlockLine(line);
    const single = singleLine ?? singleBlock;
    if (single) {
      out.push(buildSeparator(single));
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
function formatarCodeMinimo(code: string, opts: {
  normalizarSeparadoresDeSecao?: boolean;
  relPath?: string;
  parser?: FormatadorMinimoParser;
} = {}): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const protectedLines = opts.relPath && isJsTsFile(opts.relPath) ? getProtectedLinesFromTemplateLiterals(normalized, opts.relPath) : null;
  const semEspacosFinais = removerEspacosFinaisPorLinhaComProtecao(normalized, protectedLines);
  const shouldNormalizeSeparators = opts.normalizarSeparadoresDeSecao ?? true;
  const {
    code: maybeSeparadores,
    changed: changedSeparators
  } = shouldNormalizeSeparators ? normalizarSeparadoresDeSecao(semEspacosFinais, {
    relPath: opts.relPath,
    protectedLines
  }) : {
      code: semEspacosFinais,
      changed: false
    };
  const {
    code: semBlanks,
    changed: changedBlanks
  } = limitarLinhasEmBranco(maybeSeparadores, 2, protectedLines);
  const formatted = normalizarNewlinesFinais(semBlanks);
  const baseline = normalizarNewlinesFinais(normalized);
  const changed = formatted !== baseline;
  return {
    ok: true,
    parser: opts.parser ?? 'code',
    formatted,
    changed,
    reason: changedSeparators ? 'normalizacao-separadores' : changedBlanks ? 'limpeza-linhas-em-branco' : 'normalizacao-basica'
  };
}
function formatarJsonMinimo(code: string): FormatadorMinimoResult {
  try {
    // Normalizar entrada: remover BOM, normalizar line endings
    const normalizedInput = normalizarFimDeLinha(removerBom(code));

    // Parsear JSON
    const parsed = JSON.parse(normalizedInput) as unknown;

    // Formatar com 2 espaços de indentação + newline final
    const formatted = normalizarNewlinesFinais(JSON.stringify(parsed, null, 2));

    // Comparar contra entrada normalizada (com newline final consistente)
    // Isso evita falsos positivos por diferença de line endings ou BOM
    const normalizedForComparison = normalizarNewlinesFinais(normalizedInput);
    const changed = formatted !== normalizedForComparison;
    return {
      ok: true,
      parser: 'json',
      formatted,
      changed
    };
  } catch (err) {
    return {
      ok: false,
      parser: 'json',
      error: err instanceof Error ? err.message : String(err)
    };
  }
}
function formatarMarkdownMinimo(code: string): FormatadorMinimoResult {
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

    // Normaliza marcadores de lista para uso consistente
    // Converte * ou + para - em itens de lista
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
  let changed = false;
  let inFence = false;
  let fenceChar: '`' | '~' | null = null;
  let fenceLen = 0;
  let inTable = false;
  let tableRows: string[][] = [];
  let tableHeaderLine = -1;

  const processTable = () => {
    if (tableRows.length === 0) return;

    // Calcula o tamanho máximo de cada coluna
    const colCount = Math.max(...tableRows.map(r => r.length));
    const colWidths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const maxWidth = Math.max(...tableRows.map(row => {
        const cell = row[c] ?? '';
        return cell.length;
      }));
      colWidths.push(maxWidth);
    }

    // Formata cada linha da tabela
    for (let r = 0; r < tableRows.length; r++) {
      const row = tableRows[r] ?? [];
      const cells = row.map((cell, c) => {
        const width = colWidths[c] ?? 0;
        return ` ${cell.padEnd(width)} `;
      });

      let line = `|${cells.join('|')}|`;

      // Se é a linha do separador (segunda linha)
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

    // Detecta linhas de tabela (começam e terminam com |)
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
        // Linha de tabela mal formatada
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
function formatarYamlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(code);
  const trimmed = removerEspacosFinaisPorLinha(normalized);
  const {
    code: semBlanks,
    changed: changedBlanks
  } = limitarLinhasEmBranco(trimmed, 2);
  const formatted = normalizarNewlinesFinais(semBlanks);
  return {
    ok: true,
    parser: 'yaml',
    formatted,
    changed: formatted !== normalizarNewlinesFinais(normalized),
    reason: changedBlanks ? 'estilo-prometheus-yaml' : 'normalizacao-basica'
  };
}
function tokenizeXml(src: string): Array<{
  kind: 'tag' | 'text';
  value: string;
}> {
  // Mantém comentários/CDATA/PI/DOCTYPE como "tag" para não serem alterados.
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
  // Não mexe em comentários, CDATA, DOCTYPE/declarações e PI.
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

  // Normaliza espaços imediatamente após "<" e "</".
  out = out.replace(/^<\s+/, '<');
  out = out.replace(/^<\/\s+/, '</');

  // Remove espaços antes de ">" e de "/>".
  out = out.replace(/\s+\/>$/, '/>');
  out = out.replace(/\s+>$/, '>');

  // Colapsa múltiplos espaços fora de aspas dentro da tag.
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

  // Garante que não exista espaço após "<" ou "</" novamente (pós-colapso).
  out = out.replace(/^<\s+/, '<');
  out = out.replace(/^<\/\s+/, '</');

  // Remove espaço antes do fechamento após colapso.
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
    // Se existe texto não-whitespace entre tags, indentação pode alterar semântica.
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
      // texto é só whitespace aqui; ignoramos e reconstruímos.
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
function formatarXmlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const semEspacosFinais = removerEspacosFinaisPorLinha(normalized);

  // 1) Correções seguras de tags (sem tocar em CDATA/comentários)
  const tokens = tokenizeXml(semEspacosFinais);
  let changedTokens = false;
  const rebuilt = tokens.map(t => {
    if (t.kind === 'text') return t.value;
    const r = normalizeXmlTagToken(t.value);
    if (r.changed) changedTokens = true;
    return r.tag;
  }).join('');

  // 2) Se ficar válido e sem mixed content, aplica pretty-print.
  let pretty = rebuilt;
  let changedPretty = false;
  const valid = XMLValidator.validate(pretty);
  if (valid === true) {
    const pp = prettyPrintXmlIfSafe(pretty);
    pretty = pp.xml;
    changedPretty = pp.changed;
  } else {
    // Mesmo inválido, ao menos normaliza newline final.
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
function formatarSvgMinimo(code: string): FormatadorMinimoResult {
  const opt = otimizarSvgLikeSvgo({
    svg: code,
    pretty: true
  });
  return {
    ok: true,
    parser: 'xml',
    formatted: opt.data,
    changed: opt.changed,
    reason: opt.changed ? 'svg-optimized' : 'normalizacao-basica'
  };
}
function tokenizeHtml(src: string): Array<{ kind: 'tag' | 'text' | 'comment'; value: string }> {
  const re = /(<\/?[^>\n]+?>|<!--[\s\S]*?-->)/g;
  const out: Array<{ kind: 'tag' | 'text' | 'comment'; value: string }> = [];
  let last = 0;
  for (const m of src.matchAll(re)) {
    const start = m.index ?? -1;
    if (start < 0) continue;
    if (start > last) {
      const text = src.slice(last, start);
      if (text.trim()) out.push({ kind: 'text', value: text });
    }
    const val = m[0] ?? '';
    out.push({ kind: val.startsWith('<!--') ? 'comment' : 'tag', value: val });
    last = start + (m[0]?.length ?? 0);
  }
  if (last < src.length) {
    const remaining = src.slice(last);
    if (remaining.trim()) out.push({ kind: 'text', value: remaining });
  }
  return out;
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

function formatHtmlAttributes(tag: string, indent: number): string[] {
  const indentStr = '  '.repeat(indent);
  const isClosing = tag.startsWith('</');
  const isSelfClosing = tag.endsWith('/>');
  const tagName = extractTagName(tag);
  if (!tagName || isClosing) return [tag];

  const attrRegex = /(\w[\w-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+)))?/g;
  const attrs: Array<{ name: string; value: string | null }> = [];
  const content = tag.slice(tagName.length + 1, isSelfClosing ? -2 : -1).trim();
  if (!content) return [tag];

  let match;
  while ((match = attrRegex.exec(content)) !== null) {
    const name = match[1] ?? '';
    const val = match[2] ?? match[3] ?? match[4] ?? null;
    if (name) {
      attrs.push({ name, value: val !== null ? `"${val}"` : null });
    }
  }

  if (attrs.length <= 2) {
    const attrStr = attrs.map(a => a.value ? `${a.name}=${a.value}` : a.name).join(' ');
    return [`${indentStr}<${tagName} ${attrStr}${isSelfClosing ? ' />' : '>'}`];
  }

  const lines: string[] = [];
  const maxNameLen = Math.max(...attrs.map(a => a.name.length));
  lines.push(`${indentStr}<${tagName}`);
  for (const attr of attrs) {
    const paddedName = attr.name.padEnd(maxNameLen);
    if (attr.value) {
      lines.push(`${indentStr}  ${paddedName} = ${attr.value}`);
    } else {
      lines.push(`${indentStr}  ${paddedName}`);
    }
  }
  lines.push(`${indentStr}${isSelfClosing ? '/>' : '>'}`);
  return lines;
}

const HTML_VOID_ELEMENTS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

const HTML_BLOCK_ELEMENTS = new Set([
  'div', 'section', 'article', 'aside', 'header', 'footer', 'nav',
  'main', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th',
  'form', 'fieldset', 'blockquote', 'pre', 'figure', 'figcaption',
  'details', 'summary', 'dialog', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'p', 'dl', 'dt', 'dd',
]);

function isHtmlBlockTag(tagName: string): boolean {
  return HTML_BLOCK_ELEMENTS.has(tagName.toLowerCase());
}

function isHtmlVoidTag(tagName: string): boolean {
  return HTML_VOID_ELEMENTS.has(tagName.toLowerCase());
}

function extractTagName(tag: string): string | null {
  const m = tag.match(/^<\/?([a-zA-Z][\w-]*)/);
  return m?.[1] ?? null;
}

function formatarHtmlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens = tokenizeHtml(normalized);
  let indent = 0;
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));
  const outLines: string[] = [];

  for (const tok of tokens) {
    if (tok.kind === 'comment') {
      const line = `${indentStr(indent)}${tok.value.trim()}`;
      outLines.push(line);
      continue;
    }
    if (tok.kind === 'text') {
      const trimmed = tok.value.replace(/\s+/g, ' ').trim();
      if (trimmed) {
        outLines.push(`${indentStr(indent)}${trimmed}`);
      }
      continue;
    }
    const normalizedTag = normalizeHtmlTag(tok.value);
    const tagName = extractTagName(normalizedTag);
    const isClosing = normalizedTag.startsWith('</');
    const isSelfClosing = normalizedTag.endsWith('/>');
    const isVoid = tagName ? isHtmlVoidTag(tagName) : false;
    const isBlock = tagName ? isHtmlBlockTag(tagName) : false;
    const isDoctype = /^<!doctype/i.test(normalizedTag);

    if (isClosing && indent > 0) {
      indent = Math.max(0, indent - 1);
    }

    const hasAttrs = !isClosing && normalizedTag.includes('=') && !isDoctype;
    if (hasAttrs && !isVoid) {
      const formattedLines = formatHtmlAttributes(normalizedTag, indent);
      for (const line of formattedLines) {
        outLines.push(line);
      }
      if (!isSelfClosing && !isVoid && tagName) {
        indent += 1;
      }
    } else if (isDoctype || isBlock || (!isClosing && !isSelfClosing && !isVoid && tagName)) {
      outLines.push(`${indentStr(indent)}${normalizedTag}`);
      if (!isClosing && !isSelfClosing && !isVoid && tagName) {
        indent += 1;
      }
    } else if (isSelfClosing || isVoid) {
      outLines.push(`${indentStr(indent)}${normalizedTag}`);
    } else {
      outLines.push(`${indentStr(indent)}${normalizedTag}`);
    }
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
    } else if (src[i] === '@') {
      let depth = 0;
      const constStart = i;
      while (i < src.length) {
        if (src[i] === '{') depth++;
        if (src[i] === '}') {
          if (depth === 0) {
            i++;
            break;
          }
          depth--;
        }
        if (src[i] === ';' && depth === 0) {
          i++;
          break;
        }
        i++;
      }
      out.push({ kind: 'at-rule', value: src.slice(constStart, i) });
    } else if (src[i] === '{' || src[i] === '}' || src[i] === ';') {
      out.push({ kind: 'text', value: src[i] });
      i++;
    } else {
      const ruleStart = i;
      while (i < src.length && !['{', '}', ';', '@'].includes(src[i] ?? '') && !(src[i] === '/' && src[i + 1] === '*')) {
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

function formatarCssMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const tokens = tokenizeCssBlocks(normalized);
  const indentStr = (n: number) => '  '.repeat(Math.max(0, n));

  type CssProp = { prop: string; value: string; isComment: boolean; commentText?: string };
  type CssBlock = { selector: string; props: CssProp[] };
  const blocks: CssBlock[] = [];
  let currentBlock: CssBlock | null = null;
  let braceDepth = 0;

  for (const tok of tokens) {
    if (tok.kind === 'comment') {
      if (currentBlock) {
        currentBlock.props.push({ prop: '', value: '', isComment: true, commentText: tok.value.trim() });
      }
      continue;
    }
    if (tok.kind === 'text') {
      if (tok.value === '{') {
        braceDepth++;
        continue;
      } else if (tok.value === '}') {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
        braceDepth = Math.max(0, braceDepth - 1);
      }
      continue;
    }
    if (tok.kind === 'at-rule') {
      const trimmed = tok.value.trim();
      if (trimmed.endsWith('}')) {
        const inner = trimmed.replace(/\s*}\s*$/, '').trim();
        const selector = inner.split('{')[0]?.trim() ?? '';
        const propsStr = inner.split('{').slice(1).join('{');
        const block: CssBlock = { selector, props: [] };
        if (propsStr) {
          const props = propsStr.split(';').filter(p => p.trim());
          for (const prop of props) {
            const trimmedProp = prop.trim();
            if (trimmedProp) {
              const colonIdx = trimmedProp.indexOf(':');
              if (colonIdx > 0) {
                block.props.push({
                  prop: trimmedProp.slice(0, colonIdx).trim(),
                  value: trimmedProp.slice(colonIdx + 1).trim(),
                  isComment: false,
                });
              }
            }
          }
        }
        blocks.push(block);
      } else if (trimmed.includes('{')) {
        const selector = trimmed.split('{')[0]?.trim() ?? '';
        currentBlock = { selector, props: [] };
        const propsStr = trimmed.split('{').slice(1).join('{');
        if (propsStr) {
          const props = propsStr.split(';').filter(p => p.trim());
          for (const prop of props) {
            const trimmedProp = prop.trim();
            if (trimmedProp) {
              const colonIdx = trimmedProp.indexOf(':');
              if (colonIdx > 0) {
                currentBlock.props.push({
                  prop: trimmedProp.slice(0, colonIdx).trim(),
                  value: trimmedProp.slice(colonIdx + 1).trim(),
                  isComment: false,
                });
              }
            }
          }
        }
      } else {
        const props = trimmed.split(';').filter(p => p.trim());
        for (const prop of props) {
          const trimmedProp = prop.trim();
          if (trimmedProp) {
            blocks.push({ selector: trimmedProp, props: [] });
          }
        }
      }
      continue;
    }
    if (tok.kind === 'rule') {
      const trimmed = tok.value.trim();
      if (!trimmed) continue;
      if (braceDepth > 0 && currentBlock) {
        const colonIdx = trimmed.indexOf(':');
        if (colonIdx > 0) {
          currentBlock.props.push({
            prop: trimmed.slice(0, colonIdx).trim(),
            value: trimmed.slice(colonIdx + 1).trim(),
            isComment: false,
          });
        }
      } else {
        currentBlock = { selector: trimmed, props: [] };
      }
    }
  }

  const outLines: string[] = [];
  for (const block of blocks) {
    outLines.push(`${indentStr(0)}${block.selector} {`);
    const realProps = block.props.filter(p => !p.isComment && p.value !== '');
    if (realProps.length > 0) {
      const maxPropLen = Math.max(...realProps.map(p => p.prop.length));
      for (const p of realProps) {
        const padded = p.prop.padEnd(maxPropLen);
        outLines.push(`${indentStr(1)}${padded}: ${p.value};`);
      }
    }
    const comments = block.props.filter(p => p.isComment);
    for (const c of comments) {
      outLines.push(`${indentStr(1)}${c.commentText}`);
    }
    outLines.push('}');
    outLines.push('');
  }

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

function formatarScssMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let currentBlockProps: Array<{ prop: string; value: string; isComment: boolean }> = [];
  const _currentSelector = '';

  const flushBlock = () => {
    if (currentBlockProps.length > 0) {
      const realProps = currentBlockProps.filter(p => !p.isComment);
      const comments = currentBlockProps.filter(p => p.isComment);
      if (realProps.length > 0) {
        const maxPropLen = Math.max(...realProps.map(p => p.prop.length));
        for (const p of realProps) {
          const padded = p.prop.padEnd(maxPropLen);
          out.push(`${'  '.repeat(indent)}${padded}: ${p.value};`);
        }
      }
      for (const c of comments) {
        out.push(`${'  '.repeat(indent)}${c.prop}`);
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

function formatarLessMinimo(code: string): FormatadorMinimoResult {
  return formatarScssMinimo(code);
}

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

function formatarSqlMinimo(code: string): FormatadorMinimoResult {
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

function formatarTomlMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let currentSection: Array<{ key: string; value: string; comment: string }> = [];
  const _currentSectionHeader = '';

  const flushSection = () => {
    if (currentSection.length > 0) {
      const maxKeyLen = Math.max(...currentSection.map(e => e.key.length));
      for (const entry of currentSection) {
        if (entry.comment) {
          out.push(entry.comment);
        } else {
          const paddedKey = entry.key.padEnd(maxKeyLen);
          out.push(`${paddedKey} = ${entry.value}`);
        }
      }
      currentSection = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushSection();
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('#')) {
      if (currentSection.length > 0 && !currentSection[currentSection.length - 1].comment) {
        currentSection.push({ key: '', value: '', comment: trimmed });
      } else {
        flushSection();
        out.push(trimmed);
      }
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      currentSection.push({ key, value: val, comment: '' });
      continue;
    }
    if (/^\[/.test(trimmed)) {
      flushSection();
      const inner = trimmed.replace(/^\[+/, '').replace(/\]+$/, '').trim();
      const isArrayOfTables = /^\[\[/.test(trimmed);
      if (isArrayOfTables) {
        out.push(`[[ ${inner} ]]`);
      } else {
        out.push(`[ ${inner} ]`);
      }
      continue;
    }
    out.push(trimmed);
  }

  flushSection();
  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'toml',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-toml',
  };
}

function formatarIniMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let currentSection: Array<{ key: string; value: string; comment: string }> = [];

  const flushSection = () => {
    if (currentSection.length > 0) {
      const maxKeyLen = Math.max(...currentSection.map(e => e.key.length));
      for (const entry of currentSection) {
        if (entry.comment) {
          out.push(entry.comment);
        } else {
          const paddedKey = entry.key.padEnd(maxKeyLen);
          out.push(`${paddedKey} = ${entry.value}`);
        }
      }
      currentSection = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushSection();
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith(';')) {
      if (currentSection.length > 0 && !currentSection[currentSection.length - 1].comment) {
        currentSection.push({ key: '', value: '', comment: trimmed });
      } else {
        flushSection();
        out.push(trimmed);
      }
      continue;
    }
    if (/^\[/.test(trimmed) && /\]$/.test(trimmed)) {
      flushSection();
      const inner = trimmed.slice(1, -1).trim();
      out.push(`[${inner}]`);
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      currentSection.push({ key, value: val, comment: '' });
      continue;
    }
    out.push(trimmed);
  }

  flushSection();
  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'ini',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-ini',
  };
}

function formatarDockerfileMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];

  const DOCKER_KEYWORDS = new Set([
    'from', 'run', 'cmd', 'label', 'maintainer', 'expose', 'env',
    'add', 'copy', 'entrypoint', 'volume', 'user', 'workdir', 'arg',
    'onbuild', 'stopsignal', 'healthcheck', 'shell', 'as',
  ]);

  for (const raw of lines) {
    const trimmed = raw.trim();
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
    const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase() ?? '';
    if (DOCKER_KEYWORDS.has(firstWord)) {
      const upper = firstWord.toUpperCase();
      const rest = trimmed.slice(firstWord.length).trim();
      out.push(`${upper} ${rest}`);
      continue;
    }
    if (/^[A-Z]+/.test(trimmed)) {
      out.push(trimmed);
    } else {
      const firstWordUpper = trimmed.split(/\s+/)[0]?.toUpperCase() ?? '';
      if (DOCKER_KEYWORDS.has(firstWordUpper.toLowerCase())) {
        const rest = trimmed.slice(firstWord.length).trim();
        out.push(`${firstWordUpper} ${rest}`);
        continue;
      }
      out.push(trimmed);
    }
  }

  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'dockerfile',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-dockerfile',
  };
}

function formatarShellMinimo(code: string): FormatadorMinimoResult {
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

function formatarGradleMinimo(code: string): FormatadorMinimoResult {
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: true,
    parser: 'gradle',
  });
}

function formatarPropertiesMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let currentGroup: Array<{ key: string; value: string; comment: string }> = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      const realEntries = currentGroup.filter(e => e.key !== '');
      if (realEntries.length > 0) {
        const maxKeyLen = Math.max(...realEntries.map(e => e.key.length));
        for (const entry of currentGroup) {
          if (entry.comment) {
            out.push(entry.comment);
          } else {
            const paddedKey = entry.key.padEnd(maxKeyLen);
            out.push(`${paddedKey} = ${entry.value}`);
          }
        }
      } else {
        for (const entry of currentGroup) {
          if (entry.comment) out.push(entry.comment);
        }
      }
      currentGroup = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushGroup();
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith('!')) {
      if (currentGroup.length > 0 && !currentGroup[currentGroup.length - 1].comment) {
        currentGroup.push({ key: '', value: '', comment: trimmed });
      } else {
        flushGroup();
        out.push(trimmed);
      }
      continue;
    }
    const sepMatch = trimmed.match(/^([^:=]+)\s*[:=]\s*(.*)$/);
    if (sepMatch) {
      const key = (sepMatch[1] ?? '').trim();
      const val = (sepMatch[2] ?? '').trim();
      currentGroup.push({ key, value: val, comment: '' });
      continue;
    }
    flushGroup();
    out.push(trimmed);
  }

  flushGroup();
  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'properties',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-properties',
  };
}

function formatarJavaMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const protectedLines = getProtectedLinesFromTemplateLiterals(normalized, '.java');
  const semEspacos = removerEspacosFinaisPorLinhaComProtecao(normalized, protectedLines);
  const { code: comSeparadores } = normalizarSeparadoresDeSecao(semEspacos, {
    relPath: '.java',
    protectedLines,
  });
  const { code: limitado } = limitarLinhasEmBranco(comSeparadores, 2, protectedLines);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'java',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-java',
  };
}

function formatarPythonMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];

  for (const raw of lines) {
    out.push(raw.replace(/[ \t]+$/, ''));
  }

  const { code: limitado } = limitarLinhasEmBranco(out.join('\n'), 2);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'python',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-python',
  };
}

function formatarPhpMinimo(code: string): FormatadorMinimoResult {
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: false,
    parser: 'php',
  });
}

export function formatarPrettierMinimo(params: {
  code: string;
  relPath?: string;
}): FormatadorMinimoResult {
  const relPath = (params.relPath ?? '').toLowerCase();
  const code = params.code;
  const temComentariosJsonc = (src: string): boolean => {
    const normalized = normalizarFimDeLinha(src);
    return /(^|\n)\s*\/\//.test(normalized) || /(^|\n)\s*\/\*/.test(normalized);
  };
  if (relPath.endsWith('.json') || relPath.endsWith('.jsonc') || relPath.endsWith('.lock')) {
    if (temComentariosJsonc(code)) {
      return formatarCodeMinimo(code, {
        normalizarSeparadoresDeSecao: false,
        relPath,
      });
    }
    return formatarJsonMinimo(code);
  }
  if (relPath.endsWith('.md') || relPath.endsWith('.markdown')) {
    return formatarMarkdownMinimo(code);
  }
  if (relPath.endsWith('.yml') || relPath.endsWith('.yaml')) {
    return formatarYamlMinimo(code);
  }
  if (relPath.endsWith('.ts') || relPath.endsWith('.tsx') || relPath.endsWith('.cts') || relPath.endsWith('.mts')) {
    return formatarTypeScriptMinimo(code, relPath);
  }
  if (relPath.endsWith('.js') || relPath.endsWith('.jsx') || relPath.endsWith('.mjs') || relPath.endsWith('.cjs')) {
    return formatarJavaScriptMinimo(code, relPath);
  }
  if (relPath.endsWith('.html') || relPath.endsWith('.htm')) {
    return formatarHtmlMinimo(code);
  }
  if (relPath.endsWith('.xml')) {
    return formatarXmlMinimo(code);
  }
  if (relPath.endsWith('.svg')) {
    return formatarSvgMinimo(code);
  }
  if (relPath.endsWith('.css')) {
    return formatarCssMinimo(code);
  }
  if (relPath.endsWith('.scss')) {
    return formatarScssMinimo(code);
  }
  if (relPath.endsWith('.less')) {
    return formatarLessMinimo(code);
  }
  if (relPath.endsWith('.sql')) {
    return formatarSqlMinimo(code);
  }
  if (relPath.endsWith('.toml')) {
    return formatarTomlMinimo(code);
  }
  if (relPath.endsWith('.ini')) {
    return formatarIniMinimo(code);
  }
  if (relPath.endsWith('.dockerfile') || path.basename(relPath).toLowerCase() === 'dockerfile') {
    return formatarDockerfileMinimo(code);
  }
  if (relPath.endsWith('.sh') || relPath.endsWith('.bash')) {
    return formatarShellMinimo(code);
  }
  if (relPath.endsWith('.gradle') || relPath.endsWith('.kts')) {
    return formatarGradleMinimo(code);
  }
  if (relPath.endsWith('.properties')) {
    return formatarPropertiesMinimo(code);
  }
  if (relPath.endsWith('.java')) {
    return formatarJavaMinimo(code);
  }
  if (relPath.endsWith('.py')) {
    return formatarPythonMinimo(code);
  }
  if (relPath.endsWith('.php')) {
    return formatarPhpMinimo(code);
  }
  if (relPath.endsWith('.kt')) {
    return formatarKotlinMinimo(code);
  }
  if (relPath.endsWith('.kts')) {
    return formatarKotlinMinimo(code);
  }
  if (relPath.endsWith('.go')) {
    return formatarGoMinimo(code);
  }
  if (relPath.endsWith('.gitignore') || path.basename(relPath).toLowerCase() === '.gitignore') {
    return formatarGitignoreMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.editorconfig') {
    return formatarEditorconfigMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.npmrc' || relPath.endsWith('.npmrc')) {
    return formatarNpmrcMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.nvmrc' || relPath.endsWith('.nvmrc')) {
    return formatarNvmrcMinimo(code);
  }
  if (relPath.endsWith('.json5')) {
    return formatarJson5Minimo(code);
  }
  if (relPath.endsWith('.txt') || relPath.endsWith('.log') || relPath.endsWith('.env') || relPath.includes('ignore')) {
    return formatarCodeMinimo(code, {
      normalizarSeparadoresDeSecao: false,
      relPath,
      parser: 'code',
    });
  }
  const formatted = normalizarNewlinesFinais(
    removerEspacosFinaisPorLinha(normalizarFimDeLinha(code)),
  );
  return {
    ok: true,
    parser: 'code',
    formatted,
    changed: formatted !== normalizarNewlinesFinais(normalizarFimDeLinha(code)),
  };
}
type PrettierApi = {
  format: (code: string, options: Record<string, unknown>) => string | Promise<string>;
  resolveConfig: (fileCaminho: string, options?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
};
const prettierCache = new Map<string, Promise<PrettierApi | null>>();
async function carregarPrettierDoProjeto(baseDir: string): Promise<PrettierApi | null> {
  const base = baseDir || process.cwd();
  const cached = prettierCache.get(base);
  if (cached) return cached;
  const loader = (async (): Promise<PrettierApi | null> => {
    const tryImportPrettier = async (resolved: string): Promise<PrettierApi | null> => {
      try {
        const mod = (await import(resolved)) as unknown as {
          default?: unknown;
        };
        const api = (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod) as PrettierApi | undefined;
        if (!api || typeof api.format !== 'function' || typeof api.resolveConfig !== 'function') {
          return null;
        }
        return api;
      } catch {
        return null;
      }
    };
    const tryResolveFrom = async (req: NodeRequire): Promise<PrettierApi | null> => {
      try {
        const resolved = req.resolve('prettier');
        return await tryImportPrettier(resolved);
      } catch {
        return null;
      }
    };

    // 1) Resolve a partir do projeto-alvo (comportamento atual).
    try {
      const projectPkg = path.join(base, 'package.json');
      if (fs.existsSync(projectPkg)) {
        const api = await tryResolveFrom(createRequire(projectPkg));
        if (api) return api;
      }
    } catch {
      // ignora
    }

    // 2) Fallback: tenta resolver do contexto do Prometheus (útil em dev, monorepos, etc.).
    {
      const api = await tryResolveFrom(createRequire(import.meta.url));
      if (api) return api;
    }

    // 3) Fallback: bundle local em feedback/prettier (quando existe no workspace).
    // Mantém isso “best effort” para não mudar comportamento em instalações normais.
    const feedbackDir = process.env.PROMETHEUS_PRETTIER_FEEDBACK_DIR || path.join(base, 'feedback', 'prettier');
    const feedbackPkg = path.join(feedbackDir, 'package.json');
    if (fs.existsSync(feedbackPkg)) {
      const candidates = [path.join(feedbackDir, 'index.mjs'), path.join(feedbackDir, 'index.cjs')];
      for (const p of candidates) {
        if (!fs.existsSync(p)) continue;
        const api = await tryImportPrettier(p);
        if (api) return api;
      }
    }
    return null;
  })();
  prettierCache.set(base, loader);
  return loader;
}
function inferPrettierParser(relPath?: string, code?: string): string | null {
  const info = getSyntaxInfoForPath(relPath ?? '');
  if (!info) return null;
  if (!info.formatavel) return null;
  const rp = (relPath ?? '').toLowerCase();
  if (rp.endsWith('.json')) {
    const src = code ?? '';
    const normalized = normalizarFimDeLinha(src);
    const temComentarios = /(^|\n)\s*\/\//.test(normalized) || /(^|\n)\s*\/\*/.test(normalized);
    return temComentarios ? 'jsonc' : 'json';
  }
  return info.parser ?? null;
}
export async function formatarComPrettierProjeto(params: {
  code: string;
  relPath: string;
  baseDir?: string;
}): Promise<FormatadorMinimoResult> {
  const baseDir = params.baseDir || process.cwd();
  const relPath = params.relPath;
  const absCaminho = path.resolve(baseDir, relPath);
  const prettier = await carregarPrettierDoProjeto(baseDir);
  if (!prettier) {
    return {
      ok: true,
      parser: 'unknown',
      formatted: params.code,
      changed: false,
      reason: 'prettier-nao-disponivel'
    };
  }
  const parser = inferPrettierParser(relPath, params.code);
  if (!parser) {
    return {
      ok: true,
      parser: 'unknown',
      formatted: params.code,
      changed: false,
      reason: 'prettier-parser-desconhecido'
    };
  }
  try {
    const resolvedConfiguracao = await prettier.resolveConfig(absCaminho, {
      editorconfig: true
    });

    // Heurística: quando o projeto NÃO define `singleQuote`, inferimos a preferência
    // a partir do conteúdo do arquivo para evitar que o formatador troque o estilo
    // de aspas inesperadamente (ex.: converta ' para " ou vice-versa).
    const inferSingleQuoteFromCodigo = (src: string): boolean => {
      try {
        // Conta ocorrências de aspas simples e duplas fora de comentários/string parsing
        // Heurística simples: conta totais brutos (suficiente para maioria dos casos).
        const singles = (src.match(/'/g) || []).length;
        const doubles = (src.match(/"/g) || []).length;
        return singles > doubles;
      } catch {
        return false;
      }
    };
    const options: Record<string, unknown> = {
      ...(resolvedConfiguracao || {}),
      filepath: absCaminho,
      parser
    };

    // Se o projeto não especificou explicitamente `singleQuote`, aplicar inferência
    if (!resolvedConfiguracao || !Object.prototype.hasOwnProperty.call(resolvedConfiguracao, 'singleQuote')) {
      if (parser === 'babel' || parser === 'typescript') {
        options.singleQuote = inferSingleQuoteFromCodigo(params.code);
      }
    }
    const out = await prettier.format(params.code, options);
    const formatted = String(out);
    return {
      ok: true,
      parser: 'code',
      formatted,
      changed: formatted !== params.code,
      reason: 'prettier-projeto'
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      parser: 'code',
      error: msg
    };
  }
}

function formatarGoMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let inComment = false;
  let inString = false;
  const stringChar = '';
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

function formatarGitignoreMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let prevBlank = false;

  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    // Remove espaços em branco à direita
    if (!trimmed) {
      // Evita múltiplas linhas em branco consecutivas
      if (!prevBlank) {
        out.push('');
      }
      prevBlank = true;
      continue;
    }
    prevBlank = false;
    // Mantém comentários e padrões como estão, só normaliza
    out.push(trimmed);
  }

  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'gitignore',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-gitignore',
  };
}

function formatarEditorconfigMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let currentSection = '';
  let currentEntries: Array<{ key: string; value: string; comment?: string }> = [];

  const flushSection = () => {
    if (currentSection) {
      out.push(`[${currentSection}]`);
      if (currentEntries.length > 0) {
        const maxKeyLen = Math.max(...currentEntries.map(e => e.key.length));
        for (const entry of currentEntries) {
          const paddedKey = entry.key.padEnd(maxKeyLen);
          const commentPart = entry.comment ? ` ${entry.comment}` : '';
          out.push(`${paddedKey} = ${entry.value}${commentPart}`);
        }
      }
      out.push('');
      currentEntries = [];
      currentSection = '';
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) {
      continue;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith(';')) {
      // Comentário dentro de seção
      if (currentSection && currentEntries.length > 0) {
        currentEntries[currentEntries.length - 1].comment = trimmed;
      } else {
        out.push(trimmed);
      }
      continue;
    }
    const sectionMatch = trimmed.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      flushSection();
      currentSection = sectionMatch[1]?.trim() ?? '';
      continue;
    }
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0 && currentSection) {
      const key = trimmed.slice(0, eqIdx).trim().toLowerCase();
      const val = trimmed.slice(eqIdx + 1).trim();
      currentEntries.push({ key, value: val });
      continue;
    }
    // Linha fora de seção ou inválida
    out.push(trimmed);
  }

  flushSection();
  const formatted = normalizarNewlinesFinais(out.join('\n').replace(/\n{3,}/g, '\n\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'editorconfig',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-editorconfig',
  };
}

function formatarKotlinMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let indent = 0;
  let inMultilineString = false;
  let inMultilineComment = false;

  for (const raw of lines) {
    const trimmed = raw.trimEnd();

    // Strings multiline (triple-quoted)
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

    // Comentários multiline
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

    // Comentários de linha única
    if (trimmed.startsWith('//')) {
      out.push(trimmed);
      continue;
    }

    // Linha vazia
    if (!trimmed.trim()) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }

    // Ajusta indentação baseada em chaves/parênteses
    const closeCount = (trimmed.match(/[})\]]/g) || []).length;
    const openCount = (trimmed.match(/[{(\[]/g) || []).length;

    if (trimmed.startsWith('}') || trimmed.startsWith(')') || trimmed.startsWith(']')) {
      indent = Math.max(0, indent - 1);
    }

    const line = `${'    '.repeat(indent)}${trimmed}`;
    out.push(line);

    // Incrementa indent se abrir bloco
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

function formatarNpmrcMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];

  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    if (!trimmed) {
      if (out.length > 0 && out[out.length - 1] !== '') {
        out.push('');
      }
      continue;
    }
    if (trimmed.startsWith('#') || trimmed.startsWith(';')) {
      out.push(trimmed);
      continue;
    }
    // Mantém configurações key=value
    out.push(trimmed);
  }

  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'npmrc',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-npmrc',
  };
}

function formatarJson5Minimo(code: string): FormatadorMinimoResult {
  // JSON5 suporta comentários e trailing commas, então tratamos como código genérico
  // mantendo formatação básica
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: false,
    parser: 'json5',
  });
}

function formatarNvmrcMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code)).trim();
  // .nvmrc deve conter apenas uma linha com versão do Node
  const formatted = `${normalized}\n`;
  return {
    ok: true,
    parser: 'nvmrc',
    formatted,
    changed: formatted !== `${code.trim()}\n`,
    reason: 'estilo-prometheus-nvmrc',
  };
}

function formatarTypeScriptMinimo(code: string, relPath: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const protectedLines = getProtectedLinesFromTemplateLiterals(normalized, relPath);
  const semEspacos = removerEspacosFinaisPorLinhaComProtecao(normalized, protectedLines);
  const { code: comSeparadores } = normalizarSeparadoresDeSecao(semEspacos, {
    relPath,
    protectedLines,
  });
  const { code: limitado } = limitarLinhasEmBranco(comSeparadores, 2, protectedLines);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'typescript',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-typescript',
  };
}

function formatarJavaScriptMinimo(code: string, relPath: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const protectedLines = getProtectedLinesFromTemplateLiterals(normalized, relPath);
  const semEspacos = removerEspacosFinaisPorLinhaComProtecao(normalized, protectedLines);
  const { code: comSeparadores } = normalizarSeparadoresDeSecao(semEspacos, {
    relPath,
    protectedLines,
  });
  const { code: limitado } = limitarLinhasEmBranco(comSeparadores, 2, protectedLines);
  const formatted = normalizarNewlinesFinais(limitado);
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'babel',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-javascript',
  };
}

// Registrar formatadores padrão — facilita extensão futura e evita que o motor
// Prettier seja invocado para arquivos que temos handlers dedicados.
registerFormatter('.json', (code, _relPath) => formatarJsonMinimo(code));
registerFormatter('.lock', (code, _relPath) => formatarJsonMinimo(code));
registerFormatter('.md', (code, _relPath) => formatarMarkdownMinimo(code));
registerFormatter('.markdown', (code, _relPath) => formatarMarkdownMinimo(code));
registerFormatter('.yml', (code, _relPath) => formatarYamlMinimo(code));
registerFormatter('.yaml', (code, _relPath) => formatarYamlMinimo(code));
registerFormatter('.xml', (code, _relPath) => formatarXmlMinimo(code));
registerFormatter('.svg', (code, _relPath) => formatarSvgMinimo(code));
registerFormatter('.html', (code, _relPath) => formatarHtmlMinimo(code));
registerFormatter('.htm', (code, _relPath) => formatarHtmlMinimo(code));
registerFormatter('.css', (code, _relPath) => formatarCssMinimo(code));
registerFormatter('.scss', (code, _relPath) => formatarScssMinimo(code));
registerFormatter('.less', (code, _relPath) => formatarLessMinimo(code));
registerFormatter('.sql', (code, _relPath) => formatarSqlMinimo(code));
registerFormatter('.toml', (code, _relPath) => formatarTomlMinimo(code));
registerFormatter('.ini', (code, _relPath) => formatarIniMinimo(code));
registerFormatter('.sh', (code, _relPath) => formatarShellMinimo(code));
registerFormatter('.bash', (code, _relPath) => formatarShellMinimo(code));
registerFormatter('.gradle', (code, _relPath) => formatarGradleMinimo(code));
registerFormatter('.properties', (code, _relPath) => formatarPropertiesMinimo(code));
registerFormatter('.java', (code, _relPath) => formatarJavaMinimo(code));
registerFormatter('.py', (code, _relPath) => formatarPythonMinimo(code));
registerFormatter('.php', (code, _relPath) => formatarPhpMinimo(code));
registerFormatter('.kt', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.kts', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.jsonc', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'json' }));
registerFormatter('.dockerfile', (code, _relPath) => formatarDockerfileMinimo(code));
registerFormatter('.txt', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.log', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.env', (code, _relPath) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.go', (code, _relPath) => formatarGoMinimo(code));
registerFormatter('.gitignore', (code, _relPath) => formatarGitignoreMinimo(code));
registerFormatter('.editorconfig', (code, _relPath) => formatarEditorconfigMinimo(code));
registerFormatter('.npmrc', (code, _relPath) => formatarNpmrcMinimo(code));
registerFormatter('.nvmrc', (code, _relPath) => formatarNvmrcMinimo(code));
registerFormatter('.json5', (code, _relPath) => formatarJson5Minimo(code));
registerFormatter('.kt', (code, _relPath) => formatarKotlinMinimo(code));
registerFormatter('.kts', (code, _relPath) => formatarKotlinMinimo(code));
registerFormatter('.ts', (code, relPath) => formatarTypeScriptMinimo(code, relPath));
registerFormatter('.tsx', (code, relPath) => formatarTypeScriptMinimo(code, relPath));
registerFormatter('.cts', (code, relPath) => formatarTypeScriptMinimo(code, relPath));
registerFormatter('.mts', (code, relPath) => formatarTypeScriptMinimo(code, relPath));
registerFormatter('.js', (code, relPath) => formatarJavaScriptMinimo(code, relPath));
registerFormatter('.jsx', (code, relPath) => formatarJavaScriptMinimo(code, relPath));
registerFormatter('.mjs', (code, relPath) => formatarJavaScriptMinimo(code, relPath));
registerFormatter('.cjs', (code, relPath) => formatarJavaScriptMinimo(code, relPath));

// Antes de delegar ao Prettier no fluxo "auto/prettier", verificamos se existe
// um formatador registrado. Essa função auxilia o comando `formatar`.
export function getRegisteredFormatter(relPath: string): FormatterFn | null {
  return getFormatterForPath(relPath);
}