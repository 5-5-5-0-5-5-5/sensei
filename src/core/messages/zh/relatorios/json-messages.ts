// SPDX-License-Identifier: MIT
/**
 * Centralized messages and descriptions for JSON export
 * Defines explanatory texts, labels and metadata for JSON fields
 */

import type { JsonComMetadados } from '@';

export const JsonMensagens = {
  /* -------------------------- COMMON FIELDS -------------------------- */
  comum: {
    timestamp: {
      label: 'timestamp',
      descricao: 'Date and time of report generation (ISO 8601)'
    },
    versao: {
      label: 'versao',
      descricao: 'Version of Prometheus that generated this report'
    },
    schemaVersion: {
      label: 'schemaVersion',
      descricao: 'JSON schema version (for backward compatibility)'
    },
    duracao: {
      label: 'duracaoMs',
      descricao: 'Total execution duration in milliseconds'
    }
  },
  /* -------------------------- DIAGNOSTICS -------------------------- */
  diagnostico: {
    root: {
      label: 'diagnostico',
      descricao: 'Complete project diagnostic result'
    },
    totalArquivos: {
      label: 'totalArquivos',
      descricao: 'Total number of scanned files'
    },
    ocorrencias: {
      label: 'ocorrencias',
      descricao: 'List of all occurrences detected by analysts',
      campos: {
        tipo: 'Occurrence type/category',
        nivel: 'Severity level (info, warning, error)',
        mensagem: 'Detailed problem description',
        relPath: 'Relative file path',
        linha: 'Line where the problem occurs',
        coluna: 'Column where the problem occurs',
        contexto: 'Additional context (code snippet)'
      }
    },
    metricas: {
      label: 'metricas',
      descricao: 'Aggregated project metrics',
      campos: {
        totalLinhas: 'Total lines of code analyzed',
        totalArquivos: 'Total files processed',
        arquivosComErro: 'Files that failed parsing',
        tempoTotal: 'Total processing time'
      }
    },
    linguagens: {
      label: 'linguagens',
      descricao: 'Language usage statistics in the project',
      campos: {
        total: 'Total code files',
        extensoes: 'Extension -> quantity map'
      }
    },
    parseErros: {
      label: 'parseErros',
      descricao: 'Grouped parsing errors',
      campos: {
        total: 'Total parsing errors',
        porArquivo: 'File -> error list map',
        agregado: 'Indicates whether errors were aggregated'
      }
    }
  },
  /* -------------------------- STRUCTURE / ARCHETYPES -------------------------- */
  estrutura: {
    root: {
      label: 'estruturaIdentificada',
      descricao: 'Project structure and archetype identification'
    },
    melhores: {
      label: 'melhores',
      descricao: 'Ordered list of best archetype candidates',
      campos: {
        nome: 'Archetype name',
        score: 'Calculated score',
        confidence: 'Confidence level (%)',
        descricao: 'Archetype description',
        matchedRequired: 'Required files found',
        missingRequired: 'Required files missing',
        matchedOptional: 'Optional files found'
      }
    },
    baseline: {
      label: 'baseline',
      descricao: 'Saved structure snapshot for drift detection',
      campos: {
        arquetipo: 'Identified archetype',
        confidence: 'Confidence when saved',
        timestamp: 'Snapshot date',
        arquivosRaiz: 'List of root files'
      }
    },
    drift: {
      label: 'drift',
      descricao: 'Changes detected relative to baseline',
      campos: {
        alterouArquetipo: 'Whether archetype changed',
        deltaConfidence: 'Confidence percentage variation',
        arquivosRaizNovos: 'New root files',
        arquivosRaizRemovidos: 'Removed root files'
      }
    }
  },
  /* -------------------------- GUARDIAN -------------------------- */
  guardian: {
    root: {
      label: 'guardian',
      descricao: 'Code integrity and protection verification'
    },
    status: {
      label: 'status',
      opcoes: {
        sucesso: 'Verification successful, no changes',
        alteracoes: 'Changes detected in protected files',
        baseline: 'Baseline created (first run)',
        erro: 'Error during verification',
        naoExecutada: 'Guardian was not executed'
      }
    },
    totalArquivos: {
      label: 'totalArquivos',
      descricao: 'Number of protected files'
    },
    alteracoes: {
      label: 'alteracoes',
      descricao: 'List of detected changes',
      campos: {
        arquivo: 'Modified file path',
        hashAnterior: 'Previous SHA-256 hash',
        hashAtual: 'Current SHA-256 hash',
        acao: 'Action type (modified, added, removed)'
      }
    }
  },
  /* -------------------------- PRUNING -------------------------- */
  poda: {
    root: {
      label: 'poda',
      descricao: 'Report of files/directories marked for removal'
    },
    pendencias: {
      label: 'pendencias',
      descricao: 'List of items pending removal',
      campos: {
        caminho: 'Full path',
        tipo: 'file or directory',
        motivoOriginal: 'Reason for marking',
        timestamp: 'Marking date'
      }
    },
    reativar: {
      label: 'listaReativar',
      descricao: 'List of items marked for reactivation'
    },
    historico: {
      label: 'historico',
      descricao: 'History of pruning actions executed',
      campos: {
        acao: 'Action type (remove, reactivate, pending)',
        caminho: 'Affected path',
        timestamp: 'Action date',
        usuario: 'User who executed'
      }
    }
  },
  /* -------------------------- RESTRUCTURING -------------------------- */
  reestruturar: {
    root: {
      label: 'reestruturacao',
      descricao: 'Project restructuring plan'
    },
    movimentos: {
      label: 'movimentos',
      descricao: 'List of planned file movements',
      campos: {
        id: 'Unique movement ID',
        origem: 'Source path',
        destino: 'Destination path',
        razao: 'Reason for movement',
        status: 'Status (green-zone, blocked, pending)',
        dependencias: 'Affected dependent files'
      }
    },
    conflitos: {
      label: 'conflitos',
      descricao: 'Detected conflicts that prevent movements',
      campos: {
        tipo: 'Conflict type',
        arquivos: 'Files involved',
        descricao: 'Conflict description',
        resolucaoSugerida: 'How to resolve'
      }
    },
    resumo: {
      label: 'resumo',
      descricao: 'Plan statistical summary',
      campos: {
        total: 'Total movements',
        zonaVerde: 'Safe movements',
        bloqueados: 'Blocked movements',
        impactoEstimado: 'Number of affected files'
      }
    }
  },
  /* -------------------------- SMART FILTER -------------------------- */
  filtroInteligente: {
    root: {
      label: 'relatorioResumo',
      descricao: 'Filtered report with prioritized problems'
    },
    problemasCriticos: {
      label: 'problemasCriticos',
      descricao: 'Critical severity problems (security, data)'
    },
    problemasAltos: {
      label: 'problemasAltos',
      descricao: 'High priority problems (bugs, fragile code)'
    },
    problemasOutros: {
      label: 'problemasOutros',
      descricao: 'Other problems (low/medium priority)'
    },
    estatisticas: {
      label: 'estatisticas',
      descricao: 'Smart grouping statistics',
      campos: {
        totalOcorrencias: 'Total occurrences processed',
        arquivosAfetados: 'Number of unique affected files',
        problemasPrioritarios: 'Critical + high problems',
        problemasAgrupados: 'Number of groups created'
      }
    }
  }
};

/**
 * Wraps JSON data with explanatory metadata
 */
export function wrapComMetadados<T>(data: T, schema: string, versao: string, descricao: string): JsonComMetadados<T> {
  return {
    _metadata: {
      schema,
      versao,
      geradoEm: new Date().toISOString(),
      descricao
    },
    dados: data
  };
}

/**
 * Helper to generate JSON field description with type safety
 */
export function getDescricaoCampo(caminho: string): string {
  const parts = caminho.split('.');
  // Type-safe navigation through the messages object
  let current: unknown = JsonMensagens;
  for (const part of parts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return `Campo: ${caminho}`;
    }
  }

  // Type guard to check if it has a description
  if (typeof current === 'object' && current !== null && 'descricao' in current && typeof (current as {
    descricao: unknown;
  }).descricao === 'string') {
    return (current as {
      descricao: string;
    }).descricao;
  }
  return `Campo: ${caminho}`;
}
