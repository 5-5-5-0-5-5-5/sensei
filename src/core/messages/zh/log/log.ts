// SPDX-License-Identifier: MIT
import type tty from 'node:tty';

import { chalk } from '@core/config/chalk-safe.js';
import { config } from '@core/config/config.js';
import { isJsonMode } from '@shared/helpers/json-mode.js';

import type { FormatOptions, Nivel, StyleFn } from '@';
// Reexport for tests to configure flags without importing cosmos directly
export { config } from '@core/config/config.js';
export const LOG_SIMBOLOS = {
  // Severity level prefixes with ANSI colors
  info: '[INFO]',
  sucesso: '[OK]',
  erro: '[ERROR]',
  aviso: '[WARNING]',
  debug: '[DEBUG]',
  fase: '[>]',
  passo: '[*]',
  scan: '[SCAN]',
  guardian: '[GUARD]',
  pasta: '[DIR]'
};
function shouldSilence(): boolean {
  // JSON mode always silences visual logs
  if (isJsonMode()) return true;
  if (process.env.PROMETHEUS_FORCE_SILENT_JSON === '1') return true;
  return config.REPORT_SILENCE_LOGS;
}
function shouldSuppressParcial(msg?: string): boolean {
  try {
    // Allows quick override via short env variable PROMETHEUS_SUPPRESS_PARCIAL=1
    if (!config.SUPPRESS_PARCIAL_LOGS && process.env.PROMETHEUS_SUPPRESS_PARCIAL !== '1') return false;
    if (!msg || typeof msg !== 'string') return false;
    // Suppresses when substring 'partial' (case-insensitive) appears anywhere.
    // This covers 'partial' and variations like 'partially'.
    return /parcial/i.test(msg);
  } catch {
    return false;
  }
}
function isDebugMode(): boolean {
  return config.DEV_MODE || process.env.PROMETHEUS_DEBUG === 'true';
}
function shouldLogLevel(nivel: Nivel): boolean {
  const niveis = ['erro', 'aviso', 'info', 'debug'];
  const nivelAtual = niveis.indexOf(config.LOG_LEVEL);
  const nivelMensagem = niveis.indexOf(nivel);

  // Error and success are always displayed (high priority)
  if (nivel === 'erro' || nivel === 'sucesso') return true;

  // Debug is only displayed in debug mode or if LOG_LEVEL=debug
  if (nivel === 'debug') return isDebugMode() || config.LOG_LEVEL === 'debug';

  // For other levels, checks if within threshold
  return nivelMensagem <= nivelAtual;
}
function getTimestamp(): string {
  const now = new Date().toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  return `[${now}]`;
}
function stripLeadingSimbolos(msg: string): string {
  if (!msg) return msg;
  const ansiRegex = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  // Remove ANSI to evaluate beginning; we will keep output without styles
  let plain = msg.replace(ansiRegex, '');
  // Normalizes line breaks and leading spaces
  plain = plain.replace(/^\s+/, '');
  // candidates: symbols from map + frequent extras used in messages
  const extras: string[] = [];
  const candidatos = Array.from(new Set([...Object.values(LOG_SIMBOLOS), ...extras])).filter(Boolean) as string[];
  let mudou = true;
  while (mudou) {
    mudou = false;
    const trimmed = plain.trimStart();
    for (const s of candidatos) {
      if (trimmed.startsWith(s)) {
        plain = trimmed.slice(s.length);
        mudou = true;
        break;
      }
    }
  }
  // Remaining spaces after removal
  return plain.trimStart();
}

// Exported for formatting tests; internal use in logger.

