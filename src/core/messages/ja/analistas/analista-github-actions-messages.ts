// SPDX-License-Identifier: MIT

/**
 * @fileoverview GitHub Actions アナライザー向けの診断メッセージ。
 * ワークフローの問題に対する要約テキストテンプレートを
 * 提供します。
 */

export const AnalistaGithubActionsMensagens = {
  resumoWorkflow: (score: number, total: number) => `GitHub Actions ワークフロー：スコア ${score}/100、${total} 件の問題が見つかりました`,
  workflowOtimo: 'ワークフローは GitHub Actions のベストプラクティスに完全に準拠しています',
  workflowBom: 'ワークフローは良好で、低優先度の問題がわずかです',
  workflowRegular: 'ワークフローは注意が必要です - 中程度の問題が見つかりました',
  workflowRuim: 'ワークフローは緊急の改善が必要です - 重大な問題が見つかりました',
  erroAnalisarWorkflow: (erro: unknown) => `ワークフロー分析エラー: ${erro instanceof Error ? erro.message : String(erro)}`,
} as const;
