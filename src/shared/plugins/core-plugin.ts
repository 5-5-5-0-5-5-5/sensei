// SPDX-License-Identifier: MIT
import type { ParserOptions as BabelParserOptions } from '@babel/parser';
import { parse as babelParse } from '@babel/parser';
import type { File as BabelFile } from '@babel/types';
import { getMessages , PluginCoreMensagens } from '@core/messages/index.js';
import { getCurrentParsingFile } from '@core/parsing/parser.js';
import * as csstree from 'css-tree';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import { parseDocument } from 'htmlparser2';
import { createRequire } from 'module';

import type { BabelFileExtra, ParserOptions, ParserPlugin, RawAst } from '@';

const { log, logCore } = getMessages();

const localRequire = createRequire(import.meta.url);

/**
 * Plugin core do Prometheus - contém parsers para linguagens principais
 * JavaScript, TypeScript, HTML, CSS, XML
 */
export class CorePlugin implements ParserPlugin {
  name = 'core';
  version = '0.2.0';
  extensions = [
    '.js',
    '.jsx',
    '.ts',
    '.tsx',
    '.mjs',
    '.cjs',
    '.html',
    '.htm',
    '.css',
    '.xml',
    '.php',
    '.py',
    '.d.ts', // tratado especialmente (retorna null)
  ];

  async parse(codigo: string, opts?: ParserOptions): Promise<BabelFile | null> {
    // Determina extensão baseada no contexto ou configuração
    const ext = this.inferExtension(codigo, opts);

    switch (ext) {
      case '.js':
      case '.jsx':
      case '.mjs':
      case '.cjs':
        return this.parseJavaScript(codigo, opts);

      case '.ts':
      case '.tsx':
        return this.parseTypeScript(codigo, opts);

      case '.d.ts':
        // Arquivos de definição não têm AST útil
        return null;

      case '.html':
      case '.htm':
        return this.parseHtml(codigo);

      case '.css':
        return this.parseCss(codigo);

      case '.xml':
        return this.parseXml(codigo);

      case '.php':
        return this.parsePhp(codigo);

      case '.py':
        return this.parsePython(codigo);

      default:
        logCore.extensaoNaoSuportada(ext);
        return null;
    }
  }

  /**
   * Parse JavaScript com suporte a Flow e fallbacks
   */
  private parseJavaScript(
    codigo: string,
    opts?: ParserOptions,
  ): BabelFile | null {
    // Primeira tentativa com plugins padrão
    let result = this.parseComBabel(codigo, opts?.plugins);

    if (result === null) {
      // Heurística Flow
      const pareceFlow =
        /@flow\b/.test(codigo) || /\bimport\s+type\b/.test(codigo);
      if (pareceFlow) {
        const flowPlugins = [
          'flow',
          'jsx',
          'decorators-legacy',
          'importAttributes',
          'importAssertions',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'optionalChaining',
          'nullishCoalescingOperator',
          'topLevelAwait',
        ];
        result = this.parseComBabel(codigo, flowPlugins);
      }

      // Fallback JS moderno sem TypeScript
      if (result === null) {
        const jsModernPlugins = [
          'jsx',
          'decorators-legacy',
          'importAttributes',
          'importAssertions',
          'classProperties',
          'classPrivateProperties',
          'classPrivateMethods',
          'optionalChaining',
          'nullishCoalescingOperator',
          'topLevelAwait',
        ];
        result = this.parseComBabel(codigo, jsModernPlugins);
      }
    }

    return result;
  }

  /**
   * Parse TypeScript com fallback para compilador TS
   */
  private parseTypeScript(
    codigo: string,
    opts?: ParserOptions,
  ): BabelFile | null {
    const ext = this.inferExtension(codigo, opts);
    const isTsx = ext === '.tsx';

    // Primeira tentativa com Babel
    let result = this.parseComBabel(codigo, opts?.plugins);

    // Fallback para TypeScript compiler
    if (result === null) {
      result = this.parseComTypeScriptCompiler(codigo, isTsx);
    }

    return result;
  }

  /**
   * Parse com Babel (método base)
   */
  private parseComBabel(codigo: string, plugins?: string[]): BabelFile | null {
    const defaultPlugins = [
      'typescript',
      'jsx',
      'decorators-legacy',
      'importAttributes',
      'importAssertions',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'optionalChaining',
      'nullishCoalescingOperator',
      'topLevelAwait',
    ];

    const options: BabelParserOptions = {
      sourceType: 'unambiguous',
      plugins: (Array.isArray(plugins)
        ? plugins
        : defaultPlugins) as BabelParserOptions['plugins'],
    };

    try {
      return babelParse(codigo, options);
    } catch (e) {
      logCore.erroBabel((e as Error).message, getCurrentParsingFile());
      return null;
    }
  }

  /**
   * Fallback usando TypeScript compiler
   */
  private parseComTypeScriptCompiler(
    codigo: string,
    tsx = false,
  ): BabelFile | null {
    try {
      const ts: typeof import('typescript') = localRequire('typescript');
      const sf = ts.createSourceFile(
        tsx ? 'file.tsx' : 'file.ts',
        codigo,
        ts.ScriptTarget.Latest,
        false,
        tsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
      );

      return this.wrapMinimal(tsx ? 'tsx-tsc' : 'ts-tsc', {
        kind: sf.kind,
        statements: sf.statements?.length ?? 0,
      });
    } catch (e) {
      logCore.erroTs((e as Error).message, getCurrentParsingFile());
      return null;
    }
  }

