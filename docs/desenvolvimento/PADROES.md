---
Proveniência e Autoria: Este documento integra o projeto Prometheus (licença MIT-0).
---


# Padrões de Desenvolvimento - Prometheus 📋

Convenções e padrões utilizados no desenvolvimento do Prometheus.

---

## 📝 Padrões de Código

### 1. Nomenclatura

#### Classes e Interfaces

```typescript
// ✅ PascalCase para classes
export class DetectorCodigoFragil { }
export class CliAutoFixHandler { }

// ✅ Interface com sufixo
export interface ResultadoAnalise { }
export interface ConfiguracaoProjeto { }

// ✅ Type com sufixo
export type CaminhoArquivo = string;
export type ResultadoOuErro<T> = T | Error;
```

#### Funções e Variáveis

```typescript
// ✅ camelCase para funções e variáveis
function analisarArquivo() { }
const totalArquivos = 0;

// ✅ CONSTANT_CASE para constantes
const LIMITE_LINHAS = 50;
const VERSAO_MINIMA = '24.12.0';
```

#### Arquivos

```typescript
// ✅ kebab-case para nomes de arquivo
- detector-codigo-fragil.ts
- cli-auto-fix-handler.ts
- guardar-relatorio.ts

// ❌ Evitar
- DetectorCodigoFragil.ts  (use snake_case é OK para tipos específicos)
- cliAutoFixHandler.ts
```

### 2. Organizaçã o de Imports

```typescript
// ✅ Ordem recomendada:
// 1. Imports de tipos
import type { Arquivo, ResultadoAnalise } from '@/types/analistas.js';
import type { Config } from '@/types/core/config/config.js';

// 2. Imports de bibliotecas externas
import path from 'path';
import { readFile } from 'fs/promises';

// 3. Imports internos (absolute paths)
import { logger } from '@/shared/helpers/logger.js';
import { RegistroAnalistas } from '@/analistas/registry/index.js';

// 4. Imports relativos (quando necessário)
import { utilitario } from './utils.js';

// ✅ Use absolute paths (@/) quando possível
// ❌ Evite caminhos relativos complexos como ../../../
```

### 3. Type Safety

```typescript
// ✅ Sempre tipifique
export function analisar(arquivo: Arquivo, conteudo: string): ResultadoAnalise {
  // ...
}

// ✅ Use generics quando apropriado
export class Cache<T> {
  private dados: Map<string, T> = new Map();

  obter(chave: string): T | undefined {
    return this.dados.get(chave);
  }
}

// ❌ Avoid any
function processar(dados: any) { } // RUIM
function processar(dados: unknown) { } // Melhor
function processar(dados: ProcessarConfig) { } // Ótimo
```

### 4. Tratamento de Erros

```typescript
// ✅ Use classes de erro customizadas
export class AnalistaError extends Error {
  constructor(
    public readonly analista: string,
    message: string,
    public readonly arquivo?: string
  ) {
    super(`[${analista}] ${message}`);
    this.name = 'AnalistaError';
  }
}

// ✅ Tratar erros sempre
try {
  await analisarArquivo(caminho);
} catch (erro) {
  if (erro instanceof AnalistaError) {
    logger.error(`Analista falhou: ${erro.analista}`, erro);
  } else {
    throw erro;
  }
}

// ❌ Evitar erros silenciosos
try {
  await analisarArquivo(caminho);
} catch (erro) {
  // Silencioso! RUIM
}
```

### 5. Async/Await

```typescript
// ✅ Prefira async/await
async function processarProjeto(caminho: string): Promise<void> {
  const arquivos = await obterArquivos(caminho);
  for (const arquivo of arquivos) {
    await analisar(arquivo);
  }
}

// ✅ Use Promise.all para paralelismo
async function analisarTodos(arquivos: Arquivo[]): Promise<Resultado[]> {
  return Promise.all(arquivos.map(analisar));
}

// ❌ Evitar .then() chains (quando possível)
obterArquivos().then(arquivos => arquivos.map(analisar));
```

---

## 🏗️ Padrões Arquiteturais

### 1. Padrão Registry

