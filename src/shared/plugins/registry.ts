// SPDX-License-Identifier: MIT
import { getMessages } from '@core/messages/index.js';
import { PluginRegistryMensagens } from '@core/messages/index.js';
import { ExcecoesMensagens } from '@core/messages/pt/core/excecoes-messages.js';

import type { GlobalComImport, ImportDinamico, LanguageSupport, ParserPlugin, PluginConfig } from '@';

const { log, logCore } = getMessages();

/**
 * Registry centralizado para gerenciamento de plugins de parser
 * Suporta loading dinâmico, cache e configuração flexível
 */
export class PluginRegistry {
  private plugins = new Map<string, ParserPlugin>();
  private extensionMap = new Map<string, string>(); // extensão -> nome do plugin
  private config: PluginConfig;
  private userConfiguredEnabled = false;
  private languageSupport: Record<string, LanguageSupport>;
  private loadingPromises = new Map<string, Promise<ParserPlugin>>();
  constructor(config?: PluginConfig, languageSupport?: Record<string, LanguageSupport>) {
    this.config = {
      enabled: ['core'],
      autoload: true,
      registry: '@sensei/plugins',
      ...config
    };
    this.userConfiguredEnabled = !!config?.enabled;
    this.languageSupport = languageSupport || {};
  }

  /**
   * Registra um plugin no registry
   */
  registerPlugin(plugin: ParserPlugin): void {
    logCore.registrandoPlugin(plugin.name, plugin.version);

    // Valida o plugin
    this.validatePlugin(plugin);

    // Registra o plugin
    this.plugins.set(plugin.name, plugin);

    // Mapeia extensões para o plugin
    for (const ext of plugin.extensions) {
      if (this.extensionMap.has(ext)) {
        const existing = this.extensionMap.get(ext);
        const msg = PluginRegistryMensagens.extensaoSobrescrita;
        log.debug(msg.replace('{ext}', ext).replace('{existente}', existing || '').replace('{novo}', plugin.name));
      }
      this.extensionMap.set(ext, plugin.name);
    }
    const msgRegistrado = PluginRegistryMensagens.pluginRegistrado;
    log.debug(msgRegistrado.replace('{nome}', plugin.name).replace('{extensoes}', plugin.extensions.join(', ')));
  }

  /**
   * Carrega um plugin dinamicamente
   */
  async loadPlugin(name: string): Promise<ParserPlugin> {
    // Se já está carregado, retorna
    if (this.plugins.has(name)) {
      const plugin = this.plugins.get(name);
      if (!plugin) {
        throw new Error(ExcecoesMensagens.pluginRegistradoNaoPodeSerObtido(name));
      }
      return plugin;
    }

    // Se já está sendo carregado, retorna a promise existente
    // NOTE: este padrão evita condições de race onde múltiplos callers tentariam
    // carregar o mesmo plugin simultaneamente — a promise existente é retornada
    // e quaisquer erros são propagados pela promise, evitando rejetions não tratadas.
    if (this.loadingPromises.has(name)) {
      const promise = this.loadingPromises.get(name);
      if (!promise) {
        throw new Error(ExcecoesMensagens.pluginCarregandoPromiseNaoPodeSerObtida(name));
      }
      return promise;
    }

    // Cria nova promise de loading
    const loadingPromise = this.doLoadPlugin(name);
    this.loadingPromises.set(name, loadingPromise);
    try {
      const plugin = await loadingPromise;
      this.loadingPromises.delete(name);
      return plugin;
    } catch (error) {
      this.loadingPromises.delete(name);
      throw error;
    }
  }

  /**
   * Implementação real do loading do plugin
   */
  private async doLoadPlugin(name: string): Promise<ParserPlugin> {
    const msgCarregando = PluginRegistryMensagens.carregandoPlugin;
    log.debug(msgCarregando.replace('{nome}', name));
    try {
      // Tenta carregar do registry configurado
      const pluginCaminho = `${this.config.registry}/${name}-plugin`;
      // Usa import dinâmico mockável (globalThis.import pode ser substituído nos testes)
      const dynImport: ImportDinamico = (globalThis as GlobalComImport).import || ((p: string) => import(p));
      const pluginModule = await dynImport(pluginCaminho);
      const plugin: ParserPlugin = (pluginModule as Record<string, unknown>).default as ParserPlugin || pluginModule as ParserPlugin;

      // Valida e registra
      this.validatePlugin(plugin);
      this.registerPlugin(plugin);
      return plugin;
    } catch (error) {
      logCore.erroCarregarPlugin(name, (error as Error).message);
      throw new Error(ExcecoesMensagens.naoFoiPossivelCarregarPlugin(name, (error as Error).message));
    }
  }

