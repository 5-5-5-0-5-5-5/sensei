// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// Justification: inline types for caretaker messages

import { ICONES_ACAO, ICONES_STATUS, ICONES_ZELADOR as ICONES_ZELADOR_CENTRAL } from '../../shared/icons.js';
/**
 * Caretaker Messages
 *
 * Centralizes all messages related to caretakers (auto-fix)
 * including: imports, types, structure, etc.
 */

/**
 * Icons and emojis used by caretakers
 */
const ICONES_ZELADOR = {
  ...ICONES_ZELADOR_CENTRAL
} as const;

/**
 * Import Caretaker Messages
 */
export const MENSAGENS_IMPORTS = {
  titulo: `${ICONES_ACAO.correcao} Import Caretaker - Starting fixes...`,
  resumo: `${ICONES_ZELADOR.resumo} Summary:`,
  dryRunAviso: `${ICONES_ZELADOR.dryRun} Dry-run mode: no files were modified`,
  sucessoFinal: `${ICONES_STATUS.ok} Fixes applied successfully!`
} as const;

/**
 * Import caretaker progress messages
 */
export const PROGRESSO_IMPORTS = {
  diretorioNaoEncontrado: (dir: string) => `${ICONES_ZELADOR.aviso} Directory not found: ${dir}`,
  arquivoProcessado: (arquivo: string, count: number) => `${ICONES_ZELADOR.sucesso} ${arquivo} (${count} fix${count !== 1 ? 'es' : ''})`,
  arquivoErro: (arquivo: string, erro: string) => `${ICONES_ZELADOR.erro} ${arquivo}: ${erro}`,
  lendoDiretorio: (dir: string) => `Reading directory: ${dir}`
} as const;

/**
 * Import caretaker error messages
 */
export const ERROS_IMPORTS = {
  lerDiretorio: (dir: string, error: unknown) => {
    const mensagem = error instanceof Error ? error.message : String(error);
    return `Error reading directory ${dir}: ${mensagem}`;
  },
  processar: (arquivo: string, error: unknown) => {
    const mensagem = error instanceof Error ? error.message : String(error);
    return `Error processing ${arquivo}: ${mensagem}`;
  }
} as const;

/**
 * Formats summary statistics line
 */
export function formatarEstatistica(label: string, valor: number | string, icone?: string): string {
  const prefixo = icone ? `${icone} ` : '   ';
  return `${prefixo}${label}: ${valor}`;
}

/**
 * Generates import fixes summary
 */
export function gerarResumoImports(stats: {
  processados: number;
  modificados: number;
  totalCorrecoes: number;
  erros: number;
  dryRun: boolean;
}): string[] {
  const linhas: string[] = ['', MENSAGENS_IMPORTS.resumo, formatarEstatistica('Processed files', stats.processados), formatarEstatistica('Modified files', stats.modificados), formatarEstatistica('Total fixes', stats.totalCorrecoes)];
  if (stats.erros > 0) {
    linhas.push(formatarEstatistica('Errors', stats.erros, ICONES_ZELADOR.aviso));
  }
  linhas.push('');
  if (stats.dryRun) {
    linhas.push(MENSAGENS_IMPORTS.dryRunAviso);
  } else {
    linhas.push(MENSAGENS_IMPORTS.sucessoFinal);
  }
  return linhas;
}

/**
 * Type Caretaker Messages (future)
 */
export const MENSAGENS_TIPOS = {
  titulo: `${ICONES_ACAO.correcao} Type Caretaker - Starting fixes...`,
  analisandoTipo: (tipo: string) => `Analyzing type: ${tipo}`,
  tipoCorrigido: (antes: string, depois: string) => `Fixed: ${antes} → ${depois}`
} as const;

/**
 * Structure Caretaker Messages (future)
 */
export const MENSAGENS_ESTRUTURA = {
  titulo: `${ICONES_ACAO.organizacao} Structure Caretaker - Reorganizing files...`,
  movendo: (origem: string, destino: string) => `Moving: ${origem} → ${destino}`,
  criandoDiretorio: (dir: string) => `Creating directory: ${dir}`
} as const;

/**
 * Generic caretaker messages
 */
export const MENSAGENS_ZELADOR_GERAL = {
  iniciando: (zelador: string) => `${ICONES_ZELADOR.inicio} ${zelador} - Starting...`,
  concluido: (zelador: string) => `${ICONES_ZELADOR.sucesso} ${zelador} - Completed!`,
  erro: (zelador: string, mensagem: string) => `${ICONES_ZELADOR.erro} ${zelador} - Error: ${mensagem}`
} as const;

/**
 * Output templates for different modes
 */
export const MODELOS_SAIDA = {
  compacto: {
    inicio: (nome: string) => `${ICONES_ZELADOR.inicio} ${nome}`,
    progresso: (atual: number, total: number) => `[${atual}/${total}]`,
    fim: (sucesso: boolean) => sucesso ? ICONES_ZELADOR.sucesso : ICONES_ZELADOR.erro
  },
  detalhado: {
    inicio: (nome: string, descricao: string) => `${ICONES_ZELADOR.inicio} ${nome}\n   ${descricao}`,
    progresso: (arquivo: string, atual: number, total: number) => `   [${atual}/${total}] ${arquivo}`,
    fim: (stats: {
      sucesso: number;
      falha: number;
    }) => `\n${ICONES_ZELADOR.resumo} Success: ${stats.sucesso}, Failure: ${stats.falha}`
  }
} as const;

/**
 * Exit codes for caretakers
 */
export const SAIDA_CODIGOS = {
  SUCESSO: 0,
  ERRO_GERAL: 1,
  ERRO_ARQUIVO: 2,
  ERRO_PERMISSAO: 3,
  CANCELADO_USUARIO: 4
} as const;

/**
 * Formats modified file list
 */
export function formatarListaArquivos(arquivos: string[], maxExibir: number = 10): string[] {
  const linhas: string[] = [];
  const mostrar = arquivos.slice(0, maxExibir);
  for (const arquivo of mostrar) {
    linhas.push(`   ${ICONES_ZELADOR.arquivo} ${arquivo}`);
  }
  const restantes = arquivos.length - maxExibir;
  if (restantes > 0) {
    linhas.push(`   ... and ${restantes} more file${restantes !== 1 ? 's' : ''}`);
  }
  return linhas;
}

/**
 * Formats execution duration
 */
export function formatarDuracao(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}s`;
  }
  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor(ms % 60000 / 1000);
  return `${minutos}m ${segundos}s`;
}

/**
 * Formats message with timestamp
 */
export function formatarComTimestamp(mensagem: string): string {
  const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS
  return `[${timestamp}] ${mensagem}`;
}
