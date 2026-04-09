# Sistema de Plugins - Prometheus 🔌

Guia completo sobre como funciona o sistema de plugins e registry do Prometheus.

---

## 📋 Visão Geral

O Prometheus usa um sistema baseado em **Registry Pattern** para descoberta e carregamento dinâmico de componentes:

- **Analistas** (Detectores)
- **Zeladores** (Executores de ação)
- **Formatadores de relatório**
- **Processadores de arquivo**

Isso permite:
✅ Extensibilidade sem modificar código core
✅ Carregamento seletivo de componentes
✅ Plugins separados em arquivos
✅ Descoberta automática de novos analistas

---

## 🏗️ Arquitetura de Registry

### Componentes

```typescript
// 1. Interface Base
interface Analista {
  nome: string;
  descricao: string;
  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[];
}

// 2. Registry (Registro centralizado)
class RegistroAnalistas {
  private analistas: Map<string, typeof Analista>;

  registrar(nome: string, classe: typeof Analista): void
  obter(nome: string): typeof Analista | undefined
  listar(): string[]
}

// 3. Descoberta (Scan de plugins)
class DescobritorPlugins {
  async descobrir(caminho: string): Promise<void>
}

// 4. Loader (Carregar instâncias)
class LoaderPlugins {
  async carregar(nomes: string[]): Promise<Analista[]>
}
```

### Fluxo

```
┌──────────────────────┐
│   App Inicia         │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ RegistroAnalistas    │
│ (vazio)              │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ DescobritorPlugins   │
│ Scan: src/analistas/ │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ Registrar Descobertos│
│ - CodigoFragil       │
│ - CodigoMorto        │
│ - Duplicação         │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────┐
│ LoaderPlugins        │
│ Carregar conforme    │
│ config.json          │
└──────────────────────┘
```

---

## 📍 Estrutura de Plugins

### Localizações

```
prometheus-dev/
├── src/analistas/
│   ├── detectores/          # ✅ Built-in analistas
│   │   ├── fragil.ts
│   │   ├── morto.ts
│   │   └── ...
│   ├── plugins/             # ✅ Espaço para plugins
│   │   ├── meu-plugin.ts
│   │   └── ...
│   └── registry/            # Registry centralized
│
├── prometheus.config.json   # Config de plugins
│
└── docs/
    └── desenvolvimento/
        └── analistas/
            └── CRIAR-ANALISTA.md
```

### Arquivo de Plugin

Estrutura mínima de um plugin:

```typescript
// src/analistas/plugins/meu-plugin.ts

import { type Analista, type ResultadoOcorrencia } from '@/analistas/tipos.js';
import { type Arquivo } from '@/shared/tipos.js';

export class MeuPluginAnalista implements Analista {
  nome = 'MeuPlugin';
  descricao = 'Meu plugin customizado';
  linguagens = ['javascript', 'typescript'];

  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
    // Implementação do plugin
    return [];
  }
}

// Exportar como padrão para descoberta automática
export default MeuPluginAnalista;
```

---

## 🔍 Descoberta Automática

O Prometheus realiza descoberta automática de plugins:

### 1. Descoberta Estática (Built-in)

Plugins que vêm com a instalação:

```typescript
// src/analistas/registry/built-in.ts

import CodigoFragilDetector from '../detectores/fragil.js';
import CodigoMortoDetector from '../detectores/morto.js';

export const BUILT_IN_ANALISTAS = {
  'CodigoFragil': CodigoFragilDetector,
  'CodigoMorto': CodigoMortoDetector,
  // ...
};
```

### 2. Descoberta Dinâmica

Plugins customizados a serem carregados:

```typescript
// src/analistas/registry/discoverer.ts

async function descobrirPlugins(diretorio: string): Promise<Map<string, typeof Analista>> {
  const plugins = new Map();
  const arquivos = await fs.readdir(diretorio);

  for (const arquivo of arquivos) {
    if (!arquivo.endsWith('.ts')) continue;

    const caminhoCompleto = path.join(diretorio, arquivo);
    const modulo = await import(caminhoCompleto);
    const classe = modulo.default;

    if (implementaInterface(classe)) {
      plugins.set(classe.nome, classe);
    }
  }

  return plugins;
}
```

### 3. Validação de Interface

```typescript
function implementaInterface(classe: any): boolean {
  const instancia = new classe();

  return (
    typeof instancia.nome === 'string' &&
    typeof instancia.descricao === 'string' &&
    typeof instancia.analisar === 'function' &&
    Array.isArray(instancia.linguagens)
  );
}
```

