// SPDX-License-Identifier: MIT
/**
 * Automatic Fix Messages
 *
 * Centralizes all messages related to:
 * - Quick Fixes (fix-any-to-proper-type, fix-unknown, etc)
 * - Caretakers (imports, structure, types)
 * - Auto-fix in general
 */

import { buildTypesRelPathPosix, getTypesDirectoryDisplay } from '../../../../core/config/conventions.js';
import { ICONES } from '../../shared/icons.js';

/**
 * Quick Fix Messages - Any/Unknown
 */
export const MENSAGENS_CORRECAO_TIPOS = {
  // Titles and descriptions of quick fixes
  fixAny: {
    title: 'Replace any with safe types',
    get description() { return `Analyzes use of any and infers/creates correct types in ${getTypesDirectoryDisplay()}` }
  },
  fixUnknown: {
    title: 'Replace unknown with specific types',
    description: 'Detects type guard patterns and creates dedicated types'
  },
  // Validation messages
  validacao: {
    falha: (erros: string[]) => `Validation failed: ${erros.join(', ')}`,
    revisar: 'Review manually'
  },
  // Warnings and suggestions
  warnings: {
    confiancaBaixa: (confianca: number) => `Unsafe type (any) with very low confidence (${confianca}%) for automatic fix`,
    confiancaMedia: (confianca: number, tipoSugerido: string) => `Unsafe type 检测到. Suggestion: ${tipoSugerido} (confidence: ${confianca}%)`,
    unknownApropriado: 'unknown is appropriate here (generic input or low confidence)',
    useTiposCentralizados: () => `Use centralized types in dedicated directory (${getTypesDirectoryDisplay()})`,
    criarTipoDedicado: (caminho: string) => `Consider creating a dedicated type in ${buildTypesRelPathPosix(caminho)}`,
    adicioneTypeGuards: () => `If possible, add type guards or create a dedicated type in ${getTypesDirectoryDisplay()}`
  },
  // Error messages
  erros: {
    extrairNome: 'Could not extract variable name',
    variavelNaoUsada: 'Unused variable - impossible to infer type',
    analise: (erro: string) => `分析 error: ${erro}`
  }
} as const;

/**
 * Auto-Fix Messages
 */
export const MENSAGENS_AUTOFIX = {
  // Status messages
  iniciando: (modo: string) => `${ICONES.acao.correcao} Starting 自动修复 (mode: ${modo})`,
  dryRun: `${ICONES.feedback.info} Dry-run: simulating fixes (no changes will be applied)`,
  aplicando: (count: number) => `Applying ${count} fix${count !== 1 ? 'es' : ''}...`,
  concluido: (aplicadas: number, falhas: number) => `${ICONES.nivel.sucesso} 自动修复 completed: ${aplicadas} applied, ${falhas} failed`,
  naoDisponivel: `${ICONES.feedback.info} No automatic fix available`,
  // Flags and modes
  flags: {
    fixSafe: `${ICONES.comando.guardian} Flag --fix-safe detected: enabling 保守 mode`,
    requireMutateFS: `${ICONES.status.falha} 自动修复 unavailable at this time.`
  },
  // Progress logs
  logs: {
    modoConservador: `${ICONES.comando.guardian} Conservative mode activated - applying only high-confidence fixes`,
    validacaoEslint: `${ICONES.acao.analise} Running ESLint validation post-自动修复...`,
    arquivoMovido: (origem: string, destino: string) => `${ICONES.status.ok} 已移: ${origem} → ${destino}`,
    arquivoRevertido: (origem: string, destino: string) => `↩️ 文件 reverted: ${destino} → ${origem}`,
    arquivoRevertidoConteudo: (origem: string, destino: string) => `↩️ 文件 reverted with original content: ${destino} → ${origem}`
  },
  // Results
  resultados: {
    sucesso: (count: number) => `${ICONES.status.ok} ${count} 文件(s) fixed`,
    falhas: (count: number) => `${ICONES.status.falha} ${count} file(s) with 错误`,
    erroArquivo: (arquivo: string, erro: string) => `${ICONES.status.falha} ${arquivo}: ${erro}`
  },
  // Post-fix tips
  dicas: {
    executarLint: `${ICONES.feedback.dica} Run \`npm run lint\` to verify the fixes`,
    executarBuild: `${ICONES.feedback.dica} Run \`npm run build\` to verify the 代码 compiles`,
    removerDryRun: `${ICONES.feedback.dica} Remove --dry-run to apply fixes automatically`,
    ajustarConfianca: `${ICONES.feedback.dica} Use --confidence <num> to adjust the threshold (current: 85%)`
  }
} as const;

