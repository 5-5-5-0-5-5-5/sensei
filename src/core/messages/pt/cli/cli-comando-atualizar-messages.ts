// SPDX-License-Identifier: MIT

export const CliAtualizarExtraMensagens = {
  descricao: 'Atualiza o Sensei se a integridade estiver preservada',
  iniciandoAtualizacao: '\n🔄 Iniciando processo de atualização...\n',
  guardianIntegridadeValidada: '{icone} Guardian: integridade validada. Prosseguindo atualização.',
  guardianBaselineAlterado: '🌀 Guardian gerou novo baseline ou detectou alterações. Prosseguindo com cautela.',
  recomendadoGuardianDiff: 'Recomendado: `sensei guardian --diff` e `sensei guardian --accept-baseline` antes de atualizar.',
  falhaAplicarFlags: 'Falha ao aplicar flags: {erro}',
} as const;
