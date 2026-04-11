export const ExecutorExtraMensagens = {
  tecnicaGlobal: 'グローバルテクニック「{nome}」',
  erroTecnicaGlobal: '{prefixo} グローバルテクニック「{nome}」でエラー: {erro}',
  stackTrace: 'スタックトレース:',
  modoRapido: '🚀 ファストモードが有効: ワーカーによる並列処理',
  analiseRapidaConcluida: '✅ クイック分析完了: {arquivos}件のファイルを{duracao}で処理',
  arquivosAnalisados: '分析済みファイル数: {total}',
  arquivoAtual: '{seta} ファイル {atual}/{total}: {arquivo}',
  progresso: '分析済みファイル: {atual}/{total}',
  timeoutGlobal: 'タイムアウト: グローバルアナリスト「{nome}」が{timeout}msを超過',
  timeoutAnalista: 'タイムアウト: アナリスト「{nome}」が{arquivo}で{timeout}msを超過',
} as const;
