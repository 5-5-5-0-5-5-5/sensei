// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_STATUS } from '../../shared/icons.js';

export const CliComandoReestruturarMessages = {
  inicio: `\n${ICONES_COMANDO.reestruturar} Starting restructuring process...\n`,
  spinnerCalculandoPlano: `${ICONES_DIAGNOSTICO.progresso} Calculating restructuring plan...`,
  planoSugeridoFast: (origem: string, moverLen: number) => `${ICONES_STATUS.ok} Suggested plan (${origem}) FAST: ${moverLen} move(s)`,
  dryRunFast: 'Dry-run requested (--plan-only). (FAST MODE)',
  reestruturacaoConcluidaFast: (moverLen: number) => `${ICONES_STATUS.ok} Restructuring completed: ${moverLen} moves. (FAST MODE)`,
  planoCalculadoFastSemAplicar: 'Plan calculated in FAST MODE (no actions applied without --auto).',
  erroDuranteReestruturacao: (erroMensagem: string) => `${ICONES_STATUS.falha} Error during restructuring: ${erroMensagem}`,
  spinnerPlanoVazio: 'Empty plan: no moves suggested.',
  spinnerPlanoSugerido: (origem: string, moverLen: number) => `Suggested plan (${origem}): ${moverLen} move(s)`,
  spinnerConflitosDetectados: (qtd: number) => `Conflicts detected: ${qtd}`,
  spinnerSemPlanoSugestao: 'No suggested plan (no candidates or error). Using occurrences.',
  dryRunCompleto: 'Dry-run requested (--plan-only). No actions applied.',
  dicaParaAplicar: 'To apply the actual moves, run again with the --auto (or --apply) flag.',
  fallbackProblemasEstruturais: (qtd: number) => `\n${qtd} structural problems detected for correction:`,
  fallbackLinhaOcorrencia: (tipo: string, rel: string, mensagem: string) => `- [${tipo}] ${rel}: ${mensagem}`,
  nenhumNecessario: 'No structural correction needed. Repository already optimized!',
  canceladoErroPrompt: `${ICONES_STATUS.falha} Restructuring canceled. (Prompt error)`,
  canceladoUseAuto: `${ICONES_STATUS.falha} Restructuring canceled. (Use --auto to apply without prompt)`,
  spinnerAplicando: `${ICONES_ACAO.correcao} Applying moves...`,
  reestruturacaoConcluida: (qtd: number, frase: string) => `Restructuring completed: ${qtd} ${frase}.`,
  falhaReestruturacao: 'Restructuring failed.'
} as const;
export const CliComandoReestruturarMensagens = CliComandoReestruturarMessages;
