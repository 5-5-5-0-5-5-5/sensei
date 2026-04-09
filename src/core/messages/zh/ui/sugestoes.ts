// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// Justification: inline types for suggestion system
/**
 * Centralized Suggestion and Tips System
 *
 * Centralizes ALL contextual suggestions from Prometheus:
 * - Command usage tips
 * - Context-based suggestions
 * - Quick help messages
 * - Call-to-action for different scenarios
 */

import { ICONES } from '../../shared/icons.js';

/**
 * General command suggestions
 */
export const SUGESTOES_COMANDOS = {
  usarFull: `${ICONES.feedback.dica} Use --full for a detailed 报告 with all information`,
  usarJson: `${ICONES.feedback.dica} Use --json for structured JSON output`,
  combinarJsonExport: `${ICONES.feedback.dica} Combine --json with --export to save the 报告`,
  usarExport: `${ICONES.feedback.dica} Use --export <path> to save 报告 to file`,
  usarInclude: `${ICONES.feedback.dica} Use --include <模式> to focus on specific files`,
  usarExclude: `${ICONES.feedback.dica} Use --exclude <模式> to ignore files`,
  usarDryRun: `${ICONES.feedback.dica} Use --dry-run to simulate without modifying 文件`,
  removerDryRun: `${ICONES.feedback.dica} Remove --dry-run to apply fixes`,
  usarInterativo: `${ICONES.feedback.dica} Use --interactive to confirm each fix`,
  usarGuardian: `${ICONES.feedback.dica} Use --guardian to verify integrity`,
  usarBaseline: `${ICONES.feedback.dica} Use --baseline to generate a reference baseline`,
  usarAutoFix: `${ICONES.feedback.dica} Use --自动修复 to apply automatic fixes`,
} as const;

/**
 * Diagnostic suggestions
 */
export const SUGESTOES_DIAGNOSTICO = {
  modoExecutivo: `${ICONES.diagnostico.executive} Executive mode: showing only critical problems`,
  primeiraVez: [
    `${ICONES.feedback.dica} First time? Start with: prometheus diagnosticar --full`,
    `${ICONES.feedback.dica} Use --help to see all available 选项s`,
  ],
  projetoGrande: [
    `${ICONES.feedback.dica} Large project detected - use --include for incremental 分析`,
    `${ICONES.feedback.dica} Use --quick for a fast initial 分析`,
  ],
  poucoProblemas: `${ICONES.nivel.sucesso} Project in good shape! Only {count} minor problems found.`,
  muitosProblemas: [
    `${ICONES.feedback.atencao} Many problems found - prioritize critical ones first`,
    `${ICONES.feedback.dica} Use --executive to focus only on the essentials`,
  ],
  usarFiltros: `${ICONES.feedback.dica} Use --include/--exclude filters for focused 分析`,
} as const;

/**
 * Auto-fix suggestions
 */
export const SUGESTOES_AUTOFIX = {
  autoFixDisponivel: `${ICONES.feedback.dica} Automatic fixes available - use --自动修复`,
  autoFixAtivo: `${ICONES.feedback.atencao} 自动修复 active! Use --dry-run to simulate without modifying files`,
  dryRunRecomendado: `${ICONES.feedback.dica} Recommended: test first with --dry-run`,
  semMutateFS: `${ICONES.feedback.atencao} 自动修复 currently unavailable`,
  validarDepois: [
    `${ICONES.feedback.dica} Run npm run lint to verify the fixes`,
    `${ICONES.feedback.dica} Run npm run build to check if the 代码 compiles`,
    `${ICONES.feedback.dica} Run npm test to validate functionality`,
  ],
} as const;

/**
 * Guardian suggestions
 */
export const SUGESTOES_GUARDIAN = {
  guardianDesabilitado: `${ICONES.comando.guardian} guardian disabled. Use --guardian to verify integrity`,
  primeiroBaseline: [
    `${ICONES.feedback.dica} First run: generate a baseline with --baseline`,
    `${ICONES.feedback.dica} The baseline serves as a reference for future changes`,
  ],
  driftDetectado: [
    `${ICONES.feedback.atencao} Changes 检测到 compared to baseline`,
    `${ICONES.feedback.dica} Review the changes before updating the baseline`,
    `${ICONES.feedback.dica} Use --baseline to update reference`,
  ],
  integridadeOK: `${ICONES.nivel.sucesso} Integrity verified - no unauthorized changes`,
} as const;

