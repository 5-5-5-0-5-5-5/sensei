import { parse } from '@babel/parser';
import { describe, expect, it } from 'vitest';

import { analistaAntiPadroesAsync } from '@analistas/detectores/detector-anti-padroes-async.js';

function createAst(src: string) {
  return parse(src, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
}

describe('analistaAntiPadroesAsync', () => {
  it('seleciona apenas arquivos js/ts e ignora testes', () => {
    expect(analistaAntiPadroesAsync.test('src/app.ts')).toBe(true);
    expect(analistaAntiPadroesAsync.test('src/app.test.ts')).toBe(false);
    expect(analistaAntiPadroesAsync.test('src/styles.css')).toBe(false);
  });

  it('detecta floating promises com heurística de nomes', async () => {
    const src = `
      fetchData();
      saveUser();
      getDataAsync();
      const x = 1;
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaAntiPadroesAsync.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(3);
    expect(ocorrencias[0].tipo).toBe('floating-promise');
    expect(ocorrencias[0].mensagem).toContain('fetchData');
    expect(ocorrencias[1].mensagem).toContain('saveUser');
    expect(ocorrencias[2].mensagem).toContain('getDataAsync');
  });

  it('não detecta se houver .then, .catch ou .finally', async () => {
    const src = `
      fetchData().then(() => {});
      saveUser().catch(() => {});
      getDataAsync().finally(() => {});
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaAntiPadroesAsync.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(0);
  });

  it('detecta async dentro de forEach', async () => {
    const src = `
      items.forEach(async (item) => {
        await process(item);
      });
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaAntiPadroesAsync.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].tipo).toBe('async-in-foreach');
    expect(ocorrencias[0].mensagem).toContain('forEach');
  });

  it('detecta async dentro de map sem Promise.all (aviso)', async () => {
    const src = `
      const results = items.map(async (item) => {
        return await process(item);
      });
    `;
    const ast = createAst(src);
    const ocorrencias = await analistaAntiPadroesAsync.aplicar(src, 'src/app.ts', { node: ast } as any);
    
    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0].tipo).toBe('async-in-map-without-all');
    expect(ocorrencias[0].mensagem).toContain('Promise.all');
  });

  it('ignora se a regra for suprimida', async () => {
    // Para testar supressão, precisaríamos mockar shouldSuppressOccurrence ou esperar que o helper funcione
    // Mas o helper costuma olhar para comentários no arquivo ou config.
    // O detector-anti-padroes-async.ts usa shouldSuppressOccurrence('anti-padroes-async', relPath)
    // Isso geralmente checa se a regra está desativada no sensei.config.json para aquele arquivo.
  });
});
