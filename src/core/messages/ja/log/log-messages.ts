// SPDX-License-Identifier: MIT
/**
 * 集中化・コンテキスト対応ログメッセージシステム
 * プロジェクトタイプと複雑さに自動的に適応
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_COMANDO, ICONES_DIAGNOSTICO, ICONES_FEEDBACK, ICONES_NIVEL, ICONES_RELATORIO, ICONES_STATUS } from '../../shared/icons.js';

export const LogMensagens = {
  sistema: {
    inicializacao: {
      sucesso: `${ICONES_FEEDBACK.foguete} Prometheusは{tempo}msで初期化されました`,
      falha: `${ICONES_STATUS.falha} 初期化に失敗しました: {erro}`,
      configuracao: `${ICONES_ARQUIVO.config} 設定が読み込まれました: {fonte} ({campos}フィールド)`
    },
    shutdown: `${ICONES_STATUS.ok} 分析が正常に完了しました`,
    atualizacao: {
      executando: `${ICONES_ACAO.import} 実行中: {comando}`,
      sucesso: `${ICONES_STATUS.ok} アップデートが正常に完了しました！`,
      falha: `${ICONES_STATUS.falha} アップデートが中止または失敗しました。`,
      detalhes: `${ICONES_FEEDBACK.atencao} {detalhe}`
    },
    performance: {
      regressao_detectada: `${ICONES_FEEDBACK.atencao} {limite}%以上のリグレッションを検出しました。`,
      sem_regressoes: `${ICONES_STATUS.ok} 有意なリグレッションはありません。`
    },
    poda: {
      cancelada: `${ICONES_STATUS.falha} プルーニングをキャンセルしました。`,
      concluida: `${ICONES_STATUS.ok} プルーニングが完了しました: 孤立したファイルが正常に削除されました！`
    },
    reversao: {
      nenhum_move: `${ICONES_STATUS.falha} ファイルの移動が見つかりません: {arquivo}`,
      revertendo: `${ICONES_COMANDO.reverter} 移動を元に戻しています: {arquivo}`,
      sucesso: `${ICONES_STATUS.ok} ファイルが正常に復元されました: {arquivo}`,
      falha: `${ICONES_STATUS.falha} ファイルの復元に失敗しました: {arquivo}`
    },
    auto: {
      mapa_reversao: {
        erro_carregar: `${ICONES_STATUS.falha} 復元マップの読み込みエラー: {erro}`,
        erro_salvar: `${ICONES_STATUS.falha} 復元マップの保存エラー: {erro}`,
        move_nao_encontrado: `${ICONES_STATUS.falha} 移動が見つかりません: {id}`,
        arquivo_destino_nao_encontrado: `${ICONES_STATUS.falha} 宛先ファイルが見つかりません: {destino}`,
        arquivo_existe_origem: `${ICONES_FEEDBACK.atencao} 移動元にファイルが既に存在します: {origem}`,
        erro_reverter: `${ICONES_STATUS.falha} 移動の復元エラー: {erro}`,
        nenhum_move: `${ICONES_FEEDBACK.atencao} 移動が見つかりません: {arquivo}`,
        revertendo_move: `${ICONES_COMANDO.reverter} 移動を元に戻しています: {id}`,
        move_revertido: `${ICONES_STATUS.ok} 移動が正常に復元されました: {id}`,
        falha_reverter_move: `${ICONES_STATUS.falha} 移動の復元に失敗しました: {id}`,
        carregado: `${ICONES_RELATORIO.lista} 復元マップが読み込まれました: {moves}件の移動が登録済み`,
        nenhum_encontrado: `${ICONES_RELATORIO.lista} 復元マップが見つかりません。新しいものを作成します`
      },
      poda: {
        nenhum_arquivo: `${ICONES_STATUS.ok} 現在のサイクルでプルーニング対象のファイルはありません。\n`,
        podando: `${ICONES_COMANDO.podar} {quantidade}件のファイルをプルーニングしています...`,
        podando_simulado: `${ICONES_COMANDO.podar} {quantidade}件のファイルをプルーニングしています...（シミュレーション）`,
        arquivo_movido: `${ICONES_STATUS.ok} {arquivo} が放棄済みとして移動されました。`
      },
      corretor: {
        erro_criar_diretorio: `${ICONES_STATUS.falha} {destino}のディレクトリ作成に失敗しました: {erro}`,
        destino_existe: `${ICONES_FEEDBACK.atencao} 宛先は既に存在します: {arquivo} → {destino}`,
        erro_mover: `${ICONES_STATUS.falha} {arquivo}の名前変更による移動に失敗しました: {erro}`
      }
    },
    correcoes: {
      nenhuma_disponivel: `${ICONES_STATUS.ok} 利用可能な自動修正はありません`,
      aplicando: `${ICONES_ACAO.correcao} {modo}モードで自動修正を適用しています...`,
      arquivo_nao_encontrado: `${ICONES_FEEDBACK.atencao} 修正対象のファイルが見つかりません: {arquivo}`,
      aplicada: `${ICONES_STATUS.ok} {titulo}（信頼度: {confianca}%）`,
      corrigido: `${ICONES_STATUS.ok} 修正済み: {arquivo}`,
      falha: `${ICONES_FEEDBACK.atencao} クイック修正{id}の適用に失敗しました: {erro}`,
      nenhuma_aplicada: `${ICONES_FEEDBACK.atencao} 修正を適用できませんでした`,
      estatisticas: `${ICONES_STATUS.ok} {estatisticas}`,
      eslint_harmonia: `${ICONES_STATUS.ok} ESLint検証完了 - 整合性が保たれました`,
      eslint_ajustes: `${ICONES_STATUS.ok} ESLintが完全な整合性のための追加調整を適用しました`,
      eslint_falha: `${ICONES_STATUS.falha} ESLint検証に失敗しました: {erro}`
    },
    processamento: {
      fix_detectada: `${ICONES_ACAO.correcao} --fixフラグが検出されました: 自動修正を有効にします`,
      eslint_output: `${ICONES_RELATORIO.lista} ESLint出力: {output}`,
      resumo_ocorrencias: `${ICONES_DIAGNOSTICO.stats} {total}件の発生の概要:`,
      dicas_contextuais: `${ICONES_FEEDBACK.dica} コンテキスト対応ヒント:`,
      detalhamento_ocorrencias: `${ICONES_DIAGNOSTICO.stats} {total}件の発生の詳細:`,
      erros_criticos: `${ICONES_RELATORIO.error} {total}件の致命的なエラーが見つかりました - これらを優先してください`,
      avisos_encontrados: `${ICONES_RELATORIO.warning} {total}件の警告が見つかりました`,
      quick_fixes_muitos: `${ICONES_ACAO.correcao} {total}件の自動修正が利用可能です:`,
      quick_fixes_comando: '   → PROMETHEUS_ALLOW_MUTATE_FS=1 npm run diagnosticar --fix',
      quick_fixes_executar: '   （コマンドの実行準備完了）',
      todos_muitos: `${ICONES_RELATORIO.lista} {total}件のTODOが見つかりました - 特定の領域に集中するには--includeを使用してください`,
      todos_poucos: `${ICONES_RELATORIO.lista} {total}件のTODOが見つかりました - 良い管理状態です！`,
      muitas_ocorrencias: `${ICONES_FEEDBACK.atencao} 発生件数が多いです - ハイレベルなビューには--executiveを使用してください`,
      filtrar_pasta: `${ICONES_ARQUIVO.diretorio} またはフォルダでフィルタリング: --include "src/cli" または --include "src/analistas"`,
      usar_full: `${ICONES_DIAGNOSTICO.completo} 完全な詳細には--fullを使用してください`,
      usar_json: `${ICONES_ARQUIVO.json} 構造化出力（CI/スクリプト）には--jsonを使用してください`,
      projeto_limpo: `${ICONES_STATUS.ok} クリーンなプロジェクトです！整合性検証には--guardian-checkを使用してください`,
      analistas_problemas: `${ICONES_DIAGNOSTICO.inicio} 問題が見つかったアナリスト: {quantidade}`
    }
  },
  scanner: {
    inicio: `${ICONES_DIAGNOSTICO.inicio} スキャン開始: {diretorio}`,
    progresso: `${ICONES_ARQUIVO.diretorio} スキャン中: {diretorio} ({arquivos}ファイル)`,
    filtros: `${ICONES_DIAGNOSTICO.stats} 適用されたフィルタ: {include}件のinclude、{exclude}件のexclude`,
    completo: `${ICONES_STATUS.ok} スキャン完了: {diretorios}ディレクトリ内の{arquivos}ファイル`
  },
  analistas: {
    execucao: {
      // 小規模プロジェクト用の簡易ログ
      inicio_simples: `${ICONES_DIAGNOSTICO.inicio} 分析中 {arquivo}`,
      sucesso_simples: `${ICONES_STATUS.ok} {arquivo}: {ocorrencias}件の問題`,
      // 複雑なプロジェクト用の詳細ログ
      inicio_detalhado: `${ICONES_DIAGNOSTICO.inicio} '{analista}'を{arquivo}で実行中（{tamanho}kb）`,
      sucesso_detalhado: `${ICONES_STATUS.ok} '{analista}'完了: {ocorrencias}件の発生（{tempo}ms）`,
      timeout: `${ICONES_FEEDBACK.atencao} アナリスト'{analista}'が{tempo}ms後にタイムアウトしました`,
      erro: `${ICONES_STATUS.falha} アナリスト'{analista}'でエラー: {erro}`,
      skip: `${ICONES_STATUS.pulado} '{arquivo}'をスキップします（設定により抑制）`
    },
    metricas: {
      performance: `${ICONES_DIAGNOSTICO.stats} パフォーマンス: {analistas}アナリスト、平均{media}ms/ファイル`,
      cache_hit: `${ICONES_DIAGNOSTICO.rapido} キャッシュヒット: {hits}/{total}（{percentual}%）`,
      worker_pool: `${ICONES_STATUS.executando} ワーカープール: {ativos}/{total}アクティブワーカー`
    }
  },
  filtros: {
    incluindo: ` ${ICONES_ACAO.criar} 追加中: {パターン}（{matches}ファイル）`,
    excluindo: ` ${ICONES_ACAO.deletar} 除外中: {パターン}（{matches}ファイル）`,
    supressao: `${ICONES_STATUS.pausado} {count}件の発生を抑制しました: {motivo}`,
    cli_override: `${ICONES_DIAGNOSTICO.stats} CLIオーバーライド: {tipo}パターンが設定を上書き`
  },
  projeto: {
    detectado: `${ICONES_RELATORIO.lista} プロジェクトを検出: {tipo}（信頼度{confianca}%）`,
    estrutura: `${ICONES_DIAGNOSTICO.stats} 構造: {arquivos}ファイル、{linguagens}言語`,
    complexidade: `${ICONES_DIAGNOSTICO.stats} 複雑さ: {nivel}（{metricas}に基づく）`,
    recomendacao: `${ICONES_FEEDBACK.dica} 推奨: このタイプのプロジェクトには{acao}`
  },
  contexto: {
    desenvolvedor_novo: `${ICONES_FEEDBACK.info} 簡易プロジェクトを検出 - 簡易ログを有効化しました`,
    equipe_experiente: `${ICONES_FEEDBACK.info} エンタープライズプロジェクトを検出 - 詳細ログを有効化しました`,
    ci_cd: `${ICONES_FEEDBACK.info} CI/CD環境を検出 - 構造化ログを有効化しました`,
    debug_mode: `${ICONES_FEEDBACK.info} デバッグモード有効 - 冗長ログを有効化しました`
  },
  ocorrencias: {
    critica: `${ICONES_NIVEL.critico} 致命的: {mensagem} {arquivo}:{linha}にて`,
    aviso: `${ICONES_NIVEL.aviso} 警告: {mensagem}（{categoria}）`,
    info: `${ICONES_NIVEL.info} 情報: {mensagem}`,
    sugestao: `${ICONES_FEEDBACK.dica} 提案: {mensagem} - {acao_sugerida}`
  },
  relatorio: {
    resumo: `${ICONES_DIAGNOSTICO.stats} 概要: {total}件の問題（{criticos}件が致命的、{avisos}件の警告）`,
    categorias: `${ICONES_RELATORIO.lista} トップ: {top_categorias}`,
    arquivo_problema: `${ICONES_FEEDBACK.atencao} 最も問題が多い: {arquivo}（{count}件の発生）`,
    tendencia: `${ICONES_DIAGNOSTICO.stats} 傾向: ベースラインと比較して{direcao}`,
    repositorio_impecavel: '完璧なリポジトリです',
    ocorrencias_encontradas: '{total}件の発生が見つかりました',
    fim_padroes_uso: `\n${ICONES_STATUS.ok} 使用パターンレポート終了。\n`,
    funcoes_longas: `${ICONES_FEEDBACK.atencao} 長い関数が見つかりました:`
  },
  conselheiro: {
    volume_alto: `${ICONES_FEEDBACK.info} タスクの量が多いですか？コードは逃げません。燃え尽き症候群の方が問題です。`,
    respira: `${ICONES_FEEDBACK.info} ちょっと待って、ただ深呼吸してください。`,
    cuidado: `${ICONES_FEEDBACK.info} 自分のことを大切にしてください: 水を飲んで、ストレッチして、5分間目を閉じましょう。その後また続けます。\n`,
    madrugada: `${ICONES_FEEDBACK.atencao} すでに{hora}を回っています。コードは明日でもコンパイルできます。今は休みましょう。`
  },
  guardian: {
    integridade_ok: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.ok} ガーディアン: 整合性が保たれました。`,
    baseline_criado: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.info} ガーディアンベースラインが作成されました。`,
    baseline_aceito: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} ガーディアン: 新しいベースラインが受け入れられました - 再度実行してください。`,
    alteracoes_detectadas: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.erro} ガーディアン: 疑わしい変更を検出しました！'prometheus guardian --diff'の実行を検討してください。`,
    bloqueado: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.falha} ガーディアンがブロックされました: 疑わしい変更または致命的なエラー。`,
    modo_permissivo: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} 許可モード: ご自身の責任で続行します。`,
    scan_only: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.info} スキャン専用モード: {arquivos}ファイルがマップされました。`,
    avisos_encontrados: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.aviso} 警告レベルの発生が存在します`,
    // ガーディアンコマンド
    full_scan_aviso: `${ICONES_NIVEL.aviso} --full-scanが有効: ベースラインはスコープ-expanded状態で永続化されません。`,
    full_scan_warning_baseline: `${ICONES_NIVEL.aviso} --full-scanが有効ですが、ベースラインは一時的に拡張されたスコープで作成されます。`,
    aceitando_baseline: `\n${ICONES_COMANDO.atualizar} 新しい整合性ベースラインを受け入れています...\n`,
    baseline_aceito_sucesso: `${ICONES_STATUS.ok} 新しい整合性ベースラインが正常に受け入れられました！`,
    comparando_integridade: `\n${ICONES_DIAGNOSTICO.stats} Prometheusの整合性をベースラインと比較しています...\n`,
    diferencas_detectadas: `${ICONES_RELATORIO.error} 差分が検出されました:`,
    diferenca_item: '  - {diferenca}',
    comando_diff_recomendado: '詳細な差分を表示するには--diffを、新しいベースラインを受け入れるには--acceptを付けて実行してください。',
    integridade_preservada: `${ICONES_STATUS.ok} 差分は検出されませんでした。整合性が保たれました。`,
    verificando_integridade: `\n${ICONES_DIAGNOSTICO.guardian} Prometheusの整合性を確認しています...\n`,
    baseline_criado_console: `${ICONES_DIAGNOSTICO.guardian} ガーディアンベースラインが作成されました`,
    baseline_atualizado: `${ICONES_DIAGNOSTICO.guardian} ベースラインが更新され、受け入れられました`,
    alteracoes_suspeitas: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_NIVEL.erro} 疑わしい変更を検出しました！`,
    erro_guardian: `${ICONES_DIAGNOSTICO.guardian} ${ICONES_STATUS.falha} ガーディアンエラー: {erro}`
  },
  metricas: {
    execucoes_registradas: `\n${ICONES_DIAGNOSTICO.stats} 登録された実行: {quantidade}`,
    nenhum_historico: 'まだメトリクス履歴が見つかりません。--metricasを有効にして診断を実行してください。'
  },
  auto: {
    plugin_ignorado: `${ICONES_NIVEL.aviso} プラグインが無視されました（{plugin}）: {erro}`,
    caminho_nao_resolvido: `${ICONES_NIVEL.aviso} プラグインパスが解決されませんでした: {plugin}`,
    plugin_falhou: `${ICONES_STATUS.falha} プラグインが失敗しました: {plugin} - {erro}`,
    move_removido: `${ICONES_ACAO.deletar} 移動がマップから削除されました: {id}`
  },
  core: {
    parsing: {
      erro_babel: `${ICONES_NIVEL.aviso} {arquivo}でBabel解析エラー: {erro}`,
      erro_ts: `${ICONES_NIVEL.aviso} {arquivo}でTSコンパイラ解析エラー: {erro}`,
      erro_xml: `${ICONES_NIVEL.aviso} {arquivo}でXML解析エラー: {erro}`,
      erro_html: `${ICONES_NIVEL.aviso} {arquivo}でHTML解析エラー: {erro}`,
      erro_css: `${ICONES_NIVEL.aviso} {arquivo}でCSS解析エラー: {erro}`,
      nenhum_parser: `${ICONES_NIVEL.aviso} 拡張子{extensao}に対応するパーサーがありません`,
      timeout_parsing: `${ICONES_NIVEL.aviso} 拡張子{extensao}の解析が{timeout}ms後にタイムアウトしました`,
      plugin_nao_encontrado: `${ICONES_NIVEL.aviso} {extensao}用のプラグインが見つかりません。レガシーシステムを使用します`,
      sistema_plugins_falhou: `${ICONES_STATUS.falha} プラグインシステムが失敗しました: {erro}。レガシーシステムを使用します`,
      plugins_registrados: `${ICONES_DIAGNOSTICO.inicio} デフォルトプラグインがシステムに登録されました`,
      usando_plugin: `${ICONES_DIAGNOSTICO.inicio} {extensao}用にプラグイン'{nome}'を使用しています`
    },
    plugins: {
      erro_carregar: `${ICONES_STATUS.falha} プラグイン{nome}の読み込みエラー: {erro}`,
      tentando_autoload: `${ICONES_DIAGNOSTICO.inicio} 拡張子{extensao}の自動読み込みを試行しています`,
      autoload_falhou: `${ICONES_STATUS.falha} {nome}の自動読み込みに失敗しました`,
      extensao_nao_suportada: `${ICONES_NIVEL.aviso} 拡張子{extensao}はコアプラグインでサポートされていません`,
      registrando: `${ICONES_DIAGNOSTICO.inicio} プラグインを登録中: {nome} v{versao}`
    },
    executor: {
      reaproveitado_incremental: `${ICONES_DIAGNOSTICO.rapido} {arquivo}を再利用（インクリメンタル）`
    }
  }
} as const;

/**
 * プロジェクトタイプに適応するコンテキスト設定
 */
