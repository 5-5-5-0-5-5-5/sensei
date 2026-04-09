// SPDX-License-Identifier: MIT
/**
 * Centralized settings for the intelligent report filter
 * Defines priorities, groupings and problem categorization
 */

import type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel } from '@';

import {
  ICONES_ARQUIVO,
  ICONES_DIAGNOSTICO,
  ICONES_FEEDBACK,
} from '../../shared/icons.js';

// Re-exports types for compatibility
export type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel };

  /* -------------------------- PRIORITIES BY PROBLEM TYPE -------------------------- */

export const PRIORIDADES: Record<string, ConfigPrioridade> = {
  // Critical - Security and data
  PROBLEMA_SEGURANCA: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: 'Security vulnerability detected',
  },
  VULNERABILIDADE_SEGURANCA: {
    prioridade: 'critica',
    icone: '[ERRO]',
    descricao: 'Critical security flaw',
  },
  CREDENCIAIS_EXPOSTAS: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: 'Hardcoded or exposed credentials',
  },

  // High - Fragile code and bugs
  CODIGO_FRAGIL: {
    prioridade: 'alta',
    icone: '[AVISO]',
    descricao: 'Code susceptible to failures',
  },
  'tipo-inseguro-any': {
    prioridade: 'alta',
    icone: '[HIGH]',
    descricao: 'Use of any type that can be replaced',
  },
  'tipo-inseguro-unknown': {
    prioridade: 'media',
    icone: '[WARN]',
    descricao: 'Use of unknown type that can be made specific',
  },
  PROBLEMA_TESTE: {
    prioridade: 'alta',
    icone: '[TEST]',
    descricao: 'Testing issues',
  },
  'estrutura-suspeita': {
    prioridade: 'alta',
    icone: '[SCAN]',
    descricao: 'Suspicious code structure',
  },
  COMPLEXIDADE_ALTA: {
    prioridade: 'alta',
    icone: '[STATS]',
    descricao: 'High cyclomatic complexity',
  },

  // Medium - Maintainability and patterns
  PROBLEMA_DOCUMENTACAO: {
    prioridade: 'media',
    icone: '[DOC]',
    descricao: 'Missing or inadequate documentation',
  },
  'padrao-ausente': {
    prioridade: 'media',
    icone: '[GOAL]',
    descricao: 'Recommended pattern absent',
  },
  'estrutura-config': {
    prioridade: 'media',
    icone: '[CONFIG]',
    descricao: 'Configuration issues',
  },
  'estrutura-entrypoints': {
    prioridade: 'media',
    icone: '[ENTRY]',
    descricao: 'Poorly defined entrypoints',
  },
  ANALISE_ARQUITETURA: {
    prioridade: 'media',
    icone: '[BUILD]',
    descricao: 'Architectural analysis',
  },

  // Low - Informational and improvements
  CONSTRUCOES_SINTATICAS: {
    prioridade: 'baixa',
    icone: '[SYNTAX]',
    descricao: 'Syntactic patterns detected',
  },
  CARACTERISTICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[ARCH]',
    descricao: 'Architectural characteristics',
  },
  METRICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[SIZE]',
    descricao: 'Architectural metrics',
  },
  TODO_PENDENTE: {
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    descricao: 'TODOs and pending tasks',
  },
  IDENTIFICACAO_PROJETO: {
    prioridade: 'baixa',
    icone: '[TAG]',
    descricao: 'Project type identification',
  },
  SUGESTAO_MELHORIA: {
    prioridade: 'baixa',
    icone: '[DICA]',
    descricao: 'Improvement suggestion',
  },
  EVIDENCIA_CONTEXTO: {
    prioridade: 'baixa',
    icone: '[SCAN]',
    descricao: 'Context evidence',
  },
  TECNOLOGIAS_ALTERNATIVAS: {
    prioridade: 'baixa',
    icone: '[ALT]',
    descricao: 'Alternative technologies suggested',
  },
};

  /* -------------------------- INTELLIGENT GROUPINGS BY MESSAGE PATTERN -------------------------- */

