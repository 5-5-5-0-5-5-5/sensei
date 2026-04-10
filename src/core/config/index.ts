// Default export
import { chalk } from './chalk-safe.js';
import { config } from './config.js';

export * from './chalk-safe.js';
export * from './config.js';
export * from './configuracao-pontuacao.js';
export * from './conventions.js';
export * from './excludes-padrao.js';
export * from './format.js';
export * from './include-exclude.js';
export * from './limites.js';
export * from './paths.js';
export * from './seguranca.js';
export * from './traverse.js';

export const configDefault = { config, chalk };
