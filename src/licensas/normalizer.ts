// SPDX-License-Identifier: MIT
/**
 * License normalizer ported from original JS implementation.
 */

import { getMessages } from '@core/messages/index.js';

import type { SpdxCorrectFn,SpdxParseFn } from '../types/core/config/config.js';

const { log } = getMessages();

export type { SpdxCorrectFn,SpdxParseFn };

type SpdxLicenseEntry = { name?: string } | string;

let spdxParse: SpdxParseFn | null = null;
let spdxCorrect: SpdxCorrectFn | null = null;
let spdxLicencaList: Record<string, SpdxLicenseEntry> | null = null;
let spdxLoaded = false;
async function tryLoadSpdx(): Promise<void> {
  if (spdxLoaded) return;
  spdxLoaded = true;
  try {
    spdxParse = (await import('spdx-expression-parse')).default || (await import('spdx-expression-parse'));
  } catch (err) {
    log.debug(`Erro ao carregar spdx-expression-parse: ${  err instanceof Error ? err.message : String(err)}`);
  }
  try {
    spdxCorrect = (await import('spdx-correct')).default || (await import('spdx-correct'));
  } catch (err) {
    log.debug(`Erro ao carregar spdx-correct: ${  err instanceof Error ? err.message : String(err)}`);
  }
  try {
    spdxLicencaList = (await import('spdx-license-list')).default || (await import('spdx-license-list'));
  } catch (err) {
    log.debug(`Erro ao carregar spdx-license-list: ${  err instanceof Error ? err.message : String(err)}`);
  }
}

function fallbackNormalize(raw: unknown): string {
  if (raw == null) return 'UNKNOWN';
  if (Array.isArray(raw)) return raw.map(r => fallbackNormalize(r)).join(' OR ');
  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    return obj.type != null ? fallbackNormalize(obj.type) : 'UNKNOWN';
  }
  let s = String(raw).trim();
  s = s.replace(/\s+/g, ' ');
  const map: Record<string, string> = {
    mit: 'MIT',
    isc: 'ISC',
    'apache-2.0': 'Apache-2.0',
    apache: 'Apache-2.0',
    gpl: 'GPL',
    agpl: 'AGPL',
    lgpl: 'LGPL'
  };
  const parts = s.split(/\s+(OR|AND)\s+/i);
  return parts.map(p => {
    if (/^(OR|AND)$/i.test(p)) return p.toUpperCase();
    const key = p.toLowerCase();
    if (map[key]) return map[key];
    let token = p.trim();
    try {
      if (spdxCorrect) token = spdxCorrect(token) ?? token;
    } catch (err) {
      log.debug(`Erro ao executar spdxCorrect em fallbackNormalize: ${  err instanceof Error ? err.message : String(err)}`);
    }
    try {
      if (spdxLicencaList) {
        const id = String(token).trim();
        if (spdxLicencaList[id]) return id;
        const matchId = Object.keys(spdxLicencaList).find(k => k.toLowerCase() === String(token).toLowerCase());
        if (matchId) return matchId;
        const matchByNome = Object.entries(spdxLicencaList).find(([, v]) => v && typeof v === 'object' && v.name && String(v.name).toLowerCase() === String(token).toLowerCase());
        if (matchByNome) return matchByNome[0];
      }
    } catch (err) {
      log.debug(`Erro ao buscar na spdxLicencaList em fallbackNormalize: ${  err instanceof Error ? err.message : String(err)}`);
    }
    return token;
  }).join(' ');
}

/**
 * Normalize a license value into a canonical string (preferably SPDX-like).
 * Supports strings, arrays and simple objects ({ type }).
 * Falls back to a heuristic normalizer when full SPDX libraries are not available.
 */
export async function normalizeLicense(raw: unknown): Promise<string> {
  await tryLoadSpdx();
  if (spdxParse && typeof raw === 'string' && /\b(OR|AND)\b/i.test(raw)) {
    return fallbackNormalize(raw);
  }
  if (spdxParse) {
    try {
      if (Array.isArray(raw)) return raw.map(r => awaitOrFallback(r)).join(' OR ');
      if (typeof raw === 'object') raw = (raw as Record<string, unknown>).type ?? raw;
      return awaitOrFallback(raw);
    } catch (err) {
      log.debug(`Erro ao normalizar licença complexa em normalizeLicense: ${  err instanceof Error ? err.message : String(err)}`);
      // fallthrough
    }
  }
  return fallbackNormalize(raw);
  function awaitOrFallback(value: unknown): string {
    try {
      const s = String(value).trim();
      const corrected = spdxCorrect ? spdxCorrect(s) ?? s : s;
      if (spdxParse) {
        try {
          const parsed = spdxParse(corrected);
          return astToExpression(parsed);
        } catch (err) {
          log.debug(`Erro ao parsear licença corrigida em awaitOrFallback: ${  err instanceof Error ? err.message : String(err)}`);
          return corrected;
        }
      }
      return corrected;
    } catch (err) {
      log.debug(`Erro em awaitOrFallback (${  String(value)  }): ${  err instanceof Error ? err.message : String(err)}`);
      return fallbackNormalize(value);
    }
  }
  function astToExpression(ast: unknown): string {
    if (!ast) return 'UNKNOWN';
    if (typeof ast === 'string') return ast;
    const node = ast as Record<string, unknown>;
    if (node.license) return String(node.license);
    if (node.left != null && node.right != null && node.conjunction) {
      return `${astToExpression(node.left)} ${String(node.conjunction).toUpperCase()} ${astToExpression(node.right)}`;
    }
    return JSON.stringify(ast);
  }
}
