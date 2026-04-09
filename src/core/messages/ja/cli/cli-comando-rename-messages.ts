// SPDX-License-Identifier: MIT

export const CliComandoRenameMensagens = {
  descricao: 'Applies variable renames based on mapping file(s) in names/.',
  nenhumArquivoMapeamento: 'No mapping file in {pasta}. Run the {comando} command first.',
  pastaNaoEncontrada: 'Mapping folder not found: {pasta}. Run the {comando} command first.',
  nenhumMapeamento: 'No translation mapping found (format: oldName = newName per line).',
  conflitoMapeamento: 'Mapping conflict for "{nome}": {arquivo} uses "{novo}", previous was "{anterior}" (last wins).',
  iniciandoRenomeacao: 'Starting variable renaming ({total} mappings)...',
  arquivoAtualizado: 'Updated: {arquivo}',
  renomeacaoConcluida: 'Renaming complete! {total} files updated.',
} as const;