---

## ⚙️ Registro e Carregamento

### 1. Registrar Plugin

```typescript
// src/analistas/registry/index.ts

const registro = new RegistroAnalistas();

// Registrar built-in
for (const [nome, classe] of Object.entries(BUILT_IN_ANALISTAS)) {
  registro.registrar(nome, classe);
}

// Descobrir e registrar plugins
const pluginsDir = path.join(process.cwd(), 'src/analistas/plugins');
const pluginsDiscobertos = await descobrirPlugins(pluginsDir);

for (const [nome, classe] of pluginsDiscobertos) {
  registro.registrar(nome, classe);
}

export const RegistroGlobal = registro;
```

### 2. Carregar Instâncias

```typescript
class LoaderPlugins {
  async carregar(nomes: string[], config: ConfiguracaoProjeto): Promise<Analista[]> {
    const analistas: Analista[] = [];

    for (const nome of nomes) {
      const classe = registro.obter(nome);

      if (!classe) {
        logger.warn(`Analista não encontrado: ${nome}`);
        continue;
      }

      // Criar instância
      try {
        const analista = new classe();

        // Validar habilitação
        if (config.analistas[nome]?.habilitado === false) {
          continue;
        }

        analistas.push(analista);
        logger.debug(`Carregado: ${nome}`);
      } catch (erro) {
        logger.error(`Falha ao carregar ${nome}:`, erro);
      }
    }

    return analistas;
  }
}
```

### 3. Executar Plugins

```typescript
async function analisarComPlugins(
  arquivo: Arquivo,
  conteudo: string,
  analistas: Analista[]
): Promise<ResultadoOcorrencia[]> {
  const ocorrencias: ResultadoOcorrencia[] = [];

  for (const analista of analistas) {
    try {
      // Verificar se linguagem é suportada
      if (!analista.linguagens.includes(arquivo.linguagem)) {
        continue;
      }

      // Executar análise
      const resultado = analista.analisar(arquivo, conteudo);
      ocorrencias.push(...resultado);

    } catch (erro) {
      logger.error(`Erro em ${analista.nome}:`, erro);
    }
  }

  return ocorrencias;
}
```

---

## 🛠️ Criar Plugin Customizado

### Exemplo: Detector de TODO Comments

```typescript
// src/analistas/plugins/detector-todo-comments.ts

import { type Analista, type ResultadoOcorrencia } from '@/analistas/tipos.js';
import { type Arquivo } from '@/shared/tipos.js';

export class DetectorTODOComments implements Analista {
  nome = 'TODOComments';
  descricao = 'Detecta TODO, FIXME e HACK comments';
  linguagens = ['javascript', 'typescript', 'python', 'php'];

  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
    const ocorrencias: ResultadoOcorrencia[] = [];

    // Regex para encontrar comentários TODO/FIXME/HACK
    const regex = /\/\/\s*(TODO|FIXME|HACK)\s*:?\s*(.+)/g;

    let match;
    let linhas = 0;

    for (const linha of conteudo.split('\n')) {
      linhas++;

      while ((match = regex.exec(linha))) {
        const tipo = match[1];
        const msg = match[2];

        ocorrencias.push({
          linha: linhas,
          coluna: linha.indexOf(match[0]) + 1,
          tipo: `comentario-${tipo.toLowerCase()}`,
          mensagem: `${tipo}: ${msg}`,
          gravidade: tipo === 'HACK' ? 'major' : 'minor',
          pode_corrigir: false,
        });
      }
    }

    return ocorrencias;
  }
}

export default DetectorTODOComments;
```

### Registrar no Config

```json
{
  "prometheus": {
    "analistas": {
      "TODOComments": {
        "habilitado": true,
        "gravidade": "minor"
      }
    }
  }
}
```

### Testar Plugin

