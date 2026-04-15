// SPDX-License-Identifier: MIT

import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';

import type { FormatterFn } from './formatter-registry.js';
import { getFormatterForPath, registerFormatter } from './formatter-registry.js';
import { getSyntaxInfoForPath } from './syntax-map.js';

export type { FormatadorMinimoParser, FormatadorMinimoResult, MarkdownFenceMatch } from '@';
export type { FormatterFn } from './formatter-registry.js';

import { formatarJsonMinimo } from './formatters/json.js';
import { formatarMarkdownMinimo } from './formatters/markdown.js';
import { formatarYamlMinimo } from './formatters/yaml.js';
import { formatarXmlMinimo } from './formatters/xml.js';
import { formatarSvgMinimo } from './formatters/svg.js';
import { formatarHtmlMinimo } from './formatters/html.js';
import { formatarCssMinimo, formatarScssMinimo, formatarLessMinimo } from './formatters/css.js';
import {
  formatarCodeMinimo,
  formatarTypeScriptMinimo,
  formatarJavaScriptMinimo,
  formatarJavaMinimo,
  formatarPythonMinimo,
  formatarPhpMinimo
} from './formatters/code.js';
import { formatarSqlMinimo } from './formatters/sql.js';
import { formatarTomlMinimo, formatarIniMinimo } from './formatters/toml.js';
import { formatarDockerfileMinimo, formatarShellMinimo } from './formatters/dockerfile.js';
import { formatarKotlinMinimo } from './formatters/kotlin.js';
import { formatarGoMinimo } from './formatters/go.js';
import { formatarPropertiesMinimo, formatarGradleMinimo } from './formatters/properties.js';
import { formatarGitignoreMinimo, formatarEditorconfigMinimo, formatarNpmrcMinimo, formatarNvmrcMinimo } from './formatters/dotfiles.js';

import { normalizarFimDeLinha, normalizarNewlinesFinais, removerEspacosFinaisPorLinha } from './formatters/utils.js';

function formatarJson5Minimo(code: string): FormatadorMinimoResult {
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: false,
    parser: 'json5',
  });
}

function formatarJsoncMinimo(code: string): FormatadorMinimoResult {
  return formatarCodeMinimo(code, {
    normalizarSeparadoresDeSecao: false,
    parser: 'json',
  });
}

export function formatarPrettierMinimo(params: {
  code: string;
  relPath?: string;
}): FormatadorMinimoResult {
  const relPath = (params.relPath ?? '').toLowerCase();
  const code = params.code;
  const hasJsonComments = (src: string): boolean => {
    const normalized = normalizarFimDeLinha(src);
    return /(^|\n)\s*\/\//.test(normalized) || /(^|\n)\s*\/\*/.test(normalized);
  };
  if (relPath.endsWith('.json') || relPath.endsWith('.jsonc') || relPath.endsWith('.lock')) {
    if (hasJsonComments(code)) {
      return formatarJsoncMinimo(code);
    }
    return formatarJsonMinimo(code);
  }
  if (relPath.endsWith('.md') || relPath.endsWith('.markdown')) {
    return formatarMarkdownMinimo(code);
  }
  if (relPath.endsWith('.yml') || relPath.endsWith('.yaml')) {
    return formatarYamlMinimo(code);
  }
  if (relPath.endsWith('.ts') || relPath.endsWith('.tsx') || relPath.endsWith('.cts') || relPath.endsWith('.mts')) {
    return formatarTypeScriptMinimo(code, relPath);
  }
  if (relPath.endsWith('.js') || relPath.endsWith('.jsx') || relPath.endsWith('.mjs') || relPath.endsWith('.cjs')) {
    return formatarJavaScriptMinimo(code, relPath);
  }
  if (relPath.endsWith('.html') || relPath.endsWith('.htm')) {
    return formatarHtmlMinimo(code);
  }
  if (relPath.endsWith('.xml')) {
    return formatarXmlMinimo(code);
  }
  if (relPath.endsWith('.svg')) {
    return formatarSvgMinimo(code);
  }
  if (relPath.endsWith('.css')) {
    return formatarCssMinimo(code);
  }
  if (relPath.endsWith('.scss')) {
    return formatarScssMinimo(code);
  }
  if (relPath.endsWith('.less')) {
    return formatarLessMinimo(code);
  }
  if (relPath.endsWith('.sql')) {
    return formatarSqlMinimo(code);
  }
  if (relPath.endsWith('.toml')) {
    return formatarTomlMinimo(code);
  }
  if (relPath.endsWith('.ini')) {
    return formatarIniMinimo(code);
  }
  if (relPath.endsWith('.dockerfile') || path.basename(relPath).toLowerCase() === 'dockerfile') {
    return formatarDockerfileMinimo(code);
  }
  if (relPath.endsWith('.sh') || relPath.endsWith('.bash')) {
    return formatarShellMinimo(code);
  }
  if (relPath.endsWith('.gradle')) {
    return formatarGradleMinimo(code);
  }
  if (relPath.endsWith('.properties')) {
    return formatarPropertiesMinimo(code);
  }
  if (relPath.endsWith('.java')) {
    return formatarJavaMinimo(code);
  }
  if (relPath.endsWith('.py')) {
    return formatarPythonMinimo(code);
  }
  if (relPath.endsWith('.php')) {
    return formatarPhpMinimo(code);
  }
  if (relPath.endsWith('.kt') || relPath.endsWith('.kts')) {
    return formatarKotlinMinimo(code);
  }
  if (relPath.endsWith('.go')) {
    return formatarGoMinimo(code);
  }
  if (relPath.endsWith('.gitignore') || path.basename(relPath).toLowerCase() === '.gitignore') {
    return formatarGitignoreMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.editorconfig') {
    return formatarEditorconfigMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.npmrc' || relPath.endsWith('.npmrc')) {
    return formatarNpmrcMinimo(code);
  }
  if (path.basename(relPath).toLowerCase() === '.nvmrc' || relPath.endsWith('.nvmrc')) {
    return formatarNvmrcMinimo(code);
  }
  if (relPath.endsWith('.json5')) {
    return formatarJson5Minimo(code);
  }
  if (relPath.endsWith('.txt') || relPath.endsWith('.log') || relPath.endsWith('.env') || relPath.includes('ignore')) {
    return formatarCodeMinimo(code, {
      normalizarSeparadoresDeSecao: false,
      relPath,
      parser: 'code',
    });
  }
  const formatted = normalizarNewlinesFinais(
    removerEspacosFinaisPorLinha(normalizarFimDeLinha(code)),
  );
  return {
    ok: true,
    parser: 'code',
    formatted,
    changed: formatted !== normalizarNewlinesFinais(normalizarFimDeLinha(code)),
  };
}

