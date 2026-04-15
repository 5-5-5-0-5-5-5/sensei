// SPDX-License-Identifier: MIT

import type { FormatadorMinimoResult } from '@';

import { otimizarSvgLikeSvgo } from '../svgs.js';

export function formatarSvgMinimo(code: string): FormatadorMinimoResult {
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