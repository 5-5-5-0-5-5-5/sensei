// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the syntactic constructions detector.
 * Provides text templates to report identified syntactic constructions
 * and errors during analysis.
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Unknown error';
}
export const DetectorConstrucoesSintaticasMensagens = {
  identificadas: (mensagemFinal: string) => `Syntactic constructions identified: ${mensagemFinal}`,
  erroAnalisar: (erro: ErroUnknown) => `分析エラー syntactic constructions: ${erroToMessage(erro)}`
} as const;