/**
 * Type suggestions (fix-types)
 */
export const SUGESTOES_TIPOS = {
  ajustarConfianca: (atual: number) =>
    `${ICONES.feedback.dica} Use --confidence <num> to adjust the threshold (current: ${atual}%)`,
  revisar: (categoria: string) =>
    `${ICONES.feedback.dica} Review ${categoria} cases manually`,
  anyEncontrado: [
    `${ICONES.feedback.atencao} 'any' types 检测到 - they reduce code safety`,
    `${ICONES.feedback.dica} Prioritize replacing 'as any' and explicit casts`,
  ],
  unknownLegitimo: `${ICONES.nivel.sucesso} Legitimate uses of 'unknown' identified`,
  melhoravelDisponivel: `${ICONES.feedback.dica} Improvable cases found - review in future refactoring`,
} as const;

/**
 * Archetype suggestions
 */
export const SUGESTOES_ARQUETIPOS = {
  monorepo: [
    `${ICONES.feedback.dica} Monorepo 检测到: consider using workspace filters`,
    `${ICONES.feedback.dica} Use --include packages/* to analyze specific workspaces`,
  ],
  biblioteca: [
    `${ICONES.feedback.dica} Library 检测到: focus on public exports and documentation`,
    `${ICONES.feedback.dica} Use --guardian to verify public API`,
  ],
  cli: [
    `${ICONES.feedback.dica} CLI 检测到: prioritize command and flag tests`,
    `${ICONES.feedback.dica} Validate error handling in 命令s`,
  ],
  api: [
    `${ICONES.feedback.dica} API 检测到: focus on endpoints and contracts`,
    `${ICONES.feedback.dica} Consider integration tests for routes`,
    `${ICONES.feedback.dica} Validate API documentation (OpenAPI/Swagger)`,
  ],
  frontend: [
    `${ICONES.feedback.dica} Frontend 检测到: prioritize components and state management`,
    `${ICONES.feedback.dica} Validate accessibility and performance`,
  ],
  confiancaBaixa: [
    `${ICONES.feedback.atencao} Low confidence in detection: structure may be hybrid`,
    `${ICONES.feedback.dica} Use --criar-arquetipo --salvar-arquetipo to customize`,
  ],
} as const;

/**
 * Restructuring suggestions
 */
export const SUGESTOES_REESTRUTURAR = {
  backupRecomendado: [
    `${ICONES.feedback.importante} IMPORTANT: Make a backup before restructuring!`,
    `${ICONES.feedback.dica} Use git to version before structural changes`,
  ],
  validarDepois: [
    `${ICONES.feedback.dica} Run tests after restructuring`,
    `${ICONES.feedback.dica} Validate imports and references`,
  ],
  usarDryRun: `${ICONES.feedback.dica} First time? Use --dry-run to see proposed changes`,
} as const;

/**
 * Pruning suggestions
 */
export const SUGESTOES_PODAR = {
  cuidado: [
    `${ICONES.feedback.atencao} Pruning permanently removes 文件!`,
    `${ICONES.feedback.importante} Make sure you have backup or version control`,
  ],
  revisar: `${ICONES.feedback.dica} Review the 文件 list before confirming`,
  usarDryRun: `${ICONES.feedback.dica} Use --dry-run to simulate pruning without deleting`,
} as const;

/**
 * Metrics suggestions
 */
export const SUGESTOES_METRICAS = {
  baseline: [
    `${ICONES.feedback.dica} Generate baseline for future comparisons`,
    `${ICONES.feedback.dica} Use --json for CI/CD integration`,
  ],
  tendencias: `${ICONES.feedback.dica} Run regularly to track trends`,
  comparacao: `${ICONES.feedback.dica} Compare with previous runs`,
} as const;

/**
 * Caretaker suggestions
 */
