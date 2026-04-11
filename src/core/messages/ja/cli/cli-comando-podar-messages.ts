// SPDX-License-Identifier: MIT

import { ICONES_COMANDO } from '../../shared/icons.js';

export const CliComandoPodarMensagens = {
  inicio: `\n${ICONES_COMANDO.podar} 整理プロセスを開始します...\n`,
  nenhumaSujeira: (iconeSucesso: string) => `${iconeSucesso} ゴミは検出されませんでした。リポジトリはクリーンです！`,
  orfaosDetectados: (qtd: number) => `\n${qtd}個の孤立ファイルが検出されました:`,
  linhaArquivoOrfao: (arquivo: string) => `- ${arquivo}`,
  confirmarRemocao: 'これらのファイルを削除してもよろしいですか？ (y/N) ',
  erroDurantePoda: (erroMensagem: string) => `[エラー] 整理中にエラーが発生しました: ${erroMensagem}`
} as const;
