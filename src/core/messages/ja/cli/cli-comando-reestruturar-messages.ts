// SPDX-License-Identifier: MIT

import { ICONES_ACAO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_STATUS } from '../../shared/icons.js';

export const CliComandoReestruturarMensagens = {
  inicio: `\n${ICONES_COMANDO.reestruturar} 再構築プロセスを開始します...\n`,
  spinnerCalculandoPlano: `${ICONES_DIAGNOSTICO.progresso} 再構築プランを計算中...`,
  planoSugeridoFast: (origem: string, moverLen: number) => `${ICONES_STATUS.ok} 推奨プラン (${origem}) 高速: ${moverLen}件の移動`,
  dryRunFast: 'ドライランがリクエストされました (--somente-plano)。 (高速モード)',
  reestruturacaoConcluidaFast: (moverLen: number) => `${ICONES_STATUS.ok} 再構築が完了しました: ${moverLen}件の移動。 (高速モード)`,
  planoCalculadoFastSemAplicar: '高速モードでプランを計算しました（--auto なしではアクションは適用されません）。',
  erroDuranteReestruturacao: (erroMensagem: string) => `${ICONES_STATUS.falha} 再構築中にエラーが発生しました: ${erroMensagem}`,
  spinnerPlanoVazio: '空のプラン: 推奨される移動はありません。',
  spinnerPlanoSugerido: (origem: string, moverLen: number) => `推奨プラン (${origem}): ${moverLen}件の移動`,
  spinnerConflitosDetectados: (qtd: number) => `競合が検出されました: ${qtd}件`,
  spinnerSemPlanoSugestao: '推奨プランがありません（候補がないかエラー）。発生回数を使用します。',
  dryRunCompleto: 'ドライランがリクエストされました (--somente-plano)。アクションは適用されませんでした。',
  dicaParaAplicar: '実際の移動を適用するには、--auto（または --aplicar）フラグを付けて再実行してください。',
  fallbackProblemasEstruturais: (qtd: number) => `\n${qtd}件の構造問題が修正対象として検出されました:`,
  fallbackLinhaOcorrencia: (tipo: string, rel: string, mensagem: string) => `- [${tipo}] ${rel}: ${mensagem}`,
  nenhumNecessario: '構造修正は不要です。リポジトリは既に最適化されています！',
  canceladoErroPrompt: `${ICONES_STATUS.falha} 再構築がキャンセルされました。（プロンプトエラー）`,
  canceladoUseAuto: `${ICONES_STATUS.falha} 再構築がキャンセルされました。（プロンプトなしで適用するには --auto を使用してください）`,
  spinnerAplicando: `${ICONES_ACAO.correcao} 移動を適用中...`,
  reestruturacaoConcluida: (qtd: number, frase: string) => `再構築が完了しました: ${qtd}件 ${frase}。`,
  falhaReestruturacao: '再構築に失敗しました。'
} as const;
