import { describe, expect, it } from 'vitest';

import { analistaXml } from '@analistas/plugins/analista-xml.js';
import { XmlMensagens } from '@core/messages/pt/core/plugin-messages.js';

describe('analistaXml', () => {
  it('ignora arquivos que nao sao xml', () => {
    expect(analistaXml.test('src/index.ts')).toBe(false);
    expect(analistaXml.test('config/app.xml')).toBe(true);
  });

  it('detecta prolog ausente, estrutura invalida e namespace nao declarado', async () => {
    const src = [
      '<root>',
      '  <item:child>',
      '</root>',
    ].join('\n');

    const ocorrencias = await analistaXml.aplicar(src, 'broken.xml');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens).toContain(XmlMensagens.xmlPrologAusente);
    expect(mensagens).toContain(XmlMensagens.invalidXmlStructure);
    expect(mensagens).toContain(XmlMensagens.namespaceUndeclared('item'));
  });

  it('detecta doctype externo, entidades perigosas, xinclude e cdata em atributo', async () => {
    const src = [
      '<?xml version="1.0"?>',
      '<!DOCTYPE root SYSTEM "file:///etc/passwd">',
      '<!ENTITY % ext SYSTEM "ftp://example.com/ext.dtd">',
      `<!ENTITY laughs "${'&a;'.repeat(60)}">`,
      '<root attr="<![CDATA[value]]>">',
      '  <xi:include href="remote.xml" />',
      '</root>',
    ].join('\n');

    const ocorrencias = await analistaXml.aplicar(src, 'security.xml');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens).toContain(XmlMensagens.doctypeDetectado);
    expect(mensagens).toContain(XmlMensagens.doctypeExternoDetectado);
    expect(mensagens).toContain(XmlMensagens.entidadeParametroDetectada);
    expect(mensagens).toContain(XmlMensagens.largeEntityExpansion);
    expect(mensagens).toContain(XmlMensagens.xincludeDetectado);
  });

  it('retorna null para xml simples e valido', async () => {
    const src = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<root xmlns:ns="https://example.com/ns">',
      '  <ns:item />',
      '</root>',
    ].join('\n');

    await expect(analistaXml.aplicar(src, 'ok.xml')).resolves.toBeNull();
  });
});
