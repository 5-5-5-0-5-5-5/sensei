#!/usr/bin/env node
// SPDX-License-Identifier: MIT
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { registrarComandos } from '@cli/comandos.js';
import { comandoPerf } from '@cli/commands/index.js';
import { ExitCode, sair } from '@cli/helpers/exit-codes.js';
import chalk from '@core/config/chalk-safe.js';
import { aplicarConfigParcial, config, inicializarConfigDinamica } from '@core/config/config.js';
import { getMessages, ICONES_NIVEL } from '@core/messages/index.js';
import type { ConversationMemory } from '@shared/memory.js';
import { getDefaultMemory } from '@shared/memory.js';
import { lerArquivoTexto } from '@shared/persistence/persistencia.js';
import type { CommanderError } from 'commander';
import { Command } from 'commander';

// 🌐 Flags globais aplicáveis em todos os comandos
import type { ErrorLike,PrometheusGlobalFlags } from '@';
import { extrairMensagemErro } from '@';

const { log, CliBinMensagens } = getMessages();

// caminho do módulo (usado para localizar arquivos de configuração)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 📦 Ler versão dinamicamente do package.json

async function getVersion(): Promise<string> {
  try {
    // Ao compilar, este arquivo vai para dist/bin; o package.json fica na raiz (subir dois níveis)
    const packageCaminho = join(__dirname, '..', '..', 'package.json');
    const raw = await lerArquivoTexto(packageCaminho);
    const pkg = raw ? JSON.parse(raw) : ({} as Record<string, unknown>);
    return pkg && (pkg as {
      version?: string;
    }).version || '0.0.0';
  } catch (err) {
    log.debug(`Erro ao obter versão em getVersion: ${  err instanceof Error ? err.message : String(err)}`);
    return '0.0.0'; // fallback
  }
}

// 🛠️ Configuração principal do CLI
const program = new Command();

// �️ Função para aplicar flags globais
async function aplicarFlagsGlobais(opts: unknown) {
  const flags = opts as PrometheusGlobalFlags;
  // Sanitização e normalização (pode lançar)
  try {
    // lazy import para não criar ciclo
    const {
      sanitizarFlags
    } = await import('@shared/validation/validacao.js');
    sanitizarFlags(flags as Record<string, unknown>);
  } catch (e) {
    console.error(chalk.red(CliBinMensagens.flagsInvalidas.replace('{erro}', (e as Error).message)));
    sair(ExitCode.InvalidUsage);
  }
  config.REPORT_SILENCE_LOGS = Boolean(flags.silence);
  config.REPORT_EXPORT_ENABLED = Boolean(flags.export);
  config.REPORT_EXPORT_FULL = Boolean((flags as Record<string, unknown>)['exportFull']);
  const debugAtivo = Boolean(flags.debug) || process.env.PROMETHEUS_DEBUG === 'true';
  config.DEV_MODE = debugAtivo;
  config.SCAN_ONLY = Boolean(flags.scanOnly);
  // Se silence está ativo, verbose é sempre falso
  config.VERBOSE = flags.silence ? false : Boolean(flags.verbose);
  const overrides: Record<string, unknown> = {};
  const optObj = opts as Record<string, unknown>;
  if (typeof optObj.logEstruturado === 'boolean') overrides.LOG_ESTRUTURADO = optObj.logEstruturado;
  if (typeof optObj.incremental === 'boolean') overrides.ANALISE_INCREMENTAL_ENABLED = optObj.incremental;
  if (typeof optObj.metricas === 'boolean') overrides.ANALISE_METRICAS_ENABLED = optObj.metricas;
  if (Object.keys(overrides).length) aplicarConfigParcial(overrides);
}

// 🔗 Registro de todos os comandos
registrarComandos(program, o => aplicarFlagsGlobais(o));
program.addCommand(comandoPerf());

