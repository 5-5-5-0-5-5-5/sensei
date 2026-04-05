// SPDX-License-Identifier: MIT
import type { Visitor } from '@babel/traverse';
import { traverse } from '@core/config/traverse.js';

import type { Ocorrencia } from '@';

/**
 * Utilitário centralizado para rodar Visitor de AST e coletar resultados sem duplicação
 */
export class DedupeManager {
  private seen = new Set<string>();
  private occurrences: Ocorrencia[] = [];

  constructor(private relPath: string) {}

  add(ocorrencia: Ocorrencia): void {
    // Chave de deduplicação simples baseada em mensagem, caminho e linha
    const relPath = this.relPath || ocorrencia.relPath || '';
    const linha = ocorrencia.linha || 0;
    const key = `${ocorrencia.mensagem}|${relPath}|${linha}`;

    if (this.seen.has(key)) return;

    this.seen.add(key);
    this.occurrences.push(ocorrencia);
  }

  getResults(): Ocorrencia[] {
    return this.occurrences;
  }
}

/**
 * Roda o visitor do Babel gerenciando deduplicações
 */
export function runUniqueVisitor(
  ast: any,
  relPath: string,
  visitor: Visitor<unknown>,
  initialState: any = {}
): Ocorrencia[] {
  const manager = new DedupeManager(relPath);
  const state = { ...initialState, manager, relPath };

  const nodeToTraverse = ast?.node || ast;
  if (!nodeToTraverse) return [];

  // Proteção contra crashes durante traverse
  try {
    traverse(nodeToTraverse, visitor, undefined, state);
  } catch (error) {
     // Ignorar silenciosamente falhas de parser em sub-nós
  }

  return manager.getResults();
}
