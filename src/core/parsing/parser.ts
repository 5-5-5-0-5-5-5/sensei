// SPDX-License-Identifier: MIT
import type { ParserOptions } from '@babel/parser';
import { parse as babelParse } from '@babel/parser';
import type { File as BabelFile } from '@babel/types';
import { getMessages } from '@core/messages/index.js';
import { initializeDefaultPlugins } from '@shared/plugins/init.js';
  /* -------------------------- SISTEMA DE PLUGINS - Novo sistema de parsers modular (Fase 1) -------------------------- */
import { getGlobalRegistry } from '@shared/plugins/registry.js';
import * as csstree from 'css-tree';
import { XMLParser } from 'fast-xml-parser';
// Parsers externos leves para outras linguagens
import { parseDocument } from 'htmlparser2';
import { createRequire } from 'module';

import type { DecifrarSintaxeOpts, ParserBabelFileExtra as BabelFileExtra, ParserFunc, ParserOptions as PluginParserOptions, ParserRawAst } from '@';

const { log, logCore, ParserExtraMensagens } = getMessages();

// Contexto global para o arquivo atual durante parsing
let currentParsingArquivo: string | undefined;

/**
 * Helper para setar o arquivo atual durante parsing
 */
function setCurrentParsingFile(file: string | undefined) {
  currentParsingArquivo = file;
}

/**
 * Helper para obter o arquivo atual durante parsing
 */
export function getCurrentParsingFile(): string {
  return currentParsingArquivo || 'desconhecido';
}
const localRequire = createRequire(import.meta.url);

// Mantemos a assinatura retornando BabelFile | null para não quebrar tipos externos, mas
// para linguagens não-Babel geramos um objeto "compat" mínimo com File/Program vazio
// e ast original em senseiExtra.

