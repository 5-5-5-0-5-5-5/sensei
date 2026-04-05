import { beforeAll, describe, expect, it, vi } from 'vitest';

import { CssMensagens } from '@core/messages/pt/core/plugin-messages.js';

vi.mock('postcss-sass', () => ({
  default: {},
}));

vi.mock('postcss-scss', () => ({
  default: {},
}));

describe('analistaCss', () => {
  let analistaCss: typeof import('@analistas/plugins/analista-css.js').analistaCss;

  beforeAll(async () => {
    ({ analistaCss } = await import('@analistas/plugins/analista-css.js'));
  });

  it('seleciona apenas extensoes css/scss/sass', () => {
    expect(analistaCss.test('styles.css')).toBe(true);
    expect(analistaCss.test('styles.scss')).toBe(true);
    expect(analistaCss.test('styles.sass')).toBe(true);
    expect(analistaCss.test('styles.ts')).toBe(false);
  });

  it('detecta propriedades duplicadas, !important, import/url inseguros e seletores repetidos', async () => {
    const src = [
      '@import "http://cdn.example.com/base.css";',
      '.btn {',
      '  color: red;',
      '  color: blue;',
      '  margin: 10px !important;',
      '  background-image: url("http://example.com/bg.png");',
      '}',
      '.card { padding: 8px; margin: 4px; color: red; }',
      '#hero { padding: 8px; margin: 4px; color: red; }',
    ].join('\n');

    const ocorrencias = await analistaCss.aplicar(src, 'styles.css');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens).toContain(CssMensagens.httpImport);
    expect(mensagens).toContain(CssMensagens.importantUsage);
    expect(mensagens).toContain(CssMensagens.httpUrl);
    expect(mensagens.some((msg) => msg.includes('Propriedade duplicada (color)'))).toBe(true);
    expect(mensagens.some((msg) => msg.includes('Regras CSS idênticas'))).toBe(true);
    expect(mensagens.some((msg) => msg.includes('Seletor por id (#hero)'))).toBe(true);
  });

  it('detecta propriedade invalida, hack css, regra vazia e seletor malformado', async () => {
    const src = [
      '.broken {',
      '  colr: red;',
      '  width: expression(alert(1));',
      '}',
      '.empty {}',
      '.bad[selector] { color: red; }',
    ].join('\n');

    const ocorrencias = await analistaCss.aplicar(src, 'broken.css');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens).toContain(CssMensagens.invalidProperty('colr'));
    expect(mensagens).toContain(CssMensagens.cssHackDetected('IE expression'));
    expect(mensagens).toContain(CssMensagens.emptyRule);
    expect(mensagens).toContain(CssMensagens.malformedSelector('.bad[selector]'));
  });

  it('ignora duplicatas intencionais em @font-face e em custom properties', async () => {
    const src = [
      '@font-face {',
      '  font-family: "Demo";',
      '  src: url("demo.woff2") format("woff2");',
      '  src: url("demo.woff") format("woff");',
      '}',
      '.theme {',
      '  --BrandColor: #fff;',
      '  --brandColor: #000;',
      '}',
    ].join('\n');

    await expect(analistaCss.aplicar(src, 'theme.scss')).resolves.toBeNull();
  });

  it('faz fallback heuristico quando o parser nao consegue montar AST', async () => {
    const src = [
      '.broken {',
      '  color: red',
      '  color: red',
      '  background: url(http://insecure.example.com)',
      '  color: blue',
    ].join('\n');

    const ocorrencias = await analistaCss.aplicar(src, 'broken.sass');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.some((msg) => msg.includes('erro detectado') || msg.includes('Possível erro'))).toBe(true);
    expect(mensagens).toContain(CssMensagens.httpUrl);
  });
});
