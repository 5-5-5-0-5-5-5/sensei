---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Estrutura de Código - Prometheus 🧬

Guia detalhado da organização e estrutura do código do Prometheus.

---

## 📁 Organização Principal

```
prometheus-dev/
├── src/                    # Código-fonte principal
├── tests/                  # Testes unitários e integração
├── docs/                   # Documentação
├── scripts/                # Utilitários e ferramentas
└── [config files]          # Configuração do projeto
```

---

## 🎯 `src/` - Código-Fonte

### Visão Geral

```
src/
├── bin/                    # CLI Entry points
├── cli/                    # Comandos CLI
├── core/                   # Núcleo do sistema
├── analistas/              # Detectores/Analisadores
├── relatorios/             # Gerador de relatórios
├── shared/                 # Código compartilhado
├── guardian/               # Monitor de saúde
├── licensas/               # Gerenciamento de licenças
├── types/                  # Definições TypeScript
├── zeladores/              # Executores de ações
└── node.loader.ts          # Node.js module loader
```

---

## 📝 `src/bin/` - Pontos de Entrada

**Responsabilidade**: Inicializar a aplicação

```typescript
// bin/index.ts - Entrada principal
// Função: Determinar qual CLI executar

// bin/cli.ts - CLI Principal
// Função: Processar argumentos e delegar a handlers
```

**Fluxo**:
```
node prometheus
  ↓
bin/index.ts
  ↓
bin/cli.ts (parse args)
  ↓
cli/handlers/
```

---

## ⚙️ `src/cli/` - Interface de Linha de Comando

**Responsabilidade**: Processar entrada do usuário

```
cli/
├── comandos.ts             # Registrar todos comandos
├── options-*.ts            # Opções específicas de comando
├── processamento-*.ts      # Processamento de entrada
├── commands/               # Implementação de comandos
│   ├── diagnosticar.ts
│   ├── corrigir.ts
│   ├── guardian.ts
│   └── ...
├── handlers/               # Handlers de cada comando
├── helpers/                # Helpers de CLI
├── options/                # Parser de opções
└── processing/             # Processamento pós-parse
```

### Fluxo de Comando

```
Usuario: prometheus diagnosticar --foo bar
         ↓
    cli.ts (yargs)
         ↓
   commands/diagnosticar.ts
         ↓
   handlers/diagnosticar-handler.ts
         ↓
   core/execution/...
         ↓
   Resultado
```

---

## 🧠 `src/core/` - Núcleo do Sistema

**Responsabilidade**: Lógica central, processamento

```
core/
├── config/                 # Gerenciamento de configuração
│   ├── config.ts
│   ├── loader.ts
│   └── validator.ts
├── execution/              # Orquestração de análise
│   ├── executor.ts
│   ├── context.ts
│   └── results.ts
├── messages/               # Sistema de mensagens (i18n)
│   ├── pt/
│   ├── en/
│   ├── zh/
│   ├── ja/
│   ├── loader.ts
│   └── formatter.ts
├── parsing/                # Análise de arquivos
│   ├── ast-parser.ts
│   ├── file-parser.ts
│   └── content-analyzer.ts
├── registry/               # Registro de componentes
│   ├── registry.ts
│   ├── loader.ts
│   └── discovery.ts
├── reporting/              # Geração de relatórios
│   ├── formatter.ts
│   ├── json-reporter.ts
│   ├── markdown-reporter.ts
│   └── html-reporter.ts
├── schema/                 # Validação de schema
│   ├── config-schema.ts
│   └── resultado-schema.ts
├── utils/                  # Utilitários gerais
│   ├── file-utils.ts
│   ├── path-utils.ts
│   └── string-utils.ts
└── workers/                # Web Workers para paralelismo
    ├── worker-pool.ts
    ├── task-queue.ts
    └── analyzer.worker.ts
```

### `config/` - Configuração

```typescript
// config.ts
export interface ConfiguracaoProjeto {
  nome: string;
  caminhos: string[];
  analistas: { [nome: string]: ConfigAnalista };
  relatorios: ConfigRelatorio;
  autoFix: ConfigAutoFix;
}

// Loader - carregar de prometheus.config.json
// Validator - validar schema
```

