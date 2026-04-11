export const RelatorioAsyncPatternsMensagens = {
  totalOcorrencias: '未処理のasync発生の総数: {total}',
  topArquivos: '\n🔴 未処理のPromiseが最も多いファイルTOP {total}:\n',
  promiseSemTratamento: '   └─ {total}件のエラー処理なしのpromise',
  prioridade: '   └─ 優先度: {nivel}\n',
  distribuicaoCategoria: '\n📂 カテゴリ別分布:\n',
  categoriaStats: '  {categoria}: {arquivos}ファイル、{promises}件のpromise',
  proximosPassos: '\n📋 次のステップ:\n',
  passo1: '1. 致命的なファイルを確認し、.catch()またはtry/catchを追加',
  passo2: '2. 発生件数が多いファイルは、リファクタリングを検討',
  passo3: '3. promiseが上位レベルで処理されているか確認',
  passo4: '4. 堅牢性を確保するためのテストを追加\n',
  recomendacoes: {
    proximosPassos: [
      '致命的なファイルを確認し、.catch()またはtry/catchを追加',
      '発生件数が多いファイルは、リファクタリングを検討',
      'promiseが上位レベルで処理されているか確認',
      '堅牢性を確保するためのテストを追加',
    ],
  },
} as const;
