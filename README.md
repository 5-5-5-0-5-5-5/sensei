---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Prometheus

[![CI](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/ci.yml) [![Build](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/build.yml) [![CodeQL](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/codeql.yml) [![perf-gate](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/perf-gate.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/perf-gate.yml) ![version](https://img.shields.io/badge/version-0.4.2-blue) ![node](https://img.shields.io/badge/node-%3E%3D24.14.1-brightgreen) ![license](https://img.shields.io/badge/license-MIT--0-blue) [![issues](https://img.shields.io/github/issues/5-5-5-5-5-5-5/prometheus)](https://github.com/5-5-5-5-5-5-5/prometheus/issues)

CLI modular para análise, diagnóstico e manutenção de projetos JavaScript/TypeScript com suporte heurístico adicional para HTML, CSS, XML, Python e PHP.

## Sumário

- [Visão Geral](#visão-geral)
- [Instalação](#instalação)
- [Fluxo Recomendado](#fluxo-recomendado)
- [Configuração](#configuração)
- [Documentação Completa](#documentação)
- [Contribuir](#desenvolvimento)
- [Issues / Checklist](#issues--checklist)

## Arquivos Principais

- [CHANGELOG.md](CHANGELOG.md)
- [CONTRIBUTING.md](CONTRIBUTING.md)
- [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)
- [SECURITY.md](SECURITY.md)
- [LICENSE](LICENSE)
- [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt)

## Visão Geral

O Prometheus foi projetado para operar como ferramenta de análise estática e manutenção assistida de repositórios. O projeto combina:

- diagnóstico de qualidade e estrutura via `diagnosticar`
- verificação de integridade via `guardian`
- reorganização estrutural via `reestruturar`
- poda de arquivos órfãos via `podar`
- correções de tipos inseguros via `fix-types`
- utilitários de formatação, licenças, métricas, nomes e performance

Versão atual: `0.4.0`
Requisito de runtime: `Node.js >= 24.12.0`
Licença: `MIT`

## Instalação

### Uso local no repositório

```bash
git clone https://github.com/5-5-5-5-5-5-5/prometheus.git
cd prometheus
npm install
npm run build
node dist/bin/index.js --help
```

### Link global para desenvolvimento

```bash
npm install
npm run build
npm link
prometheus --help
```

### Como dependência de desenvolvimento

```bash
npm install --save-dev /caminho/para/prometheus
npx prometheus --help
```

## Fluxo Recomendado

### 1. Diagnóstico inicial

```bash
prometheus diagnosticar --full
```

### 2. Exportação para auditoria ou CI

```bash
prometheus diagnosticar --json --export
```

### 3. Verificação de integridade do workspace

```bash
prometheus guardian --diff
```

### 4. Correção assistida de tipos inseguros

```bash
prometheus fix-types --dry-run --verbose
```

### 5. Reorganização estrutural em modo plano

```bash
prometheus reestruturar --somente-plano --preset prometheus
```

## Comandos Disponíveis

Os comandos abaixo foram confirmados pela CLI atual:

- `diagnosticar|diag`: análise completa do repositório
- `guardian`: baseline e diff de integridade
- `formatar`: formatação interna do projeto
- `otimizar-svg`: otimização de SVGs
- `podar`: remoção de arquivos órfãos e lixo
- `reestruturar`: aplicação de plano estrutural
- `atualizar`: atualização segura do Prometheus
- `analistas`: catálogo de analistas registrados
- `metricas`: histórico e agregados de execuções
- `fix-types`: correção de `any` e `unknown`
- `licencas`: scan, notices e disclaimers
- `names`: geração de mapeamento de nomes
- `rename`: aplicação de renomeações
- `reverter`: reversão de moves registrados
- `perf`: baseline e comparação de performance sintética

Para ajuda detalhada:

```bash
prometheus <comando> --help
```

## Diagnóstico

O comando principal da ferramenta é `diagnosticar`.

Exemplos reais suportados pela CLI:

```bash
prometheus diagnosticar --compact
prometheus diagnosticar --full
prometheus diagnosticar --executive
prometheus diagnosticar --json --export
prometheus diagnosticar --include "src/**" --exclude "**/*.test.ts"
prometheus diagnosticar --exclude-tests
prometheus diagnosticar --fast --trust-compiler
prometheus diagnosticar --guardian-check
prometheus diagnosticar --fix-safe
```

Flags relevantes:

- `--json` e `--json-ascii` para integração
- `--full` e `--compact` para nível de detalhamento
- `--executive` para saída resumida por criticidade
- `--auto-fix`, `--fix`, `--fix-safe` e `--show-fixes` para quick fixes
- `--include`, `--exclude` e `--exclude-tests` para escopo
- `--export`, `--export-full` e `--export-to` para relatórios

## Configuração

O arquivo principal de configuração é [`prometheus.config.json`](./prometheus.config.json).

Hoje ele expõe, entre outros, os seguintes blocos:

- `INCLUDE_EXCLUDE_RULES`
- `nameConventions`
- `coverageGate`
- `languageSupport`
- `suppress`
- `rules`
- `testPatterns`
- `fastMode`

Exemplo mínimo:

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
  "REPORT_EXPORT_ENABLED": true
}
```

## Estrutura do Projeto

- [`src/bin/cli.ts`](./src/bin/cli.ts): bootstrap da CLI
- [`src/cli/commands`](./src/cli/commands): definição dos subcomandos
- [`src/analistas`](./src/analistas): analistas, detectores e correções
- [`src/core`](./src/core): configuração, parsing, execução, mensagens e registry
- [`src/guardian`](./src/guardian): baseline, diff e integridade
- [`src/relatorios`](./src/relatorios): geração de relatórios
- [`docs/guias`](./docs/guias): guias operacionais

## Documentação

- [Guia de Início Rápido](./docs/guias/GUIA-INICIO-RAPIDO.md)
- [Guia de Comandos](./docs/guias/GUIA-COMANDOS.md)
- [Guia de Configuração](./docs/guias/GUIA-CONFIGURACAO.md)
- [Arquitetura de Segurança](./docs/arquitetura/SEGURANCA.md)
- [Arquitetura de Type Safety](./docs/arquitetura/TYPE-SAFETY.md)

## Desenvolvimento

Scripts relevantes do projeto:

```bash
npm run build
npm run test
npm run lint
npm run typecheck
npm run diagnosticar
npm run formatar
npm run podar
npm run reestruturar
npm run fix-types
```

## Repositório

- Código-fonte: `https://github.com/5-5-5-5-5-5-5/prometheus`
- Issues: `https://github.com/5-5-5-5-5-5-5/prometheus/issues`


