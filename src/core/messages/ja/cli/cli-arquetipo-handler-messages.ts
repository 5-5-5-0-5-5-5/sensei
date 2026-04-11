// SPDX-License-Identifier: MIT

import { ICONES_FEEDBACK } from '../../shared/icons.js';

export const CliArquetipoHandlerMensagens = {
  timeoutDeteccao: `${ICONES_FEEDBACK.atencao} アーキタイプの検出がタイムアウトしました`,
  erroDeteccao: (mensagem: string) => `アーキタイプの検出中にエラーが発生しました: ${mensagem}`,
  devErroPrefixo: '[アーキタイプハンドラー] エラー:',
  falhaSalvar: (mensagem: string) => `アーキタイプの保存に失敗しました: ${mensagem}`
} as const;
