import { describe, expect, it } from 'vitest';

import { analistaTailwind } from '@analistas/plugins/analista-tailwind.js';

describe('analistaTailwind', () => {
  it('seleciona extensoes suportadas', () => {
    expect(analistaTailwind.test('App.tsx')).toBe(true);
    expect(analistaTailwind.test('index.html')).toBe(true);
    expect(analistaTailwind.test('styles.css')).toBe(false);
  });

  it('detecta conflitos, duplicidades e classes arbitrarias perigosas', async () => {
    const src = [
      'export function App() {',
      '  return (',
      '    <div',
      '      className="flex block bg-red-500 bg-blue-500 p-2 p-4 p-4 text-red-500! bg-[url(javascript:alert(1))] unknown-[weird]"',
      '    >',
      '      <span className={enabled ? "sm:w-4 w-4" : "md:w-8 w-8"}>A</span>',
      '    </div>',
      '  );',
      '}',
    ].join('\n');

    const ocorrencias = await analistaTailwind.aplicar(src, 'App.tsx');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.some((m) => m.includes('conflito'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Classe repetida'))).toBe(true);
    expect(mensagens.some((m) => m.includes('variantes'))).toBe(true);
    expect(mensagens.some((m) => m.includes('javascript'))).toBe(true);
    expect(mensagens.some((m) => m.includes('valor arbitrário'))).toBe(true);
    expect(mensagens.some((m) => m.includes('important'))).toBe(true);
  });

  it('retorna null quando nao encontra tokens tailwind', async () => {
    const src = '<div class="custom-card primary"></div>';
    await expect(analistaTailwind.aplicar(src, 'index.html')).resolves.toBeNull();
  });
});