export const AGRUPAMENTOS_MENSAGEM: AgrupamentoConfig[] = [
  // Critical Security
  {
    padrao:
      /token hardcoded|senha hardcoded|chave hardcoded|api.*key.*hardcoded/i,
    categoria: 'SEGURANCA_HARDCODED',
    titulo: 'Hardcoded Credentials Detected',
    prioridade: 'critica',
    icone: ICONES_ARQUIVO.lock,
    acaoSugerida: 'Move credentials to environment variables (.env)',
  },
  {
    padrao: /sql.*injection|xss|csrf|path.*traversal|command.*injection/i,
    categoria: 'VULNERABILIDADES_WEB',
    titulo: 'Web Vulnerabilities Detected',
    prioridade: 'critica',
    icone: '[ERRO]',
    acaoSugerida: 'Apply input sanitization and validation',
  },

  // Fragile Code (High)
  {
    padrao: /tipo.*inseguro.*any|any.*inseguro|unsafe.*any/i,
    categoria: 'TIPOS_ANY_INSEGUROS',
    titulo: 'Unsafe Any Types Detected',
    prioridade: 'alta',
    icone: '[HIGH]',
    acaoSugerida:
      'Replace any with specific types to improve type safety',
  },
  {
    padrao: /tipo.*inseguro.*unknown|unknown.*inseguro|unsafe.*unknown/i,
    categoria: 'TIPOS_UNKNOWN_GENERICOS',
    titulo: 'Generic Unknown Types',
    prioridade: 'media',
    icone: '[WARN]',
    acaoSugerida: 'Add type guards or replace with specific types',
  },
  {
    padrao: /missing-tests|missing tests|sem testes|no.*tests/i,
    categoria: 'TESTES_AUSENTES',
    titulo: 'Files Without Tests',
    prioridade: 'alta',
    icone: '[TEST]',
    acaoSugerida: 'Implement unit tests to improve coverage',
  },
  {
    padrao: /complexidade.*alta|complex.*high|cyclomatic.*complexity/i,
    categoria: 'COMPLEXIDADE_ALTA',
    titulo: 'Code with High Complexity',
    prioridade: 'alta',
    icone: '[STATS]',
    acaoSugerida: 'Refactor into smaller functions to improve readability',
  },
  {
    padrao: /acoplamento.*alto|coupling.*high|tight.*coupling/i,
    categoria: 'ACOPLAMENTO_ALTO',
    titulo: 'High Coupling Between Modules',
    prioridade: 'alta',
    icone: '[LINK]',
    acaoSugerida: 'Review dependencies and apply decoupling patterns',
  },

  // Maintainability (Medium)
  {
    padrao:
      /missing-jsdoc|missing documentation|sem documentação|no.*documentation/i,
    categoria: 'DOCUMENTACAO_AUSENTE',
    titulo: 'Missing Documentation',
    prioridade: 'media',
    icone: '[DOC]',
    acaoSugerida: 'Add JSDoc/comments to improve maintainability',
  },
  {
    padrao: /console\.log|console-log|debug.*statement/i,
    categoria: 'CONSOLE_LOGS',
    titulo: 'Console.log in Production Code',
    prioridade: 'media',
    icone: '[LOG]',
    acaoSugerida: 'Remove or replace with a proper logging system',
  },
  {
    padrao: /código.*duplicado|duplicate.*code|copy.*paste/i,
    categoria: 'DUPLICACAO_CODIGO',
    titulo: 'Duplicated Code Detected',
    prioridade: 'media',
    icone: '[COPY]',
    acaoSugerida: 'Extract into reusable functions/modules',
  },
  {
    padrao: /função.*longa|long.*function|function.*too.*large/i,
    categoria: 'FUNCOES_LONGAS',
    titulo: 'Very Long Functions',
    prioridade: 'media',
    icone: '[SIZE]',
    acaoSugerida: 'Split into smaller, more cohesive functions',
  },

  // Low priority
  {
    padrao: /todo|fixme|hack|workaround/i,
    categoria: 'TAREFAS_PENDENTES',
    titulo: 'Pending Tasks in Code',
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    acaoSugerida: 'Review and resolve pending TODOs/FIXMEs',
  },
  {
    padrao: /magic.*number|número.*mágico/i,
    categoria: 'NUMEROS_MAGICOS',
    titulo: 'Magic Numbers in Code',
    prioridade: 'baixa',
    icone: ICONES_DIAGNOSTICO.stats,
    acaoSugerida: 'Replace with named constants',
  },
];

  /* -------------------------- HELPERS -------------------------- */

/**
 * Gets the priority of a problem type
 */
export function getPrioridade(tipo: string): ConfigPrioridade {
  return (
    PRIORIDADES[tipo] || {
      prioridade: 'baixa',
      icone: ICONES_ARQUIVO.arquivo,
      descricao: 'Uncategorized problem',
    }
  );
}

/**
 * Finds grouping by message
 */
export function findAgrupamento(mensagem: string): AgrupamentoConfig | null {
  for (const grupo of AGRUPAMENTOS_MENSAGEM) {
    if (grupo.padrao.test(mensagem)) {
      return grupo;
    }
  }
  return null;
}

/**
 * Sorts problems by priority
 */
export function ordenarPorPrioridade<
  T extends { prioridade?: PrioridadeNivel },
>(problemas: T[]): T[] {
  const ordem: Record<PrioridadeNivel, number> = {
    critica: 0,
    alta: 1,
    media: 2,
    baixa: 3,
  };

  return [...problemas].sort((a, b) => {
    const prioA = a.prioridade || 'baixa';
    const prioB = b.prioridade || 'baixa';
    return ordem[prioA] - ordem[prioB];
  });
}

/**
 * Counts problems by priority
 */
export function contarPorPrioridade<T extends { prioridade?: PrioridadeNivel }>(
  problemas: T[],
): Record<PrioridadeNivel, number> {
  const contagem: Record<PrioridadeNivel, number> = {
    critica: 0,
    alta: 0,
    media: 0,
    baixa: 0,
  };

  for (const prob of problemas) {
    const prio = prob.prioridade || 'baixa';
    contagem[prio]++;
  }

  return contagem;
}
