// SPDX-License-Identifier: MIT
import { isInStringOrComment } from '@shared/helpers/context-utils.js';

import type { ConfiguracaoPontuacaoZelador, IntlComDisplayNames, ProblemaPontuacao } from '@';

// Constantes de limites e valores de threshold
export const LIMITES = {
  ASCII_EXTENDED_MIN: 128,
  CARACTERES_INCOMUNS_PADRAO: 10,
  ESPACAMENTO_CORRECAO_CONTAGEM: 1,
  CONTEXTO_TYPESCRIPT_LOOKBACK: 50,
  CONTEXTO_TYPESCRIPT_LOOKAHEAD: 50
} as const;

export const CONFIANCA = {
  MIN_ALTA: 80,
  UNICODE: 90,
  PONTUACAO: 95,
  ESPACAMENTO: 85,
  CARACTERES_INCOMUNS: 70
} as const;

export const COMUM_SUBSTITUICOES: Record<string, string> = {
  '\u201c': '"',
  '\u201d': '"',
  '\u2018': "'",
  '\u2019': "'",
  '\u2013': '-',
  '\u2014': '-',
  '\u00A0': ' ',
  '\u00B4': "'"
};

export const REPEATABLE_TO_SINGLE = new Set([',', '.', '!', '?', ':', ';', '-', '_', '*']);
export const MULTI_PUNCT_RE = /([,\.!?:;_\-\*]){2,}/g;
export const SPACE_BEFORE_PUNCT_RE = /\s+([,.:;!?])/g;
export const NO_SPACE_AFTER_PUNCT_RE = /([,.:;!?])([^\s\)\]\}])/g;

export const CONFIGURACAO_PADRAO: ConfiguracaoPontuacaoZelador = {
  normalizarUnicode: true,
  colapsarPontuacaoRepetida: true,
  corrigirEspacamento: true,
  balancearParenteses: false,
  detectarCaracteresIncomuns: true,
  limiteCaracteresIncomuns: LIMITES.CARACTERES_INCOMUNS_PADRAO
};

/**
 * Normaliza caracteres Unicode comuns para seus equivalentes ASCII.
 */
export function normalizeUnicode(input: string): {
  text: string;
  changed: boolean;
} {
  let normalized = input.normalize('NFKC');
  let changed = false;
  for (const [pattern, replacement] of Object.entries(COMUM_SUBSTITUICOES)) {
    if (normalized.includes(pattern)) {
      normalized = normalized.split(pattern).join(replacement);
      changed = true;
    }
  }
  return {
    text: normalized,
    changed
  };
}

/**
 * Verifica se a posição está em contexto TypeScript onde ':' ou outros podem ser válidos.
 */
export function isTypeScriptContext(src: string, index: number): boolean {
  const before = src.substring(Math.max(0, index - LIMITES.CONTEXTO_TYPESCRIPT_LOOKBACK), index);
  const after = src.substring(index, Math.min(src.length, index + LIMITES.CONTEXTO_TYPESCRIPT_LOOKAHEAD));

  const tsPadroes = [
    /\?\s*:\s*$/, // Ternário: a ? b :
    /:\s*\?/,     // Tipo opcional: prop?: string
    /\(\?\s*:\s*$/, // Non-capturing group: (?:
    /interface\s+\w+\s*{/, // Interface declaration
    /type\s+\w+\s*=/,      // Type alias
    /<[^>]*$/      // Generics: Array<Type>
  ];

  return tsPadroes.some(pattern => pattern.test(before) || pattern.test(after));
}

/**
 * Colapsa pontuação repetida (ex: .. -> .) respeitando contextos de string, comentário e TypeScript.
 */
export function collapseRepeatedPunct(s: string): {
  text: string;
  changed: boolean;
  count: number;
} {
  let count = 0;
  const parts: string[] = [];
  MULTI_PUNCT_RE.lastIndex = 0;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MULTI_PUNCT_RE.exec(s)) !== null) {
    const matchIndex = match.index;
    const matchStr = match[0];
    const ch = matchStr[0];

    // Se está em string/comentário ou contexto TS seguro, não modifica
    if (isInStringOrComment(s, matchIndex) || (ch === ':' && isTypeScriptContext(s, matchIndex))) {
      parts.push(s.substring(lastIndex, matchIndex + matchStr.length));
      lastIndex = matchIndex + matchStr.length;
      continue;
    }

    parts.push(s.substring(lastIndex, matchIndex));
    if (REPEATABLE_TO_SINGLE.has(ch)) {
      parts.push(ch);
      count++;
    } else {
      parts.push(matchStr);
    }
    lastIndex = matchIndex + matchStr.length;
  }
  parts.push(s.substring(lastIndex));

  return {
    text: parts.join(''),
    changed: count > 0,
    count
  };
}

