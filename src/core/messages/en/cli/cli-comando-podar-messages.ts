// SPDX-License-Identifier: MIT

import { ICONES_COMANDO } from '../../shared/icons.js';

export const CliComandoPodarMessages = {
  start: `\n${ICONES_COMANDO.podar} Starting pruning process...\n`,
  noDebris: (iconeSucesso: string) => `${iconeSucesso} No debris detected. Clean repository!`,
  orphansDetected: (qtd: number) => `\n${qtd} orphan files detected:`,
  orphanFileLine: (arquivo: string) => `- ${arquivo}`,
  confirmRemoval: 'Are you sure you want to remove these files? (y/N) ',
  errorDuringPruning: (erroMensagem: string) => `[ERROR] Error during pruning: ${erroMensagem}`
} as const;
export const CliComandoPodarMensagens = CliComandoPodarMessages;
