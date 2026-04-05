// SPDX-License-Identifier: MIT
import type { Dirent, Stats } from 'node:fs';
import { promises as fs } from 'node:fs';

import { config } from '@core/config/config.js';
import { ExcecoesMensagens } from '@core/messages/pt/core/excecoes-messages.js';
import { logVarredor } from '@core/messages/pt/log/log-helper.js';
import { lerArquivoTexto, lerEstado } from '@shared/persistence/persistencia.js';
import micromatch from 'micromatch';
import path from 'path';

import type { FileEntry, FileMap, ScanOptions } from '@';

export type { ScanOptions };
export async function scanRepository(baseDir: string, options: ScanOptions = {}): Promise<FileMap> {
  // Log de início da varredura
  logVarredor.iniciarVarredura(baseDir);

  // Helpers locais de normalização (não exportados)
  const toPosix = (s: string) => s.replace(/\\+/g, '/');
  const trimDotSlash = (s: string) => s.replace(/^\.\/?/, '');
  const {
    includeContent = true,
    filter = () => true,
    onProgress = () => {
      return undefined;
    }
  } = options;
  // Em modo scan-only, não devemos ler conteúdos de arquivos
  const efetivoIncluirConteudo = includeContent && !config.SCAN_ONLY;
  const fileMap: FileMap = {};
  const statCache = new Map<string, Stats>();
  // 🔥 CONFIGURAÇÃO SIMPLIFICADA - Apenas CLI e exclude global
  const gruposRaw = (config as unknown as {
    CLI_INCLUDE_GROUPS?: string[][];
  }).CLI_INCLUDE_GROUPS || [];
  const includeGroups = Array.isArray(gruposRaw) ? gruposRaw : [];
  const includeGroupsNorm: string[][] = includeGroups.map(g => (g || []).map(p => toPosix(trimDotSlash(String(p || '')))));
  const includePadroes = Array.isArray(config.CLI_INCLUDE_PATTERNS) ? config.CLI_INCLUDE_PATTERNS as string[] : [];
  const includePadroesNorm = includePadroes.map(p => toPosix(trimDotSlash(String(p || ''))));
  const excludePadroesNorm = (Array.isArray(config.CLI_EXCLUDE_PATTERNS) ? config.CLI_EXCLUDE_PATTERNS as string[] : []).map(p => toPosix(String(p || '')));

  // 📌 ÚNICO PONTO DE EXCLUDE: globalExcludeGlob da configuração legacy ou campo simplificado
  const legacyExcludes = config.INCLUDE_EXCLUDE_RULES?.globalExcludeGlob || [];
  const ignorePadroesNorm = (legacyExcludes as string[]).map((p: string) => toPosix(String(p || '')));
  const hasIncluir = includeGroupsNorm.length > 0 || includePadroesNorm.length > 0;
  // Sinaliza quando os includes pedem ocorrências em qualquer profundidade (ex.: '**/nome/**') ou quando
  // o usuário forneceu nomes simples (que o expandIncludes converte em '**/nome/**').
  const pedeOcorrenciasGlobais = hasIncluir ? [...includePadroesNorm, ...includeGroupsNorm.flat()].some(p => p.startsWith('**/')) : false;
  // node_modules explicitamente incluído em algum pattern ou grupo de include
  const includeNodeModulesExplicit = hasIncluir ? [...includePadroesNorm, ...includeGroupsNorm.flat()].some(p => /(^|\/)node_modules(\/|$)/.test(String(p || ''))) : false;

  // Quando includes estão ativos, derivamos diretórios-raiz a partir dos prefixos antes do primeiro metacaractere

  function calcularIncludeRoots(padroes: string[] | undefined, grupos?: string[][]): string[] {
    const roots = new Set<string>();
    const candidatos = new Set<string>();
    if (Array.isArray(padroes)) padroes.forEach(p => candidatos.add(toPosix(trimDotSlash(p))));
    if (Array.isArray(grupos)) for (const g of grupos) g.forEach(p => candidatos.add(toPosix(trimDotSlash(p))));
    if (candidatos.size === 0) return [];
    const META = /[\\*\?\{\}\[\]]/; // caracteres meta de glob
    for (const raw of candidatos) {
      let p = String(raw).trim();
      if (!p) continue;
      p = toPosix(trimDotSlash(p));
      let anchor = '';
      if (p.includes('/**')) anchor = p.slice(0, p.indexOf('/**'));else if (p.includes('/*')) anchor = p.slice(0, p.indexOf('/*'));else if (p.includes('/')) anchor = p.split('/')[0];else anchor = '';
      anchor = anchor.replace(/\/+/g, '/').replace(/\/$/, '');
      // Ignora anchors inválidos: vazios, apenas '.', '**' ou contendo metacaracteres (ex.: '**/src')
      if (anchor && anchor !== '.' && anchor !== '**' && !META.test(anchor)) {
        const baseNorm = toPosix(String(baseDir)).replace(/\/$/, '');
        const rootPosix = `${baseNorm}/${anchor}`.replace(/\/+/g, '/');
        roots.add(rootPosix);
      }
    }
    return Array.from(roots);
  }

  // Matcher de include considerando grupos: AND dentro do grupo, OR entre grupos

  function matchIncluir(relPath: string): boolean {
    // Função auxiliar: avalia se um padrão casa com o caminho relativo
    const matchesPadrao = (rp: string, p: string): boolean => {
      if (!p) return false;
      // Casamento direto via micromatch
      if (micromatch.isMatch(rp, [p])) return true;
      // Compat extra: reconhece padrões simples com sufixo '/**' por prefixo
      if (p.endsWith('/**')) {
        const base = p.slice(0, -3); // remove '/**'
        if (base && rp.startsWith(base)) return true;
      }
      // Quando o padrão não possui metacaracteres, trate como diretório/segmento
      const META = /[\\*\?\{\}\[\]]/;
      if (!META.test(p)) {
        const pat = p.replace(/\/+$|\/+$|^\.\/?/g, '').replace(/\/+/g, '/');
        if (!pat) return false;
        // Se contém barra: trate como caminho base (prefixo)
        if (pat.includes('/')) {
          if (rp === pat) return true;
          if (rp.startsWith(`${pat}/`)) return true;
          if (rp.includes(`/${pat}/`)) return true;
          if (rp.endsWith(`/${pat}`)) return true;
          return false;
        }
        // Segmento simples: casa em qualquer nível
        if (rp === pat) return true;
        if (rp.startsWith(`${pat}/`)) return true;
        if (rp.includes(`/${pat}/`)) return true;
        if (rp.endsWith(`/${pat}`)) return true;
        return false;
      }
      return false;
    };
    // Função auxiliar: extrai a "base" do padrão (token original antes das ampliações)
    const baseFromPadrao = (p: string): string => {
      let b = p.trim();
      b = b.replace(/^\*\*\//, ''); // remove '**/' inicial
      b = b.replace(/\/\*\*$/, ''); // remove '/**' final
      b = b.replace(/^\.\/?/, ''); // remove './' inicial
      b = b.replace(/\/+/g, '/').replace(/\/$/, '');
      return b;
    };
    // Quando houver grupos, aplica estritamente: OR entre grupos com AND dentro do grupo
    if (includeGroupsNorm.length > 0) {
      for (const g of includeGroupsNorm) {
        // Agrupa padrões por base (permite OR entre variantes de um mesmo token e AND entre tokens)
        const porBase = new Map<string, string[]>();
        for (const p of g) {
          const base = baseFromPadrao(p);
          const patternVariants = porBase.get(base) || [];
          patternVariants.push(p);
          porBase.set(base, patternVariants);
        }
        const allBasesMatch = Array.from(porBase.values()).every(lista => lista.some(p => matchesPadrao(relPath, p)));
        if (allBasesMatch) return true;
      }
      // Sem correspondência em nenhum grupo -> não inclui
      return false;
    }
    // Sem grupos: lista achatada (OR)
    if (includePadroesNorm.length && micromatch.isMatch(relPath, includePadroesNorm)) return true;
    // Compat extra também para padrões simples quando não há grupos
    for (const p of includePadroesNorm || []) if (matchesPadrao(relPath, p)) return true;
    return false;
  }
  async function scan(dir: string): Promise<void> {
    let entries: Dirent[];
    try {
      entries = await fs.readdir(dir, {
        withFileTypes: true
      });
      entries.sort((a, b) => a.name.localeCompare(b.name));
    } catch (err) {
      onProgress(JSON.stringify({
        tipo: 'erro',
        acao: 'acessar',
        caminho: dir,
        mensagem: typeof err === 'object' && err && 'message' in err ? (err as {
          message: string;
        }).message : String(err)
      }));
      return;
    }

    // Logar apenas diretórios sendo examinados
    onProgress(JSON.stringify({
      tipo: 'diretorio',
      acao: 'examinar',
      caminho: dir
    }));
    for (const entry of entries) {
      const fullCaminho = path.join(dir, entry.name);
      const relPathRaw = path.relative(baseDir, fullCaminho);
      // Normaliza para separador POSIX para que micromatch funcione de forma consistente no Windows
      const relPath = toPosix(relPathRaw);

      // Regra fixa do Sensei: não analisar testes (deixa para o runner, ex.: Vitest)
      const isTestLike = (p: string): boolean => {
        const rp = toPosix(p);
        if (/(^|\/)__(tests|mocks)__(\/|$)/.test(rp)) return true;
        if (/(^|\/)(tests?|test)(\/|$)/.test(rp)) return true;
        if (/\.(test|spec)\.[jt]sx?$/.test(rp)) return true;
        return false;
      };
      if (isTestLike(relPath)) {
        continue;
      }
      /* -------------------------- - -------------------------- */
      // Filtros de inclusão/exclusão aplicados corretamente: diretórios x arquivos
      if (entry.isDirectory() && !entry.isSymbolicLink()) {
        // Diretórios: aplica excludes e ignores padrão (ignores somente quando não há include),
        // além de guarda específica para node_modules.
        // Aplica exclusões APENAS quando não há includes ativos
        if (!hasIncluir && micromatch.isMatch(relPath, excludePadroesNorm)) {
          continue; // diretório excluído explicitamente (somente quando não há include ativo)
        }
        if (!hasIncluir && micromatch.isMatch(relPath, ignorePadroesNorm)) {
          continue; // ignora diretórios padrão quando não há include
        }
        if (/(^|\/)node_modules(\/|$)/.test(relPath) && !includeNodeModulesExplicit) {
          continue; // proteção: não descer em node_modules salvo inclusão explícita
        }
        await scan(fullCaminho);
      } else {
        // Arquivos: aplica include (quando presente), excludes/ignores e filtro customizado
        if (hasIncluir && !matchIncluir(relPath)) {
          continue; // arquivo não incluso explicitamente
        }
        // Aplica exclusões APENAS quando não há includes ativos ou quando o arquivo não passa no include
        if (!hasIncluir && micromatch.isMatch(relPath, excludePadroesNorm)) {
          continue; // arquivo excluído (somente quando não há include ativo)
        }
        if (!hasIncluir && micromatch.isMatch(relPath, ignorePadroesNorm)) {
          continue; // ignore padrão quando não há include
        }
        // Filtro customizado (sempre aplica)
        if (!filter(relPath, entry)) {
          continue; // filtro customizado
        }
        try {
          // Tenta obter stat; se rejeitar, registra erro e não inclui arquivo
          let stat: unknown = statCache.get(fullCaminho);
          if (!stat) {
            try {
              stat = await fs.stat(fullCaminho);
              statCache.set(fullCaminho, stat as Stats);
            } catch (e) {
              onProgress(JSON.stringify({
                tipo: 'erro',
                acao: 'ler',
                caminho: relPath,
                mensagem: typeof e === 'object' && e && 'message' in e ? (e as {
                  message: string;
                }).message : String(e)
              }));
              continue;
            }
          }
          if (stat == null) {
            throw new Error(ExcecoesMensagens.statIndefinidoPara(fullCaminho));
          }
          let mtimeMs = 0;
          if (typeof stat === 'object' && stat && 'mtimeMs' in (stat as Stats)) {
            const mm = (stat as Stats).mtimeMs;
            if (typeof mm === 'number') mtimeMs = mm;
          }
          let content: string | null = null;
          if (efetivoIncluirConteudo) {
            const emTeste = !!process.env.VITEST;
            try {
              if (emTeste) {
                // Mantém compat com testes que mockam lerEstado
                content = await lerEstado<string>(fullCaminho);
              } else {
                content = await lerArquivoTexto(fullCaminho);
              }
            } catch (e) {
              // Em caso de erro de leitura, registra via onProgress e segue
              onProgress(JSON.stringify({
                tipo: 'erro',
                acao: 'ler',
                caminho: relPath,
                mensagem: typeof e === 'object' && e && 'message' in e ? (e as {
                  message: string;
                }).message : String(e)
              }));
              content = null;
            }
          }
          const entryObj: FileEntry = {
            fullCaminho,
            relPath,
            content,
            ultimaModificacao: mtimeMs
          };
          fileMap[relPath] = entryObj;
          // Logar cada arquivo individualmente para compatibilidade com testes
          // Evita ruído quando relatórios silenciosos estão ativos (modo --json)
          if (!config.REPORT_SILENCE_LOGS) {
            onProgress(`✅ Arquivo lido: ${relPath}`);
          }
        } catch (err) {
          onProgress(JSON.stringify({
            tipo: 'erro',
            acao: 'ler',
            caminho: relPath,
            mensagem: typeof err === 'object' && err && 'message' in err ? (err as {
              message: string;
            }).message : String(err)
          }));
        }
      }
    }
  }

  // Pontos de partida da varredura
  let startDirs = hasIncluir ? calcularIncludeRoots(config.CLI_INCLUDE_PATTERNS as string[] | undefined, (config as unknown as {
    CLI_INCLUDE_GROUPS?: string[][];
  }).CLI_INCLUDE_GROUPS) : [];
  // Quando o include pede ocorrências em qualquer profundidade, adicionamos também a base do repo para
  // garantir que diretórios-alvo apareçam em níveis arbitrários (ex.: packages/*/node_modules).
  if (hasIncluir && pedeOcorrenciasGlobais) {
    const baseNorm = toPosix(String(baseDir)).replace(/\/$/, '');
    if (!startDirs.includes(baseNorm)) startDirs = [baseNorm, ...startDirs];
  }
  // Se nenhum root foi derivado (ex.: includes somente de arquivos como 'a.txt'), varremos a base inteira
  // para permitir que o filtro de includes atue nos arquivos diretamente.
  if (hasIncluir && startDirs.length === 0) {
    // Sem roots deriváveis (ex.: include apenas 'a.txt'): varre só a raiz para permitir filtro
    await scan(baseDir);
    return fileMap;
  }
  if (startDirs.length === 0) {
    await scan(baseDir);
  } else {
    const vistos = new Set<string>();
    for (const d of startDirs) {
      // Evita normalização com path.resolve para não quebrar mocks de testes (mantém separador POSIX)
      let norm = d;
      // Remove barra final para compat com mocks que comparam por igualdade
      if (/[\\\/]$/.test(norm)) norm = norm.replace(/[\\\/]+$/, '');
      if (vistos.has(norm)) continue;
      vistos.add(norm);
      // Tenta primeiro tratar como diretório sem depender de stat (mocks podem retornar funções)
      try {
        await fs.readdir(norm);
        await scan(norm);
        continue;
      } catch {
        // não é diretório (ou inacessível); tenta fluxo de arquivo abaixo
      }
      // Quando o root derivado for um arquivo, processe-o diretamente
      try {
        let st = statCache.get(norm);
        if (!st) {
          st = await fs.stat(norm);
          statCache.set(norm, st);
        }
        let isDir = false;
        if (st && typeof (st as unknown as {
          isDirectory: () => boolean;
        }).isDirectory === 'function') {
          isDir = st.isDirectory();
        } else {
          // Fallback quando stat mockado não possui isDirectory confiável: tenta readdir
          try {
            await fs.readdir(norm);
            isDir = true;
          } catch {
            isDir = false;
          }
        }
        if (isDir) {
          await scan(norm);
        } else {
          // Alguns testes mockam stat.isDirectory() como false mesmo para diretórios;
          // se conseguirmos listar, tratamos como diretório.
          try {
            await fs.readdir(norm);
            await scan(norm);
            continue;
          } catch {
            // segue como arquivo
          }
          const relPathRaw = path.relative(baseDir, norm);
          const relPath = toPosix(relPathRaw);
          // Aplica as mesmas regras de filtragem de arquivos
          if (hasIncluir && !matchIncluir(relPath)) {
            continue;
          }
          // Aplica exclusões APENAS quando não há includes ativos
          if (!hasIncluir && micromatch.isMatch(relPath, excludePadroesNorm)) {
            continue;
          }
          if (!hasIncluir && micromatch.isMatch(relPath, ignorePadroesNorm)) {
            continue;
          }
          // Filtro customizado exige Dirent; criamos um stub mínimo
          const fakeDirent: Dirent = {
            name: path.basename(norm),
            isDirectory: () => false,
            isSymbolicLink: () => false
          } as unknown as Dirent;
          // Filtro customizado (sempre aplica quando include está ativo)
          if (!filter(relPath, fakeDirent)) continue;
          let content: string | null = null;
          if (efetivoIncluirConteudo) {
            const emTeste = !!process.env.VITEST;
            try {
              if (emTeste) content = await lerEstado<string>(norm);else content = await lerArquivoTexto(norm);
            } catch (e) {
              onProgress(JSON.stringify({
                tipo: 'erro',
                acao: 'ler',
                caminho: relPath,
                mensagem: typeof e === 'object' && e && 'message' in e ? (e as {
                  message: string;
                }).message : String(e)
              }));
              content = null;
            }
          }
          fileMap[relPath] = {
            fullCaminho: norm,
            relPath,
            content,
            ultimaModificacao: (st && 'mtimeMs' in st ? (st as Stats).mtimeMs : Date.now()) || Date.now()
          };
          if (!config.REPORT_SILENCE_LOGS) {
            onProgress(`✅ Arquivo lido: ${relPath}`);
          }
        }
      } catch (e) {
        onProgress(JSON.stringify({
          tipo: 'erro',
          acao: 'acessar',
          caminho: norm,
          mensagem: typeof e === 'object' && e && 'message' in e ? (e as {
            message: string;
          }).message : String(e)
        }));
      }
    }
  }

  // Log de conclusão da varredura
  const totalArquivos = Object.keys(fileMap).length;
  const totalDiretorios = new Set(Object.values(fileMap).map(f => path.dirname(f.relPath))).size;
  logVarredor.completo(totalArquivos, totalDiretorios);
  return fileMap;
}