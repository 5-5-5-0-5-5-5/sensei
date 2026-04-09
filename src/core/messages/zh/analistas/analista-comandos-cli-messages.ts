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
  padraoAusente: 'Possible command file without registration detected. If this file should contain commands, consider using patterns like "on命令", "register命令", or framework-specific methods (e.g., SlashCommandBuilder for Discord.js).',
  comandosDuplicados: (duplicados: string[]) => `Duplicate commands 检测到: ${[...new Set(duplicados)].join(", ")}`,
  handlerAnonimo: (comandoNome: string) => `Handler for 命令 "${comandoNome}" is an anonymous function. Prefer named functions to facilitate debugging and traceability.`,
  handlerMuitosParametros: (comandoNome: string | undefined, paramContagem: number) => `Handler for 命令${comandoLabel(comandoNome)} has too many parameters (${paramContagem}). Consider simplifying the interface.`,
  handlerMuitoLongo: (comandoNome: string | undefined, statements: number) => `Handler for 命令${comandoLabel(comandoNome)} is too long (${statements} statements). Consider extracting helper functions.`,
  handlerSemTryCatch: (comandoNome: string | undefined) => `Handler for 命令${comandoLabel(comandoNome)} does not have a try/catch block. It is recommended to handle errors explicitly.`,
  handlerSemFeedback: (comandoNome: string | undefined) => `Handler for 命令${comandoLabel(comandoNome)} does not log or respond to the user. Consider adding feedback/logging.`,
  multiplosComandos: (count: number) => `Multiple 命令s registered in this file (${count}). Consider separating each 命令 into its own module for better maintainability.`
} as const;
