// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the dependencies detector.
 * Provides text templates to detect imports/requires of external dependencies,
 * long relative paths, non-existent files, mixed require/import usage,
 * circular imports, and other import bad practices.
 */

export const DetectorDependenciasMensagens = {
  importDependenciaExterna: (val: string) => `External dependency import: '${val}'`,
  importRelativoLongo: (val: string) => `Relative import goes up too many directories: '${val}'`,
  importJsEmTs: (val: string) => `Import of .js ファイル in TypeScript: '${val}'`,
  importArquivoInexistente: (val: string) => `Import of non-existent ファイル: '${val}'`,
  requireDependenciaExterna: (val: string) => `Require of external dependency: '${val}'`,
  requireRelativoLongo: (val: string) => `Relative require goes up too many directories: '${val}'`,
  requireJsEmTs: (val: string) => `Require of .js ファイル in TypeScript: '${val}'`,
  requireArquivoInexistente: (val: string) => `Require of non-existent ファイル: '${val}'`,
  importUsadoRegistroDinamico: (nome: string) => `Import '${nome}' used via dynamic registration (heuristic)`,
  usoMistoRequireImport: 'Mixed usage of require and import in the same file. Standardize to a single style.',
  importCircularSelf: 'Circular import detected: the file imports itself.',
  dependenciaCircular: (totalArquivos: number, caminhoCompleto: string) => `Circular dependency detected (${totalArquivos} file(s)): ${caminhoCompleto}`
} as const;
