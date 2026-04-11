// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// 正当化: 提案システム用のインライン型
/**
 * 集中化された提案とヒントのシステム
 *
 * Prometheusのすべてのコンテキスト対応提案を集中化:
 * - コマンド使用のヒント
 * - コンテキストベースの提案
 * - クイックヘルプメッセージ
 * - 様々なシナリオ向けの呼びかけ
 */

import { ICONES } from '../../shared/icons.js';

/**
 * 一般コマンドの提案
 */
export const SUGESTOES_COMANDOS = {
  usarFull: `${ICONES.feedback.dica} すべての情報を含む詳細なレポートには--fullを使用`,
  usarJson: `${ICONES.feedback.dica} 構造化されたJSON出力には--jsonを使用`,
  combinarJsonExport: `${ICONES.feedback.dica} --jsonと--exportを組み合わせてレポートを保存`,
  usarExport: `${ICONES.feedback.dica} レポートをファイルに保存するには--export <パス>を使用`,
  usarInclude: `${ICONES.feedback.dica} 特定のファイルに集中するには--include <パターン>を使用`,
  usarExclude: `${ICONES.feedback.dica} ファイルを無視するには--exclude <パターン>を使用`,
  usarDryRun: `${ICONES.feedback.dica} ファイルを変更せずにシミュレートするには--dry-runを使用`,
  removerDryRun: `${ICONES.feedback.dica} 修正を適用するには--dry-runを削除`,
  usarInterativo: `${ICONES.feedback.dica} 修正ごとに確認するには--interactiveを使用`,
  usarGuardian: `${ICONES.feedback.dica} 整合性を検証するには--guardianを使用`,
  usarBaseline: `${ICONES.feedback.dica} 参照ベースラインを生成するには--baselineを使用`,
  usarAutoFix: `${ICONES.feedback.dica} 自動修正を適用するには--auto-fixを使用`,
} as const;

/**
 * 診断の提案
 */
export const SUGESTOES_DIAGNOSTICO = {
  modoExecutivo: `${ICONES.diagnostico.executive} エグゼクティブモード: 重要な問題のみ表示`,
  primeiraVez: [
    `${ICONES.feedback.dica} 初めてですか？prometheus diagnosticar --fullから始めてください`,
    `${ICONES.feedback.dica} 利用可能なすべてのオプションを確認するには--helpを使用`,
  ],
  projetoGrande: [
    `${ICONES.feedback.dica} 大規模プロジェクトが検出されました - インクリメンタル分析には--includeを使用`,
    `${ICONES.feedback.dica} 最初のクイック分析には--quickを使用`,
  ],
  poucoProblemas: `${ICONES.nivel.sucesso} プロジェクトは良好な状態です！{count}件の軽微な問題のみが見つかりました。`,
  muitosProblemas: [
    `${ICONES.feedback.atencao} 多くの問題が見つかりました - 最初に重要な問題を優先してください`,
    `${ICONES.feedback.dica}  essentialのみに集中するには--executiveを使用`,
  ],
  usarFiltros: `${ICONES.feedback.dica} 焦点を絞った分析には--include/--excludeフィルタを使用`,
} as const;

/**
 * 自動修正の提案
 */
export const SUGESTOES_AUTOFIX = {
  autoFixDisponivel: `${ICONES.feedback.dica} 自動修正が利用可能です - --auto-fixを使用`,
  autoFixAtivo: `${ICONES.feedback.atencao} 自動修正が有効です！ファイルを変更せずにシミュレートするには--dry-runを使用`,
  dryRunRecomendado: `${ICONES.feedback.dica} 推奨: まず--dry-runでテスト`,
  semMutateFS: `${ICONES.feedback.atencao} 自動修正は現在利用できません`,
  validarDepois: [
    `${ICONES.feedback.dica} 修正を確認するにはnpm run lintを実行`,
    `${ICONES.feedback.dica} コードがコンパイルされるか確認するにはnpm run buildを実行`,
    `${ICONES.feedback.dica} 機能を検証するにはnpm testを実行`,
  ],
} as const;

/**
 * ガーディアンの提案
 */
