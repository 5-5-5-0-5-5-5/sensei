// SPDX-License-Identifier: MIT

export const CliOtimizarSvgExtraMensagens = {
  titulo: 'OPTIMIZE SVG',
  nenhumSvgAcimaLimiar: 'No SVG above the optimization threshold.',
  arquivoOtimizado: '{arquivo} — {original} → {otimizado} (−{economia})',
  arquivoOtimizadoDry: '[dry] {arquivo} — {original} → {otimizado} (−{economia})',
  candidatosSvg: 'Candidates: {candidatos} | Potential savings: {economiaTotal} | Total SVGs read: {total}',
  otimizacaoAplicada: 'Optimization applied to {aplicados}/{candidatos} files.',
  useWriteAplicar: 'Use --write to apply optimizations.',
  falhaOtimizarSvg: 'Failed to optimize SVGs: {erro}',
} as const;
