// SPDX-License-Identifier: MIT
import type { NodePath } from '@babel/traverse';
import { detectarContextoProjeto } from '@shared/contexto-projeto.js';
import { detectarComentariosPendentes } from '@shared/helpers/detectores-comuns.js';

import type { Analista, TecnicaAplicarResultado } from '@';
import { criarOcorrencia } from '@';

/**
 * Analista para detectar TODO e FIXME em comentários.
 * Utiliza helpers compartilhados para busca consistente em todo o projeto.
 */
export const analistaTodoComentarios: Analista = {
  nome: 'todo-comments',
  categoria: 'qualidade',
  descricao: 'Detecta comentários TODO/FIXME deixados no código.',
  global: false,
  test(relPath) {
    const contextoArquivo = detectarContextoProjeto({
      arquivo: relPath,
      conteudo: '',
      relPath
    });

    if (contextoArquivo.isTest || contextoArquivo.isConfiguracao || contextoArquivo.frameworks.includes('types')) {
      return false;
    }

    if (/analistas[\\\/]analista-todo-comments\.(ts|js)$/i.test(relPath)) return false;
    return /\.(ts|js|tsx|jsx)$/i.test(relPath);
  },
  aplicar(src, relPath, _ast?: NodePath | null): TecnicaAplicarResultado {
    if (!src || typeof src !== 'string') return null;

    const contextoArquivo = detectarContextoProjeto({
      arquivo: relPath,
      conteudo: src,
      relPath
    });

    const nivelTodo = contextoArquivo.isLibrary ? 'aviso' : 'info';

    // Utiliza helper compartilhado para detecção robusta
    const todos = detectarComentariosPendentes(src);

    if (todos.length === 0) return null;

    return todos.map(todo => criarOcorrencia({
      tipo: 'TODO-pendente',
      mensagem: `${todo.tipo === 'FIXME' ? 'FIXME' : 'TODO'} encontrado: ${todo.texto.substring(0, 50)}`,
      nivel: todo.tipo === 'FIXME' ? 'aviso' : nivelTodo,
      relPath,
      linha: todo.linha,
      origem: 'todo-comments'
    }));
  }
};
