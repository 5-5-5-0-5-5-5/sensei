// SPDX-License-Identifier: MIT
/**
 * Sistema de Mensagens Centralizado do Prometheus com Internacionalização
 *
 * Resolve mensagens no locale configurado.
 * Valores suportados: "pt" (padrão), "en", "zh", "ja".
 *
 * Prioridade de resolução do locale:
 *   1. Variável de ambiente PROMETHEUS_LOCALE (override explícito)
 *   2. Campo "locale" em prometheus.config.json (config.LOCALE)
 *   3. Padrão: "pt" (Português)
 *
 * Uso:
 *   import { messages, setLocale, getLocale, t, getMessages } from '@core/messages/index.js';
 *
 *   // Definir locale:
 *   setLocale('en');
 *
 *   // Acessar mensagens (resolve automaticamente pelo locale atual):
 *   messages.log
 *   messages.ExcecoesMensagens
 */

import * as enMessages from './en/index.js';
import { getLocale, initLocale,setLocale, t } from './i18n.js';
import * as jaMessages from './ja/index.js';
import * as ptMessages from './pt/index.js';
import * as zhMessages from './zh/index.js';

export { getLocale, initLocale,setLocale, t };

const localeModules: Record<string, any> = {
  pt: ptMessages,
  en: enMessages,
  zh: zhMessages,
  ja: jaMessages
};

export const messages: any = new Proxy({}, {
  get(_target: unknown, prop: string): unknown {
    const locale = getLocale();
    const mod = localeModules[locale] || localeModules.pt;
    return mod[prop];
  }
});

export function getMessages(): any {
  return messages;
}

export function getMessagesSync(): any {
  return messages;
}

export async function preloadAllLocales(): Promise<void> {
  // Already loaded synchronously at module init
}

// Re-export all to maintain backward compatibility with direct imports
export * from './pt/index.js';
