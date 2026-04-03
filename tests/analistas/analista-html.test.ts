import { describe, expect, it } from 'vitest';

import { analistaHtml } from '@analistas/plugins/analista-html.js';

describe('analistaHtml', () => {
  it('seleciona apenas arquivos html', () => {
    expect(analistaHtml.test('index.html')).toBe(true);
    expect(analistaHtml.test('page.htm')).toBe(true);
    expect(analistaHtml.test('component.tsx')).toBe(false);
  });

  it('detecta problemas estruturais e de acessibilidade', async () => {
    const src = [
      '<html>',
      '<head>',
      '</head>',
      '<body>',
      '  <h1>Primeiro</h1>',
      '  <h3>Salto</h3>',
      '  <h1>Segundo</h1>',
      '  <a target="_blank" href="https://example.com">Docs</a>',
      '  <a>#</a>',
      '  <img src="photo.jpg">',
      '  <form>',
      '    <input>',
      '    <input type="password">',
      '  </form>',
      '  <button></button>',
      '  <table><tr><td>1</td></tr></table>',
      '  <iframe src="https://example.com/embed"></iframe>',
      '  <div onclick="run()"></div>',
      '  <script>console.log("inline")</script>',
      '  <script src="/app.js"></script>',
      '  <style>body { color: red; }</style>',
      '</body>',
      '</html>',
    ].join('\n');

    const ocorrencias = await analistaHtml.aplicar(src, 'index.html');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.some((m) => m.includes('DOCTYPE'))).toBe(true);
    expect(mensagens.some((m) => m.includes('lang'))).toBe(true);
    expect(mensagens.some((m) => m.includes('charset'))).toBe(true);
    expect(mensagens.some((m) => m.includes('viewport'))).toBe(true);
    expect(mensagens.some((m) => m.includes('<title>'))).toBe(true);
    expect(mensagens.some((m) => m.includes('target="_blank"'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Link sem href'))).toBe(true);
    expect(mensagens.some((m) => m.includes('alt'))).toBe(true);
    expect(mensagens.some((m) => m.includes('loading'))).toBe(true);
    expect(mensagens.some((m) => m.includes('width/height'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Formulário sem method'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Formulário sem action'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Input sem name'))).toBe(true);
    expect(mensagens.some((m) => m.includes('password sem autocomplete'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Input sem type'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Botão sem texto'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Tabela sem <caption>'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Iframe sem title'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Handler inline'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Cabeçalho pulado'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Múltiplos <h1>'))).toBe(true);
  });

  it('retorna null para html basico valido', async () => {
    const src = [
      '<!DOCTYPE html>',
      '<html lang="pt-BR">',
      '<head>',
      '  <meta charset="utf-8">',
      '  <meta name="viewport" content="width=device-width, initial-scale=1">',
      '  <title>Ok</title>',
      '</head>',
      '<body>',
      '  <h1>Titulo</h1>',
      '  <a href="/docs">Docs</a>',
      '  <img src="/logo.png" alt="Logo" loading="lazy" width="100" height="40">',
      '  <form method="post" action="/login">',
      '    <input type="text" name="email" aria-label="Email">',
      '    <input type="password" name="password" autocomplete="current-password">',
      '  </form>',
      '  <button aria-label="Fechar"></button>',
      '  <table aria-label="Tabela"><tr><td>1</td></tr></table>',
      '  <iframe title="Preview" src="https://example.com"></iframe>',
      '  <script src="/app.js" defer></script>',
      '</body>',
      '</html>',
    ].join('\n');

    await expect(analistaHtml.aplicar(src, 'ok.html')).resolves.toBeNull();
  });
});
