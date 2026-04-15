import { registrarDetectorGithubActions } from './analista-github-actions.js';

/**
 * Plugin de exemplo para demonstrar o sistema de extensibilidade v0.5.0
 */
registrarDetectorGithubActions({
  nome: 'security-hardening',
  descricao: 'Regras adicionais de segurança para workflows',
  severidade: 'alta',
  testar: (workflow) => {
    const problemas: any[] = [];
    if (!workflow || !workflow.jobs) return problemas;

    for (const [jobId, job] of Object.entries(workflow.jobs) as [string, any][]) {
      // Regra: Todo job deve ter permissões explícitas
      if (!job.permissions && !workflow.permissions) {
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
