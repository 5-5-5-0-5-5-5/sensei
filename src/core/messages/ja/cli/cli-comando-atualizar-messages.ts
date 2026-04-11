// SPDX-License-Identifier: MIT

export const CliAtualizarExtraMensagens = {
  descricao: '整合性が保たれている場合、Prometheusを更新します',
  iniciandoAtualizacao: '\n🔄 更新プロセスを開始します...\n',
  guardianIntegridadeValidada: '{icone} Guardian: 整合性が検証されました。更新を続行します。',
  guardianBaselineAlterado: '🌀 Guardianが新しいベースラインを生成するか、変更を検出しました。注意して続行します。',
  recomendadoGuardianDiff: '推奨: 更新前に `prometheus guardian --diff` と `prometheus guardian --accept-baseline` を実行してください。',
  falhaAplicarFlags: 'フラグの適用に失敗しました: {erro}',
} as const;
