// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the aggregated findings detector.
 * Provides summarized text templates for security, performance, documentation,
 * and duplication issues, with pagination support for results.
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Unknown error';
}
export const DetectorAgregadosMensagens = {
  problemasSegurancaResumo: (severidade: string, resumo: string, total: number) => `Security issues (${severidade}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarSeguranca: (erro: ErroUnknown) => `Error analyzing security: ${erroToMessage(erro)}`,
  problemasPerformanceResumo: (impacto: string, resumo: string, total: number) => `Performance issues (${impacto}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarPerformance: (erro: ErroUnknown) => `Error analyzing performance: ${erroToMessage(erro)}`,
  problemasDocumentacaoResumo: (prioridade: string, resumo: string, total: number) => `Documentation issues (${prioridade}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarDocumentacao: (erro: ErroUnknown) => `Error analyzing documentation: ${erroToMessage(erro)}`,
  duplicacoesResumo: (tipo: string, resumo: string, total: number) => `${tipo} duplications: ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarDuplicacoes: (erro: ErroUnknown) => `Error analyzing duplications: ${erroToMessage(erro)}`
} as const;
