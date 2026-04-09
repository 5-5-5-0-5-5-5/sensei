// SPDX-License-Identifier: MIT
/**
 * Reusable templates for Markdown report generation
 * Functions that generate complete MD sections with consistent formatting
 */

import { formatMs } from '@core/config/format.js';

import type { GuardianInfo, MetadadosRelatorioEstendido, ProblemaAgrupado } from '@';

import { RelatorioMensagens } from './relatorio-messages.js';

// Re-exports the type for compatibility
export type { MetadadosRelatorioEstendido };

/**
 * Generates the standard Markdown report header
 */
export function gerarHeaderRelatorio(metadados: MetadadosRelatorioEstendido): string[] {
  const lines: string[] = [];
  const {
    principal
  } = RelatorioMensagens;
  lines.push(`# ${principal.titulo}`);
  lines.push('');
  lines.push(`**${principal.secoes.metadados.data}:** ${metadados.dataISO}  `);
  lines.push(`**${principal.secoes.metadados.duracao}:** ${formatMs(metadados.duracao)}  `);
  lines.push(`**${principal.secoes.metadados.arquivos}:** ${metadados.totalArquivos}  `);
  lines.push(`**${principal.secoes.metadados.ocorrencias}:** ${metadados.totalOcorrencias}  `);
  lines.push('');
  lines.push(RelatorioMensagens.comum.separadores.secao);
  lines.push('');

  // If there is a manifest
  if (metadados.manifestFile && metadados.relatoriosDir) {
    lines.push(`**${principal.secoes.metadados.arquivoManifest}:** \`${metadados.manifestFile}\`  `);
    lines.push('');
    lines.push(`> ${principal.secoes.metadados.notaManifest}`);
    lines.push('');
    lines.push(RelatorioMensagens.comum.separadores.secao);
    lines.push('');
  }
  return lines;
}

/**
 * Generates the Guardian section of the report
 */
export function gerarSecaoGuardian(guardian: GuardianInfo): string[] {
  const lines: string[] = [];
  const {
    guardian: msg
  } = RelatorioMensagens.principal.secoes;
  lines.push(`## ${msg.titulo}`);
  lines.push('');
  lines.push(`  - **${msg.status}:** ${guardian.status}`);
  lines.push(`  - **${msg.timestamp}:** ${guardian.timestamp}`);
  lines.push(`  - **${msg.totalArquivos}:** ${guardian.totalArquivos}`);
  lines.push('');
  lines.push(RelatorioMensagens.comum.separadores.secao);
  lines.push('');
  return lines;
}

/**
 * Generates a summary table by type
 */
export function gerarTabelaResumoTipos(tiposContagem: Record<string, number>, limite = 10): string[] {
  const lines: string[] = [];
  const {
    resumoTipos
  } = RelatorioMensagens.principal.secoes;
  lines.push(`## ${resumoTipos.titulo}`);
  lines.push('');
  lines.push(`| ${resumoTipos.tipo} | ${resumoTipos.quantidade} |`);
  lines.push('|-------------------|----------|');
  const sorted = Object.entries(tiposContagem).sort(([, a], [, b]) => b - a).slice(0, limite);
  for (const [tipo, count] of sorted) {
    lines.push(`| ${tipo.padEnd(17)} | ${String(count).padStart(8)} |`);
  }
  lines.push('');
  lines.push(RelatorioMensagens.comum.separadores.secao);
  lines.push('');
  return lines;
}

/**
 * Generates an occurrences table
 */
function escapeMarkdownTableCell(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}
export function gerarTabelaOcorrencias<T extends {
  relPath?: string;
  linha?: number;
  nivel?: string;
  mensagem?: string;
}>(ocorrencias: T[]): string[] {
  const lines: string[] = [];
  const {
    ocorrencias: msg
  } = RelatorioMensagens.principal.secoes;
  lines.push(`## ${msg.titulo}`);
  lines.push('');
  lines.push(`| ${msg.colunas.arquivo} | ${msg.colunas.linha} | ${msg.colunas.nivel}  | ${msg.colunas.mensagem} |`);
  lines.push('|---------|-------|--------|----------|');
  for (const o of ocorrencias) {
    const arquivo = String(o.relPath || '');
    const linha = o.linha ? String(o.linha) : '';
    const nivel = String(o.nivel || '');
    const mensagem = escapeMarkdownTableCell(String(o.mensagem || ''));
    lines.push(`| ${arquivo} | ${linha} | ${nivel} | ${mensagem} |`);
  }
  lines.push('');
  return lines;
}

