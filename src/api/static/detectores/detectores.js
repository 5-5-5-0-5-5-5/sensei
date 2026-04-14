// Prometheus Dashboard - Detectores Controller

document.addEventListener('DOMContentLoaded', () => {
  if (!document.getElementById('toast-container')) {
    const tc = document.createElement('div');
    tc.id = 'toast-container';
    document.body.appendChild(tc);
  }

  initMusicPlayer();
  loadProjectStats();
  loadAnalistas();

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

  async function loadAnalistas() {
    const listEl = document.getElementById('analista-list');

    try {
      const res = await fetch('/api/v1/analistas/lista');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      document.getElementById('total-detectores').textContent = data.categorias?.detectores || 0;
      document.getElementById('total-plugins').textContent = data.categorias?.plugins || 0;
      document.getElementById('total-tecnicas').textContent = data.categorias?.tecnicas || 0;

      renderAnalistaList(data.analistas || []);
    } catch (err) {
      console.error('Erro ao carregar analistas:', err);
      listEl.innerHTML = '<div class="error-state"><i class="fas fa-exclamation-triangle"></i><p>Erro ao carregar analistas</p></div>';
    }
  }

  function renderAnalistaList(analistas) {
    const listEl = document.getElementById('analista-list');
    listEl.innerHTML = '';

    const porCategoria = {};
    analistas.forEach(a => {
      const cat = a.categoria || 'Geral';
      if (!porCategoria[cat]) porCategoria[cat] = [];
      porCategoria[cat].push(a);
    });

    Object.entries(porCategoria).forEach(([categoria, items]) => {
      const section = document.createElement('div');
      section.className = 'analista-category';
      section.style.gridColumn = '1 / -1';

      const title = document.createElement('h4');
      title.style.cssText = 'color: var(--primary); margin: 1rem 0; font-family: Cinzel, serif;';
      const icon = document.createElement('i');
      icon.className = 'fas fa-folder';
      icon.style.marginRight = '8px';
      title.appendChild(icon);
      title.appendChild(document.createTextNode(` ${categoria} (${items.length})`));
      section.appendChild(title);

      const grid = document.createElement('div');
      grid.className = 'analista-grid';

      items.forEach(analista => {
        const card = document.createElement('div');
        card.className = 'analista-card';
        const nameDiv = document.createElement('div');
        nameDiv.className = 'analista-name';
        nameDiv.textContent = analista.nome || '';
        const descDiv = document.createElement('div');
        descDiv.className = 'analista-desc';
        descDiv.textContent = analista.descricao || 'Sem descrição';
        card.appendChild(nameDiv);
        card.appendChild(descDiv);
        grid.appendChild(card);
      });

      section.appendChild(grid);
      listEl.appendChild(section);
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
