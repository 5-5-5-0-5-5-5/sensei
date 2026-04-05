// SPDX-License-Identifier: MIT
// @sensei-disable seguranca vulnerabilidade-seguranca
import type { NodePath } from '@babel/traverse';
import type { CallExpression, NewExpression, Node } from '@babel/types';
import { traverse } from '@core/config/traverse.js';
import { DetectorAgregadosMensagens } from '@core/messages/pt/analistas/detector-agregados-messages.js';
import { detectarContextoProjeto } from '@shared/contexto-projeto.js';
import { agruparPor } from '@shared/helpers/agrupar.js';
import { detectarSegredosHardcoded } from '@shared/helpers/detectores-comuns.js';
import { splitLines } from '@shared/helpers/lines.js';
import { criarErroAnalise } from '@shared/helpers/ocorrencias.js';
import { filtrarOcorrenciasSuprimidas } from '@shared/helpers/suppressao.js';

import type { Analista, Ocorrencia, ProblemaSeguranca } from '@';
import { criarOcorrencia } from '@';

export const analistaSeguranca: Analista = {
  nome: 'seguranca',
  categoria: 'seguranca',
  descricao: 'Detecta vulnerabilidades e práticas inseguras no código',
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
    const problemas: ProblemaSeguranca[] = [];
    try {
      // Detectar problemas por padrões de texto (mais confiável que AST para alguns casos)
      detectarPadroesPerigosos(src, relPath, problemas);

      // Detectar problemas via AST quando disponível
      if (ast) {
        detectarProblemasAST(ast, problemas);
      }

      // Converter para ocorrências
      const ocorrencias: Ocorrencia[] = [];

      // Agrupar por severidade
      const porSeveridade = agruparPor(problemas, p => p.severidade);
      for (const [severidade, items] of Object.entries(porSeveridade)) {
        if (items.length > 0) {
          const nivel = mapearSeveridadeParaNivel(severidade as ProblemaSeguranca['severidade']);

          // Ajustar severidade baseado no contexto
          const nivelAjustado = contextoArquivo.isTest && nivel === 'aviso' ? 'info' : nivel;
          const resumo = items.slice(0, 3).map(p => p.tipo).join(', ');
          ocorrencias.push(criarOcorrencia({
            tipo: 'vulnerabilidade-seguranca',
            nivel: nivelAjustado,
            mensagem: DetectorAgregadosMensagens.problemasSegurancaResumo(severidade, resumo, items.length),
            relPath,
            linha: items[0].linha
          }));
        }
      }

      // Aplicar supressões inline antes de retornar
      return filtrarOcorrenciasSuprimidas(ocorrencias, 'seguranca', src);
    } catch (erro) {
      return [criarErroAnalise(relPath, DetectorAgregadosMensagens.erroAnalisarSeguranca(erro))];
    }
  }
};
function detectarPadroesPerigosos(src: string, relPath: string, problemas: ProblemaSeguranca[]): void {
  const linhas = splitLines(src);
  function isLikelyHttpHeaderName(value: string): boolean {
    const headerValue = String(value || '').trim();
    if (!headerValue) return false;
    // Header names geralmente são curtos/médios e usam letras/números/hífens.
    if (headerValue.length < 4 || headerValue.length > 80) return false;
    if (!/^[A-Za-z0-9-]+$/.test(headerValue)) return false;
    if (headerValue.startsWith('-') || headerValue.endsWith('-')) return false;
    // Heurística: costuma ter hífen (ex.: Content-Type) e, muitas vezes, prefixo X-
    if (!/-/.test(headerValue) && !/^X[A-Za-z]?/.test(headerValue)) return false;
    return true;
  }
  function isHttpHeadersKeyValueContext(index: number): boolean {
    const start = Math.max(0, index - 12);
    const end = Math.min(linhas.length, index + 6);
    const ctx = linhas.slice(start, end).join('\n');
    const hasHeaders = /\bheaders\b\s*[:=]/i.test(ctx) || /\bheader\b/i.test(ctx);
    const hasValorProp = /\bvalue\b\s*[:=]/i.test(ctx);
    return hasHeaders && hasValorProp;
  }

  // Detecção de segredos hardcoded via helper compartilhado
  const segredos = detectarSegredosHardcoded(src, relPath);
  segredos.forEach(s => {
    // Redução de falsos positivos específica para detector-seguranca: headers HTTP
    if (s.campo === 'key' && isLikelyHttpHeaderName(s.valor) && isHttpHeadersKeyValueContext(s.linha - 1)) {
      return;
    }

    problemas.push({
      tipo: 'hardcoded-secrets',
      descricao: `Credencial hardcoded (${s.campo}) no código pode ser exposta`,
      severidade: s.confianca === 'alta' ? 'critica' : 'alta',
      linha: s.linha,
      sugestao: 'Use variáveis de ambiente ou arquivo de configuração seguro'
    });
  });

  linhas.forEach((linha, index) => {
    const numeroLinha = index + 1;

    // Ignorar comentários, strings e regex patterns para reduzir falsos positivos
    const linhaSemComentarios = linha.replace(/\/\/.*$/, '').replace(/\/\*.*?\*\//, '');
    const linhaSemStrings = linhaSemComentarios.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '').replace(/`[^`]*`/g, '').replace(/\/[^\/]*\//g, '');

    // eval() usage - apenas em código real, não em comentários/strings/regex
    if (/\beval\s*\(/.test(linhaSemStrings)) {
      problemas.push({
        tipo: 'eval-usage',
        descricao: 'Uso de eval() pode executar código malicioso',
        severidade: 'critica',
        linha: numeroLinha,
        sugestao: 'Use JSON.parse() ou funções específicas ao invés de eval()'
      });
    }

    // dangerouslySetInnerHTML - React security risk
    if (/dangerouslySetInnerHTML\s*[:=]/.test(linhaSemStrings)) {
      problemas.push({
        tipo: 'dangerously-set-inner-html',
        descricao: 'Uso de dangerouslySetInnerHTML pode causar XSS se o conteúdo não for sanitizado',
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Use sanitize-html ou DOMPurify para limpar o conteúdo antes de renderizar'
      });
    }

    // innerHTML com variáveis
    if (/\.(innerHTML|outerHTML)\s*=\s*[^"']/.test(linha)) {
      problemas.push({
        tipo: 'dangerous-html',
        descricao: `${linha.includes('outerHTML') ? 'outerHTML' : 'innerHTML'} com variáveis pode causar XSS`,
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Use textContent ou sanitize o HTML antes de inserir'
      });
    }

    // document.write usage
    if (/\bdocument\.write(ln)?\s*\(/.test(linhaSemStrings)) {
      problemas.push({
        tipo: 'xss-vulnerability',
        descricao: 'Uso de document.write() é perigoso e pode causar XSS',
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Use manipulação de DOM segura (createElement, appendChild, etc.)'
      });
    }

    // SQL Injection patterns
    if (/\.(query|execute|raw|queryRaw|executeRaw)\s*\(/.test(linha) &&
        (/req\.|params\.|query\.|body\./.test(linha) || /\$\{.*\}/.test(linha) || /\s\+\s/.test(linha))) {
      // Ignorar se parecer que está usando parâmetros (ex: ?, $1, :name)
      const temParametros = /['"`].*(\?|\$\d|:\w+).*['"`]/.test(linha);
      if (!temParametros) {
        problemas.push({
          tipo: 'sql-injection',
          descricao: 'Possível SQL Injection ao concatenar variáveis em query',
          severidade: 'critica',
          linha: numeroLinha,
          sugestao: 'Use queries parametrizadas ou ORM com suporte a escaping'
        });
      }
    }

    // Command Injection
    if (/\b(exec|execSync|spawn|spawnSync)\s*\(/.test(linha) && /req\.|params\.|query\.|body\./.test(linha)) {
      problemas.push({
        tipo: 'command-injection',
        descricao: 'Execução de comandos com input do usuário pode causar Command Injection',
        severidade: 'critica',
        linha: numeroLinha,
        sugestao: 'Evite executar comandos shell com input do usuário; use APIs específicas ou valide rigorosamente'
      });
    }

    // Insecure cookie settings
    if (/\.cookie\s*\(/.test(linha) && !/req\.cookie|request\.cookie/.test(linha) && !/httpOnly\s*:\s*true/.test(linha)) {
      problemas.push({
        tipo: 'insecure-cookie',
        descricao: 'Cookie configurado sem a flag httpOnly (detectado via padrão de texto)',
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Sempre use httpOnly: true para evitar acesso via JavaScript (XSS). Se estiver usando configuração multi-line, o detector AST cuidará da validação.'
      });
    }

    // Redirecionamentos inseguros
    if (/\.(assign|replace|href)\s*=\s*.*(req\.|params\.|query\.|body\.)/.test(linha)) {
      problemas.push({
        tipo: 'xss-vulnerability',
        descricao: 'Redirecionamento dinâmico com input do usuário pode causar Open Redirect ou XSS',
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Valide a URL de destino contra uma whitelist antes de redirecionar'
      });
    }

    // Math.random() para criptografia
    if (/Math\.random\(\)/.test(linha) && /crypto|password|token|secret/i.test(linha)) {
      problemas.push({
        tipo: 'weak-crypto',
        descricao: 'Math.random() não é seguro para criptografia',
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Use crypto.randomBytes() ou crypto.getRandomValues()'
      });
    }

    // Exposure of sensitive environment variables
    if (/\b(console\.log|console\.debug|console\.info|res\.send|res\.json|res\.write|reply\.send)\s*\(.*(process\.env\.(PASSWORD|SECRET|TOKEN|KEY|API|PWD|AUTH|CREDENTIALS|DB|PASS|STRIPE|AWS|PRIVATE))/i.test(linha)) {
      problemas.push({
        tipo: 'sensitive-env-exposure',
        descricao: 'Possível exposição de variável de ambiente sensível em log ou resposta',
        severidade: 'critica',
        linha: numeroLinha,
        sugestao: 'Nunca exponha variáveis de ambiente que contenham segredos em logs ou respostas'
      });
    }

    // Algoritmos de hash fracos
    if (/createHash\s*\(\s*['"`](md5|md4|sha1)['"`]\s*\)/.test(linha)) {
      const algoritmo = /createHash\s*\(\s*['"`](md5|md4|sha1)['"`]\s*\)/.exec(linha)?.[1];

      // Verificar se há comentário justificando o uso (ex: fingerprinting, não-criptográfico)
      const linhaAnterior = index > 0 ? linhas[index - 1] : '';
      const linha2Atras = index > 1 ? linhas[index - 2] : '';
      const comentarioContexto = linhaAnterior + linha2Atras;
      const temJustificativa = /fingerprint|cache|baseline|perf|não.*segurança|not.*security|não.*criptograf/i.test(comentarioContexto) || /apenas.*identifica|only.*identif|deduplica/i.test(comentarioContexto);
      if (!temJustificativa) {
        problemas.push({
          tipo: 'weak-crypto',
          descricao: `Algoritmo de hash ${algoritmo?.toUpperCase()} é considerado fraco`,
          severidade: 'alta',
          linha: numeroLinha,
          sugestao: 'Use SHA-256 ou superior: createHash("sha256") - ou adicione comentário se for apenas fingerprinting'
        });
      }
    }

    // RegExp com input do usuário
    if (/new RegExp\s*\([^)]*\)/.test(linha) && /req\.|params\.|query\.|body\./.test(linha)) {
      problemas.push({
        tipo: 'unsafe-regex',
        descricao: 'RegExp com input não validado pode causar ReDoS',
        severidade: 'media',
        linha: numeroLinha,
        sugestao: 'Valide e escape o input antes de usar em RegExp'
      });
    }

    // Dangerous literal regex (heuristic for ReDoS)
    const regexLiteralMatch = linha.match(/\/([^\/\\]|\\.)+\/[gimuy]*/);
    if (regexLiteralMatch) {
      const pattern = regexLiteralMatch[0];
      // Heurística para quantificadores aninhados ou repetitivos que causam backtracking catastrófico
      // Foca em padrões como (a+)+, (.*)*, (.+)+ e .*.* ou .+ .+
      // Ignora padrões seguros como [\s\S]*? (usados em parsers)
      const isParserLoop = /[\s\S]*?\//.test(pattern) || /[\s\S]*?/.test(pattern);
      if (!isParserLoop && (/(\([^)]+\+?\)\+|\([^)]+\+?\)\*|(\.\*){2,}|(\.\+){2,}|([a-zA-Z0-9])\+\+)/.test(pattern) || /\[[^\]]+\]\+\+/.test(pattern))) {
        problemas.push({
          tipo: 'unsafe-regex-literal',
          descricao: 'Regex literal detectada com padrão potencialmente vulnerável a ReDoS',
          severidade: 'media',
          linha: numeroLinha,
          sugestao: 'Revise o padrão para evitar quantificadores aninhados ou curingas repetitivos (.*.*). Se necessário, adicione @sensei-disable.'
        });
      }
    }

    // __proto__ manipulation - evitar falsos positivos em strings/comentários
    if (/__proto__/.test(linhaSemStrings)) {
      problemas.push({
        tipo: 'prototype-pollution',
        descricao: 'Manipulação de __proto__ pode causar prototype pollution',
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Use Object.create(null) ou Object.setPrototypeOf() com cuidado'
      });
    }

    // Path traversal patterns
    if (/\.\.\//g.test(linha) && /req\.|params\.|query\./.test(linha)) {
      problemas.push({
        tipo: 'path-traversal',
        descricao: 'Possível vulnerabilidade de path traversal',
        severidade: 'alta',
        linha: numeroLinha,
        sugestao: 'Sanitize caminhos de arquivo e use path.resolve() com cuidado'
      });
    }
  });

  // Detectar async/await sem try-catch (melhoria exclusiva)
  detectarAsyncSemTryCatch(src, problemas);
}

/**
 * Detecta uso de async/await sem tratamento adequado de erro
 */
function detectarAsyncSemTryCatch(src: string, problemas: ProblemaSeguranca[]): void {
  const lines = splitLines(src);

  // Contexto global do arquivo para detectar padrões do Next.js
  const isNextJsServerComponent = /^['"](use server|use client)['"]/.test(src.trim()) || /export\s+(default\s+)?async\s+function/.test(src);
  const hasDynamicImport = /next\/dynamic|import\s*\(/.test(src);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Detectar await sem try-catch
    if (/\bawait\s+/.test(line) && !trimmedLine.startsWith('//')) {
      // Verificar contexto expandido para detectar event handlers
      const contextLines = lines.slice(Math.max(0, i - 10), i);
      const context = contextLines.join(' ');

      // Detectar se está dentro de event handler (fire-and-forget por design)
      const isEventHandler = /\.on\s*\(/.test(context) || /\.once\s*\(/.test(context) || /addEventListener\s*\(/.test(context) || /collector\.on\s*\(/.test(context) || /emitter\.on\s*\(/.test(context) || /process\.on\s*\(/.test(context);

      // Verificar se é dynamic import do Next.js (tratamento gerenciado pelo framework)
      const isDynamicImport = hasDynamicImport && (/import\s*\(/.test(line) || /dynamic\s*\(/.test(context));

      // Server Components do Next.js: tratamento gerenciado pelo framework
      if (isNextJsServerComponent || isDynamicImport) {
        continue;
      }

      // Verificar se há try-catch em escopo expandido (100 linhas antes/depois)
      const extendedContext = lines.slice(Math.max(0, i - 100), Math.min(lines.length, i + 100));
      const fullContext = extendedContext.join('\n');

      // Detectar try-catch em escopo pai (bloco que envolve o await)
      const hasErroHandling = /try\s*\{[\s\S]*?\}\s*catch/.test(fullContext) || /\.catch\s*\(/.test(line) || /\.catch\s*\(/.test(lines[i + 1] || '') ||
      // Promise encadeada com .then().catch()
      /\.then\s*\([^)]*\)\s*\.catch/.test(fullContext);
      if (!hasErroHandling) {
        problemas.push({
          tipo: isEventHandler ? 'unhandled-async-event' : 'unhandled-async',
          descricao: isEventHandler ? 'await em event handler sem tratamento de erro (considere adicionar .catch se necessário)' : 'await sem tratamento de erro pode causar crashes não tratados',
          severidade: isEventHandler ? 'baixa' : 'media',
          linha: i + 1,
          sugestao: isEventHandler ? 'Event handlers são fire-and-forget. Adicione .catch() apenas se precisar tratar erros específicos' : 'Envolva em try-catch ou use .catch() na Promise'
        });
      }
    }
  }
}
function detectarProblemasAST(ast: NodePath<Node>, problemas: ProblemaSeguranca[]): void {
  try {
    traverse(ast.node, {
      // Detectar Function constructor
      NewExpression(path: NodePath<NewExpression>) {
        if (path.node.callee.type === 'Identifier' && path.node.callee.name === 'Function') {
          problemas.push({
            tipo: 'eval-usage',
            descricao: 'Function constructor pode executar código dinâmico',
            severidade: 'alta',
            linha: path.node.loc?.start.line || 0,
            sugestao: 'Evite Function constructor, use funções declaradas'
          });
        }
      },
      // Detectar chamadas perigosas
      CallExpression(path: NodePath<CallExpression>) {
        const callee = path.node.callee;
        const args = path.node.arguments;

        // 1. setTimeout/setInterval com strings
        if (callee.type === 'Identifier' && ['setTimeout', 'setInterval'].includes(callee.name) && args[0]?.type === 'StringLiteral') {
          problemas.push({
            tipo: 'eval-usage',
            descricao: 'setTimeout/setInterval com string executa código dinâmico',
            severidade: 'media',
            linha: path.node.loc?.start.line || 0,
            sugestao: 'Use função ao invés de string'
          });
        }

        // 2. res.cookie() sem httpOnly
        if (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            callee.property.name === 'cookie') {

          const object = callee.object;
          const isRequest = object.type === 'Identifier' && (object.name === 'req' || object.name === 'request');

          if (!isRequest) {
            // Heurística: assume-se que se não é req/request, é provável ser a resposta (res)
            const options = args[2];
            let hasHttpOnly = false;
            if (options && options.type === 'ObjectExpression') {
              hasHttpOnly = options.properties.some(prop =>
                prop.type === 'ObjectProperty' &&
                prop.key.type === 'Identifier' &&
                prop.key.name === 'httpOnly' &&
                (prop.value.type === 'BooleanLiteral' ? prop.value.value === true : false)
              );
            }

            if (!hasHttpOnly) {
              problemas.push({
                tipo: 'insecure-cookie',
                descricao: 'Cookie configurado sem a flag httpOnly',
                severidade: 'media',
                linha: path.node.loc?.start.line || 0,
                sugestao: 'Sempre use httpOnly: true para evitar acesso via JavaScript (XSS)'
              });
            }
          }
        }

        // 3. SQL Injection (básico via AST)
        if (callee.type === 'MemberExpression' &&
            callee.property.type === 'Identifier' &&
            ['query', 'execute', 'raw', 'queryRaw', 'executeRaw'].includes(callee.property.name)) {

          const firstArg = args[0];
          // Se o primeiro argumento é uma TemplateLiteral com expressões ou uma BinaryExpression (+)
          const isUnsafe = firstArg && (
            (firstArg.type === 'TemplateLiteral' && firstArg.expressions.length > 0) ||
            (firstArg.type === 'BinaryExpression' && firstArg.operator === '+')
          );

          if (isUnsafe) {
            // Verificar se parece usar parâmetros de qualquer forma
            const code = firstArg.type === 'TemplateLiteral' ? firstArg.quasis.map(q => q.value.raw).join('') : '';
            const temParametros = /['"`].*(\?|\$\d|:\w+).*['"`]/.test(code);

            if (!temParametros) {
              problemas.push({
                tipo: 'sql-injection',
                descricao: 'Possível SQL Injection detectada via AST (concatenação no primeiro argumento)',
                severidade: 'critica',
                linha: path.node.loc?.start.line || 0,
                sugestao: 'Use queries parametrizadas ao invés de concatenar strings ou template literals com variáveis'
              });
            }
          }
        }
      }
    });
  } catch {
    // Ignorar erros de traverse para não quebrar a análise
  }
}
function mapearSeveridadeParaNivel(severidade: ProblemaSeguranca['severidade']): 'info' | 'aviso' | 'erro' {
  switch (severidade) {
    case 'critica':
    case 'alta':
      return 'erro';
    case 'media':
      return 'aviso';
    case 'baixa':
    default:
      return 'info';
  }
}
