document.addEventListener('DOMContentLoaded', () => {
  initNavActiveState();
  initHeroIntro();
  initIpCopyButton();
  initServerStatusWidget();
});

function initNavActiveState() {
  const page = document.body.dataset.page;
  if (!page) return;
  document.querySelectorAll('.slot[data-nav]').forEach((slot) => {
    if (slot.dataset.nav === page) slot.setAttribute('aria-current', 'page');
  });
}

function initHeroIntro() {
  const hero = document.querySelector('[data-intro]');
  if (!hero) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  hero.classList.add('intro-run');
}

function initIpCopyButton() {
  const btn = document.querySelector('[data-copy-ip]');
  if (!btn) return;
  const feedback = document.querySelector('[data-role="copy-feedback"]');

  btn.addEventListener('click', async () => {
    const value = btn.getAttribute('data-copy-ip') || 'gubicraft.de';
    try {
      await navigator.clipboard.writeText(value);
      showCopyFeedback();
    } catch {
      if (legacyCopy(value)) showCopyFeedback();
    }
  });

  function showCopyFeedback() {
    btn.classList.add('is-pressed');
    const original = btn.textContent;
    btn.textContent = 'Kopiert!';
    if (feedback) feedback.textContent = 'In die Zwischenablage kopiert.';
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('is-pressed');
      if (feedback) feedback.textContent = '';
    }, 1600);
  }

  function legacyCopy(value) {
    const area = document.createElement('textarea');
    area.value = value;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch { ok = false; }
    document.body.removeChild(area);
    return ok;
  }
}

function initServerStatusWidget() {
  const root = document.getElementById('server-status');
  if (!root) return;

  const ENDPOINT = 'https://api.mcsrvstat.us/3/gubicraft.de';
  const POLL_MS = 60000;

  const messageEl = root.querySelector('[data-role="message"]');
  const bodyEl = root.querySelector('[data-role="body"]');
  const stateLabelEl = root.querySelector('[data-role="state-label"]');
  const countEl = root.querySelector('[data-role="player-count"]');
  const motdEl = root.querySelector('[data-role="motd"]');
  const playersEl = root.querySelector('[data-role="players"]');

  setState('loading');
  fetchStatus();
  setInterval(fetchStatus, POLL_MS);

  async function fetchStatus() {
    try {
      const res = await fetch(ENDPOINT, { cache: 'no-store' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      render(data);
    } catch (err) {
      setState('error');
    }
  }

  function render(data) {
    if (!data || data.online === false) {
      setState('offline', data);
      return;
    }
    setState('online', data);
  }

  function setState(state, data) {
    root.dataset.state = state;

    if (state === 'loading') {
      messageEl.textContent = 'Verbinde mit Server…';
      messageEl.hidden = false;
      bodyEl.hidden = true;
      return;
    }
    if (state === 'error') {
      messageEl.textContent = 'Serverstatus derzeit nicht abrufbar.';
      messageEl.hidden = false;
      bodyEl.hidden = true;
      return;
    }

    messageEl.hidden = true;
    bodyEl.hidden = false;

    if (state === 'offline') {
      stateLabelEl.textContent = 'Offline';
      countEl.textContent = '';
      motdEl.textContent = '';
      motdEl.hidden = true;
      playersEl.hidden = true;
      playersEl.replaceChildren();
      return;
    }

    stateLabelEl.textContent = 'Online';
    countEl.textContent = getPlayerText(data);

    const motdLines = getMotd(data);
    if (motdLines.length) {
      motdEl.textContent = motdLines.join('\n');
      motdEl.hidden = false;
    } else {
      motdEl.hidden = true;
    }

    renderPlayerHeads(getPlayerList(data));
  }

  function getMotd(data) {
    const clean = data.motd && data.motd.clean;
    if (Array.isArray(clean)) return clean.filter(Boolean);
    if (typeof clean === 'string' && clean.trim()) return [clean];
    return [];
  }

  function getPlayerText(data) {
    const online = data.players && typeof data.players.online === 'number' ? data.players.online : '?';
    const max = data.players && typeof data.players.max === 'number' ? data.players.max : '?';
    return online + ' / ' + max + ' Spieler';
  }

  function getPlayerList(data) {
    return data.players && Array.isArray(data.players.list) ? data.players.list : [];
  }

  function renderPlayerHeads(players) {
    playersEl.replaceChildren();
    const named = players.filter((p) => p && p.name);
    if (named.length === 0) {
      playersEl.hidden = true;
      return;
    }
    playersEl.hidden = false;
    for (const p of named) {
      const fig = document.createElement('figure');
      fig.className = 'player-chip';
      const img = document.createElement('img');
      img.src = 'https://mc-heads.net/avatar/' + encodeURIComponent(p.name) + '/32';
      img.alt = p.name;
      img.width = 32;
      img.height = 32;
      img.loading = 'lazy';
      const cap = document.createElement('figcaption');
      cap.textContent = p.name;
      fig.append(img, cap);
      playersEl.append(fig);
    }
  }
}
