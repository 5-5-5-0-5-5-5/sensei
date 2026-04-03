import { beforeEach, describe, expect, it, vi } from 'vitest';

const { statMock, scanRepositoryMock, isInsideSrcMock } = vi.hoisted(() => ({
  statMock: vi.fn(),
  scanRepositoryMock: vi.fn(),
  isInsideSrcMock: vi.fn((relPath: string) => relPath.startsWith('src/')),
}));

vi.mock('node:fs', () => ({
  promises: {
    stat: statMock,
  },
}));

vi.mock('@core/execution/scanner.js', () => ({
  scanRepository: scanRepositoryMock,
}));

vi.mock('@core/config/paths.js', () => ({
  isInsideSrc: isInsideSrcMock,
}));

vi.mock('@core/config/config.js', () => ({
  config: {
    testPadroes: {
      files: ['**/*.test.*', '**/*.spec.*', 'tests/**/*'],
      excludeFromOrphanCheck: true,
    },
  },
}));

import { grafoDependencias } from '@analistas/detectores/detector-dependencias.js';
import { detectarFantasmas } from '@analistas/detectores/detector-fantasmas.js';

describe('detector-fantasmas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    grafoDependencias.clear();
  });

  it('detecta arquivos antigos nao referenciados e ignora testes, entrypoints e consumidores', async () => {
    const antigo = Date.now() - 90 * 86_400_000;

    scanRepositoryMock.mockResolvedValue({
      ghost: {
        relPath: 'src/ghost.ts',
        fullCaminho: '/repo/src/ghost.ts',
      },
      test: {
        relPath: 'tests/ghost.test.ts',
        fullCaminho: '/repo/tests/ghost.test.ts',
      },
      entry: {
        relPath: 'src/index.ts',
        fullCaminho: '/repo/src/index.ts',
      },
      consumer: {
        relPath: 'src/consumer.ts',
        fullCaminho: '/repo/src/consumer.ts',
      },
      recent: {
        relPath: 'src/recent.ts',
        fullCaminho: '/repo/src/recent.ts',
      },
    });

    statMock.mockImplementation(async (fullPath: string) => {
      if (fullPath.includes('recent')) {
        return { mtimeMs: Date.now() - 2 * 86_400_000 };
      }
      return { mtimeMs: antigo };
    });

    grafoDependencias.set('src/consumer.ts', new Set(['./ghost.ts']));
    grafoDependencias.set('src/ghost.ts', new Set());
    grafoDependencias.set('src/recent.ts', new Set());

    const resultado = await detectarFantasmas('/repo');

    expect(resultado.total).toBe(2);
    expect(resultado.fantasmas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          arquivo: 'src/ghost.ts',
          referenciado: false,
        }),
        expect.objectContaining({
          arquivo: 'src/recent.ts',
          referenciado: false,
        }),
      ]),
    );
    expect(
      resultado.fantasmas.some((item) => item.arquivo === 'tests/ghost.test.ts'),
    ).toBe(false);
    expect(
      resultado.fantasmas.some((item) => item.arquivo === 'src/index.ts'),
    ).toBe(false);
    expect(
      resultado.fantasmas.some((item) => item.arquivo === 'src/consumer.ts'),
    ).toBe(false);
  });

  it('mantem lista vazia quando nenhum arquivo alvo e elegivel', async () => {
    scanRepositoryMock.mockResolvedValue({
      test: {
        relPath: 'tests/app.test.ts',
        fullCaminho: '/repo/tests/app.test.ts',
      },
      entry: {
        relPath: 'src/index.ts',
        fullCaminho: '/repo/src/index.ts',
      },
    });
    statMock.mockResolvedValue({ mtimeMs: Date.now() - 90 * 86_400_000 });

    const resultado = await detectarFantasmas('/repo');

    expect(resultado).toEqual({ total: 0, fantasmas: [] });
  });
});
