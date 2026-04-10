// SPDX-License-Identifier: MIT

export const CliExibirMolduraMessages = {
  fallbackLine: (linha: string) => `  ${linha}`,
  planTitle: 'Restructuring plan',
  planHeaderLine1: 'From                              → To',
  planHeaderLine2: '----------------------------------  ---------------------------------------',
  planOverflow: (restantes: number) => `... +${restantes} remaining`,
  planFallbackLine: (de: string, para: string) => `  - ${de} → ${para}`,
  planFallbackOverflow: (restantes: number) => `  ... +${restantes} remaining`,
  conflictsTitle: 'Destination conflicts',
  conflictsHeaderLine1: 'Destination                       Reason',
  conflictsHeaderLine2: '-------------------------------   ------------------------------',
  conflictsOverflow: (restantes: number) => `... +${restantes} remaining`,
  conflictsFallbackLine: (alvo: string, motivo: string) => `  - ${alvo} :: ${motivo}`,
  conflictsFallbackOverflow: (restantes: number) => `  ... +${restantes} remaining`
} as const;
export const CliExibirMolduraMensagens = CliExibirMolduraMessages;
