import { describe, expect, it } from 'vitest';

import { extrairSinaisAvancados } from '@analistas/arquitetos/sinais-projeto.js';

describe('sinais-projeto', () => {
  it('extrai sinais agregados a partir de file entries e package json', () => {
    const fileEntries = [
      {
        relPath: 'src/controllers/user.ts',
        ast: {
          node: {
            type: 'Program',
            body: [
              { type: 'FunctionDeclaration' },
              { type: 'VariableDeclaration' },
              { type: 'ClassDeclaration' },
              {
                type: 'ImportDeclaration',
                source: { value: 'react' },
              },
              {
                type: 'ImportDeclaration',
                source: { value: 'express' },
              },
              {
                type: 'TSInterfaceDeclaration',
                id: { name: 'UserDto' },
              },
            ],
          },
        },
      },
      {
        relPath: 'src/pages/index.ts',
        ast: {
          node: {
            type: 'Program',
            body: [
              { type: 'FunctionDeclaration' },
              { type: 'VariableDeclaration' },
              {
                type: 'TSTypeAliasDeclaration',
                id: { name: 'PageProps' },
              },
              {
                type: 'TSEnumDeclaration',
                id: { name: 'Status' },
              },
            ],
          },
        },
      },
      {
        relPath: 'tsconfig.json',
        ast: null,
      },
    ] as never;

    const sinais = extrairSinaisAvancados(fileEntries, {
      dependencies: { react: '^19.0.0', express: '^5.0.0' },
      scripts: { dev: 'vite', build: 'tsc' },
    } as never);

    expect(sinais.funcoes).toBe(2);
    expect(sinais.variaveis).toBe(2);
    expect(sinais.classes).toBe(1);
    expect(sinais.imports).toEqual(expect.arrayContaining(['react', 'express']));
    expect(sinais.frameworksDetectados).toEqual(
      expect.arrayContaining(['react', 'express']),
    );
    expect(sinais.tipos).toEqual(
      expect.arrayContaining(['UserDto', 'PageProps', 'Status']),
    );
    expect(sinais.pastasPadrao).toEqual(
      expect.arrayContaining(['src/controllers/user.ts', 'src/pages/index.ts']),
    );
    expect(sinais.arquivosPadrao).toContain('src/pages/index.ts');
    expect(sinais.arquivosConfiguracao).toContain('tsconfig.json');
    expect(sinais.dependencias).toEqual(
      expect.arrayContaining(['react', 'express']),
    );
    expect(sinais.scripts).toEqual(expect.arrayContaining(['dev', 'build']));
  });

  it('normaliza duplicidades e tolera ast ausente', () => {
    const sinais = extrairSinaisAvancados(
      [
        {
          relPath: 'src/api/main.js',
          ast: {
            node: {
              type: 'Program',
              body: [
                {
                  type: 'ImportDeclaration',
                  source: { value: 'express' },
                },
                {
                  type: 'ImportDeclaration',
                  source: { value: 'express' },
                },
              ],
            },
          },
        },
        {
          relPath: 'src/api/main.js',
          ast: null,
        },
      ] as never,
      undefined,
    );

    expect(sinais.imports).toEqual(['express']);
    expect(sinais.frameworksDetectados).toEqual(['express']);
    expect(sinais.pastasPadrao).toEqual(['src/api/main.js']);
    expect(sinais.arquivosPadrao).toEqual(['src/api/main.js']);
  });
});
