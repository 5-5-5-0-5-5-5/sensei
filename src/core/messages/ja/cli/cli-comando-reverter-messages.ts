// SPDX-License-Identifier: MIT

export const CliComandoReverterMensagens = {
  mapaLimpoComSucesso: (iconeSucesso: string) => `${iconeSucesso} 逆引きマップが正常にクリアされました`,
  ultimoMove: (dataPtBr: string) => `最後の移動: ${dataPtBr}`
} as const;
