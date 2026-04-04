import { describe, expect, it } from 'vitest';

import { analistaCssInJs } from '@analistas/plugins/analista-css-in-js.js';

describe('analistaCssInJs', () => {
  it('seleciona arquivos js/ts e ignora outros', () => {
    expect(analistaCssInJs.test('src/app.tsx')).toBe(true);
    expect(analistaCssInJs.test('src/styles.css')).toBe(false);
  });

  it('detecta styled-components', async () => {
    const src = `
      import styled from 'styled-components';
      const Button = styled.button\`
        color: red;
      \`;
    `;
    const ocorrencias = await analistaCssInJs.aplicar(src, 'src/App.tsx');
    expect(ocorrencias).not.toBeNull();
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('styled-components'))).toBe(true);
  });

  it('detecta styled-jsx', async () => {
    const src = `
      export default () => (
        <div>
          <style jsx>{\`
            p { color: red; }
          \`}</style>
        </div>
      )
    `;
    const ocorrencias = await analistaCssInJs.aplicar(src, 'src/App.tsx');
    expect(ocorrencias).not.toBeNull();
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('styled-jsx'))).toBe(true);
  });

  it('detecta !important em CSS-in-JS', async () => {
    const src = `
      const Box = styled.div\`
        display: block !important;
      \`;
    `;
    const ocorrencias = await analistaCssInJs.aplicar(src, 'src/App.tsx');
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('!important'))).toBe(true);
  });

  it('detecta URLs HTTP inseguras', async () => {
    const src = `
      const Bg = styled.div\`
        background: url("http://example.com/image.png");
      \`;
    `;
    const ocorrencias = await analistaCssInJs.aplicar(src, 'src/App.tsx');
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('http'))).toBe(true);
  });

  it('retorna null se nenhum padrão for encontrado', async () => {
    const src = 'const x = 1;';
    const ocorrencias = await analistaCssInJs.aplicar(src, 'src/App.tsx');
    expect(ocorrencias).toBeNull();
  });
});
