import { parse } from '@babel/parser';
import { describe, expect, it } from 'vitest';

import { analistaConstrucoesSintaticas } from '@analistas/detectores/detector-construcoes-sintaticas.js';

function createAst(src: string) {
  return parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

describe('analistaConstrucoesSintaticas', () => {
  it('seleciona arquivos e ignora outros', () => {
    expect(analistaConstrucoesSintaticas.test('src/app.ts')).toBe(true);
    expect(analistaConstrucoesSintaticas.test('src/app.mjs')).toBe(true);
    expect(analistaConstrucoesSintaticas.test('src/app.cjs')).toBe(true);
    expect(analistaConstrucoesSintaticas.test('src/styles.css')).toBe(false);
  });

  it('identifica construções sintáticas básicas (const, function, class, etc.)', () => {
    const src = `
      import { some } from 'module';
      const x = 1;
      let y = 2;
      var z = 3;
      function foo() { return 42; }
      class Baz {}
      export const bar = () => {};
    `;
    const ast = createAst(src);
    const ocorrencias = analistaConstrucoesSintaticas.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].nivel).toBe('info');
    expect(ocorrencias[0].mensagem).toContain('import: 1');
    expect(ocorrencias[0].mensagem).toContain('const: 2');
    expect(ocorrencias[0].mensagem).toContain('let: 1');
    expect(ocorrencias[0].mensagem).toContain('var: 1');
    expect(ocorrencias[0].mensagem).toContain('function: 1');
    expect(ocorrencias[0].mensagem).toContain('class: 1');
    expect(ocorrencias[0].mensagem).toContain('export: 1');
  });

  it('identifica construções TypeScript (interface, enum, type)', () => {
    const src = `
      interface I {}
      type T = string;
      enum E { A }
    `;
    const ast = createAst(src);
    const ocorrencias = analistaConstrucoesSintaticas.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].mensagem).toContain('interface: 1');
    expect(ocorrencias[0].mensagem).toContain('type: 1');
    expect(ocorrencias[0].mensagem).toContain('enum: 1');
  });

  it('identifica async/await e Promises', () => {
    const src = `
      async function foo() { 
        await bar();
      }
      const p = new Promise(() => {});
    `;
    const ast = createAst(src);
    const ocorrencias = analistaConstrucoesSintaticas.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].mensagem).toContain('async: 1');
    expect(ocorrencias[0].mensagem).toContain('await: 1');
    expect(ocorrencias[0].mensagem).toContain('promise: 1');
  });

  it('retorna vazio sem ast ou src', () => {
    expect(analistaConstrucoesSintaticas.aplicar('', 'src/app.ts', null)).toHaveLength(0);
  });
});