  /**
   * Obtém plugin por extensão de arquivo
   */
  async getPluginForExtension(extension: string): Promise<ParserPlugin | null> {
    const pluginNome = this.extensionMap.get(extension);
    if (!pluginNome) {
      if (this.config.autoload) {
        logCore.tentandoAutoload(extension);
        // Tenta inferir nome do plugin pela extensão
        const inferredNome = this.inferPluginName(extension);
        if (inferredNome && this.config.enabled.includes(inferredNome)) {
          try {
            return await this.loadPlugin(inferredNome);
          } catch {
            logCore.autoloadFalhou(inferredNome);
          }
        }
      }
      return null;
    }

    // Verifica se o plugin está habilitado
    // Regra: se o usuário NÃO configurou a lista 'enabled', tratamos todos os plugins registrados como habilitados por padrão.
    // Só aplicamos o gate includes() quando houve configuração explícita de 'enabled'.
    if (this.userConfiguredEnabled && !this.config.enabled.includes(pluginNome)) {
      const msgDesabilitado = PluginRegistryMensagens.pluginDesabilitado;
      log.debug(msgDesabilitado.replace('{nome}', pluginNome).replace('{extensao}', extension));
      return null;
    }

    // Verifica suporte da linguagem
    const langChave = extension.substring(1); // remove o ponto
    const langSuporte = this.languageSupport[langChave];
    if (langSuporte && !langSuporte.enabled) {
      const msgLinguagem = PluginRegistryMensagens.linguagemDesabilitada;
      log.debug(msgLinguagem.replace('{linguagem}', langChave));
      return null;
    }
    return await this.loadPlugin(pluginNome);
  }

  /**
   * Infere nome do plugin baseado na extensão
   */
  private inferPluginName(extension: string): string | null {
    const extMap: Record<string, string> = {
      '.xml': 'core',
      // XML fica no core
      '.html': 'core',
      // HTML fica no core
      '.htm': 'core',
      '.css': 'core',
      // CSS fica no core
      '.js': 'core',
      '.jsx': 'core',
      '.ts': 'core',
      '.tsx': 'core',
      '.mjs': 'core',
      '.cjs': 'core',
      '.php': 'core',
      // PHP fica no core
      '.py': 'core' // Python fica no core
    };
    return extMap[extension] || null;
  }

  /**
   * Valida um plugin antes do registro
   */
  private validatePlugin(plugin: ParserPlugin): void {
    if (!plugin.name || typeof plugin.name !== 'string') {
      throw new Error(ExcecoesMensagens.pluginDeveTerNomeValido);
    }
    if (!plugin.version || typeof plugin.version !== 'string') {
      throw new Error(ExcecoesMensagens.pluginDeveTerVersaoValida);
    }
    if (!Array.isArray(plugin.extensions) || plugin.extensions.length === 0) {
      throw new Error(ExcecoesMensagens.pluginDeveDefinirPeloMenosUmaExtensao);
    }
    if (typeof plugin.parse !== 'function') {
      throw new Error(ExcecoesMensagens.pluginDeveImplementarMetodoParse);
    }
  }

  /**
   * Lista plugins registrados
   */
  getRegisteredPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * Lista extensões suportadas
   */
  getSupportedExtensions(): string[] {
    return Array.from(this.extensionMap.keys());
  }

  /**
   * Obtém estatísticas do registry
   */
  getStats(): {
    pluginsRegistrados: number;
    extensoesSuportadas: number;
    pluginsHabilitados: number;
    autoloadAtivo: boolean;
  } {
    return {
      pluginsRegistrados: this.plugins.size,
      extensoesSuportadas: this.extensionMap.size,
      pluginsHabilitados: this.config.enabled.length,
      autoloadAtivo: this.config.autoload
    };
  }

  /**
   * Atualiza configuração do registry
   */
  updateConfig(newConfig: Partial<PluginConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
    if (Object.prototype.hasOwnProperty.call(newConfig, 'enabled')) {
      this.userConfiguredEnabled = true;
    }
    log.debug(PluginRegistryMensagens.configAtualizada);
  }

  /**
   * Atualiza suporte a linguagens
   */
  updateLanguageSupport(newSupport: Record<string, LanguageSupport>): void {
    this.languageSupport = {
      ...this.languageSupport,
      ...newSupport
    };
    log.debug(PluginRegistryMensagens.suporteAtualizado);
  }

  /**
   * Limpa cache de plugins (útil para testes)
   */
  clearCache(): void {
    this.plugins.clear();
    this.extensionMap.clear();
    this.loadingPromises.clear();
    log.debug(PluginRegistryMensagens.cacheLimpo);
  }
}

/**
 * Instância global do registry (singleton)
 */
let globalRegistro: PluginRegistry | null = null;

/**
 * Obtém a instância global do registry
 */

export function getGlobalRegistry(): PluginRegistry {
  if (!globalRegistro) {
    globalRegistro = new PluginRegistry();
  }
  return globalRegistro;
}

/**
 * Configura a instância global do registry
 */

export function configureGlobalRegistry(config?: PluginConfig, languageSupport?: Record<string, LanguageSupport>): void {
  globalRegistro = new PluginRegistry(config, languageSupport);
}

/**
 * Reseta a instância global (útil para testes)
 */

export function resetGlobalRegistry(): void {
  globalRegistro = null;
}