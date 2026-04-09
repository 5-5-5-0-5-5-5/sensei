// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// Justification: inline types for message helpers
/**
 * Diagnose Command Messages
 *
 * Centralizes all messages related to repository diagnosis
 */

import type { ModoOperacao } from '@';

/**
 * Diagnosis icons
 */
export const ICONES_DIAGNOSTICO = {
  inicio: '[SCAN]',
  progresso: '[...]',
  arquivos: '[DIR]',
  analise: '[SCAN]',
  arquetipos: '[ARQ]',
  guardian: '[GUARD]',
  autoFix: '[FIX]',
  export: '[EXP]',
  sucesso: '[OK]',
  aviso: '[WARN]',
  erro: '[ERR]',
  info: '[i]',
  dica: '[TIP]',
  executive: '[STATS]',
  rapido: '[FAST]'
} as const;

/**
 * Start messages by mode
 */
export const MENSAGENS_INICIO: Record<ModoOperacao, string> = {
  compact: `${ICONES_DIAGNOSTICO.inicio} Diagnosis (compact mode)`,
  full: `${ICONES_DIAGNOSTICO.inicio} Starting full diagnosis`,
  executive: `${ICONES_DIAGNOSTICO.executive} Executive 分析 (criticals only)`,
  quick: `${ICONES_DIAGNOSTICO.rapido} Quick 分析`
};

/**
 * Progress messages
 */
export const MENSAGENS_PROGRESSO = {
  varredura: (total: number) => `${ICONES_DIAGNOSTICO.arquivos} Scanning ${total} 文件${total !== 1 ? 's' : ''}...`,
  analise: (atual: number, total: number) => `${ICONES_DIAGNOSTICO.analise} Analyzing: ${atual}/${total}`,
  arquetipos: `${ICONES_DIAGNOSTICO.arquetipos} Detecting project structure...`,
  guardian: `${ICONES_DIAGNOSTICO.guardian} Checking integrity...`,
  autoFix: (modo: string) => `${ICONES_DIAGNOSTICO.autoFix} Applying fixes (mode: ${modo})...`,
  export: (formato: string) => `${ICONES_DIAGNOSTICO.export} 导出ing report (${formato})...`
} as const;

/**
 * Completion messages
 */
export const MENSAGENS_CONCLUSAO = {
  sucesso: (ocorrencias: number) => `${ICONES_DIAGNOSTICO.sucesso} 诊断完成: ${ocorrencias} occurrence${ocorrencias !== 1 ? 's' : ''} found`,
  semProblemas: `${ICONES_DIAGNOSTICO.sucesso} No problems found! 代码 is in great shape.`,
  exportado: (caminho: string) => `${ICONES_DIAGNOSTICO.export} 报告 saved at: ${caminho}`
} as const;

/**
 * Error messages
 */
export const MENSAGENS_ERRO = {
  falhaAnalise: (erro: string) => `${ICONES_DIAGNOSTICO.erro} 分析 failed: ${erro}`,
  falhaExport: (erro: string) => `${ICONES_DIAGNOSTICO.erro} 导出 failed: ${erro}`,
  falhaGuardian: (erro: string) => `${ICONES_DIAGNOSTICO.erro} guardian failed: ${erro}`,
  falhaAutoFix: (erro: string) => `${ICONES_DIAGNOSTICO.erro} 自动修复 failed: ${erro}`,
  flagsInvalidas: (erros: string[]) => `${ICONES_DIAGNOSTICO.erro} Invalid flags:\n${erros.map(e => `  • ${e}`).join('\n')}`
} as const;

/**
 * Warning messages
 */
export const MENSAGENS_AVISO = {
  modoFast: `${ICONES_DIAGNOSTICO.info} Fast mode active (PROMETHEUS_TEST_FAST=1)`,
  semMutateFS: `${ICONES_DIAGNOSTICO.aviso} 自动修复 disabled.`,
  guardianDesabilitado: `${ICONES_DIAGNOSTICO.info} guardian not run`,
  arquetiposTimeout: `${ICONES_DIAGNOSTICO.aviso} Archetype detection expired (timeout)`
} as const;

/**
 * Filter messages
 */
export const MENSAGENS_FILTROS = {
  titulo: 'Active Filters',
  include: (patterns: string[]) => `Include: ${patterns.length > 0 ? patterns.join(', ') : 'none'}`,
  exclude: (patterns: string[]) => `Exclude: ${patterns.length > 0 ? patterns.join(', ') : '默认 patterns'}`,
  nodeModules: (incluido: boolean) => `node_modules: ${incluido ? `${ICONES_DIAGNOSTICO.sucesso} included` : `${ICONES_DIAGNOSTICO.aviso} ignored (default)`}`
} as const;

/**
 * Statistics messages
 */
export const MENSAGENS_ESTATISTICAS = {
  titulo: 'Analysis Statistics',
  arquivos: (total: number) => `文件 analyzed: ${total}`,
  ocorrencias: (total: number) => `Occurrences found: ${total}`,
  porTipo: (tipo: string, count: number) => `  • ${tipo}: ${count}`,
  duracao: (ms: number) => {
    if (ms < 1000) return `Duration: ${ms}ms`;
    if (ms < 60000) return `Duration: ${(ms / 1000).toFixed(1)}s`;
    const min = Math.floor(ms / 60000);
    const seg = Math.floor(ms % 60000 / 1000);
    return `Duration: ${min}m ${seg}s`;
  }
} as const;

