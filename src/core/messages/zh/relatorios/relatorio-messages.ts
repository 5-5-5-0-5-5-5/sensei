// SPDX-License-Identifier: MIT
/**
 * Centralized messages for reports (Markdown and JSON)
 * All title strings, headers, descriptions and explanatory texts
 * must be defined here to facilitate maintenance and future internationalization.
 */

import { ICONES_ACAO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_RELATORIO } from '../../shared/icons.js';

export const RelatorioMensagens = {
  /* -------------------------- MAIN REPORT (gerador-relatorio.ts) -------------------------- */
  principal: {
    titulo: `${ICONES_RELATORIO.resumo} Prometheus 报告`,
    secoes: {
      metadados: {
        data: 'Date',
        duracao: 'Duration',
        arquivos: 'Scanned files',
        ocorrencias: 'Occurrences found',
        arquivoManifest: 'Manifest file',
        notaManifest: 'To explore the full report, download/decompress the shards listed in the manifest.'
      },
      guardian: {
        titulo: `${ICONES_DIAGNOSTICO.guardian} Integrity Verification (guardian)`,
        status: 'Status',
        timestamp: 'Timestamp',
        totalArquivos: 'Total protected files'
      },
      resumoTipos: {
        titulo: `${ICONES_DIAGNOSTICO.stats} Problem types summary`,
        tipo: 'Type',
        quantidade: 'Quantity'
      },
      ocorrencias: {
        titulo: `${ICONES_RELATORIO.lista} Occurrences found`,
        colunas: {
          arquivo: 'File',
          linha: 'Line',
          nivel: 'Level',
          mensagem: 'Message'
        }
      },
      estatisticas: {
        titulo: `${ICONES_RELATORIO.grafico} General statistics`,
        linhasAnalisadas: 'Analyzed lines',
        padroesProgramacao: 'Programming patterns',
        analiseInteligente: 'Intelligent code analysis'
      }
    }
  },
  /* -------------------------- SUMMARY REPORT / SMART FILTER -------------------------- */
  resumo: {
    titulo: `${ICONES_RELATORIO.resumo} Summary report - Priority Problems`,
    introducao: 'This report groups similar problems and prioritizes by impact to facilitate analysis.',
    secoes: {
      criticos: {
        titulo: `${ICONES_RELATORIO.error} Critical Problems`,
        vazio: 'No critical problems detected.'
      },
      altos: {
        titulo: `${ICONES_RELATORIO.warning} High Priority Problems`,
        vazio: 'No high priority problems detected.'
      },
      outros: {
        titulo: `${ICONES_RELATORIO.lista} Other Problems`,
        vazio: 'No other problems detected.'
      },
      estatisticas: {
        titulo: `${ICONES_DIAGNOSTICO.stats} Report Statistics`,
        totalOcorrencias: 'Total occurrences',
        arquivosAfetados: 'Affected files',
        problemasPrioritarios: 'Priority problems',
        problemasAgrupados: 'Grouped problems'
      }
    },
    labels: {
      quantidade: 'Quantity',
      arquivosAfetados: 'Affected files',
      acaoSugerida: 'Suggested Action',
      exemplos: 'Examples'
    }
  },
  /* -------------------------- CODE HEALTH REPORT (zelador-saude.ts) -------------------------- */
  saude: {
    titulo: `${ICONES_ACAO.limpeza} Code Health 报告`,
    introducao: `${ICONES_DIAGNOSTICO.stats} Code Usage patterns`,
    secoes: {
      funcoesLongas: {
        titulo: 'Details of long functions per file',
        vazio: 'No functions above the limit.',
        colunas: {
          tipo: 'Type',
          quantidade: 'Quantity'
        }
      },
      constantesDuplicadas: {
        titulo: `${ICONES_RELATORIO.detalhado} Constants defined more than 3 times`
      },
      modulosRequire: {
        titulo: `${ICONES_RELATORIO.detalhado} Require modules used more than 3 times`
      },
      fim: {
        titulo: 'End of caretaker report'
      }
    },
    instrucoes: {
      diagnosticoDetalhado: 'For detailed diagnostics, run: prometheus diagnosticar --export',
      tabelasVerbosas: 'To see framed tables in the terminal (very verbose), use: --debug'
    }
  },
  /* -------------------------- USAGE PATTERNS REPORT -------------------------- */
  padroesUso: {
    titulo: `${ICONES_DIAGNOSTICO.stats} Code Usage patterns`
  },
  /* -------------------------- ARCHETYPES REPORT -------------------------- */
  arquetipos: {
    titulo: `${ICONES_DIAGNOSTICO.arquetipos} Archetypes 报告`,
    secoes: {
      candidatos: {
        titulo: 'Identified Candidates',
        nome: 'Name',
        score: 'Score',
        confianca: 'Confidence',
        descricao: 'Description'
      },
      baseline: {
        titulo: 'Saved Baseline',
        snapshot: 'Snapshot',
        arquivos: 'Files'
      },
      drift: {
        titulo: 'Detected Drift',
        alterouArquetipo: 'Archetype Changed',
        deltaConfianca: 'Confidence Delta',
        arquivosNovos: 'New Files',
        arquivosRemovidos: 'Removed Files'
      }
    }
  },
  /* -------------------------- PRUNING REPORT -------------------------- */
  poda: {
    titulo: `${ICONES_COMANDO.podar} Prometheus Pruning 报告`,
    secoes: {
      metadados: {
        data: 'Date',
        execucao: 'Execution',
        simulacao: 'Simulation',
        real: 'Real',
        arquivosPodados: 'Pruned files',
        arquivosMantidos: 'Kept files'
      },
      podados: {
        titulo: 'Pruned Files',
        vazio: 'No files were pruned in this cycle.',
        colunas: {
          arquivo: 'File',
          motivo: 'Reason',
          diasInativo: 'Inactive Days',
          detectadoEm: 'Detected on'
        }
      },
      mantidos: {
        titulo: 'Kept Files',
        vazio: 'No files kept in this cycle.',
        colunas: {
          arquivo: 'File',
          motivo: 'Reason'
        }
      },
      pendencias: {
        titulo: 'Removal Pending Items',
        total: 'Total pending items',
        tipoArquivo: 'Type: File',
        tipoDiretorio: 'Type: Directory',
        tamanhoTotal: 'Approximate total size'
      },
      reativacao: {
        titulo: 'Reactivation List',
        total: 'Total to reactivate'
      },
      historico: {
        titulo: 'Action History',
        total: 'Total actions',
        colunas: {
          acao: 'Action',
          caminho: 'Path',
          timestamp: 'Timestamp'
        }
      }
    }
  },
  /* -------------------------- RESTRUCTURING REPORT -------------------------- */
  reestruturar: {
    titulo: `${ICONES_COMANDO.reestruturar} Prometheus Restructuring 报告`,
    secoes: {
      metadados: {
        data: 'Date',
        execucao: 'Execution',
        simulacao: 'Simulation',
        real: 'Real',
        origemPlano: 'Plan origin',
        preset: 'Preset'
      },
      movimentos: {
        titulo: 'Movements',
        total: 'Total movements',
        vazio: 'No movements suggested in this cycle.',
        status: {
          zonVerde: 'Green Zone (safe)',
          bloqueados: 'Blocked'
        },
        colunas: {
          origem: 'From',
          destino: 'To',
          razao: 'Reason',
          status: 'Status'
        }
      },
      conflitos: {
        titulo: 'Detected Conflicts',
        total: 'Detected conflicts',
        tipo: 'Type',
        descricao: 'Description'
      },
      preview: {
        titulo: 'Changes Preview',
        nota: `No 文件 will be moved until executed with --apply`
      }
    }
  },
  /* -------------------------- COMMON MESSAGES -------------------------- */
  comum: {
    separadores: {
      secao: '---',
      subsecao: '~~~'
    },
    vazios: {
      nenhumResultado: 'No results found.',
      nenhumaOcorrencia: 'No occurrences detected.',
      semDados: 'No data available.'
    },
    acoes: {
      verDetalhes: 'View full details',
      executarComando: 'Run command',
      aplicarMudancas: 'Apply changes',
      cancelar: 'Cancel'
    }
  }
};

/**
 * Helper to format messages with variables
 * @example
 * formatMessage(RelatorioMessages.principal.secoes.metadados.arquivos, { count: 42 })
 * // => "Scanned 文件: 42"
 */
export function formatMessage(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

/**
 * Helper for simple pluralization
 */
export function pluralize(count: number, singular: string, plural: string, showCount = true): string {
  const word = count === 1 ? singular : plural;
  return showCount ? `${count} ${word}` : word;
}

/**
 * Helper to create a separator line
 */
export function separator(char = '-', length = 80): string {
  return char.repeat(length);
}