export const LogContextConfiguracao = {
  // 簡易プロジェクト: ファイル数が少なく、1人の開発者
  simples: {
    nivel_detalhamento: 'basico',
    mostrar_performance: false,
    mostrar_cache: false,
    mostrar_workers: false,
    formato_arquivo: 'nome_apenas',
    // ファイル名のみ
    agrupar_ocorrencias: true
  },
  // 中規模プロジェクト: 小規模チーム、複数の言語
  medio: {
    nivel_detalhamento: 'moderado',
    mostrar_performance: true,
    mostrar_cache: false,
    mostrar_workers: false,
    formato_arquivo: 'relativo',
    // 相対パス
    agrupar_ocorrencias: true
  },
  // 大規模プロジェクト: 大規模チーム、CI/CD、複数のモジュール
  complexo: {
    nivel_detalhamento: 'completo',
    mostrar_performance: true,
    mostrar_cache: true,
    mostrar_workers: true,
    formato_arquivo: 'completo',
    // フルパス + メタデータ
    agrupar_ocorrencias: false
  },
  // CI/CD環境: 構造化ログ、色なし
  ci: {
    nivel_detalhamento: 'estruturado',
    mostrar_performance: true,
    mostrar_cache: true,
    mostrar_workers: true,
    formato_arquivo: 'relativo',
    agrupar_ocorrencias: false,
    formato_saida: 'json_lines'
  }
} as const;
