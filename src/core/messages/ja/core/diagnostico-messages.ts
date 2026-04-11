// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// 正当性: メッセージヘルパーのインライン型
/**
 * 診断コマンドのメッセージ
 *
 * リポジトリ診断に関連するすべてのメッセージを一元化します
 */

import type { ModoOperacao } from '@';

/**
 * 診断アイコン
 */
const ICONES_DIAGNOSTICO = {
  inicio: '[SCAN]',
  progresso: '[...]',
  arquivos: '[DIR]',
  analise: '[SCAN]',
  arquetipos: '[ARQ]',
  guardian: '[GUARD]',
  autoFix: '[FIX]',
  export: '[EXP]',
  sucesso: '[OK]',
  aviso: '[WARN]',
  erro: '[ERR]',
  info: '[i]',
  dica: '[TIP]',
  executive: '[STATS]',
  rapido: '[FAST]'
} as const;

/**
 * モード別の開始メッセージ
 */
export const MENSAGENS_INICIO: Record<ModoOperacao, string> = {
  compact: `${ICONES_DIAGNOSTICO.inicio} 診断（コンパクトモード）`,
  full: `${ICONES_DIAGNOSTICO.inicio} 完全診断を開始します`,
  executive: `${ICONES_DIAGNOSTICO.executive} エグゼクティブ分析（重要な項目のみ）`,
  quick: `${ICONES_DIAGNOSTICO.rapido} クイック分析`
};

/**
 * 進行状況メッセージ
 */
export const MENSAGENS_PROGRESSO = {
  varredura: (total: number) => `${ICONES_DIAGNOSTICO.arquivos} ${total}件のファイルをスキャン中...`,
  analise: (atual: number, total: number) => `${ICONES_DIAGNOSTICO.analise} 分析中: ${atual}/${total}`,
  arquetipos: `${ICONES_DIAGNOSTICO.arquetipos} プロジェクト構造を検出中...`,
  guardian: `${ICONES_DIAGNOSTICO.guardian} 整合性を確認中...`,
  autoFix: (modo: string) => `${ICONES_DIAGNOSTICO.autoFix} 修正を適用中（モード: ${modo}）...`,
  export: (formato: string) => `${ICONES_DIAGNOSTICO.export} レポートをエクスポート中（${formato}）...`
} as const;

/**
 * 完了メッセージ
 */
export const MENSAGENS_CONCLUSAO = {
  sucesso: (ocorrencias: number) => `${ICONES_DIAGNOSTICO.sucesso} 診断完了: ${ocorrencias}件の発生箇所が見つかりました`,
  semProblemas: `${ICONES_DIAGNOSTICO.sucesso} 問題は見つかりませんでした！コードは良好な状態です。`,
  exportado: (caminho: string) => `${ICONES_DIAGNOSTICO.export} レポートを保存しました: ${caminho}`
} as const;

/**
 * エラーメッセージ
 */
export const MENSAGENS_ERRO = {
  falhaAnalise: (erro: string) => `${ICONES_DIAGNOSTICO.erro} 分析に失敗しました: ${erro}`,
  falhaExport: (erro: string) => `${ICONES_DIAGNOSTICO.erro} エクスポートに失敗しました: ${erro}`,
  falhaGuardian: (erro: string) => `${ICONES_DIAGNOSTICO.erro} Guardianに失敗しました: ${erro}`,
  falhaAutoFix: (erro: string) => `${ICONES_DIAGNOSTICO.erro} 自動修正に失敗しました: ${erro}`,
  flagsInvalidas: (erros: string[]) => `${ICONES_DIAGNOSTICO.erro} 無効なフラグ:\n${erros.map(e => `  • ${e}`).join('\n')}`
} as const;

/**
 * 警告メッセージ
 */
export const MENSAGENS_AVISO = {
  modoFast: `${ICONES_DIAGNOSTICO.info} ファストモードが有効（PROMETHEUS_TEST_FAST=1）`,
  semMutateFS: `${ICONES_DIAGNOSTICO.aviso} 自動修正は無効です。`,
  guardianDesabilitado: `${ICONES_DIAGNOSTICO.info} guardianは実行されませんでした`,
  arquetiposTimeout: `${ICONES_DIAGNOSTICO.aviso} アーキタイプの検出がタイムアウトしました`
} as const;

/**
 * フィルターメッセージ
 */
export const MENSAGENS_FILTROS = {
  titulo: 'アクティブなフィルター',
  include: (patterns: string[]) => `Include: ${patterns.length > 0 ? patterns.join(', ') : 'なし'}`,
  exclude: (patterns: string[]) => `Exclude: ${patterns.length > 0 ? patterns.join(', ') : 'デフォルトパターン'}`,
  nodeModules: (incluido: boolean) => `node_modules: ${incluido ? `${ICONES_DIAGNOSTICO.sucesso} 含む` : `${ICONES_DIAGNOSTICO.aviso} 除外（デフォルト）`}`
} as const;

/**
 * 統計メッセージ
 */
export const MENSAGENS_ESTATISTICAS = {
  titulo: '分析統計',
  arquivos: (total: number) => `分析済みファイル数: ${total}`,
  ocorrencias: (total: number) => `発見された発生箇所: ${total}`,
  porTipo: (tipo: string, count: number) => `  • ${tipo}: ${count}`,
  duracao: (ms: number) => {
    if (ms < 1000) return `所要時間: ${ms}ms`;
    if (ms < 60000) return `所要時間: ${(ms / 1000).toFixed(1)}秒`;
    const min = Math.floor(ms / 60000);
    const seg = Math.floor(ms % 60000 / 1000);
    return `所要時間: ${min}分 ${seg}秒`;
  }
} as const;

