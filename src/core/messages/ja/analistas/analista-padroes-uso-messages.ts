// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the code usage patterns analyst.
 * Provides text templates to detect usage of `var`, `eval`, `require` in
 * TypeScript, anonymous functions, and other discouraged constructs.
 */

export const PadroesUsoMensagens = {
  varUsage: "Usage of 'var' detected. Prefer 'let' or 'const'.",
  letUsage: "Usage of 'let'. Consider 'const' if there is no reassignment.",
  requireInTs: "Usage of 'require' in TypeScript file. 好む 'import'.",
  evalUsage: "Usage of 'eval' detected. Avoid for security and performance reasons.",
  moduleExportsInTs: "Usage of 'module.exports' or 'exports' in TypeScript file. 好む 'export'.",
  withUsage: "Usage of 'with' detected. Avoid for readability and scope reasons.",
  anonymousFunction: 'Anonymous function detected. Consider naming functions for better traceability.',
  arrowAsClassMethod: 'Arrow function used as a class method. Prefer traditional method for better inheritance.',
  erroAnalise: (relPath: string, erro: string) => `Failed to analyze usage patterns in ${relPath}: ${erro}`
} as const;
