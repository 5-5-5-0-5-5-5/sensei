import { describe, expect, it } from 'vitest';

import { analistaPython } from '@analistas/plugins/analista-python.js';

describe('analistaPython', () => {
  it('seleciona apenas arquivos Python', () => {
    expect(analistaPython.test('app.py')).toBe(true);
    expect(analistaPython.test('types.pyi')).toBe(true);
    expect(analistaPython.test('worker.pyx')).toBe(true);
    expect(analistaPython.test('worker.ts')).toBe(false);
  });

  it('detecta problemas comuns de seguranca e qualidade', async () => {
    const src = [
      'def process(data):',
      '    print("start")',
      '    eval(data)',
      '    exec(data)',
      '    subprocess.run("ls", shell=True)',
      '    pickle.loads(data)',
      '    yaml.load(data)',
      '    requests.get("http://api.internal.local/users")',
      '    cursor.execute(f"SELECT * FROM users WHERE id = {user_id}")',
      '    global state',
      '    return data',
      '',
      'try:',
      '    run()',
      'except:',
      '    pass',
      '',
      'except ValueError:',
      '    raise',
      '',
      'def append_item(item, items=[]):',
      '    items.append(item)',
      '',
      'for item in items:',
      '    result.append(item)',
      '',
      'for key in data:',
      '    value = data[key]',
    ].join('\n');

    const ocorrencias = await analistaPython.aplicar(src, 'src/app.py');
    const mensagens = (ocorrencias ?? []).map((item) => item.mensagem);

    expect(mensagens.some((m) => m.includes('type hints'))).toBe(true);
    expect(mensagens.some((m) => m.includes('print()'))).toBe(true);
    expect(mensagens.some((m) => m.includes('eval()'))).toBe(true);
    expect(mensagens.some((m) => m.includes('exec()'))).toBe(true);
    expect(mensagens.some((m) => m.includes('shell=True'))).toBe(true);
    expect(mensagens.some((m) => m.includes('pickle'))).toBe(true);
    expect(mensagens.some((m) => m.includes('yaml.load'))).toBe(true);
    expect(mensagens.some((m) => m.includes('HTTP'))).toBe(true);
    expect(mensagens.some((m) => m.includes('SQL'))).toBe(true);
    expect(mensagens.some((m) => m.includes('Exceção genérica'))).toBe(true);
    expect(mensagens.some((m) => m.includes('pass'))).toBe(true);
    expect(mensagens.some((m) => m.includes('raise sem contexto'))).toBe(true);
    expect(mensagens.some((m) => m.includes('global'))).toBe(true);
    expect(mensagens.some((m) => m.includes('valor padrão mutável'))).toBe(true);
    expect(mensagens.some((m) => m.includes('list comprehension'))).toBe(true);
    expect(mensagens.some((m) => m.includes('.items()'))).toBe(true);
  });

  it('ignora casos permitidos e comentarios', async () => {
    const src = [
      '# eval("ignored")',
      'def __init__(self, name):',
      '    self.name = name',
      'yaml.load(data, Loader=yaml.SafeLoader)',
      'requests.get("https://secure.example.com", verify=True)',
      'cursor.execute("SELECT * FROM users WHERE id = ?", [user_id])',
    ].join('\n');

    await expect(analistaPython.aplicar(src, 'safe.py')).resolves.toBeNull();
  });
});
