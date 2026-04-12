// SPDX-License-Identifier: MIT

/**
 * @fileoverview Mensagens de diagnóstico para o detector de achados agregados.
 * Fornece templates de texto resumidos para problemas de segurança, performance,
 * documentação e duplicações, com suporte a paginação de resultados.
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : 'Erro desconhecido';
}
export const DetectorAgregadosMensagens = {
  problemasSegurancaResumo: (severidade: string, resumo: string, total: number) => `Problemas de segurança (${severidade}): ${resumo}${total > 3 ? ` (+${total - 3} mais)` : ''}`,
  erroAnalisarSeguranca: (erro: ErroUnknown) => `Erro ao analisar segurança: ${erroToMessage(erro)}`,
  problemasPerformanceResumo: (impacto: string, resumo: string, total: number) => `Problemas de performance (${impacto}): ${resumo}${total > 3 ? ` (+${total - 3} mais)` : ''}`,
  erroAnalisarPerformance: (erro: ErroUnknown) => `Erro ao analisar performance: ${erroToMessage(erro)}`,
  problemasDocumentacaoResumo: (prioridade: string, resumo: string, total: number) => `Problemas de documentação (${prioridade}): ${resumo}${total > 3 ? ` (+${total - 3} mais)` : ''}`,
  erroAnalisarDocumentacao: (erro: ErroUnknown) => `Erro ao analisar documentação: ${erroToMessage(erro)}`,
  duplicacoesResumo: (tipo: string, resumo: string, total: number) => `Duplicações ${tipo}: ${resumo}${total > 3 ? ` (+${total - 3} mais)` : ''}`,
  erroAnalisarDuplicacoes: (erro: ErroUnknown) => `Erro ao analisar duplicações: ${erroToMessage(erro)}`
} as const;