/**
 * Guardian メッセージ
 */
export const MENSAGENS_GUARDIAN = {
  iniciando: `${ICONES_DIAGNOSTICO.guardian} Guardianの確認を開始中...`,
  baseline: '既存のベースラインを使用します',
  fullScan: 'フルスキャン有効（ignoreを無視）',
  saveBaseline: '新しいベースラインを保存中...',
  status: {
    verde: `${ICONES_DIAGNOSTICO.sucesso} Guardian: ステータス緑（整合性正常）`,
    amarelo: `${ICONES_DIAGNOSTICO.aviso} Guardian: ステータス黄（注意が必要）`,
    vermelho: `${ICONES_DIAGNOSTICO.erro} Guardian: ステータス赤（重要な問題）`
  },
  drift: (count: number) => `ドリフト検出: ベースラインから${count}件の変更あり`
} as const;

// MENSAGENS_AUTOFIXは統合のためcorrecoes-messages.tsに移動しました

/**
 * アーキタイプメッセージ
 */
export const MENSAGENS_ARQUETIPOS = {
  detectando: `${ICONES_DIAGNOSTICO.arquetipos} プロジェクト構造を検出中...`,
  identificado: (tipo: string, confianca: number) => `アーキタイプを識別しました: ${tipo}（信頼度${confianca}%）`,
  multiplos: (count: number) => `${count}件の候補アーキタイプが見つかりました`,
  salvando: `カスタムアーキタイプを保存中...`,
  salvo: (caminho: string) => `${ICONES_DIAGNOSTICO.sucesso} アーキタイプを保存しました: ${caminho}`
} as const;

/**
 * ブロックテンプレート
 */
export const MODELOS_BLOCO = {
  sugestoes: {
    titulo: 'クイック提案',
    formatarFlag: (flag: string, descricao: string) => `${flag}: ${descricao}`,
    formatarDica: (dica: string) => `${ICONES_DIAGNOSTICO.dica} ${dica}`
  },
  resumo: {
    titulo: '診断サマリー',
    secoes: {
      filtros: '適用されたフィルター',
      estatisticas: '統計',
      arquetipos: 'プロジェクト構造',
      guardian: '整合性（Guardian）',
      autoFix: '自動修正'
    }
  }
} as const;

/**
 * フラグ提案ブロックをフォーマットします
 */
export function formatarBlocoSugestoes(flagsAtivas: string[], dicas: string[]): string[] {
  const linhas: string[] = [];
  linhas.push(''); // 空行
  linhas.push(`┌── ${MODELOS_BLOCO.sugestoes.titulo} ─────────────────────────────────────────`);
  if (flagsAtivas.length > 0) {
    linhas.push(`アクティブなフラグ: ${flagsAtivas.join(' ')}`);
  } else {
    linhas.push('特別なフラグは検出されませんでした');
  }
  if (dicas.length > 0) {
    linhas.push('');
    linhas.push('有用な情報:');
    for (const dica of dicas) {
      linhas.push(`  ${dica}`);
    }
  }
  linhas.push('└───────────────────────────────────────────────────────────────');
  linhas.push(''); // 空行

  return linhas;
}

/**
 * 統計サマリーをフォーマットします
 */
export function formatarResumoStats(stats: {
  arquivos: number;
  ocorrencias: number;
  duracao: number;
  porTipo?: Record<string, number>;
}): string[] {
  const linhas: string[] = [];
  linhas.push(''); // 空行
  linhas.push(`┌── ${MODELOS_BLOCO.resumo.secoes.estatisticas} ─────────────────────────────────────────`);
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.arquivos(stats.arquivos)}`);
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.ocorrencias(stats.ocorrencias)}`);
  if (stats.porTipo && Object.keys(stats.porTipo).length > 0) {
    linhas.push('');
    linhas.push('  種類別:');
    for (const [tipo, count] of Object.entries(stats.porTipo)) {
      linhas.push(`    ${MENSAGENS_ESTATISTICAS.porTipo(tipo, count)}`);
    }
  }
  linhas.push('');
  linhas.push(`  ${MENSAGENS_ESTATISTICAS.duracao(stats.duracao)}`);
  linhas.push('└───────────────────────────────────────────────────────────────');
  linhas.push(''); // 空行

  return linhas;
}

/**
 * JSONモードのメッセージをフォーマットします
 */
export function formatarModoJson(ascii: boolean): string {
  return `${ICONES_DIAGNOSTICO.info} 構造化JSON出力${ascii ? '（ASCIIエスケープ）' : ''}が有効です`;
}

/**
 * コマンドのデフォルトヘッダーとテキスト
 */
export const CABECALHOS = {
  analistas: {
    tituloFast: `${ICONES_DIAGNOSTICO.info} 登録済みアナリスト（FAST MODE）`,
    titulo: `${ICONES_DIAGNOSTICO.info} 登録済みアナリスト`,
    mdTitulo: '# 登録済みアナリスト'
  },
  diagnostico: {
    flagsAtivas: 'アクティブなフラグ:',
    informacoesUteis: '有用な情報:'
  },
  reestruturar: {
    prioridadeDomainsFlat: `${ICONES_DIAGNOSTICO.aviso} --domains と --flat が指定されました。--domains を優先します。`,
    planoVazioFast: `${ICONES_DIAGNOSTICO.info} 空のプラン: 提案された移動はありません。（FAST MODE）`,
    nenhumNecessarioFast: `${ICONES_DIAGNOSTICO.sucesso} 構造修正は不要です。（FAST MODE）`,
    conflitosDetectadosFast: (count: number) => `${ICONES_DIAGNOSTICO.aviso} 競合検出: ${count}件（FAST MODE）`
  }
} as const;
