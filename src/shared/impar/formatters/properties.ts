// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerBom, limitarLinhasEmBranco } from './utils.js';

export function formatarPropertiesMinimo(code: string): FormatadorMinimoResult {
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

export function formatarGradleMinimo(code: string): FormatadorMinimoResult {
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
    parser: 'gradle',
    formatted,
    changed: formatted !== baseline,
    reason: 'estilo-prometheus-gradle',
  };
}