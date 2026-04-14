// Prometheus Dashboard - Saúde do Projeto Controller

document.addEventListener('DOMContentLoaded', () => {
  // Toast container fallback
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStatus();
  initToolButtons();

  async function loadProjectStatus() {
    const integrityEl = document.getElementById('status-integridade');
    if (integrityEl) integrityEl.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
      const res = await fetch('/api/v1/repositorio/status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const el = document.getElementById('status-integridade');
      if (el) el.textContent = data.saude || 'OK';

      const wfEl = document.getElementById('info-workflows');
      if (wfEl) wfEl.textContent = data.metricas?.workflows || '0';

      const verEl = document.getElementById('info-versao');
      if (verEl) verEl.textContent = data.versao || '0.6.0';

      const filesEl = document.getElementById('info-files');
      if (filesEl && data.metricas?.totalFiles) filesEl.textContent = data.metricas.totalFiles;

      const depsEl = document.getElementById('info-dependencies');
      if (depsEl && data.metricas?.dependencies !== undefined) depsEl.textContent = data.metricas.dependencies;

      const guardianDesc = document.getElementById('guardian-desc');
      if (guardianDesc && data.metricas?.integridade) guardianDesc.textContent = data.metricas.integridade;

      if (data.metricas?.radar) renderRadarChart(data.metricas.radar);

      const healthBar = document.querySelector('.health-bar .fill');
      if (healthBar && data.metricas?.radar) {
        const avgScore = Object.values(data.metricas.radar).reduce((a, b) => a + b, 0) / 5;
        healthBar.style.width = `${avgScore}%`;
        if (avgScore >= 80) healthBar.style.background = 'var(--success)';
        else if (avgScore >= 60) healthBar.style.background = 'var(--warning)';
        else healthBar.style.background = 'var(--critical)';
      }
    } catch (err) {
      console.error('Erro ao obter status:', err);
      const el = document.getElementById('status-integridade');
      if (el) { el.textContent = 'Erro'; el.style.color = 'var(--critical)'; }
      showToast('Erro ao carregar status do projeto', 'error');
    }
  }

  function renderRadarChart(radarData) {
    const ctx = document.getElementById('radar-chart').getContext('2d');
    if (window.radarChart) window.radarChart.destroy();

    window.radarChart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Segurança', 'Performance', 'Documentação', 'Arquitetura', 'Qualidade'],
        datasets: [{
          label: 'Saúde do Projeto',
          data: [radarData.seguranca || 0, radarData.performance || 0, radarData.documentacao || 0, radarData.arquitetura || 0, radarData.qualidade || 0],
          backgroundColor: 'rgba(78, 205, 196, 0.2)',
          borderColor: '#4ecdc4',
          pointBackgroundColor: '#4ecdc4',
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: { color: '#a4b0be', font: { size: 12 } },
            ticks: { display: false, max: 100, min: 0, stepSize: 20 }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  }

  function initToolButtons() {
    document.getElementById('btn-diagnosticar')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-diagnosticar');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executando...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/v1/comando/diagnosticar', { method: 'POST' });
        const data = await res.json();
        showToast(data.message || 'Diagnóstico Concluído!', 'success');
        loadProjectStatus();
      } catch (err) {
        showToast('Erro na execução: ' + err, 'error');
      } finally {
        btn.innerHTML = '<i class="fas fa-stethoscope"></i> Diagnosticar';
        btn.disabled = false;
      }
    });

    document.getElementById('btn-otimizar')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-otimizar');
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Otimizando...';
      btn.disabled = true;
      try {
        const res = await fetch('/api/v1/comando/otimizar-svg', { method: 'POST' });
        const data = await res.json();
        showToast(`Otimização concluída! ${data.otimizados} arquivos processados.`, 'success');
      } catch (err) {
        showToast('Erro na otimização: ' + err, 'error');
      } finally {
        btn.innerHTML = '<i class="fas fa-compress-arrows-alt"></i> Otimizar SVG';
        btn.disabled = false;
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