export const SUGESTOES_GUARDIAN = {
  guardianDesabilitado: `${ICONES.comando.guardian} ガーディアンが無効です。整合性を検証するには--guardianを使用`,
  primeiroBaseline: [
    `${ICONES.feedback.dica} 初回実行: --baselineでベースラインを生成`,
    `${ICONES.feedback.dica} ベースラインは将来の変更の参照として機能します`,
  ],
  driftDetectado: [
    `${ICONES.feedback.atencao} ベースラインと比較して変更が検出されました`,
    `${ICONES.feedback.dica} ベースラインを更新する前に変更を確認してください`,
    `${ICONES.feedback.dica} 参照を更新するには--baselineを使用`,
  ],
  integridadeOK: `${ICONES.nivel.sucesso} 整合性が検証されました - 不正な変更はありません`,
} as const;

/**
 * 型の提案（fix-types）
 */
export const SUGESTOES_TIPOS = {
  ajustarConfianca: (atual: number) =>
    `${ICONES.feedback.dica} 閾値を調整するには--confidence <数値>を使用（現在: ${atual}%）`,
  revisar: (categoria: string) =>
    `${ICONES.feedback.dica} ${categoria}のケースを手動で確認`,
  anyEncontrado: [
    `${ICONES.feedback.atencao} 'any'型が検出されました - コードの安全性が低下します`,
    `${ICONES.feedback.dica} 'as any'と明示的なキャストの置換を優先してください`,
  ],
  unknownLegitimo: `${ICONES.nivel.sucesso} 'unknown'の正当な使用が識別されました`,
  melhoravelDisponivel: `${ICONES.feedback.dica} 改善可能なケースが見つかりました - 将来のリファクタリングで確認`,
} as const;

/**
 * アーキタイプの提案
 */
export const SUGESTOES_ARQUETIPOS = {
  monorepo: [
    `${ICONES.feedback.dica} モノレポが検出されました: ワークスペースフィルタの使用を検討`,
    `${ICONES.feedback.dica} 特定のワークスペースを分析するには--include packages/*を使用`,
  ],
  biblioteca: [
    `${ICONES.feedback.dica} ライブラリが検出されました: パブリックエクスポートとドキュメントに集中`,
    `${ICONES.feedback.dica} パブリックAPIを検証するには--guardianを使用`,
  ],
  cli: [
    `${ICONES.feedback.dica} CLIが検出されました: コマンドとフラグのテストを優先`,
    `${ICONES.feedback.dica} コマンドのエラーハンドリングを検証`,
  ],
  api: [
    `${ICONES.feedback.dica} APIが検出されました: エンドポイントとコントラクトに集中`,
    `${ICONES.feedback.dica} ルートの統合テストを検討`,
    `${ICONES.feedback.dica} APIドキュメント（OpenAPI/Swagger）を検証`,
  ],
  frontend: [
    `${ICONES.feedback.dica} フロントエンドが検出されました: コンポーネントと状態管理を優先`,
    `${ICONES.feedback.dica} アクセシビリティとパフォーマンスを検証`,
  ],
  confiancaBaixa: [
    `${ICONES.feedback.atencao} 検出の信頼度が低い: 構造はハイブリッドの可能性があります`,
    `${ICONES.feedback.dica} カスタマイズするには--criar-arquetipo --salvar-arquetipoを使用`,
  ],
} as const;

/**
 * 再構築の提案
 */
export const SUGESTOES_REESTRUTURAR = {
  backupRecomendado: [
    `${ICONES.feedback.importante} 重要: 再構築前にバックアップを作成してください！`,
    `${ICONES.feedback.dica} 構造変更前にgitでバージョン管理`,
  ],
  validarDepois: [
    `${ICONES.feedback.dica} 再構築後にテストを実行`,
    `${ICONES.feedback.dica} インポートと参照を検証`,
  ],
  usarDryRun: `${ICONES.feedback.dica} 初めてですか？提案された変更を確認するには--dry-runを使用`,
} as const;

/**
 * プルーニングの提案
 */
export const SUGESTOES_PODAR = {
  cuidado: [
    `${ICONES.feedback.atencao} プルーニングはファイルを永久に削除します！`,
    `${ICONES.feedback.importante} バックアップまたはバージョン管理があることを確認`,
  ],
  revisar: `${ICONES.feedback.dica} 確認前にファイルリストを確認`,
  usarDryRun: `${ICONES.feedback.dica} 削除せずにプルーニングをシミュレートするには--dry-runを使用`,
} as const;

/**
 * メトリクスの提案
 */
export const SUGESTOES_METRICAS = {
  baseline: [
    `${ICONES.feedback.dica} 将来の比較のためにベースラインを生成`,
    `${ICONES.feedback.dica} CI/CD統合には--jsonを使用`,
  ],
  tendencias: `${ICONES.feedback.dica} トレンドを追跡するために定期的に実行`,
  comparacao: `${ICONES.feedback.dica} 以前の実行と比較`,
} as const;

