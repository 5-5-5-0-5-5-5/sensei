// SPDX-License-Identifier: MIT

/**
 * @fileoverview ユーザーインターフェースのコンテキスト対応提案用メッセージ。
 * プロジェクト識別、依存関係の証拠、インポート、コードパターン、
 * ディレクトリ構造、代替技術に関するフィードバックの
 * アイコン付きテキストテンプレートを提供します。
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_FEEDBACK } from '../../shared/icons.js';

export const SugestoesContextuaisMensagens = {
  arquetipoNaoIdentificado: '固有のアーキタイプを識別できませんでした。プロジェクトにもっと構造を追加することを検討してください。',
  projetoIdentificado: (tecnologia: string | undefined, confiancaPercent: number) => `${ICONES_FEEDBACK.info} プロジェクト識別: ${tecnologia}（信頼度: ${confiancaPercent}%）`,
  evidenciaDependencia: (dependencia: string, tecnologia: string | undefined) => `${ICONES_ARQUIVO.package} 依存関係${dependencia}がプロジェクト${tecnologia}を確認`,
  evidenciaImport: (valor: string, localizacao: string | undefined) => `${ICONES_ACAO.import} インポート${valor}が${localizacao}で検出`,
  evidenciaCodigo: (localizacao: string | undefined) => `${ICONES_ARQUIVO.codigo} 固有のコードパターンが${localizacao}で検出`,
  evidenciaEstrutura: (valor: string, tecnologia: string | undefined) => `${ICONES_ARQUIVO.diretorio} 構造${valor}は${tecnologia}に典型的`,
  tecnologiasAlternativas: (alternativas: string) => `${ICONES_ACAO.analise} その他の検出された技術: ${alternativas}`,
  erroAnaliseContextual: (erro: string) => `コンテキスト分析でエラー: ${erro}`,
  erroDuranteAnalise: 'インテリジェントコンテキスト分析中にエラーが発生しました'
} as const;
