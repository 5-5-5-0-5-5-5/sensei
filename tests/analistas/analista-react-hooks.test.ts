import { describe, expect, it } from 'vitest';

import { analistaReactHooks } from '@analistas/plugins/analista-react-hooks.js';

describe('analistaReactHooks', () => {
  it('seleciona arquivos js/ts com potencial de hooks', () => {
    expect(analistaReactHooks.test('Component.tsx')).toBe(true);
    expect(analistaReactHooks.test('Component.jsx')).toBe(true);
    expect(analistaReactHooks.test('Component.css')).toBe(false);
  });

  it('detecta hooks sem dependencias e hooks dentro de condicionais', async () => {
    const src = [
      'import React, { useEffect, useMemo, useCallback, useState } from "react";',
      '',
      'export function Component({ enabled }) {',
      '  const [count] = useState(0);',
      '  useEffect(() => {',
      '    console.log(count);',
      '  });',
      '  const doubled = useMemo(() => count * 2);',
      '  const onClick = useCallback(() => count + 1);',
      '  if (enabled) {',
      '    useEffect(() => {',
      '      console.log("inside-if");',
      '    }, []);',
      '  }',
      '  return <button onClick={onClick}>{doubled}</button>;',
      '}',
    ].join('\n');

    const ocorrencias = await analistaReactHooks.aplicar(src, 'Component.tsx');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.filter((m) => m.includes('depend')).length).toBeGreaterThanOrEqual(3);
    expect(mensagens.some((m) => m.includes('condicional'))).toBe(true);
  });

  it('retorna null quando hooks estao corretos ou explicitamente anotados', async () => {
    const src = [
      'import { useEffect, useMemo, useCallback } from "react";',
      '',
      'export function Component({ value }) {',
      '  useEffect(() => {',
      '    console.log(value);',
      '  }, [value]);',
      '  const data = useMemo(() => value * 2, [value]);',
      '  const handler = useCallback(() => value + 1, [value]);',
      '  return <div>{data}{handler()}</div>;',
      '}',
    ].join('\n');

    await expect(analistaReactHooks.aplicar(src, 'Safe.tsx')).resolves.toBeNull();
  });
});