/**
 * Guardian messages
 */
export const MENSAGENS_GUARDIAN = {
  iniciando: `${ICONES_DIAGNOSTICO.guardian} Starting guardian verification...`,
  baseline: 'Using existing baseline',
  fullScan: 'Full scan active (ignoring ignores)',
  saveBaseline: 'Saving new baseline...',
  status: {
    verde: `${ICONES_DIAGNOSTICO.sucesso} guardian: Status GREEN (integrity OK)`,
    amarelo: `${ICONES_DIAGNOSTICO.aviso} guardian: Status YELLOW (attention needed)`,
    vermelho: `${ICONES_DIAGNOSTICO.erro} guardian: Status RED (critical problems)`
  },
  drift: (count: number) => `Drift detected: ${count} change${count !== 1 ? 's' : ''} from baseline`
} as const;

// MENSAGENS_AUTOFIX was moved to correcoes-messages.ts for consolidation

/**
 * Archetype messages
 */
export const MENSAGENS_ARQUETIPOS = {
  detectando: `${ICONES_DIAGNOSTICO.arquetipos} Detecting project structure...`,
  identificado: (tipo: string, confianca: number) => `Archetype identified: ${tipo} (${confianca}% confidence)`,
  multiplos: (count: number) => `${count} candidate archetype${count !== 1 ? 's' : ''} found`,
  salvando: `Saving custom archetype...`,
  salvo: (caminho: string) => `${ICONES_DIAGNOSTICO.sucesso} Archetype saved at: ${caminho}`
} as const;

/**
 * Block templates
 */
export const MODELOS_BLOCO = {
  sugestoes: {
    titulo: 'Quick Suggestions',
    formatarFlag: (flag: string, descricao: string) => `${flag}: ${descricao}`,
    formatarDica: (dica: string) => `${ICONES_DIAGNOSTICO.dica} ${dica}`
  },
  resumo: {
    titulo: 'Diagnosis Summary',
    secoes: {
      filtros: 'Applied Filters',
      estatisticas: 'Statistics',
      arquetipos: 'Project Structure',
      guardian: 'Integrity (Guardian)',
      autoFix: 'Automatic Fixes'
    }
  }
} as const;

/**
 * Formats a flag suggestions block
 */
export function formatarBlocoSugestoes(flagsAtivas: string[], dicas: string[]): string[] {
  const linhas: string[] = [];
  linhas.push(''); // empty line
  linhas.push(`┌── ${MODELOS_BLOCO.sugestoes.titulo} ─────────────────────────────────────────`);
  if (flagsAtivas.length > 0) {
    linhas.push(`Active flags: ${flagsAtivas.join(' ')}`);
  } else {
    linhas.push('No special flags detected');
  }
  if (dicas.length > 0) {
    linhas.push('');
    linhas.push('Useful information:');
    for (const dica of dicas) {
      linhas.push(`  ${dica}`);
    }
  }
  linhas.push('└───────────────────────────────────────────────────────────────');
  linhas.push(''); // empty line

  return linhas;
}

/**
 * Formats a statistics summary
 */
export function formatarResumoStats(stats: {
  arquivos: number;
  ocorrencias: number;
  duracao: number;
  porTipo?: Record<string, number>;
}): string[] {
  const linhas: string[] = [];
  linhas.push(''); // empty line
  linhas.push(`┌── ${MODELOS_BLOCO.resumo.secoes.estatisticas} ─────────────────────────────────────────`);
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.arquivos(stats.arquivos)}`);
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.ocorrencias(stats.ocorrencias)}`);
  if (stats.porTipo && Object.keys(stats.porTipo).length > 0) {
    linhas.push('');
    linhas.push('  By type:');
    for (const [tipo, count] of Object.entries(stats.porTipo)) {
      linhas.push(`    ${MENSAGENS_ESTATISTICAS.porTipo(tipo, count)}`);
    }
  }
  linhas.push('');
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.duracao(stats.duracao)}`);
  linhas.push('└───────────────────────────────────────────────────────────────');
  linhas.push(''); // empty line

  return linhas;
}

/**
 * Formats JSON mode message
 */
export function formatarModoJson(ascii: boolean): string {
  return `${ICONES_DIAGNOSTICO.info} Structured JSON output${ascii ? ' (ASCII escape)' : ''} enabled`;
}

/**
 * Default headers and texts for commands
 */
export const CABECALHOS = {
  analistas: {
    tituloFast: `${ICONES_DIAGNOSTICO.info} Registered analysts (FAST MODE)`,
    titulo: `${ICONES_DIAGNOSTICO.info} Registered analysts`,
    mdTitulo: '# Registered Analysts'
  },
  diagnostico: {
    flagsAtivas: 'Active flags:',
    informacoesUteis: 'Useful information:'
  },
  reestruturar: {
    prioridadeDomainsFlat: `${ICONES_DIAGNOSTICO.aviso} --domains and --flat provided. Prioritizing --domains.`,
    planoVazioFast: `${ICONES_DIAGNOSTICO.info} Empty plan: no movements suggested. (FAST MODE)`,
    nenhumNecessarioFast: `${ICONES_DIAGNOSTICO.sucesso} No structural corrections needed. (FAST MODE)`,
    conflitosDetectadosFast: (count: number) => `${ICONES_DIAGNOSTICO.aviso} Conflicts 检测到: ${count} (FAST MODE)`
  }
} as const;