/**
 * Corrige espaçamento básico ao redor de pontuações comuns.
 */
export function fixSpacingAroundPunct(s: string): {
  text: string;
  changed: boolean;
  count: number;
} {
  const t1 = s.replace(SPACE_BEFORE_PUNCT_RE, '$1');
  const t2 = t1.replace(NO_SPACE_AFTER_PUNCT_RE, '$1 $2');
  const changed = s !== t2;
  const count = changed ? LIMITES.ESPACAMENTO_CORRECAO_CONTAGEM : 0;
  return {
    text: t2,
    changed,
    count
  };
}

/**
 * Detecta caracteres fora do range ASCII comum.
 */
export function detectUncommonChars(text: string, limite?: number): ProblemaPontuacao[] {
  const issues: ProblemaPontuacao[] = [];
  for (let i = 0; i < text.length && issues.length < (limite ?? Infinity); i++) {
    const ch = text[i];
    const code = ch.codePointAt(0) ?? 0;
    if (code >= LIMITES.ASCII_EXTENDED_MIN) {
      const name = (() => {
        try {
          if (typeof Intl !== 'undefined') {
            const intlApi = Intl as IntlComDisplayNames;
            const DisplayNomesCtor = intlApi.DisplayNames;
            if (DisplayNomesCtor) {
              const displayNomes = new DisplayNomesCtor(['en'], { type: 'language' });
              return typeof displayNomes.of === 'function' ? displayNomes.of(ch) ?? '' : '';
            }
          }
          return '';
        } catch { return ''; }
      })();
      issues.push({
        tipo: 'caracteres-incomuns',
        posicao: i,
        comprimento: 1,
        descricao: `Caractere incomum: ${ch} (${name || ch})`,
        sugestao: 'Considere substituir por equivalente ASCII',
        confianca: CONFIANCA.CARACTERES_INCOMUNS
      });
    }
  }
  return issues;
}

/**
 * Executa a análise completa de pontuação e formatação em um texto.
 */
export function analisarTexto(src: string, config: ConfiguracaoPontuacaoZelador = CONFIGURACAO_PADRAO): ProblemaPontuacao[] {
  const problemas: ProblemaPontuacao[] = [];
  if (config.normalizarUnicode) {
    const norm = normalizeUnicode(src);
    if (norm.changed) {
      problemas.push({
        tipo: 'unicode-invalido',
        posicao: 0,
        comprimento: src.length,
        descricao: 'Texto contém caracteres Unicode que podem ser normalizados',
        sugestao: 'Aplicar normalização Unicode NFKC',
        confianca: CONFIANCA.UNICODE
      });
    }
  }
  if (config.colapsarPontuacaoRepetida) {
    const collapsed = collapseRepeatedPunct(src);
    if (collapsed.changed) {
      problemas.push({
        tipo: 'pontuacao-repetida',
        posicao: 0,
        comprimento: src.length,
        descricao: `Encontrados ${collapsed.count} casos de pontuação repetida`,
        sugestao: 'Colapsar pontuação repetida para caracteres únicos',
        confianca: CONFIANCA.PONTUACAO
      });
    }
  }
  if (config.corrigirEspacamento) {
    const spacing = fixSpacingAroundPunct(src);
    if (spacing.changed) {
      problemas.push({
        tipo: 'espacamento-incorreto',
        posicao: 0,
        comprimento: src.length,
        descricao: `Encontrados ${spacing.count} problemas de espaçamento em pontuação`,
        sugestao: 'Corrigir espaçamento antes/depois de pontuação',
        confianca: CONFIANCA.ESPACAMENTO
      });
    }
  }
  if (config.detectarCaracteresIncomuns) {
    const uncommon = detectUncommonChars(src, config.limiteCaracteresIncomuns ?? undefined);
    problemas.push(...uncommon);
  }
  return problemas;
}

/**
 * Calcula o número da linha para uma dada posição.
 */
export function calcularLinha(src: string, posOrIndex: number | undefined, match?: RegExpMatchArray): number {
  if (typeof posOrIndex === 'number') {
    return src.substring(0, posOrIndex).split('\n').length;
  }
  if (match) {
    const idx = (match as any).index;
    if (typeof idx === 'number') {
      return src.substring(0, idx).split('\n').length;
    }
  }
  return 1;
}
