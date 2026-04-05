// SPDX-License-Identifier: MIT
import type { NodePath } from '@babel/traverse';
import type { Node } from '@babel/types';
import { findQuickFixes, type PatternBasedQuickFix } from '@core/config/auto/fix-config.js';

import type { Analista, Ocorrencia } from '@';
import { criarOcorrencia } from '@';

import {
  analisarTexto,
  calcularLinha
} from './pontuacao-shared.js';

  /* -------------------------- Helpers / Config -------------------------- */

function mapearCategoriaNivel(category: PatternBasedQuickFix['category']): 'info' | 'aviso' | 'erro' {
  switch (category) {
    case 'security':
      return 'erro';
    case 'performance':
      return 'aviso';
    case 'style':
    case 'documentation':
      return 'info';
    default:
      return 'info';
  }
}

  /* -------------------------- analistaQuickFixes -------------------------- */

export const analistaQuickFixes: Analista = {
  nome: 'quick-fixes',
  categoria: 'melhorias',
  descricao: 'Detecta problemas comuns e oferece correções automáticas',
  test: (relPath: string): boolean => {
    // Inclui SVGs para permitir quick-fixes seguros (otimização e viewBox)
    return /\.(js|jsx|ts|tsx|mjs|cjs|svg)$/.test(relPath);
  },
  aplicar: (src: string, relPath: string, _ast: NodePath<Node> | null): Ocorrencia[] => {
    if (!src) return [];
    const ocorrencias: Ocorrencia[] = [];

    // Quick fixes gerais
    const quickFixes = findQuickFixes(src, undefined, undefined, relPath);

    // Quick fixes específicos por tipo de problema detectado
    const problemaTipos = ['unhandled-async', 'console-log', 'memory-leak', 'dangerous-html', 'eval-usage', 'complex-regex'];
    for (const problemTipo of problemaTipos) {
      const specificFixes = findQuickFixes(src, problemTipo, undefined, relPath);
      quickFixes.push(...specificFixes);
    }

    // Remover duplicatas por ID
    const uniqueFixes = quickFixes.filter((fix, index, arr) => arr.findIndex(f => f.id === fix.id) === index);
    for (const fixResultado of uniqueFixes) {
      for (const match of fixResultado.matches) {
        const linha = calcularLinha(src, match.index, match);
        const previewCorrecao = fixResultado.fix(match, src);
        const originalLine = src.split('\n')[linha - 1] || '';
        const fixedLine = previewCorrecao.split('\n')[linha - 1] || '';
        const sugestao = [fixResultado.description, '', `🔧 Correção sugerida:`, `❌ Antes: ${originalLine.trim()}`, `✅ Depois: ${fixedLine.trim()}`, '', `Confiança: ${fixResultado.confidence}%`, `Categoria: ${fixResultado.category}`, `ID do Fix: ${fixResultado.id}`].join('\n');
        const nivel = mapearCategoriaNivel(fixResultado.category);
        const ocorrencia = criarOcorrencia({
          tipo: 'auto-fix-disponivel',
          nivel,
          mensagem: `${fixResultado.title}`,
          relPath,
          linha
        });
        const ocorrenciaGenerica = ocorrencia as Ocorrencia & {
          sugestao?: string;
          quickFixId?: string;
          confidence?: number;
          category?: string;
          matchIndex?: number;
          matchLength?: number;
        };
        ocorrenciaGenerica.sugestao = sugestao;
        ocorrenciaGenerica.quickFixId = fixResultado.id;
        ocorrenciaGenerica.confidence = fixResultado.confidence;
        ocorrenciaGenerica.category = fixResultado.category;
        ocorrenciaGenerica.matchIndex = match.index;
        ocorrenciaGenerica.matchLength = match[0].length;
        ocorrencias.push(ocorrencia);
      }
    }
    return ocorrencias;
  }
};

  /* -------------------------- analistaPontuacao -------------------------- */

export const analistaPontuacao: Analista = {
  nome: 'pontuacao-fix',
  categoria: 'formatacao',
  descricao: 'Detecta problemas de pontuação, caracteres estranhos e formatação de texto',
  test: (relPath: string): boolean => {
    return /\.(ts|js|tsx|jsx|mjs|cjs|md|txt|json)$/.test(relPath);
  },
  aplicar: (src: string, relPath: string): Ocorrencia[] => {
    if (!src) return [];
    const problemas = analisarTexto(src);
    const ocorrencias: Ocorrencia[] = [];
    for (const problema of problemas) {
      const linha = calcularLinha(src, problema.posicao);
      const linhas = src.split('\n');
      const contexto = linhas[linha - 1] || '';
      const ocorrencia = criarOcorrencia({
        tipo: problema.tipo,
        nivel: (problema.confianca ?? 0) > 80 ? 'aviso' : 'info',
        mensagem: problema.descricao,
        relPath,
        linha
      });
      const ocorrenciaExtendida = ocorrencia as Ocorrencia & {
        sugestao?: string;
        confianca?: number;
        contexto?: string;
      };
      ocorrenciaExtendida.sugestao = problema.sugestao;
      ocorrenciaExtendida.confianca = problema.confianca;
      ocorrenciaExtendida.contexto = contexto;
      ocorrencias.push(ocorrencia);
    }
    return ocorrencias;
  }
};

  /* -------------------------- Exports adicionais -------------------------- */

export const analistas: Analista[] = [analistaQuickFixes, analistaPontuacao];
