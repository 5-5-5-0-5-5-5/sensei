// SPDX-License-Identifier: MIT
import type { NodePath, Visitor } from '@babel/traverse';
import type { CallExpression, Node } from '@babel/types';
import { traverse } from '@core/config/traverse.js';
import { shouldSuppressOccurrence } from '@shared/helpers/rule-config.js';

import type { Analista, MemoriaVisitorState, Ocorrencia } from '@';
import { criarOcorrencia } from '@';

type Msg = Ocorrencia;

// Heurísticas básicas para identificar vazamentos
const visitorMemoria: Visitor<MemoriaVisitorState> = {
  CallExpression(path: NodePath<CallExpression>, state: MemoriaVisitorState) {
    const callee = path.node.callee;

    // Identificar setInterval sendo chamado sem atribuição a uma variável
    if (callee.type === 'Identifier') {
      if (callee.name === 'setInterval') {
         // Se não faz parte de VariableDeclarator ou AssignmentExpression
         const parent = path.parent;
         if (parent.type !== 'VariableDeclarator' && parent.type !== 'AssignmentExpression') {
           const occurrences: Msg[] = state.ocorrencias || [];
           occurrences.push({
              tipo: 'setinterval-unassigned',
              linha: path.node.loc?.start.line || 0,
              coluna: path.node.loc?.start.column || 0,
              severidade: 'media',
              nivel: 'aviso',
              mensagem: `Chamada para setInterval sem guardar a referência. Isso pode levar a um vazamento de memória e processamento.`,
              relPath: state.relPath,
           } as Ocorrencia);
         }
      }
    } else if (callee.type === 'MemberExpression') {
      const prop = callee.property;
      const propName = prop.type === 'Identifier' ? prop.name : '';

      // Identificar window.setInterval
      if (propName === 'setInterval' && callee.object.type === 'Identifier' && callee.object.name === 'window') {
         const parent = path.parent;
         if (parent.type !== 'VariableDeclarator' && parent.type !== 'AssignmentExpression') {
           const occurrences: Msg[] = state.ocorrencias || [];
           occurrences.push({
              tipo: 'setinterval-unassigned',
              linha: path.node.loc?.start.line || 0,
              coluna: path.node.loc?.start.column || 0,
              severidade: 'media',
              nivel: 'aviso',
              mensagem: `Chamada para window.setInterval sem guardar a referência (memory leak).`,
              relPath: state.relPath,
           } as Ocorrencia);
         }
      }

      // Identificar addEventListener global (window/document) sem cleanup aparente no mesmo escopo local (heurística básica)
      if (propName === 'addEventListener') {
         const isGlobal = callee.object.type === 'Identifier' && ['window', 'document', 'body'].includes(callee.object.name);
         if (isGlobal && state.contextType === 'react') { // Em arquivos react, avisamos se tiver window.addEventListener fora de side-effects limpos
              state.hasGlobalListeners = true;
         }
      }
    }
  }
};

export const analistaVazamentoMemoria: Analista = {
  nome: 'vazamento-memoria',
  categoria: 'code-quality',
  descricao: 'Heurísticas para detecção de vazamentos de memória (setInterval não limpo, eventListeners globais pendentes)',
  visitor: visitorMemoria as Visitor,
  test: (relPath: string): boolean => {
    return /\.(js|jsx|ts|tsx)$/.test(relPath) && !/\.test\.(ts|js)$/.test(relPath);
  },
  aplicar: async (src: string, relPath: string, ast: NodePath<Node> | null): Promise<Ocorrencia[]> => {
    if (!ast) return [];

    // Ignorar se a regra estiver suprimida
    if (shouldSuppressOccurrence('vazamento-memoria', relPath)) {
      return [];
    }

    const isReact = /\.(jsx|tsx)$/.test(relPath) || src.includes('react');
    const stateObj: MemoriaVisitorState = {
       ocorrencias: [] as Ocorrencia[],
       relPath,
       contextType: isReact ? 'react' : 'vanilla',
       hasGlobalListeners: false
    };

    const nodeToTraverse = ('node' in ast ? ast.node : ast) as Node;
    traverse(nodeToTraverse, visitorMemoria, undefined, stateObj);

    if (stateObj.hasGlobalListeners && stateObj.contextType === 'react') {
      // Fazemos uma varredura de texto secundária rápida apenas para alertar
      if (!src.includes('removeEventListener')) {
          stateObj.ocorrencias.push({
              tipo: 'global-listener-no-cleanup',
              linha: 1, // Geral arquivo
              coluna: 0,
              severidade: 'alta',
              nivel: 'erro',
              mensagem: `Adição de evento global 'addEventListener' detectada em componente React, porém 'removeEventListener' não foi encontrado. Isso causará memory leaks no unmount.`,
              relPath,
          } as Ocorrencia);
      }
    }

    return stateObj.ocorrencias.map(o => criarOcorrencia({
       tipo: o.tipo ?? 'vazamento-memoria',
       nivel: o.nivel || 'aviso',
       mensagem: o.mensagem,
       linha: o.linha || 0,
       relPath,
       origem: 'vazamento-memoria'
    }));
  }
};

export default analistaVazamentoMemoria;
