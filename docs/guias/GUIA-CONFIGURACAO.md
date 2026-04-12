---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Guia de Configuração

Este guia reflete a configuração observável no projeto atual, com base em [`prometheus.config.json`](../../prometheus.config.json), nos comandos da CLI e nas variáveis lidas durante a execução.

## Arquivo Principal

O arquivo de configuração versionado do projeto é:

- [`prometheus.config.json`](../../prometheus.config.json)

Estrutura atual resumida:

```json
{
  "INCLUDE_EXCLUDE_RULES": {},
  "nameConventions": {},
  "ESTRUTURA_ARQUIVOS_RAIZ_MAX": 60,
  "REPO_ARQUETIPO": "cli-modular",
  "STRUCTURE_AUTO_FIX": false,
  "REPORT_EXPORT_ENABLED": true,
  "coverageGate": {},
  "languageSupport": {},
  "suppress": {},
  "rules": {},
  "testPatterns": {},
  "fastMode": {}
}
```

## Blocos de Configuração

### `INCLUDE_EXCLUDE_RULES`

Controla exclusões globais de arquivos.

Exemplo atual:

```json
{
  "INCLUDE_EXCLUDE_RULES": {
    "globalExcludeGlob": [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "scripts/**",
      ".deprecados/**",
      "**/*.log",
      ".git/**"
    ]
  }
}
```

Uso prático:

- reduzir ruído no `diagnosticar`
- evitar análise sobre artefatos gerados
- complementar com `--include` e `--exclude` na CLI

### `nameConventions`

Define nomes esperados de diretórios principais do repositório.

Exemplo:

```json
{
  "nameConventions": {
    "srcDirectory": "src",
    "distDirectory": "dist",
    "docsDirectory": "docs",
    "typesDirectory": "types",
    "testsDirectory": "tests",
    "configDirectory": "config"
  }
}
```

### `coverageGate`

Mantém limiares de cobertura declarados no projeto.

Exemplo atual:

```json
{
  "coverageGate": {
    "lines": 90,
    "functions": 90,
    "branches": 90,
    "statements": 90
  }
}
```

### `languageSupport`

Ativa ou desativa suporte heurístico por linguagem.

Exemplo atual:

```json
{
  "languageSupport": {
    "javascript": { "enabled": true },
    "typescript": { "enabled": true },
    "html": { "enabled": true },
    "css": { "enabled": true },
    "xml": { "enabled": true },
    "php": { "enabled": true },
    "python": { "enabled": true }
  }
}
```

### `suppress`

Suprime regras específicas no projeto.

Exemplo atual:

```json
{
  "suppress": {
    "rules": [
      "weak-crypto",
      "magic-constants",
      "unhandled-async",
      "missing-jsdoc",
      "poor-naming",
      "problemas-teste"
    ],
    "severity": {},
    "paths": []
  }
}
```

### `rules`

Customiza severidade e exceções por regra.

Exemplo atual:

```json
{
  "rules": {
    "tipo-inseguro": {
      "severity": "error",
      "exclude": [
        "test/**/*",
        "tests/**/*",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/__tests__/**"
      ]
    },
    "arquivo-orfao": {
      "severity": "warning",
      "allowTestFiles": true
    },
    "dependencia-circular": {
      "severity": "error",
      "showFullPath": true
    }
  }
}
```

### `testPatterns`

Centraliza padrões de teste usados pelo projeto.

Exemplo:

```json
{
  "testPatterns": {
    "files": [
      "**/*.test.*",
      "**/*.spec.*",
      "test/**/*",
      "tests/**/*",
      "**/__tests__/**"
    ],
    "excludeFromOrphanCheck": true,
    "allowAnyType": true
  }
}
```

### `fastMode`

Define o recorte de analistas para execuções rápidas.

Exemplo atual:

```json
{
  "fastMode": {
    "analystsInclude": [
      "detector-dependencias",
      "detector-estrutura",
      "arquitetura",
      "seguranca",
      "detector-tipos-inseguros",
      "todo-comments",
      "analista-padroes-uso"
    ],
    "analystsExclude": [
      "documentacao",
      "duplicacoes",
      "xml",
      "performance"
    ]
  }
}
```

## Precedência

Na prática, a ordem de aplicação é:

1. flags da CLI
2. variáveis de ambiente reconhecidas na execução
3. `prometheus.config.json`
4. defaults internos do código

Exemplos:

```bash
prometheus diagnosticar --include "src/**" --exclude "**/*.test.ts"
prometheus formatar --engine auto --write
prometheus fix-types --confidence 90
```

## Variáveis de Ambiente Observáveis

As variáveis abaixo aparecem diretamente no código atual e afetam execução ou comportamento:

- `NODE_ENV`
- `PROMETHEUS_DEBUG`
- `PROMETHEUS_ANALISE_TIMEOUT_POR_ANALISTA_MS`
- `WORKER_POOL_MAX_WORKERS`
- `GUARDIAN_IGNORE_PATTERNS`
- `VITEST`

Exemplos:

```bash
PROMETHEUS_DEBUG=true prometheus diagnosticar --full
PROMETHEUS_ANALISE_TIMEOUT_POR_ANALISTA_MS=60000 prometheus diagnosticar
WORKER_POOL_MAX_WORKERS=4 prometheus diagnosticar --fast
```

## Filtros por CLI

Além do arquivo JSON, o fluxo atual depende fortemente de filtros em linha de comando:

```bash
prometheus diagnosticar --include "src/**"
prometheus diagnosticar --exclude "**/*.spec.ts"
prometheus diagnosticar --exclude-tests
prometheus formatar --include "src/**/*.ts"
prometheus fix-types --exclude "src/legacy/**"
```

Regra prática:

- use `prometheus.config.json` para defaults do repositório
- use flags para escopo da execução atual

## Exemplo Enxuto

```json
{
  "INCLUDE_EXCLUDE_RULES": {
    "globalExcludeGlob": [
      "node_modules/**",
      "dist/**",
      "coverage/**"
    ]
  },
  "REPO_ARQUETIPO": "cli-modular",
  "REPORT_EXPORT_ENABLED": true,
  "languageSupport": {
    "javascript": { "enabled": true },
    "typescript": { "enabled": true }
  }
}
```

## Validação Operacional

Depois de ajustar a configuração, valide com:

```bash
prometheus diagnosticar --full
prometheus diagnosticar --json --export
prometheus guardian --diff
```