### `execution/` - Executor

```typescript
// Orquestra análise de múltiplos arquivos
class ExecutorAnalise {
  async executar(config: ConfiguracaoProjeto): Promise<ResultadoAnalise>

  // 1. Carregar arquivos
  // 2. Descobrir analistas
  // 3. Executar análise (paralelo/serial)
  // 4. Agregar resultados
  // 5. Retornar
}
```

### `messages/` - Sistema de Mensagens

```
messages/
├── pt/
│   ├── cli.json           # Mensagens CLI
│   ├── analistas.json     # Descrição analistas
│   ├── erros.json         # Mensagens de erro
│   └── ...
├── en/
│   ├── cli.json
│   └── ...
├── zh/                     # 中文
├── ja/                     # 日本語
├── loader.ts              # Carregar por idioma
└── formatter.ts           # Formatar mensagens
```

**Uso**:
```typescript
const msg = messages.obter('cli.diagnosticar.descricao');
// Retorna: "Diagnosticar o projeto..."
```

### `parsing/` - Análise de Código

```typescript
// AST (Abstract Syntax Tree)
// Converte código em estrutura processável

const ast = parseAST(codigo, linguagem);
// Para JS/TS: Babel/TypeScript parser
// Para HTML: Parse5
// etc.
```

### `registry/` - Descoberta de Componentes

```typescript
class RegistroAnalistas {
  // Registra analistas dinamicamente
  registrar(nome: string, classe: typeof Analista): void
  obter(nome: string): typeof Analista
  listar(): string[]

  // Descobrir plugins: scan de arquivos
  descobrir(caminhoPlugins: string): Promise<void>
}
```

### `reporting/` - Relatórios

```
Tipos suportados:
- JSON: Estruturado, para processamento
- Markdown: Legível, para docs
- HTML: Visual, para navegador
- CSV: Tabular, para planilhas
```

---

## 🔍 `src/analistas/` - Detectores

**Responsabilidade**: Detectar problemas específicos

```
analistas/
├── README.md              # Guia dos analistas
├── tipos.ts               # Interfaces comuns
├── arquitetos/            # Análise arquitetural
│   ├── detector-*.ts
│   └── analisador-*.ts
├── detectores/            # Detecção de problemas
│   ├── fragil.ts
│   ├── morto.ts
│   ├── duplicacao.ts
│   └── ...
├── estrategistas/         # Análise de estratégia
├── pontuadores/           # Scoring
├── js-ts/                 # Detectores JS/TS
│   ├── variables.ts
│   ├── functions.ts
│   └── async.ts
├── registry/              # Registro de analistas
└── plugins/               # Plugins customizados
```

### Interface Padrão

Todos analistas implementam:

```typescript
interface Analista {
  nome: string;
  descricao: string;
  linguagens: string[];

  analisar(
    arquivo: Arquivo,
    conteudo: string,
    config?: ConfigAnalista
  ): ResultadoOcorrencia[];
}
```

### Exemplo: Detector Código Frágil

```typescript
// src/analistas/detectores/fragilidade.ts

export class DetectorCodigoFragil implements Analista {
  nome = 'CodigoFragil';
  descricao = 'Detecta padrões de código frágil';
  linguagens = ['typescript', 'javascript'];

  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
    // 1. Parse AST
    const ast = parseAST(conteudo, 'typescript');

    // 2. Buscar padrões (ex: funções muito longas)
    // 3. Criar ocorrências

    return ocorrencias;
  }
}
```

---

## 📊 `src/relatorios/` - Relatórios

**Responsabilidade**: Formatar e apresentar resultados