  /**
   * Parse HTML
   */
  private parseHtml(codigo: string): BabelFile | null {
    try {
      const dom = parseDocument(codigo, { xmlMode: false });
      return this.wrapMinimal('html', dom);
    } catch (e) {
      logCore.erroHtml((e as Error).message, getCurrentParsingFile());
      return null;
    }
  }

  /**
   * Parse CSS
   */
  private parseCss(codigo: string): BabelFile | null {
    try {
      const ast = csstree.parse(codigo, { positions: false });
      return this.wrapMinimal('css', ast);
    } catch (e) {
      logCore.erroCss((e as Error).message, getCurrentParsingFile());
      return null;
    }
  }

  /**
   * Parse XML
   */
  private parseXml(codigo: string): BabelFile | null {
    try {
      // Validação prévia para garantir que XML malformado retorne null (conforme testes)
      const isValid = XMLValidator.validate(codigo);
      if (isValid !== true) {
        log.debug(
          `⚠️ XML inválido: ${typeof isValid === 'object' ? (isValid as { err?: { msg?: string } }).err?.msg : 'desconhecido'}`,
        );
        return null;
      }
      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@',
      });
      const ast = parser.parse(codigo);
      return this.wrapMinimal('xml', ast);
    } catch (e) {
      logCore.erroXml((e as Error).message, getCurrentParsingFile());
      return null;
    }
  }

  /**
   * Parse PHP
   */
  private parsePhp(codigo: string): BabelFile | null {
    try {
      // Heurística simples para PHP: extrai classes, funções e namespaces
      const classes = Array.from(
        codigo.matchAll(/\bclass\s+([A-Za-z0-9_]+)/g),
      ).map((m) => m[1]);
      const functions = Array.from(
        codigo.matchAll(/\bfunction\s+([A-Za-z0-9_]+)/g),
      ).map((m) => m[1]);
      const namespaces = Array.from(
        codigo.matchAll(/\bnamespace\s+([A-Za-z0-9_\\]+)/g),
      ).map((m) => m[1]);
      const msgPhp = PluginCoreMensagens.phpParse;
      log.debug(
        msgPhp.replace('{classes}', String(classes.length)).replace('{funcoes}', String(functions.length)),
      );
      return this.wrapMinimal('php', { classes, functions, namespaces });
    } catch (e) {
      const msgErro = PluginCoreMensagens.phpErro;
      log.debug(msgErro.replace('{erro}', (e as Error).message));
      return null;
    }
  }

  /**
   * Parse Python
   */
  private parsePython(codigo: string): BabelFile | null {
    try {
      // Heurística simples para Python: extrai classes e funções (def)
      const classes = Array.from(
        codigo.matchAll(/^class\s+([A-Za-z0-9_]+)/gm),
      ).map((m) => m[1]);
      const functions = Array.from(
        codigo.matchAll(/^def\s+([A-Za-z0-9_]+)/gm),
      ).map((m) => m[1]);
      const msgPython = PluginCoreMensagens.pythonParse;
      log.debug(
        msgPython.replace('{classes}', String(classes.length)).replace('{funcoes}', String(functions.length)),
      );
      return this.wrapMinimal('python', { classes, functions });
    } catch (e) {
      const msgErro = PluginCoreMensagens.pythonErro;
      log.debug(msgErro.replace('{erro}', (e as Error).message));
      return null;
    }
  }

  /**
   * Wrapper para criar BabelFile compatível com prometheusExtra
   */
  private wrapMinimal(lang: string, rawAst: unknown): BabelFileExtra {
    return {
      type: 'File',
      program: {
        type: 'Program',
        body: [],
        sourceType: 'script',
        directives: [],
      },
      comments: [],
      tokens: [],
      prometheusExtra: { lang, rawAst: rawAst as RawAst },
    };
  }

  /**
   * Infere extensão baseada no código ou opções
   */
  private inferExtension(codigo: string, opts?: ParserOptions): string {
    // Pode ser passado via configuração do plugin
    if (opts?.pluginConfig?.extension) {
      return opts.pluginConfig.extension as string;
    }

    // PHP tem prioridade quando há tag de abertura
    if (/^<\?php/.test(codigo.trim())) {
      return '.php';
    }

    // Python: heurística por imports e definições
    if (/^(import |from .+ import |def |class )/m.test(codigo)) {
      return '.py';
    }

    // Heurísticas simples
    if (/\bfrom\s+['"][^'"]+\.tsx?['"]/.test(codigo) || /<[A-Z]/.test(codigo)) {
      return codigo.includes('interface ') || codigo.includes('type ')
        ? '.tsx'
        : '.jsx';
    }

    if (/\binterface\s+\w+|\btype\s+\w+\s*=/.test(codigo)) {
      return '.ts';
    }

    // XML deve ter prioridade quando há declaração explícita
    if (/^<\?xml/.test(codigo.trim())) {
      return '.xml';
    }

    if (/<[a-z][\w-]*/.test(codigo)) {
      // Heurística: se parecer mais com HTML (sem declaração XML), tratamos como HTML
      return '.html';
    }

    if (/\{[\s\S]*\}/.test(codigo) && /[a-z-]+\s*:/.test(codigo)) {
      return '.css';
    }

    // Default para JS
    return '.js';
  }

  /**
   * Valida se o código parece ser de uma linguagem suportada
   */
  validate(codigo: string): boolean {
    // Validações básicas
    if (!codigo || typeof codigo !== 'string') {
      return false;
    }

    // Não deve ser binário
    if (/[\x00-\x08\x0E-\x1F\x7F]/.test(codigo)) {
      return false;
    }

    return true;
  }
}

// Instância singleton do plugin core
export const corePlugin = new CorePlugin();
