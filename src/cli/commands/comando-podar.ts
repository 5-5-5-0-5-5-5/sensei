// SPDX-License-Identifier: MIT

import { removerArquivosOrfaos } from '@analistas/corrections/poda.js';
import { registroAnalistas } from '@analistas/registry/registry.js';
import { exportarRelatoriosPoda } from '@cli/handlers/poda-exporter.js';
import { ExitCode, sair } from '@cli/helpers/exit-codes.js';
import { expandIncludePatterns, processPatternList } from '@cli/helpers/pattern-helpers.js';
import { chalk } from '@core/config/chalk-safe.js';
import { config } from '@core/config/config.js';
import { iniciarInquisicao } from '@core/execution/inquisidor.js';
import { messages } from '@core/messages/index.js';
import { Command } from 'commander';

import type { ArquivoFantasma, ResultadoPoda, Tecnica } from '@';
import { asTecnicas } from '@';

const { log, logSistema } = messages;

export function comandoPodar(aplicarFlagsGlobais: (opts: Record<string, unknown>) => void): Command {
  return new Command('podar').description('Remove arquivos órfãos e lixo do repositório.').option('-f, --force', 'Remove arquivos sem confirmação (CUIDADO!)', false).option('--include <padrao>', 'Glob pattern a INCLUIR (pode repetir a flag ou usar vírgulas / espaços para múltiplos)', (val: string, prev: string[]) => {
    prev.push(val);
    return prev;
  }, [] as string[]).option('--exclude <padrao>', 'Glob pattern a EXCLUIR adicionalmente (pode repetir a flag ou usar vírgulas / espaços)', (val: string, prev: string[]) => {
    prev.push(val);
    return prev;
  }, [] as string[]).action(async function (this: Command, opts: {
    force?: boolean;
    include?: string[];
    exclude?: string[];
  }) {
    try {
      await aplicarFlagsGlobais(this.parent && typeof this.parent.opts === 'function' ? this.parent.opts() : {});
    } catch (err) {
      log.erro(`Falha ao aplicar flags: ${err instanceof Error ? err.message : String(err)}`);
      sair(ExitCode.Failure);
      return;
    }
    log.info(chalk.bold(messages.CliComandoPodarMensagens.inicio));
    const baseDir = process.cwd();
    try {
      // Normaliza padrões de include/exclude para sincronizar filtros com o scanner
      const includeListRaw = processPatternList(opts.include);
      const includeList = includeListRaw.length ? expandIncludePatterns(includeListRaw) : [];
      const excludeList = processPatternList(opts.exclude);
      if (includeList.length) config.CLI_INCLUDE_PATTERNS = includeList;
      if (excludeList.length) config.CLI_EXCLUDE_PATTERNS = excludeList;

      // 🔥 SIMPLIFICADO: sem sync de padrões obsoletos
      // CLI flags dominam globalExcludeGlob automaticamente

      const tecnicas = asTecnicas(registroAnalistas as Tecnica[]);
      const {
        fileEntries
      } = await iniciarInquisicao(baseDir, {
        incluirMetadados: false
      }, tecnicas);
      const resultadoPoda: ResultadoPoda = await removerArquivosOrfaos(fileEntries);
      if (resultadoPoda.arquivosOrfaos.length === 0) {
        log.sucesso(messages.CliComandoPodarMensagens.nenhumaSujeira(messages.ICONES_DIAGNOSTICO.sucesso));
        await exportarRelatoriosPoda({
          baseDir,
          podados: [],
          pendentes: [],
          simulado: !opts.force
        });
        return;
      }
      log.aviso(messages.CliComandoPodarMensagens.orfaosDetectados(resultadoPoda.arquivosOrfaos.length));
      resultadoPoda.arquivosOrfaos.forEach((file: ArquivoFantasma) => {
        log.info(messages.CliComandoPodarMensagens.linhaArquivoOrfao(file.arquivo));
      });
      if (!opts.force) {
        const readline = await import('node:readline/promises');
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout
        });
        const answer = await rl.question(chalk.yellow(messages.CliComandoPodarMensagens.confirmarRemocao));
        rl.close();

        // debug removido (usava console.log) – manter somente se modo debug ativo futuramente
        if (answer.toLowerCase() !== 's') {
          logSistema.podaCancelada();
          return;
        }
      }

      // Só remove se confirmado
      // --force: remove direto
      if (opts.force) {
        await removerArquivosOrfaos(fileEntries);
        logSistema.podaConcluida();
        const podados = resultadoPoda.arquivosOrfaos.map(f => ({
          arquivo: f.arquivo,
          motivo: f.referenciado ? 'inativo' : 'órfão',
          detectedAt: Date.now(),
          scheduleAt: Date.now()
        }));
        await exportarRelatoriosPoda({
          baseDir,
          podados,
          pendentes: [],
          simulado: false
        });
      }
    } catch (error) {
      const errMsg = typeof error === 'object' && error && 'message' in error ? (error as {
        message: string;
      }).message : String(error);
      log.erro(messages.CliComandoPodarMensagens.erroDurantePoda(errMsg));
      if (config.DEV_MODE) console.error(error);
      sair(ExitCode.Failure);
      return;
    }
  });
}
