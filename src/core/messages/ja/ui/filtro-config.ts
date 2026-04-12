// SPDX-License-Identifier: MIT
/**
 * インテリジェントレポートフィルターの集中化設定
 * 優先度、グループ化、問題のカテゴリ分けを定義
 */

import type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel } from '@';

import {
  ICONES_ARQUIVO,
  ICONES_DIAGNOSTICO,
  ICONES_FEEDBACK,
} from '../../shared/icons.js';

// 互換性のための型を再エクスポート
export type { AgrupamentoConfig, ConfigPrioridade, PrioridadeNivel };

  /* -------------------------- 問題タイプ別優先度 -------------------------- */

export const PRIORIDADES: Record<string, ConfigPrioridade> = {
  // 致命的 - セキュリティとデータ
  PROBLEMA_SEGURANCA: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: 'セキュリティ脆弱性が検出されました',
  },
  VULNERABILIDADE_SEGURANCA: {
    prioridade: 'critica',
    icone: '[ERRO]',
    descricao: '重大なセキュリティ欠陥',
  },
  CREDENCIAIS_EXPOSTAS: {
    prioridade: 'critica',
    icone: '[LOCK]',
    descricao: 'ハードコードされたまたは露出した認証情報',
  },

  // 高 - 脆弱なコードとバグ
  CODIGO_FRAGIL: {
    prioridade: 'alta',
    icone: '[AVISO]',
    descricao: '障害が発生しやすいコード',
  },
  'tipo-inseguro-any': {
    prioridade: 'alta',
    icone: '[HIGH]',
    descricao: '置き換え可能なany型の使用',
  },
  'tipo-inseguro-unknown': {
    prioridade: 'media',
    icone: '[WARN]',
    descricao: '固有型にできるunknown型の使用',
  },
  PROBLEMA_TESTE: {
    prioridade: 'alta',
    icone: '[TEST]',
    descricao: 'テストの問題',
  },
  'estrutura-suspeita': {
    prioridade: 'alta',
    icone: '[SCAN]',
    descricao: '疑わしいコード構造',
  },
  COMPLEXIDADE_ALTA: {
    prioridade: 'alta',
    icone: '[STATS]',
    descricao: '高い循環的複雑度',
  },

  // 中 - 保守性とパターン
  PROBLEMA_DOCUMENTACAO: {
    prioridade: 'media',
    icone: '[DOC]',
    descricao: 'ドキュメントが不足または不適切',
  },
  'padrao-ausente': {
    prioridade: 'media',
    icone: '[GOAL]',
    descricao: '推奨パターンが存在しない',
  },
  'estrutura-config': {
    prioridade: 'media',
    icone: '[CONFIG]',
    descricao: '設定の問題',
  },
  'estrutura-entrypoints': {
    prioridade: 'media',
    icone: '[ENTRY]',
    descricao: 'エントリポイントが不明確',
  },
  ANALISE_ARQUITETURA: {
    prioridade: 'media',
    icone: '[BUILD]',
    descricao: 'アーキテクチャ分析',
  },

  // 低 - 情報と改善
  CONSTRUCOES_SINTATICAS: {
    prioridade: 'baixa',
    icone: '[SYNTAX]',
    descricao: '構文パターンが検出されました',
  },
  CARACTERISTICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[ARCH]',
    descricao: 'アーキテクチャ特性',
  },
  METRICAS_ARQUITETURA: {
    prioridade: 'baixa',
    icone: '[SIZE]',
    descricao: 'アーキテクチャメトリクス',
  },
  TODO_PENDENTE: {
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    descricao: 'TODOと保留中のタスク',
  },
  IDENTIFICACAO_PROJETO: {
    prioridade: 'baixa',
    icone: '[TAG]',
    descricao: 'プロジェクトタイプの識別',
  },
  SUGESTAO_MELHORIA: {
    prioridade: 'baixa',
    icone: '[DICA]',
    descricao: '改善提案',
  },
  EVIDENCIA_CONTEXTO: {
    prioridade: 'baixa',
    icone: '[SCAN]',
    descricao: 'コンテキストの証拠',
  },
  TECNOLOGIAS_ALTERNATIVAS: {
    prioridade: 'baixa',
    icone: '[ALT]',
    descricao: '代替技術が提案されました',
  },
};

  /* -------------------------- メッセージパターン別のインテリジェントグループ化 -------------------------- */