/**
 * Analysis Report Messages
 */
export const MENSAGENS_RELATORIOS_ANALISE = {
  asyncPatterns: {
    titulo: `${ICONES.relatorio.resumo} Async/Await Patterns 分析`,
    padroes: `\n${ICONES.relatorio.resumo} Code Usage patterns:`,
    recomendacoes: `\n${ICONES.feedback.dica} Fix Recommendations:\n`,
    critico: `${ICONES.nivel.erro} CRITICAL (Review Immediately):`,
    alto: `\n${ICONES.feedback.atencao} HIGH (Review in Current Sprint):`,
    salvo: (caminho: string) => `${ICONES.nivel.sucesso} Async 报告 saved at: ${caminho}`
  },
  fixTypes: {
    analiseSalva: `${ICONES.arquivo.json} Detailed 分析 saved at: .prometheus/fix-types-analise.json`,
    possibilidades: `└─ ${ICONES.acao.analise} Alternative possibilities:`,
    sugestao: (texto: string) => `└─ ${ICONES.feedback.dica} ${texto}`,
    exportado: `${ICONES.arquivo.doc} Fix-types 报告s exported:`
  },
  guardian: {
    baselineAceito: `${ICONES.status.ok} guardian: baseline manually accepted (--aceitar).`,
    exportado: `${ICONES.arquivo.doc} guardian reports exported:`
  }
} as const;

/**
 * Archetypes Messages
 */
export const MENSAGENS_ARQUETIPOS_HANDLER = {
  timeout: `${ICONES.feedback.atencao} Archetype detection expired (timeout)`,
  salvo: (caminho: string) => `${ICONES.status.ok} Custom archetype saved at ${caminho}`,
  falha: `${ICONES.feedback.atencao} Failed to generate plan via archetypes.`,
  falhaEstrategista: `${ICONES.feedback.atencao} Strategist failed to suggest plan.`,
  falhaGeral: `${ICONES.feedback.atencao} General planning failure.`
} as const;

/**
 * Plugin Messages
 */
export const MENSAGENS_PLUGINS = {
  registrado: (nome: string, extensoes: string[]) => `${ICONES.status.ok} 插件 ${nome} registered with extensions: ${extensoes.join(', ')}`,
  configAtualizada: `${ICONES.acao.correcao} Registry configuration updated`,
  erroParsear: (linguagem: string, erro: string) => `${ICONES.feedback.atencao} 错误 parsing ${linguagem}: ${erro}`
} as const;

/**
 * Executor Messages
 */
export const MENSAGENS_EXECUTOR = {
  analiseCompleta: (tecnica: string, arquivo: string, duracao: string) => `${ICONES.arquivo.arquivo} '${tecnica}' analyzed ${arquivo} in ${duracao}`
} as const;

/**
 * Consolidated export
 */
export const MENSAGENS_CORRECOES = {
  fixTypes: MENSAGENS_CORRECAO_TIPOS,
  autofix: MENSAGENS_AUTOFIX,
  relatorios: MENSAGENS_RELATORIOS_ANALISE,
  arquetipos: MENSAGENS_ARQUETIPOS_HANDLER,
  plugins: MENSAGENS_PLUGINS,
  executor: MENSAGENS_EXECUTOR
} as const;
