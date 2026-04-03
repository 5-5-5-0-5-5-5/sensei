import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { EstrategistaEstrutura } from '@analistas/arquitetos/estrategista-estrutura.js';

const tempDirs: string[] = [];

describe('estrategista-estrutura', () => {
  afterEach(async () => {
    await Promise.all(
      tempDirs.splice(0).map(async (dir) => {
        await import('node:fs/promises').then(({ rm }) =>
          rm(dir, { recursive: true, force: true }),
        );
      }),
    );
  });

  it('gera plano de migracao com ajustes por sinais avancados', async () => {
    const baseDir = await import('node:fs/promises').then(({ mkdtemp }) =>
      mkdtemp(path.join(os.tmpdir(), 'sensei-estrategia-')),
    );
    tempDirs.push(baseDir);

    await mkdir(path.join(baseDir, '.sensei'), { recursive: true });
    await writeFile(
      path.join(baseDir, '.sensei', 'estrutura.json'),
      JSON.stringify({}),
      'utf8',
    );

    const plano = await EstrategistaEstrutura.gerarPlano(
      {
        baseDir,
        arquivos: [
          { relPath: 'src/user.service.ts' },
          { relPath: 'src/payment.repository.ts' },
          { relPath: 'src/auth.type.ts' },
          { relPath: 'src/user.controller.ts' },
          { relPath: 'src/app.test.ts' },
          { relPath: 'vitest.config.ts' },
        ],
      } as never,
      { preset: 'node-community' },
      {
        tipoDominante: 'api-rest',
        padroesArquiteturais: ['repository-service'],
        tecnologiasDominantes: ['typescript-advanced'],
        complexidadeEstrutura: 'alta',
      } as never,
    );

    expect(plano.resumo.zonaVerde).toBeGreaterThanOrEqual(4);
    expect(plano.mover).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          de: 'src/user.service.ts',
          para: 'src/auth/user.service.ts',
        }),
        expect.objectContaining({
          de: 'src/payment.repository.ts',
          para: 'src/payment/payment.repository.ts',
        }),
        expect.objectContaining({
          de: 'src/auth.type.ts',
          para: 'src/auth/auth.type.ts',
        }),
        expect.objectContaining({
          de: 'src/user.controller.ts',
          para: 'src/auth/user.controller.ts',
        }),
      ]),
    );
    expect(plano.mover.some((item) => item.de.includes('.test.'))).toBe(false);
  });

  it('reporta conflito quando destino ja existe', async () => {
    const baseDir = await import('node:fs/promises').then(({ mkdtemp }) =>
      mkdtemp(path.join(os.tmpdir(), 'sensei-estrategia-')),
    );
    tempDirs.push(baseDir);

    await mkdir(path.join(baseDir, '.sensei'), { recursive: true });
    await writeFile(
      path.join(baseDir, '.sensei', 'estrutura.json'),
      JSON.stringify({}),
      'utf8',
    );
    await mkdir(path.join(baseDir, 'src', 'services'), { recursive: true });
    await writeFile(
      path.join(baseDir, 'src', 'services', 'user.service.ts'),
      'export {};',
      'utf8',
    );

    const plano = await EstrategistaEstrutura.gerarPlano(
      {
        baseDir,
        arquivos: [{ relPath: 'src/user.service.ts' }],
      } as never,
      { preset: 'node-community' },
    );

    expect(plano.mover).toEqual([]);
    expect(plano.conflitos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          alvo: 'src/services/user.service.ts',
          motivo: 'destino já existe',
        }),
      ]),
    );
  });
});
