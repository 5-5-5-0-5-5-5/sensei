// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the project structure detector.
 * Provides text templates to detect monorepos, fullstack structures,
 * backend/frontend signals, multiple entrypoints, configuration files,
 * and directory naming conventions.
 */

type EntrypointsAgrupadosArgs = {
  previewGrupos: string;
  sufixoOcultos?: string;
};
export const DetectorEstruturaMensagens = {
  monorepoDetectado: 'Monorepo structure detected.',
  monorepoSemPackages: 'Monorepo without packages/ folder.',
  fullstackDetectado: 'Fullstack structure detected.',
  pagesSemApi: 'Project has pages/ but does not have api/.',
  estruturaMista: 'Project has both src/ and packages/ (monorepo) at the same time. Review the organization.',
  muitosArquivosRaiz: 'Too many files at the project root. Consider organizing into folders.',
  sinaisBackend: 'Backend signals detected (controllers/, prisma/, api/).',
  sinaisFrontend: 'Frontend signals detected (components/, pages/).',
  projetoGrandeSemSrc: 'Large project without src/ folder. Consider organizing the source code.',
  arquivosConfigDetectados: (detectados: string[]) => `Configuration files detected: ${detectados.join(', ')}`,
  multiplosEntrypointsAgrupados: ({
    previewGrupos,
    sufixoOcultos
  }: EntrypointsAgrupadosArgs) => sufixoOcultos && sufixoOcultos.length > 0 ? `Project has multiple entrypoints (grouped by directory): ${previewGrupos} … (${sufixoOcultos} hidden)` : `Project has multiple entrypoints (grouped by directory): ${previewGrupos}`,
  multiplosEntrypointsLista: (preview: string[], resto: number) => resto > 0 ? `Project has multiple entrypoints: ${preview.join(', ')} … (+${resto} hidden)` : `Project has multiple entrypoints: ${preview.join(', ')}`,
  nomeDiretorioNaoConforme: (atual: string, esperado: string) => `Directory '${atual}' does not follow the naming convention. Expected name: '${esperado}'.`
} as const;
