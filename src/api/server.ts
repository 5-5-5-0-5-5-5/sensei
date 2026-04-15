// SPDX-License-Identifier: MIT
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { PrometheusSDK } from '../sdk/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Executa um comando CLI do Prometheus via child_process
 */
function executarComandoCli(comando: string, args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  return new Promise((resolve) => {
    const nodePath = process.execPath;
    const projectRoot = path.resolve(__dirname, '..', '..');
    const cliPath = path.join(projectRoot, 'dist', 'bin', 'cli.js');

    const child = spawn(nodePath, [cliPath, comando, ...args], {
      cwd: projectRoot,
      shell: false
    });

    let stdout = '';
    let stderr = '';

    child.stdout?.on('data', (data) => { stdout += data.toString(); });
    child.stderr?.on('data', (data) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      child.kill('SIGTERM');
      stderr += '\nTimeout: Comando excedeu o tempo limite';
    }, 60000);

    child.on('close', (code) => {
      clearTimeout(timeout);
      resolve({ stdout, stderr, exitCode: code ?? 0 });
    });

    child.on('error', (err) => {
      clearTimeout(timeout);
      stderr += err.message;
      resolve({ stdout, stderr, exitCode: 1 });
    });
  });
}

/**
 * Funções auxiliares para cálculo de métricas reais
 */
function calculateSecurityScore(rootDir: string): number {
  let score = 70; // Base

  // Verifica se tem .gitignore
  if (fs.existsSync(path.join(rootDir, '.gitignore'))) score += 10;

  // Verifica dependências de segurança
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    const hasSecurityDeps = pkg.dependencies && (pkg.dependencies.helmet || pkg.dependencies.dompurify);
    if (hasSecurityDeps) score += 10;
  }

  // Verifica configuração de lint
  if (fs.existsSync(path.join(rootDir, 'eslint.config.js')) || fs.existsSync(path.join(rootDir, '.eslintrc'))) score += 10;

  return Math.min(100, score);
}

function calculatePerformanceScore(rootDir: string, totalFiles: number): number {
  let score = 60; // Base

  // Tem config de build otimizada
  if (fs.existsSync(path.join(rootDir, 'tsconfig.json'))) score += 10;

  // Tem testes
  const testDir = path.join(rootDir, 'tests');
  const hasTests = fs.existsSync(testDir);
  if (hasTests) score += 15;

  // Tem cache/config deCI
  if (fs.existsSync(path.join(rootDir, '.github', 'workflows'))) score += 15;

  return Math.min(100, score);
}

function calculateDocumentationScore(rootDir: string): number {
  let score = 50; // Base

  // Tem README
  if (fs.existsSync(path.join(rootDir, 'README.md'))) score += 20;

  // Tem CHANGELOG
  if (fs.existsSync(path.join(rootDir, 'CHANGELOG.md'))) score += 10;

  // Tem CONTRIBUTING
  if (fs.existsSync(path.join(rootDir, 'CONTRIBUTING.md'))) score += 10;

  // Tem docs folder
  if (fs.existsSync(path.join(rootDir, 'docs'))) score += 10;

  return Math.min(100, score);
}

function calculateArchitectureScore(rootDir: string, totalFiles: number): number {
  let score = 65; // Base

  // Tem estrutura de src organizada
  const srcDir = path.join(rootDir, 'src');
  if (fs.existsSync(srcDir)) {
    const subdirs = fs.readdirSync(srcDir).filter(f => fs.statSync(path.join(srcDir, f)).isDirectory());
    if (subdirs.length > 3) score += 15; // Bem organizado
  }

  // Tem shared/core
  if (fs.existsSync(path.join(rootDir, 'src', 'shared'))) score += 10;
  if (fs.existsSync(path.join(rootDir, 'src', 'core'))) score += 10;

  // Tem types
  if (fs.existsSync(path.join(rootDir, 'src', 'types'))) score += 10;

  return Math.min(100, score);
}

