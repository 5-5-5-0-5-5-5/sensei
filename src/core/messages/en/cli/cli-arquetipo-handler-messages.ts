// SPDX-License-Identifier: MIT

import { ICONES_FEEDBACK } from '../../shared/icons.js';

export const CliArquetipoHandlerMessages = {
  timeoutDetection: `${ICONES_FEEDBACK.atencao} Archetype detection timed out`,
  detectionError: (mensagem: string) => `Error in archetype detection: ${mensagem}`,
  devErrorPrefix: '[Archetype Handler] Error:',
  saveFailure: (mensagem: string) => `Failed to save archetype: ${mensagem}`
} as const;
export const CliArquetipoHandlerMensagens = CliArquetipoHandlerMessages;
