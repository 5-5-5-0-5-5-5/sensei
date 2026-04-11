// SPDX-License-Identifier: MIT

/**
 * @fileoverview インラインインターフェース検出器向けの診断メッセージ。
 * インライン型およびインターフェースを専用の型ファイルへ
 * 抽出することを提案するためのテキストテンプレートと、
 * 重複型の検出機能を提供します。
 */

import type { TipoDuplicadoArgs } from '../../../../types/analistas/detectores.js';

export const DetectorInterfacesInlineMensagens = {
  moverTipoParaTipos: (nomeTipo: string, tiposDir = 'src/tipos') => `型 '${nomeTipo}' を ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`} に移動してください`,
  interfaceExportadaParaTipos: (nomeInterface: string, tiposDir = 'src/tipos') => `エクスポートされたインターフェース '${nomeInterface}' は ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`} に配置する必要があります`,
  interfaceComplexaParaTipos: (nomeInterface: string, tiposDir = 'src/tipos') => `複雑なインターフェース '${nomeInterface}' は ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`} に移動する必要があります`,
  tipoDuplicado: (args: TipoDuplicadoArgs) => `型 {${args.propriedades.join(', ')}...} が${args.totalOcorrencias}回重複 ${args.contextoDesc} - '${args.nomesSugeridos}Type'として抽出してください`
} as const;
