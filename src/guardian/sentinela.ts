// SPDX-License-Identifier: MIT

import { config } from '@core/config/config.js';
import { getMessages } from '@core/messages/index.js';
import { ensureDir } from '@shared/helpers/fs.js';
import { normalizePath } from '@shared/helpers/path.js';
import micromatch from 'micromatch';

import type { FileEntry } from '@';
import { GuardianError, IntegridadeStatus } from '@';

import { carregarBaseline, salvarBaseline } from './baseline.js';
import { LINHA_BASE_CAMINHO } from './constantes.js';
import { diffSnapshots, verificarErros } from './diff.js';
import { gerarSnapshotDoConteudo } from './hash.js';

const { log } = getMessages();

type Snapshot = Record<string, string>;
function construirSnapshot(fileEntries: FileEntry[]): Snapshot {
  const snapshot: Snapshot = {};
  for (const {
    relPath,
    content
  } of fileEntries) {
    if (typeof content !== 'string' || !content.trim()) continue;
    try {
      snapshot[relPath] = gerarSnapshotDoConteudo(content);
    } catch (err) {
      log.aviso(`x Falha ao gerar hash de ${relPath}: ${typeof err === 'object' && err && 'message' in err ? (err as {
        message: string;
      }).message : String(err)}`);
    }
  }
  return snapshot;
}
export async function scanSystemIntegrity(fileEntries: FileEntry[], options?: {
  justDiff?: boolean;
  suppressLogs?: boolean;
}): Promise<{
  status: IntegridadeStatus;
  timestamp: string;
  detalhes?: string[];
  baselineModificado?: boolean;
}> {
  const agora = new Date().toISOString();
  await ensureDir(LINHA_BASE_CAMINHO);
  let baselineAnterior: Snapshot | null = null;
  try {
    baselineAnterior = await carregarBaseline();
  } catch (err) {
    log.aviso(`⚠️ Baseline inválido ou corrompido: ${typeof err === 'object' && err && 'message' in err ? (err as {
      message: string;
    }).message : String(err)}`);
  }

  // Filtra entradas conforme padrões ignorados específicos do Guardian
  const ignorados = config.INCLUDE_EXCLUDE_RULES && config.INCLUDE_EXCLUDE_RULES.globalExcludeGlob || [];
  const filtrados = fileEntries.filter(f => {
    const rel = normalizePath(f.relPath);
    return !micromatch.isMatch(rel, ignorados);
  });
  if (config.DEV_MODE) {
    const removidos = fileEntries.length - filtrados.length;
    log.info(`⚙️ Guardian filtro aplicado: ${filtrados.length} arquivos considerados (removidos ${removidos}).`);
  }
  // Usa import dinâmico para alinhar com mocks de teste (vi.mock/vi.doMock)
  const {
    gerarSnapshotDoConteudo: gerar
  } = await import('./hash.js');
  const snapshotAtual: Snapshot = {};
  for (const {
    relPath,
    content
  } of filtrados) {
    if (typeof content !== 'string' || !content.trim()) continue;
    try {
      snapshotAtual[relPath] = gerar(content);
    } catch (err) {
      log.aviso(`\u001Fx Falha ao gerar hash de ${relPath}: ${typeof err === 'object' && err && 'message' in err ? (err as {
        message: string;
      }).message : String(err)}`);
    }
  }
  if (!baselineAnterior) {
    if (options?.justDiff) {
      // Em modo justDiff, ausência de baseline implica sem alterações reportáveis
      return {
        status: IntegridadeStatus.Ok,
        timestamp: agora,
        detalhes: []
      };
    }
    if (!options?.suppressLogs) {
      log.info(`🆕 Guardian: baseline inicial criado.`);
    }
    await salvarBaseline(snapshotAtual);
    return {
      status: IntegridadeStatus.Criado,
      timestamp: agora
    };
  }
  if (process.argv.includes('--aceitar')) {
    if (!options?.suppressLogs) {
      log.info(`✅ Guardian: baseline aceito manualmente (--aceitar).`);
    }
    await salvarBaseline(snapshotAtual);
    return {
      status: IntegridadeStatus.Aceito,
      timestamp: agora
    };
  }
  const diffs = diffSnapshots(baselineAnterior, snapshotAtual);
  const erros = verificarErros(diffs);
  if (options?.justDiff) {
    return {
      status: erros.length ? IntegridadeStatus.AlteracoesDetectadas : IntegridadeStatus.Ok,
      timestamp: agora,
      detalhes: erros
    };
  }
  if (erros.length) {
    // Converter strings para GuardianErrorDetails
    const errorDetails: import('@').GuardianErrorDetails[] = erros.map(erro => ({
      tipo: 'integridade',
      mensagem: erro
    }));
    throw new GuardianError(errorDetails);
  }
  return {
    status: IntegridadeStatus.Ok,
    timestamp: agora
  };
}
export async function acceptNewBaseline(fileEntries: FileEntry[]): Promise<void> {
  const ignorados: string[] = [];
  // Preferir configuração dinâmica quando disponível
  const ignoradosDyn = config.INCLUDE_EXCLUDE_RULES && config.INCLUDE_EXCLUDE_RULES.globalExcludeGlob || ignorados;
  const filtrados = fileEntries.filter(f => {
    const rel = normalizePath(f.relPath);
    return !micromatch.isMatch(rel, ignoradosDyn);
  });
  const snapshotAtual = construirSnapshot(filtrados);
  await ensureDir(LINHA_BASE_CAMINHO);
  await salvarBaseline(snapshotAtual);
}