// SPDX-License-Identifier: MIT
import { messages } from '@core/messages/index.js';
import { Command } from 'commander';

import { iniciarServidorApi } from '../../api/server.js';

const log = messages.log;

/**
 * Comando para iniciar o dashboard interativo do Prometheus
 */
export function comandoDashboard(): Command {
  return new Command('dashboard')
    .description('Inicia o dashboard web interativo do Prometheus')
    .option('-p, --port <numero>', 'Porta para o servidor', '3000')
    .action((opts) => {
      const porta = parseInt(opts.port, 10);
      log.info(`\n${  '='.repeat(50)}`);
      log.info(`🚀 Iniciando Dashboard do Prometheus na porta ${porta}`);
      log.info(`🔗 Acesse: http://localhost:${porta}`);
      log.info(`${'='.repeat(50)  }\n`);

      try {
        iniciarServidorApi(porta);
      } catch (err) {
        log.erro(`Falha ao iniciar servidor: ${err instanceof Error ? err.message : String(err)}`);
      }
    });
}
