// SPDX-License-Identifier: MIT
// Analistas de melhorias e correções automáticas (unificado)
// Resolve analistas de correção automática dinamicamente para compatibilidade com múltiplas formas de export
// analistaFantasma not exported from js-ts/fantasma; that module provides detectarFantasmas used by zeladores
// Analistas especializados complementares
import { analistaAntiPadroesAsync } from '@analistas/detectores/detector-anti-padroes-async.js';
import { analistaArquitetura } from '@analistas/detectores/detector-arquitetura.js';
import { analistaCodigoFragil } from '@analistas/detectores/detector-codigo-fragil.js';
// Novos analistas refinados
import { analistaConstrucoesSintaticas } from '@analistas/detectores/detector-construcoes-sintaticas.js';
import * as detectorDependenciasMod from '@analistas/detectores/detector-dependencias.js';
import { analistaDuplicacoes } from '@analistas/detectores/detector-duplicacoes.js';
import * as detectorEstruturaMod from '@analistas/detectores/detector-estrutura.js';
import { detectorInterfacesInline } from '@analistas/detectores/detector-interfaces-inline.js';
import { analistaSeguranca } from '@analistas/detectores/detector-seguranca.js';
import { detectorTiposInseguros } from '@analistas/detectores/detector-tipos-inseguros.js';
import { analistaVazamentoMemoria } from '@analistas/detectores/detector-vazamentos-memoria.js';
// Analistas contextuais inteligentes
import { analistaSugestoesContextuais } from '@analistas/estrategistas/sugestoes-contextuais.js';
import { analistaComandosCli } from '@analistas/js-ts/analista-comandos-cli.js';
import { analistaFuncoesLongas } from '@analistas/js-ts/analista-funcoes-longas.js';
import { analistaPadroesUso } from '@analistas/js-ts/analista-padroes-uso.js';
import { analistaTodoComentarios } from '@analistas/js-ts/analista-todo-comments.js';
// Plugins opcionais (movidos para @analistas/plugins/)
import { analistaDocumentacao } from '@analistas/plugins/detector-documentacao.js';
import { detectorMarkdown } from '@analistas/plugins/detector-markdown.js';
import { comSupressaoInline } from '@shared/helpers/analista-wrapper.js';

import type { Analista, EntradaRegistry, InfoAnalista, ModuloAnalista, Tecnica } from '@';

import { discoverAnalistasPlugins } from './autodiscovery.js';

let analistaCorrecaoAutomatica: EntradaRegistry = undefined;
try {
  const mod = await import('@analistas/corrections/analista-pontuacao.js');
  // conservatively treat dynamic module shapes as unknown, avoid `any`
  const dynamicMod = mod as ModuloAnalista;
  analistaCorrecaoAutomatica = dynamicMod.analistaCorrecaoAutomatica ?? dynamicMod.analistas?.[0] ?? dynamicMod.default as EntradaRegistry ?? undefined;
} catch {
  // leave undefined - registry will tolerate undefined entries
}
const pluginsAutodiscovered = await discoverAnalistasPlugins();

// Registro central de analistas. Futuro: lazy loading, filtros por categoria.
const detectorDependencias = (detectorDependenciasMod as ModuloAnalista).detectorDependencias ?? (detectorDependenciasMod as ModuloAnalista).default ?? detectorDependenciasMod;
const detectorEstrutura = (detectorEstruturaMod as ModuloAnalista).detectorEstrutura ?? (detectorEstruturaMod as ModuloAnalista).default ?? detectorEstruturaMod;
export const registroAnalistas: (Analista | Tecnica)[] = [
// Analistas existentes
comSupressaoInline(detectorDependencias as unknown as Analista) as Tecnica, comSupressaoInline(detectorEstrutura as unknown as Analista) as Tecnica, comSupressaoInline(analistaFuncoesLongas as Analista), comSupressaoInline(analistaPadroesUso as unknown as Analista) as Tecnica, comSupressaoInline(analistaComandosCli as unknown as Analista) as Tecnica, comSupressaoInline(analistaTodoComentarios as unknown as Analista) as Tecnica,
// Novos analistas refinados
comSupressaoInline(analistaConstrucoesSintaticas), comSupressaoInline(analistaCodigoFragil), comSupressaoInline(analistaDuplicacoes), comSupressaoInline(analistaArquitetura),
// Analistas especializados complementares
// Analistas especializados complementares
comSupressaoInline(analistaAntiPadroesAsync as unknown as Analista), comSupressaoInline(analistaVazamentoMemoria as unknown as Analista), comSupressaoInline(analistaSeguranca), comSupressaoInline(analistaDocumentacao), comSupressaoInline(detectorMarkdown as unknown as Analista), comSupressaoInline(detectorTiposInseguros as unknown as Analista), comSupressaoInline(detectorInterfacesInline as unknown as Analista),
// Plugins autodiscovered em src/analistas/plugins/
...pluginsAutodiscovered.map(p => comSupressaoInline(p as unknown as Analista) as Tecnica),
// Analistas contextuais inteligentes
analistaSugestoesContextuais,
// Analistas de melhorias e correções automáticas
// If analistaCorrecaoAutomatica couldn't be resolved, skip the entry
...(analistaCorrecaoAutomatica ? [analistaCorrecaoAutomatica] : [])];

/**
 * Lista todos os analistas registrados no sistema
 * Retorna metadados básicos para exibição (CLI, Relatórios)
 */
export function listarAnalistas(): InfoAnalista[] {
  return registroAnalistas.map(a => ({
    nome: (a as Analista).nome || 'desconhecido',
    categoria: (a as Analista).categoria || 'n/d',
    descricao: (a as Analista).descricao || ''
  }));
}
