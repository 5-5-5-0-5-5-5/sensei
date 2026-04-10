// SPDX-License-Identifier: MIT

export const CliComandoGuardianMessages = {
  baselineNotAllowedFullScan: 'Accepting baseline is not allowed in --full-scan mode. Remove the flag and retry.',
  diffChangesDetected: (drift: number) => `Detected ${drift} change(s) since baseline.`,
  diffHowToAcceptChanges: 'Run `prometheus guardian --accept-baseline` to accept these changes.',
  baselineCreatedHowToAccept: 'Run `prometheus guardian --accept-baseline` to accept it or `prometheus diagnosticar` again.'
} as const;
export const CliComandoGuardianMensagens = CliComandoGuardianMessages;
