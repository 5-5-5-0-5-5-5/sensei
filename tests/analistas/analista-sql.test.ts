import { describe, expect, it } from 'vitest';

import { analistaSql } from '@analistas/plugins/analista-sql.js';

describe('analistaSql', () => {
  it('seleciona extensoes SQL', () => {
    expect(analistaSql.test('query.sql')).toBe(true);
    expect(analistaSql.test('schema.pgsql')).toBe(true);
    expect(analistaSql.test('db.sqlite')).toBe(true);
    expect(analistaSql.test('db.ts')).toBe(false);
  });

  it('detecta operacoes inseguras e problemas de manutencao', async () => {
    const src = [
      'DELETE FROM users;',
      'UPDATE accounts SET active = 0;',
      'SELECT * FROM users;',
      'password = "super-secret";',
      'CREATE TABLE users (id INT);',
      'TRUNCATE TABLE audit_logs;',
      'ALTER TABLE users ADD COLUMN name VARCHAR ',
    ].join('\n');

    const ocorrencias = await analistaSql.aplicar(src, 'migration.sql');
    const mensagens = ocorrencias.map((item) => item.mensagem);

    expect(mensagens.some((m) => m.includes('DELETE/UPDATE sem cláusula WHERE'))).toBe(true);
    expect(mensagens.some((m) => m.includes('SELECT *'))).toBe(true);
    expect(mensagens.some((m) => m.includes('credencial'))).toBe(true);
    expect(mensagens.some((m) => m.includes('IF NOT EXISTS'))).toBe(true);
    expect(mensagens.some((m) => m.includes('TRUNCATE TABLE'))).toBe(true);
    expect(mensagens.some((m) => m.includes('VARCHAR sem especificação'))).toBe(true);
  });

  it('nao acusa update com where na linha seguinte', async () => {
    const src = ['UPDATE users', 'WHERE id = 1;'].join('\n');

    await expect(analistaSql.aplicar(src, 'safe.sql')).resolves.toEqual([]);
  });
});
