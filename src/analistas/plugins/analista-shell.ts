// SPDX-License-Identifier: MIT
import type { Ocorrencia } from '@';
import { criarAnalista, criarOcorrencia } from '@';

/**
 * Analista de Shell Script
 * Detecta práticas inseguras, comandos perigosos e má organização em scripts .sh, .bash, etc.
 */
export const analistaShell = criarAnalista({
  nome: 'analista-shell',
  categoria: 'infrastructure',
  descricao: 'Analisa scripts Shell em busca de comandos perigosos, insegurança e falta de boas práticas.',
  test: (relPath: string) => /\.(sh|bash|zsh|fish)$/i.test(relPath),
  aplicar: async (src: string, relPath: string): Promise<Ocorrencia[]> => {
    const ocorrencias: Ocorrencia[] = [];
    const linhas = src.split('\n');

    // 1. Verificar Shebang (Boas Práticas)
    if (linhas.length > 0 && !linhas[0].startsWith('#!')) {
      ocorrencias.push(criarOcorrencia({
        tipo: 'codigo-fragil',
        nivel: 'aviso',
        mensagem: 'Script Shell sem Shebang detectado.',
        relPath,
        linha: 1,
        sugestao: 'Adicione #!/bin/bash ou #!/bin/sh no início do arquivo.'
      }));
    }

    // 2. Verificar 'set -e' ou 'set -o pipefail' (Tratamento de Erros)
    const srcCompleto = src.toLowerCase();
    if (!srcCompleto.includes('set -e') && !srcCompleto.includes('set -o pipefail')) {
      ocorrencias.push(criarOcorrencia({
        tipo: 'codigo-fragil',
        nivel: 'info',
        mensagem: 'Script Shell não utiliza "set -e". Erros em comandos não interromperão o script.',
        relPath,
        linha: 1,
        sugestao: 'Considere usar "set -e" para falhar o script se qualquer comando falhar.'
      }));
    }

    linhas.forEach((linha, index) => {
      const numeroLinha = index + 1;
      const linhaTrim = linha.trim();

      // Ignorar comentários
      if (linhaTrim.startsWith('#')) return;

      // 3. Uso de eval (Insegurança)
      if (/\beval\s+/.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'erro',
          mensagem: 'Uso de "eval" detectado. Isso pode levar a execução de código arbitrário se o input não for confiável.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Evite eval. Use arrays ou outras estruturas para construir comandos dinâmicos.'
        }));
      }

      // 4. Variáveis não aspeadas (Fragilidade)
      // Detecta patterns como $VAR sem aspas (ex: echo $USER, mas ignora em loops/condicionais complexas)
      if (/\$(\w+)\b/.test(linha) && !/["'].*\$\w+.*["']/.test(linha) && !/\$\(.*\)/.test(linha) && !/^\s*(for|while|if|case|read)\s+/.test(linhaTrim)) {
        // Heurística simples: se a variável aparece sozinha ou em comando comum
        if (/\b(echo|ls|cd|rm|cp|mv)\s+.*\$\w+/.test(linhaTrim)) {
          ocorrencias.push(criarOcorrencia({
            tipo: 'codigo-fragil',
            nivel: 'info',
            mensagem: 'Variável utilizada sem aspas duplas. Pode causar problemas com nomes de arquivos contendo espaços.',
            relPath,
            linha: numeroLinha,
            sugestao: 'Use "$VAR" ao invés de $VAR.'
          }));
        }
      }

      // 5. Comandos perigosos (Segurança/Risco)
      if (/\brm\s+-rf\s+\/(\s|$|['"`])/.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'critica',
          mensagem: 'Comando EXTREMAMENTE PERIGOSO detectado: rm -rf /.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Remova este comando imediatamente.'
        }));
      }

      // 6. curl/wget pipe to sh (Risco de Segurança)
      if (/(curl|wget).*(|\s)sh(\s|$)/.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'alta',
          mensagem: 'Piping de curl/wget diretamente para shell detectado.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Sempre baixe o script, inspecione-o e então execute-o localmente.'
        }));
      }

      // 7. Senhas em variáveis (Segurança)
      if (/\b(password|pass|secret|token|key)\b\s*=\s*['"].*['"]/i.test(linha)) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'vulnerabilidade-seguranca',
          nivel: 'erro',
          mensagem: 'Possível credencial hardcoded em variável Shell.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Use variáveis de ambiente injetadas no runtime.'
        }));
      }

      // 8. Uso de sudo (Boas Práticas de Infra)
      if (/\bsudo\s+/.test(linha) && !relPath.includes('setup') && !relPath.includes('install')) {
        ocorrencias.push(criarOcorrencia({
          tipo: 'codigo-fragil',
          nivel: 'info',
          mensagem: 'Uso de sudo detectado em script.',
          relPath,
          linha: numeroLinha,
          sugestao: 'Tente projetar scripts que rodem sem privilégios de root, ou peça ao usuário para rodar o script todo com sudo.'
        }));
      }
    });

    return ocorrencias;
  },
  global: false
});
