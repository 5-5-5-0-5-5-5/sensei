// SPDX-License-Identifier: MIT

export const CliExibirMolduraMensagens = {
  fallbackLinha: (linha: string) => `  ${linha}`,
  planoTitulo: '再構築プラン',
  planoCabecalhoLinha1: '从                                → 至',
  planoCabecalhoLinha2: '----------------------------------  ---------------------------------------',
  planoOverflow: (restantes: number) => `... 残り+${restantes}件`,
  planoFallbackLinha: (de: string, para: string) => `  - ${de} → ${para}`,
  planoFallbackOverflow: (restantes: number) => `  ... 残り+${restantes}件`,
  conflitosTitulo: '宛先の競合',
  conflitosCabecalhoLinha1: '宛先                             理由',
  conflitosCabecalhoLinha2: '-------------------------------   ------------------------------',
  conflitosOverflow: (restantes: number) => `... 残り+${restantes}件`,
  conflitosFallbackLinha: (alvo: string, motivo: string) => `  - ${alvo} :: ${motivo}`,
  conflitosFallbackOverflow: (restantes: number) => `  ... 残り+${restantes}件`
} as const;
