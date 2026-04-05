// SPDX-License-Identifier: MIT

/**
 * @fileoverview Reporter padrão que converte eventos de relatório em ocorrências.
 * Mapeia códigos de evento (como ARQ_PADRAO, ARQ_VIOLACAO, etc.) para mensagens
 * formatadas usando os templates de mensagens dos detectores correspondentes.
 */

import { DetectorArquiteturaMensagens } from '@core/messages/pt/analistas/detector-arquitetura-messages.js';

import type { Ocorrencia, ReportEvent } from '@';
import { criarOcorrencia } from '@';

export function createDefaultReporter() {
  return (event: ReportEvent): Ocorrencia => {
    const {
      code,
      tipo,
      nivel = 'info',
      mensagem,
      data,
      relPath,
      linha = 1,
      coluna,
      origem,
    } = event;

    // Se a mensagem já veio formatada, apenas encaminha
    if (mensagem && typeof mensagem === 'string') {
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem,
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    // Mapeamentos mínimos (incrementais) por code
    if (code === 'ARQ_PADRAO') {
      const padrao = String((data?.padraoIdentificado as unknown) ?? '');
      const confianca = Number((data?.confianca as unknown) ?? 0);
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem: DetectorArquiteturaMensagens.padraoArquitetural(
          padrao,
          confianca,
        ),
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    if (code === 'ARQ_CARACTERISTICAS') {
      const items = Array.isArray(data?.caracteristicas)
        ? (data?.caracteristicas as unknown as string[])
        : [];
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem: DetectorArquiteturaMensagens.caracteristicas(items),
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    if (code === 'ARQ_VIOLACAO') {
      const violacao = String((data?.violacao as unknown) ?? '');
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem: DetectorArquiteturaMensagens.violacao(violacao),
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    if (code === 'ARQ_METRICAS') {
      const acoplamento = Number((data?.acoplamento as unknown) ?? 0);
      const coesao = Number((data?.coesao as unknown) ?? 0);
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem: DetectorArquiteturaMensagens.metricas(acoplamento, coesao),
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    if (code === 'ARQ_ERRO') {
      return criarOcorrencia({
        tipo,
        nivel,
        mensagem: DetectorArquiteturaMensagens.erroAnalisarArquitetura(data?.erro),
        relPath,
        linha,
        coluna,
        origem,
      });
    }

    // Fallback: mantém sinal útil mesmo sem template
    const fallbackMsg = code
      ? `${code}${data ? ` ${JSON.stringify(data)}` : ''}`
      : data
        ? JSON.stringify(data)
        : 'Ocorrência reportada';

    return criarOcorrencia({
      tipo,
      nivel,
      mensagem: fallbackMsg,
      relPath,
      linha,
      coluna,
      origem,
    });
  };
}

