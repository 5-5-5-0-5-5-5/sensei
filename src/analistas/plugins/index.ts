// SPDX-License-Identifier: MIT
/**
 * 🔌 Plugins do Prometheus
 *
 * Analistas e detectores especializados que podem ser habilitados/desabilitados.
 * São opcionais e carregados dinamicamente pelo registry.
 *
 * Plugins de Linguagem/Framework:
 * - analista-react.ts       - React (JSX/TSX)
 * - analista-react-hooks.ts - React Hooks
 * - analista-tailwind.ts    - Tailwind CSS
 * - analista-css.ts         - CSS puro
 * - analista-css-in-js.ts   - CSS-in-JS (styled-components/styled-jsx)
 * - analista-html.ts        - HTML
 * - analista-formater.ts    - Formatação mínima (JSON/MD/YAML)
 * - analista-svg.ts         - Heurísticas + otimização SVG
 * - analista-python.ts      - Python
 * - analista-xml.ts         - XML (heurísticas + XXE)
 *
 * Detectores Especializados:
 * - detector-documentacao.ts     - Qualidade de documentação
 * - detector-markdown.ts         - Análise de Markdown
 * - detector-node.ts             - Padrões Node.js
 * - detector-qualidade-testes.ts - Qualidade de testes
 * - detector-xml.ts              - Análise de XML
 */

// Analistas de linguagem/framework
export * from './analista-css.js';
export * from './analista-css-in-js.js';
export * from './analista-formater.js';
export * from './analista-html.js';
export * from './analista-python.js';
export * from './analista-react.js';
export * from './analista-react-hooks.js';
export * from './analista-shell.js';
export * from './analista-sql.js';
export * from './analista-svg.js';
export * from './analista-tailwind.js';
export * from './analista-xml.js';

// Detectores especializados
export * from './detector-documentacao.js';
export * from './detector-markdown.js';
export * from './detector-node.js';
export * from './detector-qualidade-testes.js';
export * from './detector-xml.js';
