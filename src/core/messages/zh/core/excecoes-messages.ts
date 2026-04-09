// SPDX-License-Identifier: MIT

/**
 * @fileoverview Exception and error messages for Prometheus core.
 * Centralizes error strings related to CLI, plugins, analysts,
 * validation, security, persistence, schema, scanner, rollback, and reports.
 */

export const ExcecoesMensagens = {
  // CLI
  exit1: 'exit:1',
  requireMutateFsAutoFix: 'Auto-fix unavailable',
  autoFixTimeout: (timeoutMs: number) => `自动修复 timeout after ${timeoutMs}ms`,
  // Plugins / safe import
  pluginsDesabilitadosSafeMode: 'Plugin loading disabled in SAFE_MODE. Set PROMETHEUS_ALLOW_PLUGINS=1 to allow.',
  pluginBloqueado: (erro: string) => `插件 blocked: ${erro}`,
  caminhoPluginNaoResolvido: 'Plugin path not resolved',
  // Plugin registry
  pluginRegistradoNaoPodeSerObtido: (name: string) => `插件 ${name} is registered but cannot be obtained`,
  pluginCarregandoPromiseNaoPodeSerObtida: (name: string) => `插件 ${name} is being loaded but promise cannot be obtained`,
  naoFoiPossivelCarregarPlugin: (name: string, errMsg: string) => `Could not load 插件 '${name}': ${errMsg}`,
  pluginDeveTerNomeValido: 'Plugin must have a valid name',
  pluginDeveTerVersaoValida: 'Plugin must have a valid version',
  pluginDeveDefinirPeloMenosUmaExtensao: 'Plugin must define at least one extension',
  pluginDeveImplementarMetodoParse: 'Plugin must implement parse() method',
  // Types/Analysts
  definicaoAnalistaInvalida: 'Invalid analyst definition',
  analistaSemFuncaoAplicar: (nome: string) => `Analyst ${nome} has no apply function`,
  // Validation / Security
  caminhoForaDaCwdNaoPermitido: (p: string) => `Path outside CWD not allowed: ${p}`,
  persistenciaNegadaForaRaizProjeto: (caminho: string) => `Persistence denied: path outside project root: ${caminho}`,
  // Persistence (environment)
  fsWriteFileBinaryIndisponivel: 'fs.writeFile (binary) unavailable in current environment',
  fsReadFileIndisponivel: 'fs.readFile unavailable in current environment',
  fsWriteFileIndisponivel: 'fs.writeFile unavailable in current environment',
  fsRenameIndisponivel: 'fs.rename unavailable in current environment',
  fsMkdirIndisponivel: 'fs.mkdir unavailable in current environment',
  // Schema
  versaoSchemaDesconhecida: (versao: string) => `Unknown schema version: ${versao}`,
  relatorioSchemaInvalido: (erros: string) => `报告 with invalid schema: ${erros}`,
  // File registry
  arquivoNaoEncontrado: (fileCaminho: string) => `文件 not found: ${fileCaminho}`,
  validacaoFalhouPara: (fileCaminho: string) => `Validation failed for ${fileCaminho}`,
  erroAoLer: (fileCaminho: string, errMsg: string) => `错误 reading ${fileCaminho}: ${errMsg}`,
  erroAoEscrever: (fileCaminho: string, errMsg: string) => `错误 writing ${fileCaminho}: ${errMsg}`,
  erroAoDeletar: (fileCaminho: string, errMsg: string) => `错误 deleting ${fileCaminho}: ${errMsg}`,
  // Scanner
  statIndefinidoPara: (fullCaminho: string) => `Stat undefined for ${fullCaminho}`,
  // Rollback
  mapaReversaoCorrompido: 'Corrupted rollback map',
  // Reports
  semPkg: 'no pkg'
} as const;