// 🚀 Execução do CLI
// Carrega config de arquivo/env explicitamente no processo do CLI, mesmo sob VITEST (e2e spawn)
// NOTE: a execução principal foi extraída para `mainCli` para permitir testes que importam este
// módulo sem disparar automaticamente a execução (reduz falsos-positivos do analisador).
export async function mainCli(): Promise<void> {
  // Inicializa memória de conversas

  // Handler de rejeições não tratadas com mensagem identificável (usado por testes e ops)
  function __prometheus_unhandledRejectionHandler(err: ErrorLike) {
    const MARCADOR = CliBinMensagens.unhandledRejection;
    const mensagem = extrairMensagemErro(err);
    console.error(MARCADOR, mensagem);
    if (!process.env.VITEST) {
      if (err && typeof err === 'object' && 'stack' in err) {
        console.error((err as {
          stack?: string;
        }).stack);
      }
      process.exit(1);
    }
  }
  process.on('unhandledRejection', __prometheus_unhandledRejectionHandler);

  // Mantemos handler para exceções não capturadas — garante comportamento crítico em produção
  process.on('uncaughtException', (err: ErrorLike) => {
    const mensagem = extrairMensagemErro(err);
    console.error(chalk.red(CliBinMensagens.excecaoNaoCapturada.replace('{mensagem}', mensagem)));
    if (err && typeof err === 'object' && 'stack' in err) {
      console.error((err as {
        stack?: string;
      }).stack);
    }
    // só encerra fora do ambiente de teste
    if (!process.env.VITEST) sair(ExitCode.Critical);
  });
  let memoria: ConversationMemory | undefined;
  try {
    memoria = await getDefaultMemory();
  } catch (err) {
    log.debug(`Erro ao carregar memória em mainCli: ${  err instanceof Error ? err.message : String(err)}`);
  }
  // Aplica defaults de produção (se presentes) antes de inicializar a config dinâmica.
  try {
    if (process.env.NODE_ENV === 'production') {
      try {
        // Em dist/bin, o safe config está na raiz do pacote: subir dois níveis
        const safeCfgCaminho = join(__dirname, '..', '..', 'prometheus.config.safe.json');
        const raw = await lerArquivoTexto(safeCfgCaminho);
        const safeCfg = raw ? JSON.parse(raw) : ({} as Record<string, unknown>);
        const prod = safeCfg?.productionDefaults;
        if (prod && typeof prod === 'object') {
          for (const [k, v] of Object.entries(prod)) {
            if (process.env[k] === undefined) process.env[k] = String(v);
          }
        }
      } catch (err) {
        // ignore - arquivo safe pode não existir em todos os ambientes
        log.debug(`Erro ao carregar production defaults em mainCli: ${  err instanceof Error ? err.message : String(err)}`);
      }
    }
    // Atualiza a versão do programa de forma assíncrona antes do parse
    try {
      const versionNumber = await getVersion();
      // commander expõe private API ._version; usar método público quando disponível
      if (typeof (program as unknown as {
        version: (v: string) => void;
      }).version === 'function') {
        (program as unknown as {
          version: (v: string) => void;
        }).version(versionNumber);
      } else {
        // fallback defensivo
        (program as unknown as {
          _version?: string;
        })._version = versionNumber;
      }
    } catch (err) {
      log.debug(`Erro ao aplicar versão no program em mainCli: ${  err instanceof Error ? err.message : String(err)}`);
    }
    await inicializarConfigDinamica();
  } catch (err) {
    // ignore: CLI continua com defaults
    log.debug(`Erro ao inicializar config dinâmica em mainCli: ${  err instanceof Error ? err.message : String(err)}`);
  }
  // Antes de parsear, trata flags de histórico simples
  const argv = process.argv.slice(2);
  if (argv.includes('--historico')) {
    if (memoria) {
      const resumo = memoria.getSummary();
      console.log(chalk.cyan(CliBinMensagens.resumoConversa.titulo));
      console.log(CliBinMensagens.resumoConversa.total.replace('{total}', String(resumo.totalMessages)));
      console.log(CliBinMensagens.resumoConversa.usuario.replace('{total}', String(resumo.userMessages)));
      console.log(CliBinMensagens.resumoConversa.prometheus.replace('{total}', String(resumo.assistantMessages)));
      if (resumo.firstMessage) console.log(CliBinMensagens.resumoConversa.primeira.replace('{mensagem}', resumo.firstMessage));
      if (resumo.lastMessage) console.log(CliBinMensagens.resumoConversa.ultima.replace('{mensagem}', resumo.lastMessage));
      console.log('');
    } else {
      console.log(chalk.yellow(CliBinMensagens.historicoIndisponivel));
    }
    return; // encerra após exibir
  }
  if (argv.includes('--limpar-historico')) {
    if (memoria) await memoria.clear();
    console.log(chalk.green(CliBinMensagens.historicoLimpo));
    return;
  }

  // Registra a execução atual no histórico
  try {
    await memoria?.addMessage({
      role: 'user',
      content: `Execução CLI: ${argv.join(' ') || '(sem argumentos)'}`,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    log.debug(`Erro ao registrar mensagem no histórico em mainCli: ${  err instanceof Error ? err.message : String(err)}`);
  }

  // Intercepta erros de uso do Commander e mapeia para exit code 3
  program.exitOverride((err: CommanderError) => {
    const code = err?.code || '';
    const isUsoInvalido = code === 'commander.unknownCommand' || code === 'commander.unknownOption' || code === 'commander.missingArgument' || code === 'commander.optionMissingArgument' || code === 'commander.missingMandatoryOptionValue' || code === 'commander.invalidArgument';
    if (isUsoInvalido) {
      console.error(chalk.red(`${ICONES_NIVEL.erro} ${err.message}`));
      sair(ExitCode.InvalidUsage);
      return;
    }
    throw err;
  });
  await program.parseAsync(process.argv);
}

// Global handler para reduzir falsos-positivos e capturar rejeições não tratadas.
// A mensagem contém um marcador único para que testes possam verificar o registro.
function __prometheus_unhandledRejectionHandler(err: ErrorLike) {
  const MARCADOR = CliBinMensagens.unhandledRejection;
  const mensagem = extrairMensagemErro(err);
  // Mensagem identificável: usada pelos testes unitários para detectar o handler
  // e por operadores para diagnóstico rápido.

  console.error(MARCADOR, mensagem);
  // Em ambiente de testes preferimos não encerrar o processo — mantém compatibilidade com Vitest.
  if (!process.env.VITEST) {
    if (err && typeof err === 'object' && 'stack' in err) {
      // imprime stack em produção para diagnóstico

      console.error((err as {
        stack?: string;
      }).stack);
    }
    process.exit(1);
  }
}
process.on('unhandledRejection', __prometheus_unhandledRejectionHandler);

// Invoca a função principal apenas quando o arquivo for executado como entrypoint.
// Isso evita efeitos colaterais ao importar o módulo em testes ou ferramentas de análise.
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] && process.argv[1].endsWith('/bin/cli.js')) {
  mainCli().catch(err => {
    // mantém comportamento compatível em produção — mas evita exit em VITEST
    const mensagem = extrairMensagemErro(err);
    console.error(chalk.red(`${ICONES_NIVEL.erro} ${mensagem}`));
    if (err && typeof err === 'object' && 'stack' in err) {
      console.error((err as {
        stack?: string;
      }).stack);
    }
    if (!process.env.VITEST) process.exit(1);
  });
} else {
  // Ao importar (ex.: Vitest), não executamos a CLI automaticamente — ainda registramos o handler acima.
}