export const SUGESTOES_ZELADOR = {
  imports: [
    `${ICONES.feedback.dica} Import caretaker automatically fixes paths`,
    `${ICONES.feedback.dica} Use --dry-run to see proposed fixes`,
  ],
  estrutura: [
    `${ICONES.feedback.dica} Structure caretaker organizes files by 模式`,
    `${ICONES.feedback.dica} Configure patterns in prometheus.config.json`,
  ],
} as const;

/**
 * Contextual suggestions - helper function
 */
export function gerarSugestoesContextuais(contexto: {
  comando: string;
  temProblemas: boolean;
  countProblemas?: number;
  autoFixDisponivel?: boolean;
  guardianAtivo?: boolean;
  arquetipo?: string;
  flags?: string[];
}): string[] {
  const sugestoes: string[] = [];

  // Suggestions by command
  switch (contexto.comando) {
    case 'diagnosticar':
      if (!contexto.temProblemas) {
        if (contexto.countProblemas !== undefined) {
          sugestoes.push(
            SUGESTOES_DIAGNOSTICO.poucoProblemas.replace(
              '{count}',
              String(contexto.countProblemas),
            ),
          );
        }
      } else if (contexto.countProblemas && contexto.countProblemas > 50) {
        sugestoes.push(...SUGESTOES_DIAGNOSTICO.muitosProblemas);
      }

      if (
        contexto.autoFixDisponivel &&
        !contexto.flags?.includes('--auto-fix')
      ) {
        sugestoes.push(SUGESTOES_AUTOFIX.autoFixDisponivel);
      }

      if (!contexto.guardianAtivo && !contexto.flags?.includes('--guardian')) {
        sugestoes.push(SUGESTOES_GUARDIAN.guardianDesabilitado);
      }

      if (!contexto.flags?.includes('--full') && contexto.temProblemas) {
        sugestoes.push(SUGESTOES_COMANDOS.usarFull);
      }
      break;

    case 'fix-types':
      if (contexto.autoFixDisponivel) {
        sugestoes.push(...SUGESTOES_AUTOFIX.validarDepois);
      }
      break;

    case 'reestruturar':
      sugestoes.push(...SUGESTOES_REESTRUTURAR.backupRecomendado);
      if (!contexto.flags?.includes('--dry-run')) {
        sugestoes.push(SUGESTOES_REESTRUTURAR.usarDryRun);
      }
      break;

    case 'podar':
      sugestoes.push(...SUGESTOES_PODAR.cuidado);
      break;
  }

  // Suggestions by archetype
  if (contexto.arquetipo) {
    switch (contexto.arquetipo) {
      case 'monorepo':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.monorepo);
        break;
      case 'biblioteca':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.biblioteca);
        break;
      case 'cli':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.cli);
        break;
      case 'api':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.api);
        break;
      case 'frontend':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.frontend);
        break;
    }
  }

  return sugestoes;
}

/**
 * Formats suggestions for display
 */
export function formatarSugestoes(
  sugestoes: string[],
  titulo = 'Suggestions',
): string[] {
  if (sugestoes.length === 0) return [];

  const linhas: string[] = ['', `┌── ${titulo} ${'─'.repeat(50)}`.slice(0, 70)];

  for (const sugestao of sugestoes) {
    linhas.push(`  ${sugestao}`);
  }

  linhas.push(`└${'─'.repeat(68)}`);
  linhas.push('');

  return linhas;
}

/**
 * Consolidated export
 */
export const SUGESTOES = {
  comandos: SUGESTOES_COMANDOS,
  diagnostico: SUGESTOES_DIAGNOSTICO,
  autofix: SUGESTOES_AUTOFIX,
  guardian: SUGESTOES_GUARDIAN,
  tipos: SUGESTOES_TIPOS,
  arquetipos: SUGESTOES_ARQUETIPOS,
  reestruturar: SUGESTOES_REESTRUTURAR,
  podar: SUGESTOES_PODAR,
  metricas: SUGESTOES_METRICAS,
  zelador: SUGESTOES_ZELADOR,
} as const;

export default SUGESTOES;
