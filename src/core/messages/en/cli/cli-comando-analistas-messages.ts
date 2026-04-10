// SPDX-License-Identifier: MIT

export const CliComandoAnalistasMessages = {
  fastModeTitle: '\n?? Registered analysts (FAST MODE):\n',
  fastModeTotalZero: '\nTotal: 0',
  docMdTitle: 'CABECALHOS.analistas.mdTitulo',
  docGeneratedAt: (iso: string) => `Generated at: ${iso}`,
  docTableHeader: '| Name | Category | Description | Limits |',
  docTableSeparator: '| ---- | --------- | --------- | ------- |',
  docAnalystLine: (nome: string, categoria: string, descricao: string, limitesStr: string) => `| ${nome} | ${categoria} | ${descricao} | ${limitesStr} |`,
  docGenerated: (destinoDoc: string) => `?? Analyst documentation generated at ${destinoDoc}`,
  jsonExported: (destino: string) => `?? Exported analysts JSON to ${destino}`,
  title: '\n?? Registered analysts:\n',
  analystLine: (nome: string, categoria: string, descricao?: string) => `- ${nome} (${categoria}) ${descricao ? `: ${descricao}` : ''}`,
  titleWithIcon: (iconeInfo: string) => `${iconeInfo} Registered analysts:`,
  total: (n: number) => `\nTotal: ${n}`
} as const;
export const CliComandoAnalistasMensagens = CliComandoAnalistasMessages;
