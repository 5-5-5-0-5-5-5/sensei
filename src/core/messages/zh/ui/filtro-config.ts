// SPDX-License-Identifier: MIT
/**
 * 智能报告过滤器的集中化设置
 * 定义优先级、分组和问题分类
 */

import type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel } from '@';

import {
  ICONES_ARQUIVO,
  ICONES_DIAGNOSTICO,
  ICONES_FEEDBACK,
} from '../../shared/icons.js';

// 为兼容性重新导出类型
export type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel };

  /* -------------------------- 按问题类型划分优先级 -------------------------- */

export const PRIORIDADES: Record<string, ConfigPrioridade> = {
  // 严重 - 安全与数据
  PROBLEMA_SEGURANCA: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: '检测到安全漏洞',
  },
  VULNERABILIDADE_SEGURANCA: {
    prioridade: 'critica',
    icone: '[ERRO]',
    descricao: '严重安全缺陷',
  },
  CREDENCIAIS_EXPOSTAS: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: '硬编码或暴露的凭据',
  },

  // 高 - 脆弱代码与缺陷
  CODIGO_FRAGIL: {
    prioridade: 'alta',
    icone: '[AVISO]',
    descricao: '容易出错的代码',
  },
  'tipo-inseguro-any': {
    prioridade: 'alta',
    icone: '[HIGH]',
    descricao: '可被替换的 any 类型用法',
  },
  'tipo-inseguro-unknown': {
    prioridade: 'media',
    icone: '[WARN]',
    descricao: '可被具体化的 unknown 类型用法',
  },
  PROBLEMA_TESTE: {
    prioridade: 'alta',
    icone: '[TEST]',
    descricao: '测试问题',
  },
  'estrutura-suspeita': {
    prioridade: 'alta',
    icone: '[SCAN]',
    descricao: '可疑的代码结构',
  },
  COMPLEXIDADE_ALTA: {
    prioridade: 'alta',
    icone: '[STATS]',
    descricao: '圈复杂度过高',
  },

  // 中 - 可维护性与模式
  PROBLEMA_DOCUMENTACAO: {
    prioridade: 'media',
    icone: '[DOC]',
    descricao: '缺少或不充分的文档',
  },
  'padrao-ausente': {
    prioridade: 'media',
    icone: '[GOAL]',
    descricao: '缺少推荐模式',
  },
  'estrutura-config': {
    prioridade: 'media',
    icone: '[CONFIG]',
    descricao: '配置问题',
  },
  'estrutura-entrypoints': {
    prioridade: 'media',
    icone: '[ENTRY]',
    descricao: '入口点定义不清',
  },
  ANALISE_ARQUITETURA: {
    prioridade: 'media',
    icone: '[BUILD]',
    descricao: '架构分析',
  },

  // 低 - 信息性与改进
  CONSTRUCOES_SINTATICAS: {
    prioridade: 'baixa',
    icone: '[SYNTAX]',
    descricao: '检测到语法模式',
  },
  CARACTERISTICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[ARCH]',
    descricao: '架构特征',
  },
  METRICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[SIZE]',
    descricao: '架构指标',
  },
  TODO_PENDENTE: {
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    descricao: 'TODO 和待办事项',
  },
  IDENTIFICACAO_PROJETO: {
    prioridade: 'baixa',
    icone: '[TAG]',
    descricao: '项目类型识别',
  },
  SUGESTAO_MELHORIA: {
    prioridade: 'baixa',
    icone: '[DICA]',
    descricao: '改进建议',
  },
  EVIDENCIA_CONTEXTO: {
    prioridade: 'baixa',
    icone: '[SCAN]',
    descricao: '上下文证据',
  },
  TECNOLOGIAS_ALTERNATIVAS: {
    prioridade: 'baixa',
    icone: '[ALT]',
    descricao: '建议的替代技术',
  },
};

  /* -------------------------- 按消息模式的智能分组 -------------------------- */

