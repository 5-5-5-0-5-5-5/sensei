// SPDX-License-Identifier: MIT
// @sensei-disable tipo-literal-inline-complexo
// Justificativa: tipos locais para arquétipos personalizados
/**
 * Sistema de Arquétipos Personalizados do Sensei
 *
 * Permite que usuários criem arquétipos personalizados para seus projetos,
 * mantendo compatibilidade com arquétipos oficiais e oferecendo sugestões
 * de melhores práticas baseadas na personalização do usuário.
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';

import { ARQUETIPOS } from '@analistas/estrategistas/arquetipos-defs.js';
// NOTA: parseFileAST ainda não foi implementado no módulo de parsing
// import { parseFileAST } from '@core/parsing/parser.js';
import { getMessages } from '@core/messages/index.js';
import { SENSEI_ARQUIVOS } from '@core/registry/paths.js';
import { lerEstado, salvarEstado } from '@shared/persistence/persistencia.js';

import type { ArquetipoEstruturaDef, ArquetipoPersonalizado } from '@';

const { log, ArquetiposExtraMensagens } = getMessages();

// Nome do arquivo legado (para compatibilidade)
const ARQUETIPO_PERSONALIZADO_FILENAME = 'sensei.repo.arquetipo.json';

/**
 * Carrega o arquétipo personalizado do projeto atual
 * Tenta primeiro o novo caminho (.sensei/estrutura.arquetipo.json),
 * depois o legado (raiz/sensei.repo.arquetipo.json)
 */

export async function carregarArquetipoPersonalizado(baseDir: string = process.cwd()): Promise<ArquetipoPersonalizado | null> {
  // Tentar novo caminho primeiro
  const novoCaminho = SENSEI_ARQUIVOS.ESTRUTURA_ARQUETIPO;
  const caminhoLegado = path.join(baseDir, ARQUETIPO_PERSONALIZADO_FILENAME);
  try {
    // Tenta novo caminho
    const arquetipo = await lerEstado<ArquetipoPersonalizado | null>(novoCaminho, null);
    if (arquetipo && arquetipo.nome && arquetipo.arquetipoOficial) {
      return arquetipo;
    }

    // Se não encontrou no novo caminho, tenta o legado
    const arquetipoLegado = await lerEstado<ArquetipoPersonalizado | null>(caminhoLegado, null);

    // Validação básica
    if (!arquetipoLegado || !arquetipoLegado.nome || !arquetipoLegado.arquetipoOficial) {
      // Reduz ruído em testes e quando não estiver em modo verbose
      const isTest = (process.env.VITEST ?? '') !== '';
      const isVerbose = (log as unknown as {
        verbose?: boolean;
      }).verbose || false;
      if (!isTest && isVerbose) {
        log.aviso(ArquetiposExtraMensagens.naoEncontrado.replace('{novo}', novoCaminho).replace('{legado}', caminhoLegado));
      }
      return null;
    }
    return arquetipoLegado;
  } catch {
    // Arquivo não existe ou é inválido - isso é normal
    return null;
  }
}
/**
 * Salva o arquétipo personalizado do projeto atual
 * Usa o novo caminho (.sensei/estrutura.arquetipo.json)
 */
export async function salvarArquetipoPersonalizado(arquetipo: Omit<ArquetipoPersonalizado, 'metadata'>, _baseDir: string = process.cwd()): Promise<void> {
  const arquetipoCompleto: ArquetipoPersonalizado = {
    ...arquetipo,
    metadata: {
      criadoEm: new Date().toISOString(),
      versao: '1.0.0',
      notasUsuario: undefined
    }
  };

  // Usar novo caminho centralizado
  const novoCaminho = SENSEI_ARQUIVOS.ESTRUTURA_ARQUETIPO;

  // Garantir que o diretório .sensei existe
  const senseiDir = path.dirname(novoCaminho);
  try {
    await fs.mkdir(senseiDir, {
      recursive: true
    });
  } catch {
    // Diretório já existe
  }
  await salvarEstado(novoCaminho, arquetipoCompleto);
  log.sucesso(ArquetiposExtraMensagens.salvo.replace('{caminho}', novoCaminho));
}

/**
 * Verifica se existe um arquétipo personalizado
 * Verifica tanto o novo caminho quanto o legado
 */

