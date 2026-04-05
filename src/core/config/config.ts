// SPDX-License-Identifier: MIT
import path from 'node:path';

import { lerArquivoTexto } from '@shared/persistence/persistencia.js';

import type { IncludeExcludeConfig } from '@';

import { SENSEI_ARQUIVOS,SENSEI_DIRS } from '../registry/paths.js';
import { LIMITES_PADRAO } from './limites.js';

// Diretórios internos do Sensei (agora usando paths centralizados)
const SENSEI_ESTADO = SENSEI_DIRS.STATE;
const ZELADOR_ABANDONED = path.join(SENSEI_ESTADO, 'abandonados');

// Configuração global do sistema Sensei
export const configPadrao = {
  VERBOSE: false,
  LOG_LEVEL: 'info' as 'erro' | 'aviso' | 'info' | 'debug',
  // 🌱 Flags gerais
  DEV_MODE: process.env.NODE_ENV === 'development' || process.env.SENSEI_DEV === 'true',
  AUTOANALISE_CONCURRENCY: 5,
  // Segurança: modo seguro impede ações destrutivas por padrão.
  // Em ambiente de testes (VITEST) mantemos SAFE_MODE desabilitado para preservar o comportamento das suites.
  // Para desativar por processo/ambiente fora de testes: SENSEI_SAFE_MODE=0
  SAFE_MODE: process.env.VITEST ? false : process.env.SENSEI_SAFE_MODE !== '0',
  // Permissões explícitas para permitir plugins/exec/fs mutações quando SAFE_MODE ativo
  ALLOW_PLUGINS: process.env.SENSEI_ALLOW_PLUGINS === '1' || false,
  ALLOW_EXEC: process.env.SENSEI_ALLOW_EXEC === '1' || false,
  ALLOW_MUTATE_FS: true,
  // 🛡️ Guardian
  GUARDIAN_ENABLED: true,
  GUARDIAN_ENFORCE_PROTECTION: true,
  GUARDIAN_BASELINE: SENSEI_ARQUIVOS.GUARDIAN_BASELINE,
  GUARDIAN_ALLOW_ADDS: false,
  GUARDIAN_ALLOW_CHG: false,
  GUARDIAN_ALLOW_DELS: false,
  // 📄 Relatórios
  REPORT_SILENCE_LOGS: false,
  // Quando true, suprime logs de progresso que incluem a palavra "parcial"
  // (ex.: "Diretórios escaneados (parcial): ..."). Útil para reduzir ruído em CI ou
  // ao executar em modo silencioso. Valor default: false.
  SUPPRESS_PARCIAL_LOGS: false,
  REPORT_EXPORT_ENABLED: false,
  REPORT_OUTPUT_DIR: SENSEI_DIRS.REPORTS,
  // Quando true, além do relatório summary, gera também o relatório completo (pesado) em JSON
  REPORT_EXPORT_FULL: false,
  // Fragmentation defaults: controlam o tamanho máximo de cada shard ao fragmentar relatórios
  REPORT_FRAGMENT_OCCURRENCES: 2000,
  REPORT_FRAGMENT_FILEENTRIES: 500,
  // Quantidade top-N usada no resumo por shard (top types / top arquivos)
  REPORT_FRAGMENT_SUMMARY_TOPN: 5,
  // Relatório de Saúde (controle de exibição)
  // Quando true, usa tabela com moldura no modo normal/compact (ruído reduzido)
  RELATORIO_SAUDE_TABELA_ENABLED: true,
  // Quando true, em modo VERBOSE a tabela é desativada e exibimos lista detalhada
  RELATORIO_SAUDE_DETALHADO_VERBOSE: true,
  // 📂 Zelador
  SENSEI_STATE_DIR: SENSEI_ESTADO,
  ZELADOR_ABANDONED_DIR: ZELADOR_ABANDONED,
  ZELADOR_PENDING_PATH: path.join(SENSEI_ESTADO, 'pendentes.json'),
  ZELADOR_REACTIVATE_PATH: path.join(SENSEI_ESTADO, 'reativar.json'),
  ZELADOR_HISTORY_PATH: path.join(SENSEI_ESTADO, 'historico.json'),
  ZELADOR_REPORT_PATH: path.join(SENSEI_ESTADO, 'poda-sensei.md'),
  ZELADOR_GHOST_INACTIVITY_DAYS: 30,
  // Padrões adicionais controlados via CLI para filtragem dinâmica pontual
  CLI_INCLUDE_PATTERNS: [] as string[],
  // quando não vazio: somente arquivos que casem algum pattern serão considerados (override dos ignores padrão)
  // Grupos de include: cada ocorrência de --include forma um grupo; padrões separados por vírgula/espaço dentro do mesmo argumento devem ser TODOS casados (AND).
  // O arquivo é incluído se casar QUALQUER grupo (OR entre grupos). Mantemos CLI_INCLUDE_PATTERNS como lista achatada para raízes/compat.
  CLI_INCLUDE_GROUPS: [] as string[][],
  CLI_EXCLUDE_PATTERNS: [] as string[],
  // sempre excluídos (aplicado após include)
  // Regras dinâmicas: ÚNICA FONTE DE VERDADE para filtros de varredura
  INCLUDE_EXCLUDE_RULES: {
    globalExcludeGlob: [
    // Dependências e artefatos externos
    '**/node_modules/**', 'scripts/**', '.pnpm/**', 'out/**', 'build/**', 'dist/**', 'coverage/**', '**/dist/**', '**/build/**', '**/.turbo/**', '**/.vercel/**', '**/.expo/**', '**/.parcel-cache/**',
    // Arquivos deprecados e pensando
    '.deprecados/**', '**/deprecados/**', '.pensando/**', '**/pensando/**',
    // Estado interno / cache / builds
    '**/.sensei/**', 'sensei/**', 'dist/**', '**/dist/**', 'coverage/**', '**/coverage/**', 'build/**', '**/build/**',
    // Logs e lockfiles
    '**/*.log', '**/*.lock', 'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
    // VCS
    '**/.git/**']
  } as IncludeExcludeConfig,
  ZELADOR_LINE_THRESHOLD: 20,
  // 🔍 Analistas
  SCANNER_EXTENSOES_COM_AST: ['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  // Core JS/TS
  '.java',
  // Java plugin
  '.kt', '.kts',
  // Kotlin plugin
  '.gradle', '.gradle.kts',
  // Gradle plugin
  '.xml', '.html', '.htm', '.css' // Core extras
  ],
  VIGIA_TOP_N: 10,
  ANALISE_LIMITES: {
    FUNCOES_LONGAS: {
      MAX_LINHAS: LIMITES_PADRAO.CODIGO.MAX_LINHAS_FUNCAO,
      MAX_PARAMETROS: LIMITES_PADRAO.CODIGO.MAX_PARAMETROS_FUNCAO,
      MAX_ANINHAMENTO: LIMITES_PADRAO.CODIGO.MAX_ANINHAMENTO_IF
    },
    CODIGO_FRAGIL: {
      MAX_LINHAS_FUNCAO: LIMITES_PADRAO.CODIGO.MAX_LINHAS_FUNCAO,
      MAX_PARAMETROS: LIMITES_PADRAO.CODIGO.MAX_PARAMETROS_FUNCAO,
      MAX_NESTED_CALLBACKS: LIMITES_PADRAO.CODIGO.MAX_NESTED_CALLBACKS
    }
  },
  ANALISE_AST_CACHE_ENABLED: true,
  ANALISE_METRICAS_ENABLED: true,
  // Timeout por analista individual (ms) - 0 desabilita
  ANALISE_TIMEOUT_POR_ANALISTA_MS: 30000,
  // 30 segundos por padrão
  // Pool de workers para processamento paralelo
  WORKER_POOL_ENABLED: true,
  WORKER_POOL_MAX_WORKERS: 0,
  // 0 = usar número de CPUs
  WORKER_POOL_BATCH_SIZE: 10,
  // Caminho de histórico de métricas (migrado para subdir dedicado; arquivo antigo na raiz ainda lido como fallback em runtime onde aplicável)
  ANALISE_METRICAS_HISTORICO_PATH: path.join(SENSEI_ESTADO, 'historico-metricas', 'metricas-historico.json'),
  ANALISE_METRICAS_HISTORICO_MAX: 200,
  // Priorização de arquivos (usa histórico incremental anterior)
  ANALISE_PRIORIZACAO_ENABLED: true,
  ANALISE_PRIORIZACAO_PESOS: {
    duracaoMs: 1,
    ocorrencias: 2,
    penalidadeReuso: 0.5
  },
  LOG_ESTRUTURADO: false,
  // Incremental desabilitado por padrão para evitar efeitos colaterais em testes; habilite explicitamente onde necessário
  ANALISE_INCREMENTAL_ENABLED: false,
  ANALISE_INCREMENTAL_STATE_PATH: path.join(SENSEI_ESTADO, 'incremental-analise.json'),
  ANALISE_INCREMENTAL_VERSION: 1,
  // Performance (snapshots sintéticos)
  PERF_SNAPSHOT_DIR: path.join('docs', 'perf'),
  // Estrutura – diretórios alvo padronizados (evita literais dispersos)
  ESTRUTURA_TARGETS: {
    TESTS_RAIZ_DIR: 'src',
    SCRIPTS_DIR: path.posix.join('src', 'scripts'),
    CONFIG_DIR: 'config',
    TYPES_DIR: 'types',
    DOCS_FRAGMENTS_DIR: path.posix.join('docs', 'fragments')
  },
  // Convenções do projeto analisado (customizável via sensei.config.json)
  conventions: {
    // Diretório onde tipos dedicados devem viver (ex.: 'src/tipos', 'app/types')
    typesDirectory: path.posix.join('src', 'tipos')
  },
  // Convenções de nomes de pastas padrão (customizável via sensei.config.json)
  // Se o projeto usa 'types' ao invés de 'tipos', configure aqui para ignorar ou sugerir renomeação
  nameConventions: {
    typesDirectory: 'tipos',
    testsDirectory: 'testes',
    docsDirectory: 'docs',
    srcDirectory: 'src',
    configDirectory: 'config',
    scriptsDirectory: 'scripts',
    distDirectory: 'dist',
    assetsDirectory: 'assets',
    utilsDirectory: 'utils',
    servicesDirectory: 'services',
    componentsDirectory: 'components',
    modelsDirectory: 'models',
    middlewareDirectory: 'middleware',
    routesDirectory: 'routes',
    controllersDirectory: 'controllers',
    viewsDirectory: 'views',
    stylesDirectory: 'styles',
    imagesDirectory: 'images',
    localesDirectory: 'locales'
  },
  // Configuração do detector-markdown (customizável via sensei.config.json)
  detectorMarkdown: {
    checkProveniencia: true,
    checkLicenses: true,
    checkReferences: true,
    headerLines: 30,
    // Whitelist adicional (merge com defaults do detector)
    whitelist: {
      paths: [] as string[],
      patterns: [] as string[],
      dirs: [] as string[]
    },
    // merge | replace (se replace, ignora defaults do detector)
    whitelistMode: 'merge' as 'merge' | 'replace'
  },
  // Estrutura (plugins, layers, auto-fix, concorrência)
  STRUCTURE_PLUGINS: [],
  STRUCTURE_AUTO_FIX: false,
  STRUCTURE_CONCURRENCY: 5,
  ESTRUTURA_CAMADAS: {},
  STRUCTURE_REVERSE_MAP_PATH: path.join(SENSEI_ESTADO, 'mapa-reversao.json'),
  // Limite de tamanho (bytes) para considerar mover arquivo em plano de reorganização
  ESTRUTURA_PLANO_MAX_FILE_SIZE: 256 * 1024,
  // ~250KB
  // Limite de arquivos considerados "muitos arquivos na raiz" (ajustável por repo)
  ESTRUTURA_ARQUIVOS_RAIZ_MAX: 10,
  // Compatibilidade/legado
  STATE_DIR: SENSEI_ESTADO,
  ZELADOR_STATE_DIR: SENSEI_ESTADO,
  COMPACT_MODE: false,
  // Modo somente varredura (sem AST, sem técnicas) quando ativado por flag
  SCAN_ONLY: false,
  // Alias semântico (uniformização com ANALISE_*) – manter sincronizado com SCAN_ONLY
  ANALISE_SCAN_ONLY: false,
  // Controle de ruído de erros de parsing
  PARSE_ERRO_AGRUPAR: true,
  // quando true, múltiplos erros no mesmo arquivo são consolidados
  PARSE_ERRO_MAX_POR_ARQUIVO: 1,
  // limite de ocorrências individuais por arquivo antes de agrupar
  // Se verdadeiro, qualquer PARSE_ERRO (mesmo agregado) provoca exit code 1
  PARSE_ERRO_FALHA: false,
  // Sistema de configuração granular de regras
  rules: {} as Record<string, {
    severity?: 'error' | 'warning' | 'info' | 'off';
    exclude?: string[];
    allowTestFiles?: boolean;
  }>,
  testPadroes: {
    files: ['**/*.test.*', '**/*.spec.*', 'test/**/*', 'tests/**/*', '**/__tests__/**'] as string[],
    excludeFromOrphanCheck: true,
    allowAnyType: false
  },
  // Locale das mensagens (pt padrão, en disponível). Definido em sensei.config.json
  LOCALE: 'pt' as string
};