export const AGRUPAMENTOS_MENSAGEM: AgrupamentoConfig[] = [
  // 严重安全
  {
    padrao:
      /token hardcoded|senha hardcoded|chave hardcoded|api.*key.*hardcoded/i,
    categoria: 'SEGURANCA_HARDCODED',
    titulo: '检测到硬编码凭据',
    prioridade: 'critica',
    icone: ICONES_ARQUIVO.lock,
    acaoSugerida: '将凭据移至环境变量 (.env)',
  },
  {
    padrao: /sql.*injection|xss|csrf|path.*traversal|command.*injection/i,
    categoria: 'VULNERABILIDADES_WEB',
    titulo: '检测到 Web 漏洞',
    prioridade: 'critica',
    icone: '[ERRO]',
    acaoSugerida: '应用输入清理和验证',
  },

  // 脆弱代码 (高)
  {
    padrao: /tipo.*inseguro.*any|any.*inseguro|unsafe.*any/i,
    categoria: 'TIPOS_ANY_INSEGUROS',
    titulo: '检测到不安全的 Any 类型',
    prioridade: 'alta',
    icone: '[HIGH]',
    acaoSugerida:
      '将 any 替换为具体类型以提高类型安全性',
  },
  {
    padrao: /tipo.*inseguro.*unknown|unknown.*inseguro|unsafe.*unknown/i,
    categoria: 'TIPOS_UNKNOWN_GENERICOS',
    titulo: '泛型 Unknown 类型',
    prioridade: 'media',
    icone: '[WARN]',
    acaoSugerida: '添加类型守卫或替换为具体类型',
  },
  {
    padrao: /complexidade.*alta|complex.*high|cyclomatic.*complexity/i,
    categoria: 'COMPLEXIDADE_ALTA',
    titulo: '高复杂度代码',
    prioridade: 'alta',
    icone: '[STATS]',
    acaoSugerida: '重构为更小的函数以提高可读性',
  },
  {
    padrao: /acoplamento.*alto|coupling.*high|tight.*coupling/i,
    categoria: 'ACOPLAMENTO_ALTO',
    titulo: '模块间耦合度过高',
    prioridade: 'alta',
    icone: '[LINK]',
    acaoSugerida: '审查依赖关系并应用解耦模式',
  },

  // 可维护性 (中)
  {
    padrao:
      /missing-jsdoc|missing documentation|sem documentação|no.*documentation/i,
    categoria: 'DOCUMENTACAO_AUSENTE',
    titulo: '缺少文档',
    prioridade: 'media',
    icone: '[DOC]',
    acaoSugerida: '添加 JSDoc/注释以提高可维护性',
  },
  {
    padrao: /console\.log|console-log|debug.*statement/i,
    categoria: 'CONSOLE_LOGS',
    titulo: '生产代码中的 Console.log',
    prioridade: 'media',
    icone: '[LOG]',
    acaoSugerida: '移除或替换为适当的日志系统',
  },
  {
    padrao: /código.*duplicado|duplicate.*code|copy.*paste/i,
    categoria: 'DUPLICACAO_CODIGO',
    titulo: '检测到重复代码',
    prioridade: 'media',
    icone: '[COPY]',
    acaoSugerida: '提取为可复用的函数/模块',
  },
  {
    padrao: /função.*longa|long.*function|function.*too.*large/i,
    categoria: 'FUNCOES_LONGAS',
    titulo: '过长函数',
    prioridade: 'media',
    icone: '[SIZE]',
    acaoSugerida: '拆分为更小、更内聚的函数',
  },

  // 低优先级
  {
    padrao: /todo|fixme|hack|workaround/i,
    categoria: 'TAREFAS_PENDENTES',
    titulo: '代码中的待办事项',
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    acaoSugerida: '审查并解决待办的 TODO/FIXME',
  },
  {
    padrao: /magic.*number|número.*mágico/i,
    categoria: 'NUMEROS_MAGICOS',
    titulo: '代码中的魔术数字',
    prioridade: 'baixa',
    icone: ICONES_DIAGNOSTICO.stats,
    acaoSugerida: '替换为命名常量',
  },
];

  /* -------------------------- 辅助函数 -------------------------- */

/**
 * 获取问题类型的优先级
 */
export function getPrioridade(tipo: string): ConfigPrioridade {
  return (
    PRIORIDADES[tipo] || {
      prioridade: 'baixa',
      icone: ICONES_ARQUIVO.arquivo,
      descricao: '未分类问题',
    }
  );
}

/**
 * 按消息查找分组
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
 * 按优先级排序问题
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
 * 按优先级计数
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
