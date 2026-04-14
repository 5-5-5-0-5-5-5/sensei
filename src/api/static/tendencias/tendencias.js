// Prometheus Dashboard - Tendências Controller

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStats();
  loadTrends();

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

  async function loadTrends() {
    const container = document.getElementById('trend-chart-container');
    const loading = document.getElementById('tendencias-loading');

    if (loading) loading.classList.remove('hidden');

    try {
      const res = await fetch('/api/v1/repositorio/metricas');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Sem dados históricos</p></div>';
        return;
      }

      renderTrendChart(data);
    } catch (err) {
      console.error('Erro ao carregar tendências:', err);
      container.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar dados</p></div>';
      showToast('Erro ao carregar tendências', 'error');
    } finally {
      if (loading) loading.classList.add('hidden');
    }
  }

  function renderTrendChart(data) {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    if (window.myChart) window.myChart.destroy();

    window.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => new Date(d.timestamp).toLocaleDateString()),
        datasets: [{
          label: 'Score de Saúde',
          data: data.map(d => d.score),
          borderColor: '#ff4757',
          tension: 0.4,
          fill: true,
          backgroundColor: 'rgba(255, 71, 87, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, grid: { color: 'rgba(255,255,255,0.05)' } },
          x: { grid: { display: false } }
        }
      }
    });
  }

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
