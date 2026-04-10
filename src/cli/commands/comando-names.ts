// SPDX-License-Identifier: MIT

import { parse } from '@babel/parser';
import traverseModule from '@babel/traverse';
import { ExitCode, sair } from '@cli/helpers/exit-codes.js';
import { getSourceFiles } from '@cli/helpers/get-files-src.js';
import { chalk } from '@core/config/chalk-safe.js';
import { getMessages } from '@core/messages/index.js';
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';

const { log, CliComandoNamesMensagens } = getMessages();

const traverse = traverseModule.default || traverseModule;

export function comandoNames(
  aplicarFlagsGlobais: (opts: Record<string, unknown>) => void,
): Command {
  return new Command('names')
    .description(CliComandoNamesMensagens.descricao)
    .option(
      '--legacy',
      CliComandoNamesMensagens.opcaoAgregado,
      false,
    )
    .action(async function (this: Command, opts: { legacy?: boolean }) {
      try {
        await aplicarFlagsGlobais(
          this.parent && typeof this.parent.opts === 'function'
            ? this.parent.opts()
            : {},
        );
      } catch (err) {
        log.erro(
          `Falha ao aplicar flags: ${err instanceof Error ? err.message : String(err)}`,
        );
        sair(ExitCode.Failure);
        return;
      }

      const RAIZ_DIR = process.cwd();
      const SRC_DIR = path.resolve(RAIZ_DIR, 'src');
      const SAIDA_DIR = path.resolve(RAIZ_DIR, 'names');

      if (!fs.existsSync(SAIDA_DIR)) {
        fs.mkdirSync(SAIDA_DIR, { recursive: true });
      }

      log.info(chalk.cyan(CliComandoNamesMensagens.iniciandoVarredura));

      const files = getSourceFiles(SRC_DIR);
      const allNomes = new Set<string>();
      let arquivosComNomes = 0;

      for (const file of files) {
        try {
          const code = fs.readFileSync(file, 'utf-8');
          const ast = parse(code, {
            sourceType: 'module',
            plugins: ['typescript', 'decorators-legacy'],
          });

          const variableNomes = new Set<string>();
          traverse(ast, {
            VariableDeclarator(path) {
              if (path.node.id.type === 'Identifier') {
                const name = path.node.id.name;
                variableNomes.add(name);
                allNomes.add(name);
              }
            },
          });

          if (variableNomes.size > 0) {
            const relPath = path.relative(SRC_DIR, file);
            const outRelPath = relPath.replace(/\.(ts|js)$/i, '.txt');
            const outFile = path.join(SAIDA_DIR, outRelPath);
            const outDir = path.dirname(outFile);
            if (!fs.existsSync(outDir)) {
              fs.mkdirSync(outDir, { recursive: true });
            }
            const sorted = Array.from(variableNomes).sort();
            const content = sorted.map((name) => `${name} = `).join('\n');
            fs.writeFileSync(outFile, content);
            arquivosComNomes++;
          }
        } catch {
            console.warn(
              CliComandoNamesMensagens.avisoErroProcessar.replace('{arquivo}', path.relative(RAIZ_DIR, file)),
            );
        }
      }

      if (opts.legacy) {
        const SAIDA_ARQUIVO = path.resolve(SAIDA_DIR, 'name.txt');
        const sortedNomes = Array.from(allNomes).sort();
        const content = sortedNomes.map((name) => `${name} = `).join('\n');
        fs.writeFileSync(SAIDA_ARQUIVO, content);
        log.sucesso(
          CliComandoNamesMensagens.varreduraConcluidaFragmentada
            .replace('{variaveis}', String(sortedNomes.length))
            .replace('{arquivos}', String(arquivosComNomes))
            .replace('{pastaFragmentada}', chalk.bold('names/'))
            .replace('{pastaAgregada}', chalk.bold(path.relative(RAIZ_DIR, SAIDA_ARQUIVO))),
        );
      } else {
        log.sucesso(
          CliComandoNamesMensagens.varreduraConcluidaEspelhada
            .replace('{variaveis}', String(allNomes.size))
            .replace('{arquivos}', String(arquivosComNomes))
            .replace('{pasta}', chalk.bold('names/')),
        );
      }
    });
}
