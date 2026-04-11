// SPDX-License-Identifier: MIT

export const CliComandoAnalistasMensagens = {
  fastModeTitulo: '\n👤 登録済みアナリスト（高速モード）:\n',
  fastModeTotalZero: '\n合計: 0',
  docMdTitulo: 'CABECALHOS.analistas.mdTitulo',
  docGeradoEm: (iso: string) => `生成日: ${iso}`,
  docTabelaHeader: '| 名前 | カテゴリ | 説明 | 制限 |',
  docTabelaSeparador: '| ---- | --------- | --------- | ------- |',
  docLinhaAnalista: (nome: string, categoria: string, descricao: string, limitesStr: string) => `| ${nome} | ${categoria} | ${descricao} | ${limitesStr} |`,
  docGerada: (destinoDoc: string) => `✅ アナリストドキュメントが ${destinoDoc} に生成されました`,
  jsonExportado: (destino: string) => `📦 アナリストJSONを ${destino} にエクスポートしました`,
  titulo: '\n👤 登録済みアナリスト:\n',
  linhaAnalista: (nome: string, categoria: string, descricao?: string) => `- ${nome} (${categoria}) ${descricao ? `: ${descricao}` : ''}`,
  tituloComIcone: (iconeInfo: string) => `${iconeInfo} 登録済みアナリスト:`,
  total: (n: number) => `\n合計: ${n}`
} as const;
