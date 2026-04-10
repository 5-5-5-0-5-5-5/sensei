// SPDX-License-Identifier: MIT
/**
 * @fileoverview Exportações centralizadas de tipos de analistas
 *
 * Re-exporta todos os tipos relacionados a analistas, detectores,
 * estrategistas e suas funcionalidades.
 */

// Markdown
export * from './markdown.js';

// Detectores
export * from './detectores.js';

// Contexto (já exportado em detectores, mas mantido para compatibilidade)
export * from './contexto.js';

// Estrategistas
export * from './estrategistas.js';

// Correções
export * from './corrections.js';
