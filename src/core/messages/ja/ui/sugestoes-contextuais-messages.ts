// SPDX-License-Identifier: MIT

/**
 * @fileoverview Messages for contextual suggestions in the user interface.
 * Provides text templates with icons for feedback on project identification,
 * dependency evidence, imports, code patterns,
 * directory structure and alternative technologies.
 */

import { ICONES_ACAO, ICONES_ARQUIVO, ICONES_FEEDBACK } from '../../shared/icons.js';

export const SugestoesContextuaisMensagens = {
  arquetipoNaoIdentificado: 'Could not identify a specific archetype. Consider adding more structure to the project.',
  projetoIdentificado: (tecnologia: string | undefined, confiancaPercent: number) => `${ICONES_FEEDBACK.info} Project identified as: ${tecnologia} (confidence: ${confiancaPercent}%)`,
  evidenciaDependencia: (dependencia: string, tecnologia: string | undefined) => `${ICONES_ARQUIVO.package} Dependency ${dependencia} confirms project ${tecnologia}`,
  evidenciaImport: (valor: string, localizacao: string | undefined) => `${ICONES_ACAO.import} Import ${valor} detected in ${localizacao}`,
  evidenciaCodigo: (localizacao: string | undefined) => `${ICONES_ARQUIVO.codigo} Specific code pattern detected in ${localizacao}`,
  evidenciaEstrutura: (valor: string, tecnologia: string | undefined) => `${ICONES_ARQUIVO.diretorio} Structure ${valor} typical of ${tecnologia}`,
  tecnologiasAlternativas: (alternativas: string) => `${ICONES_ACAO.analise} Other technologies detected: ${alternativas}`,
  erroAnaliseContextual: (erro: string) => `Error in contextual 分析: ${erro}`,
  erroDuranteAnalise: 'Error during intelligent contextual analysis'
} as const;