export const AGRUPAMENTOS_MENSAGEM: AgrupamentoConfig[] = [
  // 致命的セキュリティ
  {
    padrao:
      /token hardcoded|senha hardcoded|chave hardcoded|api.*key.*hardcoded/i,
    categoria: 'SEGURANCA_HARDCODED',
    titulo: 'ハードコードされた認証情報が検出されました',
    prioridade: 'critica',
    icone: ICONES_ARQUIVO.lock,
    acaoSugerida: '認証情報を環境変数（.env）に移動',
  },
  {
    padrao: /sql.*injection|xss|csrf|path.*traversal|command.*injection/i,
    categoria: 'VULNERABILIDADES_WEB',
    titulo: 'Web脆弱性が検出されました',
    prioridade: 'critica',
    icone: '[ERRO]',
    acaoSugerida: '入力サニタイゼーションと検証を適用',
  },

  // 脆弱なコード（高）
  {
    padrao: /tipo.*inseguro.*any|any.*inseguro|unsafe.*any/i,
    categoria: 'TIPOS_ANY_INSEGUROS',
    titulo: '安全でないAny型が検出されました',
    prioridade: 'alta',
    icone: '[HIGH]',
    acaoSugerida:
      '型の安全性を向上させるために、anyを固有型に置き換えてください',
  },
  {
    padrao: /tipo.*inseguro.*unknown|unknown.*inseguro|unsafe.*unknown/i,
    categoria: 'TIPOS_UNKNOWN_GENERICOS',
    titulo: '汎用的なUnknown型',
    prioridade: 'media',
    icone: '[WARN]',
    acaoSugerida: '型ガードを追加するか、固有型に置き換えてください',
  },
  {
    padrao: /complexidade.*alta|complex.*high|cyclomatic.*complexity/i,
    categoria: 'COMPLEXIDADE_ALTA',
    titulo: '高複雑度のコード',
    prioridade: 'alta',
    icone: '[STATS]',
    acaoSugerida: '可読性を向上させるために小さな関数にリファクタリング',
  },
  {
    padrao: /acoplamento.*alto|coupling.*high|tight.*coupling/i,
    categoria: 'ACOPLAMENTO_ALTO',
    titulo: 'モジュール間の高い結合',
    prioridade: 'alta',
    icone: '[LINK]',
    acaoSugerida: '依存関係を見直し、結合解除パターンを適用',
  },

  // 保守性（中）
  {
    padrao:
      /missing-jsdoc|missing documentation|sem documentação|no.*documentation/i,
    categoria: 'DOCUMENTACAO_AUSENTE',
    titulo: 'ドキュメントが不足',
    prioridade: 'media',
    icone: '[DOC]',
    acaoSugerida: '保守性を向上させるためにJSDoc/コメントを追加',
  },
  {
    padrao: /console\.log|console-log|debug.*statement/i,
    categoria: 'CONSOLE_LOGS',
    titulo: '本番コード内のConsole.log',
    prioridade: 'media',
    icone: '[LOG]',
    acaoSugerida: '適切なロギングシステムに削除または置換',
  },
  {
    padrao: /código.*duplicado|duplicate.*code|copy.*paste/i,
    categoria: 'DUPLICACAO_CODIGO',
    titulo: '重複コードが検出されました',
    prioridade: 'media',
    icone: '[COPY]',
    acaoSugerida: '再利用可能な関数/モジュールに抽出',
  },
  {
    padrao: /função.*longa|long.*function|function.*too.*large/i,
    categoria: 'FUNCOES_LONGAS',
    titulo: '非常に長い関数',
    prioridade: 'media',
    icone: '[SIZE]',
    acaoSugerida: 'より凝集度の高い小さな関数に分割',
  },

  // 低優先度
  {
    padrao: /todo|fixme|hack|workaround/i,
    categoria: 'TAREFAS_PENDENTES',
    titulo: 'コード内の保留中のタスク',
    prioridade: 'baixa',
    icone: ICONES_FEEDBACK.dica,
    acaoSugerida: '保留中のTODO/FIXMEを確認して解決',
  },
  {
    padrao: /magic.*number|número.*mágico/i,
    categoria: 'NUMEROS_MAGICOS',
    titulo: 'コード内のマジックナンバー',
    prioridade: 'baixa',
    icone: ICONES_DIAGNOSTICO.stats,
    acaoSugerida: '名前付き定数に置き換え',
  },
];

  /* -------------------------- ヘルパー -------------------------- */

/**
 * 問題タイプの優先度を取得
 */
export function getPrioridade(tipo: string): ConfigPrioridade {
  return (
    PRIORIDADES[tipo] || {
      prioridade: 'baixa',
      icone: ICONES_ARQUIVO.arquivo,
      descricao: 'カテゴリ未分類の問題',
    }
  );
}

/**
 * メッセージによるグループ化を検索
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
 * 問題を優先度順にソート
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
 * 優先度別に問題をカウント
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
