---
Proveniência e Autoria: Este documento integra o projeto Sensei (licença MIT).
Nada aqui implica cessão de direitos morais/autorais.
Conteúdos de terceiros não licenciados de forma compatível não devem ser incluídos.
Referências a materiais externos devem ser linkadas e reescritas com palavras próprias.
---


# Guia de Início Rápido

Este guia cobre o menor caminho para instalar, executar e validar o Sensei no estado atual do projeto.

## Requisitos

- `Node.js >= 24.12.0`
- `npm`
- um repositório com arquivos fonte para análise

## Instalação

### Desenvolvimento local

```bash
git clone https://github.com/5-5-5-0-5-5-5/sensei.git
cd sensei
npm install
npm run build
```

### Expor o binário localmente

```bash
npm link
sensei --help
```

### Uso sem link global

```bash
node dist/bin/index.js --help
```

## Primeira execução

### Diagnóstico básico

```bash
sensei diagnosticar
```

### Diagnóstico detalhado

```bash
sensei diagnosticar --full
```

### Saída JSON para automação

```bash
sensei diagnosticar --json --export
```

## Filtros de análise

```bash
sensei diagnosticar --include "src/**"
sensei diagnosticar --exclude "**/*.test.ts"
sensei diagnosticar --include "src/**" --exclude "**/*.spec.ts"
sensei diagnosticar --exclude-tests
```

## Integridade com Guardian

### Criar ou aceitar baseline

```bash
sensei guardian --accept-baseline
```

### Verificar diferenças

```bash
sensei guardian --diff
```

### Verificação estruturada para CI

```bash
sensei guardian --diff --json
```

## Correções e manutenção

### Quick fixes no diagnóstico

```bash
sensei diagnosticar --show-fixes
sensei diagnosticar --fix-safe
```

### Correção específica de tipos inseguros

```bash
sensei fix-types --dry-run
sensei fix-types --target src --confidence 90
```

### Reestruturação em modo seguro

```bash
sensei reestruturar --somente-plano --preset sensei
```

## Formatação e SVG

```bash
sensei formatar --check
sensei formatar --write
sensei otimizar-svg --dry
sensei otimizar-svg --write
```

## Arquivos gerados

O projeto usa por padrão:

- `relatorios/` para exportações de diagnóstico e `fix-types`
- `sensei.config.json` para configuração versionada
- baseline do Guardian conforme o fluxo do comando `guardian`

## Próximos passos

- Consulte o [Guia de Comandos](./GUIA-COMANDOS.md) para todos os subcomandos.
- Consulte o [Guia de Configuração](./GUIA-CONFIGURACAO.md) para ajustar regras, filtros e suporte de linguagem.

