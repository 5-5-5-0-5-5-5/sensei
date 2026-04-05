// SPDX-License-Identifier: MIT
import type { NodePath } from '@babel/traverse';
import type { CatchClause, FunctionDeclaration, Node, NumericLiteral, TSAnyKeyword } from '@babel/types';
import { config } from '@core/config/config.js';
import { LIMITES_PADRAO } from '@core/config/limites.js';
import { traverse } from '@core/config/traverse.js';
import { DetectorCodigoFragilMensagens } from '@core/messages/pt/analistas/detector-codigo-fragil-messages.js';
import { agruparPor } from '@shared/helpers/agrupar.js';
import { detectarComentariosPendentes, detectarLogsDebug } from '@shared/helpers/detectores-comuns.js';
import { detectarFrameworks } from '@shared/helpers/framework-detector.js';
import { splitLines } from '@shared/helpers/lines.js';
import { isWhitelistedConstant } from '@shared/helpers/magic-constants-whitelist.js';
import { filtrarOcorrenciasSuprimidas } from '@shared/helpers/suppressao.js';

import type { Analista, Fragilidade, Ocorrencia } from '@';
import { criarOcorrencia } from '@';

// Cache de frameworks detectados (evita múltiplas leituras do package.json)
let frameworksDetectados: string[] | null = null;
const LIMITES = {
  LINHAS_FUNCAO: LIMITES_PADRAO.CODIGO.MAX_LINHAS_FUNCAO,
  PARAMETROS_FUNCAO: LIMITES_PADRAO.CODIGO.MAX_PARAMETROS_FUNCAO,
  MAX_PARAMETROS_CRITICO: LIMITES_PADRAO.CODIGO.MAX_PARAMETROS_CRITICO,
  CALLBACKS_ANINHADOS: LIMITES_PADRAO.CODIGO.MAX_NESTED_CALLBACKS,
  COMPLEXIDADE_COGNITIVA: LIMITES_PADRAO.CODIGO.MAX_COMPLEXIDADE_COGNITIVA,
  REGEX_COMPLEXA_LENGTH: LIMITES_PADRAO.CODIGO.MAX_REGEX_LENGTH,
  MAX_ANINHAMENTO_IF: LIMITES_PADRAO.CODIGO.MAX_ANINHAMENTO_IF,
  MAX_LINHAS_ARQUIVO: LIMITES_PADRAO.CODIGO.MAX_LINHAS_ARQUIVO
} as const;

/**
 * Visitor para travessia de AST - compartilhado para otimização
 */
