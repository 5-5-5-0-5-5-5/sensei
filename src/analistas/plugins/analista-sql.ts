// SPDX-License-Identifier: MIT
import type { Ocorrencia } from '@';
import { criarAnalista, criarOcorrencia } from '@';

/**
 * Analista de SQL
 * Detecta práticas inseguras, problemas de performance e má organização em arquivos SQL.
 */
export const analistaSql = criarAnalista({
  nome: 'analista-sql',
  categoria: 'database',
  descricao: 'Analisa arquivos SQL em busca de injeções, performance ruim e comandos perigosos.',
  test: (relPath: string) => /\.(sql|pgsql|mysql|sqlite)$/i.test(relPath),
  aplicar: async (src: string, relPath: string): Promise<Ocorrencia[]> => {
    const ocorrencias: Ocorrencia[] = [];
    const linhas = src.split('\n');

    linhas.forEach((linha, index) => {
      const numeroLinha = index + 1;
      const linhaTrim = linha.trim().toLowerCase();

      // 1. DELETE/UPDATE sem WHERE (Crítico)
      if ((linhaTrim.startsWith('delete ') || linhaTrim.startsWith('update ')) &&
          !linhaTrim.includes('where') &&
          !linha.includes('--') && !linha.includes('/*')) {
        // Verificar se o WHERE está na próxima linha (heurística simples)
        const proximaLinha = linhas[index + 1]?.trim().toLowerCase() || '';
        if (!proximaLinha.includes('where')) {
          ocorrencias.push(criarOcorrencia({
            tipo: 'vulnerabilidade-seguranca',
            nivel: 'erro',
            mensagem: 'Comando DELETE/UPDATE sem cláusula WHERE detectado. Isso pode apagar ou alterar todos os dados da tabela.',
            relPath,
            linha: numeroLinha,
            sugestao: 'Sempre utilize a cláusula WHERE para restringir o impacto do comando.'
          }));
        }
      }

      // 2. SELECT * (Performance/Manutenibilidade)
      if (/\bselect\s+\*\s+from\b/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'problema-performance',
          nivel: 'aviso',
          mensagem: 'Uso de "SELECT *" detectado. Isso aumenta o tráfego de rede e pode quebrar se a estrutura da tabela mudar.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Liste explicitamente as colunas necessárias.'
        }));
      }

      // 3. Senhas ou segredos em scripts (Segurança)
      if (/\b(password|senha|secret|key|token|credential)\b\s*[:=]\s*['"].*['"]/i.test(linha) ||
          /identified\s+by\s+['"].*['"]/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'erro',
          mensagem: 'Possível credencial ou segredo hardcoded em script SQL.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Utilize variáveis de ambiente ou sistemas de gerenciamento de segredos.'
        }));
      }

      // 4. Injeção de SQL via strings concatenadas (se for template ou arquivo de migração dinâmico)
      if (/\s\+\s*['"`].*['"`]/.test(linha) && /select|insert|update|delete/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'sql-injection',
          nivel: 'erro',
          mensagem: 'Possível injeção de SQL detectada via concatenação de strings.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Utilize consultas parametrizadas ou placeholders.'
        }));
      }

      // 5. Tabelas temporárias ou globais sem DROP prévio (Boas Práticas)
      if (/create\s+(table|procedure|view)\s+\w+/i.test(linha) && !/if\s+not\s+exists/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'codigo-fragil',
          nivel: 'info',
          mensagem: 'Criação de objeto sem "IF NOT EXISTS". Pode causar erro se o script for reexecutado.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Utilize "CREATE TABLE IF NOT EXISTS ..." para maior idempotência.'
        }));
      }

      // 6. TRUNCATE TABLE (Risco)
      if (/\btruncate\s+table\b/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'aviso',
          mensagem: 'Uso de TRUNCATE TABLE detectado. Este comando não pode ser revertido por ROLLBACK em alguns bancos e limpa toda a tabela.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Certifique-se de que a limpeza total é intencional e prefira DELETE com WHERE se precisar de reversibilidade.'
        }));
      }

      // 7. Uso de tipos obsoletos (ex: VARCHAR sem tamanho, TEXT para colunas pequenas)
      if (/\bvarchar\b\s*(\(|\s|$)/i.test(linha) && !/\bvarchar\(\d+\)/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'codigo-fragil',
          nivel: 'info',
          mensagem: 'VARCHAR sem especificação de tamanho máximo.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Defina um tamanho máximo apropriado para otimizar o armazenamento.'
        }));
      }
    });

    return ocorrencias;
  },
  global: false
});
