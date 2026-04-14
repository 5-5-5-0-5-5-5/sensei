// Prometheus Dashboard - Licenças Controller

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStats();
  initLicencasButton();
  loadLicencasData();

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

  function initLicencasButton() {
    document.getElementById('btn-executar-licencas')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-executar-licencas');
      const loading = document.getElementById('licencas-loading');
      const results = document.getElementById('licencas-results');

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Escaneando...';
      loading.classList.remove('hidden');
      results.classList.add('hidden');

      try {
        await loadLicencasData();
        loading.classList.add('hidden');
        results.classList.remove('hidden');
        showToast('Scan de licenças concluído!', 'success');
      } catch (err) {
        showToast('Erro no scan: ' + err, 'error');
        loading.classList.add('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-sync"></i> Atualizar';
      }
    });
  }

  async function loadLicencasData() {
    try {
      const res = await fetch('/api/v1/licensas/scan');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      renderLicencas(data);
    } catch (err) {
      console.error('Erro ao carregar licenças:', err);
      document.getElementById('licencas-results').innerHTML =
        '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar licenças</p></div>';
    }
  }

  function renderLicencas(data) {
    document.getElementById('licencas-total').textContent = data.totalPackages || 0;
    document.getElementById('licencas-validas').textContent = (data.totalFiltered || 0) - (data.problematicas?.length || 0);
    document.getElementById('licencas-problematicas').textContent = data.problematicas?.length || 0;

    renderLicencasChart(data.distribuicao);

    const topList = document.getElementById('licencas-top-list');
    topList.innerHTML = '';
    (data.licencas || []).slice(0, 8).forEach(([licenca, count]) => {
      const li = document.createElement('li');
      li.className = 'license-item';
      const spanName = document.createElement('span');
      spanName.className = 'license-name';
      spanName.textContent = licenca || '';
      const spanCount = document.createElement('span');
      spanCount.className = 'license-count';
      spanCount.textContent = String(count);
      li.appendChild(spanName);
      li.appendChild(spanCount);
      topList.appendChild(li);
    });

    const tbody = document.getElementById('licencas-problematicas-body');
    tbody.innerHTML = '';
    (data.problematicas || []).forEach(pkg => {
      const tr = document.createElement('tr');
      const tdNome = document.createElement('td');
      tdNome.textContent = pkg.name || '';
      const tdVersao = document.createElement('td');
      tdVersao.textContent = pkg.version || '';
      const tdLicenca = document.createElement('td');
      const spanLicenca = document.createElement('span');
      spanLicenca.className = 'severity erro';
      spanLicenca.textContent = 'UNKNOWN';
      tdLicenca.appendChild(spanLicenca);
      const tdRepo = document.createElement('td');
      tdRepo.textContent = pkg.repository || '-';
      tr.appendChild(tdNome);
      tr.appendChild(tdVersao);
      tr.appendChild(tdLicenca);
      tr.appendChild(tdRepo);
      tbody.appendChild(tr);
    });

    if (data.problematicas?.length === 0) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text-muted);"><i class="fas fa-check-circle"></i> Nenhuma licença problemática encontrada</td></tr>';
    }
  }

  function renderLicencasChart(distribuicao) {
    const ctx = document.getElementById('licencas-chart').getContext('2d');
    if (window.licencasChart) window.licencasChart.destroy();

    window.licencasChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Permissivas', 'Copyleft', 'Desconhecidas'],
        datasets: [{
          data: [distribuicao?.permissivas || 0, distribuicao?.copyleft || 0, distribuicao?.desconhecidas || 0],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { color: '#a4b0be', padding: 15 } }
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
