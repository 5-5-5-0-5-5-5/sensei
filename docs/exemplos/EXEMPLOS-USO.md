---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Exemplos de Uso - Prometheus 🚀

Exemplos práticos e casos de uso reais do Prometheus.

---

## 📊 Exemplo 1: Análise Básica de Projeto

Analisar um projeto JavaScript/TypeScript simples:

```bash
# Análise rápida (requer prometheus.config.json)
prometheus diagnosticar

# Análise com opções específicas
prometheus diagnosticar --caminho ./src --profundidade 3

# Análise e gerar relatório
prometheus diagnosticar --relatorio json --saida ./relatorio.json
```

### Resultado Esperado

```json
{
  "projeto": {
    "nome": "meu-projeto",
    "arquivos": 45,
    "linhasTotal": 12500
  },
  "analistas": [
    {
      "nome": "CodigoFragil",
      "ocorrencias": 12,
      "arquivos": 5
    }
  ],
  "resumo": {
    "totalProblemas": 47,
    "gravidade": {
      "critic": 3,
      "major": 15,
      "minor": 29
    }
  }
}
```

---

## 🔧 Exemplo 2: Auto-fix de Problemas

Corrigir automaticamente problemas encontrados:

```bash
# Mostrar problemas que podem ser corrigidos
prometheus diagnosticar --pode-corrigir

# Aplicar correções automaticamente
prometheus corrigir --auto

# Corrigir apenas tipo específico
prometheus corrigir --tipo "variavel-nao-usada"

# Revisar antes de aplicar
prometheus corrigir --revisar
```

### Configuração no `prometheus.config.json`

```json
{
  "autoFix": {
    "habilitado": true,
    "tiposMacara": [
      "variavel-nao-usada",
      "console-deixado-para-tras",
      "espacos-em-branco"
    ],
    "backupAntes": true
  }
}
```

---

## 👮 Exemplo 3: Guardian - Monitorar Saúde

Configurar Guardian para monitorar continuamente:

```bash
# Estabelecer baseline de saúde
prometheus guardian --baseline

# Verificar estado atual
prometheus guardian --verificar

# Monitorar mudanças
prometheus guardian --monitorar

# Confirmar mudanças se OK
prometheus guardian --confirmar
```

### Arquivo de Configuração

```json
{
  "guardian": {
    "habilitado": true,
    "baselineFile": ".prometheus-baseline.json",
    "verificarEm": [
      "duplicacao",
      "codigo-morto",
      "complexidade-cognitiva"
    ]
  }
}
```

---

## 📈 Exemplo 4: Relatórios Detalhados

Gerar diferentes tipos de relatório:

```bash
# Relatório JSON (estruturado)
prometheus diagnosticar --relatorio json --saida relatorio.json

# Relatório Markdown (legível)
prometheus diagnosticar --relatorio markdown --saida RELATORIO.md

# Relatório HTML (visual)
prometheus diagnosticar --relatorio html --saida relatorio.html

# Relatório com arquitetura
prometheus relatorio-arquitetura --saida arquitetura.md
```

### Exemplo de Saída Markdown

```markdown
# Relatório de Análise - meu-projeto

**Data**: 2026-02-15
**Tempo de Análise**: 2.3s

## Resumo Executivo

- **Arquivos**: 45
- **Linhas**: 12,500
- **Problemas**: 47 (🔴 3 críticos, 🟠 15 maiores)

## Problemas por Tipo

### Código Frágil (12 ocorrências)
- `src/utils/parser.ts:45` - Função muito longa
- `src/api/handler.ts:12` - Complexidade cognitiva alta

...
```

---

## 🔍 Exemplo 5: Criar Analista Customizado

Criar novo detector para suas necessidades:

```typescript
// src/analistas/customizados/detector-async-sem-await.ts

import { type Analista, type ResultadoOcorrencia } from '@/analistas/tipos.js';
import { type Arquivo } from '@/shared/tipos.js';

export class DetectorAssimaSemsWait implements Analista {
  nome = 'AsyncSemAwait';
  descricao = 'Detecta funções async sem await';

  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
    const ocorrencias: ResultadoOcorrencia[] = [];
    const regex = /async\s+function\s+(\w+)\s*\([^)]*\)\s*{([^}]*)};/g;

    let match;
    while ((match = regex.exec(conteudo))) {
      const funcao = match[1];
      const corpo = match[2];

      // Verificar se há await no corpo
      if (!corpo.includes('await')) {
        const linhas = conteudo.substring(0, match.index).split('\n').length;

        ocorrencias.push({
          linha: linhas,
          coluna: 1,
          tipo: 'async-sem-await',
          mensagem: `Função '${funcao}' é async mas não usa await`,
          gravidade: 'minor',
          pode_corrigir: true,
          sugestao: `Remover 'async' de '${funcao}'`,
        });
      }
    }

    return ocorrencias;
  }
}

export default DetectorAssimaSemsWait;
```

### Registrar Analista

```typescript
// src/analistas/registry/index.ts

import DetectorAssimaSemsWait from '../customizados/detector-async-sem-await.js';

registroAnalistas.registrar('AsyncSemAwait', DetectorAssimaSemsWait);
```

