import { describe, expect, it } from 'vitest';

import {
  extrairSinaisAvancados,
  scoreArquetipo,
} from '@analistas/arquitetos/sinais-projeto-avancados.js';

describe('sinais-projeto-avancados', () => {
  it('extrai padroes arquiteturais, tecnologias e complexidade', () => {
    const fileEntries = [
      {
        relPath: 'src/controllers/user.controller.ts',
        content:
          'import React from "react"; import express from "express"; interface User {} async function load(){ await run(); }',
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
                id: { name: 'User' },
              },
            ],
          },
        },
      },
      {
        relPath: 'src/services/payment.service.ts',
        content: 'useState(); useEffect(() => {}); type Payment = {};',
        ast: {
          node: {
            type: 'Program',
            body: [
              { type: 'VariableDeclaration' },
              {
                type: 'TSTypeAliasDeclaration',
                id: { name: 'Payment' },
              },
            ],
          },
        },
      },
      {
        relPath: 'bin/cli.ts',
        content: 'import { Command } from "commander";',
        ast: {
          node: {
            type: 'Program',
            body: [
              {
                type: 'ImportDeclaration',
                source: { value: 'commander' },
              },
            ],
          },
        },
      },
      {
        relPath: 'vite.config.ts',
        content: '',
        ast: null,
      },
    ] as never;

    const sinais = extrairSinaisAvancados(fileEntries, {
      dependencies: { react: '^19.0.0', express: '^5.0.0' },
      scripts: { dev: 'vite', test: 'vitest' },
    } as never);

    expect(sinais.funcoes).toBe(1);
    expect(sinais.variaveis).toBe(2);
    expect(sinais.classes).toBe(1);
    expect(sinais.tipos).toEqual(expect.arrayContaining(['User', 'Payment']));
    expect(sinais.padroesArquiteturais).toEqual(
      expect.arrayContaining(['mvc', 'repository-service', 'async-await', 'cli-patterns']),
    );
    expect(sinais.tecnologiasDominantes).toEqual(
      expect.arrayContaining([
        'frontend-framework',
        'backend-framework',
        'react-hooks',
        'typescript-advanced',
      ]),
    );
    expect(sinais.tipoDominante).not.toBe('desconhecido');
    expect(sinais.frameworksDetectados).toEqual(
      expect.arrayContaining(['react', 'express']),
    );
    expect(sinais.arquivosConfiguracao).toContain('vite.config.ts');
    expect(sinais.complexidadeEstrutura).toBe('baixa');
    expect(sinais.dependencias).toEqual(
      expect.arrayContaining(['react', 'express']),
    );
    expect(sinais.scripts).toEqual(expect.arrayContaining(['dev', 'test']));
  });

  it('marca complexidade alta para conjuntos grandes e retorna score default', () => {
    const fileEntries = Array.from({ length: 101 }, (_, index) => ({
      relPath: `src/domain${index}/file${index}.ts`,
      content: '',
      ast: null,
    })) as never;

    const sinais = extrairSinaisAvancados(fileEntries);
    const score = scoreArquetipo({ nome: 'demo', descricao: 'x' } as never, []);

    expect(sinais.complexidadeEstrutura).toBe('alta');
    expect(score.nome).toBe('demo');
    expect(score.score).toBe(0);
    expect(score.confidence).toBe(0);
  });
});
