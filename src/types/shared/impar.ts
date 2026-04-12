// SPDX-License-Identifier: MIT

/**
 * Tipos para o módulo de formatação (formater.ts)
 */

export type FormatadorMinimoParser =
  | 'json'
  | 'json5'
  | 'markdown'
  | 'yaml'
  | 'code'
  | 'html'
  | 'css'
  | 'scss'
  | 'less'
  | 'python'
  | 'php'
  | 'xml'
  | 'sql'
  | 'toml'
  | 'ini'
  | 'dockerfile'
  | 'shell'
  | 'gradle'
  | 'properties'
  | 'java'
  | 'kotlin'
  | 'go'
  | 'typescript'
  | 'babel'
  | 'gitignore'
  | 'editorconfig'
  | 'npmrc'
  | 'nvmrc'
  | 'unknown';

export type FormatadorMinimoResultOk = {
  ok: true;
  parser: FormatadorMinimoParser;
  formatted: string;
  changed: boolean;
  reason?: string;
};

export type FormatadorMinimoResultError = {
  ok: false;
  parser: FormatadorMinimoParser;
  error: string;
};

export type FormatadorMinimoResult =
  | FormatadorMinimoResultOk
  | FormatadorMinimoResultError;

/**
 * Tipos para o módulo de otimização SVG (svgs.ts)
 */

export type SvgoMinimoMudanca =
  | 'remover-bom'
  | 'remover-xml-prolog'
  | 'remover-doctype'
  | 'remover-comentarios'
  | 'remover-metadata'
  | 'remover-defs-vazio'
  | 'remover-version'
  | 'remover-xmlns-xlink'
  | 'remover-enable-background'
  | 'colapsar-espacos-entre-tags'
  | 'normalizar-eol'
  | 'trim-final';

export type SvgoMinimoResult = {
  ok: true;
  data: string;
  changed: boolean;
  mudancas: SvgoMinimoMudanca[];
  originalBytes: number;
  optimizedBytes: number;
  warnings: string[];
};

/**
 * Match de fence markdown para detecção de blocos de código
 */
export interface MarkdownFenceMatch {
  ch: '`' | '~';
  len: number;
  rest: string;
}
