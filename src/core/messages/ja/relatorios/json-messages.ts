// SPDX-License-Identifier: MIT
/**
 * JSONエクスポート用の集中化メッセージと説明
 * JSONフィールドの説明テキスト、ラベル、メタデータを定義
 */

import type { JsonComMetadados } from '@';

export const JsonMensagens = {
  /* -------------------------- 共通フィールド -------------------------- */
  comum: {
    timestamp: {
      label: 'timestamp',
      descricao: 'レポート生成日時（ISO 8601）'
    },
    versao: {
      label: 'versao',
      descricao: 'このレポートを生成したPrometheusのバージョン'
    },
    schemaVersion: {
      label: 'schemaVersion',
      descricao: 'JSONスキーマバージョン（後方互換性用）'
    },
    duracao: {
      label: 'duracaoMs',
      descricao: '総実行時間（ミリ秒）'
    }
  },
  /* -------------------------- 診断 -------------------------- */
  diagnostico: {
    root: {
      label: 'diagnostico',
      descricao: 'プロジェクトの完全な診断結果'
    },
    totalArquivos: {
      label: 'totalArquivos',
      descricao: 'スキャンされたファイルの総数'
    },
    ocorrencias: {
      label: 'ocorrencias',
      descricao: 'アナリストによって検出されたすべての発生のリスト',
      campos: {
        tipo: '発生の種類/カテゴリ',
        nivel: '重大度レベル（info、aviso、erro）',
        mensagem: '問題の詳細な説明',
        relPath: 'ファイルの相対パス',
        linha: '問題が発生した行',
        coluna: '問題が発生した列',
        contexto: '追加コンテキスト（コードスニペット）'
      }
    },
    metricas: {
      label: 'metricas',
      descricao: '集約されたプロジェクトメトリクス',
      campos: {
        totalLinhas: '分析された総コード行数',
        totalArquivos: '処理された総ファイル数',
        arquivosComErro: '解析に失敗したファイル',
        tempoTotal: '総処理時間'
      }
    },
    linguagens: {
      label: 'linguagens',
      descricao: 'プロジェクト内の言語使用統計',
      campos: {
        total: '総コードファイル数',
        extensoes: '拡張子 -> 数マップ'
      }
    },
    parseErros: {
      label: 'parseErros',
      descricao: 'グループ化された解析エラー',
      campos: {
        total: '総解析エラー数',
        porArquivo: 'ファイル -> エラーリストマップ',
        agregado: 'エラーが集約されたかどうか'
      }
    }
  },
  /* -------------------------- 構造 / アーキタイプ -------------------------- */
  estrutura: {
    root: {
      label: 'estruturaIdentificada',
      descricao: 'プロジェクト構造とアーキタイプの識別'
    },
    melhores: {
      label: 'melhores',
      descricao: '最適なアーキタイプ候補の順序付きリスト',
      campos: {
        nome: 'アーキタイプ名',
        score: '計算されたスコア',
        confidence: '信頼度（%）',
        descricao: 'アーキタイプの説明',
        matchedRequired: '見つかった必須ファイル',
        missingRequired: '不足している必須ファイル',
        matchedOptional: '見つかったオプションファイル'
      }
    },
    baseline: {
      label: 'baseline',
      descricao: 'ドリフト検出用の保存済み構造スナップショット',
      campos: {
        arquetipo: '識別されたアーキタイプ',
        confidence: '保存時の信頼度',
        timestamp: 'スナップショット日付',
        arquivosRaiz: 'ルートファイルリスト'
      }
    },
    drift: {
      label: 'drift',
      descricao: 'ベースラインと比較して検出された変更',
      campos: {
        alterouArquetipo: 'アーキタイプが変更されたかどうか',
        deltaConfidence: '信頼度のパーセント変動',
        arquivosRaizNovos: '新しいルートファイル',
        arquivosRaizRemovidos: '削除されたルートファイル'
      }
    }
  },
  /* -------------------------- ガーディアン -------------------------- */
  guardian: {
    root: {
      label: 'guardian',
      descricao: 'コードの整合性と保護の検証'
    },
    status: {
      label: 'status',
      opcoes: {
        sucesso: '検証成功、変更なし',
        alteracoes: '保護されたファイルに変更が検出されました',
        baseline: 'ベースラインが作成されました（初回実行）',
        erro: '検証中にエラーが発生しました',
        naoExecutada: 'ガーディアンは実行されませんでした'
      }
    },
    totalArquivos: {
      label: 'totalArquivos',
      descricao: '保護されたファイル数'
    },
    alteracoes: {
      label: 'alteracoes',
      descricao: '検出された変更のリスト',
      campos: {
        arquivo: '変更されたファイルパス',
        hashAnterior: '以前のSHA-256ハッシュ',
        hashAtual: '現在のSHA-256ハッシュ',
        acao: 'アクションタイプ（変更、追加、削除）'
      }
    }
  },
  /* -------------------------- プルーニング -------------------------- */
  poda: {
    root: {
      label: 'poda',
      descricao: '削除対象のファイル/ディレクトリのレポート'
    },
    pendencias: {
      label: 'pendencias',
      descricao: '削除保留中のアイテムリスト',
      campos: {
        caminho: 'フルパス',
        tipo: 'ファイルまたはディレクトリ',
        motivoOriginal: 'マークの理由',
        timestamp: 'マーク日付'
      }
    },
    reativar: {
      label: 'listaReativar',
      descricao: '再有効化対象のアイテムリスト'
    },
    historico: {
      label: 'historico',
      descricao: '実行されたプルーニングアクションの履歴',
      campos: {
        acao: 'アクションタイプ（削除、再有効化、保留）',
        caminho: '影響を受けたパス',
        timestamp: 'アクション日付',
        usuario: '実行したユーザー'
      }
    }
  },
  /* -------------------------- 再構築 -------------------------- */
  reestruturar: {
    root: {
      label: 'reestruturacao',
      descricao: 'プロジェクト再構築計画'
    },
    movimentos: {
      label: 'movimentos',
      descricao: '計画されたファイル移動のリスト',
      campos: {
        id: '固有移動ID',
        origem: '元パス',
        destino: '宛先パス',
        razao: '移動の理由',
        status: 'ステータス（緑ゾーン、ブロック、保留）',
        dependencias: '影響を受ける依存ファイル'
      }
    },
    conflitos: {
      label: 'conflitos',
      descricao: '移動を妨げる検出された競合',
      campos: {
        tipo: '競合タイプ',
        arquivos: '関係するファイル',
        descricao: '競合の説明',
        resolucaoSugerida: '解決方法'
      }
    },
    resumo: {
      label: 'resumo',
      descricao: '計画の統計概要',
      campos: {
        total: '総移動数',
        zonaVerde: '安全な移動',
        bloqueados: 'ブロックされた移動',
        impactoEstimado: '影響を受けるファイル数'
      }
    }
  },
  /* -------------------------- スマートフィルタ -------------------------- */
  filtroInteligente: {
    root: {
      label: 'relatorioResumo',
      descricao: '優先順位付けされた問題のフィルタ済みレポート'
    },
    problemasCriticos: {
      label: 'problemasCriticos',
      descricao: '致命的な重大度の問題（セキュリティ、データ）'
    },
    problemasAltos: {
      label: 'problemasAltos',
      descricao: '高優先度の問題（バグ、脆弱なコード）'
    },
    problemasOutros: {
      label: 'problemasOutros',
      descricao: 'その他の問題（低/中優先度）'
    },
    estatisticas: {
      label: 'estatisticas',
      descricao: 'スマートグループ化統計',
      campos: {
        totalOcorrencias: '処理された総発生数',
        arquivosAfetados: '影響を受けた固有ファイル数',
        problemasPrioritarios: '致命的 + 高優先度の問題',
        problemasAgrupados: '作成されたグループ数'
      }
    }
  }
};

/**
 * 説明的なメタデータでJSONデータをラップ
 */
export function wrapComMetadados<T>(data: T, schema: string, versao: string, descricao: string): JsonComMetadados<T> {
  return {
    _metadata: {
      schema,
      versao,
      geradoEm: new Date().toISOString(),
      descricao
    },
    dados: data
  };
}

/**
 * タイプセーフなJSONフィールド説明を生成するヘルパー
 */
export function getDescricaoCampo(caminho: string): string {
  const parts = caminho.split('.');
  // メッセージオブジェクトをタイプセーフにナビゲート
  let current: unknown = JsonMensagens;
  for (const part of parts) {
    if (typeof current === 'object' && current !== null && part in current) {
      current = (current as Record<string, unknown>)[part];
    } else {
      return `フィールド: ${caminho}`;
    }
  }

  // 説明があるかどうかを確認するタイプガード
  if (typeof current === 'object' && current !== null && 'descricao' in current && typeof (current as {
    descricao: unknown;
  }).descricao === 'string') {
    return (current as {
      descricao: string;
    }).descricao;
  }
  return `フィールド: ${caminho}`;
}