export function formatarLinha({
  nivel,
  mensagem,
  sanitize = true
}: FormatOptions): string {
  const ts = getTimestamp();
  const colNivelRaw = nivel.toUpperCase().padEnd(7);
  // Resolve possible 'chalk' forms (function or mocked object with .bold)
  const hasBold = (v: unknown): v is {
    bold: StyleFn;
  } => !!v && typeof (v as {
    bold?: unknown;
  }).bold === 'function';
  const resolveStyle = (v: unknown): StyleFn => {
    if (typeof v === 'function') return v as StyleFn;
    if (hasBold(v)) return v.bold;
    return (s: string) => String(s);
  };
  let cor: StyleFn = (s: string) => s;
  switch (nivel) {
    case 'info':
      cor = resolveStyle(chalk.cyan);
      break;
    case 'sucesso':
      cor = resolveStyle(chalk.green);
      break;
    case 'erro':
      cor = resolveStyle(chalk.red);
      break;
    case 'aviso':
      cor = resolveStyle(chalk.yellow);
      break;
    case 'debug':
      cor = resolveStyle(chalk.magenta);
      break;
  }
  const boldFn = resolveStyle(chalk.bold);
  const colNivel = boldFn(colNivelRaw);
  const corpo = sanitize ? stripLeadingSimbolos(mensagem) : mensagem;
  // We highlight messages (error/warning/success) to reinforce visibility.
  const corpoFmt = nivel === 'info' || nivel === 'debug' ? corpo : cor(corpo);
  const grayFn: StyleFn = typeof chalk.gray === 'function' ? chalk.gray : (s: string) => String(s);
  const linha = `${grayFn(ts)} ${colNivel} ${corpoFmt}`;
  // Centers loose lines only with explicit opt-in (PROMETHEUS_CENTER=1)
  if (!process.env.VITEST && process.env.PROMETHEUS_CENTER === '1') {
    try {
      const cols = obterColunasTerm();
      const out: tty.WriteStream | undefined = process.stdout && typeof (process.stdout as tty.WriteStream).isTTY !== 'undefined' ? process.stdout as tty.WriteStream : undefined;
      const isTty = !!out && out.isTTY !== false;
      if (isTty && cols && cols > 0) {
        const ANSI_REGEX = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const visLen = (s: string) => (s || '').replace(ANSI_REGEX, '').length;
        const pad = Math.floor(Math.max(0, cols - visLen(linha)) / 2);
        if (pad > 0) return ' '.repeat(pad) + linha;
      }
    } catch {
      // If centering fails, return normal line
    }
  }
  return linha;
}

/**
 * Formats a multi-line block with consistent indentation and light frame.
 * Useful for sections (phases) or compact summaries.
 */

