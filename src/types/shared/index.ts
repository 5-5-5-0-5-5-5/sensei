// SPDX-License-Identifier: MIT
/**
 * Exportações centralizadas de tipos do shared
 * (Tipos movidos: contexto→projeto, fragmentacao/leitor→relatorios)
 */

// Contexto - MOVIDO para projeto/contexto.ts
// export type { ContextoProjeto, DetectarContextoOpcoes } from '../projeto/contexto.js';

// Estrutura
export * from './estrutura.js';

// Fragmentação - MOVIDO para relatorios/fragmentacao.ts
// export type { FragmentOptions, ManifestPart, RelatorioCompleto, FileEntry, Manifest } from '../relatorios/fragmentacao.js';

// Imports
export * from './imports.js';

// Leitor de relatórios - MOVIDO para relatorios/leitor.ts
// export type { LeitorRelatorioOptions } from '../relatorios/leitor.js';

// Validação (tipos que não conflitam com outros módulos)
export * from './validacao.js';

// Vitest Alias
export * from './vitest-alias.js';

// Persistência
export * from './persistencia.js';

// Helpers
export * from './helpers.js';

// Impar (formatter e svgs)
export * from './impar.js';

// Stylelint
export * from './stylelint.js';

// Memory
export * from './memory.js';