export async function existeArquetipoPersonalizado(baseDir: string = process.cwd()): Promise<boolean> {
  // Verificar novo caminho primeiro
  try {
    await fs.access(SENSEI_ARQUIVOS.ESTRUTURA_ARQUETIPO);
    return true;
  } catch {
    // Tentar caminho legado
    const arquivoArquetipo = path.join(baseDir, ARQUETIPO_PERSONALIZADO_FILENAME);
    try {
      await fs.access(arquivoArquetipo);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Obtém o arquétipo oficial base para um arquétipo personalizado
 */

export function obterArquetipoOficial(arquetipoPersonalizado: ArquetipoPersonalizado): ArquetipoEstruturaDef | null {
  return ARQUETIPOS.find(arq => (arq as unknown as ArquetipoEstruturaDef).nome === arquetipoPersonalizado.arquetipoOficial) as ArquetipoEstruturaDef | undefined || null;
}

/**
 * Gera sugestões de criação de arquétipo personalizado quando projeto é desconhecido
 */

export function gerarSugestaoArquetipoPersonalizado(projetoDesconhecido: {
  nome: string;
  estruturaDetectada: string[];
  arquivosRaiz: string[];
}): string {
  const sugestao = `
${ArquetiposExtraMensagens.projetoPersonalizado.replace('{nome}', projetoDesconhecido.nome)}

${ArquetiposExtraMensagens.descricaoPersonalizado}

${ArquetiposExtraMensagens.estruturaDetectada}
${projetoDesconhecido.estruturaDetectada.map(dir => `  • ${dir}`).join('\n')}

${ArquetiposExtraMensagens.arquivosRaiz}
${projetoDesconhecido.arquivosRaiz.slice(0, 5).map(file => `  • ${file}`).join('\n')}
${projetoDesconhecido.arquivosRaiz.length > 5 ? `  • ... e mais ${projetoDesconhecido.arquivosRaiz.length - 5} arquivos` : ''}

${ArquetiposExtraMensagens.dicaCriar}
${ArquetiposExtraMensagens.comandoCriar}

${ArquetiposExtraMensagens.explicacaoCriar}
`;
  return sugestao;
}

/**
 * Cria um template de arquétipo personalizado baseado na estrutura atual do projeto
 */

export function criarTemplateArquetipoPersonalizado(nomeProjeto: string, estruturaDetectada: string[], arquivosRaiz: string[], arquetipoSugerido: string = 'generico'): Omit<ArquetipoPersonalizado, 'metadata'> {
  // Usa o arquétipo sugerido pelo sistema de detecção inteligente
  // Se não foi fornecido, tenta inferir de forma mais rigorosa
  let arquetipoOficial = arquetipoSugerido;
  if (arquetipoOficial === 'generico' || !arquetipoOficial) {
    // Heurística mais rigorosa para evitar falsos positivos

    // CLI: precisa ter bin/ E (cli/ OU commands/) E package.json com bin
    const temBin = estruturaDetectada.some(dir => dir === 'bin' || dir.startsWith('bin/'));
    const temCli = estruturaDetectada.some(dir => dir.includes('/cli') || dir === 'cli');
    const temCommands = estruturaDetectada.some(dir => dir.includes('/commands') || dir === 'commands');
    if (temBin && (temCli || temCommands)) {
      arquetipoOficial = 'cli-modular';
    }
    // Bot: precisa ter src/bot/ E (events/ OU scenes/) - muito específico
    else if (estruturaDetectada.some(dir => dir === 'src/bot' || dir.startsWith('src/bot/')) && estruturaDetectada.some(dir => dir.includes('events') || dir.includes('scenes'))) {
      arquetipoOficial = 'bot';
    }
    // API: precisa ter controllers/ E routes/
    else if (estruturaDetectada.some(dir => dir.includes('controllers')) && estruturaDetectada.some(dir => dir.includes('routes'))) {
      arquetipoOficial = 'api-rest-express';
    }
    // Fullstack: precisa ter pages/ E api/ (ambos)
    else if (estruturaDetectada.some(dir => dir.includes('pages')) && estruturaDetectada.some(dir => dir.includes('api'))) {
      arquetipoOficial = 'fullstack';
    }
    // Fallback: lib-tsc se tem src/ organizado mas nenhum dos padrões acima
    else if (estruturaDetectada.some(dir => dir === 'src' || dir.startsWith('src/'))) {
      arquetipoOficial = 'lib-tsc';
    }
  }

  // Identifica diretórios principais (não muito profundos)
  const diretoriosPrincipais = estruturaDetectada.filter(dir => !dir.includes('/') || dir.split('/').length <= 2).filter(dir => !dir.startsWith('node_modules') && !dir.startsWith('.git'));

  // Identifica arquivos-chave na raiz
  const arquivosChave = arquivosRaiz.filter(file => ['package.json', 'tsconfig.json', 'README.md', '.env.example'].includes(file) || file.endsWith('.ts') || file.endsWith('.js')).slice(0, 5);
  return {
    nome: nomeProjeto,
    descricao: `Projeto personalizado: ${nomeProjeto}`,
    arquetipoOficial,
    estruturaPersonalizada: {
      diretorios: diretoriosPrincipais,
      arquivosChave,
      padroesNomenclatura: {
        // Padrões comuns baseados na estrutura detectada
        ...(estruturaDetectada.some(d => d.includes('components')) && {
          components: '*-component.*'
        }),
        ...(estruturaDetectada.some(d => d.includes('utils')) && {
          utils: '*-util.*'
        }),
        ...(estruturaDetectada.some(d => d.includes('test')) && {
          tests: '*.test.*'
        })
      }
    },
    melhoresPraticas: {
      recomendado: ['src/', 'tests/', 'docs/', 'README.md', '.env.example'],
      evitar: ['temp/', 'cache/', '*.log'],
      notas: ['Mantenha código fonte organizado em src/', 'Separe testes em pasta dedicada', 'Documente APIs e funcionalidades importantes']
    }
  };
}

/**
 * Valida um arquétipo personalizado
 */

export function validarArquetipoPersonalizado(arquetipo: ArquetipoPersonalizado): {
  valido: boolean;
  erros: string[];
} {
  const erros: string[] = [];
  if (!arquetipo.nome || typeof arquetipo.nome !== 'string') {
    erros.push(ArquetiposExtraMensagens.validacao.nomeObrigatorio);
  }
  if (!arquetipo.arquetipoOficial || typeof arquetipo.arquetipoOficial !== 'string') {
    erros.push(ArquetiposExtraMensagens.validacao.arquetipoObrigatorio);
  } else {
    // Verifica se o arquétipo oficial existe
    const arquetipoOficial = ARQUETIPOS.find((arq: ArquetipoEstruturaDef) => arq.nome === arquetipo.arquetipoOficial) as ArquetipoEstruturaDef | undefined;
    if (!arquetipoOficial) {
      erros.push(ArquetiposExtraMensagens.validacao.arquetipoNaoEncontrado.replace('{arquetipo}', arquetipo.arquetipoOficial).replace('{disponiveis}', ARQUETIPOS.map(a => (a as unknown as ArquetipoEstruturaDef).nome).join(', ')));
    }
  }
  if (!arquetipo.estruturaPersonalizada) {
    erros.push(ArquetiposExtraMensagens.validacao.estruturaObrigatoria);
  } else {
    if (!Array.isArray(arquetipo.estruturaPersonalizada.diretorios)) {
      erros.push(ArquetiposExtraMensagens.validacao.diretoriosArray);
    }
    if (!Array.isArray(arquetipo.estruturaPersonalizada.arquivosChave)) {
      erros.push(ArquetiposExtraMensagens.validacao.arquivosChaveArray);
    }
  }
  return {
    valido: erros.length === 0,
    erros
  };
}

/**
 * Lista todos os arquétipos oficiais disponíveis
 */

export function listarArquetiposOficiais(): ArquetipoEstruturaDef[] {
  return ARQUETIPOS;
}

/**
 * Integra arquétipo personalizado com oficial para sugestões
 */

export function integrarArquetipos(personalizado: ArquetipoPersonalizado, oficial: ArquetipoEstruturaDef): ArquetipoEstruturaDef {
  return {
    ...oficial,
    nome: personalizado.nome,
    descricao: personalizado.descricao || oficial.descricao,
    requiredDirs: personalizado.estruturaPersonalizada.diretorios,
    optionalDirs: oficial.optionalDirs,
    rootFilesAllowed: personalizado.estruturaPersonalizada.arquivosChave,
    // Mantém outras propriedades do oficial como base
    forbiddenDirs: oficial.forbiddenDirs,
    dependencyHints: oficial.dependencyHints,
    filePresencePatterns: oficial.filePresencePatterns,
    pesoBase: oficial.pesoBase
  };
}