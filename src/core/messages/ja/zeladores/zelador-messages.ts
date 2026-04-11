// SPDX-License-Identifier: MIT
// @prometheus-disable tipo-literal-inline-complexo
// 正当化: ゼラドーメッセージ用のインライン型

import { ICONES_ACAO, ICONES_STATUS, ICONES_ZELADOR as ICONES_ZELADOR_CENTRAL } from '../../shared/icons.js';
/**
 * ゼラドーメッセージ
 *
 * ゼラドー（自動修正）に関連するすべてのメッセージを集中化
 * インポート、型、構造などを含む
 */

/**
 * ゼラドーが使用するアイコンと絵文字
 */
const ICONES_ZELADOR = {
  ...ICONES_ZELADOR_CENTRAL
} as const;

/**
 * インポートゼラドーのメッセージ
 */
export const MENSAGENS_IMPORTS = {
  titulo: `${ICONES_ACAO.correcao} インポートゼラドー - 修正を開始...`,
  resumo: `${ICONES_ZELADOR.resumo} 概要:`,
  dryRunAviso: `${ICONES_ZELADOR.dryRun} dry-runモード: ファイルは変更されていません`,
  sucessoFinal: `${ICONES_STATUS.ok} 修正が正常に適用されました！`
} as const;

/**
 * インポートゼラドーの進行状況メッセージ
 */
export const PROGRESSO_IMPORTS = {
  diretorioNaoEncontrado: (dir: string) => `${ICONES_ZELADOR.aviso} ディレクトリが見つかりません: ${dir}`,
  arquivoProcessado: (arquivo: string, count: number) => `${ICONES_ZELADOR.sucesso} ${arquivo}（${count}件の修正${count !== 1 ? '' : ''}）`,
  arquivoErro: (arquivo: string, erro: string) => `${ICONES_ZELADOR.erro} ${arquivo}: ${erro}`,
  lendoDiretorio: (dir: string) => `ディレクトリを読み込み中: ${dir}`
} as const;

/**
 * インポートゼラドーのエラーメッセージ
 */
export const ERROS_IMPORTS = {
  lerDiretorio: (dir: string, error: unknown) => {
    const mensagem = error instanceof Error ? error.message : String(error);
    return `ディレクトリ${dir}の読み込みエラー: ${mensagem}`;
  },
  processar: (arquivo: string, error: unknown) => {
    const mensagem = error instanceof Error ? error.message : String(error);
    return `${arquivo}の処理エラー: ${mensagem}`;
  }
} as const;

/**
 * 概要統計行をフォーマット
 */
export function formatarEstatistica(label: string, valor: number | string, icone?: string): string {
  const prefixo = icone ? `${icone} ` : '   ';
  return `${prefixo}${label}: ${valor}`;
}

/**
 * インポート修正の概要を生成
 */
export function gerarResumoImports(stats: {
  processados: number;
  modificados: number;
  totalCorrecoes: number;
  erros: number;
  dryRun: boolean;
}): string[] {
  const linhas: string[] = ['', MENSAGENS_IMPORTS.resumo, formatarEstatistica('処理されたファイル', stats.processados), formatarEstatistica('変更されたファイル', stats.modificados), formatarEstatistica('修正の総数', stats.totalCorrecoes)];
  if (stats.erros > 0) {
    linhas.push(formatarEstatistica('エラー', stats.erros, ICONES_ZELADOR.aviso));
  }
  linhas.push('');
  if (stats.dryRun) {
    linhas.push(MENSAGENS_IMPORTS.dryRunAviso);
  } else {
    linhas.push(MENSAGENS_IMPORTS.sucessoFinal);
  }
  return linhas;
}

/**
 * 型ゼラドーのメッセージ（将来用）
 */
export const MENSAGENS_TIPOS = {
  titulo: `${ICONES_ACAO.correcao} 型ゼラドー - 修正を開始...`,
  analisandoTipo: (tipo: string) => `型を分析中: ${tipo}`,
  tipoCorrigido: (antes: string, depois: string) => `修正済み: ${antes} → ${depois}`
} as const;

/**
 * 構造ゼラドーのメッセージ（将来用）
 */
export const MENSAGENS_ESTRUTURA = {
  titulo: `${ICONES_ACAO.organizacao} 構造ゼラドー - ファイルを再編成...`,
  movendo: (origem: string, destino: string) => `移動: ${origem} → ${destino}`,
  criandoDiretorio: (dir: string) => `ディレクトリを作成中: ${dir}`
} as const;

/**
 * 汎用ゼラドーメッセージ
 */
export const MENSAGENS_ZELADOR_GERAL = {
  iniciando: (zelador: string) => `${ICONES_ZELADOR.inicio} ${zelador} - 開始...`,
  concluido: (zelador: string) => `${ICONES_ZELADOR.sucesso} ${zelador} - 完了！`,
  erro: (zelador: string, mensagem: string) => `${ICONES_ZELADOR.erro} ${zelador} - エラー: ${mensagem}`
} as const;

/**
 * 異なるモード用の出力テンプレート
 */
export const MODELOS_SAIDA = {
  compacto: {
    inicio: (nome: string) => `${ICONES_ZELADOR.inicio} ${nome}`,
    progresso: (atual: number, total: number) => `[${atual}/${total}]`,
    fim: (sucesso: boolean) => sucesso ? ICONES_ZELADOR.sucesso : ICONES_ZELADOR.erro
  },
  detalhado: {
    inicio: (nome: string, descricao: string) => `${ICONES_ZELADOR.inicio} ${nome}\n   ${descricao}`,
    progresso: (arquivo: string, atual: number, total: number) => `   [${atual}/${total}] ${arquivo}`,
    fim: (stats: {
      sucesso: number;
      falha: number;
    }) => `\n${ICONES_ZELADOR.resumo} 成功: ${stats.sucesso}、失敗: ${stats.falha}`
  }
} as const;

/**
 * ゼラドーの終了コード
 */
export const SAIDA_CODIGOS = {
  SUCESSO: 0,
  ERRO_GERAL: 1,
  ERRO_ARQUIVO: 2,
  ERRO_PERMISSAO: 3,
  CANCELADO_USUARIO: 4
} as const;

/**
 * 変更されたファイルリストをフォーマット
 */
export function formatarListaArquivos(arquivos: string[], maxExibir: number = 10): string[] {
  const linhas: string[] = [];
  const mostrar = arquivos.slice(0, maxExibir);
  for (const arquivo of mostrar) {
    linhas.push(`   ${ICONES_ZELADOR.arquivo} ${arquivo}`);
  }
  const restantes = arquivos.length - maxExibir;
  if (restantes > 0) {
    linhas.push(`   ...他 ${restantes}件のファイル`);
  }
  return linhas;
}

/**
 * 実行時間をフォーマット
 */
export function formatarDuracao(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  if (ms < 60000) {
    return `${(ms / 1000).toFixed(1)}秒`;
  }
  const minutos = Math.floor(ms / 60000);
  const segundos = Math.floor(ms % 60000 / 1000);
  return `${minutos}分${segundos}秒`;
}

/**
 * タイムスタンプ付きメッセージをフォーマット
 */
export function formatarComTimestamp(mensagem: string): string {
  const timestamp = new Date().toISOString().substring(11, 19); // HH:MM:SS
  return `[${timestamp}] ${mensagem}`;
}
