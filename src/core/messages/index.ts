// SPDX-License-Identifier: MIT
/**
 * Sistema de Mensagens Centralizado do Sensei com Internacionalização
 *
 * Resolve mensagens no locale configurado em sensei.config.json via campo "locale".
 * Valores suportados: "pt" (padrão), "en".
 *
 * Prioridade de resolução do locale:
 *   1. Variável de ambiente SENSEI_LOCALE (override explícito)
 *   2. Campo "locale" em sensei.config.json (config.LOCALE)
 *   3. Padrão: "pt" (Português)
 *
 * Uso:
 *   import { getMessages } from '@core/messages/index.js';
 *   const msgs = getMessages();
 *   // msgs.log, msgs.MENSAGENS_CORRECOES, msgs.RelatorioMensagens, etc.
 */

import { createRequire } from 'node:module';

import * as en from './en/index.js';
import * as pt from './pt/index.js';

export type { IconeAcao, IconeArquivo, IconeComando, IconeDiagnostico, IconeFeedback, IconeNivel, IconeRelatorio, IconeStatus, IconeTipo, IconeZelador } from './shared/icons.js';
export { getIcone, ICONES, ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_NIVEL, ICONES_RELATORIO, ICONES_STATUS, ICONES_TIPOS, ICONES_ZELADOR, suportaCores } from './shared/icons.js';

const require = createRequire(import.meta.url);

/**
 * Resolve o locale atual com base na prioridade:
 *   1. SENSEI_LOCALE env var
 *   2. config.LOCALE (de sensei.config.json)
 *   3. Padrão: "pt"
 */
function resolverLocale(): string {
  const localeEnv = process.env.SENSEI_LOCALE;
  if (localeEnv && localeEnv.toLowerCase().startsWith('en')) {
    return 'en';
  }
  if (localeEnv && localeEnv.toLowerCase().startsWith('pt')) {
    return 'pt';
  }

  try {
    const { config } = require('../config/config.js');
    if (config?.LOCALE) {
      const localeConfig = String(config.LOCALE).toLowerCase();
      if (localeConfig.startsWith('en')) {
        return 'en';
      }
      if (localeConfig.startsWith('pt')) {
        return 'pt';
      }
    }
  } catch {
    // Config ainda não carregado ou indisponível
  }

  return 'pt';
}

export function getMessages(): typeof pt {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return new Proxy({} as any, {
    get(_, prop) {
      const locale = resolverLocale();
      const target = locale === 'en' ? en : pt;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (target as any)[prop];
    }
  });
}

export function getLocale(): string {
  return resolverLocale();
}

export function setLocale(locale: string): void {
  const localeNormalizado = locale.toLowerCase().startsWith('en') ? 'en' : 'pt';

  process.env.SENSEI_LOCALE = localeNormalizado;

  try {
    const { config } = require('../config/config.js');
    if (config) {
      config.LOCALE = localeNormalizado;
    }
  } catch {
    // Config ainda não carregado; SENSEI_LOCALE já foi definido
  }
}

export * from './pt/index.js';
export { RelatorioAsyncPatternsMensagens, RelatorioZeladorSaudeMensagens } from './pt/relatorios/index.js';

export { en,pt };

export * from './shared/icons.js';
