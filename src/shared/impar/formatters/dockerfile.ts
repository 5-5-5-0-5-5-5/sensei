// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom } from './utils.js';

export function formatarDockerfileMinimo(code: string): FormatadorMinimoResult {
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

export function formatarShellMinimo(code: string): FormatadorMinimoResult {
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
  const formatted = normalizarNewlinesFinais(out.join('\n'));
  const baseline = normalizarNewlinesFinais(normalized);
  return {
    ok: true,
    parser: 'shell',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-shell',
  };
}