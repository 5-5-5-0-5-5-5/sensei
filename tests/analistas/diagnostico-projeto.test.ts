import { describe, expect, it } from 'vitest';

import { diagnosticarProjeto } from '@analistas/arquitetos/diagnostico-projeto.js';

describe('diagnostico-projeto', () => {
  it('prioriza fullstack sobre os demais tipos', () => {
    const diagnostico = diagnosticarProjeto({
      ehFullstack: true,
      ehMonorepo: true,
      temPages: true,
      temApi: true,
      temCli: true,
      temSrc: true,
      temComponents: true,
      temControllers: true,
      temExpress: true,
    });

    expect(diagnostico.tipo).toBe('fullstack');
    expect(diagnostico.confiabilidade).toBe(0.95);
    expect(diagnostico.sinais).toContain('ehFullstack');
    expect(diagnostico.sinais).toContain('temApi');
  });

  it('classifica corretamente monorepo, landing, api, cli e lib', () => {
    expect(
      diagnosticarProjeto({ ehMonorepo: true, temSrc: true }).tipo,
    ).toBe('monorepo');
    expect(diagnosticarProjeto({ temPages: true }).tipo).toBe('landing');
    expect(diagnosticarProjeto({ temApi: true }).tipo).toBe('api');
    expect(diagnosticarProjeto({ temCli: true }).tipo).toBe('cli');
    expect(
      diagnosticarProjeto({
        temSrc: true,
        temComponents: false,
        temApi: false,
      }).tipo,
    ).toBe('lib');
  });

  it('retorna desconhecido quando nao ha sinais positivos', () => {
    const diagnostico = diagnosticarProjeto({
      temSrc: false,
      temPages: false,
      temApi: false,
      temCli: false,
      temComponents: false,
    });

    expect(diagnostico.tipo).toBe('desconhecido');
    expect(diagnostico.confiabilidade).toBe(0.3);
    expect(diagnostico.sinais).toEqual([]);
  });
});