function obterColunasTerm(): number | undefined {
  // Tries to get terminal width safely
  try {
    const out: tty.WriteStream | undefined = process.stdout && typeof (process.stdout as tty.WriteStream).columns !== 'undefined' ? process.stdout as tty.WriteStream : undefined;
    const cols = out?.columns;
    if (typeof cols === 'number' && cols > 0) return cols;
  } catch {}
  // Allows explicit override via env and fallback of common variables
  const envOverride = Number(process.env.PROMETHEUS_FRAME_MAX_COLS || '0');
  if (Number.isFinite(envOverride) && envOverride > 0) return envOverride;
  const envCols = Number(process.env.COLUMNS || process.env.TERM_COLUMNS || '0');
  return Number.isFinite(envCols) && envCols > 0 ? envCols : undefined;
}
function calcularLarguraInterna(titulo: string, linhas: string[], larguraMax?: number): {
  width: number;
  maxInner: number;
  visLen: (s: string) => number;
  ANSI_REGEX: RegExp;
} {
  const ANSI_REGEX = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
  const visLen = (s: string) => (s || '').replace(ANSI_REGEX, '').length;
  // Desired width by content, with standard ceiling (100) if not specified
  const desejada = Math.min(100, Math.max(visLen(titulo) + 4, ...linhas.map(l => visLen(l) + 4), 20));
  const preferida = typeof larguraMax === 'number' ? Math.max(20, Math.min(larguraMax, 120)) : desejada;
  // Upper limit by terminal width (responsive)
  const cols = obterColunasTerm();
  const tetoTela = typeof cols === 'number' && cols > 0 ? Math.max(20, Math.min(cols, 120)) : 120;
  const width = Math.max(20, Math.min(preferida, tetoTela));
  const barraLen = Math.max(10, width - 2);
  const maxInner = barraLen - 1;
  return {
    width,
    maxInner,
    visLen,
    ANSI_REGEX
  };
}
export function formatarBloco(titulo: string, linhas: string[], corTitulo: StyleFn = typeof chalk.bold === 'function' ? chalk.bold : (s: string) => String(s), larguraMax?: number): string {
  // ANSI-aware utilities to measure/compose by visible width
  const {
    width,
    maxInner,
    visLen,
    ANSI_REGEX
  } = calcularLarguraInterna(titulo, linhas, larguraMax);
  const padFimVisible = (s: string, target: number) => {
    const diff = target - visLen(s);
    return diff > 0 ? s + ' '.repeat(diff) : s;
  };
  const truncateVisible = (s: string, max: number) => {
    if (visLen(s) <= max) return s;
    // Preserves ANSI sequences, counting only visible width
    let out = '';
    let count = 0;
    let i = 0;
    while (i < s.length && count < max - 1) {
      const ch = s[i];
      if (ch === '\u001B' || ch === '\u009B') {
        // Copies entire ANSI sequence
        const m = s.slice(i).match(ANSI_REGEX);
        if (m && m.index === 0) {
          out += m[0];
          i += m[0].length;
          continue;
        }
      }
      out += ch;
      i++;
      count++;
    }
    return `${out}…`;
  };
  const barra = '─'.repeat(Math.max(10, width - 2));
  const topo = `┌${barra}┐`;
  const base = `└${barra}┘`;
  const normalizar = (s: string) => truncateVisible(s, maxInner);
  const corpo = linhas.map(l => `│ ${padFimVisible(normalizar(l), maxInner)}│`).join('\n');
  const headTxt = `│ ${padFimVisible(normalizar(titulo), maxInner)}│`;
  // Ensures corTitulo works even when mocked as object
  const corTituloFn = typeof corTitulo === 'function' ? corTitulo : (s: string) => String(s);
  const gray: StyleFn = typeof chalk.gray === 'function' ? chalk.gray : (x: string) => String(x);
  return [gray(topo), corTituloFn(headTxt), gray(corpo), gray(base)].filter(Boolean).join('\n');
}

// Optional ASCII frame fallback (avoids mojibake on Windows redirects)

