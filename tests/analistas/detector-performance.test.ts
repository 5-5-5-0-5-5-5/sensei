import { describe, expect, it } from 'vitest';

import { analistaDesempenho } from '@analistas/detectores/detector-performance.js';

describe('detector-performance', () => {
  it('seleciona apenas arquivos js/ts', () => {
    expect(analistaDesempenho.test('worker.ts')).toBe(true);
    expect(analistaDesempenho.test('component.jsx')).toBe(true);
    expect(analistaDesempenho.test('styles.css')).toBe(false);
  });

  it('agrega problemas de performance por impacto', () => {
    const src = [
      'import lodash from "lodash";',
      'for (const user of users) {',
      '  for (const post of posts) {',
      '    await fetchPost(post.id);',
      '    const next = { ...state, post };',
      '  }',
      '}',
      'readFileSync("file.txt");',
      'window.addEventListener("resize", onResize);',
      'items.map((item) => <div>{item.name}</div>);',
      'rows.forEach((row) => repository.find(row.id));',
      'const options = { a: 1, b: 2, c: 3 };',
      'return <Page />;',
    ].join('\n');

    const ocorrencias = analistaDesempenho.aplicar(src, 'src/App.tsx', null);

    expect(ocorrencias.length).toBeGreaterThanOrEqual(3);
    expect(
      ocorrencias.some(
        (item) =>
          item.mensagem.includes('Problemas de performance (alto)') &&
          item.mensagem.includes('inefficient-loop'),
      ),
    ).toBe(true);
    expect(
      ocorrencias.some(
        (item) => item.mensagem.includes('Problemas de performance (medio)'),
      ),
    ).toBe(true);
    expect(
      ocorrencias.some(
        (item) =>
          item.mensagem.includes('Problemas de performance (baixo)') &&
          item.mensagem.includes('missing-memoization'),
      ),
    ).toBe(true);
  });

  it('respeita supressao inline pelo nome do analista', () => {
    const src = [
      '// @sensei-disable-next-line performance',
      'readFileSync("file.txt");',
    ].join('\n');

    const ocorrencias = analistaDesempenho.aplicar(src, 'src/file.ts', null);

    expect(ocorrencias).toEqual([]);
  });

  it('reduz avisos para info em arquivos de teste', () => {
    const src = 'window.addEventListener("resize", onResize);';

    const ocorrencias = analistaDesempenho.aplicar(src, 'tests/app.test.ts', null);

    expect(ocorrencias).toHaveLength(1);
    expect(ocorrencias[0]?.nivel).toBe('info');
  });
});