```typescript
// Registry centralizado para descoberta de componentes
class RegistroAnalistas {
  private analistas: Map<string, typeof Analista> = new Map();

  registrar(nome: string, classe: typeof Analista): void {
    this.analistas.set(nome, classe);
  }

  obter(nome: string): typeof Analista | undefined {
    return this.analistas.get(nome);
  }

  *iterador() {
    yield* this.analistas.values();
  }
}
```

### 2. Padrão Singleton

```typescript
// Instância única durante execução
export class Logger {
  private static instancia: Logger;

  private constructor() {}

  static obter(): Logger {
    if (!Logger.instancia) {
      Logger.instancia = new Logger();
    }
    return Logger.instancia;
  }
}

// Uso
const logger = Logger.obter();
```

### 3. Padrão Strategy

```typescript
// Diferentes estratégias para resolver problema
interface EstrategiaFix {
  aplicar(problema: Problema): Promise<void>;
}

class FixRenomear implements EstrategiaFix {
  async aplicar(problema: Problema): Promise<void> {
    // Implementar renomeação
  }
}

class FixMover implements EstrategiaFix {
  async aplicar(problema: Problema): Promise<void> {
    // Implementar movimento
  }
}
```

### 4. Padrão Visitor

```typescript
// Visitante para traversar estrutura
interface Visitante {
  visitarArquivo(arquivo: Arquivo): void;
  visitarDiretorio(dir: Diretorio): void;
}

class AnalisadorRetProcesso implements Visitante {
  visitarArquivo(arquivo: Arquivo): void {
    // Análise específica
  }

  visitarDiretorio(dir: Diretorio): void {
    for (const filho of dir.filhos) {
      if (filho instanceof Arquivo) {
        this.visitarArquivo(filho);
      }
    }
  }
}
```

---

## 📚 Padrões de Documentação

### 1. JSDoc/TSDoc

```typescript
/**
 * Analisa um arquivo em busca de problemas de code smell.
 *
 * @param arquivo - Metadados do arquivo a analisar
 * @param conteudo - Conteúdo do arquivo como string
 * @returns Resultado da análise com descobertas
 *
 * @example
 * ```typescript
 * const resultado = analisar(arquivo, conteudo);
 * console.log(resultado.ocorrencias);
 * ```
 *
 * @throws {AnalistaError} Se análise falhar por razão interna
 */
export function analisar(
  arquivo: Arquivo,
  conteudo: string
): ResultadoAnalise {
  // ...
}
```

### 2. Comentários Explicativos

```typescript
// ✅ Explicar POR QUÊ, não O QUÊ
// Evitamos regex global aqui porque há overhead de estado

// ❌ Evitar
// Define o limite
const LIMITE = 50;

// ✅ Melhor
// 50 linhas é benchmark de legibilidade baseado em estudos
const LIMITE = 50;
```

### 3. Exemplos de Código

```typescript
/**
 * @example
 * ```typescript
 * // Análise simples
 * const resultado = detector.analisar(arquivo, conteudo);
 *
 * // Com filtro
 * const criticos = resultado.ocorrencias.filter(o => o.gravidade === 'critical');
 * ```
 */
```

---

## 🧪 Padrões de Testes

### 1. Estrutura AAA (Arrange-Act-Assert)

```typescript
import { describe, it, expect } from 'vitest';

describe('DetectorProblema', () => {
  it('deve detectar problema X', () => {
    // Arrange: Preparar dados
    const detector = new DetectorProblema();
    const arquivo = { relPath: 'test.ts', ext: 'ts' };
    const codigo = 'código com problema';

    // Act: Executar
    const resultado = detector.analisar(arquivo, codigo);

    // Assert: Verificar
    expect(resultado.ocorrencias).toHaveLength(1);
    expect(resultado.ocorrencias[0].tipo).toBe('problema-x');
  });
});
```

### 2. Cobertura de Testes

```typescript
// ✅ Testar casos:
// - Caso feliz (sucesso)
// - Casos extremos (edge cases)
// - Casos de erro
// - Desempenho (benchmarks)

describe('Analisador', () => {
  it('analisa caso simples', () => { });     // Feliz
  it('ignora arquivo vazio', () => { });     // Edge case
  it('ignora arquivo inválido', () => { }); // Edge case
  it('lança erro com permissão negada', () => { }); // Erro
  it('handles grande arquivo', () => { }); // Desempenho
});
```