/**
 * Generates a grouped problems section (for smart filter)
 */
export function gerarSecaoProblemasAgrupados(titulo: string, problemas: ProblemaAgrupado[], mostrarExemplos = true): string[] {
  const lines: string[] = [];
  const {
    labels
  } = RelatorioMensagens.resumo;
  lines.push(`## ${titulo}`);
  lines.push('');
  if (problemas.length === 0) {
    lines.push(`> ${RelatorioMensagens.comum.vazios.nenhumResultado}`);
    lines.push('');
    return lines;
  }
  for (const prob of problemas) {
    lines.push(`### ${prob.icone} ${prob.titulo}`);
    lines.push('');
    lines.push(`**${labels.quantidade}:** ${prob.quantidade}  `);
    lines.push(`**Resumo:** ${prob.resumo}  `);
    if (prob.acaoSugerida) {
      lines.push(`**${labels.acaoSugerida}:** ${prob.acaoSugerida}  `);
    }
    lines.push('');

    // Show up to 3 examples
    if (mostrarExemplos && prob.ocorrencias.length > 0) {
      lines.push(`**${labels.exemplos}:**`);
      const exemplos = prob.ocorrencias.slice(0, 3);
      for (const ex of exemplos) {
        const local = ex.relPath ? `${ex.relPath}${ex.linha ? `:${ex.linha}` : ''}` : '';
        const msg = ex.mensagem ? ` - ${ex.mensagem}` : '';
        lines.push(`  - \`${local}\`${msg}`);
      }
      if (prob.ocorrencias.length > 3) {
        lines.push(`  - _...and ${prob.ocorrencias.length - 3} more occurrences_`);
      }
      lines.push('');
    }
    lines.push(RelatorioMensagens.comum.separadores.subsecao);
    lines.push('');
  }
  return lines;
}

/**
 * Generates a generic two-column table
 */
export function gerarTabelaDuasColunas(dados: Array<[string, string | number]>, cabecalhos: [string, string]): string[] {
  const lines: string[] = [];
  lines.push(`| ${cabecalhos[0]} | ${cabecalhos[1]} |`);
  lines.push('|------------------|----------|');
  for (const [col1, col2] of dados) {
    lines.push(`| ${col1.padEnd(16)} | ${String(col2).padStart(8)} |`);
  }
  lines.push('');
  return lines;
}

/**
 * Generates a statistics section
 */
export function gerarSecaoEstatisticas(stats: Record<string, string | number>): string[] {
  const lines: string[] = [];
  const {
    estatisticas
  } = RelatorioMensagens.principal.secoes;
  lines.push(`## ${estatisticas.titulo}`);
  lines.push('');
  for (const [chave, valor] of Object.entries(stats)) {
    lines.push(`  - **${chave}:** ${valor}`);
  }
  lines.push('');
  return lines;
}

/**
 * Generates the report footer
 */
export function gerarFooterRelatorio(timestampISO?: string): string[] {
  const lines: string[] = [];
  lines.push(RelatorioMensagens.comum.separadores.secao);
  lines.push('');
  lines.push('_Generated by Prometheus CLI_');
  if (timestampISO) {
    lines.push(`_${timestampISO}_`);
  }
  lines.push('');
  return lines;
}

/**
 * Helper to write a complete MD file
 */
export async function escreverRelatorioMarkdown(outputCaminho: string, lines: string[]): Promise<void> {
  const {
    salvarEstado
  } = await import('@shared/persistence/persistencia.js');
  await salvarEstado(outputCaminho, lines.join('\n'));
}
