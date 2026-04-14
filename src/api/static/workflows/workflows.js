// Prometheus Dashboard - Workflows Controller (v0.6.0)

document.addEventListener('DOMContentLoaded', () => {
  const state = {
    workflows: [],
    currentWorkflow: null,
    analysisResults: null
  };

  // Toast container
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  // Souls banner
  const banner = document.getElementById('souls-banner');
  if (!banner) {
    const b = document.createElement('div');
    b.id = 'souls-banner';
    b.className = 'hidden';
    document.body.appendChild(b);
  }

  // Init
  initTabs();
  initMusicPlayer();
  loadWorkflows();
  loadProjectStats();

  // --- Tabs ---
  function initTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        switchTab(tab);
      });
    });
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`)?.classList.add('active');
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`tab-${tab}`)?.classList.remove('hidden');
    if (tab === 'grafo' && state.analysisResults) renderGraph();
  }

  // --- API Calls ---
  async function loadWorkflows() {
    const list = document.getElementById('workflow-list');
    list.innerHTML = '<li class="loading"><i class="fas fa-spinner fa-spin"></i> Carregando workflows...</li>';

    try {
      const res = await fetch('/api/v1/repositorio/arquivos');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.workflows = data.workflows || [];

      if (state.workflows.length === 0) {
        list.innerHTML = '<li class="empty"><i class="fas fa-info-circle"></i> Nenhum workflow encontrado</li>';
      } else {
        renderWorkflowList();
      }
    } catch (err) {
      console.error('Erro ao listar workflows:', err);
      list.innerHTML = '<li class="error"><i class="fas fa-exclamation-triangle"></i> Erro ao carregar</li>';
      showToast('Erro ao carregar workflows', 'error');
    }
  }

  async function loadProjectStats() {
    const integrityEl = document.getElementById('status-integridade');
    if (!integrityEl) return;
    integrityEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      const res = await fetch('/api/v1/repositorio/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const el = document.getElementById('status-integridade');
      if (el) el.textContent = data.saude || 'OK';

      const filesEl = document.getElementById('info-files');
      if (filesEl && data.metricas?.totalFiles) filesEl.textContent = data.metricas.totalFiles;

      const depsEl = document.getElementById('info-dependencies');
      if (depsEl && data.metricas?.dependencies !== undefined) depsEl.textContent = data.metricas.dependencies;
    } catch (err) {
      console.error('Erro ao obter status:', err);
      const integrityEl2 = document.getElementById('status-integridade');
      if (integrityEl2) {
        integrityEl2.textContent = 'Erro';
        integrityEl2.style.color = 'var(--critical)';
      }
    }
  }

  function renderWorkflowList() {
    const list = document.getElementById('workflow-list');
    list.textContent = '';
    state.workflows.forEach((wf, idx) => {
      const li = document.createElement('li');
      li.textContent = wf;
      li.addEventListener('click', () => {
        document.querySelectorAll('#workflow-list li').forEach(l => l.classList.remove('active'));
        li.classList.add('active');
        analyzeWorkflow(wf);
      });
      list.appendChild(li);
    });
  }

  async function analyzeWorkflow(relPath) {
    state.currentWorkflow = relPath;
    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('analysis-detail').classList.remove('hidden');
    document.getElementById('current-workflow-name').textContent = relPath;

    const scoreEl = document.getElementById('workflow-score');
    scoreEl.textContent = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
    scoreEl.className = 'score-badge loading';

    try {
      const res = await fetch('/api/v1/analistas/github-actions/analisar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relPath })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      state.analysisResults = data.resultados || [];
      renderAnalysis();
      showToast('Análise concluída com sucesso!', 'success');
    } catch (err) {
      console.error('Erro na análise:', err);
      const scoreEl2 = document.getElementById('workflow-score');
      if (scoreEl2) {
        scoreEl2.textContent = 'Erro na análise';
        scoreEl2.className = 'score-badge error';
      }
      showToast('Erro ao analisar workflow', 'error');
    }
  }

  function renderAnalysis() {
    const results = state.analysisResults || [];
    const score = 100 - (results.length * 5);
    const scoreEl = document.getElementById('workflow-score');
    if (scoreEl) {
      scoreEl.textContent = `Score: ${Math.max(0, score)}`;
      scoreEl.className = 'score-badge ' + (score > 80 ? 'good' : (score > 50 ? 'warn' : 'critical'));
    }

    // Tabela de problemas
    const body = document.getElementById('problems-body');
    body.textContent = '';
    results.forEach(p => {
      const tr = document.createElement('tr');
      const tdLinha = document.createElement('td');
      tdLinha.textContent = p.linha || 1;
      const tdTipo = document.createElement('td');
      tdTipo.textContent = p.tipo;
      const tdMsg = document.createElement('td');
      tdMsg.textContent = p.mensagem;
      const tdNivel = document.createElement('td');
      const spanNivel = document.createElement('span');
      spanNivel.className = `severity ${p.nivel}`;
      spanNivel.textContent = p.nivel;
      tdNivel.appendChild(spanNivel);
      tr.appendChild(tdLinha);
      tr.appendChild(tdTipo);
      tr.appendChild(tdMsg);
      tr.appendChild(tdNivel);
      body.appendChild(tr);
    });

    // Resumo
    const hasCritical = results.some(r => r.nivel === 'erro');

    const secStatus = document.getElementById('sec-status');
    if (secStatus) {
      secStatus.innerHTML = '';
      const secIcon = document.createElement('i');
      secIcon.className = hasCritical ? 'fas fa-times-circle' : 'fas fa-check-circle';
      secStatus.appendChild(secIcon);
      secStatus.appendChild(document.createTextNode(hasCritical ? ' Problemas de Segurança' : ' Seguro'));
      secStatus.className = hasCritical ? 'critical' : 'success';
    }

    const perfIssues = results.filter(r => r.tipo?.toLowerCase().includes('performance'));
    const perfStatus = document.getElementById('perf-status');
    if (perfStatus) {
      perfStatus.innerHTML = '';
      const perfIcon = document.createElement('i');
      perfIcon.className = perfIssues.length > 0 ? 'fas fa-exclamation-triangle' : 'fas fa-check-circle';
      perfStatus.appendChild(perfIcon);
      perfStatus.appendChild(document.createTextNode(perfIssues.length > 0 ? ` ${perfIssues.length} problema(s)` : ' Otimizada'));
      perfStatus.style.color = perfIssues.length > 0 ? 'var(--warning)' : '#10b981';
    }

    const bestPractices = results.filter(r => r.tipo?.toLowerCase().includes('best practice') || r.tipo?.toLowerCase().includes('boa prática'));
    const bpStatus = document.getElementById('best-practices-status');
    if (bpStatus) {
      bpStatus.innerHTML = '';
      const bpIcon = document.createElement('i');
      bpIcon.className = bestPractices.length === 0 ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
      bpStatus.appendChild(bpIcon);
      bpStatus.appendChild(document.createTextNode(bestPractices.length === 0 ? ' Aplicadas' : ` ${bestPractices.length} pendente(s)`));
      bpStatus.style.color = bestPractices.length === 0 ? '#10b981' : 'var(--warning)';
    }

    const docIssues = results.filter(r => r.tipo?.toLowerCase().includes('document'));
    const docStatus = document.getElementById('docs-status');
    if (docStatus) {
      docStatus.innerHTML = '';
      const docIcon = document.createElement('i');
      docIcon.className = docIssues.length > 0 ? 'fas fa-book-open' : 'fas fa-check-circle';
      docStatus.appendChild(docIcon);
      docStatus.appendChild(document.createTextNode(docIssues.length > 0 ? ` ${docIssues.length} melhoria(s)` : ' Completa'));
      docStatus.style.color = docIssues.length > 0 ? 'var(--warning)' : '#10b981';
    }

    showSoulsBanner(hasCritical, score);
    switchTab('resumo');
  }

  function showSoulsBanner(hasCritical, score) {
    const b = document.getElementById('souls-banner');
    if (!b) return;
    b.className = '';
    if (score >= 100) {
      b.textContent = 'VICTORY ACHIEVED';
      b.classList.add('victory', 'visible');
    } else if (hasCritical) {
      b.textContent = 'YOU DIED';
      b.classList.add('death', 'visible');
    }
    setTimeout(() => {
      b.classList.remove('visible');
      b.classList.add('hidden');
    }, 4000);
  }

  function renderGraph() {
    const mermaidDiv = document.getElementById('workflow-graph');
    if (!state.analysisResults || state.analysisResults.length === 0) {
      mermaidDiv.innerHTML = '<div class="empty-state"><i class="fas fa-project-diagram"></i><p>Nenhum dado para exibir</p></div>';
      return;
    }

    let graphDef = 'graph TD;\n';
    graphDef += '    classDef default fill:#0a0a0a,stroke:#c29a53,stroke-width:2px,color:#e2e8f0;\n';
    graphDef += '    classDef success fill:#065f46,stroke:#10b981,stroke-width:2px;\n';
    graphDef += '    classDef warning fill:#b45309,stroke:#f59e0b,stroke-width:2px;\n';
    graphDef += '    classDef error fill:#991b1b,stroke:#ef4444,stroke-width:2px;\n\n';

    const jobs = [];
    state.analysisResults.forEach((result, idx) => {
      if (result.mensagem && result.mensagem.includes('Job')) {
        const jobName = result.mensagem.replace('Job ', '').trim();
        const jobId = `job${idx}`;
        jobs.push({ id: jobId, name: jobName, nivel: result.nivel });
      }
    });

    if (jobs.length === 0) {
      graphDef += '    Start([Início]) --> Analise[Análise Concluída];\n';
      graphDef += '    class Start success;\n';
      graphDef += '    class Analise success;\n';
    } else {
      graphDef += '    Start([Workflow Start]) --> ' + jobs[0].id + ';\n';
      graphDef += '    class Start success;\n';
      jobs.forEach((job, idx) => {
        const safeId = job.id.replace(/[^a-zA-Z0-9]/g, '_');
        const label = job.name.replace(/[^a-zA-Z0-9\s]/g, '');
        graphDef += `    ${safeId}["${label}"];\n`;
        if (job.nivel === 'erro') graphDef += `    class ${safeId} error;\n`;
        else if (job.nivel === 'aviso') graphDef += `    class ${safeId} warning;\n`;
        if (idx < jobs.length - 1) {
          const nextJob = jobs[idx + 1].id.replace(/[^a-zA-Z0-9]/g, '_');
          graphDef += `    ${safeId} --> ${nextJob};\n`;
        } else {
          graphDef += `    ${safeId} --> End([Concluído]);\n`;
          graphDef += '    class End success;\n';
        }
      });
    }

    mermaidDiv.textContent = graphDef;
    mermaid.init(undefined, mermaidDiv);
  }

  // --- Toast ---
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle';
    const iconEl = document.createElement('i');
    iconEl.className = `fas fa-${icon}`;
    const msgSpan = document.createElement('span');
    msgSpan.textContent = message;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => toast.remove());
    toast.appendChild(iconEl);
    toast.appendChild(msgSpan);
    toast.appendChild(closeBtn);
    (document.getElementById('toast-container') || document.body).appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  // --- Music Player ---
  function initMusicPlayer() {
    const audioPlayer = document.getElementById('audio-player');
    const musicToggle = document.getElementById('music-toggle');
    const musicControls = document.getElementById('music-controls');
    const playBtn = document.getElementById('music-play');
    const pauseBtn = document.getElementById('music-pause');
    const volumeSlider = document.getElementById('music-volume');
    let isPlaying = false;
    let isExpanded = false;

    if (audioPlayer) audioPlayer.volume = 0.3;

    musicToggle?.addEventListener('click', () => {
      isExpanded = !isExpanded;
      musicControls.classList.toggle('visible', isExpanded);
      if (isExpanded && !isPlaying) playMusic();
    });

    playBtn?.addEventListener('click', () => playMusic());
    pauseBtn?.addEventListener('click', () => pauseMusic());

    volumeSlider?.addEventListener('input', (e) => {
      if (audioPlayer) audioPlayer.volume = parseFloat(e.target.value);
    });

    function playMusic() {
      if (audioPlayer) {
        audioPlayer.play().catch(() => {});
        isPlaying = true;
        playBtn.style.display = 'none';
        pauseBtn.style.display = 'flex';
        musicToggle.classList.add('playing');
      }
    }

    function pauseMusic() {
      if (audioPlayer) {
        audioPlayer.pause();
        isPlaying = false;
        playBtn.style.display = 'flex';
        pauseBtn.style.display = 'none';
        musicToggle.classList.remove('playing');
      }
    }
  }
});
