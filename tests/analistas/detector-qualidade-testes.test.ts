import { describe, expect, it } from 'vitest';

import { analistaQualidadeTestes } from '@analistas/plugins/detector-qualidade-testes.js';

describe('analistaQualidadeTestes', () => {
  it('seleciona arquivos js/ts e ignora outros', () => {
    expect(analistaQualidadeTestes.test('src/app.ts')).toBe(true);
    expect(analistaQualidadeTestes.test('src/app.test.ts')).toBe(true);
    expect(analistaQualidadeTestes.test('src/styles.css')).toBe(false);
  });

  describe('análise de arquivos de teste', () => {
    it('detecta testes com timeout excessivo', async () => {
      const src = `
        it('should do something', () => {
          expect(1).toBe(1);
        }, 60000);
      `;
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.test.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('slow-test');
    });

    it('detecta testes que podem ser flaky (Date.now)', async () => {
      const src = `
        it('checks date', () => {
          const now = Date.now();
          expect(now).toBeDefined();
        });
      `;
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.test.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('flaky');
    });

    it('detecta test smells (.only / .skip)', async () => {
      const src = `
        it.only('should run exclusively', () => {});
        it.skip('should skip', () => {});
      `;
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.test.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('test-smells');
    });

    it('detecta falta de organização (sem describe)', async () => {
      const src = "it('direct test', () => {});";
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.test.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('test-smells');
    });

    it('detecta arquivo de teste vazio', async () => {
      const src = "// Just a comment";
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.test.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('missing-tests');
    });
  });

  describe('análise de código fonte', () => {
    it('sugere testes para arquivos com lógica complexa', async () => {
      const src = `
        export const complexFunc = (x) => {
          if (x > 0) {
            for (let i = 0; i < x; i++) {
              console.log(i);
            }
          }
        }
      `;
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/logic.ts', null);
      expect(ocorrencias.length).toBeGreaterThan(0);
      expect(ocorrencias[0].mensagem).toContain('missing-tests');
    });

    it('ignora arquivos de configuração', async () => {
      const src = "export const config = { key: 'value' };";
      const ocorrencias = await analistaQualidadeTestes.aplicar(src, 'src/app.config.ts', null);
      expect(ocorrencias).toHaveLength(0);
    });
  });
});
