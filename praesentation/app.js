/* Fly2You · Pitch-Deck — Navigation, Werkzeuge, QR, Notizen. */
(() => {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const deck = document.getElementById('deck');
  const progress = document.getElementById('progress');
  const counter = document.getElementById('counter');
  const overview = document.getElementById('overview');
  const overviewList = document.getElementById('overviewList');
  const notesPanel = document.getElementById('notes');
  const notesContent = document.getElementById('notesContent');
  const notesToggle = document.getElementById('notesToggle');
  const toolsPanel = document.getElementById('tools');
  const toolsButton = document.getElementById('toolsButton');
  const qrToggle = document.getElementById('qrToggle');
  const root = document.documentElement;

  if (!slides.length) return;

  const pad = (value) => String(value).padStart(2, '0');
  const readStore = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
  const writeStore = (key, value) => { try { localStorage.setItem(key, value); } catch { /* egal */ } };

  let current = Math.max(0, Math.min(slides.length - 1, Number(location.hash.replace('#', '')) - 1 || 0));
  let notesVisible = false;
  let toolsOpen = false;
  let qrVisible = readStore('fly2you-deck-qr') !== 'off';

  // Übersicht einmalig aufbauen
  slides.forEach((slide, index) => {
    const eyebrow = slide.querySelector('.eyebrow')?.textContent?.trim();
    const title = slide.querySelector('h1, h2')?.textContent?.replace(/\s+/g, ' ').trim() ?? `Folie ${index + 1}`;
    const item = document.createElement('li');
    item.innerHTML = '<button type="button"><span class="ov-index"></span><span class="ov-title"></span></button>';
    const button = item.querySelector('button');
    item.querySelector('.ov-index').textContent = pad(index + 1);
    item.querySelector('.ov-title').textContent = eyebrow ? `${eyebrow} · ${title}` : title;
    button.addEventListener('click', () => {
      show(index);
      toggleOverview(false);
    });
    overviewList.append(item);
  });

  function sync() {
    slides.forEach((slide, index) => {
      slide.classList.toggle('is-active', index === current);
      slide.classList.toggle('is-past', index < current);
      slide.setAttribute('aria-hidden', index === current ? 'false' : 'true');
    });
    progress.style.width = `${((current + 1) / slides.length) * 100}%`;
    counter.textContent = `${pad(current + 1)} / ${pad(slides.length)}`;
    overviewList.querySelectorAll('button').forEach((button, index) => {
      button.setAttribute('aria-current', index === current ? 'true' : 'false');
    });

    // QR in der Ecke auf der Abschlussfolie ausblenden.
    document.body.classList.toggle('qr-slide', slides[current]?.hasAttribute('data-qr-hide') ?? false);

    if (notesVisible) renderNotes();
    renderQr();
    try { history.replaceState(null, '', `#${current + 1}`); } catch { /* file:// in Firefox */ }
    animateCounters(slides[current]);
  }

  function show(index) {
    current = Math.max(0, Math.min(slides.length - 1, index));
    sync();
  }

  const next = () => show(current + 1);
  const prev = () => show(current - 1);

  // Zähler nur einmal je Folie hochzählen lassen.
  const counted = new WeakSet();
  function animateCounters(slide) {
    if (!slide || counted.has(slide)) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targets = slide.querySelectorAll('.stat[data-count]');
    targets.forEach((node) => {
      const target = Number(node.dataset.count);
      if (!Number.isFinite(target)) return;
      if (reduced) { node.textContent = String(target); return; }
      const start = performance.now();
      const duration = 900;
      const step = (now) => {
        const progressValue = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progressValue, 3);
        node.textContent = String(Math.round(target * eased));
        if (progressValue < 1) requestAnimationFrame(step);
      };
      node.textContent = '0';
      requestAnimationFrame(step);
    });
    counted.add(slide);
  }

  function toggleOverview(force) {
    const open = force ?? overview.hidden;
    overview.hidden = !open;
    if (open) {
      closeTools();
      overviewList.querySelector('button')?.focus();
    }
  }

  function renderNotes() {
    const notes = slides[current]?.querySelector('.notes')?.textContent?.trim() ?? '';
    const match = notes.match(/^(\d+)\s*s\.\s*/);
    const time = match ? `${match[1]} s` : '';
    const text = match ? notes.slice(match[0].length) : notes;

    notesContent.textContent = '';
    const label = document.createElement('strong');
    label.textContent = `Notizen · Folie ${current + 1}${time ? ` · ${time}` : ''}`;
    notesContent.append(label, document.createTextNode(text));
  }

  function toggleNotes(force) {
    notesVisible = force ?? !notesVisible;
    notesPanel.hidden = !notesVisible;
    notesToggle?.setAttribute('aria-pressed', String(notesVisible));
    if (notesToggle) notesToggle.textContent = notesVisible ? 'Ausblenden · N' : 'Anzeigen · N';
    if (notesVisible) {
      closeTools();
      renderNotes();
    }
  }

  function openTools() {
    toolsOpen = true;
    document.body.classList.remove('tools-hidden');
    toolsPanel.hidden = false;
    toolsButton?.setAttribute('aria-expanded', 'true');
  }

  function closeTools() {
    toolsOpen = false;
    toolsPanel.hidden = true;
    toolsButton?.setAttribute('aria-expanded', 'false');
  }

  function toggleTools() {
    if (toolsOpen) closeTools(); else openTools();
  }

  function toggleToolsBar(force) {
    const hidden = force ?? !document.body.classList.contains('tools-hidden');
    document.body.classList.toggle('tools-hidden', hidden);
    if (hidden) closeTools();
  }

  function setQrSize(size) {
    const value = Number(size);
    if (!Number.isFinite(value)) return;
    root.style.setProperty('--qr-size', `${value}px`);
    writeStore('fly2you-deck-qr-size', String(value));
    document.querySelectorAll('[data-qr-size]').forEach((button) => {
      button.setAttribute('aria-pressed', String(Number(button.dataset.qrSize) === value));
    });
  }

  function renderQr() {
    document.body.classList.toggle('qr-off', !qrVisible);
    qrToggle?.setAttribute('aria-pressed', String(qrVisible));
    if (qrToggle) qrToggle.textContent = qrVisible ? 'Sichtbar' : 'Ausgeblendet';
  }

  function toggleQr() {
    qrVisible = !qrVisible;
    writeStore('fly2you-deck-qr', qrVisible ? 'on' : 'off');
    renderQr();
  }

  function toggleTheme() {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    writeStore('fly2you-deck-theme', root.dataset.theme);
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen?.();
    else document.documentElement.requestFullscreen?.();
  }

  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;

    if (event.key === 'Tab') {
      event.preventDefault();
      toggleToolsBar();
      return;
    }

    if (event.key === 'Escape') {
      if (toolsOpen) { closeTools(); return; }
      if (!overview.hidden) { toggleOverview(false); return; }
      if (notesVisible) { toggleNotes(false); return; }
      if (document.body.classList.contains('tools-hidden')) toggleToolsBar(false);
      return;
    }

    if (!overview.hidden) return;

    switch (event.key) {
      case 'ArrowRight': case 'PageDown': case ' ': case 'Enter':
        event.preventDefault(); next(); break;
      case 'ArrowLeft': case 'PageUp':
        event.preventDefault(); prev(); break;
      case 'Home': event.preventDefault(); show(0); break;
      case 'End': event.preventDefault(); show(slides.length - 1); break;
      case 'f': case 'F': toggleFullscreen(); break;
      case 'o': case 'O': toggleOverview(); break;
      case 'n': case 'N': toggleNotes(); break;
      case 'd': case 'D': toggleTheme(); break;
      case 'q': case 'Q': toggleQr(); break;
      case 's': case 'S': toggleTools(); break;
      default: break;
    }
  }, { passive: false });

  document.querySelectorAll('[data-action]').forEach((button) => {
    button.addEventListener('click', () => {
      switch (button.dataset.action) {
        case 'next': next(); break;
        case 'prev': prev(); break;
        case 'overview': toggleOverview(); break;
        case 'notes': toggleNotes(); break;
        case 'theme': toggleTheme(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'tools': toggleTools(); break;
        case 'closeTools': closeTools(); break;
        case 'toggleQr': toggleQr(); break;
        default: break;
      }
    });
  });

  document.querySelectorAll('[data-qr-size]').forEach((button) => {
    button.addEventListener('click', () => {
      setQrSize(button.dataset.qrSize);
      closeTools();
    });
  });

  // Klick außerhalb schließt die Werkzeugleiste.
  document.addEventListener('click', (event) => {
    if (!toolsOpen) return;
    const target = event.target;
    if (target instanceof Element && (target.closest('#tools') || target.closest('#toolsButton'))) return;
    closeTools();
  });

  // Touch: horizontal wischen
  let touchX = null;
  deck?.addEventListener('touchstart', (event) => { touchX = event.touches[0]?.clientX ?? null; }, { passive: true });
  deck?.addEventListener('touchend', (event) => {
    if (touchX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? touchX) - touchX;
    touchX = null;
    if (Math.abs(delta) < 60) return;
    if (delta < 0) next(); else prev();
  }, { passive: true });

  // Gespeicherte Einstellungen übernehmen
  const storedTheme = readStore('fly2you-deck-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') root.dataset.theme = storedTheme;
  const storedSize = Number(readStore('fly2you-deck-qr-size'));
  if (Number.isFinite(storedSize) && storedSize >= 48) setQrSize(storedSize);
  else setQrSize(92);

  sync();
})();
