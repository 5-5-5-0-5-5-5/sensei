export const RelatorioAsyncPatternsMensagens = {
  totalOcorrencias: 'Total unhandled-async occurrences: {total}',
  topArquivos: '\n🔴 TOP {total} Files with Most Unhandled Promises:\n',
  promiseSemTratamento: '   └─ {total} promise(s) without error handling',
  prioridade: '   └─ Priority: {nivel}\n',
  distribuicaoCategoria: '\n📂 Distribution by Category:\n',
  categoriaStats: '  {categoria}: {arquivos} files, {promises} promises',
  proximosPassos: '\n📋 Next Steps:\n',
  passo1: '1. Review CRITICAL files and add .catch() or try/catch',
  passo2: '2. For files with many occurrences, consider refactoring',
  passo3: '3. Validate if promises have handling at a higher level',
  passo4: '4. Add tests to ensure robustness\n',
  recomendacoes: {
    proximosPassos: [
      'Review CRITICAL files and add .catch() or try/catch',
      'For files with many occurrences, consider refactoring',
      'Validate if promises have handling at a higher level',
      'Add tests to ensure robustness',
    ],
  },
} as const;
