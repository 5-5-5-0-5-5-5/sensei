// SPDX-License-Identifier: MIT

export const CliAtualizarExtraMensagens = {
  descricao: 'Updates Prometheus if integrity is preserved',
  iniciandoAtualizacao: '\n🔄 Starting update process...\n',
  guardianIntegridadeValidada: '{icone} Guardian: integrity validated. Proceeding with update.',
  guardianBaselineAlterado: '🌀 Guardian generated a new baseline or detected changes. Proceeding with caution.',
  recomendadoGuardianDiff: 'Recommended: `prometheus guardian --diff` and `prometheus guardian --accept-baseline` before updating.',
  falhaAplicarFlags: 'Failed to apply flags: {erro}',
} as const;
