// SPDX-License-Identifier: MIT
/**
 * Ponto de entrada único para todos os comandos da CLI do Prometheus.
 *
 * Este arquivo centraliza as exportações de todos os comandos disponíveis,
 * facilitando a manutenção e evitando múltiplas importações espalhadas.
 */

// Comandos principais
export * from './comando-analistas.js';
export * from './comando-atualizar.js';
export * from './comando-diagnosticar.js';
export * from './comando-fix-types.js';
export * from './comando-formatar.js';
export * from './comando-guardian.js';
export * from './comando-licensas.js';
export * from './comando-metricas.js';
export * from './comando-otimizar-svg.js';
export * from './comando-perf.js';
export * from './comando-podar.js';
export * from './comando-reestruturar.js';
export * from './comando-plugins.js';
export * from './comando-dashboard.js';

// Comando de reversão (diferente padrão de export)
export * from './comando-reverter.js';

// Comandos de manutenção de nomes
export * from './comando-names.js';
export * from './comando-rename.js';
