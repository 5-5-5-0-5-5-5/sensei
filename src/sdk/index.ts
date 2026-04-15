// SPDX-License-Identifier: MIT
import { analistaGithubActions, analistaGithubActionsGlobal, registrarDetectorGithubActions } from '../analistas/plugins/analista-github-actions.js';
import type { Ocorrencia } from '../types/index.js';

/**
 * Prometheus SDK Principal
 * Fornece acesso programático aos analistas e sistema de plugins
 */
export const PrometheusSDK = {
  /**
   * Analisa um conteúdo de workflow individual
   */
  async analisarGithubActions(conteudo: string, relPath: string = '.github/workflows/main.yml'): Promise<Ocorrencia[]> {
    const res = await analistaGithubActions.aplicar(conteudo, relPath, null, undefined, undefined);
    return Array.isArray(res) ? res : [];
  },

  /**
   * Analisa um repositório completo (Contexto global)
   */
  async analisarRepositorio(contexto: any): Promise<Ocorrencia[]> {
    const res = await analistaGithubActionsGlobal.aplicar('', '', null, undefined, contexto);
    return Array.isArray(res) ? res : [];
  },

  /**
   * Registra um novo plugin de detector
   */
  registrarDetector: registrarDetectorGithubActions
};