// Clonamos para instância mutável
export const config: typeof configPadrao & {
  __OVERRIDES__?: Record<string, {
    from: unknown;
    to: unknown;
    fonte: string;
  }>;
} = structuredClone(configPadrao);
type DiffRegistro = {
  from: unknown;
  to: unknown;
  fonte: string;
};

// Helper interno: verifica se é um objeto plano (não array)

function ehObjetoPlano(v: unknown): v is Record<string, unknown> {
  return !!v && typeof v === 'object' && !Array.isArray(v);
}

// Merge profundo e seguro de objetos, registrando diferenças para auditoria

function mesclarProfundo(target: Record<string, unknown>, src: Record<string, unknown>, fonte: string, diffs: Record<string, DiffRegistro>, prefix = ''): void {
  for (const k of Object.keys(src || {})) {
    // Proteção contra prototype pollution: ignora chaves perigosas
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
      continue;
    }
    const keyCaminho = prefix ? `${prefix}.${k}` : k;
    const srcVal = src[k];
    const tgtVal = target[k];
    if (ehObjetoPlano(srcVal) && ehObjetoPlano(tgtVal)) {
      mesclarProfundo(tgtVal as Record<string, unknown>, srcVal as Record<string, unknown>, fonte, diffs, keyCaminho);
    } else if (srcVal !== undefined) {
      if (tgtVal !== srcVal) {
        diffs[keyCaminho] = {
          from: tgtVal,
          to: srcVal,
          fonte
        };
      }
      // atribuição dinâmica segura
      (target as Record<string, unknown>)[k] = srcVal as unknown;
    }
  }
}
async function carregarArquivoConfig(): Promise<Record<string, unknown> | null> {
  // Ordem de busca simples
  const candidatos = ['sensei.config.json', 'src/config.json'];
  for (const nome of candidatos) {
    try {
      const caminho = path.join(process.cwd(), nome);
      const conteudo = await lerArquivoTexto(caminho);
      const json = conteudo && conteudo.trim() ? JSON.parse(conteudo) : null;
      if (json) {
        // Converte configuração simplificada para formato interno
        return converterConfigSimplificada(json);
      }
    } catch {
      /* ignore */
    }
  }
  return null;
}

