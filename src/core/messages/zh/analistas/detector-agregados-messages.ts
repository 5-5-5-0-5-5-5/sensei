// SPDX-License-Identifier: MIT

/**
 * @fileoverview 聚合检测器的诊断消息。
 * 提供安全、性能、文档和重复性问题的汇总文本模板，
 * 支持结果分页。
 */

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : '未知错误';
}
export const DetectorAgregadosMensagens = {
  problemasSegurancaResumo: (severidade: string, resumo: string, total: number) => `安全问题（${severidade}）：${resumo}${total > 3 ? `（+${total - 3} 更多）` : ''}`,
  erroAnalisarSeguranca: (erro: ErroUnknown) => `分析安全时出错：${erroToMessage(erro)}`,
  problemasPerformanceResumo: (impacto: string, resumo: string, total: number) => `性能问题（${impacto}）：${resumo}${total > 3 ? `（+${total - 3} 更多）` : ''}`,
  erroAnalisarPerformance: (erro: ErroUnknown) => `分析性能时出错：${erroToMessage(erro)}`,
  problemasDocumentacaoResumo: (prioridade: string, resumo: string, total: number) => `文档问题（${prioridade}）：${resumo}${total > 3 ? `（+${total - 3} 更多）` : ''}`,
  erroAnalisarDocumentacao: (erro: ErroUnknown) => `分析文档时出错：${erroToMessage(erro)}`,
  duplicacoesResumo: (tipo: string, resumo: string, total: number) => `${tipo}重复：${resumo}${total > 3 ? `（+${total - 3} 更多）` : ''}`,
  erroAnalisarDuplicacoes: (erro: ErroUnknown) => `分析重复时出错：${erroToMessage(erro)}`
} as const;
