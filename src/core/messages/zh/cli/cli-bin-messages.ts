// SPDX-License-Identifier: MIT

export const CliBinMensagens = {
  flagsInvalidas: 'Invalid flags: {erro}',
  unhandledRejection: 'Prometheus: unhandled rejection',
  excecaoNaoCapturada: 'Uncaught exception: {mensagem}',
  resumoConversa: {
    titulo: '\n📊 CONVERSATION SUMMARY',
    total: 'Total: {total}',
    usuario: 'User: {total}',
    prometheus: 'Prometheus: {total}',
    primeira: 'First: {mensagem}',
    ultima: 'Last: {mensagem}',
  },
  historicoIndisponivel: 'History unavailable.',
  historicoLimpo: 'History cleared.',
} as const;