const visitorFragil = {
  // Blocos catch vazios
  CatchClause(path: NodePath<CatchClause>, state: any) {
    const fragilidades = state.resultados.get('codigo-fragil') || [];
    const body = path.node.body.body;
    const linha = path.node.loc?.start.line || 0;
    if (body.length === 0) {
      fragilidades.push({
        tipo: 'catch-vazio',
        linha,
        coluna: path.node.loc?.start.column || 0,
        severidade: 'media',
        contexto: 'Bloco catch vazio'
      });
    } else if (body.length === 1 && isSingleConsoleLog(body[0])) {
      fragilidades.push({
        tipo: 'catch-apenas-log',
        linha,
        coluna: path.node.loc?.start.column || 0,
        severidade: 'baixa',
        contexto: 'Catch apenas com console.log'
      });
    }
    state.resultados.set('codigo-fragil', fragilidades);
  },
  // Uso explícito de 'any'
  TSAnyKeyword(path: NodePath<TSAnyKeyword>, state: any) {
    const fragilidades = state.resultados.get('codigo-fragil') || [];
    fragilidades.push({
      tipo: 'any-explicito',
      linha: path.node.loc?.start.line || 0,
      coluna: path.node.loc?.start.column || 0,
      severidade: 'media',
      contexto: 'Tipo any explícito'
    });
    state.resultados.set('codigo-fragil', fragilidades);
  },
  // Aninhamento excessivo de IFs
  IfStatement(path: NodePath<import('@babel/types').IfStatement>, state: any) {
    const fragilidades = state.resultados.get('codigo-fragil') || [];
    let depth = 0;
    let current: NodePath | null = path;
    while (current) {
      if (current.isIfStatement()) depth++;
      current = current.parentPath;
    }
    if (depth > LIMITES.MAX_ANINHAMENTO_IF) {
      fragilidades.push({
        tipo: 'if-muito-aninhado',
        linha: path.node.loc?.start.line || 0,
        coluna: path.node.loc?.start.column || 0,
        severidade: depth > LIMITES.MAX_ANINHAMENTO_IF + 1 ? 'alta' : 'media',
        contexto: `Condicionais aninhadas demais (nível ${depth}, máx: ${LIMITES.MAX_ANINHAMENTO_IF})`
      });
    }
    state.resultados.set('codigo-fragil', fragilidades);
  },
  // Funções longas
  FunctionDeclaration(path: NodePath<FunctionDeclaration>, state: any) {
    const fragilidades = state.resultados.get('codigo-fragil') || [];
    const maxLinhas = config.ANALISE_LIMITES?.CODIGO_FRAGIL?.MAX_LINHAS_FUNCAO ?? LIMITES.LINHAS_FUNCAO;
    const node = path.node;
    if (node.body?.type === 'BlockStatement') {
      const inicio = node.loc?.start.line || 0;
      const fim = node.loc?.end.line || 0;
      const numLinhas = fim - inicio;
      if (numLinhas > maxLinhas) {
        fragilidades.push({
          tipo: 'funcao-longa',
          linha: inicio,
          coluna: node.loc?.start.column || 0,
          severidade: numLinhas > maxLinhas * 2 ? 'alta' : 'media',
          contexto: `Função com ${numLinhas} linhas (máx: ${maxLinhas})`
        });
      }
    }
    state.resultados.set('codigo-fragil', fragilidades);
  },
  // Números mágicos
  NumericLiteral(path: NodePath<NumericLiteral>, state: any) {
    const fragilidades = state.resultados.get('codigo-fragil') || [];
    const value = path.node.value;
    if (isInVariableDeclarator(path) || isInArrayIndex(path)) return;
    if (!frameworksDetectados) {
      frameworksDetectados = detectarFrameworks(process.cwd()).map(f => f.name);
    }
    if (isWhitelistedConstant(value, frameworksDetectados)) return;
    fragilidades.push({
      tipo: 'magic-number',
      linha: path.node.loc?.start.line || 0,
      coluna: path.node.loc?.start.column || 0,
      severidade: 'baixa',
      contexto: `Número mágico '${value}' detectado`
    });
    state.resultados.set('codigo-fragil', fragilidades);
  }
};

