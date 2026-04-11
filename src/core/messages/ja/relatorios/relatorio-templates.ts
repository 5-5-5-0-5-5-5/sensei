// SPDX-License-Identifier: MIT
/**
 * Markdownレポート生成用の再利用可能なテンプレート
 * 一貫したフォーマットで完全なMDセクションを生成する関数
 */

import { formatMs } from '@core/config/format.js';

import type { GuardianInfo, MetadadosRelatorioEstendido, ProblemaAgrupado } from '@';

import { RelatorioMensagens } from './relatorio-messages.js';

// 互換性のための型を再エクスポート
export type { MetadadosRelatorioEstendido };

/**
 * Markdownレポートの標準ヘッダーを生成
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

  // マニフェストがある場合
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
 * レポートのガーディアンセクションを生成
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
 * タイプ別の概要テーブルを生成
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
 * 発生テーブルを生成
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
 * グループ化された問題セクションを生成（スマートフィルタ用）
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
    lines.push(`**概要:** ${prob.resumo}  `);
    if (prob.acaoSugerida) {
      lines.push(`**${labels.acaoSugerida}:** ${prob.acaoSugerida}  `);
    }
    lines.push('');

    // 最大3つの例を表示
    if (mostrarExemplos && prob.ocorrencias.length > 0) {
      lines.push(`**${labels.exemplos}:**`);
      const exemplos = prob.ocorrencias.slice(0, 3);
      for (const ex of exemplos) {
        const local = ex.relPath ? `${ex.relPath}${ex.linha ? `:${ex.linha}` : ''}` : '';
        const msg = ex.mensagem ? ` - ${ex.mensagem}` : '';
        lines.push(`  - \`${local}\`${msg}`);
      }
      if (prob.ocorrencias.length > 3) {
        lines.push(`  - _...他 ${prob.ocorrencias.length - 3}件の発生_`);
      }
      lines.push('');
    }
    lines.push(RelatorioMensagens.comum.separadores.subsecao);
    lines.push('');
  }
  return lines;
}

/**
 * 汎用の2列テーブルを生成
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
 * 統計セクションを生成
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
 * レポートのフッターを生成
 */
export function gerarFooterRelatorio(timestampISO?: string): string[] {
  const lines: string[] = [];
  lines.push(RelatorioMensagens.comum.separadores.secao);
  lines.push('');
  lines.push('_Prometheus CLIによって生成_');
  if (timestampISO) {
    lines.push(`_${timestampISO}_`);
  }
  lines.push('');
  return lines;
}

/**
 * 完全なMDファイルを書き込むヘルパー
 */
export async function escreverRelatorioMarkdown(outputCaminho: string, lines: string[]): Promise<void> {
  const {
    salvarEstado
  } = await import('@shared/persistence/persistencia.js');
  await salvarEstado(outputCaminho, lines.join('\n'));
}
