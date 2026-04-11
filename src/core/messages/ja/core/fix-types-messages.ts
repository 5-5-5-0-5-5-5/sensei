// SPDX-License-Identifier: MIT
/**
 * fix-typesコマンドのメッセージ
 *
 * fix-typesコマンドに関連するすべてのメッセージ、テキスト、テンプレートを一元化します。
 * このコマンドはTypeScriptコード内の安全でない型（any/unknown）を検出し、分類します。
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_RELATORIO, ICONES_STATUS, ICONES_TIPOS } from '../../shared/icons.js';

/**
 * 安全でない型のカテゴリー設定
 */
export const CATEGORIAS_TIPOS = {
  LEGITIMO: {
    icone: ICONES_TIPOS.legitimo,
    nome: '正当',
    descricao: 'unknownの正しい使用 - アクション不要',
    confidenciaMin: 100
  },
  MELHORAVEL: {
    icone: ICONES_TIPOS.melhoravel,
    nome: '改善可能',
    descricao: 'より具体的になる可能性があります - 手動レビュー推奨',
    confidenciaMin: 70
  },
  CORRIGIR: {
    icone: ICONES_TIPOS.corrigir,
    nome: '修正',
    descricao: '置き換えが必要 - 自動修正可能',
    confidenciaMin: 95
  }
} as const;

/**
 * コマンドの開始/ヘッダーメッセージ
 */
const MENSAGENS_INICIO = {
  titulo: `${ICONES_COMANDO.fixTypes} 安全でない型の分析を開始中...`,
  analisando: (target: string) => `${ICONES_ARQUIVO.diretorio} 分析対象: ${target}`,
  confianciaMin: (min: number) => `${ICONES_DIAGNOSTICO.stats} 最低信頼度: ${min}%`,
  modo: (dryRun: boolean) => `${dryRun ? ICONES_ACAO.analise : ICONES_ACAO.correcao} モード: ${dryRun ? '分析（ドライラン）' : '修正を適用'}`
} as const;

/**
 * 進行状況/ステータスメッセージ
 */
const MENSAGENS_PROGRESSO = {
  processandoArquivos: (count: number) => `${ICONES_ARQUIVO.diretorio} ${count}件のファイルを処理中...`,
  arquivoAtual: (arquivo: string, count: number) => `${ICONES_ARQUIVO.arquivo} ${arquivo}: ${count}件の発生箇所`
} as const;

/**
 * サマリー/統計メッセージ
 */
export const MENSAGENS_RESUMO = {
  encontrados: (count: number) => `${count}件の安全でない型が見つかりました:`,
  tituloCategorizacao: `${ICONES_DIAGNOSTICO.stats} 分類分析:`,
  confianciaMedia: (media: number) => `${ICONES_DIAGNOSTICO.stats} 平均信頼度: ${media}%`,
  porcentagem: (count: number, total: number) => {
    const pct = total > 0 ? Math.round(count / total * 100) : 0;
    return `${count}件（${pct}%）`;
  }
} as const;

/**
 * ヒント/ヘルプメッセージ
 */
export const DICAS = {
  removerDryRun: '[ヒント] 修正を適用するには --dry-run フラグを削除してください',
  usarInterativo: '[ヒント] 各修正を確認するには --interactive を使用してください',
  ajustarConfianca: (atual: number) => `${ICONES_FEEDBACK.dica} --confidence <数値> を使用して閾値を調整してください（現在: ${atual}%）`,
  revisar: (categoria: string) => `${ICONES_FEEDBACK.dica} ${categoria} のケースを手動で確認してください`
} as const;

/**
 * カテゴリ別の提案アクション
 */
export const ACOES_SUGERIDAS = {
  LEGITIMO: ['これらのケースは正しく、現状のまま維持すべきです', '追加のアクションは不要です'],
  MELHORAVEL: ['可能であれば、より具体的な型への置き換えを検討してください', '将来のリファクタリング時に確認してください', 'unknownの使用理由を説明するコメントを追加してください'],
  CORRIGIR: ['これらのケースの修正を優先してください', '特定のTypeScript型に置き換えてください', '必要に応じて型ガードを使用してください']
} as const;

/**
 * エラー/警告メッセージ
 */
const MENSAGENS_ERRO = {
  correcaoNaoImplementada: '完全な自動修正はまだ実装されていません',
  sistemaDesenvolvimento: `${ICONES_FEEDBACK.foguete} 高度な自動修正システムは開発中です`,
  requisitoAnalise: '安全な修正にはAST分析と型推論が必要です',
  detectorNaoEncontrado: '安全でない型の検出器がアナリストレジストリに見つかりません',
  modulosNaoEncontrados: '修正モジュールが見つかりません'
} as const;

/**
 * 成功メッセージ
 */
