// SPDX-License-Identifier: MIT
/**
 * 自動修正メッセージ
 *
 * 以下の関連するすべてのメッセージを一元化します：
 * - クイックフィックス（fix-any-to-proper-type、fix-unknown など）
 * - 管理者（インポート、構造、型）
 * - 自動修正全般
 */

import { buildTypesRelPathPosix, getTypesDirectoryDisplay } from '../../../../core/config/conventions.js';
import { ICONES } from '../../shared/icons.js';

/**
 * クイックフィックスメッセージ - Any/Unknown
 */
export const MENSAGENS_CORRECAO_TIPOS = {
  // クイックフィックスのタイトルと説明
  fixAny: {
    title: 'anyを安全な型に置き換える',
    get description() { return `anyの使用状況を解析し、${getTypesDirectoryDisplay()} で正しい型を推論・作成します` }
  },
  fixUnknown: {
    title: 'unknownを特定の型に置き換える',
    description: '型ガードパターンを検出し、専用型を作成します'
  },
  // バリデーションメッセージ
  validacao: {
    falha: (erros: string[]) => `バリデーションに失敗しました: ${erros.join(', ')}`,
    revisar: '手動で確認してください'
  },
  // 警告と提案
  warnings: {
    confiancaBaixa: (confianca: number) => `安全でない型（any）の信頼度が非常に低いため（${confianca}%）、自動修正できません`,
    confiancaMedia: (confianca: number, tipoSugerido: string) => `安全でない型を検出しました。提案: ${tipoSugerido}（信頼度: ${confianca}%）`,
    unknownApropriado: 'ここではunknownが適切です（汎用入力または信頼度が低い）',
    useTiposCentralizados: () => `専用ディレクトリ（${getTypesDirectoryDisplay()}）で一元化された型を使用してください`,
    criarTipoDedicado: (caminho: string) => `${buildTypesRelPathPosix(caminho)} に専用型の作成を検討してください`,
    adicioneTypeGuards: () => `可能であれば、型ガードを追加するか、${getTypesDirectoryDisplay()} で専用型を作成してください`
  },
  // エラーメッセージ
  erros: {
    extrairNome: '変数名を抽出できませんでした',
    variavelNaoUsada: '未使用の変数 - 型の推論不可',
    analise: (erro: string) => `解析エラー: ${erro}`
  }
} as const;

/**
 * 自動修正メッセージ
 */
export const MENSAGENS_AUTOFIX = {
  // ステータスメッセージ
  iniciando: (modo: string) => `${ICONES.acao.correcao} 自動修正を開始します（モード: ${modo}）`,
  dryRun: `${ICONES.feedback.info} ドライラン: 修正をシミュレーション中（変更は適用されません）`,
  aplicando: (count: number) => `${count}件の修正を適用中${count !== 1 ? '' : ''}...`,
  concluido: (aplicadas: number, falhas: number) => `${ICONES.nivel.sucesso} 自動修正完了: ${aplicadas}件適用済み、${falhas}件失敗`,
  naoDisponivel: `${ICONES.feedback.info} 利用可能な自動修正はありません`,
  // フラグとモード
  flags: {
    fixSafe: `${ICONES.comando.guardian} --fix-safeフラグを検出しました: 保守的モードを有効化`,
    requireMutateFS: `${ICONES.status.falha} 現在、自動修正は利用できません。`
  },
  // 進行ログ
  logs: {
    modoConservador: `${ICONES.comando.guardian} 保守的モードが有効 - 高信頼度の修正のみを適用します`,
    validacaoEslint: `${ICONES.acao.analise} 自動修正後のESLintバリデーションを実行中...`,
    arquivoMovido: (origem: string, destino: string) => `${ICONES.status.ok} 移動完了: ${origem} → ${destino}`,
    arquivoRevertido: (origem: string, destino: string) => `↩️ ファイルを復元しました: ${destino} → ${origem}`,
    arquivoRevertidoConteudo: (origem: string, destino: string) => `↩️ 元のコンテンツでファイルを復元しました: ${destino} → ${origem}`
  },
  // 結果
  resultados: {
    sucesso: (count: number) => `${ICONES.status.ok} ${count}件のファイルが修正されました`,
    falhas: (count: number) => `${ICONES.status.falha} ${count}件のファイルでエラーが発生しました`,
    erroArquivo: (arquivo: string, erro: string) => `${ICONES.status.falha} ${arquivo}: ${erro}`
  },
  // 修正後のヒント
  dicas: {
    executarLint: `${ICONES.feedback.dica} 修正を検証するには \`npm run lint\` を実行してください`,
    executarBuild: `${ICONES.feedback.dica} コードがコンパイルされるか確認するには \`npm run build\` を実行してください`,
    removerDryRun: `${ICONES.feedback.dica} 修正を自動的に適用するには --dry-run を削除してください`,
    ajustarConfianca: `${ICONES.feedback.dica} --confidence <数値> を使用して閾値を調整してください（現在: 85%）`
  }
} as const;

