// SPDX-License-Identifier: MIT

export const CliComandoNamesMensagens = {
  descricao: 'Scans the repository for variable names and generates mapping files (fragmented structure in names/).',
  opcaoAgregado: 'Also generates a single names/name.txt (compatibility with old flow).',
  iniciandoVarredura: 'Starting variable name scan...',
  avisoErroProcessar: '[Warning] Error processing {arquivo}',
  varreduraConcluidaFragmentada: 'Scan complete! {variaveis} variables in {arquivos} files. Fragmented mapping in {pastaFragmentada} and aggregated in {pastaAgregada}.',
  varreduraConcluidaEspelhada: 'Scan complete! {variaveis} variables in {arquivos} files. Mapping in {pasta} (mirrored structure).',
} as const;
