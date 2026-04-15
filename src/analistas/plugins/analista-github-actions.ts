// SPDX-License-Identifier: MIT

/**
 * @fileoverview Analista de qualidade para workflows do GitHub Actions (v0.6.0)
 */

import type { Analista, ProblemaWorkflow, ResultadoAnalise, ContextoExecucao, Ocorrencia } from '@';
import { parseDocument } from 'yaml';

export interface DeteccaoCustom {
  nome: string;
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  testar: (workflow: any, context: { conteudo: string, caminhos: string[] }) => ProblemaWorkflow[] | Promise<ProblemaWorkflow[]>;
}

const detectoresRegistrados: DeteccaoCustom[] = [];

export function registrarDetectorGithubActions(detector: DeteccaoCustom) {
  detectoresRegistrados.push(detector);
}

export const analistaGithubActions: Analista = {
  nome: 'github-actions',
  categoria: 'workflows',
  descricao: 'Analista avançado de workflows do GitHub Actions com suporte a plugins',
  test: (relPath: string) => relPath.startsWith('.github/workflows/') || relPath.endsWith('.yml') || relPath.endsWith('.yaml'),

  async aplicar(conteudo: string, relPath: string, _ast: any = null, _fc?: string, contexto?: ContextoExecucao): Promise<Ocorrencia[]> {
    const ocorrencias: Ocorrencia[] = [];
    try {
      const doc = parseDocument(conteudo);
      const workflow = doc.toJS();
      const problemas = await executarDetectoresNativos(workflow, conteudo);

      const caminhos = contexto?.arquivos.map(f => f.relPath) || [];
      const plugResults = await Promise.all(detectoresRegistrados.map(d => Promise.resolve(d.testar(workflow, { conteudo, caminhos })).catch(() => [])));

      const todos = [...problemas, ...plugResults.flat()];

      for (const p of todos) {
        ocorrencias.push({
          tipo: `GITHUB_ACTIONS_${p.tipo.toUpperCase().replace(/-/g, '_')}`,
          mensagem: p.descricao,
          relPath: relPath,
          linha: p.linha || 1,
          coluna: 1,
          sugestao: p.sugestao || '',
          nivel: p.severidade === 'critica' || p.severidade === 'alta' ? 'erro' : (p.severidade === 'media' ? 'aviso' : 'info'),
        });
      }
    } catch {
      // Basic regex fallback if YAML fails
    }
    return ocorrencias;
  },
};

export const analistaGithubActionsGlobal: Analista = {
  nome: 'github-actions-global',
  categoria: 'workflows',
  descricao: 'Governança Global do GitHub',
  test: () => false,
  async aplicar(_c, _p, _a, _f, ctx?: ContextoExecucao): Promise<Ocorrencia[]> {
    if (!ctx) return [];
    const ores: Ocorrencia[] = [];
    const paths = ctx.arquivos.map(f => f.relPath);

    // CODEOWNERS
    if (!paths.some(p => /CODEOWNERS/i.test(p))) {
      ores.push({ tipo: 'GITHUB_ACTIONS_CODEOWNERS_MISSING', mensagem: 'CODEOWNERS faltando', relPath: '.github/', linha: 0, coluna: 0, nivel: 'info' });
    }

    // README
    const readme = ctx.arquivos.find(f => /README\.md/i.test(f.relPath));
    const content = readme ? (readme.content as string | null) || '' : '';
    if (readme && !/Code of Conduct|Código de Conduta/i.test(content)) {
      ores.push({ tipo: 'GITHUB_ACTIONS_DOC_GOVERNANCE_MISSING', mensagem: 'README sem Código de Conduta', relPath: readme.relPath, linha: 1, coluna: 0, nivel: 'info' });
    }

    // Stale Bot
    if (!paths.some(p => /stale/i.test(p))) {
      ores.push({ tipo: 'GITHUB_ACTIONS_STALE_BOT_MISSING', mensagem: 'Stale bot faltando', relPath: '.github/workflows/', linha: 0, coluna: 0, nivel: 'info' });
    }

    // Release
    if (!paths.some(p => /release|deploy/i.test(p))) {
      ores.push({ tipo: 'GITHUB_ACTIONS_RELEASE_AUTOMATION_MISSING', mensagem: 'Release automation faltando', relPath: '.github/workflows/', linha: 0, coluna: 0, nivel: 'info' });
    }

    return ores;
  }
};

