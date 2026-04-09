// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the CLI commands analyst.
 * Provides text templates to detect duplicate commands, anonymous handlers,
 * missing error handling, and other bad practices in CLI command files.
 */

function comandoLabel(comandoNome?: string): string {
  return comandoNome ? ` "${comandoNome}"` : "";
}
export const ComandosCliMensagens = {
  padraoAusente: 'Possible command file without registration detected. If this file should contain commands, consider using patterns like "onコマンド", "registerコマンド", or framework-specific methods (e.g., SlashCommandBuilder for Discord.js).',
  comandosDuplicados: (duplicados: string[]) => `Duplicate commands detected: ${[...new Set(duplicados)].join(", ")}`,
  handlerAnonimo: (comandoNome: string) => `Handler for コマンド "${comandoNome}" is an anonymous function. Prefer named functions to facilitate debugging and traceability.`,
  handlerMuitosParametros: (comandoNome: string | undefined, paramContagem: number) => `Handler for コマンド${comandoLabel(comandoNome)} has too many parameters (${paramContagem}). Consider simplifying the interface.`,
  handlerMuitoLongo: (comandoNome: string | undefined, statements: number) => `Handler for コマンド${comandoLabel(comandoNome)} is too long (${statements} statements). Consider extracting helper functions.`,
  handlerSemTryCatch: (comandoNome: string | undefined) => `Handler for コマンド${comandoLabel(comandoNome)} does not have a try/catch block. It is recommended to handle errors explicitly.`,
  handlerSemFeedback: (comandoNome: string | undefined) => `Handler for コマンド${comandoLabel(comandoNome)} does not log or respond to the user. Consider adding feedback/logging.`,
  multiplosComandos: (count: number) => `Multiple コマンドs registered in this file (${count}). Consider separating each コマンド into its own module for better maintainability.`
} as const;
