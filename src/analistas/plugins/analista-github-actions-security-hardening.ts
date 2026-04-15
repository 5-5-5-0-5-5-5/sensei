import type { ProblemaWorkflow } from '@';

import { registrarDetectorGithubActions } from './analista-github-actions.js';

interface JobGithubActions {
  permissions?: Record<string, string>;
  'runs-on'?: string | string[];
  container?: { image?: string };
  steps?: unknown[];
}

interface WorkflowGithubActions {
  jobs?: Record<string, JobGithubActions>;
  permissions?: Record<string, string>;
}

/**
 * Plugin de exemplo para demonstrar o sistema de extensibilidade v0.5.0
 */
registrarDetectorGithubActions({
  nome: 'security-hardening',
  descricao: 'Regras adicionais de segurança para workflows',
  severidade: 'alta',
  testar: (workflow) => {
    const problemas: ProblemaWorkflow[] = [];
    const wf = workflow as WorkflowGithubActions;
    if (!wf || !wf.jobs) return problemas;

    for (const [jobId, job] of Object.entries(wf.jobs) as [string, JobGithubActions][]) {
      // Regra: Todo job deve ter permissões explícitas
      if (!job.permissions && !wf.permissions) {
        problemas.push({
          tipo: 'security-hardening',
          descricao: `Job '${jobId}' não define permissões explícitas (usa default GITHUB_TOKEN)`,
          severidade: 'media',
          linha: 1,
          sugestao: 'Adicionar campo permissions: ao job ou ao workflow para seguir o princípio do menor privilégio',
        });
      }
    }
    return problemas;
  }
});
