// SPDX-License-Identifier: MIT

/**
 * @fileoverview 脆弱なコード検出器向けの診断メッセージ。
 * 脆弱性の概要（重大度付き）と構造化された詳細を報告するための
 * テキストテンプレートを提供します。
 */

import type { FragilidadesDetalhesArgs } from '../../../../types/core/config/config.js';

type ErroUnknown = unknown;
function erroToMessage(erro: ErroUnknown): string {
  return erro instanceof Error ? erro.message : '不明なエラー';
}
export const DetectorCodigoFragilMensagens = {
  fragilidadesResumo: (severidade: string, resumo: string, detalhes: FragilidadesDetalhesArgs) => `脆弱性 (${severidade}): ${resumo} | 詳細: ${JSON.stringify(detalhes)}`,
  erroAnalisarCodigoFragil: (erro: ErroUnknown) => `脆弱なコード分析エラー: ${erroToMessage(erro)}`
} as const;
