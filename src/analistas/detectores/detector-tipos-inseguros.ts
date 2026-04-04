// SPDX-License-Identifier: MIT
/**
 * Detector de tipos inseguros (any e unknown) - Versão Inteligente
 * Identifica uso de any e unknown com análise contextual avançada
 *
 * Estratégia:
 * - Analisa contexto para determinar legitimidade do uso
 * - Sugere alternativas específicas quando possível
 * - Explica variantes e possibilidades quando análise é incerta
 * - Sempre recomenda revisão manual para casos complexos
 */

import { categorizarUnknown, extractVariableName, isAnyInGenericFunction, isInStringOrComment, isLegacyOrVendorFile, isTypeScriptContext, isUnknownInGenericContext } from '@analistas/corrections/type-safety/context-analyzer.js';
import type { NodePath } from '@babel/traverse';
import type { Node } from '@babel/types';
import { config } from '@core/config/config.js';
import { shouldSuppressOccurrence } from '@shared/helpers/rule-config.js';

import type { Analista, Ocorrencia } from '@';

const ANALISTA: Analista = {
  nome: 'detector-tipos-inseguros',
  categoria: 'code-quality',
  descricao: 'Detecta uso de any e unknown que podem ser substituídos por tipos específicos',
  test: (relPath: string) => {
    return relPath.endsWith('.ts') || relPath.endsWith('.tsx');
  },
  aplicar: async (srcParam: string, relPath: string, _ast: NodePath<Node> | null, fullCaminho?: string): Promise<Ocorrencia[]> => {
    const ocorrencias: Ocorrencia[] = [];

    // IMPORTANTE: Normalização de line endings para compatibilidade Windows/Linux
    // Sem isso, arquivos com \r\n causam split('\n') incorreto (retorna 1 linha)
    // Ver: docs/reports/DEBUG-TYPE-SAFETY-DETECTOR-2025-11-03.md
    const src = srcParam.replace(/\r\n/g, '\n');

    // Ignorar arquivos de teste quando permitido na configuração
    const isTestArquivo = (p: string) => {
      const rel = p.replace(/\\/g, '/').toLowerCase();
      return /(^|\/)tests?(\/|\.)/.test(rel) || /__tests__/.test(rel) || /\.(test|spec)\.(ts|tsx|js|jsx)$/.test(rel);
    };
    const allowAnyInTests = Boolean((config as unknown as {
      testPadroes?: {
        allowAnyType?: boolean;
      };
    }).testPadroes?.allowAnyType);
    if (allowAnyInTests && isTestArquivo(fullCaminho || relPath)) {
      return ocorrencias;
    }

    // Verificar se é arquivo que deve ser ignorado
    if (isLegacyOrVendorFile(fullCaminho || relPath)) {
      return ocorrencias;
    }

    // Detectar uso de any
    const anyPadrao = /:\s*(any|NonNullable<any>|Partial<any>|Omit<any,\s*[^>]+>|Pick<any,\s*[^>]+>)\b/g;
    let anyMatch: RegExpMatchArray | null;
    while ((anyMatch = anyPadrao.exec(src)) !== null) {
      const position = anyMatch.index || 0;

      // Pular se estiver em string ou comentário
      if (isInStringOrComment(src, position)) {
        continue;
      }

      // Pular se estiver em contexto TypeScript específico (type assertions)
      if (isTypeScriptContext(src, position)) {
        continue;
      }

      // Pular se any está em função genérica apropriada
      if (isAnyInGenericFunction(src, position)) {
        continue;
      }

      // Extrair nome da variável e contexto
      const varNome = extractVariableName(anyMatch, src);
      const linha = src.substring(0, position).split('\n').length;
      const lineContext = src.split('\n')[linha - 1]?.trim() || '';

      // Análise contextual para any
      let mensagem = '';
      let sugestao = '';

      // Detectar padrões específicos
      if (anyMatch[1] !== 'any') {
        mensagem = `Uso de utilitário de tipo com 'any' em '${varNome}' mascara perda de type safety`;
        sugestao = `Substitua por: ${anyMatch[1].replace('any', 'TipoEspecifico')}`;
      } else if (/catch\s*\(\s*\w+\s*:\s*any\s*\)/.test(lineContext)) {
        mensagem = varNome ? `'any' em catch block '${varNome}' - TypeScript recomenda 'unknown'` : "'any' em catch block - TypeScript recomenda 'unknown'";
        sugestao = 'Substitua por: catch (error: unknown) { ... }';
      } else if (/callback\s*:\s*\([^)]*:\s*any/.test(lineContext)) {
        mensagem = varNome ? `Callback '${varNome}' com parâmetro 'any' - tipagem fraca` : "Callback com parâmetro 'any' - tipagem fraca";
        sugestao = 'Defina interface do callback: (param: TipoEspecifico) => void';
      } else if (/event\s*:\s*any|e\s*:\s*any/.test(lineContext)) {
        mensagem = varNome ? `Event handler '${varNome}' com 'any' - pode usar Event types` : "Event handler com 'any' - pode usar Event types";
        sugestao = 'Use tipos do DOM: MouseEvent, KeyboardEvent, etc ou React.SyntheticEvent<T>';
      } else if (/\[\s*key\s*:\s*string\s*\]\s*:\s*any/.test(lineContext)) {
        mensagem = 'Índice extensível com any - muito permissivo';
        sugestao = 'Use: [key: string]: unknown (mais seguro) ou defina union type';
      } else if (/Record<[^,]+,\s*any>/.test(lineContext)) {
        mensagem = varNome ? `Record com 'any' em '${varNome}' - sem type safety` : "Record com 'any' - sem type safety";
        sugestao = 'Use Record<string, unknown> ou interface específica';
      } else if (/Array<any>/.test(lineContext) || /any\[\]/.test(lineContext)) {
        mensagem = varNome ? `Array de 'any' em '${varNome}' - perde tipagem` : "Array de 'any' - perde tipagem";
        sugestao = 'Especifique tipo do array: string[], number[], CustomType[], etc';
      } else {
        // Caso genérico
        mensagem = varNome ? `Tipo 'any' em '${varNome}' desabilita verificação de tipos` : "Tipo 'any' desabilita verificação de tipos";
        sugestao = 'Analise uso da variável e defina tipo específico ou use unknown com type guards';
      }

      // Adicionar contexto adicional baseado no arquivo
      let contextoAdicional = '';
      if (fullCaminho?.includes('tipos/')) {
        contextoAdicional = ' | ⚠️  Arquivo de tipos - impacta toda base de código';
      } else if (fullCaminho?.includes('core/') || fullCaminho?.includes('shared/')) {
        contextoAdicional = ' | ⚠️  Módulo core/shared - usado por muitos componentes';
      }
      const mensagemCompleta = `${mensagem} | 💡 ${sugestao}${contextoAdicional} | 🔍 Revisão manual obrigatória`;

      // Verifica se regra está suprimida para este arquivo
      if (shouldSuppressOccurrence('tipo-inseguro-any', relPath)) {
        continue;
      }
      ocorrencias.push({
        tipo: 'tipo-inseguro-any',
        nivel: 'aviso',
        mensagem: mensagemCompleta,
        relPath,
        linha,
        contexto: lineContext
      });
    }

  /* -------------------------- DETECTAR Object e {} (tipos fracos) -------------------------- */
    const tiposFracosPadrao = /:\s*(Object|\{\})(?![a-zA-Z0-9_$])/g;
    let matchFraco: RegExpMatchArray | null;
    while ((matchFraco = tiposFracosPadrao.exec(src)) !== null) {
      const position = matchFraco.index || 0;
      if (isInStringOrComment(src, position)) continue;

      const linha = src.substring(0, position).split('\n').length;
      const lineContext = src.split('\n')[linha - 1]?.trim() || '';
      const tipo = matchFraco[1];

      const mensagem = `Tipo '${tipo}' é muito permissivo e pouco útil para type safety`;
      const sugestao = tipo === 'Object' ? 'Use Record<string, unknown> ou interface específica' : 'Use Record<string, never> para objetos vazios ou interface específica';

      if (shouldSuppressOccurrence('tipo-permissivo-object', relPath)) continue;

      ocorrencias.push({
        tipo: 'tipo-permissivo-object',
        nivel: 'aviso',
        mensagem: `${mensagem} | 💡 ${sugestao}`,
        relPath,
        linha,
        contexto: lineContext
      });
    }

  /* -------------------------- DETECTAR TYPE ASSERTIONS (as any) -------------------------- */
    const asAnyPadrao = /\b(as\s+any)\b/g;
    let asAnyMatch: RegExpMatchArray | null;
    while ((asAnyMatch = asAnyPadrao.exec(src)) !== null) {
      const position = asAnyMatch.index || 0;

      // Pular se estiver em string ou comentário
      if (isInStringOrComment(src, position)) {
        continue;
      }
      const linha = src.substring(0, position).split('\n').length;
      const lineContext = src.split('\n')[linha - 1]?.trim() || '';

      // Extrair contexto da expressão
      const after = src.substring(position, Math.min(src.length, position + 50));
      const mensagem = "Type assertion 'as any' desabilita verificação de tipos completamente";
      let sugestao = '';

      // Detectar padrões comuns de type assertion
      if (/\)\s*as\s+any/.test(lineContext)) {
        sugestao = 'Evite cast de retorno de função - tipar função corretamente ou usar unknown com type guard';
      } else if (/\.\w+\s+as\s+any/.test(lineContext)) {
        sugestao = 'Evite cast de propriedade - definir tipo correto no objeto pai';
      } else if (/\bas\s+any\s*\)/.test(after)) {
        sugestao = 'Type assertion em parâmetro - definir tipo correto na assinatura da função chamada';
      } else {
        sugestao = 'Substitua por tipo específico ou use unknown com validação runtime';
      }
      const mensagemCompleta = `${mensagem} | 💡 ${sugestao} | 🚨 CRÍTICO: Type safety completamente desabilitado | 🔍 Revisão manual obrigatória`;

      // Verifica se regra está suprimida para este arquivo
      if (shouldSuppressOccurrence('tipo-inseguro-any-assertion', relPath)) {
        continue;
      }
      ocorrencias.push({
        tipo: 'tipo-inseguro-any-assertion',
        nivel: 'erro',
        // Mais severo que declaração de tipo
        mensagem: mensagemCompleta,
        relPath,
        linha,
        contexto: lineContext
      });
    }

  /* -------------------------- DETECTAR ANGLE BRACKET CASTING (<any>) -------------------------- */
    const angleBracketPadrao = /<any>/g;
    let angleBracketMatch: RegExpMatchArray | null;
    while ((angleBracketMatch = angleBracketPadrao.exec(src)) !== null) {
      const position = angleBracketMatch.index || 0;

      // Pular se estiver em string ou comentário
      if (isInStringOrComment(src, position)) {
        continue;
      }
      const linha = src.substring(0, position).split('\n').length;
      const lineContext = src.split('\n')[linha - 1]?.trim() || '';
      const mensagemCompleta = "Type casting '<any>' (sintaxe legada) desabilita type safety | 💡 Use sintaxe 'as' moderna e tipo específico | 🚨 CRÍTICO: Migrar para sintaxe moderna e tipo correto | 🔍 Revisão manual obrigatória";

      // Verifica se regra está suprimida para este arquivo
      if (shouldSuppressOccurrence('tipo-inseguro-any-cast', relPath)) {
        continue;
      }
      ocorrencias.push({
        tipo: 'tipo-inseguro-any-cast',
        nivel: 'erro',
        mensagem: mensagemCompleta,
        relPath,
        linha,
        contexto: lineContext
      });
    }

    // Detectar uso de unknown
    const unknownPadrao = /:\s*unknown\b/g;
    let unknownMatch: RegExpMatchArray | null;
    while ((unknownMatch = unknownPadrao.exec(src)) !== null) {
      const position = unknownMatch.index || 0;

      // Pular se estiver em string ou comentário
      if (isInStringOrComment(src, position)) {
        continue;
      }

      // Pular se unknown está em contexto genérico apropriado (validação básica)
      if (isUnknownInGenericContext(src, position)) {
        continue;
      }

      // Análise contextual inteligente
      const linha = src.substring(0, position).split('\n').length;
      const lineContext = src.split('\n')[linha - 1]?.trim() || '';
      const categorizacao = categorizarUnknown(src, fullCaminho || relPath, lineContext);

      // Extrair nome da variável
      const varNome = extractVariableName(unknownMatch, src);

      // Construir mensagem baseada na categorização
      let mensagem = '';
      let nivel: 'info' | 'aviso' | 'erro' = 'info';
      if (categorizacao.categoria === 'legitimo') {
        // Legítimo com alta confiança (>=95%) - PULAR completamente
        if (categorizacao.confianca >= 95) {
          continue;
        }

        // Legítimo com confiança moderada (85-94%) - info apenas
        mensagem = varNome ? `Tipo 'unknown' em '${varNome}': ${categorizacao.motivo}` : `Tipo 'unknown': ${categorizacao.motivo}`;
        nivel = 'info';

        // Se tem sugestão, adicionar
        if (categorizacao.sugestao) {
          mensagem += ` | 💡 ${categorizacao.sugestao}`;
        }
      } else if (categorizacao.categoria === 'melhoravel') {
        // Melhorável - aviso com sugestão
        nivel = 'aviso';
        mensagem = varNome ? `Tipo 'unknown' em '${varNome}' pode ser melhorado (${categorizacao.confianca}% confiança)` : `Tipo 'unknown' pode ser melhorado (${categorizacao.confianca}% confiança)`;
        mensagem += ` | ${categorizacao.motivo}`;
        if (categorizacao.sugestao) {
          mensagem += ` | 💡 ${categorizacao.sugestao}`;
        } else {
          mensagem += ` | 💡 Revisar uso para inferir tipo mais específico`;
        }
        mensagem += ` | ⚠️  Revisão manual recomendada`;
      } else {
        // Corrigir - erro que deve ser tratado
        nivel = 'erro';
        mensagem = varNome ? `Tipo 'unknown' em '${varNome}' deve ser corrigido (${categorizacao.confianca}% confiança)` : `Tipo 'unknown' deve ser corrigido (${categorizacao.confianca}% confiança)`;
        mensagem += ` | ${categorizacao.motivo}`;
        if (categorizacao.sugestao) {
          mensagem += ` | ✏️  ${categorizacao.sugestao}`;
        }
        mensagem += ` | 🔍 Revisão manual obrigatória`;
      }

      // Verifica se regra está suprimida para este arquivo
      if (shouldSuppressOccurrence('tipo-inseguro-unknown', relPath)) {
        continue;
      }
      ocorrencias.push({
        tipo: 'tipo-inseguro-unknown',
        nivel,
        mensagem,
        relPath,
        linha,
        contexto: lineContext
      });
    }
    return ocorrencias;
  }
};
export default ANALISTA;
