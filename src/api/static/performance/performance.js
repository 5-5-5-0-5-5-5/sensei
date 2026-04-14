// Prometheus Dashboard - Performance Controller

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStats();
  loadPerformance();

  async function loadProjectStats() {
    try {
      const res = await fetch('/api/v1/repositorio/status');
      if (!res.ok) return;
      const data = await res.json();

      const el = document.getElementById('status-integridade');
      if (el) el.textContent = data.saude || 'OK';

      const filesEl = document.getElementById('info-files');
      if (filesEl && data.metricas?.totalFiles) filesEl.textContent = data.metricas.totalFiles;

      const depsEl = document.getElementById('info-dependencies');
      if (depsEl && data.metricas?.dependencies !== undefined) depsEl.textContent = data.metricas.dependencies;
    } catch (err) {
      console.error('Erro ao obter stats:', err);
    }
  }

  async function loadPerformance() {
    try {
      const res = await fetch('/api/v1/perf/metricas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderPerformance(data);
    } catch (err) {
      console.error('Erro ao carregar performance:', err);
    }
  }

  function renderPerformance(data) {
    const atual = data.atual || {};
    document.getElementById('perf-tempo').textContent = `${Math.round(atual.tempoExecucao || 0)}ms`;
    document.getElementById('perf-memoria').textContent = `${Math.round(atual.memoriaUsada || 0)}MB`;
    document.getElementById('perf-arquivos').textContent = atual.arquivosProcessados || 0;

    renderPerformanceChart(data.baselines || []);
    renderAnalistasChart(data.metricas?.analistas || []);
  }

  function renderPerformanceChart(baselines) {
    const ctx = document.getElementById('perf-chart').getContext('2d');
    if (window.perfChart) window.perfChart.destroy();

    window.perfChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: baselines.map((_, i) => `T-${baselines.length - 1 - i}`),
        datasets: [
          {
            label: 'Tempo (ms)',
            data: baselines.map(b => b.tempoExecucao),
            borderColor: '#4ecdc4',
            backgroundColor: 'rgba(78, 205, 196, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y'
          },
          {
            label: 'Memória (MB)',
            data: baselines.map(b => b.memoriaUsada),
            borderColor: '#ff4757',
            backgroundColor: 'rgba(255, 71, 87, 0.1)',
            tension: 0.4,
            fill: true,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          y: { type: 'linear', display: true, position: 'left', grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#4ecdc4' } },
          y1: { type: 'linear', display: true, position: 'right', grid: { drawOnChartArea: false }, ticks: { color: '#ff4757' } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { labels: { color: '#a4b0be' } } }
      }
    });
  }

  function renderAnalistasChart(analistas) {
    const ctx = document.getElementById('analistas-chart').getContext('2d');
    if (window.analistasChart) window.analistasChart.destroy();

    const topAnalistas = analistas.filter(a => a.duracaoMs > 0).sort((a, b) => b.duracaoMs - a.duracaoMs).slice(0, 10);

    window.analistasChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topAnalistas.map(a => a.nome),
        datasets: [{
          label: 'Tempo (ms)',
          data: topAnalistas.map(a => a.duracaoMs),
          backgroundColor: 'rgba(78, 205, 196, 0.6)',
          borderColor: '#4ecdc4',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        scales: {
          x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#a4b0be' } },
          y: { grid: { display: false }, ticks: { color: '#a4b0be' } }
        },
        plugins: { legend: { display: false } }
      }
    });
  }


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