export const MENSAGENS_SUCESSO = {
  nenhumTipoInseguro: `${ICONES_STATUS.ok} 安全でない型は検出されませんでした！コードは適切な型の安全性を備えています。`,
  nenhumAltaConfianca: `${ICONES_STATUS.ok} 高信頼度の修正は見つかりませんでした`,
  nenhumaCorrecao: '修正は適用されませんでした（--confidence で閾値を調整してください）'
} as const;

/**
 * src/cli/** で使用されるCLIフロー固有のメッセージ（行とヘッダー）
 */
export const MENSAGENS_CLI_CORRECAO_TIPOS = {
  linhaEmBranco: '',
  erroExecutar: (mensagem: string) => `fix-types の実行エラー: ${mensagem}`,
  linhaResumoTipo: (texto: string) => `  ${texto}`,
  exemplosDryRunTitulo: `${ICONES_RELATORIO.lista} 見つかった例（ドライラン）:`,
  exemploLinha: (icone: string, relPath: string | undefined, linha: string) => `  ${icone} ${relPath}:${linha}`,
  exemploMensagem: (mensagem: string) => `     └─ ${mensagem}`,
  debugVariavel: (nome: string) => `     └─ 変数: ${nome}`,
  maisOcorrencias: (qtd: number) => `  ... その他 ${qtd}件の発生箇所`,
  aplicandoCorrecoesAuto: `${ICONES_ACAO.correcao} 自動修正を適用中...`,
  exportandoRelatorios: `${ICONES_ACAO.export} レポートをエクスポート中...`,
  // 詳細ログ / ログ出力
  verboseAnyDetectado: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.any} ${arquivo}:${linha} - any が検出されました（修正推奨）`,
  verboseAsAnyCritico: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.corrigir} ${arquivo}:${linha} - "as any" が検出されました（重要 - 修正必須）`,
  verboseAngleAnyCritico: (arquivo: string, linha: string) => `  ${ICONES_TIPOS.corrigir} ${arquivo}:${linha} - "<any>" が検出されました（重要 - 非推奨構文）`,
  verboseUnknownCategoria: (icone: string, arquivo: string, linha: string, categoria: string, confianca: number) => `  ${icone} ${arquivo}:${linha} - ${categoria}（${confianca}%）`,
  verboseMotivo: (motivo: string) => `     └─ ${motivo}`,
  verboseSugestao: (sugestao: string) => `     └─ ${ICONES_FEEDBACK.dica} ${sugestao}`,
  verboseVariantesTitulo: `     └─ ${ICONES_DIAGNOSTICO.stats} 代替の可能性:`,
  verboseVarianteItem: (idxBase1: number, variante: string) => `        ${idxBase1}. ${variante}`,
  analiseDetalhadaSalva: `${ICONES_ARQUIVO.arquivo} 詳細分析を保存しました: .prometheus/fix-types-analise.json`,
  altaConfiancaTitulo: (qtd: number) => `${ICONES_DIAGNOSTICO.stats} ${qtd}件の高信頼度修正（≥85%）:`,
  altaConfiancaLinha: (relPath: string | undefined, linha: string, confianca: number) => `  ${ICONES_TIPOS.corrigir} ${relPath}:${linha}（${confianca}%）`,
  altaConfiancaDetalhe: (texto: string) => `     └─ ${texto}`,
  altaConfiancaMais: (qtd: number) => `  ... その他 ${qtd}件の修正`,
  incertosTitulo: (qtd: number) => `${ICONES_FEEDBACK.pergunta} ${qtd}件の分析が不確実なケース（信頼度70%未満）:`,
  incertosIntro: '   これらのケースは注意深い手動レビューが必要です - 複数の可能性が検出されています',
  incertosLinha: (relPath: string | undefined, linha: string, confianca: number) => `  ${ICONES_TIPOS.melhoravel} ${relPath}:${linha}（${confianca}%）`,
  incertosMais: (qtd: number) => `  ... その他 ${qtd}件の不確実なケース（.prometheus/fix-types-analise.json を参照）`,
  correcoesResumoSucesso: (qtd: number) => `${ICONES_STATUS.ok} ${qtd}件のファイルが修正されました`,
  correcoesResumoLinhaOk: (arquivo: string, linhas: number) => `   ロギング  ${arquivo}: ${linhas}行が変更されました`,
  correcoesResumoLinhaErro: (arquivo: string, erro: string | undefined) => `   ${ICONES_STATUS.falha} ${arquivo}: ${erro}`,
  correcoesResumoFalhas: (qtd: number) => `${ICONES_STATUS.falha} ${qtd}件のファイルでエラーが発生しました`,
  dryRunAviso: (iconeInicio: string) => `${iconeInicio} ドライランモードが有効 - 変更は適用されません`,
  templatePasso: (passo: string) => `  ${passo}`
} as const;

