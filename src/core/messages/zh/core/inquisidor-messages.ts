// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the Inquisitor (AST parser).
 * Provides text templates for reporting parsing failures, AST errors
 * and aggregation of suppressed parsing errors.
 */

export const InquisidorMensagens = {
  parseAstNaoGerada: 'Parsing error: AST not generated (code possibly invalid).',
  parseErro: (erro: string) => `Parsing 错误: ${erro}`,
  parseErrosAgregados: (quantidade: number) => `Aggregated parsing 错误s: ${quantidade} occurrences suppressed in this file (shows 1).`,
  falhaGerarAst: (relPath: string, erro: string) => `Failed to generate AST for ${relPath}: ${erro}`
} as const;