type PrettierApi = {
  format: (code: string, options: Record<string, unknown>) => string | Promise<string>;
  resolveConfig: (filePath: string, options?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
};

const prettierCache = new Map<string, Promise<PrettierApi | null>>();

async function carregarPrettierDoProjeto(baseDir: string): Promise<PrettierApi | null> {
  const base = baseDir || process.cwd();
  const cached = prettierCache.get(base);
  if (cached) return cached;
  const loader = (async (): Promise<PrettierApi | null> => {
    const tryImportPrettier = async (resolved: string): Promise<PrettierApi | null> => {
      try {
        const mod = (await import(resolved)) as unknown as { default?: unknown };
        const api = (mod && typeof mod === 'object' && 'default' in mod ? mod.default : mod) as PrettierApi | undefined;
        if (!api || typeof api.format !== 'function' || typeof api.resolveConfig !== 'function') {
          return null;
        }
        return api;
      } catch {
        return null;
      }
    };
    const tryResolveFrom = async (req: NodeRequire): Promise<PrettierApi | null> => {
      try {
        const resolved = req.resolve('prettier');
        return await tryImportPrettier(resolved);
      } catch {
        return null;
      }
    };
    try {
      const projectPkg = path.join(base, 'package.json');
      if (fs.existsSync(projectPkg)) {
        const api = await tryResolveFrom(createRequire(projectPkg));
        if (api) return api;
      }
    } catch {
      // ignora
    }
    {
      const api = await tryResolveFrom(createRequire(import.meta.url));
      if (api) return api;
    }
    const feedbackDir = process.env.PROMETHEUS_PRETTIER_FEEDBACK_DIR || path.join(base, 'feedback', 'prettier');
    const feedbackPkg = path.join(feedbackDir, 'package.json');
    if (fs.existsSync(feedbackPkg)) {
      const candidates = [path.join(feedbackDir, 'index.mjs'), path.join(feedbackDir, 'index.cjs')];
      for (const p of candidates) {
        if (!fs.existsSync(p)) continue;
        const api = await tryImportPrettier(p);
        if (api) return api;
      }
    }
    return null;
  })();
  prettierCache.set(base, loader);
  return loader;
}

function inferPrettierParser(relPath?: string, code?: string): string | null {
  const info = getSyntaxInfoForPath(relPath ?? '');
  if (!info) return null;
  if (!info.formatavel) return null;
  const rp = (relPath ?? '').toLowerCase();
  if (rp.endsWith('.json')) {
    const src = code ?? '';
    const normalized = normalizarFimDeLinha(src);
    const hasComments = /(^|\n)\s*\/\//.test(normalized) || /(^|\n)\s*\/\*/.test(normalized);
    return hasComments ? 'jsonc' : 'json';
  }
  return info.parser ?? null;
}

export async function formatarComPrettierProjeto(params: {
  code: string;
  relPath: string;
  baseDir?: string;
}): Promise<FormatadorMinimoResult> {
  const baseDir = params.baseDir || process.cwd();
  const relPath = params.relPath;
  const absCaminho = path.resolve(baseDir, relPath);
  const prettier = await carregarPrettierDoProjeto(baseDir);
  if (!prettier) {
    return {
      ok: true,
      parser: 'unknown',
      formatted: params.code,
      changed: false,
      reason: 'prettier-nao-disponivel'
    };
  }
  const parser = inferPrettierParser(relPath, params.code);
  if (!parser) {
    return {
      ok: true,
      parser: 'unknown',
      formatted: params.code,
      changed: false,
      reason: 'prettier-parser-desconhecido'
    };
  }
  try {
    const resolvedConfig = await prettier.resolveConfig(absCaminho, { editorconfig: true });
    const inferSingleQuote = (src: string): boolean => {
      try {
        const singles = (src.match(/'/g) || []).length;
        const doubles = (src.match(/"/g) || []).length;
        return singles > doubles;
      } catch {
        return false;
      }
    };
    const options: Record<string, unknown> = {
      ...(resolvedConfig || {}),
      filepath: absCaminho,
      parser
    };
    if (!resolvedConfig || !Object.prototype.hasOwnProperty.call(resolvedConfig, 'singleQuote')) {
      if (parser === 'babel' || parser === 'typescript') {
        options.singleQuote = inferSingleQuote(params.code);
      }
    }
    const out = await prettier.format(params.code, options);
    const formatted = String(out);
    return {
      ok: true,
      parser: 'code',
      formatted,
      changed: formatted !== params.code,
      reason: 'prettier-projeto'
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      ok: false,
      parser: 'code',
      error: msg
    };
  }
}

registerFormatter('.json', (code) => formatarJsonMinimo(code));
registerFormatter('.lock', (code) => formatarJsonMinimo(code));
registerFormatter('.md', (code) => formatarMarkdownMinimo(code));
registerFormatter('.markdown', (code) => formatarMarkdownMinimo(code));
registerFormatter('.yml', (code) => formatarYamlMinimo(code));
registerFormatter('.yaml', (code) => formatarYamlMinimo(code));
registerFormatter('.xml', (code) => formatarXmlMinimo(code));
registerFormatter('.svg', (code) => formatarSvgMinimo(code));
registerFormatter('.html', (code) => formatarHtmlMinimo(code));
registerFormatter('.htm', (code) => formatarHtmlMinimo(code));
registerFormatter('.css', (code) => formatarCssMinimo(code));
registerFormatter('.scss', (code) => formatarScssMinimo(code));
registerFormatter('.less', (code) => formatarLessMinimo(code));
registerFormatter('.sql', (code) => formatarSqlMinimo(code));
registerFormatter('.toml', (code) => formatarTomlMinimo(code));
registerFormatter('.ini', (code) => formatarIniMinimo(code));
registerFormatter('.sh', (code) => formatarShellMinimo(code));
registerFormatter('.bash', (code) => formatarShellMinimo(code));
registerFormatter('.gradle', (code) => formatarGradleMinimo(code));
registerFormatter('.properties', (code) => formatarPropertiesMinimo(code));
registerFormatter('.java', (code) => formatarJavaMinimo(code));
registerFormatter('.py', (code) => formatarPythonMinimo(code));
registerFormatter('.php', (code) => formatarPhpMinimo(code));
registerFormatter('.kt', (code) => formatarKotlinMinimo(code));
registerFormatter('.kts', (code) => formatarKotlinMinimo(code));
registerFormatter('.jsonc', (code) => formatarJsoncMinimo(code));
registerFormatter('.dockerfile', (code) => formatarDockerfileMinimo(code));
registerFormatter('.txt', (code) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.log', (code) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.env', (code) => formatarCodeMinimo(code, { normalizarSeparadoresDeSecao: false, parser: 'code' }));
registerFormatter('.go', (code) => formatarGoMinimo(code));
registerFormatter('.gitignore', (code) => formatarGitignoreMinimo(code));
registerFormatter('.editorconfig', (code) => formatarEditorconfigMinimo(code));
registerFormatter('.npmrc', (code) => formatarNpmrcMinimo(code));
registerFormatter('.nvmrc', (code) => formatarNvmrcMinimo(code));
registerFormatter('.json5', (code) => formatarJson5Minimo(code));
registerFormatter('.ts', (code, relPath) => formatarTypeScriptMinimo(code, relPath ?? ''));
registerFormatter('.tsx', (code, relPath) => formatarTypeScriptMinimo(code, relPath ?? ''));
registerFormatter('.cts', (code, relPath) => formatarTypeScriptMinimo(code, relPath ?? ''));
registerFormatter('.mts', (code, relPath) => formatarTypeScriptMinimo(code, relPath ?? ''));
registerFormatter('.js', (code, relPath) => formatarJavaScriptMinimo(code, relPath ?? ''));
registerFormatter('.jsx', (code, relPath) => formatarJavaScriptMinimo(code, relPath ?? ''));
registerFormatter('.mjs', (code, relPath) => formatarJavaScriptMinimo(code, relPath ?? ''));
registerFormatter('.cjs', (code, relPath) => formatarJavaScriptMinimo(code, relPath ?? ''));

export function getRegisteredFormatter(relPath: string): FormatterFn | null {
  return getFormatterForPath(relPath);
}