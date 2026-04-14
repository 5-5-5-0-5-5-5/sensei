// Prometheus Dashboard - Análise de Código Controller

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStats();
  initAnalysisButton();

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

  function initAnalysisButton() {
    document.getElementById('btn-executar-analise')?.addEventListener('click', async () => {
      const btn = document.getElementById('btn-executar-analise');
      const loading = document.getElementById('analise-loading');
      const results = document.getElementById('analise-results');

      btn.disabled = true;
      btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Executando...';
      loading.classList.remove('hidden');
      results.classList.add('hidden');

      try {
        const res = await fetch('/api/v1/comando/diagnosticar/detalhado', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ full: true, fast: true })
        });
        const data = await res.json();

        if (data.success) {
          renderAnalysisResults(data);
          loading.classList.add('hidden');
          results.classList.remove('hidden');
          showToast('Análise concluída com sucesso!', 'success');
          results.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } catch (err) {
        showToast('Erro na análise: ' + err, 'error');
        loading.classList.add('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-play"></i> Executar Análise';
      }
    });
  }

  function renderAnalysisResults(data) {
    document.getElementById('analise-erros').textContent = data.ocorrenciasPorNivel?.erro || 0;
    document.getElementById('analise-avisos').textContent = data.ocorrenciasPorNivel?.aviso || 0;
    document.getElementById('analise-info').textContent = data.ocorrenciasPorNivel?.info || 0;
    document.getElementById('analise-arquivos').textContent = data.metricas?.totalArquivos || 0;
    document.getElementById('analise-tempo').textContent = `${Math.round(data.metricas?.tempoAnalise || 0)}ms`;

    const tbody = document.getElementById('analise-problemas-body');
    tbody.innerHTML = '';

    const ocorrencias = data.ocorrencias || [];
    ocorrencias.slice(0, 50).forEach(oc => {
      const tr = document.createElement('tr');
      const tdTipo = document.createElement('td');
      tdTipo.textContent = oc.tipo || 'N/A';
      const tdMsg = document.createElement('td');
      tdMsg.textContent = oc.mensagem || '';
      const tdArquivo = document.createElement('td');
      tdArquivo.textContent = oc.relPath || '';
      const tdLinha = document.createElement('td');
      tdLinha.textContent = oc.linha || '-';
      const tdNivel = document.createElement('td');
      const spanNivel = document.createElement('span');
      spanNivel.className = `severity ${oc.nivel || 'info'}`;
      spanNivel.textContent = oc.nivel || 'info';
      tdNivel.appendChild(spanNivel);
      tr.appendChild(tdTipo);
      tr.appendChild(tdMsg);
      tr.appendChild(tdArquivo);
      tr.appendChild(tdLinha);
      tr.appendChild(tdNivel);
      tbody.appendChild(tr);
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
