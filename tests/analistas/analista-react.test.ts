import { describe, expect, it } from 'vitest';

import { analistaReact } from '@analistas/plugins/analista-react.js';

describe('analistaReact', () => {
  it('seleciona arquivos JavaScript e TypeScript', () => {
    expect(analistaReact.test('App.tsx')).toBe(true);
    expect(analistaReact.test('App.jsx')).toBe(true);
    expect(analistaReact.test('styles.css')).toBe(false);
  });

  it('detecta problemas comuns em JSX', async () => {
    const src = [
      'import React from "react";',
      '',
      'export function App({ items, url }) {',
      '  const token = "123456789012345678901234567890";',
      '  const style = { color: "red", background: "white", padding: 4 };',
      '  function go() {',
      '    location.href = url;',
      '  }',
      '  return (',
      '    <section>',
      '      <a target="_blank" href="https://example.com">Docs</a>',
      '      <img src="/logo.png" />',
      '      <div dangerouslySetInnerHTML={{ __html: html }} />',
      '      <div style={{ color: "red", background: "white", padding: 4 }} />',
      '      <button onClick={() => go()}>Go</button>',
      '      {items.map((item, index) => <div>{item.name}</div>)}',
      '      {items.map((item, i) => <span key={i}>{item.id}</span>)}',
      '    </section>',
      '  );',
      '}',
      '',
      'fetch("http://api.example.com/data");',
      'axios.get("http://api.example.com/users");',
    ].join('\n');

    const ocorrencias = await analistaReact.aplicar(src, 'App.tsx');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.some((m) => m.includes('_blank'))).toBe(true);
    expect(mensagens.some((m) => m.includes('dangerouslySetInnerHTML'))).toBe(true);
    expect(mensagens.some((m) => m.includes('alt'))).toBe(true);
    expect(mensagens.some((m) => m.includes('HTTP'))).toBe(true);
    expect(mensagens.some((m) => m.includes('credencial'))).toBe(true);
    expect(mensagens.some((m) => m.includes('location.href'))).toBe(true);
    expect(mensagens.some((m) => m.includes('inline'))).toBe(true);
    expect(mensagens.some((m) => m.includes('key'))).toBe(true);
  });

  it('ignora .ts sem evidencia forte de JSX', async () => {
    const src = [
      'function identity<T>(value: T): T {',
      '  return value;',
      '}',
      '',
      'const result = identity<string>("ok");',
    ].join('\n');

    await expect(analistaReact.aplicar(src, 'types.ts')).resolves.toBeNull();
  });
});
