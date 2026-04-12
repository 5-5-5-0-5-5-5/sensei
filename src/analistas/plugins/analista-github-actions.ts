// SPDX-License-Identifier: MIT

/**
 * @fileoverview Analista de qualidade para workflows do GitHub Actions
 * Analisa arquivos .github/workflows/*.yml detectando:
 * - Actions desatualizadas
 * - Permissões excessivas
 * - Falta de timeout
 * - Problemas de segurança
 * - Falta de caching
 * - Hardcoded secrets
 * - Boas práticas
 * - Performance
 */

import type { Analista, ProblemaWorkflow, ResultadoAnalise } from '@';
import type { NodePath } from '@babel/traverse';
import type { Node } from '@babel/types';
import type { ContextoExecucao, Ocorrencia } from '@';

export const analistaGithubActions: Analista = {
  nome: 'github-actions',
  categoria: 'workflows',
  descricao: 'Análise de qualidade de workflows do GitHub Actions',
  test: (relPath: string) => relPath.startsWith('.github/workflows/') || relPath.endsWith('.yml') || relPath.endsWith('.yaml'),

  async aplicar(
    conteudo: string,
    caminhoRelativo: string,
    _ast: NodePath<Node> | null,
    _fullCaminho?: string,
    _contexto?: ContextoExecucao,
  ): Promise<Ocorrencia[]> {
    const problemas: ProblemaWorkflow[] = [];
    const ocorrencias: Ocorrencia[] = [];
    const linhas = conteudo.split('\n');

    // Análise linha a linha
    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i] ?? '';
      const numeroLinha = i + 1;

      // 1. Actions desatualizadas
      const actionsDesatualizadas = detectarActionsDesatualizada(linha, numeroLinha);
      if (actionsDesatualizadas) {
        problemas.push(actionsDesatualizadas);
      }

      // 2. Permissões excessivas
      const permExcessiva = detectarPermissoesExcessivas(linha, numeroLinha);
      if (permExcessiva) {
        problemas.push(permExcessiva);
      }

      // 3. Hardcoded secrets
      const secretHardcoded = detectarSecretsHardcoded(linha, numeroLinha);
      if (secretHardcoded) {
        problemas.push(secretHardcoded);
      }

      // 4. Falta de timeout
      const semTimeout = detectarFaltaTimeout(linha, numeroLinha, conteudo);
      if (semTimeout) {
        problemas.push(semTimeout);
      }

      // 5. Comando run com input não sanitizado
      const runInseguro = detectarRunInseguro(linha, numeroLinha);
      if (runInseguro) {
        problemas.push(runInseguro);
      }

      // 6. checkout sem persist-credentials: false
      const checkoutInseguro = detectarCheckoutInseguro(linha, numeroLinha, linhas, i);
      if (checkoutInseguro) {
        problemas.push(checkoutInseguro);
      }

      // 7. Uso de @master ou @main em actions de terceiros
      const actionBranchPrincipal = detectarBranchPrincipal(linha, numeroLinha);
      if (actionBranchPrincipal) {
        problemas.push(actionBranchPrincipal);
      }

      // 8. Falta de cache de dependências
      const semCache = detectarFaltaCache(linha, numeroLinha, conteudo);
      if (semCache) {
        problemas.push(semCache);
      }
    }

    // Análise estrutural
    const problemasWorkflow = analisarEstruturaWorkflow(conteudo, linhas);
    problemas.push(...problemasWorkflow);

    // Converter problemas em ocorrências
    for (const problema of problemas) {
      ocorrencias.push({
        tipo: `GITHUB_ACTIONS_${problema.tipo.toUpperCase().replace(/-/g, '_')}`,
        mensagem: problema.descricao,
        relPath: caminhoRelativo,
        linha: problema.linha,
        coluna: 1,
        sugestao: problema.sugestao,
        nivel: problema.severidade === 'critica' ? 'erro' : problema.severidade === 'alta' ? 'aviso' : 'info',
      });
    }

    return ocorrencias;
  },
};

  /* -------------------------- DETECÇÃO DE ACTIONS DESATUALIZADAS -------------------------- */

const ACTIONS_ATUALIZADAS: Record<string, string> = {
  'actions/checkout': 'v4',
  'actions/setup-node': 'v4',
  'actions/setup-python': 'v5',
  'actions/upload-artifact': 'v4',
  'actions/download-artifact': 'v4',
  'actions/cache': 'v4',
  'actions/stale': 'v9',
  'actions/first-interaction': 'v1',
  'actions/labeler': 'v5',
  'actions/dependency-review-action': 'v4',
  'actions/codeql-action': 'v3',
  'docker/build-push-action': 'v6',
  'docker/login-action': 'v3',
  'docker/setup-buildx-action': 'v3',
  'docker/metadata-action': 'v5',
  'peaceiris/actions-gh-pages': 'v4',
  'JamesIves/github-pages-deploy-action': 'v4',
  'cycjimmy/semantic-release-action': 'v4',
  'softprops/action-gh-release': 'v2',
  'pnpm/action-setup': 'v4',
};

