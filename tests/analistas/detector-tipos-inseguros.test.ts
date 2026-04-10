import { describe, expect, it } from 'vitest';

import { detectorTiposInseguros as analistaTiposInseguros } from '@analistas/detectores/detector-tipos-inseguros.js';

describe('analistaTiposInseguros', () => {
  it('seleciona apenas arquivos TypeScript', () => {
    expect(analistaTiposInseguros.test('src/app.ts')).toBe(true);
    expect(analistaTiposInseguros.test('src/app.tsx')).toBe(true);
    expect(analistaTiposInseguros.test('src/app.js')).toBe(false);
  });

  it('detecta uso de any em declarações', async () => {
    const src = 'const data: any = { x: 1 };';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].tipo).toBe('tipo-inseguro-any');
    expect(ocorrencias[0].mensagem).toContain("Tipo 'any'");
  });

  it('detecta patterns específicos de any (catch block)', async () => {
    const src = 'try { } catch (err: any) { }';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].mensagem).toContain('catch block');
    expect(ocorrencias[0].mensagem).toContain('unknown');
  });

  it('detecta patterns de any em Arrays', async () => {
    const src = 'const list: any[] = [];';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].mensagem).toContain('Array de \'any\'');
  });

  it('detecta as any assertions (erro)', async () => {
    const src = 'const x = val as any;';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].nivel).toBe('erro');
    expect(ocorrencias[0].tipo).toBe('tipo-inseguro-any-assertion');
  });

  it('detecta angle bracket casting (legado)', async () => {
    const src = 'const x = <any>val;';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].tipo).toBe('tipo-inseguro-any-cast');
  });

  it('detecta tipos fracos (Object e {})', async () => {
    const src = 'const obj: Object = {}; const empty: {} = {};';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBe(2);
    expect(ocorrencias[0].tipo).toBe('tipo-permissivo-object');
  });

  it('detecta unknown que pode ser melhorado', async () => {
    const src = 'const value: unknown = "string";';
    const ocorrencias = await analistaTiposInseguros.aplicar(src, 'src/app.ts', null);
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].tipo).toBe('tipo-inseguro-unknown');
  });
});
