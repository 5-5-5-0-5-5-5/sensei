import { describe, expect, it } from 'vitest';

import { analistaXml } from '@analistas/plugins/analista-xml.js';

describe('analistaXml', () => {
  it('seleciona arquivos .xml', () => {
    expect(analistaXml.test('src/config.xml')).toBe(true);
    expect(analistaXml.test('src/config.json')).toBe(false);
  });

  it('detecta falta de prólogo XML', async () => {
    const src = '<root></root>';
    const ocorrencias = await analistaXml.aplicar(src, 'src/config.xml');
    expect(ocorrencias).not.toBeNull();
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('declaração'))).toBe(true);
  });

  it('detecta estrutura XML inválida', async () => {
    const src = '<?xml version="1.0"?><root><tag></root>';
    const ocorrencias = await analistaXml.aplicar(src, 'src/config.xml');
    expect(ocorrencias).not.toBeNull();
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('estrutura'))).toBe(true);
  });

  it('detecta namespaces não declarados', async () => {
    const src = '<?xml version="1.0"?><root xmlns:p="urn:test"><p:tag></p:tag><m:tag></m:tag></root>';
    const ocorrencias = await analistaXml.aplicar(src, 'src/config.xml');
    // 'm:' should be flagged
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('m'))).toBe(true);
  });

  it('detecta problemas de segurança (DOCTYPE)', async () => {
    const src = `<?xml version="1.0"?>
      <!DOCTYPE root [
        <!ENTITY xxe SYSTEM "file:///etc/passwd">
      ]>
      <root>&xxe;</root>
    `;
    const ocorrencias = await analistaXml.aplicar(src, 'src/config.xml');
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('doctype'))).toBe(true);
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('entidade'))).toBe(true);
  });

  it('detecta Billion Laughs (expansão grande de entidade)', async () => {
    const src = `<?xml version="1.0"?>
      <!DOCTYPE root [
        <!ENTITY lol "lol">
        <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
      ]>
      <root>&lol1;</root>
    `;
    const ocorrencias = await analistaXml.aplicar(src, 'src/config.xml');
    expect(ocorrencias?.some(o => o.mensagem.toLowerCase().includes('expansão'))).toBe(true);
  });
});
