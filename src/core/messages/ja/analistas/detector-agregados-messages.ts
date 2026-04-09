// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the aggregated findings detector.
 * Provides summarized text templates for security, performance, documentation,
 * duplication, and test quality issues, with pagination support for results.
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Unknown error';
}
export const DetectorAgregadosMensagens = {
  problemasSegurancaResumo: (severidade: string, resumo: string, total: number) => `Security issues (${severidade}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarSeguranca: (erro: ErroUnknown) => `分析エラー security: ${erroToMessage(erro)}`,
  problemasPerformanceResumo: (impacto: string, resumo: string, total: number) => `Performance issues (${impacto}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarPerformance: (erro: ErroUnknown) => `分析エラー performance: ${erroToMessage(erro)}`,
  problemasDocumentacaoResumo: (prioridade: string, resumo: string, total: number) => `Documentation issues (${prioridade}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarDocumentacao: (erro: ErroUnknown) => `分析エラー documentation: ${erroToMessage(erro)}`,
  duplicacoesResumo: (tipo: string, resumo: string, total: number) => `${tipo} duplications: ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarDuplicacoes: (erro: ErroUnknown) => `分析エラー duplications: ${erroToMessage(erro)}`,
  problemasTesteResumo: (severidade: string, resumo: string, total: number) => `Test issues (${severidade}): ${resumo}${total > 3 ? ` (+${total - 3} more)` : ''}`,
  erroAnalisarQualidadeTestes: (erro: ErroUnknown) => `分析エラー test quality: ${erroToMessage(erro)}`
} as const;