function calculateQualityScore(rootDir: string, totalFiles: number): number {
  let score = 60; // Base

  // Tem TypeScript
  if (fs.existsSync(path.join(rootDir, 'tsconfig.json'))) score += 10;

  // Tem testes configurados
  if (fs.existsSync(path.join(rootDir, 'vitest.config.ts')) || fs.existsSync(path.join(rootDir, 'jest.config.js'))) score += 15;

  // Tem CI/CD
  if (fs.existsSync(path.join(rootDir, '.github', 'workflows'))) score += 15;

  // Tem husky/lint-staged
  const pkgPath = path.join(rootDir, 'package.json');
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (pkg.devDependencies && (pkg.devDependencies.husky || pkg.devDependencies['lint-staged'])) score += 10;
  }

  return Math.min(100, score);
}

function getHealthStatus(securityScore: number, qualityScore: number): string {
  const avg = (securityScore + qualityScore) / 2;
  if (avg >= 80) return 'Excelente';
  if (avg >= 60) return 'Bom';
  if (avg >= 40) return 'Regular';
  return 'Precisa Atenção';
}

/**
 * Servidor de API e Dashboard do Prometheus (v0.6.0)
 */
const server = http.createServer(async (req, res) => {
  // CORS basic
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API Endpoints

  // Listar arquivos
  if (req.method === 'GET' && req.url === '/api/v1/repositorio/arquivos') {
    const workflowDir = path.join(process.cwd(), '.github', 'workflows');
    let files: string[] = [];
    if (fs.existsSync(workflowDir)) {
      files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ workflows: files }));
    return;
  }

  // Status Geral do Repositório (Guardian + Métricas)
  if (req.method === 'GET' && req.url === '/api/v1/repositorio/status') {
    try {
      const workflowDir = path.join(process.cwd(), '.github', 'workflows');
      const hasWorkflows = fs.existsSync(workflowDir);
      const totalWorkflows = hasWorkflows ? fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml')).length : 0;

      // Calcular métricas reais do projeto
      const srcDir = path.join(process.cwd(), 'src');
      let totalFiles = 0;
      if (fs.existsSync(srcDir)) {
        try {
          totalFiles = fs.readdirSync(srcDir, { recursive: true }).filter(f => typeof f === 'string' && (f.endsWith('.ts') || f.endsWith('.js'))).length;
        } catch (e) { /* ignore */ }
      }

      const pkgPath = path.join(process.cwd(), 'package.json');
      const pkg = fs.existsSync(pkgPath) ? JSON.parse(fs.readFileSync(pkgPath, 'utf-8')) : null;
      const version = pkg?.version || '0.6.0';
      const deps = pkg?.dependencies ? Object.keys(pkg.dependencies).length : 0;
      const devDeps = pkg?.devDependencies ? Object.keys(pkg.devDependencies).length : 0;

      // Calcular score baseado em métricas reais
      const securityScore = calculateSecurityScore(process.cwd());
      const performanceScore = calculatePerformanceScore(process.cwd(), totalFiles);
      const documentationScore = calculateDocumentationScore(process.cwd());
      const architectureScore = calculateArchitectureScore(process.cwd(), totalFiles);
      const qualityScore = calculateQualityScore(process.cwd(), totalFiles);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        projeto: path.basename(process.cwd()),
        versao: version,
        saude: getHealthStatus(securityScore, qualityScore),
        metricas: {
          workflows: totalWorkflows,
          totalFiles,
          dependencies: deps,
          devDependencies: devDeps,
          integridade: 'Protegido',
          ultimaAnalise: new Date().toLocaleDateString('pt-BR'),
          radar: {
            seguranca: securityScore,
            performance: performanceScore,
            documentacao: documentationScore,
            arquitetura: architectureScore,
            qualidade: qualityScore
          }
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao obter status', details: String(err) }));
    }
    return;
  }

  // Histórico de Métricas (Tendências)
  if (req.method === 'GET' && req.url === '/api/v1/repositorio/metricas') {
    try {
      // Ler métricas históricas do arquivo de persistência
      const metricsFile = path.join(process.cwd(), '.prometheus', 'metrics-history.json');

      if (fs.existsSync(metricsFile)) {
        const history = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(history));
      } else {
        // Retornar dados simulados baseados no estado atual
        const now = new Date();
        const mockData = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - (6 - i));
          return {
            timestamp: date.toISOString(),
            score: 70 + Math.random() * 20, // Simulação
            totalFiles: 100 + i * 5,
            issues: Math.floor(Math.random() * 10)
          };
        });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao obter métricas históricas', details: String(err) }));
    }
    return;
  }

  // Analisar Workflow
  if (req.method === 'POST' && req.url === '/api/v1/analistas/github-actions/analisar') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        let { conteudo, relPath } = payload;

        if (!conteudo && relPath) {
          const fullPath = path.join(process.cwd(), relPath);
          if (fs.existsSync(fullPath)) {
            conteudo = fs.readFileSync(fullPath, 'utf-8');
          }
        }

        const resultados = await PrometheusSDK.analisarGithubActions(conteudo, relPath);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, resultados }));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro na análise', detail: (err as Error).message }));
      }
    });
    return;
  }

  // --- Execução de Comandos do Dashboard ---

  // Comando: Diagnosticar Projeto (executa CLI real)
  if (req.method === 'POST' && req.url === '/api/v1/comando/diagnosticar') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const args: string[] = ['diagnosticar', '--json'];

        if (body) {
          const payload = JSON.parse(body);
          if (payload.detalhado) args.push('--detalhado');
          if (payload.full) args.push('--full');
          if (payload.fast) args.push('--fast');
        }

        const result = await executarComandoCli('diagnosticar', args);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: result.exitCode === 0,
          message: result.exitCode === 0 ? 'Diagnóstico concluído com sucesso!' : 'Erro no diagnóstico',
          stdout: result.stdout,
          stderr: result.stderr,
          exitCode: result.exitCode
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Comando: Diagnosticar Detalhado
  if (req.method === 'POST' && req.url === '/api/v1/comando/diagnosticar/detalhado') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const args: string[] = ['diagnosticar', '--json', '--detalhado'];

        if (body) {
          const payload = JSON.parse(body);
          if (payload.full) args.push('--full');
          if (payload.fast) args.push('--fast');
        }

        const result = await executarComandoCli('diagnosticar', args);

        let cliOutput = null;
        try {
          cliOutput = JSON.parse(result.stdout);
        } catch {
          cliOutput = { rawOutput: result.stdout };
        }

        const ocorrencias = cliOutput?.ocorrencias || [];
        const ocorrenciasPorNivel: Record<string, number> = { erro: 0, aviso: 0, info: 0, sucesso: 0 };

        if (cliOutput?.tiposOcorrencias) {
          if (cliOutput.tiposOcorrencias.erro) ocorrenciasPorNivel.erro = cliOutput.tiposOcorrencias.erro;
          if (cliOutput.tiposOcorrencias.aviso) ocorrenciasPorNivel.aviso = cliOutput.tiposOcorrencias.aviso;
          if (cliOutput.tiposOcorrencias.info) ocorrenciasPorNivel.info = cliOutput.tiposOcorrencias.info;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: result.exitCode === 0,
          totalOcorrencias: cliOutput?.totalOcorrencias || 0,
          temErro: ocorrenciasPorNivel.erro > 0,
          ocorrenciasPorNivel,
          metricas: {
            totalArquivos: cliOutput?.linguagens?.total || 0,
            tempoTotal: 0,
            tempoAnalise: 0,
            analistasExecutados: 0,
            topProblemas: []
          },
          ocorrencias: ocorrencias.slice(0, 100)
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Comando: Otimizar SVG (executa CLI real)
  if (req.method === 'POST' && req.url === '/api/v1/comando/otimizar-svg') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const args: string[] = ['otimizar-svg', '--json'];

        const result = await executarComandoCli('otimizar-svg', args);

        let parsedOutput = null;
        try {
          parsedOutput = JSON.parse(result.stdout);
        } catch {
          parsedOutput = { rawOutput: result.stdout };
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: result.exitCode === 0,
          output: parsedOutput,
          exitCode: result.exitCode
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(err) }));
      }
    });
    return;
  }

  // Comando: Licenças (executa CLI real)
  if (req.method === 'GET' && req.url === '/api/v1/comando/licencas') {
    try {
      const result = await executarComandoCli('licencas', ['scan']);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.exitCode === 0,
        output: parsedOutput,
        exitCode: result.exitCode
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // Comando: Guardian (executa CLI real)
  if (req.method === 'GET' && req.url === '/api/v1/comando/guardian') {
    try {
      const result = await executarComandoCli('guardian', ['--json']);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.exitCode === 0,
        output: parsedOutput,
        exitCode: result.exitCode
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // Comando: Metricas (executa CLI real)
  if (req.method === 'GET' && req.url === '/api/v1/comando/metricas') {
    try {
      const result = await executarComandoCli('metricas', ['--json']);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.exitCode === 0,
        output: parsedOutput,
        exitCode: result.exitCode
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // Comando: Perf (executa CLI real)
  if (req.method === 'GET' && req.url === '/api/v1/comando/perf') {
    try {
      const result = await executarComandoCli('perf', ['--json']);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.exitCode === 0,
        output: parsedOutput,
        exitCode: result.exitCode
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // Comando: Analistas (executa CLI real)
  if (req.method === 'GET' && req.url === '/api/v1/comando/analistas') {
    try {
      const result = await executarComandoCli('analistas', ['--json']);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.exitCode === 0,
        output: parsedOutput,
        exitCode: result.exitCode
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err) }));
    }
    return;
  }

  // Listar Analistas (Detectores + Plugins) - executa CLI real
  if (req.method === 'GET' && req.url === '/api/v1/analistas/lista') {
    try {
      const result = await executarComandoCli('analistas', []);

      let parsedOutput = null;
      try {
        parsedOutput = JSON.parse(result.stdout);
      } catch {
        parsedOutput = { rawOutput: result.stdout };
      }

      const analistas = parsedOutput?.analistas || parsedOutput?.plugins || [];
      const categorizados = {
        detectores: analistas.filter((a: { nome: string }) => a.nome.startsWith('detector')),
        plugins: analistas.filter((a: { nome: string }) => a.nome.startsWith('analista-')),
        tecnicas: analistas.filter((a: { nome: string }) => !a.nome.startsWith('detector') && !a.nome.startsWith('analista-'))
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: analistas.length,
        categorias: {
          detectores: categorizados.detectores.length,
          plugins: categorizados.plugins.length,
          tecnicas: categorizados.tecnicas.length
        },
        analistas: analistas
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao listar analistas', details: String(err) }));
    }
    return;
  }

  // Diagnóstico Completo com detalhes
  if (req.method === 'POST' && req.url === '/api/v1/comando/diagnosticar/detalhado') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', async () => {
      try {
        const startTime = Date.now();
        const srcDir = path.join(process.cwd(), 'src');
        const ocorrencias: Array<{tipo: string; mensagem: string; relPath: string; linha: number; nivel: string}> = [];

        if (fs.existsSync(srcDir)) {
          const scanDir = (dir: string, baseDir: string) => {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
              const fullPath = path.join(dir, entry.name);
              const relPath = path.relative(baseDir, fullPath);
              if (entry.isDirectory() && !entry.name.startsWith('.')) {
                scanDir(fullPath, baseDir);
              } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.js'))) {
                const content = fs.readFileSync(fullPath, 'utf-8');
                const linhas = content.split('\n');

                linhas.forEach((linha, idx) => {
                  if (linha.includes('any') && linha.includes(' as ')) {
                    ocorrencias.push({ tipo: 'type-safety', mensagem: 'Uso de "any" detectado', relPath, linha: idx + 1, nivel: 'aviso' });
                  }
                  if (linha.includes('TODO') || linha.includes('FIXME')) {
                    ocorrencias.push({ tipo: 'comentario', mensagem: 'Comentário TODO/FIXME', relPath, linha: idx + 1, nivel: 'info' });
                  }
                  if (linha.includes('console.log') && !linha.includes('//')) {
                    ocorrencias.push({ tipo: 'debug', mensagem: 'console.log detectado', relPath, linha: idx + 1, nivel: 'info' });
                  }
                });
              }
            }
          };
          scanDir(srcDir, srcDir);
        }

        const tempoAnalise = Date.now() - startTime;
        const ocorrenciasPorNivel: Record<string, number> = { erro: 0, aviso: 0, info: 0, sucesso: 0 };
        ocorrencias.forEach(oc => { ocorrenciasPorNivel[oc.nivel] = (ocorrenciasPorNivel[oc.nivel] || 0) + 1; });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          totalOcorrencias: ocorrencias.length,
          temErro: ocorrenciasPorNivel.erro > 0,
          ocorrenciasPorNivel,
          metricas: {
            totalArquivos: 0,
            tempoTotal: tempoAnalise,
            tempoAnalise,
            analistasExecutados: 3,
            topProblemas: []
          },
          ocorrencias: ocorrencias.slice(0, 100)
        }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Erro no diagnóstico', details: String(err) }));
      }
    });
    return;
  }

  // License Scan
  if (req.method === 'GET' && req.url === '/api/v1/licensas/scan') {
    try {
      const { scanCommand } = await import('../licensas/scanner.js');
      const result = await scanCommand({ root: process.cwd(), includeDev: true });

      const licencas = Object.entries(result.licenseCounts).sort((a, b) => b[1] - a[1]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        totalPackages: result.totalPackages,
        totalFiltered: result.totalFiltered,
        licencas: licencas.slice(0, 10),
        problematicas: result.problematic.map(p => ({
          name: p.name,
          version: p.version,
          repository: p.repository || '-'
        })),
        distribuicao: {
          permissivas: licencas.filter(([l]) =>
            ['MIT', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'BlueOak-1.0.0', 'CC0-1.0'].includes(l)
          ).reduce((sum, [, count]) => sum + count, 0),
          copyleft: licencas.filter(([l]) =>
            ['GPL-2.0', 'GPL-3.0', 'LGPL-2.1', 'LGPL-3.0', 'AGPL-3.0', 'MPL-2.0'].includes(l)
          ).reduce((sum, [, count]) => sum + count, 0),
          desconhecidas: result.problematic.length
        }
      }));
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro no scan de licenças', details: String(err) }));
    }
    return;
  }

  // Métricas de Performance
  if (req.method === 'GET' && req.url === '/api/v1/perf/metricas') {
    try {
      const metricsFile = path.join(process.cwd(), '.prometheus', 'metrics-history.json');

      if (fs.existsSync(metricsFile)) {
        const history = JSON.parse(fs.readFileSync(metricsFile, 'utf-8'));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(history));
      } else {
        // Retornar métricas simuladas baseadas no estado atual
        const now = new Date();
        const mockData = {
          baselines: Array.from({ length: 7 }, (_, i) => {
            const date = new Date(now);
            date.setDate(date.getDate() - (6 - i));
            return {
              timestamp: date.toISOString(),
              tempoExecucao: 500 + Math.random() * 1000,
              memoriaUsada: 50 + Math.random() * 100,
              arquivosProcessados: 100 + i * 10
            };
          }),
          atual: {
            tempoExecucao: 800 + Math.random() * 400,
            memoriaUsada: 80 + Math.random() * 50,
            arquivosProcessados: 150
          }
        };

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(mockData));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Erro ao obter métricas de performance', details: String(err) }));
    }
    return;
  }

  // Servir arquivos estáticos (dashboard e sub-páginas)
  let urlPath = req.url === '/' || req.url === '/dashboard' ? 'index.html' : req.url!;

  // Normalizar caminhos para sub-páginas (ex: /workflows/ -> /workflows/index.html)
  if (urlPath.endsWith('/')) {
    urlPath += 'index.html';
  }

  let filePath = path.join(__dirname, 'static', urlPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpg',
      '.svg': 'image/svg+xml',
      '.mp3': 'audio/mpeg',
    }[ext] || 'text/plain';

    res.writeHead(200, { 'Content-Type': contentType });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Recurso não encontrado' }));
  }
});

/**
 * Inicia o servidor de API
 */
export function iniciarServidorApi(porta = 3000) {
  server.listen(porta, () => {
    console.log(`🚀 Prometheus REST API rodando em http://localhost:${porta}`);
  });
}

// Se executado diretamente
if (process.argv[1]?.includes('server.ts') || process.argv[1]?.includes('server.js')) {
  iniciarServidorApi();
}