export const analistaCodigoFragil: Analista = {
  nome: 'codigo-fragil',
  categoria: 'qualidade',
  descricao: 'Detecta padrões de código que podem levar a problemas futuros',
  limites: {
    maxLinhasFuncao: config.ANALISE_LIMITES?.CODIGO_FRAGIL?.MAX_LINHAS_FUNCAO ?? LIMITES.LINHAS_FUNCAO,
    maxParametros: config.ANALISE_LIMITES?.CODIGO_FRAGIL?.MAX_PARAMETROS ?? LIMITES.PARAMETROS_FUNCAO,
    maxNestedCallbacks: config.ANALISE_LIMITES?.CODIGO_FRAGIL?.MAX_NESTED_CALLBACKS ?? LIMITES.CALLBACKS_ANINHADOS
  },
  visitor: visitorFragil,
  test: (relPath: string): boolean => {
    if (/\.(deprecados?|abandonados?)\//i.test(relPath)) return false;
    return /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(relPath);
  },
  aplicar: (src: string, relPath: string, ast: any): Ocorrencia[] => {
    if (!ast || !src) return [];

    const fragilidades: Fragilidade[] = [];

    // Detecções baseadas em texto
    detectarLogsDebug(src).forEach(log => {
      fragilidades.push({ tipo: 'console-log', linha: log.linha, coluna: 0, severidade: 'baixa', contexto: `console.${log.metodo} encontrado` });
    });

    detectarComentariosPendentes(src).forEach(todo => {
      fragilidades.push({ tipo: 'todo-comment', linha: todo.linha, coluna: 0, severidade: 'baixa', contexto: `Comentário ${todo.tipo} encontrado: ${todo.texto.substring(0, 30)}...` });
    });

    const lines = splitLines(src);
    if (lines.length > LIMITES.MAX_LINHAS_ARQUIVO) {
      fragilidades.push({ tipo: 'arquivo-muito-grande', linha: 1, coluna: 0, severidade: 'media', contexto: `Arquivo com ${lines.length} linhas (máx sugerido: ${LIMITES.MAX_LINHAS_ARQUIVO})` });
    }

    // Processamento AST: Otimizado (preColetado) ou Fallback
    if (ast.preColetado) {
      fragilidades.push(...ast.preColetado);
    } else {
      const nodeToTraverse = ast.node || ast;
      const stateMock = { resultados: new Map([['codigo-fragil', []]]) };
      traverse(nodeToTraverse, visitorFragil, undefined, stateMock);
      fragilidades.push(...(stateMock.resultados.get('codigo-fragil') || []));
    }

    // Detecções de texto complementares (Heurísticas)
    detectarProblemasAvancados(src, fragilidades);

    // Converter para ocorrências Sensei
    const ocorrencias: Ocorrencia[] = [];
    const porSeveridade = agruparPor(fragilidades, f => f.severidade || 'media');
    for (const [severidade, items] of Object.entries(porSeveridade)) {
      if (items.length > 0) {
        const nivel = severidade === 'critica' || severidade === 'alta' ? 'erro' : severidade === 'media' ? 'aviso' : 'info';
        const resumo = items.slice(0, 3).map(p => p.tipo).join(', ');
        const tipos: Record<string, number> = {};
        for (const it of items) {
          tipos[it.tipo] = (tipos[it.tipo] || 0) + 1;
        }
        const amostra = items.slice(0, 5).map(it => `${it.tipo} (L${it.linha})`);

        ocorrencias.push(criarOcorrencia({
          tipo: 'codigo-fragil',
          nivel,
          mensagem: DetectorCodigoFragilMensagens.fragilidadesResumo(severidade, resumo, {
            severidade,
            total: items.length,
            tipos,
            amostra
          }),
          relPath,
          linha: items[0].linha
        }));
      }
    }

    return filtrarOcorrenciasSuprimidas(ocorrencias, 'codigo-fragil', src);
  }
};

/**
 * Heurísticas avançadas baseadas em padrões de texto
 */
function detectarProblemasAvancados(src: string, fragilidades: Fragilidade[]): void {
  const lines = splitLines(src);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // .then() sem .catch()
    if (/\.then\s*\(/.test(line) && !line.includes('.catch') && !src.split('\n')[i+1]?.includes('.catch')) {
        fragilidades.push({ tipo: 'promise-sem-catch', linha: i + 1, coluna: line.indexOf('.then'), severidade: 'media', contexto: 'Promise sem tratamento de erro (.catch)' });
    }
    // Regex complexa
    const regexMatch = line.match(/\/([^\/\\]|\\.)+\/[gimuy]*/);
    if (regexMatch && regexMatch[0].length > LIMITES.REGEX_COMPLEXA_LENGTH && (regexMatch[0].match(/\(/g) || []).length > 3) {
      fragilidades.push({ tipo: 'regex-complexa', linha: i + 1, coluna: line.indexOf(regexMatch[0]), severidade: 'media', contexto: 'Regex complexa detectada' });
    }
  }
  // Complexidade Cognitiva
  detectarComplexidadeCognitiva(src, fragilidades);
}

function detectarComplexidadeCognitiva(src: string, fragilidades: Fragilidade[]): void {
  const lines = splitLines(src);
  let score = 0;
  let nesting = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/(if|while|for|switch|catch)/.test(line)) score += (1 + nesting);
    if (line.includes('{')) nesting++;
    if (line.includes('}')) nesting--;
    if (score > LIMITES.COMPLEXIDADE_COGNITIVA) {
      fragilidades.push({ tipo: 'complexidade-cognitiva', linha: i + 1, coluna: 0, severidade: 'alta', contexto: `Complexidade cognitiva elevada (${score})` });
      score = 0; // Reset para a próxima seção
    }
  }
}

function isSingleConsoleLog(stmt: Node): boolean {
  return stmt.type === 'ExpressionStatement' && stmt.expression?.type === 'CallExpression' && stmt.expression.callee?.type === 'MemberExpression' && (stmt.expression.callee.object as any).name === 'console';
}
function isInVariableDeclarator(path: NodePath): boolean { return !!path.findParent(p => p.isVariableDeclarator()); }
function isInArrayIndex(path: NodePath): boolean { return !!path.findParent(p => p.isMemberExpression() && (p.node as any).computed); }
