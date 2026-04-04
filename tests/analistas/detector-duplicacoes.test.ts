import { parse } from '@babel/parser';
import { describe, expect, it, vi } from 'vitest';

import { analistaDuplicacoes } from '@analistas/detectores/detector-duplicacoes.js';

function createAst(src: string) {
  return parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

function createFileEntry(relPath: string, src: string) {
  const ast = createAst(src);
  return {
    relPath,
    fullCaminho: `/home/user/project/${relPath}`,
    content: src,
    ast: { node: ast } as any
  };
}

describe('analistaDuplicacoes', () => {
  it('seleciona arquivos js/ts', () => {
    expect(analistaDuplicacoes.test('src/app.ts')).toBe(true);
    expect(analistaDuplicacoes.test('src/app.jsx')).toBe(true);
    expect(analistaDuplicacoes.test('src/styles.css')).toBe(false);
  });

  it('detecta funções identificas no mesmo arquivo', async () => {
    const src = `
      function calculateTotal(price, tax) {
        const total = price + (price * tax);
        return total.toFixed(2);
      }

      function computeTotal(price, tax) {
        const total = price + (price * tax);
        return total.toFixed(2);
      }
    `;
    const ast = createAst(src);
    const contexto = {
      baseDir: '/home/user/project',
      arquivos: []
    };

    const ocorrencias = await analistaDuplicacoes.aplicar(src, 'src/app.ts', { node: ast } as any, undefined, contexto as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].tipo).toBe('codigo_duplicado');
    // Como os nomes são diferentes, cai em 'estrutural' ou 'semantica' dependendo da heurística.
    // Vamos verificar se a mensagem contém pelo menos um dos termos de similaridade.
    expect(ocorrencias[0].mensagem).toMatch(/identica|estrutural/);
  });

  it('detecta funções similares entre arquivos diferentes', async () => {
    const src1 = `
      function processUserData(u, p) {
        const auth = btoa(u + ":" + p);
        return fetch('/api/auth', { headers: { Authorization: auth } });
      }
    `;
    const src2 = `
      function authRequest(u, p) {
        const auth = btoa(u + ":" + p);
        return fetch('/api/auth', { headers: { Authorization: auth } });
      }
    `;
    
    const ast1 = createAst(src1);
    const entry2 = createFileEntry('src/auth.ts', src2);
    // Adicionando 'parent' para satisfazer a verificação 'parent' in arquivo.ast
    entry2.ast = { node: entry2.ast.node, parent: {} } as any;
    
    const contexto = {
      baseDir: '/home/user/project',
      arquivos: [entry2]
    };

    const ocorrencias = await analistaDuplicacoes.aplicar(src1, 'src/login.ts', { node: ast1 } as any, undefined, contexto as any);
    
    expect(ocorrencias.length).toBeGreaterThan(0);
    expect(ocorrencias[0].mensagem).toMatch(/similaridade|duplicação/i);
  });

  it('ignora funções muito pequenas', async () => {
    const src = `
      function a() { return 1; }
      function b() { return 1; }
    `;
    const ast = createAst(src);
    const contexto = { baseDir: '', arquivos: [] };

    const ocorrencias = await analistaDuplicacoes.aplicar(src, 'src/app.ts', { node: ast } as any, undefined, contexto as any);
    expect(ocorrencias).toHaveLength(0);
  });
});
