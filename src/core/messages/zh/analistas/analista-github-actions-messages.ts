// SPDX-License-Identifier: MIT

/**
 * @fileoverview GitHub Actions 分析师的诊断消息。
 * 提供工作流问题的汇总文本模板。
 */

export const AnalistaGithubActionsMensagens = {
  resumoWorkflow: (score: number, total: number) => `GitHub Actions 工作流：得分 ${score}/100，发现 ${total} 个问题`,
  workflowOtimo: '工作流遵循所有 GitHub Actions 最佳实践',
  workflowBom: '工作流良好，只有少量低优先级问题',
  workflowRegular: '工作流需要注意 - 发现中等问题',
  workflowRuim: '工作流需要紧急改进 - 发现严重问题',
  erroAnalisarWorkflow: (erro: unknown) => `分析工作流时出错：${erro instanceof Error ? erro.message : String(erro)}`,
} as const;
