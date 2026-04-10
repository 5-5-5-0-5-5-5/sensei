// SPDX-License-Identifier: MIT
import { messages } from '@core/messages/index.js';
import { formatarPrettierMinimo } from '@shared/impar/formater.js';

import { criarAnalista, criarOcorrencia } from '@';

const disableEnv = process.env.PROMETHEUS_DISABLE_PLUGIN_FORMATADOR === '1';
type Msg = ReturnType<typeof criarOcorrencia>;
function msg(message: string, relPath: string, nivel: (typeof messages.SeverityNiveis)[keyof typeof messages.SeverityNiveis] = messages.SeverityNiveis.warning, line = 1): Msg {
  return criarOcorrencia({
    relPath,
    mensagem: message,
    linha: line,
    nivel,
    origem: messages.AnalystOrigens.formatador,
    tipo: messages.AnalystTipos.formatador
  });
}
function normalizarEol(code: string): string {
  return code.replace(/\r\n?/g, '\n');
}
function primeiraLinhaDiferente(a: string, b: string): number {
  const aLines = normalizarEol(a).split('\n');
  const bLines = normalizarEol(b).split('\n');
  const len = Math.max(aLines.length, bLines.length);
  for (let i = 0; i < len; i++) {
    if ((aLines[i] ?? '') !== (bLines[i] ?? '')) return i + 1;
  }
  return 1;
}
export const analistaFormatador = criarAnalista({
  nome: 'analista-formatador',
  categoria: 'formatacao',
  descricao: 'Verifica formatação mínima interna do Prometheus (JSON/Markdown/YAML).',
  global: false,
  test: (relPath: string): boolean => /\.(json|md|markdown|ya?ml)$/i.test(relPath),
  aplicar: async (src, relPath): Promise<Msg[] | null> => {
    if (disableEnv) return null;
    const res = formatarPrettierMinimo({
      code: src,
      relPath
    });
    if (!res.ok) {
      return [msg(messages.FormatadorMensagens.parseErro(res.parser, res.error), relPath, messages.SeverityNiveis.error, 1)];
    }
    if (!res.changed) return null;
    const linha = primeiraLinhaDiferente(src, res.formatted);
    const detalhes = [`primeira diferença na linha ${linha}`, res.reason ? `motivo: ${res.reason}` : null].filter(Boolean).join(', ');

    // Manter como aviso (alinha com intenção de "check" sem mutação)
    return [msg(messages.FormatadorMensagens.naoFormatado(res.parser, detalhes || undefined), relPath, messages.SeverityNiveis.warning, linha)];
  }
});