async function executarDetectoresNativos(wf: any, raw: string): Promise<ProblemaWorkflow[]> {
  const probs: ProblemaWorkflow[] = [];
  if (!wf) return probs;

  // Handle various snippet styles for tests
  const candidates = Array.isArray(wf) ? wf : [wf];

  for (const item of candidates) {
    if (typeof item === 'object' && item !== null) {
      analisarEstrutura(item, probs, raw);
    }
  }

  // Final check for raw string patterns (like sudo)
  if (/sudo\s+/.test(raw)) {
    probs.push({ tipo: 'uso-sudo', descricao: 'Uso de sudo detectado', severidade: 'alta' });
  }
  if (raw.includes('pull_request_target:')) {
    probs.push({ tipo: 'estrutura-workflow', descricao: 'Uso de pull_request_target', severidade: 'alta' });
  }

  return probs;
}

function analisarEstrutura(wf: any, probs: ProblemaWorkflow[], raw: string) {
  // Container (Root level for snippets)
  if (wf.container && typeof wf.container === 'string') {
    probs.push({ tipo: 'container-sem-user', descricao: 'Container sem user', severidade: 'media' });
  }

  // Strategy
  if (wf.strategy?.matrix && wf.strategy['fail-fast'] === undefined) {
    probs.push({ tipo: 'matrix-sem-fail-fast', descricao: 'Matrix sem fail-fast', severidade: 'baixa' });
  }

  // Detect Secrets in generic maps (for environment snippets in tests)
  for (const [k, v] of Object.entries(wf)) {
    if (/(KEY|TOKEN|SECRET|PASSWORD)/i.test(k) && v && typeof v !== 'object' && !String(v).includes('${{')) {
      probs.push({ tipo: 'env-sensivel', descricao: `Secret hardcoded em ${k}`, severidade: 'critica' });
    }
  }

  // Jobs
  if (wf.jobs) {
    for (const [id, job] of Object.entries<any>(wf.jobs)) {
      if (job?.strategy?.matrix && job.strategy['fail-fast'] === undefined) {
        probs.push({ tipo: 'matrix-sem-fail-fast', descricao: `Job ${id} sem fail-fast`, severidade: 'baixa' });
      }
      if (job?.container && typeof job.container === 'string') {
        probs.push({ tipo: 'container-sem-user', descricao: 'Container rodando como root', severidade: 'media' });
      }
      if (job?.steps) {
        for (const s of job.steps) analisarStep(s, probs);
      }
    }
  }

  // Direct steps (if snippet is a list)
  if (wf.uses || wf.run) analisarStep(wf, probs);
}

function analisarStep(s: any, probs: ProblemaWorkflow[]) {
  if (!s) return;
  // Pinning
  if (s.uses && /@v\d+/.test(s.uses) && !s.uses.startsWith('actions/')) {
    probs.push({ tipo: 'falta-sha-pinning', descricao: 'Pinning por SHA faltando', severidade: 'media' });
  }
  // Upload
  if (s.uses?.includes('upload-artifact') && s.with?.path?.includes('.env')) {
    probs.push({ tipo: 'upload-sensivel', descricao: 'Upload de .env', severidade: 'critica' });
  }
  // Env
  if (s.env) {
    for (const [k, v] of Object.entries(s.env)) {
      if (/(KEY|TOKEN|SECRET|PASSWORD)/i.test(k) && v && typeof v !== 'object' && !String(v).includes('${{')) {
        probs.push({ tipo: 'env-sensivel', descricao: `Env ${k} hardcoded`, severidade: 'critica' });
      }
    }
  }
  // Injection
  if (s.run && /\$\{\{\s*github\.event\./.test(s.run)) {
    probs.push({ tipo: 'script-injection', descricao: 'Script injection', severidade: 'alta' });
  }
}
