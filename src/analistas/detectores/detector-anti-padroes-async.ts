// SPDX-License-Identifier: MIT
import type { NodePath, Visitor } from '@babel/traverse';
import type { CallExpression, ExpressionStatement, Node } from '@babel/types';
import { traverse } from '@core/config/traverse.js';
import { shouldSuppressOccurrence } from '@shared/helpers/rule-config.js';

import type { Analista, Ocorrencia } from '@';
import { criarOcorrencia } from '@';

type Msg = Ocorrencia;

interface AsyncVisitorState {
  ocorrencias: Msg[];
  relPath: string;
}

const visitorAsync: Visitor<AsyncVisitorState> = {
  ExpressionStatement(path: NodePath<ExpressionStatement>, state: AsyncVisitorState) {
    const expr = path.node.expression;
    // Procurar por promises flutuantes (chamadas de função sem await ou .catch/.then)
    if (expr.type === 'CallExpression') {
      const callee = expr.callee;
      // Se for chamada direta ou membro de objeto (que não seja .catch ou .then)
      if (callee.type === 'MemberExpression') {
        const propName = callee.property.type === 'Identifier' ? callee.property.name : '';
        if (propName === 'then' || propName === 'catch' || propName === 'finally') {
          return;
        }
      }

      // Checar se a função está marcada como async ou retorna Promise (heurística baseada em nomes comuns ou inferência raso)
      const funcName = getFunctionName(callee);
      if (funcName && isProbablyAsync(funcName)) {
        // Se temos definição local, respeite se é async ou não
        const binding = path.scope.getBinding(funcName);
        if (binding && binding.path.isFunction() && !(binding.path.node as { async?: boolean }).async) {
          return; // Definida como síncrona localmente
        }

        const occurrences: Msg[] = state.ocorrencias || [];
        occurrences.push({
          tipo: 'floating-promise',
          linha: path.node.loc?.start.line || 0,
          coluna: path.node.loc?.start.column || 0,
          severidade: 'media',
          nivel: 'aviso',
          mensagem: `Chamada possivelmente assíncrona '${funcName}' não aguardada (floating promise). Adicione 'await' ou trate com '.catch()'.`,
          relPath: state.relPath,
        } as Ocorrencia);
      }
    }
  },
  CallExpression(path: NodePath<CallExpression>, state: AsyncVisitorState) {
     const callee = path.node.callee;
     if (callee.type === 'MemberExpression') {
       const prop = callee.property;
       const propName = prop.type === 'Identifier' ? prop.name : '';
       // map ou forEach com função async
       if (propName === 'map' || propName === 'forEach') {
         const arg = path.node.arguments[0];
         if (arg && (arg.type === 'ArrowFunctionExpression' || arg.type === 'FunctionExpression')) {
            if (arg.async) {
               const isForEach = propName === 'forEach';
               const occurrences: Msg[] = state.ocorrencias || [];
               occurrences.push({
                  tipo: isForEach ? 'async-in-foreach' : 'async-in-map-without-all',
                  linha: path.node.loc?.start.line || 0,
                  coluna: path.node.loc?.start.column || 0,
                  severidade: 'alta',
                  nivel: 'erro',
                  mensagem: isForEach
                    ? `Uso de 'async' dentro de '${propName}' não aguarda execução. Prefira iterar com 'for...of'.`
                    : `Uso de 'async' dentro de 'map'. Certifique-se de envelopar e aguardar com 'Promise.all(...)'.`,
                  relPath: state.relPath,
               } as Ocorrencia);
            }
         }
       }
     }
  }
};

function getFunctionName(node: Node): string | null {
  if (node.type === 'Identifier') return node.name;
  if (node.type === 'MemberExpression' && node.property.type === 'Identifier') return node.property.name;
  return null;
}

function isProbablyAsync(name: string): boolean {
  // Nomes que são quase certamente assíncronos
  if (/^(fetch|request|axios|prisma|db\.|database\.|api\.)/.test(name)) return true;
  if (/Async$/.test(name)) return true;
  if (['fetch', 'axios', 'insert', 'mutate', 'query', 'save', 'load'].includes(name)) return true;

  // Nomes comuns que podem ser síncronos (removidos: update, delete)
  return false;
}

export const analistaAntiPadroesAsync: Analista = {
  nome: 'anti-padroes-async',
  categoria: 'code-quality',
  descricao: 'Detecta antipadrões de promises e fluxos assíncronos (ex: floating promises, maps sem Promise.all)',
  visitor: visitorAsync as Visitor,
  test: (relPath: string): boolean => {
    return /\.(js|jsx|ts|tsx)$/.test(relPath) && !/\.test\.(ts|js)$/.test(relPath);
  },
  aplicar: async (src: string, relPath: string, ast: NodePath<Node> | null): Promise<Ocorrencia[]> => {
    if (!ast) return [];

    // Ignorar se a regra estiver suprimida
    if (shouldSuppressOccurrence('anti-padroes-async', relPath)) {
      return [];
    }

    const stateObj = { ocorrencias: [] as Ocorrencia[], relPath };
    const nodeToTraverse = ('node' in ast ? ast.node : ast) as Node;

    traverse(nodeToTraverse, visitorAsync, undefined, stateObj);

    // Ajustar o tipo para garantir a mesma estrutura definida de ocorrencias
    return stateObj.ocorrencias.map(o => criarOcorrencia({
       tipo: o.tipo ?? 'anti-padroes-async',
       nivel: o.nivel || 'aviso',
       mensagem: o.mensagem,
       linha: o.linha || 0,
       relPath,
       origem: 'anti-padroes-async'
    }));
  }
};
