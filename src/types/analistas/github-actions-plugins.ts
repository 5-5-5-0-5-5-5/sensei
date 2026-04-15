// SPDX-License-Identifier: MIT

import type { ProblemaWorkflow } from './detectores.js';

/**
 * Interface para um detector customizado de GitHub Actions
 */
export interface DeteccaoCustom {
  nome: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  /**
   * Executa a detecção sobre o workflow parseado
   * @param workflow Objeto representando o workflow (AST ou record)
   */
  testar: (workflow: unknown) => ProblemaWorkflow[];
  /**
   * (Opcional) Aplica uma correção automática ao workflow
   */
  corrigir?: (workflow: unknown) => unknown;
}

/**
 * Interface para um plugin completo de GitHub Actions
 */
export interface GitHubActionsPlugin {
  nome: string;
  versao: string;
  descricao: string;
  autor: string;
  detecoes: DeteccaoCustom[];
}
