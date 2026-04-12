---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Como Criar Analistas no Prometheus 🔬

Guia completo para desenvolvedores que desejam criar novos analistas para o Prometheus.

---

## 📚 Índice

1. [Conceito Básico](#conceito-básico)
2. [Estrutura de um Analista](#estrutura-de-um-analista)
3. [Step-by-Step: Criar seu Primeiro Analista](#step-by-step-criar-seu-primeiro-analista)
4. [Exemplo Prático: Detector de TODO Comments](#exemplo-prático-detector-de-todo-comments)
5. [Testes](#testes)
6. [Boas Práticas](#boas-práticas)
7. [Publicar seu Analista](#publicar-seu-analista)

---

## 📖 Conceito Básico

Um **Analista** é uma classe/função que:
- Recebe o **AST** (Abstract Syntax Tree) de um arquivo
- Analisa padrões ou problemas específicos
- Retorna **descobertas** com:
  - Tipo de problema
  - Localização (linha, coluna)
  - Severidade
  - Mensagem
  - Ações sugeridas

### Tipos de Analistas

| Tipo             | Propósito             | Exemplo                                |
| ---------------- | --------------------- | -------------------------------------- |
| **Detector**     | Identificar problemas | Código frágil, dependências circulares |
| **Arquiteto**    | Identificar padrões   | MVC, Clean Architecture                |
| **Estrategista** | Propor soluções       | Como refatorar, como organizar         |
| **Pontuador**    | Atribuir scores       | Qualidade da estrutura                 |

---

## 🏗️ Estrutura de um Analista

### Localização

```
src/analistas/
  ├── detectores/
  │   └── seu-novo-detector.ts
  ├── js-ts/
  │   └── seu-novo-analisador-js-ts.ts
  └── registry/
      └── index.ts (registre seu analista aqui)
```

### Arquivo Base

```typescript
// src/analistas/detectores/seu-novo-detector.ts

import type { ResultadoAnalise, Ocorrencia } from '@/types/analistas/detectores.js';
import type { Arquivo } from '@/types/core/config/config.js';

export class SeuNovoDetector {
  /**
   * Analisa um arquivo em busca de problemas específicos
   */
  analisar(arquivo: Arquivo, conteudo: string): ResultadoAnalise {
    const ocorrencias: Ocorrencia[] = [];

    // Sua lógica aqui

    return {
      tipo: 'seu-novo-detector',
      gravidade: 'warning', // 'critical', 'error', 'warning', 'info'
      ocorrencias,
      resumo: `Encontrado(s) ${ocorrencias.length} problema(s)`,
    };
  }
}
```

---

## 🚀 Step-by-Step: Criar seu Primeiro Analista

### Passo 1: Definir o Objetivo

Decida: O que seu analista vai detectar/analisar?

**Exemplo**: Detectar funções com mais de 50 linhas

### Passo 2: Criar o Arquivo

```bash
touch src/analistas/detectores/detector-funcoes-longas.ts
```

### Passo 3: Implementar a Lógica

```typescript
// src/analistas/detectores/detector-funcoes-longas.ts

import type { ResultadoAnalise, Ocorrencia } from '@/types/analistas/detectores.js';
import type { Arquivo } from '@/types/core/config/config.js';

export class DetectorFuncoesLongas {
  private readonly LIMITE_LINHAS = 50;

  analisar(arquivo: Arquivo, conteudo: string): ResultadoAnalise {
    const ocorrencias: Ocorrencia[] = [];

    // Se não é arquivo TS/JS, pular
    if (!['ts', 'tsx', 'js', 'jsx'].includes(arquivo.ext)) {
      return { tipo: 'funcoes-longas', gravidade: 'info', ocorrencias, resumo: 'N/A' };
    }

    const linhas = conteudo.split('\n');
    let emFuncao = false;
    let inicioFuncao = 0;
    let nomeFuncao = '';

    for (let i = 0; i < linhas.length; i++) {
      const linha = linhas[i];

      // Detectar início de função
      if (/^\s*(async\s+)?function\s+(\w+)|const\s+(\w+)\s*=\s*(async\s*)?\(/.test(linha)) {
        emFuncao = true;
        inicioFuncao = i;
        nomeFuncao = linha.match(/(\w+)/)?.[1] || 'anônima';
      }

      // Detectar fim de função
      if (emFuncao && linha.trim() === '}') {
        const linhasFunc = i - inicioFuncao;

        if (linhasFunc > this.LIMITE_LINHAS) {
          ocorrencias.push({
            arquivo: arquivo.relPath,
            linha: inicioFuncao + 1,
            coluna: 0,
            mensagem: `Função '${nomeFuncao}' tem ${linhasFunc} linhas (limite: ${this.LIMITE_LINHAS})`,
            tipo: 'funcao-longa',
            gravidade: 'warning',
            contexto: linha,
          });
        }

        emFuncao = false;
      }
    }

    return {
      tipo: 'funcoes-longas',
      gravidade: ocorrencias.length > 0 ? 'warning' : 'info',
      ocorrencias,
      resumo: `${ocorrencias.length} função(s) com mais de ${this.LIMITE_LINHAS} linhas`,
    };
  }
}
```

### Passo 4: Criar Mensagens (i18n)

```typescript
// src/core/messages/pt/analistas/detector-funcoes-longas-messages.ts

export const DetectorFuncoesLongasMensagens = {
  funcaoMuitoLonga: (nome: string, linhas: number, limite: number) =>
    `Função '${nome}' tem ${linhas} linhas (limite recomendado: ${limite})`,
  dica: 'Considere refatorar a função em funções menores com responsabilidades bem definidas',
} as const;
```

### Passo 5: Registrar o Analista

```typescript
// src/analistas/detectores/index.ts

export { DetectorFuncoesLongas } from './detector-funcoes-longas.js';
```

```typescript
// src/analistas/registry/index.ts

import { DetectorFuncoesLongas } from '../detectores/index.js';

export function registrarAnalisas() {
  // ... código existente ...

  registrar({
    tipo: 'detector',
    nome: 'detector-funcoes-longas',
    classe: DetectorFuncoesLongas,
    descricao: 'Detecta funções com mais de 50 linhas',
    linguagens: ['typescript', 'javascript'],
  });
}
```

### Passo 6: Testar

```typescript
// tests/analistas/detector-funcoes-longas.test.ts

import { describe, it, expect } from 'vitest';
import { DetectorFuncoesLongas } from '@/analistas/detectores/detector-funcoes-longas.js';

describe('DetectorFuncoesLongas', () => {
  const detector = new DetectorFuncoesLongas();

  it('deve detectar funções longas', () => {
    const codigo = `
      function funcaoLonga() {
        // 60 linhas de código aqui...
        ${'// line\n'.repeat(55)}
      }
    `;

    const resultado = detector.analisar(
      { relPath: 'teste.ts', ext: 'ts' },
      codigo
    );

    expect(resultado.ocorrencias.length).toBeGreaterThan(0);
  });

  it('não deve detectar funções em arquivo não-JS', () => {
    const resultado = detector.analisar(
      { relPath: 'teste.md', ext: 'md' },
      'qualquer coisa'
    );

    expect(resultado.ocorrencias).toHaveLength(0);
  });
});
```

---

## 🎯 Exemplo Prático: Detector de TODO Comments

Aqui está um exemplo completo de um detector simples e útil:

```typescript
// src/analistas/detectores/detector-todo-comments.ts

import type { ResultadoAnalise, Ocorrencia } from '@/types/analistas/detectores.js';
import type { Arquivo } from '@/types/core/config/config.js';

export class DetectorTodoComments {
  analisar(arquivo: Arquivo, conteudo: string): ResultadoAnalise {
    const ocorrencias: Ocorrencia[] = [];

    if (!['ts', 'tsx', 'js', 'jsx'].includes(arquivo.ext)) {
      return { tipo: 'todo-comments', gravidade: 'info', ocorrencias, resumo: 'N/A' };
    }

    const padrao = /\b(TODO|FIXME|XXX|HACK)\b:?\s*(.+)/gi;
    const linhas = conteudo.split('\n');

    linhas.forEach((linha, indice) => {
      const matches = [...linha.matchAll(padrao)];

      matches.forEach((match) => {
        ocorrencias.push({
          arquivo: arquivo.relPath,
          linha: indice + 1,
          coluna: linha.indexOf(match[0]),
          mensagem: `${match[1]}: ${match[2]}`,
          tipo: 'todo-comment',
          gravidade: match[1] === 'FIXME' ? 'error' : 'warning',
          contexto: linha.trim(),
        });
      });
    });

    return {
      tipo: 'todo-comments',
      gravidade: ocorrencias.length > 0 ? 'warning' : 'info',
      ocorrencias,
      resumo: `${ocorrencias.length} TODO/FIXME encontrado(s)`,
    };
  }
}
```

---

## ✅ Testes

### Padrão Recomendado

```typescript
import { describe, it, expect } from 'vitest';
import { SeuAnalista } from '@/analistas/detectores/seu-analista.js';
import type { Arquivo } from '@/types/core/config/config.js';

describe('SeuAnalista', () => {
  const analisador = new SeuAnalista();

  const mockArquivo: Arquivo = {
    relPath: 'test.ts',
    ext: 'ts',
    // outros campos necessários
  };

  it('deve detectar problema', () => {
    const resultado = analisador.analisar(
      mockArquivo,
      'código com problema'
    );

    expect(resultado.ocorrencias.length).toBeGreaterThan(0);
  });

  it('não deve gerar falsos positivos', () => {
    const resultado = analisador.analisar(
      mockArquivo,
      'código correto'
    );

    expect(resultado.ocorrencias).toHaveLength(0);
  });
});
```

### Executar Testes

```bash
npm run test src/analistas/seu-analista.test.ts
```

---

## 🎨 Boas Práticas

### 1. **Performance**

- ✅ Evite caregamento de todo arquivo em memória
- ✅ Use regex compilado (`/pattern/g`)
- ✅ Paralelize com Workers quando possível

### 2. **Código Limpo**

- ✅ Nomes descritivos
- ✅ Funções pequenas
- ✅ Comentários explicativos
- ✅ Type-safe (use TypeScript)

### 3. **Mensagens**

- ✅ Mensagens claras e acionáveis
- ✅ Suporte i18n (PT, EN, ZH, JA)
- ✅ Exemplos de como corrigir

### 4. **Descobertas**

- ✅ Sempre incluir linha/coluna exata
- ✅ Contexto do erro
- ✅ Sugestões de correção
- ✅ Gravidade apropriada

### 5. **Type Safety**

```typescript
// ✅ BOM
import type { ResultadoAnalise } from '@/types/analistas/detectores.js';

// ❌ EVITAR
import { ResultadoAnalise } from '@/types/analistas/detectores.js'; // implementação
```

---

## 📦 Publicar seu Analista

### Para Contribuir ao Prometheus

1. **Fork** o repositório
2. **Crie branch**: `git checkout -b feat/novo-analista`
3. **Implemente** seu analista seguindo este guia
4. **Adicione testes** com cobertura > 80%
5. **Documente** as descobertas e mensagens
6. **Submeta PR** com descrição clara

### Template de PR

```markdown
## Novo Analista: Nome do Seu Analista

### Descrição
Descreva o que seu analista detecta/analisa.

### Problemas Detectados
- Problema 1
- Problema 2

### Exemplo
```typescript
// Código que seu analista detecta
```

### Testes

- ✅ Testes unitários (>80% cobertura)
- ✅ Teste com projeto real
- ✅ Sem falsos positivos

### Performance

- Tempo médio por arquivo: < 100ms
- Memory footprint: < 10MB
```

---

## 🔗 Referências

- [Tipos de Analistas](../../../types/analistas/detectores.ts)
- [Registro de Analistas](../../../src/analistas/registry/index.ts)
- [Exemplos Existentes](../../../src/analistas/detectores/)
- [Sistema de Mensagens](../../../src/core/messages/README.md)

---

## 💡 Ideias para Analistas

Aqui estão algumas ideias para novos analistas que você pode criar:

- [ ] Detector de variáveis não utilizadas
- [ ] Detector de if/else complexo
- [ ] Detector de indentação inconsistente
- [ ] Detector de comentários obsoletos
- [ ] Detector de logging inconsistente
- [ ] Detector de tratamento de erro ausente
- [ ] Detector de tipos any
- [ ] Detector de console.log em produção

---

## ❓ Perguntas Frequentes

**P: Posso usar bibliotecas externas?**
R: Sim, mas veja a lista de dependências. Prefira soluções nativas quando possível.

**P: Como meu analista acessa configurações?**
R: Via `contexto.config` ou `arquivo.config` passados ao analisador.

**P: E se preciso de informações de múltiplos arquivos?**
R: Use Registry para armazenar estado entre análises.

**P: Posso usar async/await?**
R: Sim, mas retorne `Promise<ResultadoAnalise>` apropriadamente.

---

## 🎓 Próximas Leituras

- [Padrões de Desenvolvimento](../PADROES.md)
- [Sistema de Plugins](../SISTEMA-PLUGINS.md)
- [Type Safety no Prometheus](../../arquitetura/TYPE-SAFETY.md)
