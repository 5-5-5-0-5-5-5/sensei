// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

export function formatarGitignoreMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code));
  const lines = normalized.split('\n');
  const out: string[] = [];
  let prevBlank = false;
  for (const raw of lines) {
    const trimmed = raw.trimEnd();
    if (!trimmed) {
      if (!prevBlank) {
        out.push('');
      }
      prevBlank = true;
      continue;
    }
    prevBlank = false;
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

export function formatarEditorconfigMinimo(code: string): FormatadorMinimoResult {
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

export function formatarNpmrcMinimo(code: string): FormatadorMinimoResult {
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

export function formatarNvmrcMinimo(code: string): FormatadorMinimoResult {
  const normalized = normalizarFimDeLinha(removerBom(code)).trim();
  const formatted = `${normalized}\n`;
  return {
    ok: true,
    parser: 'nvmrc',
    formatted,
    changed: formatted !== `${code.trim()}\n`,
    reason: 'estilo-prometheus-nvmrc',
  };
}