/**
 * Converte configuração simplificada (amigável ao usuário) para formato interno
 */
function converterConfigSimplificada(config: Record<string, unknown>): Record<string, unknown> {
  const resultado = {
    ...config
  };

  // Converte "exclude" para "INCLUDE_EXCLUDE_RULES.globalExcludeGlob"
  if (Array.isArray(config.exclude)) {
    resultado.INCLUDE_EXCLUDE_RULES = {
      globalExcludeGlob: config.exclude,
      dirRules: {},
      defaultExcludes: null
    };
    delete resultado.exclude;
  }

  // Converte "languages" para "languageSupport" com formato completo
  if (config.languages && typeof config.languages === 'object') {
    const langs = config.languages as Record<string, boolean>;
    resultado.languageSupport = {};

    // Configurações padrão por linguagem
    const langPadroes = {
      javascript: {
        parser: 'babel',
        plugin: 'core'
      },
      typescript: {
        parser: 'babel',
        plugin: 'core'
      },
      html: {
        parser: 'htmlparser2',
        plugin: 'core'
      },
      css: {
        parser: 'css-tree',
        plugin: 'core'
      },
      xml: {
        parser: 'fast-xml-parser',
        plugin: 'core'
      },
      php: {
        parser: 'heuristic',
        plugin: 'core'
      },
      python: {
        parser: 'heuristic',
        plugin: 'core'
      }
    };
    for (const [lang, enabled] of Object.entries(langs)) {
      const defaults = langPadroes[lang as keyof typeof langPadroes];
      if (defaults) {
        (resultado.languageSupport as Record<string, unknown>)[lang] = {
          enabled,
          ...defaults
        };
      }
    }

    // Configura plugins habilitados baseado nas linguagens
    const enabledPlugins = ['core'];
    resultado.plugins = {
      enabled: enabledPlugins,
      autoload: true,
      registry: '@sensei/plugins'
    };
    delete resultado.languages;
  }

  // Converte "suppress" para formato completo de supressão
  if (config.suppress && typeof config.suppress === 'object') {
    const suppress = config.suppress as Record<string, unknown>;
    if (Array.isArray(suppress.rules)) {
      resultado.suppressRules = suppress.rules;
    }
    if (suppress.severity && typeof suppress.severity === 'object') {
      resultado.suppressBySeverity = suppress.severity;
    }
    if (Array.isArray(suppress.paths)) {
      resultado.suppressByPath = suppress.paths;
    }
    delete resultado.suppress;
  }
  return resultado;
}
function sincronizarIgnorados() {
  const dyn = (config.INCLUDE_EXCLUDE_RULES || {}) as IncludeExcludeConfig;
  const glob = Array.isArray(dyn.globalExcludeGlob) ? dyn.globalExcludeGlob : [];

  // APENAS globalExcludeGlob é fonte de verdade - remove campos obsoletos
  const _itemList = Array.from(new Set(glob.map(g => String(g))));

  // Remove campos obsoletos completamente
  delete (config as unknown as Record<string, unknown>).ZELADOR_IGNORE_PATTERNS;
  delete (config as unknown as Record<string, unknown>).GUARDIAN_IGNORE_PATTERNS;
}
function carregarEnvConfig(): Record<string, unknown> {
  const resultado: Record<string, unknown> = {};
  // Mapeia cada chave do default para uma env SENSEI_<KEY>
  const stack: Array<{
    obj: Record<string, unknown>;
    prefix: string;
  }> = [{
    obj: configPadrao as unknown as Record<string, unknown>,
    prefix: ''
  }];
  while (stack.length) {
    const popped = stack.pop();
    if (!popped) break;
    const {
      obj,
      prefix
    } = popped;
    for (const k of Object.keys(obj)) {
      const keyCaminho = prefix ? `${prefix}.${k}` : k;
      const envNome = `SENSEI_${keyCaminho.replace(/\./g, '_').toUpperCase()}`;
      const currentVal = (obj as Record<string, unknown>)[k];
      if (ehObjetoPlano(currentVal)) {
        stack.push({
          obj: currentVal,
          prefix: keyCaminho
        });
      } else {
        const rawEnv = process.env[envNome];
        if (rawEnv !== undefined) {
          let val: unknown = rawEnv;
          if (/^(true|false)$/i.test(rawEnv)) val = rawEnv.toLowerCase() === 'true';else if (/^-?\d+(\.\d+)?$/.test(rawEnv)) val = Number(rawEnv);
          atribuirPorCaminho(resultado, keyCaminho, val);
        }
      }
    }
  }
  return resultado;
}

