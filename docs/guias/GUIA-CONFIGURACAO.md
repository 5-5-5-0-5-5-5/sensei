---
Proveniência e Autoria: Este documento integra o projeto Sensei (licença MIT).
Nada aqui implica cessão de direitos morais/autorais.
Conteúdos de terceiros não licenciados de forma compatível não devem ser incluídos.
Referências a materiais externos devem ser linkadas e reescritas com palavras próprias.
---


# Guia de Configuração

Este guia reflete a configuração observável no projeto atual, com base em [`sensei.config.json`](../../sensei.config.json), nos comandos da CLI e nas variáveis lidas durante a execução.

## Arquivo Principal

O arquivo de configuração versionado do projeto é:

- [`sensei.config.json`](../../sensei.config.json)

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
      "performance",
      "qualidade-testes"
    ]
  }
}
```

## Precedência

Na prática, a ordem de aplicação é:

1. flags da CLI
2. variáveis de ambiente reconhecidas na execução
3. `sensei.config.json`
4. defaults internos do código

Exemplos:

```bash
sensei diagnosticar --include "src/**" --exclude "**/*.test.ts"
sensei formatar --engine auto --write
sensei fix-types --confidence 90
```

## Variáveis de Ambiente Observáveis

As variáveis abaixo aparecem diretamente no código atual e afetam execução ou comportamento:

- `NODE_ENV`
- `SENSEI_DEBUG`
- `SENSEI_ANALISE_TIMEOUT_POR_ANALISTA_MS`
- `WORKER_POOL_MAX_WORKERS`
- `GUARDIAN_IGNORE_PATTERNS`
- `VITEST`

Exemplos:

```bash
SENSEI_DEBUG=true sensei diagnosticar --full
SENSEI_ANALISE_TIMEOUT_POR_ANALISTA_MS=60000 sensei diagnosticar
WORKER_POOL_MAX_WORKERS=4 sensei diagnosticar --fast
```

## Filtros por CLI

Além do arquivo JSON, o fluxo atual depende fortemente de filtros em linha de comando:

```bash
sensei diagnosticar --include "src/**"
sensei diagnosticar --exclude "**/*.spec.ts"
sensei diagnosticar --exclude-tests
sensei formatar --include "src/**/*.ts"
sensei fix-types --exclude "src/legacy/**"
```

Regra prática:

- use `sensei.config.json` para defaults do repositório
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
sensei diagnosticar --full
sensei diagnosticar --json --export
sensei guardian --diff
```