```
relatorios/
├── gerador-relatorio.ts        # Orquestrador
├── filtro-inteligente.ts       # Filtrar resultados
├── relatorio-arquetipos.ts     # Padrões encontrados
├── relatorio-estrutura.ts      # Estrutura do projeto
├── relatorio-padroes-uso.ts    # Padrões de uso
├── relatorio-poda.ts           # Oportunidades de limpeza
├── relatorio-reestruturar.ts   # Restruturação sugerida
├── relatorio-zelador-saude.ts  # Status de saúde
├── conselheiro-prometheus.ts   # Recomendações
└── analise-async-patterns.ts   # Análise async/await
```

### Fluxo

```
Resultados Brutos
    ↓
Filtro (aplicar regras)
    ↓
Analisadores (relatorio-*.ts)
    ↓
Formatadores (json/md/html)
    ↓
Saída Final
```

---

## 🔗 `src/shared/` - Código Compartilhado

**Responsabilidade**: Utilitários, tipos e operações reutilizáveis

```
shared/
├── contexto-projeto.ts         # Contexto da análise
├── memory.ts                   # Cache e memória
├── data-processing/            # Processamento de dados
├── helpers/                    # Helpers gerais
├── impar/                      # Operações especializadas
├── persistence/                # Persistência de dados
├── plugins/                    # Sistema de plugins
└── validation/                 # Validação
```

### Exemplo: Contexto

```typescript
// shared/contexto-projeto.ts

export class ContextoProjeto {
  caminhos: Set<string>;
  config: ConfiguracaoProjeto;
  analistas: Analista[];
  mensagens: Mensagens;

  // Métodos auxiliares
  obterArquivos(): Arquivo[]
  temArquivo(caminho: string): boolean
  obterConfig(chave: string): any
}
```

---

## 👮 `src/guardian/` - Monitor de Saúde

**Responsabilidade**: Monitorar mudanças no projeto

```
guardian/
├── baseline.ts             # Baseline de referência
├── constantes.ts           # Constantes do sistema
├── diff.ts                 # Calcular diferenças
├── hash.ts                 # Hash de conteúdo
├── registros.ts            # Registro de mudanças
├── sentinela.ts            # Monitoramento
├── verificador.ts          # Verificação de integridade
└── vigia-oculto.ts         # (Hidden watcher)
```

### Fluxo Guardian

```
1. BASELINE: Capturar snapshot inicial
   prometheus guardian --baseline
   → Salva .prometheus-baseline.json

2. VERIFICAR: Comparar com baseline
   prometheus guardian --verificar
   → Mostra mudanças

3. CONFIRMAR: Aceitar mudanças
   prometheus guardian --confirmar
   → Atualiza baseline
```

---

## 📜 `src/licensas/` - Gerenciamento de Licenças

**Responsabilidade**: Scanner de licenças de dependências

```
licensas/
├── disclaimer.ts           # Aviso de licença
├── fs-utils.ts            # File system utils
├── generate-notices.ts    # Gerar THIRD-PARTY-NOTICES.txt
├── licensas.ts            # Lógica de licença
├── normalizer.ts          # Normalizar nomes
├── scanner.ts             # Escanear dependências
├── spdx.d.ts             # Tipos SPDX
└── types.ts              # Tipos locais
```

### Fluxo

```
package.json
    ↓
Ler dependências (diretas)
    ↓
Escanear node_modules
    ↓
Extrair licenses
    ↓
Gerar relatório (THIRD-PARTY-NOTICES.txt)
```

---

## ⚡ `src/zeladores/` - Executores de Ação

**Responsabilidade**: Executar correções e ações

```
zeladores/
├── zelador-base.ts         # Classe base
├── zelador-*.ts            # Implementações específicas
└── registry.ts             # Registro de zeladores
```

Exemplos:
- `zelador-variaveis.ts` - Remover variáveis não usadas
- `zelador-espacos.ts` - Limpar espaços em branco
- `zelador-console.ts` - Remover console.log

---

## 🔤 `src/types/` - Definições TypeScript

**Responsabilidade**: Interfaces e tipos central

```
types/
├── index.ts                # Export central
├── types.ts                # Tipos base
├── postcss-scss.d.ts      # Type stubs
├── analistas/              # Tipos analistas
├── cli/                    # Tipos CLI
├── core/                   # Tipos core
└── ...
```

