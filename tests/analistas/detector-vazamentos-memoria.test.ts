import { parse } from '@babel/parser';
import { describe, expect, it } from 'vitest';

import { analistaVazamentoMemoria } from '@analistas/detectores/detector-vazamentos-memoria.js';

function createAst(src: string) {
  return parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

describe('analistaVazamentoMemoria', () => {
  it('seleciona apenas arquivos js/ts e ignora testes', () => {
    expect(analistaVazamentoMemoria.test('src/app.ts')).toBe(true);
    expect(analistaVazamentoMemoria.test('src/app.test.ts')).toBe(false);
    expect(analistaVazamentoMemoria.test('src/styles.css')).toBe(false);
  });

  it('detecta setInterval não guardado em variável (heurística)', async () => {
    const src = `
      setInterval(() => {
        console.log('leaking...');
      }, 1000);
      
      const interval = setInterval(() => {
        console.log('doing okay');
      }, 2000);
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaVazamentoMemoria.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].tipo).toBe('setinterval-unassigned');
    expect(ocorrencias[0].mensagem).toContain('sem guardar a referência');
  });

  it('detecta window.setInterval não guardado em variável', async () => {
    const src = `
      window.setInterval(() => {}, 1000);
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaVazamentoMemoria.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].tipo).toBe('setinterval-unassigned');
    expect(ocorrencias[0].mensagem).toContain('window.setInterval');
  });

  it('detecta addEventListener global sem removeEventListener em componentes React', async () => {
    const src = `
      import React, { useEffect } from 'react';
      export const MyComponent = () => {
        window.addEventListener('resize', () => {});
        return <div></div>;
      }
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaVazamentoMemoria.aplicar(src, 'src/App.tsx', { node: ast } as any);
    
    expect(ocorrencias.some(o => o.tipo === 'global-listener-no-cleanup')).toBe(true);
  });

  it('não detecta vazamento global se removeEventListener estiver presente', async () => {
    const src = `
      import React, { useEffect } from 'react';
      export const MyComponent = () => {
        useEffect(() => {
          const onResize = () => {};
          window.addEventListener('resize', onResize);
          return () => window.removeEventListener('resize', onResize);
        }, []);
        return <div></div>;
      }
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaVazamentoMemoria.aplicar(src, 'src/App.tsx', { node: ast } as any);
    
    expect(ocorrencias.some(o => o.tipo === 'global-listener-no-cleanup')).toBe(false);
  });
});