/**
 * ログやエクスポートに表示される分類テキスト（理由/提案）。
 */
export const TEXTOS_CATEGORIZACAO_CORRECAO_TIPOS = {
  anyMotivo: 'anyは安全ではありません - 特定の型に置き換えてください',
  anySugestao: '変数の使用状況を分析して正しい型を推論してください',
  asAnyMotivo: '型アサーション "as any" は型の安全性を完全に無効にします',
  asAnySugestao: '重要: 特定の型に置き換えるか、ランタイムバリデーション付きのunknownを使用してください',
  angleAnyMotivo: '旧来の型キャスト <any> は型の安全性を無効にします',
  angleAnySugestao: '重要: 最新の "as" 構文に移行し、特定の型を使用してください',
  semContextoMotivo: 'コンテキストを分析できませんでした',
  semContextoSugestao: '手動で確認してください'
} as const;

/**
 * 最終サマリーテンプレート
 */
export const TEMPLATE_RESUMO_FINAL = {
  titulo: `${ICONES_RELATORIO.detalhado} 手動で修正を適用するには:`,
  passos: ['上記の分類されたケースを確認してください', `正当（${ICONES_TIPOS.legitimo}）: 現状のまま維持`, `改善可能（${ICONES_TIPOS.melhoravel}）: より具体的な型を検討`, `修正（${ICONES_TIPOS.corrigir}）: 特定の型に置き換え`, '修正後に `npm run lint` を実行してください']
} as const;

/**
 * コマンドで使用される絵文字とアイコン
 */
const ICONES = {
  inicio: ICONES_COMANDO.fixTypes,
  aplicando: '[>]',
  analise: '[>]',
  pasta: '[DIR]',
  arquivo: '[FILE]',
  alvo: '[>]',
  edicao: '[EDIT]',
  grafico: '[GRAPH]',
  lampada: '[TIP]',
  foguete: '[>>]',
  nota: '[NOTE]',
  checkbox: '[OK]',
  setinha: '└─',
  ...CATEGORIAS_TIPOS
} as const;
export const ICONES_FIX_TYPES = ICONES;
export const MENSAGENS_ERRO_FIX_TYPES = MENSAGENS_ERRO;
export const MENSAGENS_INICIO_FIX_TYPES = MENSAGENS_INICIO;
export const MENSAGENS_PROGRESSO_FIX_TYPES = MENSAGENS_PROGRESSO;
export const MENSAGENS_SUCESSO_FIX_TYPES = MENSAGENS_SUCESSO;

/**
 * アイコンとカウンター付きの安全でない型メッセージをフォーマットします
 */
export function formatarTipoInseguro(tipo: string, count: number): string {
  const icone = tipo.includes('any') ? ICONES_TIPOS.any : ICONES_TIPOS.unknown;
  const plural = count !== 1 ? 's' : '';
  return `${icone} ${tipo}: ${count}件の発生${plural}`;
}

/**
 * 個別の発生箇所行をフォーマットします
 */
export function formatarOcorrencia(relPath: string, linha: number | undefined): string {
  return `  ${ICONES.setinha} ${relPath}:${linha || '?'}`;
}

/**
 * コンテキスト付きメッセージをフォーマットします
 */
export function formatarComContexto(mensagem: string, indentLevel: number = 1): string {
  const indent = '  '.repeat(indentLevel);
  return `${indent}${ICONES.setinha} ${mensagem}`;
}

/**
 * 修正提案をフォーマットします
 */
export function formatarSugestao(sugestao: string): string {
  return `     ${ICONES.setinha} ${ICONES.lampada} ${sugestao}`;
}

/**
 * カテゴリサマリーテキストを生成します
 */
export function gerarResumoCategoria(categoria: keyof typeof CATEGORIAS_TIPOS, count: number, total: number): string[] {
  const config = CATEGORIAS_TIPOS[categoria];
  const porcentagem = MENSAGENS_RESUMO.porcentagem(count, total);
  return [categoria === 'CORRIGIR' ? `${config.icone} ${config.nome}: ${porcentagem}` : categoria === 'MELHORAVEL' ? `${config.icone} ${config.nome}: ${porcentagem}` : `${config.icone} ${config.nome}: ${porcentagem}`, `   ${ICONES.setinha} ${config.descricao}`];
}

/**
 * デバッグメッセージ（DEV_MODE のみ）
 */
export const DEPURACAO = {
  categorizacao: (arquivo: string, tipo: string, categoria: string) => `[DEBUG] ${arquivo} - ${tipo} → ${categoria}`,
  confianca: (tipo: string, valor: number) => `[DEBUG] ${tipo} の信頼度: ${valor}%`
} as const;
