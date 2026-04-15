// SPDX-License-Identifier: MIT

import type { FormatadorMinimoParser, FormatadorMinimoResult } from '@';

import {
  getProtectedLinesFromTemplateLiterals,
  isJsTsFile,
  limitarLinhasEmBranco,
  normalizarFimDeLinha,
  normalizarNewlinesFinais,
  normalizarSeparadoresDeSecao,
  removerBom,
  removerEspacosFinaisPorLinhaComProtecao,
} from './utils.js';

export function formatarCodeMinimo(code: string, opts: {
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

export function formatarTypeScriptMinimo(code: string, relPath: string): FormatadorMinimoResult {
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

export function formatarJavaScriptMinimo(code: string, relPath: string): FormatadorMinimoResult {
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

export function formatarJavaMinimo(code: string): FormatadorMinimoResult {
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

export function formatarPythonMinimo(code: string): FormatadorMinimoResult {
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

export function formatarPhpMinimo(code: string): FormatadorMinimoResult {
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: false,
    parser: 'php',
  });
}