function deveUsarAsciiFrames(): boolean {
  return process.env.PROMETHEUS_ASCII_FRAMES === '1';
}
function converterMolduraParaAscii(bloco: string): string {
  return bloco.replaceAll('┌', '+').replaceAll('┐', '+').replaceAll('└', '+').replaceAll('┘', '+').replaceAll('─', '-').replaceAll('│', '|');
}
export function fase(titulo: string): void {
  if (shouldSilence()) return;
  if (!shouldLogLevel('info')) return;
  const bold: StyleFn = typeof chalk.bold === 'function' ? chalk.bold : (s: string) => String(s);
  const cyan: StyleFn = typeof chalk.cyan === 'function' ? chalk.cyan : (s: string) => String(s);
  console.log(formatarLinha({
    nivel: 'info',
    mensagem: bold(cyan(`${LOG_SIMBOLOS.fase} ${titulo}`)),
    sanitize: false
  }));
}
export function passo(descricao: string): void {
  if (shouldSilence()) return;
  if (!shouldLogLevel('info')) return;
  console.log(formatarLinha({
    nivel: 'info',
    mensagem: `${LOG_SIMBOLOS.passo} ${descricao}`,
    sanitize: false
  }));
}
export const log = {
  info(msg: string): void {
    if (shouldSilence()) return;
    if (shouldSuppressParcial(msg)) return;
    if (!shouldLogLevel('info')) return;
    console.log(formatarLinha({
      nivel: 'info',
      mensagem: msg
    }));
  },
  // INFO variant that preserves inline styles/colors (no symbol sanitization),
  // useful for aligning columns while keeping colored numbers.
  infoSemSanitizar(msg: string): void {
    if (shouldSilence()) return;
    if (shouldSuppressParcial(msg)) return;
    if (!shouldLogLevel('info')) return;
    console.log(formatarLinha({
      nivel: 'info',
      mensagem: msg,
      sanitize: false
    }));
  },
  // INFO message with styled body (bold + blue) and no sanitization,
  // preserving colors within the body. Useful for short titles and summaries.
  infoDestaque(msg: string): void {
    if (shouldSilence()) return;
    if (shouldSuppressParcial(msg)) return;
    if (!shouldLogLevel('info')) return;
    const bold: StyleFn = typeof chalk.bold === 'function' ? chalk.bold : (s: string) => String(s);
    const cyan: StyleFn = typeof chalk.cyan === 'function' ? chalk.cyan : (s: string) => String(s);
    console.log(formatarLinha({
      nivel: 'info',
      mensagem: bold(cyan(msg)),
      sanitize: false
    }));
  },
  sucesso(msg: string): void {
    if (shouldSilence()) return;
    if (shouldSuppressParcial(msg)) return;
    if (!shouldLogLevel('sucesso')) return;
    console.log(formatarLinha({
      nivel: 'sucesso',
      mensagem: msg
    }));
  },
  erro(msg: string): void {
    console.error(formatarLinha({
      nivel: 'erro',
      mensagem: msg
    }));
  },
  aviso(msg: string): void {
    if (shouldSilence()) return;
    if (shouldSuppressParcial(msg)) return;
    if (!shouldLogLevel('aviso')) return;
    console.log(formatarLinha({
      nivel: 'aviso',
      mensagem: msg
    }));
  },
  debug(msg: string): void {
    if (!shouldLogLevel('debug')) return;
    if (shouldSuppressParcial(msg)) return;
    console.log(formatarLinha({
      nivel: 'debug',
      mensagem: msg
    }));
  },
  fase,
  passo,
  bloco: formatarBloco,
  calcularLargura(titulo: string, linhas: string[], larguraMax?: number): number {
    return calcularLarguraInterna(titulo, linhas, larguraMax).width;
  },
  // Prints a framed block directly (without logger prefix) with optional ASCII fallback
  imprimirBloco(titulo: string, linhas: string[], corTitulo: StyleFn = typeof chalk.bold === 'function' ? chalk.bold : (s: string) => String(s), larguraMax?: number): void {
    if (shouldSilence()) return;
    // Suppresses blocks containing the word 'partial' when configured
    if (config.SUPPRESS_PARCIAL_LOGS) {
      if (shouldSuppressParcial(titulo)) return;
      for (const l of linhas) if (shouldSuppressParcial(l)) return;
    }
    const bloco = formatarBloco(titulo, linhas, corTitulo, larguraMax);
    const out = deveUsarAsciiFrames() ? converterMolduraParaAscii(bloco) : bloco;
    // Centers block only with explicit opt-in (PROMETHEUS_CENTER=1)
    if (!process.env.VITEST && process.env.PROMETHEUS_CENTER === '1') {
      try {
        const lines = out.split('\n');
        if (!lines.length) {
          return;
        }
        // measures visible width of frame (top line)
        const ANSI_REGEX = /[\u001B\u009B][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        const visibleLen = (s: string) => s.replace(ANSI_REGEX, '').length;
        const frameWidth = Math.max(...lines.map(l => visibleLen(l)));
        const cols = obterColunasTerm() || 0;
        const outStream: tty.WriteStream | undefined = process.stdout && typeof (process.stdout as tty.WriteStream).isTTY !== 'undefined' ? process.stdout as tty.WriteStream : undefined;
        const isTty = !!outStream && outStream.isTTY !== false;
        if (isTty) {
          const pad = Math.floor(Math.max(0, cols - frameWidth) / 2);
          if (pad > 0) {
            const pref = ' '.repeat(pad);
            console.log(lines.map(l => pref + l).join('\n'));
            return;
          }
        }
      } catch {
        // If centering fails, print normally
      }
    }
  }
};
