// SPDX-License-Identifier: MIT

/**
 * @fileoverview Diagnostic messages for the inline interfaces detector.
 * Provides text templates to suggest extracting inline types and interfaces
 * to dedicated type files, as well as detecting duplicated types.
 */

import type { TipoDuplicadoArgs } from '../../../../types/analistas/detectores.js';

export const DetectorInterfacesInlineMensagens = {
  moverTipoParaTipos: (nomeTipo: string, tiposDir = 'src/tipos') => `Move type '${nomeTipo}' to ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`}`,
  interfaceExportadaParaTipos: (nomeInterface: string, tiposDir = 'src/tipos') => `エクスポートed interface '${nomeInterface}' should be in ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`}`,
  interfaceComplexaParaTipos: (nomeInterface: string, tiposDir = 'src/tipos') => `Complex interface '${nomeInterface}' should be に移動 ${tiposDir.endsWith('/') ? tiposDir : `${tiposDir}/`}`,
  tipoDuplicado: (args: TipoDuplicadoArgs) => `Type {${args.propriedades.join(', ')}...} duplicated ${args.totalOcorrencias}x ${args.contextoDesc} - extract as '${args.nomesSugeridos}Type'`
} as const;
