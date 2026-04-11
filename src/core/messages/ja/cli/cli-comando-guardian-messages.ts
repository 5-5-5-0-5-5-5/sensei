// SPDX-License-Identifier: MIT

export const CliComandoGuardianMensagens = {
  baselineNaoPermitidoFullScan: '--full-scan モードでベースラインを受け入れることはできません。フラグを削除して再実行してください。',
  diffMudancasDetectadas: (drift: number) => `ベースライン以降に ${drift}件の変更が検出されました。`,
  diffComoAceitarMudancas: 'これらの変更を受け入れるには `prometheus guardian --accept-baseline` を実行してください。',
  baselineCriadoComoAceitar: 'ベースラインを受け入れるには `prometheus guardian --accept-baseline` を、再度診断するには `prometheus diagnosticar` を実行してください。'
} as const;
