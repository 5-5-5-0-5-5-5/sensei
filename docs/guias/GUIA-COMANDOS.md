---
Proveniência e Autoria: Este documento integra o projeto Sensei (licença MIT).
Nada aqui implica cessão de direitos morais/autorais.
Conteúdos de terceiros não licenciados de forma compatível não devem ser incluídos.
Referências a materiais externos devem ser linkadas e reescritas com palavras próprias.
---


# Guia de Comandos

Este guia documenta os comandos efetivamente expostos pela CLI atual do Sensei.

## Visão Geral

```bash
sensei --help
```

Comandos disponíveis:

- `diagnosticar|diag`
- `guardian`
- `formatar`
- `otimizar-svg`
- `podar`
- `reestruturar`
- `atualizar`
- `analistas`
- `metricas`
- `fix-types`
- `licencas`
- `names`
- `rename`
- `reverter`
- `perf`

## diagnosticar

Análise completa do repositório.

```bash
sensei diagnosticar [opções]
```

Flags principais:

- `--listar-analistas`
- `--guardian-check`
- `--json`
- `--json-ascii`
- `--fast`
- `--trust-compiler`
- `--verify-cycles`
- `--criar-arquetipo`
- `--salvar-arquetipo`
- `--include <padrao>`
- `--exclude <padrao>`
- `--exclude-tests`
- `--full`
- `--compact`
- `--log-level <nivel>`
- `--executive`
- `--auto-fix`
- `--auto-fix-mode <modo>`
- `--auto-fix-conservative`
- `--fix`
- `--fix-safe`
- `--show-fixes`
- `--export`
- `--export-full`
- `--export-to <dir>`

Exemplos:

```bash
sensei diagnosticar --compact
sensei diagnosticar --full --guardian-check
sensei diagnosticar --json --export --export-to relatorios
sensei diagnosticar --include "src/**" --exclude "**/*.test.ts"
sensei diagnosticar --fix-safe
```

## guardian

Baseline e verificação de integridade.

```bash
sensei guardian [opções]
```

Flags:

- `--accept-baseline`
- `--diff`
- `--full-scan`
- `--json`

Exemplos:

```bash
sensei guardian --accept-baseline
sensei guardian --diff
sensei guardian --diff --json
```

## formatar

Formatação interna do projeto.

```bash
sensei formatar [opções]
```

Flags:

- `--check`
- `--write`
- `--engine <engine>`
- `--include <padrao>`
- `--exclude <padrao>`

Exemplos:

```bash
sensei formatar --check
sensei formatar --write --engine auto
```

## otimizar-svg

Otimização de SVGs usando o motor interno.

```bash
sensei otimizar-svg [opções]
```

Flags:

- `--dir <caminho>`
- `--write`
- `--dry`
- `--include <padrao>`
- `--exclude <padrao>`

Exemplos:

```bash
sensei otimizar-svg --dry
sensei otimizar-svg --dir assets/icons --write
```

## podar

Remoção de arquivos órfãos e lixo do repositório.

```bash
sensei podar [opções]
```

Flags:

- `--force`
- `--include <padrao>`
- `--exclude <padrao>`

Exemplos:

```bash
sensei podar
sensei podar --force
```

## reestruturar

Aplica plano de reorganização estrutural.

```bash
sensei reestruturar [opções]
```

Flags:

- `--auto`
- `--aplicar`
- `--somente-plano`
- `--domains`
- `--flat`
- `--prefer-estrategista`
- `--preset <nome>`
- `--categoria <pair>`
- `--include <padrao>`
- `--exclude <padrao>`

Exemplos:

```bash
sensei reestruturar --somente-plano --preset sensei
sensei reestruturar --auto --flat
sensei reestruturar --preset node-community --categoria controller=handlers
```

## atualizar

Atualização segura do Sensei.

```bash
sensei atualizar [opções]
```

Flags:

- `--global`

## analistas

Lista analistas registrados e seus metadados.

```bash
sensei analistas [opções]
```

Flags:

- `--json`
- `--output <arquivo>`
- `--doc <arquivo>`

## metricas

Consulta histórico de métricas de execução.

```bash
sensei metricas [opções]
```

Flags:

- `--json`
- `--limite <n>`
- `--export <arquivo>`
- `--analistas`

Exemplos:

```bash
sensei metricas
sensei metricas --analistas
sensei metricas --json --limite 20
```

## fix-types

Detecta e corrige `any` e `unknown`.

```bash
sensei fix-types [opções]
```

Flags:

- `--dry-run`
- `--target <path>`
- `--confidence <number>`
- `--verbose`
- `--interactive`
- `--export`
- `--include <padrao>`
- `--exclude <padrao>`

Exemplos:

```bash
sensei fix-types --dry-run
sensei fix-types --target src --confidence 90 --verbose
```

## licencas

Ferramentas relacionadas a licenças e avisos de terceiros.

```bash
sensei licencas [subcomando]
```

Subcomandos confirmados:

- `scan`
- `notices`
- `disclaimer`

## names

Gera arquivos de mapeamento de nomes no diretório `names/`.

```bash
sensei names [opções]
```

Flags:

- `--legacy`

## rename

Aplica renomeações baseadas nos mapeamentos gerados por `names`.

```bash
sensei rename
```

## reverter

Gerencia o mapa de reversão de moves estruturais.

```bash
sensei reverter [subcomando]
```

Subcomandos:

- `listar`
- `arquivo <arquivo>`
- `move <id>`
- `limpar`
- `status`

## perf

Baseline e comparação de performance sintética.

```bash
sensei perf [opções] [subcomando]
```

Flags:

- `--dir <dir>`
- `--json`
- `--limite <n>`

Subcomandos:

- `baseline`
- `compare`

Exemplos:

```bash
sensei perf baseline
sensei perf compare
sensei perf --json compare
```