// Atribui um valor em um caminho ponto-notado, criando objetos intermediários conforme necessário

function isPrototypePollutingKey(key: string): boolean {
  return key === '__proto__' || key === 'constructor' || key === 'prototype';
}
function atribuirPorCaminho(base: Record<string, unknown>, keyCaminho: string, value: unknown) {
  const parts = keyCaminho.split('.');
  let cursor: Record<string, unknown> = base;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (isPrototypePollutingKey(part)) {
      // Evita poluição de protótipo ao encontrar uma chave perigosa no caminho
      return;
    }
    let next = cursor[part];
    if (!ehObjetoPlano(next)) {
      next = {};
      cursor[part] = next;
    }
    cursor = next as Record<string, unknown>;
  }
  const lastChave = parts[parts.length - 1];
  if (isPrototypePollutingKey(lastChave)) {
    // Evita poluição de protótipo na atribuição final
    return;
  }
  cursor[lastChave] = value;
}
export async function inicializarConfigDinamica(overridesCli?: Record<string, unknown>): Promise<Record<string, DiffRegistro>> {
  const diffs: Record<string, DiffRegistro> = {};
  const arquivo = await carregarArquivoConfig();
  if (arquivo) {
    mesclarProfundo(config as unknown as Record<string, unknown>, arquivo as Record<string, unknown>, 'arquivo', diffs);
  }
  const envCfg = carregarEnvConfig();
  if (Object.keys(envCfg).length) mesclarProfundo(config as unknown as Record<string, unknown>, envCfg, 'env', diffs);
  if (overridesCli && Object.keys(overridesCli).length) mesclarProfundo(config as unknown as Record<string, unknown>, overridesCli as Record<string, unknown>, 'cli', diffs);
  // Removido: fallback de migração para caminho antigo de métricas (não utilizado)
  // Sincroniza alias de modo somente varredura
  if (config.ANALISE_SCAN_ONLY && !config.SCAN_ONLY) config.SCAN_ONLY = true;else if (config.SCAN_ONLY && !config.ANALISE_SCAN_ONLY) config.ANALISE_SCAN_ONLY = true;
  // Sincroniza padrões de ignorados a partir da configuração dinâmica
  sincronizarIgnorados();
  config.__OVERRIDES__ = diffs;
  return diffs;
}
export function aplicarConfigParcial(partial: Record<string, unknown>): Record<string, DiffRegistro> {
  const diffs: Record<string, DiffRegistro> = {};
  mesclarProfundo(config as unknown as Record<string, unknown>, partial, 'programatico', diffs);
  if (config.ANALISE_SCAN_ONLY && !config.SCAN_ONLY) config.SCAN_ONLY = true;else if (config.SCAN_ONLY && !config.ANALISE_SCAN_ONLY) config.ANALISE_SCAN_ONLY = true;
  // Sincroniza padrões de ignorados a partir da configuração dinâmica
  sincronizarIgnorados();
  config.__OVERRIDES__ = {
    ...(config.__OVERRIDES__ || {}),
    ...diffs
  };
  return diffs;
}

// Inicialização automática (arquivo + env) sem CLI (CLI aplicará depois)
// Em ambiente de testes (VITEST), evitamos auto-init para não sobrescrever flags de teste.
if (!process.env.VITEST) {
  void inicializarConfigDinamica();
}