function parseComBabel(codigo: string, plugins?: string[]): BabelFile | null {
  // Plugins padrão ampliados para cobrir padrões amplamente usados em node_modules
  const defaultPlugins = ['typescript', 'jsx', 'decorators-legacy',
  // Suporte a import attributes/assertions modernos
  'importAttributes', 'importAssertions',
  // Class fields/methods private (comuns em libs modernas)
  'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'optionalChaining', 'nullishCoalescingOperator', 'topLevelAwait'];
  const options: ParserOptions = {
    sourceType: 'unambiguous',
    plugins: (Array.isArray(plugins) ? plugins : defaultPlugins) as ParserOptions['plugins']
  };
  try {
    return babelParse(codigo, options);
  } catch (e) {
    // Mantém comportamento resiliente: parser inválido retorna null (testes esperam isso)
    logCore.erroBabel((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
function wrapMinimal(lang: string, rawAst: ParserRawAst): BabelFileExtra {
  return {
    type: 'File',
    program: {
      type: 'Program',
      body: [],
      sourceType: 'script',
      directives: []
    },
    comments: [],
    tokens: [],
    senseiExtra: {
      lang,
      rawAst
    }
  };
}
function parseComTypeScript(codigo: string, tsx = false) {
  try {
    // Lazy require para reduzir custo quando não necessário
    const ts: typeof import('typescript') = localRequire('typescript');
    const sf = ts.createSourceFile(tsx ? 'file.tsx' : 'file.ts', codigo, ts.ScriptTarget.Latest, /*setParentNodes*/false, tsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    // Retorna AST do TS como extra; suficiente para gerar sentinel no pipeline
    return wrapMinimal(tsx ? 'tsx-tsc' : 'ts-tsc', {
      kind: sf.kind,
      statements: sf.statements?.length ?? 0
    });
  } catch (e) {
    logCore.erroTs((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
function parseComXml(codigo: string) {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@'
    });
    const ast = parser.parse(codigo);
    return wrapMinimal('xml', ast);
  } catch (e) {
    logCore.erroXml((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
function parseComPhp(codigo: string) {
  // Heurística simples para PHP: extrai classes, funções e namespaces
  const classes = Array.from(codigo.matchAll(/\bclass\s+([A-Za-z0-9_]+)/g)).map(m => m[1]);
  const functions = Array.from(codigo.matchAll(/\bfunction\s+([A-Za-z0-9_]+)/g)).map(m => m[1]);
  const namespaces = Array.from(codigo.matchAll(/\bnamespace\s+([A-Za-z0-9_\\]+)/g)).map(m => m[1]);
  log.debug(ParserExtraMensagens.phpParse.replace('{classes}', String(classes.length)).replace('{functions}', String(functions.length)));
  return wrapMinimal('php', {
    classes,
    functions,
    namespaces
  });
}
function parseComPython(codigo: string) {
  // Heurística simples para Python: extrai classes e funções (def)
  const classes = Array.from(codigo.matchAll(/^class\s+([A-Za-z0-9_]+)/gm)).map(m => m[1]);
  const functions = Array.from(codigo.matchAll(/^def\s+([A-Za-z0-9_]+)/gm)).map(m => m[1]);
  log.debug(ParserExtraMensagens.pythonParse.replace('{classes}', String(classes.length)).replace('{functions}', String(functions.length)));
  return wrapMinimal('python', {
    classes,
    functions
  });
}
function parseComHtmlFunc(codigo: string) {
  try {
    const dom = parseDocument(codigo, {
      xmlMode: false
    });
    return wrapMinimal('html', dom as unknown as ParserRawAst);
  } catch (e) {
    logCore.erroHtml((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
function parseComVue(codigo: string) {
  try {
    // Extrair blocos do arquivo Vue
    const templateMatch = codigo.match(/<template\b[^>]*>([\s\S]*?)<\/template\b[^>]*>/i);
    const scriptMatch = codigo.match(/<script\b[^>]*>([\s\S]*?)<\/script\b[^>]*>/i);
    const styleMatch = codigo.match(/<style\b[^>]*>([\s\S]*?)<\/style\b[^>]*>/i);
    const template = templateMatch ? templateMatch[1].trim() : '';
    const script = scriptMatch ? scriptMatch[1].trim() : '';
    const style = styleMatch ? styleMatch[1].trim() : '';

    // Analisar script como TypeScript/JavaScript se presente
    if (script) {
      try {
        babelParse(script, {
          sourceType: 'module',
          plugins: ['typescript', 'jsx'],
          allowImportExportEverywhere: true
        });
      } catch {
        // Fallback para JS se TS falhar
        try {
          babelParse(script, {
            sourceType: 'module',
            plugins: ['jsx'],
            allowImportExportEverywhere: true
          });
        } catch {
          // Ignorar erros de parsing do script
        }
      }
    }

    // Analisar template como HTML se presente
    if (template) {
      try {
        parseDocument(template, {
          xmlMode: false
        });
      } catch {
        // Ignorar erros de parsing do template
      }
    }

    // Analisar style como CSS se presente
    if (style) {
      try {
        csstree.parse(style, {
          positions: false
        });
      } catch {
        // Ignorar erros de parsing do style
      }
    }
    return wrapMinimal('vue', {
      template: template ? 'present' : null,
      script: script ? 'present' : null,
      style: style ? 'present' : null,
      hasTemplate: !!template,
      hasScript: !!script,
      hasStyle: !!style,
      templateContent: template,
      scriptContent: script,
      styleContent: style
    });
  } catch (e) {
    logCore.erroHtml((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
function parseComCss(codigo: string) {
  try {
    const ast = csstree.parse(codigo, {
      positions: false
    });
    return wrapMinimal('css', ast);
  } catch (e) {
    logCore.erroCss((e as Error).message, getCurrentParsingFile());
    return null;
  }
}
export const PARSERS = new Map<string, ParserFunc>([['.js', parseComBabel], ['.jsx', parseComBabel], ['.ts', parseComBabel], ['.tsx', parseComBabel], ['.mjs', parseComBabel], ['.cjs', parseComBabel],
// Evitamos .d.ts explicitamente: não há AST útil para nossas análises
['.d.ts', () => null], ['.xml', parseComXml], ['.html', parseComHtmlFunc], ['.htm', parseComHtmlFunc], ['.vue', parseComVue], ['.css', parseComCss], ['.php', parseComPhp], ['.py', parseComPython]]);
export const EXTENSOES_SUPORTADAS = Array.from(PARSERS.keys()).filter(ext => ext !== '.d.ts');
export async function decifrarSintaxe(codigo: string, ext: string, opts: DecifrarSintaxeOpts = {}): Promise<BabelFile | null> {
  // Setar arquivo atual para logs de erro
  setCurrentParsingFile(opts.relPath);
  const parser = PARSERS.get(ext);
  if (!parser) {
    logCore.nenhumParser(ext);
    return null;
  }

  // Curto-circuito para TS/TSX: se o chamador forneceu plugins e eles não incluem 'typescript'
  // (ou incluem 'flow'), evitamos Babel para não aceitar sintaxe TS como Flow e forçamos o
  // compilador do TypeScript. Isso garante ast.senseiExtra.lang = 'ts-tsc'|'tsx-tsc'.
  if (ext === '.ts' || ext === '.tsx') {
    const p = opts.plugins;
    if (Array.isArray(p)) {
      const lower = p.map(x => String(x).toLowerCase());
      const hasTs = lower.includes('typescript');
      const hasFlow = lower.includes('flow');
      if (!hasTs || hasFlow) {
        const tsx = ext === '.tsx';
        const tsParsed = parseComTypeScript(codigo, tsx);
        if (tsParsed) {
          setCurrentParsingFile(undefined);
          return Promise.resolve(tsParsed as unknown as BabelFile);
        }
        // Se o compilador TS falhar, caímos no fluxo normal para tentar Babel
      }
    }
  }

  // Primeira tentativa com plugins padrão (ou fornecidos)
  let parseResultado;
  if (parser === parseComBabel) {
    parseResultado = parseComBabel(codigo, opts.plugins);
  } else {
    parseResultado = parser(codigo, opts.plugins);
  }
  // Fallbacks específicos para .js/.mjs: tentar Flow quando a primeira tentativa falhar
  if (parseResultado == null && (ext === '.js' || ext === '.mjs' || ext === '.cjs')) {
    try {
      // Heurística rápida: detecta uso de Flow
      const pareceFlow = /@flow\b/.test(codigo) || /\bimport\s+type\b/.test(codigo);
      if (pareceFlow) {
        const flowPlugins = ['flow', 'jsx', 'decorators-legacy', 'importAttributes', 'importAssertions', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'optionalChaining', 'nullishCoalescingOperator', 'topLevelAwait'];
        parseResultado = parseComBabel(codigo, flowPlugins);
      }
      // Se ainda nulo e não parece Flow, tenta um conjunto "JS moderno" sem TypeScript (para .js puros)
      if (parseResultado == null) {
        const jsModernPlugins = ['jsx', 'decorators-legacy', 'importAttributes', 'importAssertions', 'classProperties', 'classPrivateProperties', 'classPrivateMethods', 'optionalChaining', 'nullishCoalescingOperator', 'topLevelAwait'];
        parseResultado = parseComBabel(codigo, jsModernPlugins);
      }
    } catch {
      // mantém null
    }
  }

  // Fallback usando TypeScript compiler quando Babel falhar em .ts/.tsx
  if (parseResultado == null && (ext === '.ts' || ext === '.tsx')) {
    const tsx = ext === '.tsx';
    const tsParsed = parseComTypeScript(codigo, tsx);
    if (tsParsed) {
      setCurrentParsingFile(undefined);
      return Promise.resolve(tsParsed as unknown as BabelFile);
    }
  }

  // Caso especial: se plugins foram passados e o parser de .ts/.tsx retornou null,
  // força fallback para o compilador TS (cobre cenários de plugins conflitantes como 'flow').
  if (parseResultado == null && opts.plugins && (ext === '.ts' || ext === '.tsx')) {
    const tsx = ext === '.tsx';
    const tsParsed = parseComTypeScript(codigo, tsx);
    if (tsParsed) {
      setCurrentParsingFile(undefined);
      return Promise.resolve(tsParsed as unknown as BabelFile);
    }
  }
  if (opts.timeoutMs) {
    return (async () => {
      let timer: NodeJS.Timeout | null = null;
      try {
        const race = Promise.race([Promise.resolve(parseResultado), new Promise<null>(resolve => {
          timer = setTimeout(() => {
            logCore.timeoutParsing(opts.timeoutMs || 0, ext);
            resolve(null);
          }, opts.timeoutMs);
        })]);
        return await race;
      } finally {
        if (timer) clearTimeout(timer);
        setCurrentParsingFile(undefined);
      }
    })();
  }

  // Se ainda assim for null, normalize para null explícito
  setCurrentParsingFile(undefined);
  return Promise.resolve(parseResultado ?? null);
}
function initializePluginSystem() {
  const registry = getGlobalRegistry();

  // Registra todos os plugins padrão se ainda não foram registrados
  const registeredPlugins = registry.getRegisteredPlugins();
  if (registeredPlugins.length === 0) {
    initializeDefaultPlugins();
    log.debug(ParserExtraMensagens.pluginsRegistrados);
  }
}

/**
 * Parse usando o novo sistema de plugins (API futura)
 * Mantém compatibilidade com sistema atual
 */

export async function parseComPlugins(codigo: string, extensao: string, opts?: PluginParserOptions): Promise<BabelFile | null> {
  try {
    initializePluginSystem();
    const registry = getGlobalRegistry();
    const plugin = await registry.getPluginForExtension(extensao);
    if (!plugin) {
      logCore.pluginNaoEncontrado(extensao);
      // Fallback para sistema atual usando a função exportada
      return await decifrarSintaxe(codigo, extensao, {
        plugins: opts?.plugins,
        timeoutMs: opts?.timeoutMs
      });
    }
    logCore.usandoPlugin(plugin.name, extensao);
    const pluginOpts: PluginParserOptions = {
      ...opts,
      pluginConfig: {
        ...opts?.pluginConfig,
        extension: extensao
      }
    };
    const result = await plugin.parse(codigo, pluginOpts);
    return result;
  } catch (error) {
    logCore.sistemaPluginsFalhou((error as Error).message);
    // Fallback para sistema atual em caso de erro
    return await decifrarSintaxe(codigo, extensao, {
      plugins: opts?.plugins,
      timeoutMs: opts?.timeoutMs
    });
  }
}

/**
 * Obtém estatísticas do sistema de plugins
 */

export function getPluginStats(): {
  pluginsRegistrados: number;
  extensoesSuportadas: number;
  sistemAtivojava: boolean;
} {
  try {
    initializePluginSystem();
    const registry = getGlobalRegistry();
    const stats = registry.getStats();
    return {
      pluginsRegistrados: stats.pluginsRegistrados,
      extensoesSuportadas: stats.extensoesSuportadas,
      sistemAtivojava: stats.pluginsRegistrados > 0
    };
  } catch {
    return {
      pluginsRegistrados: 0,
      extensoesSuportadas: 0,
      sistemAtivojava: false
    };
  }
}
