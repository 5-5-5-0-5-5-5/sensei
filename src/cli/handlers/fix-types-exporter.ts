// SPDX-License-Identifier: MIT
/**
 * Handler para exportação de relatórios de fix-types
 * Gera relatórios Markdown e JSON padronizados
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { config } from '@core/config/config.js';
import { messages } from '@core/messages/index.js';

import type { CasoTipoInseguro, FixTypesExportOptions, FixTypesExportResult } from '@';

const log = messages.log;

// Re-export para compatibilidade
export type { CasoTipoInseguro, FixTypesExportOptions, FixTypesExportResult };

/**
 * Gera relatório JSON estruturado
 */
async function gerarRelatorioJson(caminho: string, options: FixTypesExportOptions): Promise<void> {
  const {
    casos,
    stats,
    minConfidence,
    verbose
  } = options;
  const total = stats.legitimo + stats.melhoravel + stats.corrigir;
  const mediaConfianca = total > 0 ? Math.round(stats.totalConfianca / total) : 0;
  const relatorio = {
    metadata: {
      timestamp: new Date().toISOString(),
      comando: 'fix-types',
      schemaVersion: '1.0.0',
      configuracao: {
        confianciaMinima: minConfidence,
        modoVerbose: verbose
      }
    },
    resumo: {
      totalCasos: total,
      mediaConfianca,
      distribuicao: {
        legitimo: {
          total: stats.legitimo,
          percentual: total > 0 ? Math.round(stats.legitimo / total * 100) : 0
        },
        melhoravel: {
          total: stats.melhoravel,
          percentual: total > 0 ? Math.round(stats.melhoravel / total * 100) : 0
        },
        corrigir: {
          total: stats.corrigir,
          percentual: total > 0 ? Math.round(stats.corrigir / total * 100) : 0
        }
      }
    },
    casos: casos.map(c => ({
      arquivo: c.arquivo,
      linha: c.linha,
      tipo: c.tipo,
      categoria: c.categoria,
      confianca: c.confianca,
      motivo: c.motivo,
      sugestao: c.sugestao,
      variantes: c.variantes || [],
      contexto: c.contexto
    })),
    // Agrupamentos úteis para análise
    analise: {
      porArquivo: agruparPorArquivo(casos),
      porCategoria: agruparPorCategoria(casos),
      altaPrioridade: casos.filter(c => c.categoria === 'corrigir' && c.confianca >= 85).map(c => ({
        arquivo: c.arquivo,
        linha: c.linha,
        confianca: c.confianca,
        sugestao: c.sugestao || c.motivo
      })),
      casosIncertos: casos.filter(c => c.confianca < 70 && c.variantes && c.variantes.length > 0).map(c => ({
        arquivo: c.arquivo,
        linha: c.linha,
        confianca: c.confianca,
        motivo: c.motivo,
        variantes: c.variantes
      }))
    }
  };
  await fs.writeFile(caminho, JSON.stringify(relatorio, null, 2));
}

/**
 * Gera relatório Markdown legível
 */
