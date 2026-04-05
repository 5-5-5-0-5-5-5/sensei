// SPDX-License-Identifier: MIT

export const CliComandoRenameMensagens = {
  descricao: 'Aplica as renomeações de variáveis baseadas no arquivo(s) de mapeamento em names/.',
  nenhumArquivoMapeamento: 'Nenhum arquivo de mapeamento em {pasta}. Execute o comando {comando} primeiro.',
  pastaNaoEncontrada: 'Pasta de mapeamento não encontrada: {pasta}. Execute o comando {comando} primeiro.',
  nenhumMapeamento: 'Nenhum mapeamento de tradução encontrado (formato: nomeAntigo = nomeNovo por linha).',
  conflitoMapeamento: 'Conflito de mapeamento para "{nome}": {arquivo} usa "{novo}", anterior era "{anterior}" (last wins).',
  iniciandoRenomeacao: 'Iniciando renomeação de variáveis ({total} mapeamentos)...',
  arquivoAtualizado: 'Atualizado: {arquivo}',
  renomeacaoConcluida: 'Renomeação concluída! {total} arquivos atualizados.',
} as const;
