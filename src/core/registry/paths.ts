// SPDX-License-Identifier: MIT
/**
 * @fileoverview Gerenciamento centralizado de caminhos para arquivos JSON do Prometheus
 *
 * Este módulo define todos os caminhos de arquivos JSON usados pelo sistema,
 * evitando hardcoding espalhado e permitindo evolução consistente.
 *
 * Convenção de nomes:
 * - guardian.baseline.json: Snapshot de integridade do Guardian
 * - estrutura.baseline.json: Baseline da estrutura de diretórios
 * - estrutura.arquetipo.json: Arquétipo personalizado do repositório
 * - prometheus.config.json: Configuração do usuário (raiz do projeto)
 */

import path from 'node:path';

// Diretório base do projeto (raiz) - usa CWD quando executado pelo CLI
export const PROJETO_RAIZ = process.cwd();

/**
 * Diretórios principais do Prometheus
 */
export const PROMETHEUS_DIRS = {
  /** Diretório de estado interno (.prometheus/) */
  STATE: path.join(PROJETO_RAIZ, '.prometheus'),
  /** Diretório de histórico de métricas (.prometheus/historico-metricas/) */
  METRICS_HISTORY: path.join(PROJETO_RAIZ, '.prometheus', 'historico-metricas'),
  /** Diretório de relatórios (reports/) */
  REPORTS: path.join(PROJETO_RAIZ, 'reports'),
  /** Diretório de performance baselines (docs/perf/) */
  PERF: path.join(PROJETO_RAIZ, 'docs', 'perf')
} as const;

/**
 * Arquivos JSON do sistema
 *
 * Categoria 1: Configuração (leitura usuário)
 * Categoria 2: Estado interno (leitura/escrita sistema)
 * Categoria 3: Relatórios (escrita sistema)
 */
export const PROMETHEUS_ARQUIVOS = {
  /* -------------------------- CONFIGURAÇÃO (raiz do projeto) -------------------------- */
  /** Configuração principal do usuário (prometheus.config.json) */
  CONFIG: path.join(PROJETO_RAIZ, 'prometheus.config.json'),
  /** Configuração segura/alternativa (prometheus.config.safe.json) */
  CONFIG_SAFE: path.join(PROJETO_RAIZ, 'prometheus.config.safe.json'),
  /* -------------------------- ESTADO INTERNO (.prometheus/) -------------------------- */
  /** Baseline de integridade do Guardian (.prometheus/guardian.baseline.json) */
  GUARDIAN_BASELINE: path.join(PROMETHEUS_DIRS.STATE, 'guardian.baseline.json'),
  /** Baseline de estrutura de diretórios (.prometheus/estrutura.baseline.json) */
  ESTRUTURA_BASELINE: path.join(PROMETHEUS_DIRS.STATE, 'estrutura.baseline.json'),
  /** Arquétipo personalizado do repo (.prometheus/estrutura.arquetipo.json) */
  ESTRUTURA_ARQUETIPO: path.join(PROMETHEUS_DIRS.STATE, 'estrutura.arquetipo.json'),
  /** Mapa de reversão de estrutura (.prometheus/mapa-reversao.json) */
  MAPA_REVERSAO: path.join(PROMETHEUS_DIRS.STATE, 'mapa-reversao.json'),
  /** Registros da Vigia Oculta (.prometheus/integridade.json) */
  REGISTRO_VIGIA: path.join(PROMETHEUS_DIRS.STATE, 'integridade.json'),
  /** Histórico de métricas (.prometheus/historico-metricas/metricas-historico.json) */
  METRICAS_HISTORICO: path.join(PROMETHEUS_DIRS.METRICS_HISTORY, 'metricas-historico.json'),
  /* -------------------------- ARQUIVOS LEGADOS (compatibilidade) -------------------------- */
  /** @deprecated Use GUARDIAN_BASELINE - baseline.json antigo */
  GUARDIAN_BASELINE_LEGACY: path.join(PROMETHEUS_DIRS.STATE, 'baseline.json'),
  /** @deprecated Use ESTRUTURA_BASELINE - baseline-estrutura.json antigo */
  ESTRUTURA_BASELINE_LEGACY: path.join(PROMETHEUS_DIRS.STATE, 'baseline-estrutura.json'),
  /** @deprecated Movido para .prometheus/ - prometheus.repo.arquetipo.json na raiz */
  ESTRUTURA_ARQUETIPO_LEGACY_ROOT: path.join(PROJETO_RAIZ, 'prometheus.repo.arquetipo.json')
} as const;

/**
 * Padrões de nomenclatura para relatórios dinâmicos
 */
export const REPORT_PADROES = {
  /** Relatório de diagnóstico (prometheus-diagnostico-{timestamp}.md) */
  DIAGNOSTICO: (timestamp: string) => path.join(PROMETHEUS_DIRS.REPORTS, `prometheus-diagnostico-${timestamp}.md`),
  /** Relatório JSON resumo (prometheus-relatorio-summary-{timestamp}.json) */
  SUMMARY_JSON: (timestamp: string) => path.join(PROMETHEUS_DIRS.REPORTS, `prometheus-relatorio-summary-${timestamp}.json`),
  /** Relatório de análise async (async-analysis-report.json) */
  ASYNC_ANALYSIS: path.join(PROMETHEUS_DIRS.REPORTS, 'async-analysis-report.json'),
  /** Baseline de performance (docs/perf/baseline-{timestamp}.json) */
  PERF_BASELINE: (timestamp: string) => path.join(PROMETHEUS_DIRS.PERF, `baseline-${timestamp}.json`),
  /** Diff de performance (docs/perf/ultimo-diff.json) */
  PERF_DIFF: path.join(PROMETHEUS_DIRS.PERF, 'ultimo-diff.json')
} as const;

/**
 * Mapeia nomes legados para novos caminhos (migração automática)
 */
export const MIGRACAO_MAPA = {
  // Guardian: baseline.json → guardian.baseline.json
  [PROMETHEUS_ARQUIVOS.GUARDIAN_BASELINE_LEGACY]: PROMETHEUS_ARQUIVOS.GUARDIAN_BASELINE,
  // Estrutura: baseline-estrutura.json → estrutura.baseline.json
  [PROMETHEUS_ARQUIVOS.ESTRUTURA_BASELINE_LEGACY]: PROMETHEUS_ARQUIVOS.ESTRUTURA_BASELINE,
  // Arquétipo: prometheus.repo.arquetipo.json (raiz) → .prometheus/estrutura.arquetipo.json
  [PROMETHEUS_ARQUIVOS.ESTRUTURA_ARQUETIPO_LEGACY_ROOT]: PROMETHEUS_ARQUIVOS.ESTRUTURA_ARQUETIPO
} as const;

/**
 * Retorna o caminho legado (se existir) ou o novo
 * @param newPath Caminho novo desejado
 * @returns Caminho do arquivo (prioriza legado se existir)
 */
export function resolveFilePath(newPath: string): string {
  // Verifica se há entrada no mapa de migração reverso
  const legacyCaminho = Object.entries(MIGRACAO_MAPA).find(([_, target]) => target === newPath)?.[0];
  return legacyCaminho || newPath;
}

/**
 * Tipo para caminhos de arquivos do Prometheus
 */
export type PrometheusFilePath = (typeof PROMETHEUS_ARQUIVOS)[keyof typeof PROMETHEUS_ARQUIVOS];
export type PrometheusDirPath = (typeof PROMETHEUS_DIRS)[keyof typeof PROMETHEUS_DIRS];