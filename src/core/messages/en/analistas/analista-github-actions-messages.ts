// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the GitHub Actions analyst.
 * Provides summarized text templates for workflow issues.
 */

export const AnalistaGithubActionsMensagens = {
  resumoWorkflow: (score: number, total: number) => `GitHub Actions Workflow: Score ${score}/100, ${total} issue(s) found`,
  workflowOtimo: 'Workflow follows all GitHub Actions best practices',
  workflowBom: 'Workflow is good with few low-priority issues',
  workflowRegular: 'Workflow needs attention - moderate issues found',
  workflowRuim: 'Workflow needs urgent improvements - critical issues found',
  erroAnalisarWorkflow: (erro: unknown) => `Error analyzing workflow: ${erro instanceof Error ? erro.message : String(erro)}`,
} as const;