/**
 * 分析レポートメッセージ
 */
export const MENSAGENS_RELATORIOS_ANALISE = {
  asyncPatterns: {
    titulo: `${ICONES.relatorio.resumo} Async/Await パターン分析`,
    padroes: `\n${ICONES.relatorio.resumo} コード使用パターン:`,
    recomendacoes: `\n${ICONES.feedback.dica} 修正推奨事項:\n`,
    critico: `${ICONES.nivel.erro} 重要（すぐに確認が必要）:`,
    alto: `\n${ICONES.feedback.atencao} 高（現在のスプリントで確認）:`,
    salvo: (caminho: string) => `${ICONES.nivel.sucesso} Asyncレポートを保存しました: ${caminho}`
  },
  fixTypes: {
    analiseSalva: `${ICONES.arquivo.json} 詳細分析を保存しました: .prometheus/fix-types-analise.json`,
    possibilidades: `└─ ${ICONES.acao.analise} 代替の可能性:`,
    sugestao: (texto: string) => `└─ ${ICONES.feedback.dica} ${texto}`,
    exportado: `${ICONES.arquivo.doc} fix-typesレポートをエクスポートしました:`
  },
  guardian: {
    baselineAceito: `${ICONES.status.ok} Guardian: ベースラインが手動で承認されました（--aceitar）。`,
    exportado: `${ICONES.arquivo.doc} Guardianレポートをエクスポートしました:`
  }
} as const;

/**
 * アーキタイプメッセージ
 */
export const MENSAGENS_ARQUETIPOS_HANDLER = {
  timeout: `${ICONES.feedback.atencao} アーキタイプの検出がタイムアウトしました`,
  salvo: (caminho: string) => `${ICONES.status.ok} カスタムアーキタイプを保存しました: ${caminho}`,
  falha: `${ICONES.feedback.atencao} アーキタイプ経由でのプランの生成に失敗しました。`,
  falhaEstrategista: `${ICONES.feedback.atencao} ストラテジストがプランの提案に失敗しました。`,
  falhaGeral: `${ICONES.feedback.atencao} 全般的なプランニングに失敗しました。`
} as const;

/**
 * プラグインメッセージ
 */
export const MENSAGENS_PLUGINS = {
  registrado: (nome: string, extensoes: string[]) => `${ICONES.status.ok} プラグイン ${nome} が登録されました。拡張機能: ${extensoes.join(', ')}`,
  configAtualizada: `${ICONES.acao.correcao} レジストリ設定が更新されました`,
  erroParsear: (linguagem: string, erro: string) => `${ICONES.feedback.atencao} ${linguagem} の解析エラー: ${erro}`
} as const;

/**
 * エグゼキューターメッセージ
 */
export const MENSAGENS_EXECUTOR = {
  analiseCompleta: (tecnica: string, arquivo: string, duracao: string) => `${ICONES.arquivo.arquivo} '${tecnica}' が ${arquivo} を ${duracao} で分析しました`
} as const;

/**
 * 統合エクスポート
 */
export const MENSAGENS_CORRECOES = {
  fixTypes: MENSAGENS_CORRECAO_TIPOS,
  autofix: MENSAGENS_AUTOFIX,
  relatorios: MENSAGENS_RELATORIOS_ANALISE,
  arquetipos: MENSAGENS_ARQUETIPOS_HANDLER,
  plugins: MENSAGENS_PLUGINS,
  executor: MENSAGENS_EXECUTOR
} as const;