### Usar no Config

```json
{
  "analistas": {
    "CustomAsyncSemAwait": {
      "habilitado": true,
      "gravidade": "minor"
    }
  }
}
```

---

## 🐛 Exemplo 6: Debug e Diagnóstico

Quando algo não funciona:

```bash
# Aumentar verbosidade
prometheus diagnosticar --verbose

# Debug completo
prometheus diagnosticar --debug

# Salvar logs
prometheus diagnosticar --log-file debug.log
```

### Checklist de Troubleshooting

```bash
# 1. Verificar versão
prometheus --version

# 2. Verificar configuração
prometheus config --validar

# 3. Listar analistas disponíveis
prometheus analista --listar

# 4. Testar um arquivo específico
prometheus diagnosticar --arquivo src/test.ts

# 5. Criar issue com dados de debug
prometheus diagnosticar --debug > dados-debug.json
```

---

## 🚀 Exemplo 7: Integração com CI/CD

### GitHub Actions

```yaml
name: Prometheus Analysis
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install Prometheus
        run: npm install -g prometheus

      - name: Run Analysis
        run: prometheus diagnosticar --relatorio json --saida analysis.json

      - name: Check Results
        run: |
          PROBLEMS=$(jq '.resumo.totalProblemas' analysis.json)
          if [ "$PROBLEMS" -gt 20 ]; then
            echo "❌ Muito problemas detectados: $PROBLEMS"
            exit 1
          fi

      - name: Upload Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: prometheus-report
          path: analysis.json
```

### GitLab CI

```yaml
prometheus-analysis:
  image: node:24
  script:
    - npm install -g prometheus
    - prometheus diagnosticar --relatorio json --saida analysis.json
    - |
      PROBLEMS=$(jq '.resumo.totalProblemas' analysis.json)
      if [ "$PROBLEMS" -gt 20 ]; then
        echo "❌ Código com muitos problemas"
        exit 1
      fi
  artifacts:
    reports:
      dotenv: analysis.json
```

---

## 📝 Exemplo 8: Pré-commit Hook

Rodar Prometheus automaticamente em commit:

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "🔍 Executando Prometheus..."
prometheus diagnosticar --arquivo . --tipo critic

if [ $? -ne 0 ]; then
  echo "❌ Commit bloqueado: problemas críticos encontrados"
  exit 1
fi

echo "✅ Análise passou"
exit 0
```

Instalar:

```bash
# Copiar script para hooks
cp scripts/pre-commit.sh .git/hooks/pre-commit

# Tornar executável
chmod +x .git/hooks/pre-commit
```

---

## 🎓 Exemplo 9: Workflow de Aprendizado

Para aprender Prometheus gradualmente:

### Dia 1: Configuração Básica

```bash
# 1. Criar prometheus.config.json
prometheus config --init

# 2. Rodar análise padrão
prometheus diagnosticar

# 3. Revisar resultado
```

### Dia 2: Entender Problemas

```bash
# 1. Ler documentação de cada analista
prometheus analista --info CodigoFragil

# 2. Analisar arquivo específico
prometheus diagnosticar --arquivo src/main.ts --verbose

# 3. Entender recomendações
```

### Dia 3: Auto-fix

```bash
# 1. Criar backup
git commit -m "Backup antes de prometheus auto-fix"

# 2. Revisar mudanças propostas
prometheus corrigir --revisar

# 3. Aplicar
prometheus corrigir --auto
```

### Dia 4: Integração

```bash
# 1. Configurar CI/CD
# (Ver Exemplo 7)

# 2. Testar hook
git commit --allow-empty -m "Test prometheus hook"

# 3. Rodar regularmente
```

---

## 🏢 Exemplo 10: Projeto Grande

Para projetos com múltiplos pacote:

### Estrutura

```
meu-mono-repo/
├── packages/
│   ├── core/
│   ├── api/
│   └── cli/
├── prometheus.config.json
└── prometheus-core.config.json
```

### Configuração Raiz

```json
{
  "nome": "meu-mono-repo",
  "caminhos": [
    "packages/core",
    "packages/api",
    "packages/cli"
  ]
}
```

### Análise

```bash
# Todos os pacotes
prometheus diagnosticar

# Apenas core
prometheus diagnosticar --caminho packages/core

# Comparar antes/depois mudança
prometheus guardian --comparar semana
```

---

## 📚 Próximos Passos

1. **Explore**: Rodar `prometheus --help` para ver todos comandos
2. **Configure**: Ajustar `prometheus.config.json` para seu projeto
3. **Integre**: Adicionar a CI/CD e pre-commit hooks
4. **Monitore**: Usar Guardian para acompanhar saúde
5. **Estenda**: Criar analistas customizados conforme necessário

---

## 💬 Suporte

- 📖 [Documentação Completa](./INDICE.md)
- 🏗️ [Arquitetura](./arquitetura/ARVORE-ARQUITETURAL.md)
- 👨‍💻 [Criar Analista](./desenvolvimento/analistas/CRIAR-ANALISTA.md)
- 🔧 [Referência de Comandos](./referencia/comandos/)

