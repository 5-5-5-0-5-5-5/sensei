// SPDX-License-Identifier: MIT
import type { NodePath } from '@babel/traverse';
import type { CallExpression, Node } from '@babel/types';
import { traverse } from '@core/config/traverse.js';
import { DetectorAgregadosMensagens } from '@core/messages/pt/analistas/detector-agregados-messages.js';
import { detectarContextoProjeto } from '@shared/contexto-projeto.js';
import { agruparPor } from '@shared/helpers/agrupar.js';
import { splitLines } from '@shared/helpers/lines.js';
import { criarErroAnalise } from '@shared/helpers/ocorrencias.js';
import { filtrarOcorrenciasSuprimidas } from '@shared/helpers/suppressao.js';

import type { Analista, Ocorrencia, ProblemaPerformance } from '@';
import { criarOcorrencia } from '@';

export const analistaDesempenho: Analista = {
  nome: 'performance',
  categoria: 'performance',
  descricao: 'Detecta problemas de performance e otimizações possíveis',
  test: (relPath: string): boolean => {
    return /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(relPath);
  },
  aplicar: (src: string, relPath: string, ast: NodePath<Node> | null): Ocorrencia[] => {
    if (!src) return [];
    const contextoArquivo = detectarContextoProjeto({
      arquivo: relPath,
      conteudo: src,
      relPath
    });
    const problemas: ProblemaPerformance[] = [];
    try {
      // Detectar problemas por padrões de texto
      detectarPadroesPerformance(src, problemas, relPath);

      // Detectar problemas via AST quando disponível
      if (ast) {
        detectarProblemasPerformanceAST(ast, problemas, relPath);
      }

      // Converter para ocorrências
      const ocorrencias: Ocorrencia[] = [];

      // Agrupar por impacto
      const porImpacto = agruparPor(problemas, p => p.impacto || 'medio');
      for (const [impacto, items] of Object.entries(porImpacto)) {
        if (items.length > 0) {
          const nivel = mapearImpactoParaNivel(impacto as ProblemaPerformance['impacto']);

          // Ser menos rigoroso com testes
          const nivelAjustado = contextoArquivo.isTest && nivel === 'aviso' ? 'info' : nivel;
          const resumo = items.slice(0, 3).map(p => p.tipo).join(', ');
          ocorrencias.push(criarOcorrencia({
            tipo: 'PROBLEMA_PERFORMANCE',
            nivel: nivelAjustado,
            mensagem: DetectorAgregadosMensagens.problemasPerformanceResumo(impacto, resumo, items.length),
            relPath,
            linha: items[0].linha
          }));
        }
      }

      // Aplicar supressões inline antes de retornar
      return filtrarOcorrenciasSuprimidas(ocorrencias, 'performance', src);
    } catch (erro) {
      return [criarErroAnalise(relPath, DetectorAgregadosMensagens.erroAnalisarPerformance(erro))];
    }
  }
};
function detectarPadroesPerformance(src: string, problemas: ProblemaPerformance[], relPath: string): void {
  const linhas = splitLines(src);
  let dentroLoop = 0;
  const loopOpen = /\b(for|while)\s*\(/;
  const loopClose = /^\s*\}/;

  linhas.forEach((linha, index) => {
    const numeroLinha = index + 1;

    // Track loop nesting
    if (loopOpen.test(linha)) dentroLoop++;
    if (loopClose.test(linha) && dentroLoop > 0) dentroLoop--;

    // Operações síncronas bloqueantes
    if (/\b(readFileSync|writeFileSync|execSync)\s*\(/.test(linha)) {
      problemas.push({
        tipo: 'blocking-operation',
        descricao: 'Operação síncrona pode bloquear event loop',
        impacto: 'alto',
        linha: numeroLinha,
        coluna: linha.indexOf(/readFileSync|writeFileSync|execSync/.exec(linha)?.[0] || '') + 1,
        sugestao: 'Use versões assíncronas: readFile, writeFile, exec'
      });
    }

    // Event listeners sem cleanup
    if (/addEventListener\s*\(/.test(linha)) {
      // Verificar se há removeEventListener no código (ignorando comentários)
      const srcSemComentarios = src.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
      if (!srcSemComentarios.includes('removeEventListener') && !srcSemComentarios.includes('cleanup') && !srcSemComentarios.includes('destroy')) {
        problemas.push({
          tipo: 'memory-leak',
          descricao: 'Event listener pode causar vazamento de memória',
          impacto: 'medio',
          linha: numeroLinha,
          coluna: linha.indexOf('addEventListener') + 1,
          sugestao: 'Adicione removeEventListener em cleanup/destroy'
        });
      }
    }

    // React: map sem key (detecção melhorada)
    if (/\.map\s*\([^)]*\)/.test(linha) && (/return\s*<|<\w+/.test(linha) || relPath.includes('.tsx') || relPath.includes('.jsx')) && !linha.includes('key=')) {
      problemas.push({
        tipo: 'unnecessary-rerender',
        descricao: 'React map sem key prop pode causar rerenders desnecessários',
        impacto: 'medio',
        linha: numeroLinha,
        coluna: linha.indexOf('.map') + 1,
        sugestao: 'Adicione key prop única para cada elemento da lista'
      });
    }

    // N+1 queries pattern
    if (/\.forEach\s*\(.*\.(find|get|query|select)\s*\(/.test(linha)) {
      problemas.push({
        tipo: 'n-plus-one',
        descricao: 'Possível problema N+1 em consultas',
        impacto: 'alto',
        linha: numeroLinha,
        coluna: linha.indexOf('.forEach') + 1,
        sugestao: 'Use join/include ou agrupe consultas para evitar N+1'
      });
    }

    // Await em loops
    if (/\bawait\b/.test(linha) && dentroLoop > 0) {
      problemas.push({
        tipo: 'sequential-await',
        descricao: 'Await dentro de loop executa operações sequencialmente',
        impacto: 'medio',
        linha: numeroLinha,
        coluna: linha.indexOf('await') + 1,
        sugestao: 'Considere usar Promise.all() para executar em paralelo'
      });
    }

    // Large object spread in loops
    if (/\.\.\./.test(linha) && dentroLoop > 0 && /\{.*\.{3}.*\}/.test(linha)) {
      problemas.push({
        tipo: 'expensive-spread',
        descricao: 'Spread de objeto em loop pode ser custoso em termos de memória e CPU',
        impacto: 'medio',
        linha: numeroLinha,
        coluna: linha.indexOf('...') + 1,
        sugestao: 'Considere mutar um objeto local ou usar Map se o objeto for grande'
      });
    }

    // React: missing memo/useCallback for expensive objects
    if (relPath.endsWith('.tsx') || relPath.endsWith('.jsx')) {
      if (/const\s+\w+\s*=\s*\[.*\]|const\s+\w+\s*=\s*\{.*\}|const\s+\w+\s*=\s*\(.*\)\s*=>/.test(linha) &&
          !/useMemo|useCallback/.test(linha) &&
          !/^\s*\/\//.test(linha)) {
        // Heurística: se for dentro de um componente React (função que retorna JSX)
        const totalLinhas = linhas.length;
        const contextoPosterior = linhas.slice(index, Math.min(index + 20, totalLinhas)).join('\n');
        if (/<[A-Z]|return\s*\(?\s*</.test(contextoPosterior)) {
          problemas.push({
            tipo: 'missing-memoization',
            descricao: 'Objeto/função criado a cada render sem useMemo/useCallback',
            impacto: 'baixo',
            linha: numeroLinha,
            coluna: 1,
            sugestao: 'Envolva em useMemo ou useCallback para evitar re-renders desnecessários de componentes filhos'
          });
        }
      }
    }

    // Imports de bibliotecas grandes
    if (/import.*from\s+['"]lodash['"]|import.*from\s+['"]moment['"]/.test(linha)) {
      problemas.push({
        tipo: 'large-bundle',
        descricao: 'Import completo de biblioteca grande pode aumentar bundle',
        impacto: 'medio',
        linha: numeroLinha,
        coluna: linha.indexOf('import') + 1,
        sugestao: 'Use imports específicos: import { method } from "lodash/method"'
      });
    }
  });
}
function detectarProblemasPerformanceAST(ast: NodePath<Node>, problemas: ProblemaPerformance[], relPath: string): void {
  try {
    const isLoop = (type: string) => ['ForStatement', 'WhileStatement', 'DoWhileStatement', 'ForInStatement', 'ForOfStatement'].includes(type);

    const checkNesting = (path: NodePath<any>) => {
      let parent = path.parentPath;
      while (parent) {
        if (isLoop(parent.type)) {
          problemas.push({
            tipo: 'inefficient-loop',
            descricao: 'Loop aninhado detectado via AST - pode causar performance O(n²)',
            impacto: 'alto',
            linha: path.node.loc?.start.line || 0,
            coluna: path.node.loc?.start.column || 0,
            sugestao: 'Considere usar Map, Set ou otimizar algoritmo para complexidade linear'
          });
          break;
        }
        parent = parent.parentPath;
      }
    };

    traverse(ast.node, {
      ForStatement: checkNesting,
      WhileStatement: checkNesting,
      DoWhileStatement: checkNesting,
      ForInStatement: checkNesting,
      ForOfStatement: checkNesting,

      // Detectar função setTimeout/setInterval sem cleanup
      CallExpression(path: NodePath<CallExpression>) {
        if (path.node.callee.type === 'Identifier' && (path.node.callee.name === 'setTimeout' || path.node.callee.name === 'setInterval')) {
          // Heurística simples: se não há clear* na mesma função/arquivo
          const parentFunction = path.getFunctionParent();
          const context = parentFunction ? parentFunction.toString() : ast.toString();

          if (!context.includes('clear') && !relPath.includes('test')) {
            problemas.push({
              tipo: 'memory-leak',
              descricao: `${path.node.callee.name} sem cleanup pode causar vazamento`,
              impacto: 'medio',
              linha: path.node.loc?.start.line || 0,
              coluna: path.node.loc?.start.column || 0,
              sugestao: `Use clear${path.node.callee.name.replace('set', '')} para limpar`
            });
          }
        }
      }
    });
  } catch {
    // Ignorar erros de traverse
  }
}
function mapearImpactoParaNivel(impacto: ProblemaPerformance['impacto']): 'info' | 'aviso' | 'erro' {
  switch (impacto) {
    case 'alto':
      return 'aviso';
    case 'medio':
      return 'aviso';
    case 'baixo':
    default:
      return 'info';
  }
}