/**
 * ゼラドーの提案
 */
export const SUGESTOES_ZELADOR = {
  imports: [
    `${ICONES.feedback.dica} インポートのゼラドーがパスを自動的に修正`,
    `${ICONES.feedback.dica} 提案された修正を確認するには--dry-runを使用`,
  ],
  estrutura: [
    `${ICONES.feedback.dica} 構造のゼラドーがパターン別にファイルを整理`,
    `${ICONES.feedback.dica} prometheus.config.jsonでパターンを設定`,
  ],
} as const;

/**
 * コンテキスト対応提案 - ヘルパー関数
 */
export function gerarSugestoesContextuais(contexto: {
  comando: string;
  temProblemas: boolean;
  countProblemas?: number;
  autoFixDisponivel?: boolean;
  guardianAtivo?: boolean;
  arquetipo?: string;
  flags?: string[];
}): string[] {
  const sugestoes: string[] = [];

  // コマンド別の提案
  switch (contexto.comando) {
    case 'diagnosticar':
      if (!contexto.temProblemas) {
        if (contexto.countProblemas !== undefined) {
          sugestoes.push(
            SUGESTOES_DIAGNOSTICO.poucoProblemas.replace(
              '{count}',
              String(contexto.countProblemas),
            ),
          );
        }
      } else if (contexto.countProblemas && contexto.countProblemas > 50) {
        sugestoes.push(...SUGESTOES_DIAGNOSTICO.muitosProblemas);
      }

      if (
        contexto.autoFixDisponivel &&
        !contexto.flags?.includes('--auto-fix')
      ) {
        sugestoes.push(SUGESTOES_AUTOFIX.autoFixDisponivel);
      }

      if (!contexto.guardianAtivo && !contexto.flags?.includes('--guardian')) {
        sugestoes.push(SUGESTOES_GUARDIAN.guardianDesabilitado);
      }

      if (!contexto.flags?.includes('--full') && contexto.temProblemas) {
        sugestoes.push(SUGESTOES_COMANDOS.usarFull);
      }
      break;

    case 'fix-types':
      if (contexto.autoFixDisponivel) {
        sugestoes.push(...SUGESTOES_AUTOFIX.validarDepois);
      }
      break;

    case 'reestruturar':
      sugestoes.push(...SUGESTOES_REESTRUTURAR.backupRecomendado);
      if (!contexto.flags?.includes('--dry-run')) {
        sugestoes.push(SUGESTOES_REESTRUTURAR.usarDryRun);
      }
      break;

    case 'podar':
      sugestoes.push(...SUGESTOES_PODAR.cuidado);
      break;
  }

  // アーキタイプ別の提案
  if (contexto.arquetipo) {
    switch (contexto.arquetipo) {
      case 'monorepo':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.monorepo);
        break;
      case 'biblioteca':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.biblioteca);
        break;
      case 'cli':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.cli);
        break;
      case 'api':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.api);
        break;
      case 'frontend':
        sugestoes.push(...SUGESTOES_ARQUETIPOS.frontend);
        break;
    }
  }

  return sugestoes;
}

/**
 * 表示用に提案をフォーマット
 */
export function formatarSugestoes(
  sugestoes: string[],
  titulo = '提案',
): string[] {
  if (sugestoes.length === 0) return [];

  const linhas: string[] = ['', `┌── ${titulo} ${'─'.repeat(50)}`.slice(0, 70)];

  for (const sugestao of sugestoes) {
    linhas.push(`  ${sugestao}`);
  }

  linhas.push(`└${'─'.repeat(68)}`);
  linhas.push('');

  return linhas;
}

/**
 * 統合エクスポート
 */
export const SUGESTOES = {
  comandos: SUGESTOES_COMANDOS,
  diagnostico: SUGESTOES_DIAGNOSTICO,
  autofix: SUGESTOES_AUTOFIX,
  guardian: SUGESTOES_GUARDIAN,
  tipos: SUGESTOES_TIPOS,
  arquetipos: SUGESTOES_ARQUETIPOS,
  reestruturar: SUGESTOES_REESTRUTURAR,
  podar: SUGESTOES_PODAR,
  metricas: SUGESTOES_METRICAS,
  zelador: SUGESTOES_ZELADOR,
} as const;
