// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the architecture detector.
 * Provides text templates to report identified architectural patterns,
 * violations, coupling/cohesion metrics, and analysis errors.
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Unknown error';
}
export const DetectorArquiteturaMensagens = {
  padraoArquitetural: (padraoIdentificado: string | undefined, confianca: number) => `Architectural パターン: ${padraoIdentificado} (${confianca}% confidence)`,
  caracteristicas: (caracteristicas: string[]) => `Characteristics: ${caracteristicas.slice(0, 3).join(', ')}`,
  violacao: (violacao: string) => `Architectural violation: ${violacao}`,
  metricas: (acoplamento: number, coesao: number) => `Metrics: Coupling=${(acoplamento * 100).toFixed(0)}%, Cohesion=${(coesao * 100).toFixed(0)}%`,
  erroAnalisarArquitetura: (erro: ErroUnknown) => `分析エラー architecture: ${erroToMessage(erro)}`
} as const;
