// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerEspacosFinaisPorLinha, limitarLinhasEmBranco } from './utils.js';

export function formatarYamlMinimo(code: string): FormatadorMinimoResult {
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