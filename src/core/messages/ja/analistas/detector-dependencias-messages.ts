// SPDX-License-Identifier: MIT

/**
 * @fileoverview 依存関係検出器向けの診断メッセージ。
 * 外部依存性のimport/require、長い相対パス、
 * 存在しないファイル、require/importの混在使用、
 * 循環インポート、その他のインポートの悪習を検出するための
 * テキストテンプレートを提供します。
 */

export const DetectorDependenciasMensagens = {
  importDependenciaExterna: (val: string) => `外部依存性のインポート: '${val}'`,
  importRelativoLongo: (val: string) => `相対インポートが上りすぎるディレクトリ: '${val}'`,
  importJsEmTs: (val: string) => `TypeScriptでの.jsファイルのインポート: '${val}'`,
  importArquivoInexistente: (val: string) => `存在しないファイルのインポート: '${val}'`,
  requireDependenciaExterna: (val: string) => `外部依存性のrequire: '${val}'`,
  requireRelativoLongo: (val: string) => `相対requireが上りすぎるディレクトリ: '${val}'`,
  requireJsEmTs: (val: string) => `TypeScriptでの.jsファイルのrequire: '${val}'`,
  requireArquivoInexistente: (val: string) => `存在しないファイルのrequire: '${val}'`,
  importUsadoRegistroDinamico: (nome: string) => `インポート '${nome}' は動的登録（ヒューリスティック）経由で使用されています`,
  usoMistoRequireImport: '同じファイル内でrequireとimportが混在して使用されています。いずれかのスタイルに統一してください。',
  importCircularSelf: '循環インポートが検出されました: ファイルが自身をインポートしています。',
  dependenciaCircular: (totalArquivos: number, caminhoCompleto: string) => `循環依存が検出されました (${totalArquivos}ファイル): ${caminhoCompleto}`
} as const;
