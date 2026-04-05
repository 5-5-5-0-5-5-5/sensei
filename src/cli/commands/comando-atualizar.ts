// SPDX-License-Identifier: MIT
import { registroAnalistas } from '@analistas/registry/registry.js';
import { ExitCode, sair } from '@cli/helpers/exit-codes.js';
import chalk from '@core/config/chalk-safe.js';
import { config } from '@core/config/config.js';
import { iniciarInquisicao } from '@core/execution/inquisidor.js';
import { getMessages } from '@core/messages/index.js';
import { ICONES_STATUS } from '@core/messages/shared/icons.js';
import { executarShellSeguro } from '@core/utils/exec-safe.js';
import { scanSystemIntegrity } from '@guardian/sentinela.js';
import { Command } from 'commander';

import type { FileEntryWithAst, Tecnica } from '@';
import { asTecnicas } from '@';

const { log, logSistema, CliAtualizarExtraMensagens } = getMessages();

export function comandoAtualizar(
  aplicarFlagsGlobais: (opts: Record<string, unknown>) => void,
): Command {
  return new Command('atualizar')
    .description(CliAtualizarExtraMensagens.descricao)
    .option('--global', 'atualiza globalmente via npm i -g')
    .action(async function (this: Command, opts: { global?: boolean }) {
      try {
        await aplicarFlagsGlobais(
          this.parent && typeof this.parent.opts === 'function'
            ? this.parent.opts()
            : {},
        );
      } catch (err) {
        log.erro(
          CliAtualizarExtraMensagens.falhaAplicarFlags.replace('{erro}', err instanceof Error ? err.message : String(err)),
        );
        sair(ExitCode.Failure);
        return;
      }

      log.info(chalk.bold(CliAtualizarExtraMensagens.iniciandoAtualizacao));

      const baseDir = process.cwd();
      let fileEntries: FileEntryWithAst[] = [];

      try {
        const tecnicas = asTecnicas(registroAnalistas as Tecnica[]);
        const resultado = await iniciarInquisicao(baseDir, {
          incluirMetadados: false,
        }, tecnicas);
        fileEntries = resultado.fileEntries;

        const guardianResultado = await scanSystemIntegrity(fileEntries);

        if (
          guardianResultado.status ===
            ('ok' as typeof guardianResultado.status) ||
          guardianResultado.status ===
            ('baseline-aceito' as typeof guardianResultado.status)
        ) {
          log.sucesso(
            CliAtualizarExtraMensagens.guardianIntegridadeValidada.replace('{icone}', ICONES_STATUS.ok),
          );
        } else {
          log.aviso(
            CliAtualizarExtraMensagens.guardianBaselineAlterado,
          );
          log.info(
            CliAtualizarExtraMensagens.recomendadoGuardianDiff,
          );
        }

        const cmd = opts.global
          ? 'npm install -g sensei@latest'
          : 'npm install sensei@latest';

        logSistema.atualizacaoExecutando(cmd);
        executarShellSeguro(cmd, { stdio: 'inherit' });

        logSistema.atualizacaoSucesso();
      } catch (err: unknown) {
        logSistema.atualizacaoFalha();
        if (
          typeof err === 'object' &&
          err &&
          'detalhes' in err &&
          Array.isArray((err as { detalhes?: unknown }).detalhes)
        ) {
          (err as { detalhes: string[] }).detalhes.forEach((d: string) => {
            logSistema.atualizacaoDetalhes(d);
          });
        }
        if (config.DEV_MODE)
          log.erro(err instanceof Error ? err.message : String(err));
        // Em ambiente de teste (Vitest), n\u00e3o encerre o processo para n\u00e3o derrubar o runner
        sair(ExitCode.Failure);
        return;
      }
    });
}
