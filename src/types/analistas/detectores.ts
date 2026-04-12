// SPDX-License-Identifier: MIT

// Tipos permissivos para detectores — preferimos segurança de compilação agora
// e refinaremos os tipos por detector no futuro.

export type TipoFragilidade = string;

export interface Fragilidade {
  tipo: TipoFragilidade;
  linha: number;
  coluna: number;
  descricao?: string;
  sugestao?: string;
  severidade?: 'baixa' | 'media' | 'alta' | 'critica';
  contexto?: string;
  nome?: string;
}

export interface ConstrucaoSintatica {
  tipo: string;
  linha: number;
  coluna: number;
  codigo?: string;
  nome?: string;
  contexto?: string;
}

export interface EstatisticasArquivo {
  imports: number | ImportInfo[];
  exports: number | ExportInfo[];
  sloc?: number;
  funcoes?: number;
  classes?: number;
  caminho?: string;
  aliases?: Record<string, number>;
  dependenciasInternas?: string[];
  dependenciasExternas?: string[];
  complexidade?: number;
}

export interface ImportInfo {
  origem?: string;
  tipo?: 'external' | 'alias' | 'relative';
  items?: string[];
  isType?: boolean;
}

export interface ExportInfo {
  nome?: string;
  tipo?: 'named' | 'default' | 'reexport';
}

export interface AnaliseArquitetural {
  imports: ImportInfo[] | string[];
  exports: ExportInfo[] | string[];
  stats: EstatisticasArquivo;
  padraoIdentificado?: string;
  confianca?: number;
  caracteristicas?: string[];
  violacoes?: string[];
  recomendacoes?: string[];
  metricas?:
  | Record<string, number>
  | {
    modularidade?: number;
    acoplamento?: number;
    coesao?: number;
    complexidadeMedia?: number;
  };
}

export interface BlocoFuncao {
  nome?: string;
  inicio?: number;
  fim?: number;
  conteudo?: string;
  codigo?: string;
  hash?: string;
  caminho?: string;
  parametros?: string[];
  tipoFuncao?: string;
}

export interface DuplicacaoEncontrada {
  arquivo1?: string;
  arquivo2?: string;
  bloco1?: BlocoFuncao;
  bloco2?: BlocoFuncao;
  funcaoA?: BlocoFuncao;
  funcaoB?: BlocoFuncao;
  similaridade: number;
  tipoSimilaridade?: string;
}

export interface ProblemaDocumentacao {
  tipo: string;
  linha: number;
  coluna: number;
  contexto?: string;
  prioridade?: 'baixa' | 'media' | 'alta';
  descricao?: string;
  sugestao?: string;
}

export interface ProblemaPerformance {
  tipo: string;
  linha: number;
  coluna: number;
  descricao?: string;
  impacto?: 'baixo' | 'medio' | 'alto';
  sugestao?: string;
}

export interface ProblemaFormatacao {
  tipo: string;
  linha?: number;
  coluna?: number;
  mensagem?: string;
}

export type ProblemaQualidade =
  | Fragilidade
  | ProblemaPerformance
  | ProblemaDocumentacao
  | ProblemaFormatacao;

/**
 * Detecção de interface inline
 */
export interface InterfaceInlineDetection {
  tipo: 'interface' | 'type-alias' | 'object-literal-type';
  nome?: string;
  linha: number;
  complexidade: number;
  contexto: string;
  sugestao: string;
}

/**
 * Problema detectado em workflows do GitHub Actions
 */
export interface ProblemaWorkflow {
  tipo:
  | 'action-desatualizada'
  | 'permissoes-excessivas'
  | 'secret-hardcoded'
  | 'falta-timeout'
  | 'run-inseguro'
  | 'checkout-inseguro'
  | 'branch-instavel'
  | 'falta-cache'
  | 'estrutura-workflow';
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  linha: number;
  sugestao: string;
}

/**
 * Resultado da análise de workflows
 */
export interface ResultadoAnalise {
  problemas: ProblemaWorkflow[];
  score: number;
  resumo: string;
}

/**
 * Problema de segurança detectado
 */
export interface ProblemaSeguranca {
  tipo:
  | 'eval-usage'
  | 'dangerous-html'
  | 'weak-crypto'
  | 'unsafe-regex'
  | 'prototype-pollution'
  | 'path-traversal'
  | 'hardcoded-secrets'
  | 'unhandled-async'
  | 'unhandled-async-event'
  | 'sql-injection'
  | 'command-injection'
  | 'insecure-cookie'
  | 'no-csrf-token'
  | 'xss-vulnerability'
  | 'dangerously-set-inner-html'
  | 'sensitive-env-exposure'
  | 'unsafe-regex-literal';
  descricao: string;
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  linha: number;
  sugestao: string;
}

/**
 * Resultado de detecção contextual
 */
export interface ResultadoContexto {
  tecnologia?: string;
  confiancaTotal: number;
  evidencias?: Array<{ tipo: string; valor: string }>;
  sugestoesMelhoria?: string[];
}

/**
 * Ocorrência de tipo inline extraída do código
 */
export interface InlineTypeOccurrence {
  tipo: string;
  estrutura: string;
  linha: number;
  contexto: string;
}

/**
 * Entrada de tipo duplicado
 */
export interface DuplicateEntry {
  linha: number;
  tipo: string;
  contexto: string;
}

/**
 * Resultado de detecção de segredos
 */
export interface ResultadoSegredo {
  campo: string;
  valor: string;
  linha: number;
  confianca: 'baixa' | 'media' | 'alta';
}

/**
 * Argumentos para mensagem de tipo duplicado
 */
export interface TipoDuplicadoArgs {
  propriedades: string[];
  totalOcorrencias: number;
  contextoDesc: string;
  nomesSugeridos: string;
}

/**
 * Estado do visitor para detecção de vazamentos de memória
 */
export interface MemoriaVisitorState {
  ocorrencias: import('../comum/ocorrencias.js').OcorrenciaBase[];
  relPath: string;
  contextType: 'react' | 'vanilla';
  hasGlobalListeners: boolean;
}

export { };
