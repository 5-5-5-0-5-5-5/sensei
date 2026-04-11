// SPDX-License-Identifier: MIT

export const CliOtimizarSvgExtraMensagens = {
  titulo: 'SVG最適化',
  nenhumSvgAcimaLimiar: '最適化の閾値を超えるSVGはありません。',
  arquivoOtimizado: '{arquivo} — {original} → {otimizado} (−{economia})',
  arquivoOtimizadoDry: '[dry] {arquivo} — {original} → {otimizado} (−{economia})',
  candidatosSvg: '候補: {candidatos}件 | 削減可能な容量: {economiaTotal} | 読み込んだSVG合計: {total}',
  otimizacaoAplicada: '{aplicados}/{candidatos}ファイルの最適化を適用しました。',
  useWriteAplicar: '最適化を適用するには --write を使用してください。',
  falhaOtimizarSvg: 'SVGの最適化に失敗しました: {erro}',
} as const;