**Exemplo**:
```typescript
export interface Arquivo {
  relPath: string;           // Caminho relativo
  ext: string;               // Extensão
  linguagem: string;         // Linguagem detectada
  ocorrencias: Ocorrencia[];
}

export interface ResultadoOcorrencia {
  linha: number;
  coluna: number;
  tipo: string;              // Type de problema
  mensagem: string;
  gravidade: 'critic' | 'major' | 'minor';
  pode_corrigir?: boolean;
  sugestao?: string;
}
```

---

## 🧪 `tests/` - Testes

**Responsabilidade**: Verificar funcionalidade

```
tests/
├── analistas/              # Testes de analistas
├── cli/                    # Testes de CLI
├── core/                   # Testes de núcleo
├── shared/                 # Testes de shared
└── fixtures/               # Dados de teste (arquivos)
```

### Estrutura de Teste

```
analistas/
├── detector-fragil.test.ts
├── fixtures/
│   ├── codigo-fragil.ts    # Arquivo com problema
│   ├── codigo-ok.ts        # Arquivo sem problema
│   └── ...
```

---

## 🔄 Fluxo Geral

```
┌─────────────────────────────────────┐
│  Usuario: prometheus diagnosticar   │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  bin/cli.ts - Parse argumentos      │
│  (yargs processor)                  │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  cli/commands/diagnosticar.ts       │
│  (handler de comando)               │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  core/execution/executor.ts         │
│  (Orquestrador principal)           │
│  1. Load config                     │
│  2. Discover files                  │
│  3. Load analyzers                  │
└────────┬────────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ↓                                 ↓
┌──────────────────────────┐  ┌──────────────────────────┐
│  analistas/              │  │  core/parsing/          │
│  (Detectores)            │  │  (Parse código)         │
│  - Fragil                │  │                         │
│  - Morto                 │  │  1. Read file           │
│  - Duplicacao            │  │  2. Detect language     │
│  - ...                   │  │  3. Parse AST           │
└──────────────────────────┘  │  4. Analyze             │
         │                     └──────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  core/reporting/                    │
│  (Format resultados)                │
│  - JSON report                      │
│  - Markdown report                  │
│  - HTML report                      │
│  - CSV export                       │
└────────┬────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────┐
│  Output para usuario                │
│  (arquivo ou stdout)                │
└─────────────────────────────────────┘
```

---

## 🎓 Arquitetura em Camadas

```
┌────────────────────────────┐  User Interface
│  CLI / Commands            │  (bin/, cli/)
├────────────────────────────┤
│  Execution Orchestration   │  Business Logic
│  (core/execution/)         │  (core/)
├────────────────────────────┤
│  Analysis Layer            │  Domain
│  (analistas/)              │  (analyzers)
├────────────────────────────┤
│  Reporting Layer           │  Output
│  (relatorios/)             │
├────────────────────────────┤
│  Shared Utilities          │  Cross-cutting
│  (shared/)                 │
└────────────────────────────┘
```

---

## 📦 Dependências Internas

```
bin/
├── → cli/        (CLI setup)
└── → core/       (Initialize)

cli/
├── → core/       (Execute analysis)
└── → shared/     (Utilities)

core/
├── → analistas/  (Load analyzers)
├── → relatorios/ (Format output)
├── → shared/     (Utilities)
└── → messages/   (Translations)

analistas/
├── → shared/     (Utilities)
└── → types/      (Interfaces)

relatorios/
├── → shared/     (Data processing)
└── → core/       (Message formatting)
```

---

## 🚀 Adicionando Novo Analista

1. **Criar arquivo** em `src/analistas/detectores/`
2. **Implementar interface** `Analista`
3. **Registrar** em `src/analistas/registry/`
4. **Adicionar testes** em `tests/analistas/`
5. **Documentar** em `docs/`

Ver [Criar Analista](./desenvolvimento/analistas/CRIAR-ANALISTA.md) para detalhe completo.

---

## 📚 Referências

- [Typescript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js API](https://nodejs.org/api/)
- [Vitest](https://vitest.dev/)

