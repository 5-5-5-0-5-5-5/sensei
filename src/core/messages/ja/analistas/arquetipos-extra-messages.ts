export const ArquetiposExtraMensagens = {
  naoEncontrado: '⚠️ カスタムアーキタイプが{novo}および{legado}のどちらにも見つかりませんでした',
  salvo: '✅ カスタムアーキタイプを{caminho}に保存しました',
  projetoPersonalizado: '🌟 カスタムプロジェクトが検出されました: "{nome}"',
  descricaoPersonalizado: 'Prometheusは公式アーキタイプに一致しないプロジェクト構造を特定しましたが、\nカスタムアーキタイプを作成することで最適化された提案を受け取ることができます！',
  estruturaDetectada: '📁 検出された構造:',
  arquivosRaiz: '📄 ルートファイル:',
  dicaCriar: '💡 カスタムアーキタイプを作成するには、以下を実行してください:',
  comandoCriar: '   prometheus diagnosticar --criar-arquetipo',
  explicacaoCriar: 'これにより、現在の構造に基づいた\'prometheus.repo.arquetipo.json\'ファイルが作成され、\nPrometheusがベストプラクティスを維持しながらパーソナライズされた提案を提供するために使用します。',
  validacao: {
    nomeObrigatorio: 'プロジェクト名は必須です',
    arquetipoObrigatorio: 'ベースとなる公式アーキタイプは必須です',
    arquetipoNaoEncontrado: '公式アーキタイプ\'{arquetipo}\'が見つかりません。使用可能なアーキタイプ: {disponiveis}',
    estruturaObrigatoria: 'カスタム構造は必須です',
    diretoriosArray: 'ディレクトリは配列である必要があります',
    arquivosChaveArray: 'キーファイルは配列である必要があります',
  },
  melhoresPraticas: {
    srcOrganizado: 'ソースコードはsrc/内に整理してください',
    testesDedicados: 'テストは専用のフォルダに分離してください',
    documenteApis: 'APIおよび重要な機能のドキュメントを作成してください',
  },
} as const;