function detectarActionsDesatualizada(linha: string, numeroLinha: number): ProblemaWorkflow | null {
  const matches = linha.matchAll(/uses:\s*([^@\s]+)@([^\s]+)/g);
  for (const match of matches) {
    const action = match[1];
    const versao = match[2];
    if (!action || !versao) continue;

    const versaoAtual = ACTIONS_ATUALIZADAS[action];
    if (versaoAtual && versao !== versaoAtual && !versao.startsWith('v') === false) {
      // Verifica se é uma versão antiga
      const versaoNum = parseInt(versao.replace('v', ''));
      const atualNum = parseInt(versaoAtual.replace('v', ''));

      if (!isNaN(versaoNum) && !isNaN(atualNum) && versaoNum < atualNum) {
        return {
          tipo: 'action-desatualizada',
          descricao: `Action '${action}' está na versão ${versao}, mas a versão recomendada é ${versaoAtual}`,
          severidade: 'media',
          linha: numeroLinha,
          sugestao: `Atualizar para ${action}@${versaoAtual} para obter correções de bugs e novas funcionalidades`,
        };
      }
    }
  }
  return null;
}

  /* -------------------------- DETECÇÃO DE PERMISSÕES EXCESSIVAS -------------------------- */

function detectarPermissoesExcessivas(linha: string, numeroLinha: number): ProblemaWorkflow | null {
  // Detectar permissions: write em escopo global
  if (/^\s{0,4}permissions:\s*write-all/i.test(linha)) {
    return {
      tipo: 'permissoes-excessivas',
      descricao: 'Permissões write-all concedidas em escopo global do workflow',
      severidade: 'alta',
      linha: numeroLinha,
      sugestao: 'Usar princípio do menor privilégio: conceder apenas permissões específicas necessárias',
    };
  }

  // Detectar permissões desnecessárias
  const permissoesPerigosas = [
    { pattern: /permissions:\s*\{?\s*contents:\s*write/i, msg: 'Permissão de escrita em contents (pode ser reduzida se apenas leitura for necessária)' },
    { pattern: /permissions:\s*\{?\s*pull-requests:\s*write/i, msg: 'Permissão de escrita em pull-requests (pode permitir execução arbitrária de código)' },
    { pattern: /permissions:\s*\{?\s*packages:\s*write/i, msg: 'Permissão de escrita em packages' },
    { pattern: /permissions:\s*\{?\s*deployments:\s*write/i, msg: 'Permissão de escrita em deployments' },
  ];

  for (const { pattern, msg } of permissoesPerigosas) {
    if (pattern.test(linha)) {
      return {
        tipo: 'permissoes-excessivas',
        descricao: msg,
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Revisar se esta permissão é realmente necessária e considerar restringir para jobs específicos',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE SECRETS HARDCODED -------------------------- */

function detectarSecretsHardcoded(linha: string, numeroLinha: number): ProblemaWorkflow | null {
  const secretsPatterns = [
    { pattern: /(password|passwd|pwd)\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'senha' },
    { pattern: /(api[_-]?key|apikey)\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'API key' },
    { pattern: /(secret|token)\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'secret/token' },
    { pattern: /(access[_-]?token)\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'access token' },
    { pattern: /(private[_-]?key)\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'private key' },
    { pattern: /github[_-]?token\s*[:=]\s*['"][^'"]{3,}['"]/i, nome: 'GitHub token' },
  ];

  for (const { pattern, nome } of secretsPatterns) {
    if (pattern.test(linha)) {
      return {
        tipo: 'secret-hardcoded',
        descricao: `${nome.charAt(0).toUpperCase() + nome.slice(1)} hardcoded no workflow`,
        severidade: 'critica',
        linha: numeroLinha,
        sugestao: 'Usar GitHub Secrets (${{ secrets.NOME }}) em vez de hardcoded values',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE FALTA DE TIMEOUT -------------------------- */

function detectarFaltaTimeout(linha: string, numeroLinha: number, conteudo: string): ProblemaWorkflow | null {
  // Detectar jobs sem timeout
  if (/^\s{2,4}runs-on:\s+/i.test(linha)) {
    // Verifica se há timeout nas próximas linhas
    const linhasApos = conteudo.split('\n').slice(numeroLinha, numeroLinha + 20).join('\n');
    if (!/timeout-minutes:/i.test(linhasApos)) {
      return {
        tipo: 'falta-timeout',
        descricao: 'Job sem configuração de timeout-minutes',
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Adicionar timeout-minutes para evitar jobs executando indefinidamente',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE RUN INSEGURO -------------------------- */

function detectarRunInseguro(linha: string, numeroLinha: number): ProblemaWorkflow | null {
  // Detectar uso de github.event sem sanitização em run:
  const githubEventPatterns = [
    { pattern: /run:.*\$\{\{.*github\.event\.(issue|pull_request|discussion)\.title/i, desc: 'título de issue/PR' },
    { pattern: /run:.*\$\{\{.*github\.event\.(issue|pull_request|discussion)\.body/i, desc: 'corpo de issue/PR' },
    { pattern: /run:.*\$\{\{.*github\.event\.comment\.body/i, desc: 'corpo de comentário' },
    { pattern: /run:.*\$\{\{.*github\.event\.review\.body/i, desc: 'corpo de review' },
  ];

  for (const { pattern, desc } of githubEventPatterns) {
    if (pattern.test(linha)) {
      return {
        tipo: 'run-inseguro',
        descricao: `Uso de ${desc} do GitHub event em comando run sem sanitização`,
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Sanitizar input do usuário ou evitar executar dados não confiáveis diretamente no shell',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE CHECKOUT INSEGURO -------------------------- */

function detectarCheckoutInseguro(
  linha: string,
  numeroLinha: number,
  linhas: string[],
  indiceAtual: number,
): ProblemaWorkflow | null {
  if (/uses:\s*actions\/checkout@/i.test(linha)) {
    // Verifica se persist-credentials: false está presente nas próximas linhas
    const proximasLinhas = linhas.slice(indiceAtual, indiceAtual + 10).join('\n');
    if (!/persist-credentials:\s*false/i.test(proximasLinhas)) {
      return {
        tipo: 'checkout-inseguro',
        descricao: 'Actions/checkout sem persist-credentials: false',
        severidade: 'baixa',
        linha: numeroLinha,
        sugestao: 'Adicionar persist-credentials: false para evitar vazamento do GITHUB_TOKEN',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE BRANCH PRINCIPAL -------------------------- */

function detectarBranchPrincipal(linha: string, numeroLinha: number): ProblemaWorkflow | null {
  const match = linha.match(/uses:\s*([^@\s]+)@(main|master)/i);
  if (match && match[1]) {
    const action = match[1];
    // Só alertar para actions de terceiros (não do GitHub)
    if (!action.startsWith('actions/') && !action.startsWith('github/')) {
      return {
        tipo: 'branch-instavel',
        descricao: `Action '${action}' usando branch '${match[2] || ''}' (pode quebrar a qualquer momento)`,
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Usar versão específica (ex: @v1.2.3) em vez de branch para maior estabilidade',
      };
    }
  }

  return null;
}

  /* -------------------------- DETECÇÃO DE FALTA DE CACHE -------------------------- */

function detectarFaltaCache(linha: string, numeroLinha: number, conteudo: string): ProblemaWorkflow | null {
  // Detectar instalação de dependências sem cache
  const installPatterns = [
    /npm\s+(ci|install)/i,
    /yarn\s+(install|add)/i,
    /pnpm\s+(install|add)/i,
  ];

  for (const pattern of installPatterns) {
    if (pattern.test(linha)) {
      // Verifica se há uso de actions/cache
      if (!/actions\/cache@/i.test(conteudo) && !/setup-(node|python|ruby).*cache:/i.test(conteudo)) {
        return {
          tipo: 'falta-cache',
          descricao: 'Instalação de dependências sem configuração de cache',
          severidade: 'baixa',
          linha: numeroLinha,
          sugestao: 'Usar actions/cache@v4 ou configurar cache no setup action para acelerar workflows',
        };
      }
    }
  }

  return null;
}

  /* -------------------------- ANÁLISE ESTRUTURAL DO WORKFLOW -------------------------- */

function analisarEstruturaWorkflow(conteudo: string, linhas: string[]): ProblemaWorkflow[] {
  const problemas: ProblemaWorkflow[] = [];

  // 1. Workflow sem nome ou nome genérico
  if (!/name:\s+\S+/i.test(conteudo)) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: 'Workflow sem nome descritivo',
      severidade: 'baixa',
      linha: 1,
      sugestao: 'Adicionar campo name: no início do workflow para facilitar identificação',
    });
  }

  // 2. Jobs excessivamente longos (> 50 passos)
  let passosCount = 0;
  let primeiroPassoLinha = 0;
  for (let i = 0; i < linhas.length; i++) {
    if (/^\s{6,8}-\s*(uses|run):/i.test(linhas[i] ?? '')) {
      if (passosCount === 0) {
        primeiroPassoLinha = i + 1;
      }
      passosCount++;
    }
  }
  if (passosCount > 50) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: `Job com ${passosCount} passos (recomendado: máximo 50)`,
      severidade: 'media',
      linha: primeiroPassoLinha,
      sugestao: 'Dividir em múltiplos jobs ou reutilizar workflows com workflow_call',
    });
  }

  // 3. Workflow muito longo (> 500 linhas)
  if (linhas.length > 500) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: `Workflow muito longo (${linhas.length} linhas)`,
      severidade: 'baixa',
      linha: 1,
      sugestao: 'Considerar dividir em múltiplos workflows ou usar workflows reutilizáveis',
    });
  }

  // 4. Falta de trigger branches/paths filters
  if (/on:\s*\[/i.test(conteudo) && !/branches:/i.test(conteudo) && !/paths:/i.test(conteudo)) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: 'Workflow sem filtros de branches ou paths',
      severidade: 'baixa',
      linha: 1,
      sugestao: 'Adicionar branches/paths filters para executar apenas quando necessário',
    });
  }

  // 5. Múltiplos jobs sem dependências
  const jobs = conteudo.match(/^\s{2}\w+:$/gm) || [];
  if (jobs.length > 2) {
    const needsCount = (conteudo.match(/needs:/g) || []).length;
    if (needsCount === 0) {
      problemas.push({
        tipo: 'estrutura-workflow',
        descricao: 'Múltiplos jobs sem definição de dependências (needs)',
        severidade: 'media',
        linha: 1,
        sugestao: 'Usar campo needs para definir ordem de execução e otimizar workflows',
      });
    }
  }

  // 6. Workflow de CI sem matrix strategy
  if (/ci|test|build/i.test(conteudo) && !/strategy:\s*\{?\s*matrix:/i.test(conteudo)) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: 'Workflow de CI/Build sem matrix strategy para testar múltiplas versões',
      severidade: 'baixa',
      linha: 1,
      sugestao: 'Considerar usar matrix strategy para testar em múltiplas versões de Node/OS/etc',
    });
  }

  // 7. Uso de force: true em push
  if (/git\s+push\s+--force/i.test(conteudo)) {
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: 'Uso de git push --force no workflow',
      severidade: 'alta',
      linha: linhas.findIndex(l => /git\s+push\s+--force/i.test(l)) + 1,
      sugestao: 'Evitar force push em workflows automatizados para prevenir perda de código',
    });
  }

  // 8. Falta de tratamento de erro (continue-on-error: true sem boa razão)
  if (/continue-on-error:\s*true/i.test(conteudo) && !/experimental|beta|nightly/i.test(conteudo)) {
    const linhaContinue = linhas.findIndex(l => /continue-on-error:\s*true/i.test(l)) + 1;
    problemas.push({
      tipo: 'estrutura-workflow',
      descricao: 'Uso de continue-on-error: true pode mascarar falhas',
      severidade: 'media',
      linha: linhaContinue,
      sugestao: 'Usar continue-on-error apenas para jobs experimentais ou não críticos',
    });
  }

  return problemas;
}

  /* -------------------------- CÁLCULO DE SCORE -------------------------- */

function calcularScore(problemas: ProblemaWorkflow[]): number {
  const pesos = {
    'critica': 20,
    'alta': 10,
    'media': 5,
    'baixa': 2,
  };

  const penalidade = problemas.reduce((total, p) => {
    return total + (pesos[p.severidade] ?? 0);
  }, 0);

  return Math.max(0, Math.min(100, 100 - penalidade));
}

  /* -------------------------- GERAÇÃO DE RESUMO -------------------------- */

function gerarResumo(problemas: ProblemaWorkflow[]): string {
  if (problemas.length === 0) {
    return 'Workflow segue boas práticas do GitHub Actions';
  }

  const contagem = problemas.reduce((acc, p) => {
    acc[p.severidade] = (acc[p.severidade] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const partes: string[] = [];
  if (contagem.critica) partes.push(`${contagem.critica} crítico(s)`);
  if (contagem.alta) partes.push(`${contagem.alta} alto(s)`);
  if (contagem.media) partes.push(`${contagem.media} médio(s)`);
  if (contagem.baixa) partes.push(`${contagem.baixa} baixo(s)`);

  return `${problemas.length} problema(s) encontrado(s): ${partes.join(', ')}`;
}
