export * from './detector-dependencias.js';
export * from './detector-arquetipos.js';
export * from './detector-estrutura.js';
export * from './detector-fantasmas.js';
export * from './detector-contexto-inteligente.js';
export * from './detector-performance.js';
export * from './detector-seguranca.js';
export * from './detector-duplicacoes.js';
export * from './detector-anti-padroes-async.js';
export * from './detector-codigo-fragil.js';
export * from './detector-construcoes-sintaticas.js';
export * from './detector-interfaces-inline.js';
export * from './detector-tipos-inseguros.js';
export * from './detector-vazamentos-memoria.js';
export * from './detector-arquitetura.js';

// Default export para compatibilidade
export default {
  detectorDependencias: () => null,
  detectorEstrutura: () => null,
  analyserArquitetura: () => null,
  analyserCodigoFragil: () => null,
  analyserSeguranca: () => null,
  analyserDuplicacoes: () => null,
  analyserContextoInteligente: () => null,
  analyserPerformance: () => null,
  analyserVazamentosMemoria: () => null,
  analyserInterfacesInline: () => null,
  analyserTiposInseguros: () => null,
  analyserAntiPadroesAsync: () => null,
  analyserConstrucoesSintaticas: () => null,
  detectorFantasmas: () => null,
  detectorArquetipos: () => null,
};