// SPDX-License-Identifier: MIT

/**
 * @fileoverview プロジェクト構造検出器向けの診断メッセージ。
 * モノレポ、フルスタック構造、
 * バックエンド/フロントエンドの兆候、複数のエントリポイント、設定ファイル、
 * ディレクトリ命名規則を検出するためのテキストテンプレートを提供します。
 */

type EntrypointsAgrupadosArgs = {
  previewGrupos: string;
  sufixoOcultos?: string;
};
export const DetectorEstruturaMensagens = {
  monorepoDetectado: 'モノレポ構造が検出されました。',
  monorepoSemPackages: 'packages/フォルダのないモノレポ。',
  fullstackDetectado: 'フルスタック構造が検出されました。',
  pagesSemApi: 'プロジェクトにpages/はありますがapi/がありません。',
  estruturaMista: 'プロジェクトにsrc/とpackages/（モノレポ）の両方が同時に存在します。整理を検討してください。',
  muitosArquivosRaiz: 'プロジェクトルートにファイルが多すぎます。フォルダへの整理を検討してください。',
  sinaisBackend: 'バックエンドの兆候が検出されました（controllers/、prisma/、api/）。',
  sinaisFrontend: 'フロントエンドの兆候が検出されました（components/、pages/）。',
  projetoGrandeSemSrc: 'src/フォルダのない大規模プロジェクト。ソースコードの整理を検討してください。',
  arquivosConfigDetectados: (detectados: string[]) => `設定ファイルが検出されました: ${detectados.join(', ')}`,
  multiplosEntrypointsAgrupados: ({
    previewGrupos,
    sufixoOcultos
  }: EntrypointsAgrupadosArgs) => sufixoOcultos && sufixoOcultos.length > 0 ? `プロジェクトには複数のエントリポイントがあります（ディレクトリ別にグループ化）: ${previewGrupos} … (${sufixoOcultos}件を非表示)` : `プロジェクトには複数のエントリポイントがあります（ディレクトリ別にグループ化）: ${previewGrupos}`,
  multiplosEntrypointsLista: (preview: string[], resto: number) => resto > 0 ? `プロジェクトには複数のエントリポイントがあります: ${preview.join(', ')} … (他+${resto}件を非表示)` : `プロジェクトには複数のエントリポイントがあります: ${preview.join(', ')}`,
  nomeDiretorioNaoConforme: (atual: string, esperado: string) => `ディレクトリ '${atual}' は命名規則に従っていません。期待される名前: '${esperado}'。`
} as const;
