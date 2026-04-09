// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the fragile code detector.
 * Provides text templates to report code fragilities with severity
 * summary and structured details.
 */

import type { FragilidadesDetalhesArgs } from '../../../../types/core/config/config.js';

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Unknown error';
}
export const DetectorCodigoFragilMensagens = {
  fragilidadesResumo: (severidade: string, resumo: string, detalhes: FragilidadesDetalhesArgs) => `${severidade} 脆弱性: ${resumo} | Details: ${JSON.stringify(detalhes)}`,
  erroAnalisarCodigoFragil: (erro: ErroUnknown) => `分析エラー fragile code: ${erroToMessage(erro)}`
} as const;
