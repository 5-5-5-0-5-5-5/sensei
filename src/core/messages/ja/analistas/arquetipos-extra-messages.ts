export const ArquetiposExtraMensagens = {
  naoEncontrado: '⚠️ Custom archetype not found in {novo} or {legado}',
  salvo: '✅ Custom archetype saved to {caminho}',
  projetoPersonalizado: '🌟 Custom project detected: "{nome}"',
  descricaoPersonalizado: 'The Prometheus identified a project structure that does not match official archetypes,\nbut you can create a custom archetype to receive optimized suggestions!',
  estruturaDetectada: '📁 Detected structure:',
  arquivosRaiz: '📄 Root files:',
  dicaCriar: '💡 To create your custom archetype, run:',
  comandoCriar: '   prometheus diagnosticar --criar-arquetipo',
  explicacaoCriar: 'This will create a \'prometheus.repo.arquetipo.json\' file based on the current structure,\nwhich the Prometheus will use to offer personalized suggestions while keeping best practices.',
  validacao: {
    nomeObrigatorio: 'Project name is required',
    arquetipoObrigatorio: 'Base official archetype is required',
    arquetipoNaoEncontrado: 'Official archetype \'{arquetipo}\' not found. Use: {disponiveis}',
    estruturaObrigatoria: 'Custom structure is required',
    diretoriosArray: 'Directories must be an array',
    arquivosChaveArray: 'Key files must be an array',
  },
  melhoresPraticas: {
    srcOrganizado: 'Keep source code organized in src/',
    testesDedicados: 'Separate tests into a dedicated folder',
    documenteApis: 'Document APIs and important features',
  },
} as const;
