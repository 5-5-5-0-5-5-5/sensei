export * from './detector-anti-padroes-async.js';
export * from './detector-arquetipos.js';
export * from './detector-arquitetura.js';
export * from './detector-codigo-fragil.js';
export * from './detector-construcoes-sintaticas.js';
export * from './detector-contexto-inteligente.js';
export * from './detector-dependencias.js';
export * from './detector-duplicacoes.js';
export * from './detector-estrutura.js';
export * from './detector-fantasmas.js';
export * from './detector-interfaces-inline.js';
export * from './detector-performance.js';
export * from './detector-seguranca.js';
export * from './detector-tipos-inseguros.js';
export * from './detector-vazamentos-memoria.js';

// Default export para compatibilidade
export const detectores = {
  detectorDependencias: (): null => null,
  detectorEstrutura: (): null => null,
  analyserArquitetura: (): null => null,
  analyserCodigoFragil: (): null => null,
  analyserSeguranca: (): null => null,
  analyserDuplicacoes: (): null => null,
  analyserContextoInteligente: (): null => null,
  analyserPerformance: (): null => null,
  analyserVazamentosMemoria: (): null => null,
  analyserInterfacesInline: (): null => null,
  analyserTiposInseguros: (): null => null,
  analyserAntiPadroesAsync: (): null => null,
  analyserConstrucoesSintaticas: (): null => null,
  detectorFantasmas: (): null => null,
  detectorArquetipos: (): null => null,
};
