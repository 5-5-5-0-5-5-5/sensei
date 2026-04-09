// SPDX-License-Identifier: MIT
/**
 * Fix-Types Command Messages
 *
 * Centralizes all messages, texts, and templates related to the fix-types command
 * which detects and categorizes unsafe types (any/unknown) in TypeScript code.
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_RELATORIO, ICONES_STATUS, ICONES_TIPOS } from '../../shared/icons.js';

/**
 * Unsafe type category configuration
 */
export const CATEGORIAS_TIPOS = {
  LEGITIMO: {
    icone: ICONES_TIPOS.legitimo,
    nome: 'LEGITIMATE',
    descricao: 'Correct use of unknown - no action required',
    confidenciaMin: 100
  },
  MELHORAVEL: {
    icone: ICONES_TIPOS.melhoravel,
    nome: 'IMPROVABLE',
    descricao: 'Could be more specific - manual review recommended',
    confidenciaMin: 70
  },
  CORRIGIR: {
    icone: ICONES_TIPOS.corrigir,
    nome: 'FIX',
    descricao: 'Must be replaced - automatic fix possible',
    confidenciaMin: 95
  }
} as const;

/**
 * Start/header messages for the command
 */
export const MENSAGENS_INICIO = {
  titulo: `${ICONES_COMANDO.fixTypes} Starting unsafe type 分析...`,
  analisando: (target: string) => `${ICONES_ARQUIVO.diretorio} Analyzing: ${target}`,
  confianciaMin: (min: number) => `${ICONES_DIAGNOSTICO.stats} Minimum confidence: ${min}%`,
  modo: (dryRun: boolean) => `${dryRun ? ICONES_ACAO.analise : ICONES_ACAO.correcao} Mode: ${dryRun ? '分析 (dry-run)' : 'Apply fixes'}`
} as const;

/**
 * Progress/status messages
 */
export const MENSAGENS_PROGRESSO = {
  processandoArquivos: (count: number) => `${ICONES_ARQUIVO.diretorio} Processing ${count} ファイル...`,
  arquivoAtual: (arquivo: string, count: number) => `${ICONES_ARQUIVO.arquivo} ${arquivo}: ${count} occurrence${count !== 1 ? 's' : ''}`
} as const;

/**
 * Summary/statistics messages
 */
export const MENSAGENS_RESUMO = {
  encontrados: (count: number) => `Found ${count} unsafe types:`,
  tituloCategorizacao: `${ICONES_DIAGNOSTICO.stats} Categorization 分析:`,
  confianciaMedia: (media: number) => `${ICONES_DIAGNOSTICO.stats} Average confidence: ${media}%`,
  porcentagem: (count: number, total: number) => {
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    return `${count} case${count !== 1 ? 's' : ''} (${pct}%)`;
  }
} as const;

/**
 * Tips/help messages
 */
export const DICAS = {
  removerDryRun: '[TIP] To apply fixes, remove the --dry-run flag',
  usarInterativo: '[TIP] Use --interactive to confirm each fix',
  ajustarConfianca: (atual: number) => `${ICONES_FEEDBACK.dica} Use --confidence <num> to adjust the threshold (current: ${atual}%)`,
  revisar: (categoria: string) => `${ICONES_FEEDBACK.dica} Review ${categoria} cases manually`
} as const;

/**
 * Suggested actions by category
 */
export const ACOES_SUGERIDAS = {
  LEGITIMO: ['These cases are correct and should be kept as is', 'Do not require any additional action'],
  MELHORAVEL: ['Consider replacing with more specific types when possible', 'Review during future refactorings', 'Add comments explaining the use of unknown'],
  CORRIGIR: ['Prioritize fixing these cases', 'Replace with specific TypeScript types', 'Use type guards when necessary']
} as const;

/**
 * Error/warning messages
 */
export const MENSAGENS_ERRO = {
  correcaoNaoImplementada: 'Complete automatic fix not yet implemented',
  sistemaDesenvolvimento: `${ICONES_FEEDBACK.foguete} Advanced automatic fix system under development`,
  requisitoAnalise: 'Requires AST analysis and type inference to be safe',
  detectorNaoEncontrado: 'Unsafe type detector not found in analyst registry',
  modulosNaoEncontrados: 'Fix modules not found'
} as const;

