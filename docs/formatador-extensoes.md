# 🧽 Formatador Prometheus - Extensões Suportadas

O formatador interno do Prometheus suporta agora **47+ extensões** diferentes com formatação especializada para cada tipo de arquivo.

## 📋 Resumo das Extensões Suportadas

### 🟨 JavaScript/TypeScript (7 extensões)

- `.ts`, `.tsx`, `.cts`, `.mts` - TypeScript
- `.js`, `.jsx`, `.mjs`, `.cjs` - JavaScript
- **Recursos**: Normalização de espaços, proteção de template literals, separadores de seção

### 📝 Markdown (2 extensões)

- `.md`, `.markdown`
- **Recursos**:
  - ✅ Normalização de cercas de código (`` ` `` e `~`)
  - ✅ Correção de ênfase markdown (`**exemplo***` → `**exemplo**`)
  - ✅ Espaçamento após títulos
  - ✅ **NOVO**: Normalização de listas (`*`, `+` → `-`)
  - ✅ **NOVO**: Formatação de tabelas com alinhamento de colunas
  - ✅ Limitação de linhas em branco (máx 2)

### 📄 JSON e Derivados (3 extensões)

- `.json` - JSON padrão
- `.jsonc` - JSON com comentários
- `.json5` - JSON5 com comentários e trailing commas
- **Recursos**: Parse e formatação com 2 espaços de indentação

### 🎯 YAML (2 extensões)

- `.yml`, `.yaml`
- **Recursos**: Normalização de espaços e linhas em branco

### 🌐 Web (5 extensões)

- `.html`, `.htm` - HTML com indentação e formatação de atributos
- `.css` - CSS com alinhamento de propriedades
- `.scss` - SCSS com suporte a nested blocks
- `.less` - LESS (mesmo tratamento que SCSS)

### 🔧 Configuração (8 extensões)

- `.toml` - TOML com alinhamento de chaves/valores
- `.ini` - INI com formatação de seções
- `.editorconfig` - EditorConfig com formatação de seções
- `.gitignore` - Gitignore com normalização de linhas em branco
- `.npmrc` - NPM config
- `.nvmrc` - Node version (single line)
- `.properties` - Java properties com alinhamento
- `.gradle` - Gradle/Kotlin DSL

### 💻 Linguagens de Programação (6 extensões)

- `.py` - Python (normalização básica)
- `.java` - Java com proteção de strings multiline
- `.kt`, `.kts` - **NOVO**: Kotlin com indentação inteligente (4 espaços)
- `.go` - Go com indentação e controle de blocos
- `.php` - PHP (formatação básica)

### 🗃️ Dados e Marcação (3 extensões)

- `.xml` - XML com pretty-print seguro
- `.svg` - SVG com otimização tipo SVGO
- `.sql` - **NOVO**: SQL com formatação de keywords e indentação

### 🐚 Shell e Scripts (3 extensões)

- `.sh`, `.bash` - Shell scripts
- `.dockerfile` - Dockerfile com normalização de keywords

### 📝 Texto e Logs (4 extensões)

- `.txt` - Texto puro
- `.log` - Arquivos de log
- `.env` - Variáveis de ambiente
- `.lock` - Lock files (tratados como JSON)

### 🎨 Outras (1 extensão)

- `.kt`, `.kts` - Kotlin (formatação avançada com indentação de 4 espaços)

## 🚀 Como Usar

### Verificar arquivos que precisam de formatação:

```bash
prometheus formatar --check
```

### Aplicar formatação:

```bash
prometheus formatar --write
```

### Formatar arquivo específico:

```bash
prometheus formatar --write --include "README.md"
```

### Usar engine específica:

```bash
# Engine auto (tenta Prettier, fallback para interno)
prometheus formatar --write --engine auto

# Apenas formatador interno
prometheus formatar --write --engine interno

# Apenas Prettier (se disponível)
prometheus formatar --write --engine prettier
```

## ✨ Novidades nesta Versão

### 1. Markdown Aprimorado

- **Listas**: Normalização automática de marcadores (`*`, `+` → `-`)
- **Tabelas**: Formatação com alinhamento de colunas e separadores
- **Exemplo**:
  ```markdown
  # Antes
  * Item 1
  + Item 2
  - Item 3

  | Nome | Idade |
  | --- | --- |
  | João | 25 |

  # Depois
  - Item 1
  - Item 2
  - Item 3

  | Nome  | Idade |
  | ----- | ----- |
  | João  | 25    |
  ```

### 2. Kotlin Sofisticado

- Indentação com 4 espaços (padrão Kotlin)
- Suporte a strings multiline (`"""`)
- Controle de blocos com chaves/parênteses

### 3. SQL Formatado

- Keywords em MAIÚSCULAS
- Indentação de cláusulas (SELECT, FROM, WHERE, etc.)
- Suporte a comentários

### 4. Novos Arquivos de Configuração

- `.gitignore`: Normalização de linhas em branco
- `.editorconfig`: Formatação de seções e alinhamento
- `.npmrc`, `.nvmrc`: Configurações Node.js
- `.json5`: JSON com comentários

## 🔧 Arquivos Especiais

O formatador detecta automaticamente arquivos especiais por nome:
- `.gitignore` (qualquer localização)
- `.editorconfig`
- `.npmrc`
- `.nvmrc`
- `Dockerfile`

## 🎯 Prioridade de Formatação

1. **Prettier do Projeto** (se disponível e `--engine auto`)
2. **Formatadores Registrados** (handlers dedicados por extensão)
3. **Formatador Mínimo** (normalização básica como fallback)

## 📊 Estatísticas

- **Total de extensões suportadas**: 47+
- **Parsers dedicados**: 30+
- **Formatação inteligente**: Markdown, SQL, Kotlin, CSS, HTML, XML/SVG
- **Build status**: ✅ Passando (TypeScript compilado com sucesso)

## 🐛 Problemas Conhecidos

Nenhum no momento. O formatador está totalmente funcional e testado!

---

**Versão**: 0.4.3+
**Última atualização**: Abril 2026