async function gerarRelatorioMarkdown(caminho: string, options: FixTypesExportOptions): Promise<void> {
  const {
    casos,
    stats,
    minConfidence
  } = options;
  const total = stats.legitimo + stats.melhoravel + stats.corrigir;
  const mediaConfianca = total > 0 ? Math.round(stats.totalConfianca / total) : 0;
  const lines: string[] = [];

  // Cabeçalho
  lines.push('# Relatório de Análise de Tipos Inseguros');
  lines.push('');
  lines.push(`**Gerado em:** ${new Date().toISOString()}`);
  lines.push(`**Comando:** \`prometheus fix-types\``);
  lines.push(`**Confiança Mínima:** ${minConfidence}%`);
  lines.push('');

  // Resumo Executivo
  lines.push('## 📊 Resumo Executivo');
  lines.push('');
  lines.push(`- **Total de Casos:** ${total}`);
  lines.push(`- **Confiança Média:** ${mediaConfianca}%`);
  lines.push('');
  lines.push('### Distribuição por Categoria');
  lines.push('');
  lines.push('| Categoria | Total | Percentual | Descrição |');
  lines.push('|-----------|-------|------------|-----------|');
  lines.push(`| [SUCESSO] LEGÍTIMO | ${stats.legitimo} | ${total > 0 ? Math.round(stats.legitimo / total * 100) : 0}% | Uso correto - nenhuma ação necessária |`);
  lines.push(`| [AVISO] MELHORÁVEL | ${stats.melhoravel} | ${total > 0 ? Math.round(stats.melhoravel / total * 100) : 0}% | Pode ser mais específico - revisão manual recomendada |`);
  lines.push(`| [ERRO] CORRIGIR | ${stats.corrigir} | ${total > 0 ? Math.round(stats.corrigir / total * 100) : 0}% | Deve ser substituído - correção necessária |`);
  lines.push('');

  // Casos de Alta Prioridade
  const altaPrioridade = casos.filter(c => c.categoria === 'corrigir' && c.confianca >= 85);
  if (altaPrioridade.length > 0) {
    lines.push('## [ERRO] Correções de Alta Prioridade (≥85% confiança)');
    lines.push('');
    altaPrioridade.forEach((caso, idx) => {
      lines.push(`### ${idx + 1}. ${caso.arquivo}:${caso.linha || '?'} (${caso.confianca}%)`);
      lines.push('');
      lines.push(`**Motivo:** ${caso.motivo}`);
      if (caso.sugestao) {
        lines.push(`**Sugestão:** ${caso.sugestao}`);
      }
      if (caso.contexto) {
        lines.push('');
        lines.push('```typescript');
        lines.push(caso.contexto);
        lines.push('```');
      }
      lines.push('');
    });
  }

  // Casos Incertos
  const casosIncertos = casos.filter(c => c.confianca < 70 && c.variantes && c.variantes.length > 0);
  if (casosIncertos.length > 0) {
    lines.push('## [AVISO] Casos com Análise Incerta (<70% confiança)');
    lines.push('');
    lines.push('*Estes casos requerem revisão manual cuidadosa - múltiplas possibilidades detectadas*');
    lines.push('');
    casosIncertos.forEach((caso, idx) => {
      lines.push(`### ${idx + 1}. ${caso.arquivo}:${caso.linha || '?'} (${caso.confianca}%)`);
      lines.push('');
      lines.push(`**Motivo:** ${caso.motivo}`);
      if (caso.sugestao) {
        lines.push(`**Sugestão:** ${caso.sugestao}`);
      }
      if (caso.variantes && caso.variantes.length > 0) {
        lines.push('');
        lines.push('**Possibilidades Alternativas:**');
        caso.variantes.forEach((variante, vIdx) => {
          lines.push(`${vIdx + 1}. ${variante}`);
        });
      }
      if (caso.contexto) {
        lines.push('');
        lines.push('```typescript');
        lines.push(caso.contexto);
        lines.push('```');
      }
      lines.push('');
    });
  }

  // Lista Completa por Categoria
  lines.push('## [INFO] Lista Completa de Casos');
  lines.push('');
  for (const categoria of ['legitimo', 'melhoravel', 'corrigir'] as const) {
    const casosPorCategoria = casos.filter(c => c.categoria === categoria);
    if (casosPorCategoria.length === 0) continue;
    const prefixo = categoria === 'legitimo' ? '[SUCESSO]' : categoria === 'melhoravel' ? '[AVISO]' : '[ERRO]';
    const titulo = categoria.toUpperCase();
    lines.push(`### ${prefixo} ${titulo} (${casosPorCategoria.length} casos)`);
    lines.push('');
    casosPorCategoria.forEach(caso => {
      lines.push(`- **${caso.arquivo}:${caso.linha || '?'}** (${caso.confianca}%)`);
      lines.push(`  - ${caso.motivo}`);
      if (caso.sugestao) {
        lines.push(`  - [INFO] ${caso.sugestao}`);
      }
    });
    lines.push('');
  }
  await fs.writeFile(caminho, lines.join('\n'));
}

/**
 * Agrupa casos por arquivo
 */
function agruparPorArquivo(casos: CasoTipoInseguro[]): Record<string, number> {
  return casos.reduce((acc, caso) => {
    acc[caso.arquivo] = (acc[caso.arquivo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Agrupa casos por categoria
 */
function agruparPorCategoria(casos: CasoTipoInseguro[]): Record<string, Array<{
  arquivo: string;
  linha?: number;
}>> {
  return casos.reduce((acc, caso) => {
    if (!acc[caso.categoria]) acc[caso.categoria] = [];
    acc[caso.categoria].push({
      arquivo: caso.arquivo,
      linha: caso.linha
    });
    return acc;
  }, {} as Record<string, Array<{
    arquivo: string;
    linha?: number;
  }>>);
}

/**
 * Exporta relatórios de fix-types (Markdown e JSON)
 *
 * @param options - Opções de exportação
 * @returns Caminhos dos arquivos gerados ou null em caso de erro
 */
export async function exportarRelatoriosFixTypes(options: FixTypesExportOptions): Promise<FixTypesExportResult | null> {
  if (!config.REPORT_EXPORT_ENABLED) {
    return null;
  }
  try {
    const {
      baseDir
    } = options;

    // Determinar diretório de saída
    const dir = typeof config.REPORT_OUTPUT_DIR === 'string' ? config.REPORT_OUTPUT_DIR : path.join(baseDir, 'reports');

    // Criar diretório se não existir
    await fs.mkdir(dir, {
      recursive: true
    });

    // Gerar timestamp único para os arquivos
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const nomeBase = `prometheus-fix-types-${ts}`;

    // Gerar relatório Markdown
    const caminhoMd = path.join(dir, `${nomeBase}.md`);
    await gerarRelatorioMarkdown(caminhoMd, options);

    // Gerar relatório JSON
    const caminhoJson = path.join(dir, `${nomeBase}.json`);
    await gerarRelatorioJson(caminhoJson, options);

    // Log de sucesso
    log.sucesso(messages.CliExportersMensagens.fixTypes.relatoriosExportadosTitulo);
    log.info(messages.CliExportersMensagens.fixTypes.caminhoMarkdown(caminhoMd));
    log.info(messages.CliExportersMensagens.fixTypes.caminhoJson(caminhoJson));
    return {
      markdown: caminhoMd,
      json: caminhoJson,
      dir
    };
  } catch (error) {
    log.erro(messages.CliExportersMensagens.fixTypes.falhaExportar((error as Error).message));
    return null;
  }
}