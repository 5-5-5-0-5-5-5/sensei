import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  detectarArquetipoNode,
  detectarArquetipoXML,
  pontuarTodos,
} = vi.hoisted(() => ({
  detectarArquetipoNode: vi.fn(),
  detectarArquetipoXML: vi.fn(),
  pontuarTodos: vi.fn(),
}));

vi.mock('@analistas/plugins/detector-node.js', () => ({
  detectarArquetipoNode,
}));

vi.mock('@analistas/plugins/detector-xml.js', () => ({
  detectarArquetipoXML,
}));

vi.mock('@analistas/pontuadores/pontuador.js', () => ({
  pontuarTodos,
}));

import { detectarArquetipo } from '@analistas/js-ts/orquestrador-arquetipos.js';

describe('orquestrador-arquetipos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('retorna desconhecido para projetos muito pequenos', () => {
    const resultado = detectarArquetipo(['a.ts', 'b.ts', 'c.ts', 'd.ts']);

    expect(resultado.nome).toBe('desconhecido');
    expect(resultado.anomalias[0]?.motivo).toContain('Projeto muito pequeno');
  });

  it('usa detectores especializados e prioriza penalidades quando aplicavel', () => {
    detectarArquetipoNode.mockReturnValue([
      {
        nome: 'monorepo-packages',
        score: 1,
        confidence: 0.2,
        matchedRequired: [],
        missingRequired: ['packages'],
        matchedOptional: [],
        dependencyMatches: [],
        filePadraoMatches: [],
        forbiddenPresent: ['src'],
        anomalias: [],
      },
      {
        nome: 'cli-modular',
        score: 1,
        confidence: 0.2,
        matchedRequired: [],
        missingRequired: ['bin'],
        matchedOptional: [],
        dependencyMatches: [],
        filePadraoMatches: [],
        forbiddenPresent: ['pages', 'public'],
        anomalias: [],
      },
    ]);
    detectarArquetipoXML.mockReturnValue([]);

    const resultado = detectarArquetipo([
      'package.json',
      'src/index.ts',
      'src/cli.ts',
      'pages/home.tsx',
      'public/logo.svg',
    ]);

    expect(resultado.nome).toBe('cli-modular');
  });

  it('faz fallback para pontuador quando detectores especializados nao retornam candidatos', () => {
    detectarArquetipoNode.mockReturnValue([]);
    detectarArquetipoXML.mockReturnValue([]);
    pontuarTodos.mockReturnValue([
      {
        nome: 'node-package',
        score: 10,
        confidence: 0.8,
        matchedRequired: ['package.json'],
        missingRequired: [],
        matchedOptional: [],
        dependencyMatches: [],
        filePadraoMatches: [],
        forbiddenPresent: [],
        anomalias: [],
      },
    ]);

    const resultado = detectarArquetipo([
      'package.json',
      'src/index.ts',
      'src/main.ts',
      'README.md',
      'tsconfig.json',
    ]);

    expect(pontuarTodos).toHaveBeenCalled();
    expect(resultado.nome).toBe('node-package');
  });
});