```typescript
// tests/analistas/detector-todo-comments.test.ts

import { describe, it, expect } from 'vitest';
import DetectorTODOComments from '@/analistas/plugins/detector-todo-comments.js';

describe('DetectorTODOComments', () => {
  const detector = new DetectorTODOComments();

  it('deve detectar TODO comment', () => {
    const codigo = `
      function minhaFuncao() {
        // TODO: Refatorar isso
        return 42;
      }
    `;

    const arquivo = { relPath: 'test.ts', ext: 'ts', linguagem: 'typescript' };
    const resultado = detector.analisar(arquivo, codigo);

    expect(resultado).toHaveLength(1);
    expect(resultado[0].tipo).toBe('comentario-todo');
  });

  it('deve detectar FIXME comment', () => {
    const codigo = `
      // FIXME: Bug aqui
      const x = 10;
    `;

    const arquivo = { relPath: 'test.ts', ext: 'ts', linguagem: 'typescript' };
    const resultado = detector.analisar(arquivo, codigo);

    expect(resultado[0].tipo).toBe('comentario-fixme');
    expect(resultado[0].gravidade).toBe('major');
  });

  it('deve ignorar se linguagem não suportada', () => {
    const arquivo = { relPath: 'test.css', ext: 'css', linguagem: 'css' };

    // não deve analisar CSS
    expect(detector.linguagens).not.toContain('css');
  });
});
```

---

## 📦 Plugin Externo

Plugins podem estar fora do repositório principal:

### Estrutura

```
meu-plugin-prometheus/
├── src/
│   └── detector-customizado.ts
├── tests/
│   └── detector-customizado.test.ts
├── package.json
└── README.md
```

### Instalação

```bash
# Via npm
npm install meu-plugin-prometheus

# Via local
npm install ./path/to/meu-plugin-prometheus
```

### Carregamento

```typescript
// src/analistas/registry/index.ts

// Importar plugin externo
import MeuPluginDetector from 'meu-plugin-prometheus';

// Registrar
registro.registrar('MeuPlugin', MeuPluginDetector);
```

---

## 🔄 Lifecycle de Plugin

```
1. DISCOVERY
   └─> Escanear diretório
       └─> parse arquivos .ts

2. REGISTRATION
   └─> Validar interface
       └─> Map<nome, classe>

3. INSTANTIATION
   └─> new Classe()
       └─> Validar config
           └─> Verificar habilitação

4. EXECUTION
   └─> Chamar analisar()
       └─> Retornar ocorrências

5. REPORTING
   └─> Agregar resultados
       └─> Formatar output
           └─> Salvar/exibir
```

---

## 🎯 Boas Práticas

### 1. Naming Convention

```typescript
// ✅ Bom
export class DetectorVariaveisNaoUsadas implements Analista {
  nome = 'VariaveisNaoUsadas';  // PascalCase
  // ...
}

// ❌ Ruim
export class detector_variaveis implements Analista {
  nome = 'detector-variaveis';  // snake_case
  // ...
}
```

### 2. Error Handling

```typescript
// ✅ Bom
try {
  const resultado = this.analisar(arquivo, conteudo);
  return resultado;
} catch (erro) {
  logger.error(`${this.nome}: análise falhou em ${arquivo.relPath}`, erro);
  return [];  // Não quebrar pipeline
}

// ❌ Ruim
// Deixar erro subir sem tratar
```

### 3. Logging

```typescript
// ✅ Bom
logger.debug(`${this.nome}: analisando ${arquivo.relPath}`);

// ❌ Ruim
console.log('analyzing...');  // Sem contexto
```

### 4. Type Safety

```typescript
// ✅ Bom
export class Detector implements Analista {
  analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
    // tipificado
  }
}

// ❌ Ruim
analisar(arquivo: any, conteudo: any): any[] {
  // sem tipos
}
```

### 5. Performance

```typescript
// ✅ Bom: Cache de regex compilada
private regexFragil = /regex-pattern/g;

analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
  let match;
  while ((match = this.regexFragil.exec(conteudo))) {
    // processar
  }
}

// ❌ Ruim: Compilar regex a cada execução
analisar(arquivo: Arquivo, conteudo: string): ResultadoOcorrencia[] {
  const matches = conteudo.match(/regex-pattern/g);  // recompila sempre
}
```

---

## 🚀 Próximas Etapas

1. **Criar Plugin**: [CRIAR-ANALISTA.md](./analistas/CRIAR-ANALISTA.md)
2. **Padrões**: [PADROES.md](./PADROES.md)
3. **Estrutura**: [estrutura-codigo/README.md](./estrutura-codigo/README.md)
4. **Exemplos**: [exemplos/EXEMPLOS-USO.md](../exemplos/EXEMPLOS-USO.md)

---

## 📚 Referências

- Visitor Pattern: https://en.wikipedia.org/wiki/Visitor_pattern
- Registry Pattern: https://en.wikipedia.org/wiki/Registry_pattern
- Plugin Architecture: https://en.wikipedia.org/wiki/Plug-in_(computing)
