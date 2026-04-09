export const ExecutorExtraMensagens = {
  tecnicaGlobal: 'Global technique "{nome}"',
  erroTecnicaGlobal: '{prefixo} Error in global technique \'{nome}\': {erro}',
  stackTrace: 'Stack trace:',
  modoRapido: '🚀 Fast mode activated: parallel processing with Workers',
  analiseRapidaConcluida: '✅ Fast analysis complete: {arquivos} files in {duracao}',
  arquivosAnalisados: 'Files analyzed: {total}',
  arquivoAtual: '{seta} File {atual}/{total}: {arquivo}',
  progresso: 'Files analyzed: {atual}/{total}',
  timeoutGlobal: 'Timeout: global analyst \'{nome}\' exceeded {timeout}ms',
  timeoutAnalista: 'Timeout: analyst \'{nome}\' exceeded {timeout}ms for {arquivo}',
} as const;