### 3. Mocks e Fixtures

```typescript
// ✅ Usar factories
function criarMockArquivo(sobrescrita?: Partial<Arquivo>): Arquivo {
  return {
    relPath: 'default.ts',
    ext: 'ts',
    ocorrencias: [],
    ...sobrescrita,
  };
}

// ✅ Usar no teste
it('analisa', () => {
  const arquivo = criarMockArquivo({ relPath: 'custom.ts' });
  // ...
});
```

---

## 🎯 Padrões de Performance

### 1. Lazy Loading

```typescript
// ✅ Carregar sob demanda
class RegistroAnalistas {
  private cache: Map<string, Analista> = new Map();

  async obter(nome: string): Promise<Analista> {
    if (!this.cache.has(nome)) {
      // Carregar apenas quando solicitado
      const modulo = await import(`./analistas/${nome}.js`);
      this.cache.set(nome, modulo.default);
    }
    return this.cache.get(nome)!;
  }
}
```

### 2. Memoização

```typescript
// ✅ Cache de resultados
function memoizar<T, R>(fn: (arg: T) => R): (arg: T) => R {
  const cache = new Map<T, R>();

  return (arg: T): R => {
    if (cache.has(arg)) {
      return cache.get(arg)!;
    }
    const resultado = fn(arg);
    cache.set(arg, resultado);
    return resultado;
  };
}

// Uso
const analisarComCache = memoizar((arquivo: string) => expensive(arquivo));
```

### 3. Streaming para Grandes Arquivos

```typescript
// ✅ Processar em chunks
async function analisarArquivoGrande(caminho: string): Promise<void> {
  const stream = fs.createReadStream(caminho, { highWaterMark: 64 * 1024 });

  for await (const chunk of stream) {
    processar(chunk.toString());
  }
}
```

---

## 🔒 Padrões de Segurança

### 1. Validação de Entrada

```typescript
// ✅ Sempre validar entrada
export function processar(entrada: unknown): ProcessarConfig {
  if (typeof entrada !== 'object' || entrada === null) {
    throw new Error('Entrada inválida');
  }

  const config = entrada as ProcessarConfig;
  if (!config.caminho || typeof config.caminho !== 'string') {
    throw new Error('Caminho inválido');
  }

  return config;
}
```

### 2. Path Traversal Protection

```typescript
// ✅ Prevenir directory traversal
import path from 'path';

function lerArquivo(base: string, arquivo: string): string {
  const completo = path.resolve(base, arquivo);
  const normalizado = path.normalize(completo);

  // Verificar se resultado está dentro da base
  if (!normalizado.startsWith(base)) {
    throw new Error('Path traversal detectado');
  }

  return fs.readFileSync(normalizado, 'utf-8');
}
```

---

## 📦 Padrões de Versionamento

### Semantic Versioning

```
MAJOR.MINOR.PATCH

- MAJOR: Breaking changes
- MINOR: New features (backward compatible)
- PATCH: Bug fixes

Exemplo: v1.2.3
```

### Changelog Format

```markdown
## [1.2.0] - 2026-04-09

### Added
- Nova feature X
- Suporte para Y

### Changed
- Comportamento de Z alterado

### Fixed
- Bug em funcionalidade W

### Deprecated
- Função antiga() será removida em v2.0
```

---

## ✅ Checklist de Qualidade

Antes de submeter código:

- [ ] TypeScript type-safe (sem `any`)
- [ ] ESLint passou (npm run lint)
- [ ] Testes cobrem > 80% (npm run test)
- [ ] Sem console.log em produção
- [ ] Documentação JSDoc completa
- [ ] Performance aceitável
- [ ] Segurança revisada
- [ ] Nomes descritivos
- [ ] PR tem descrição clara

---

## 🔗 Referências

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Vitest Documentation](https://vitest.dev/)
- [Node.js Best Practices](https://nodejs.org/en/docs/guides/)

