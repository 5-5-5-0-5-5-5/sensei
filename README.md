---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---

<div align="center">

# ❤️‍🔥 Prometheus

---

<img src="svg/badge-analitico.svg"/>
<img src="svg/badge-colaborador.svg"/>
<img src="svg/badge-persistente.svg"/>

---

<img src="svg/badge-open-source.svg"/>
<img src="svg/badge-security.svg"/>
<img src="svg/badge-software-architect.svg"/>

---

[![CI](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/ci.yml)
[![Build](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/build.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/build.yml)
[![CodeQL](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/codeql.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/codeql.yml)
[![perf-gate](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/perf-gate.yml/badge.svg?branch=main)](https://github.com/5-5-5-5-5-5-5/prometheus/actions/workflows/perf-gate.yml)

---

![version](https://img.shields.io/badge/version-0.4.2-brightblue?style=flat-square)
![node](https://img.shields.io/badge/node-%3E%3D24.14.1-brightgreen?style=flat-square)
![license](https://img.shields.io/badge/license-MIT--0-red?style=flat-square)
[![issues](https://img.shields.io/github/issues/5-5-5-5-5-5-5/prometheus?style=flat-square)](https://github.com/5-5-5-5-5-5-5/prometheus/issues)
![TypeScript](https://img.shields.io/badge/typescript-%3E%3D6.0.2-informational?style=flat-square)

</div>

---

<div align="center">

CLI modular para **análise, diagnóstico e manutenção** de projetos JavaScript/TypeScript com suporte extensível para HTML, CSS, XML, Python, PHP e mais.

[🚀 Começar Rápido](#-começar-rápido) • [📚 Documentação](#-documentação-completa) • [💡 Exemplos](#-exemplos) • [🔧 Instalar](#instalação) • [🤝 Contribuir](#-desenvolvimento)

</div>

---

## 📋 Sumário

- [✨ Características](#-características-principais)
- [🚀 Começar Rápido](#-começar-rápido)
- [📥 Instalação](#instalação)
- [🔄 Fluxo Recomendado](#fluxo-recomendado)
- [⚙️ Configuração](#configuração)
- [📚 Documentação Completa](#-documentação-completa)
- [💡 Exemplos](#-exemplos)
- [🏗️ Arquitetura](#-estrutura-do-projeto)
- [👨‍💻 Desenvolvimento](#-desenvolvimento)
- [📄 Arquivos Principais](#arquivos-principais)
- [🤝 Contribuir](#-desenvolvimento)
- [📞 Suporte](#-suporte)

## ✨ Características Principais

Prometheus oferece uma suite completa de ferramentas para análise e manutenção de código:

### 🔍 Análise Inteligente

- **Diagnóstico Completo**: Detecta problemas de qualidade, segurança e arquitetura
- **Análise Customizável**: 15+ analisadores especializados (código frágil, duplicação, complexidade, etc)
- **Sistema de Registro**: Descoberta automática de analistas built-in e plugins customizados
- **Multi-linguagem**: Suporte nativo para JavaScript/TypeScript + HTML, CSS, XML, Python, PHP

### 🛡️ Manutenção Assistida

- **Auto-fix Seguro**: Correções automáticas com validação de segurança
- **Guardian**: Monitoramento contínuo de saúde do projeto com baselines
- **Reestruturação**: Reorganização automática de código seguindo padrões
- **Poda Inteligente**: Identificação e limpeza de arquivos órfãos

### 📊 Relatórios Profissionais

- **Múltiplos Formatos**: JSON, Markdown, HTML, CSV
- **Análise Arquitetural**: Visualização de estrutura e dependências
- **Métricas Detalhadas**: Complexidade, duplicação, cobertura, performance
- **Exportação**: Integração com CI/CD, dashboards, ferramentas externas

### 🔌 Extensível

- **Plugin System**: Crie analistas customizados facilmente
- **API Modular**: Use Prometheus como biblioteca em seu código
- **Registry Pattern**: Descoberta dinâmica de componentes
- **Hooks de Integração**: Integre com suas ferramentas

---

## 🚀 Começar Rápido

### Instalação Básica

```bash
npm install -g prometheus
prometheus --version
```

### Seu Primeiro Comando

```bash
# Analyse seu projeto
cd seu-projeto
prometheus diagnosticar

# Ver resultado em JSON
prometheus diagnosticar --relatorio json

# Mostrar apenas problemas críticos
prometheus diagnosticar --gravidade critic
```

### Próximos Passos

```bash
# Configurar seu projeto
prometheus config --init

# Revisar o que pode ser corrigido automaticamente
prometheus corrigir --revisar

# Monitorar saúde do projeto
prometheus guardian --baseline
prometheus guardian --verificar
```

👉 **Quer aprender mais?** Veja [Guia de Início Rápido](./docs/guias/GUIA-INICIO-RAPIDO.md) para tutorial completo.

---

## Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| [CHANGELOG.md](CHANGELOG.md) | Histórico de versões e mudanças |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Guia de contribuição |
| [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) | Código de conduta |
| [SECURITY.md](SECURITY.md) | Política de segurança |
| [LICENSE](LICENSE) | MIT-0 License |
| [THIRD-PARTY-NOTICES.txt](THIRD-PARTY-NOTICES.txt) | Licenças de dependências |

---

## 📥 Visão Geral

O Prometheus foi projetado para operar como ferramenta de análise estática e manutenção assistida de repositórios. O projeto combina:

- **diagnóstico** de qualidade e estrutura via `prometheus diagnosticar`
- **verificação contínua** de integridade via `prometheus guardian`
- **reorganização estrutural** via `prometheus reestruturar`
- **poda inteligente** de arquivos órfãos via `prometheus podar`
- **correções automáticas** via `prometheus corrigir` e `prometheus fix-types`
- **utilitários avançados** para formatação, licenças, métricas, nomes e performance

**Versão**: v0.5.0 (roadmap até v0.7.0+)
**Runtime**: Node.js >= 24.14.1
**Licença**: MIT-0
**Linguagem**: TypeScript 5.0+

## Instalação

### 📥 npm (Recomendado)

**Uso Global**
```bash
npm install -g prometheus
prometheus --help
```

**Uso Local (Projeto)**
```bash
npm install --save-dev prometheus
npx prometheus --help
```

### 📦 Do Repositório

**Clone e Setup Local**
```bash
git clone https://github.com/5-5-5-5-5-5-5/prometheus.git
cd prometheus
npm install                    # Instalar dependências
npm run build                  # Compilar TypeScript
npm link                       # Link global para desenvolvimento
prometheus --help
```

**Usar como Dependência Local**
```bash
npm install --save-dev /caminho/para/prometheus
npx prometheus --help
```

### ✅ Verificar Instalação

```bash
# Versão
prometheus --version

# Listar comandos
prometheus --help

# Listar analistas disponíveis
prometheus analista --listar
```

### 🐳 Docker (Opcional)

```bash
# Build da imagem
docker build -t prometheus:latest .

# Usar container
docker run --rm -v $(pwd):/project prometheus diagnosticar
```

---

### 🚀 Fluxo Recomendado

#### 1️⃣ Diagnóstico Inicial

Analise seu projeto para descobrir problemas:

```bash
# Análise básica
prometheus diagnosticar

# Modo verbose para mais detalhes
prometheus diagnosticar --verbose

# Exportar para arquivo JSON
prometheus diagnosticar --relatorio json --saida analise.json
```

#### 2️⃣ Revisar Configuração

Customizar análise conforme suas necessidades:

```bash
# Criar config padrão
prometheus config --init

# Validar config existente
prometheus config --validar

# Ver config carregada
prometheus config --show
```

#### 3️⃣ Estabelecer Baseline de Saúde

Criar snapshot inicial para comparações:

```bash
# Estabelecer baseline
prometheus guardian --baseline

# Verificar mudanças após edições
prometheus guardian --verificar

# Confirmar mudanças se aprovadas
prometheus guardian --confirmar
```

#### 4️⃣ Correções Automáticas

Aplicar fixes com segment:

```bash
# Ver o que poderia ser corrigido
prometheus corrigir

# Revisar mudanças antes de aplicar
prometheus corrigir --revisar

# Aplicar automaticamente
prometheus corrigir --auto
```

#### 5️⃣ Monitoramento Contínuo

ativar monitoramento em tempo real:

```bash
# Monitor modo watch
prometheus guardian --monitorar

# Gerar relatórios periódicos
prometheus diagnosticar --relatorio markdown --saida RELATORIO.md
```

---

## ⚙️ Configuração

O arquivo principal de configuração é [`prometheus.config.json`](./prometheus.config.json) na raiz do projeto.

### Blocos de Configuração

| Bloco | Descrição | Exemplo |
|-------|-----------|---------|
| `INCLUDE_EXCLUDE_RULES` | Globs para incluir/excluir | `"globalExcludeGlob": ["node_modules/**"]` |
| `nameConventions` | Convenções de nomenclatura | Validar padrões de nomes |
| `coverageGate` | Limites de cobertura | Mínimo 80% cobertura |
| `languageSupport` | Linguagens a analisar | TypeScript, JavaScript, Python, etc |
| `suppress` | Suprimir avisos | IDs de avisos a ignorar |
| `rules` | Regras customizadas | Rules específicas do projeto |
| `testPatterns` | Padrões de arquivos de teste | `**/*.test.ts`, `**/*.spec.ts` |
| `fastMode` | Otimizações de performance | Skip de checagens caras |

### Configuração Mínima

```json
{
  "prometheus": {
    "nome": "meu-projeto",
    "versao": "1.0.0",

    "INCLUDE_EXCLUDE_RULES": {
      "globalExcludeGlob": [
        "node_modules/**",
        "dist/**",
        "coverage/**",
        ".git/**"
      ]
    },

    "REPO_ARQUETIPO": "cli-modular",

    "REPORT_EXPORT_ENABLED": true,

    "analistas": {
      "CodigoFragil": { "habilitado": true, "gravidade": "major" },
      "CodigoMorto": { "habilitado": true, "gravidade": "minor" }
    }
  }
}
```

### Gerenciar Configuração

```bash
# Ver config carregada
prometheus config --show

# Validar config
prometheus config --validar

# Reset para padrões
prometheus config --reset --force

# Init novo projeto
prometheus config --init
```

Para configuração completa, veja [GUIA-CONFIGURACAO.md](./docs/guias/GUIA-CONFIGURACAO.md).

---

## 📋 Comandos Disponíveis

### Comandos Principais

| Comando | Alias | Descrição |
|---------|-------|-----------|
| `diagnosticar` | `diag` | Análise completa do projeto |
| `corrigir` | - | Auto-fix com validação |
| `guardian` | - | Monitoramento de integridade |
| `config` | - | Gerenciamento de config |
| `analista` | - | Info sobre analistas |
| `relatorio` | - | Gerar relatórios especiais |

### Comandos Utilitários

- `formatar` - Formatação automática
- `otimizar-svg` - Otimizar arquivos SVG
- `podar` - Remover código morto
- `reestruturar` - Reorganizar estrutura
- `fix-types` - Corrigir tipos inseguros (`any`, `unknown`)
- `licencas` - Scan de licenças de dependências
- `names` - Geração de mapeamento de nomes
- `rename` - Aplicar renomeações
- `reverter` - Reverter moves registrados
- `metricas` - Histórico de execuções
- `perf` - Baseline de performance
- `atualizar` - Atualizar Prometheus

### Ajuda Detalhada

```bash
# Ver todos os comandos
prometheus --help

# Ajuda de comando específico
prometheus diagnosticar --help
prometheus corrigir --help
prometheus guardian --help
```

Para referência completa de comandos, veja [Referência de Comandos](./docs/referencia/comandos/README.md).

---

## 💡 Exemplos

### Diagnóstico

```bash
# Análise padrão
prometheus diagnosticar

# Modo verbose
prometheus diagnosticar --verbose

# Apenas problemas críticos
prometheus diagnosticar --gravidade critic

# Exportar como JSON
prometheus diagnosticar --relatorio json --saida analise.json

# Exportar como Markdown
prometheus diagnosticar --relatorio markdown --saida RELATORIO.md
```

### Auto-fix

```bash
# Ver o que pode ser corrigido
prometheus corrigir

# Revisar antes de aplicar
prometheus corrigir --revisar

# Aplicar todas as correções
prometheus corrigir --auto

# Apenas tipo específico
prometheus corrigir --tipo variavel-nao-usada --auto
```

### Guardian - Monitoramento

```bash
# Estabelecer baseline
prometheus guardian --baseline

# Verificar mudanças
prometheus guardian --verificar

# Modo monitor (watch)
prometheus guardian --monitorar

# Confirmar mudanças
prometheus guardian --confirmar
```

### Relatórios Especializados

```bash
# Análise arquitetural
prometheus relatorio arquitetura --saida arquitetura.md

# Padrões de uso
prometheus relatorio padroes --saida padroes.json

# Complexidade
prometheus relatorio complexidade --saida complexidade.html

# Duplicação
prometheus relatorio duplicacao --saida duplicacao.md
```

👉 **Mais exemplos?** Veja [Exemplos de Uso](./docs/exemplos/EXEMPLOS-USO.md).

---

## 📚 Documentação Completa

Prometheus possui documentação extensiva e atualizada:

### 📖 Para Começar

- **[Guia de Início Rápido](./docs/guias/GUIA-INICIO-RAPIDO.md)** - Tutorial de 10 minutos
- **[Guia de Configuração](./docs/guias/GUIA-CONFIGURACAO.md)** - Customizar seu setup
- **[Guia de Comandos](./docs/guias/GUIA-COMANDOS.md)** - Referência completa

### 🏗️ Para Arquitetos

- **[Árvore Arquitetural](./docs/arquitetura/ARVORE-ARQUITETURAL.md)** - Estrutura visual completa
- **[Type Safety](./docs/arquitetura/TYPE-SAFETY.md)** - Garantias de tipo
- **[Segurança](./docs/arquitetura/SEGURANCA.md)** - Práticas de segurança
- **[Sistema de Erros](./docs/arquitetura/SISTEMA-ERROS.md)** - Tratamento de erros

### 👨‍💻 Para Desenvolvedores

- **[Como Criar Analistas](./docs/desenvolvimento/analistas/CRIAR-ANALISTA.md)** - Guia prático (6 passos)
- **[Estrutura de Código](./docs/desenvolvimento/estrutura-codigo/README.md)** - Organização do src/
- **[Padrões de Desenvolvimento](./docs/desenvolvimento/PADROES.md)** - Convenções e boas práticas
- **[Sistema de Plugins](./docs/desenvolvimento/SISTEMA-PLUGINS.md)** - Como estender

### 🔗 Referência

- **[Referência de Comandos](./docs/referencia/comandos/README.md)** - Todos os comandos detalhados
- **[Exemplos de Uso](./docs/exemplos/EXEMPLOS-USO.md)** - Casos reais e CI/CD
- **[Roadmap](./docs/roadmap/ROADMAP.md)** - Futuro do projeto
- **[Índice Completo](./docs/INDICE.md)** - Navegação por tópico

### 💻 Desenvolvimento

- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - Como contribuir
- **[CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md)** - Código de conduta
- **[SECURITY.md](./SECURITY.md)** - Política de segurança

---

## 🏗️ Estrutura do Projeto

```
prometheus-dev/
├── src/                          # Código-fonte
│   ├── bin/                      # CLI entry points
│   ├── cli/                      # Comandos e handlers
│   ├── core/                     # Núcleo (config, execution, messages)
│   ├── analistas/                # Detectores/analisadores
│   ├── relatorios/               # Gerador de relatórios
│   ├── shared/                   # Código compartilhado
│   ├── guardian/                 # Monitor de saúde
│   ├── licensas/                 # Gestão de licenças
│   ├── types/                    # TypeScript definitions
│   └── zeladores/                # Executores de ação
│
├── tests/                        # Testes unitários
├── docs/                         # Documentação complete
│   ├── guias/                    # Guias operacionais
│   ├── arquitetura/              # Arquitetura e design
│   ├── desenvolvimento/          # Guias para devs
│   ├── referencia/               # Referência técnica
│   ├── exemplos/                 # Casos de uso
│   ├── roadmap/                  # Roadmap do projeto
│   ├── INDICE.md                 # Índice navegável
│   └── README.md                 # Documentação overview
│
├── scripts/                      # Utilitários
├── prometheus.config.json        # Configuração
├── package.json                  # Metadados
├── tsconfig.json                 # TypeScript config
└── README.md                     # Este arquivo
```

Para detalhes sobre cada diretório, veja [Estrutura de Código](./docs/desenvolvimento/estrutura-codigo/README.md).

---

## 👨‍💻 Desenvolvimento

### Setup para Desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/5-5-5-5-5-5-5/prometheus.git
cd prometheus

# 2. Instale dependências
npm install

# 3. Build e Link global
npm run build
npm link

# 4. Teste
prometheus --version
```

### Scripts Disponíveis

```bash
npm run build          # Compilar TypeScript
npm run test           # Rodar testes (Vitest)
npm run test:watch    # Testes em watch mode
npm run lint           # ESLint
npm run typecheck      # Type checking
npm run diagnosticar   # Rodar Prometheus no projeto
npm run formatar       # Formatar código
npm run podar          # Poda de código morto
```

### Verificar Qualidade

```bash
# Executar análise completa
npm run diagnosticar

# Type check
npm run typecheck

# Lint
npm run lint

# Testes
npm run test
```

### Padrões de Desenvolvimento

Ao contribuir, siga os padrões em [PADROES.md](./docs/desenvolvimento/PADROES.md):

- ✅ TypeScript type-safe (sem `any`)
- ✅ Nomes descritivos em camelCase/PascalCase
- ✅ JSDoc para funções públicas
- ✅ Testes com cobertura > 80%
- ✅ Sem console.log em produção

---

## 🤝 Desenvolvimento & Contribuição

Prometheus é um projeto open-source e recebe contribuições de toda a comunidade.

### Como Contribuir

1. **Leia** [CONTRIBUTING.md](./CONTRIBUTING.md)
2. **Fork** o repositório
3. **Cria branch** para sua feature (`git checkout -b feature/sua-feature`)
4. **Commit** mudanças (`git commit -m 'Add: sua feature'`)
5. **Push** para os branches (`git push origin feature/sua-feature`)
6. **Abra Pull Request**

### Tipos de Contribuição

- 🐛 **Bug fixes** - Reportar e corrigir bugs
- ✨ **Novas features** - Analistas, comandos, melhorias
- 📚 **Documentação** - Guias, exemplos, explanação
- 🧪 **Testes** - Aumentar cobertura
- 🔄 **Padrões** - Melhorias de qualidade

### Criando um Novo Analista

Contribuições mais comuns são novos analisadores:

```bash
# 1. Crie o arquivo
touch src/analistas/detectores/seu-detector.ts

# 2. Implemente conforme [CRIAR-ANALISTA.md](./docs/desenvolvimento/analistas/CRIAR-ANALISTA.md)

# 3. Adicione testes
touch tests/analistas/seu-detector.test.ts

# 4. Registre no registry
# (automático via descoberta)

# 5. Teste
npm run test
npm run diagnosticar
```

---

## 📞 Suporte

### Documentação

- 📖 [Documentação Completa](./docs/)
- 🚀 [Guia de Início Rápido](./docs/guias/GUIA-INICIO-RAPIDO.md)
- 💡 [Exemplos de Uso](./docs/exemplos/EXEMPLOS-USO.md)
- 🏗️ [Arquitetura](./docs/arquitetura/ARVORE-ARQUITETURAL.md)

### Comunidade

- 🐛 [Reportar Bug](https://github.com/5-5-5-5-5-5-5/prometheus/issues)
- 💡 [Solicitar Feature](https://github.com/5-5-5-5-5-5-5/prometheus/issues/new?labels=enhancement)
- 💬 [Discussões](https://github.com/5-5-5-5-5-5-5/prometheus/discussions)
- 🤝 [Contribuir](./CONTRIBUTING.md)

### Links Importantes

| Link | Descrição |
|------|-----------|
| [📦 npm Package](https://www.npmjs.com/package/prometheus) | Instalar via npm |
| [🐙 GitHub Repository](https://github.com/5-5-5-5-5-5-5/prometheus) | Código-fonte |
| [🐛 Issues](https://github.com/5-5-5-5-5-5-5/prometheus/issues) | Reportar bugs |
| [📋 Releases](https://github.com/5-5-5-5-5-5-5/prometheus/releases) | Versões |
| [📝 License](./LICENSE) | MIT-0 |

---

## 📊 Roadmap & Versioning

### Versioning

Prometheus segue [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes (v1.0.0, v2.0.0)
- **MINOR**: Novas features compatíveis (v0.5.0, v0.6.0)
- **PATCH**: Bug fixes (v0.5.1, v0.5.2)

### Roadmap Futuro

- **v0.5.0** (Q2 2026) - Sistema extensível de analistas
- **v0.6.0** (Q3 2026) - Dashboard Web
- **v0.7.0** (Q4 2026) - Análise com IA
- **v1.0.0** (2027) - Estabilidade e API pública

👉 Veja [ROADMAP.md](./docs/roadmap/ROADMAP.md) para detalhes completos.

---

## ✅ Verificação de Qualidade

O Prometheus é mantido em altos padrões de qualidade:

- ✅ TypeScript 5.0+ (type-safe)
- ✅ Testes com Vitest (80%+ cobertura)
- ✅ ESLint + prettier
- ✅ Sem dependências externas pesadas
- ✅ Performance benchmarked
- ✅ Segurança auditada

---

## 📄 Licença & Atribuição

Prometheus é licenciado sob **MIT-0** (veja [LICENSE](./LICENSE)).

- Sem restrições de uso, modificação ou distribuição
- Sem atribuição necessária (mas apreciada!)
- Sem garantias (use por sua conta e risco)

Dependências de terceiros listadas em [THIRD-PARTY-NOTICES.txt](./THIRD-PARTY-NOTICES.txt).

---

<div align="center">

**Feito com ❤️‍🩹 para os iniciantes**

[⬆ Topo](#prometheus)