/**
 * Success messages
 */
export const MENSAGENS_SUCESSO = {
  nenhumTipoInseguro: `${ICONES_STATUS.ok} No unsafe types detected! Code has good type safety.`,
  nenhumAltaConfianca: `${ICONES_STATUS.ok} No high-confidence fixes found`,
  nenhumaCorrecao: 'No fixes applied (use --confidence to adjust threshold)'
} as const;

/**
 * Specific messages for the CLI flow (lines and headers) used in src/cli/**
 */
export const MENSAGENS_CLI_CORRECAO_TIPOS = {
  linhaEmBranco: '',
  erroExecutar: (mensagem: string) => `エラー running fix-types: ${mensagem}`,
  linhaResumoTipo: (texto: string) => `  ${texto}`,
  exemplosDryRunTitulo: `${ICONES_RELATORIO.lista} Examples found (dry-run):`,
  exemploLinha: (icone: string, relPath: string | undefined, linha: string) => `  ${icone} ${relPath}:${linha}`,
  exemploMensagem: (mensagem: string) => `     └─ ${mensagem}`,
  debugVariavel: (nome: string) => `     └─ Variable: ${nome}`,
  maisOcorrencias: (qtd: number) => `  ... and ${qtd} more occurrences`,
  aplicandoCorrecoesAuto: `${ICONES_ACAO.correcao} Applying automatic fixes...`,
  exportandoRelatorios: `${ICONES_ACAO.export} エクスポートing reports...`,
  // Verbose / detailed logs
  verboseAnyDetectado: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.any} ${arquivo}:${linha} - any detected (fix recommended)`,
  verboseAsAnyCritico: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.corrigir} ${arquivo}:${linha} - "as any" detected (CRITICAL - fix required)`,
  verboseAngleAnyCritico: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.corrigir} ${arquivo}:${linha} - "<any>" detected (CRITICAL - legacy syntax)`,
  verboseUnknownCategoria: (icone: string, arquivo: string, linha: string, categoria: string, confianca: number) => `  ${icone} ${arquivo}:${linha} - ${categoria} (${confianca}%)`,
  verboseMotivo: (motivo: string) => `     └─ ${motivo}`,
  verboseSugestao: (sugestao: string) => `     └─ ${ICONES_FEEDBACK.dica} ${sugestao}`,
  verboseVariantesTitulo: `     └─ ${ICONES_DIAGNOSTICO.stats} Alternative possibilities:`,
  verboseVarianteItem: (idxBase1: number, variante: string) => `        ${idxBase1}. ${variante}`,
  analiseDetalhadaSalva: `${ICONES_ARQUIVO.arquivo} Detailed 分析 saved at: .prometheus/fix-types-analise.json`,
  altaConfiancaTitulo: (qtd: number) => `${ICONES_DIAGNOSTICO.stats} ${qtd} high-confidence fixes (≥85%):`,
  altaConfiancaLinha: (relPath: string | undefined, linha: string, confianca: number) => `  ${ICONES_TIPOS.corrigir} ${relPath}:${linha} (${confianca}%)`,
  altaConfiancaDetalhe: (texto: string) => `     └─ ${texto}`,
  altaConfiancaMais: (qtd: number) => `  ... and ${qtd} more fixes`,
  incertosTitulo: (qtd: number) => `${ICONES_FEEDBACK.pergunta} ${qtd} cases with uncertain 分析 (<70% confidence):`,
  incertosIntro: '   These cases require careful manual review - multiple possibilities detected',
  incertosLinha: (relPath: string | undefined, linha: string, confianca: number) => `  ${ICONES_TIPOS.melhoravel} ${relPath}:${linha} (${confianca}%)`,
  incertosMais: (qtd: number) => `  ... and ${qtd} more uncertain cases (see .prometheus/fix-types-analise.json)`,
  correcoesResumoSucesso: (qtd: number) => `${ICONES_STATUS.ok} ${qtd} ファイル(s) fixed`,
  correcoesResumoLinhaOk: (arquivo: string, linhas: number) => `   Logging  ${arquivo}: ${linhas} line(s) modified`,
  correcoesResumoLinhaErro: (arquivo: string, erro: string | undefined) => `   ${ICONES_STATUS.falha} ${arquivo}: ${erro}`,
  correcoesResumoFalhas: (qtd: number) => `${ICONES_STATUS.falha} ${qtd} file(s) with エラー`,
  dryRunAviso: (iconeInicio: string) => `${iconeInicio} Dry-run mode active - no changes will be made`,
  templatePasso: (passo: string) => `  ${passo}`
} as const;

/**
 * Categorization texts (reasons/suggestions) that appear in logs and exports.
 */
export const TEXTOS_CATEGORIZACAO_CORRECAO_TIPOS = {
  anyMotivo: 'any is unsafe - replace with specific type',
  anySugestao: 'Analyze variable usage to infer correct type',
  asAnyMotivo: 'Type assertion "as any" completely disables type safety',
  asAnySugestao: 'CRITICAL: Replace with specific type or use unknown with runtime validation',
  angleAnyMotivo: 'Legacy type casting <any> disables type safety',
  angleAnySugestao: 'CRITICAL: Migrate to modern "as" syntax and use specific type',
  semContextoMotivo: 'Could not analyze context',
  semContextoSugestao: 'Review manually'
} as const;

/**
 * Final summary template
 */
export const TEMPLATE_RESUMO_FINAL = {
  titulo: `${ICONES_RELATORIO.detalhado} To apply fixes manually:`,
  passos: ['Review the categorized cases above', `LEGITIMATE (${ICONES_TIPOS.legitimo}): Keep as is`, `IMPROVABLE (${ICONES_TIPOS.melhoravel}): Consider more specific types`, `FIX (${ICONES_TIPOS.corrigir}): Replace with specific types`, 'Run `npm run lint` after fixes']
} as const;

/**
 * Emojis and icons used in the command
 */
export const ICONES = {
  inicio: ICONES_COMANDO.fixTypes,
  aplicando: '[>]',
  analise: '[>]',
  pasta: '[DIR]',
  arquivo: '[FILE]',
  alvo: '[>]',
  edicao: '[EDIT]',
  grafico: '[GRAPH]',
  lampada: '[TIP]',
  foguete: '[>>]',
  nota: '[NOTE]',
  checkbox: '[OK]',
  setinha: '└─',
  ...CATEGORIAS_TIPOS
} as const;

/**
 * Formats an unsafe type message with icon and counter
 */
export function formatarTipoInseguro(tipo: string, count: number): string {
  const icone = tipo.includes('any') ? ICONES_TIPOS.any : ICONES_TIPOS.unknown;
  const plural = count !== 1 ? 's' : '';
  return `${icone} ${tipo}: ${count} occurrence${plural}`;
}

/**
 * Formats an individual occurrence line
 */
export function formatarOcorrencia(relPath: string, linha: number | undefined): string {
  return `  ${ICONES.setinha} ${relPath}:${linha || '?'}`;
}

/**
 * Formats a message with context
 */
export function formatarComContexto(mensagem: string, indentLevel: number = 1): string {
  const indent = '  '.repeat(indentLevel);
  return `${indent}${ICONES.setinha} ${mensagem}`;
}

/**
 * Formats a fix suggestion
 */
export function formatarSugestao(sugestao: string): string {
  return `     ${ICONES.setinha} ${ICONES.lampada} ${sugestao}`;
}

/**
 * Generates a category summary text
 */
export function gerarResumoCategoria(categoria: keyof typeof CATEGORIAS_TIPOS, count: number, total: number): string[] {
  const config = CATEGORIAS_TIPOS[categoria];
  const porcentagem = MENSAGENS_RESUMO.porcentagem(count, total);
  return [categoria === 'CORRIGIR' ? `${config.icone} ${config.nome}: ${porcentagem}` : categoria === 'MELHORAVEL' ? `${config.icone} ${config.nome}: ${porcentagem}` : `${config.icone} ${config.nome}: ${porcentagem}`, `   ${ICONES.setinha} ${config.descricao}`];
}

/**
 * Debug messages (only in DEV_MODE)
 */
export const DEPURACAO = {
  categorizacao: (arquivo: string, tipo: string, categoria: string) => `[DEBUG] ${arquivo} - ${tipo} → ${categoria}`,
  confianca: (tipo: string, valor: number) => `[DEBUG] Confidence for ${tipo}: ${valor}%`
} as const;
