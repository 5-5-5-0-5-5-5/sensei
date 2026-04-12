// SPDX-License-Identifier: MIT

/**
 * @fileoverview Mensagens de diagnóstico para o analista de GitHub Actions.
 * Fornece templates de texto resumidos para problemas de workflows.
 */

export const AnalistaGithubActionsMensagens = {
  resumoWorkflow: (score: number, total: number) => `Workflow GitHub Actions: Score ${score}/100, ${total} problema(s) encontrado(s)`,
  workflowOtimo: 'Workflow segue todas as boas práticas do GitHub Actions',
  workflowBom: 'Workflow está bom com poucos problemas de baixa prioridade',
  workflowRegular: 'Workflow precisa de atenção - problemas moderados encontrados',
  workflowRuim: 'Workflow precisa de melhorias urgentes - problemas críticos encontrados',
  erroAnalisarWorkflow: (erro: unknown) => `Erro ao analisar workflow: ${erro instanceof Error ? erro.message : String(erro)}`,
} as const;
