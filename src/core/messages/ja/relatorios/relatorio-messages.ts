// SPDX-License-Identifier: MIT
/**
 * レポート用集中化メッセージ（MarkdownおよびJSON）
 * すべてのタイトル文字列、ヘッダー、説明、説明文は
 * メンテナンスの容易さと将来の国際化を促進するためにここで定義する必要があります。
 */

import { ICONES_ACAO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_RELATORIO } from '../../shared/icons.js';

export const RelatorioMensagens = {
  /* -------------------------- メインレポート（gerador-relatorio.ts） -------------------------- */
  principal: {
    titulo: `${ICONES_RELATORIO.resumo} Prometheusレポート`,
    secoes: {
      metadados: {
        data: '日付',
        duracao: '所要時間',
        arquivos: 'スキャンされたファイル',
        ocorrencias: '見つかった発生',
        arquivoManifest: 'マニフェストファイル',
        notaManifest: '完全なレポートを確認するには、マニフェストに記載されているシャードをダウンロード/解凍してください。'
      },
      guardian: {
        titulo: `${ICONES_DIAGNOSTICO.guardian} 整合性検証（ガーディアン）`,
        status: 'ステータス',
        timestamp: 'タイムスタンプ',
        totalArquivos: '保護されたファイルの総数'
      },
      resumoTipos: {
        titulo: `${ICONES_DIAGNOSTICO.stats} 問題タイプの概要`,
        tipo: 'タイプ',
        quantidade: '数'
      },
      ocorrencias: {
        titulo: `${ICONES_RELATORIO.lista} 見つかった発生`,
        colunas: {
          arquivo: 'ファイル',
          linha: '行',
          nivel: 'レベル',
          mensagem: 'メッセージ'
        }
      },
      estatisticas: {
        titulo: `${ICONES_RELATORIO.grafico} 一般統計`,
        linhasAnalisadas: '分析された行数',
        padroesProgramacao: 'プログラミングパターン',
        analiseInteligente: 'インテリジェントコード分析'
      }
    }
  },
  /* -------------------------- 概要レポート / スマートフィルタ -------------------------- */
  resumo: {
    titulo: `${ICONES_RELATORIO.resumo} 概要レポート - 優先度の高い問題`,
    introducao: 'このレポートは類似した問題をグループ化し、分析を容易にするために影響度に応じて優先順位付けしています。',
    secoes: {
      criticos: {
        titulo: `${ICONES_RELATORIO.error} 致命的な問題`,
        vazio: '致命的な問題は検出されませんでした。'
      },
      altos: {
        titulo: `${ICONES_RELATORIO.warning} 高優先度の問題`,
        vazio: '高優先度の問題は検出されませんでした。'
      },
      outros: {
        titulo: `${ICONES_RELATORIO.lista} その他の問題`,
        vazio: 'その他の問題は検出されませんでした。'
      },
      estatisticas: {
        titulo: `${ICONES_DIAGNOSTICO.stats} レポート統計`,
        totalOcorrencias: '総発生数',
        arquivosAfetados: '影響を受けたファイル',
        problemasPrioritarios: '優先度の高い問題',
        problemasAgrupados: 'グループ化された問題'
      }
    },
    labels: {
      quantidade: '数',
      arquivosAfetados: '影響を受けたファイル',
      acaoSugerida: '推奨アクション',
      exemplos: '例'
    }
  },
  /* -------------------------- コードヘルスレポート（zelador-saude.ts） -------------------------- */
  saude: {
    titulo: `${ICONES_ACAO.limpeza} コードヘルスレポート`,
    introducao: `${ICONES_DIAGNOSTICO.stats} コード使用パターン`,
    secoes: {
      funcoesLongas: {
        titulo: 'ファイル別の長い関数の詳細',
        vazio: '制限値を超える関数はありません。',
        colunas: {
          tipo: 'タイプ',
          quantidade: '数'
        }
      },
      constantesDuplicadas: {
        titulo: `${ICONES_RELATORIO.detalhado} 3回以上定義された定数`
      },
      modulosRequire: {
        titulo: `${ICONES_RELATORIO.detalhado} 3回以上使用されているrequireモジュール`
      },
      fim: {
        titulo: 'ゼラドーレポート終了'
      }
    },
    instrucoes: {
      diagnosticoDetalhado: '詳細な診断には、以下を実行してください: prometheus diagnosticar --export',
      tabelasVerbosas: 'ターミナルで枠付きテーブルを表示するには（非常に冗長）、以下を使用してください: --debug'
    }
  },
  /* -------------------------- 使用パターンレポート -------------------------- */
  padroesUso: {
    titulo: `${ICONES_DIAGNOSTICO.stats} コード使用パターン`
  },
  /* -------------------------- アーキタイプレポート -------------------------- */
  arquetipos: {
    titulo: `${ICONES_DIAGNOSTICO.arquetipos} アーキタイプレポート`,
    secoes: {
      candidatos: {
        titulo: '識別された候補',
        nome: '名前',
        score: 'スコア',
        confianca: '信頼度',
        descricao: '説明'
      },
      baseline: {
        titulo: '保存済みベースライン',
        snapshot: 'スナップショット',
        arquivos: 'ファイル'
      },
      drift: {
        titulo: '検出されたドリフト',
        alterouArquetipo: 'アーキタイプ変更',
        deltaConfianca: '信頼度差分',
        arquivosNovos: '新しいファイル',
        arquivosRemovidos: '削除されたファイル'
      }
    }
  },
  /* -------------------------- プルーニングレポート -------------------------- */
  poda: {
    titulo: `${ICONES_COMANDO.podar} Prometheusプルーニングレポート`,
    secoes: {
      metadados: {
        data: '日付',
        execucao: '実行',
        simulacao: 'シミュレーション',
        real: '実際',
        arquivosPodados: 'プルーニングされたファイル',
        arquivosMantidos: '保持されたファイル'
      },
      podados: {
        titulo: 'プルーニングされたファイル',
        vazio: 'このサイクルでプルーニングされたファイルはありません。',
        colunas: {
          arquivo: 'ファイル',
          motivo: '理由',
          diasInativo: '非アクティブ日数',
          detectadoEm: '検出日'
        }
      },
      mantidos: {
        titulo: '保持されたファイル',
        vazio: 'このサイクルで保持されたファイルはありません。',
        colunas: {
          arquivo: 'ファイル',
          motivo: '理由'
        }
      },
      pendencias: {
        titulo: '削除保留中のアイテム',
        total: '保留中の総数',
        tipoArquivo: 'タイプ: ファイル',
        tipoDiretorio: 'タイプ: ディレクトリ',
        tamanhoTotal: 'おおよその合計サイズ'
      },
      reativacao: {
        titulo: '再有効化リスト',
        total: '再有効化対象の総数'
      },
      historico: {
        titulo: 'アクション履歴',
        total: '総アクション数',
        colunas: {
          acao: 'アクション',
          caminho: 'パス',
          timestamp: 'タイムスタンプ'
        }
      }
    }
  },
  /* -------------------------- 再構築レポート -------------------------- */
  reestruturar: {
    titulo: `${ICONES_COMANDO.reestruturar} Prometheus再構築レポート`,
    secoes: {
      metadados: {
        data: '日付',
        execucao: '実行',
        simulacao: 'シミュレーション',
        real: '実際',
        origemPlano: '計画の起点',
        preset: 'プリセット'
      },
      movimentos: {
        titulo: '移動',
        total: '総移動数',
        vazio: 'このサイクルで提案された移動はありません。',
        status: {
          zonVerde: '緑ゾーン（安全）',
          bloqueados: 'ブロック済み'
        },
        colunas: {
          origem: '移動元',
          destino: '移動先',
          razao: '理由',
          status: 'ステータス'
        }
      },
      conflitos: {
        titulo: '検出された競合',
        total: '検出された競合',
        tipo: 'タイプ',
        descricao: '説明'
      },
      preview: {
        titulo: '変更プレビュー',
        nota: `--applyで実行するまでファイルは移動されません`
      }
    }
  },
  /* -------------------------- 共通メッセージ -------------------------- */
  comum: {
    separadores: {
      secao: '---',
      subsecao: '~~~'
    },
    vazios: {
      nenhumResultado: '結果が見つかりませんでした。',
      nenhumaOcorrencia: '発生は検出されませんでした。',
      semDados: '利用可能なデータはありません。'
    },
    acoes: {
      verDetalhes: '詳細を表示',
      executarComando: 'コマンドを実行',
      aplicarMudancas: '変更を適用',
      cancelar: 'キャンセル'
    }
  }
};

/**
 * 変数付きメッセージをフォーマットするヘルパー
 * @example
 * formatMessage(RelatorioMessages.principal.secoes.metadados.arquivos, { count: 42 })
 * // => "スキャンされたファイル: 42"
 */
export function formatMessage(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

/**
 * 単純な複数形のヘルパー
 */
export function pluralize(count: number, singular: string, plural: string, showCount = true): string {
  const word = count === 1 ? singular : plural;
  return showCount ? `${count} ${word}` : word;
}

/**
 * 区切り行を作成するヘルパー
 */
export function separator(char = '-', length = 80): string {
  return char.repeat(length);
}
