// SPDX-License-Identifier: MIT
/**
 * Sistema de Mensagens Centralizado do Sensei com Internacionalização
 *
 * Resolve mensagens no locale configurado em sensei.config.json via campo "locale".
 * Valores suportados: "pt" (padrão), "en".
 *
 * Uso:
 *   import { getMessages } from '@core/messages/index.js';
 *   const msgs = getMessages();
 *   // msgs.log, msgs.MENSAGENS_CORRECOES, msgs.RelatorioMensagens, etc.
 */

import * as en from './en/index.js';
import * as pt from './pt/index.js';

export type { IconeAcao, IconeArquivo, IconeComando, IconeDiagnostico, IconeFeedback, IconeNivel, IconeRelatorio, IconeStatus, IconeTipo, IconeZelador } from './shared/icons.js';
export { getIcone, ICONES, ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_NIVEL, ICONES_RELATORIO, ICONES_STATUS, ICONES_TIPOS, ICONES_ZELADOR, suportaCores } from './shared/icons.js';

export function getMessages(): typeof pt {
  const localeEnv = process.env.SENSEI_LOCALE;
  if (localeEnv && localeEnv.toLowerCase().startsWith('en')) {
    return en as unknown as typeof pt;
  }

  // Default to pt, config loading will happen lazily after initialization
  return pt as unknown as typeof pt;
}

export function getLocale(): string {
  const localeEnv = process.env.SENSEI_LOCALE;
  if (localeEnv && localeEnv.toLowerCase().startsWith('en')) {
    return 'en';
  }
  return 'pt';
}

export function setLocale(_locale: string): void {
  // Not implemented - use SENSEI_LOCALE env var
}

export * from './pt/index.js';
export { RelatorioAsyncPatternsMensagens, RelatorioZeladorSaudeMensagens } from './pt/relatorios/index.js';

export { en,pt };

export * from './shared/icons.js';
