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

  // Drei Plätze für denselben QR: Titelfolie groß, Ecke, Abschlusskarte.
  const qrSpots = {
    title: document.querySelector('.title-qr img'),
    corner: document.querySelector('#cornerQr img'),
    final: document.querySelector('.qr-card img')
  };
  let qrFlight = null;

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
    const target = Math.max(0, Math.min(slides.length - 1, index));
    if (target === current) return;
    const fromKey = qrSpotFor(current);
    current = target;
    sync();
    flyQr(fromKey, qrSpotFor(current));
  }

  // Welcher QR-Platz gehört zu welcher Folie?
  function qrSpotFor(index) {
    const slide = slides[index];
    if (!slide) return null;
    if (slide.classList.contains('slide--title')) return 'title';
    if (slide.classList.contains('slide--qr')) return 'final';
    return qrVisible ? 'corner' : null;
  }

  function flyQr(fromKey, toKey) {
    if (!fromKey || !toKey || fromKey === toKey) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const fromNode = qrSpots[fromKey];
    const toNode = qrSpots[toKey];
    if (!fromNode || !toNode) return;

    if (qrFlight) { qrFlight.cancel(); qrFlight = null; }

    // Ganze weiße Kachel fliegen, nicht nur das QR-Muster – sonst springt der
    // Rahmen beim Abheben und Aufsetzen.
    const from = qrTileBox(fromNode, fromKey);
    const to = qrTileBox(toNode, toKey);
    if (!from || !to || !from.width || !to.width) return;
    if (Math.abs(from.width - to.width) < 1 && Math.abs(from.left - to.left) < 1 && Math.abs(from.top - to.top) < 1) return;

    const ghost = document.createElement('div');
    ghost.className = 'qr-flight';
    const ghostImage = document.createElement('img');
    ghostImage.src = toNode.currentSrc || toNode.src;
    ghostImage.alt = '';
    ghost.append(ghostImage);

    // Schatten und Fläche des Ziels übernehmen, damit der Wechsel am Ende
    // unsichtbar bleibt: der alte Schatten blendet aus, der neue ein.
    const plain = '0 10px 24px rgba(10, 24, 48, 0.12)';
    const hostOf = (node) => node.closest('.qr-card') ?? node;
    const shadowOf = (node) => {
      const value = getComputedStyle(hostOf(node)).boxShadow;
      return value && value !== 'none' ? value : plain;
    };
    ghost.style.setProperty('--qr-shadow-from', shadowOf(fromNode));
    ghost.style.setProperty('--qr-shadow-to', shadowOf(toNode));
    ghost.style.setProperty('--qr-surface', getComputedStyle(hostOf(toNode)).backgroundColor);

    ghost.style.width = `${from.width}px`;
    ghost.style.height = `${from.height}px`;
    ghost.style.padding = `${from.pad}px`;
    ghost.style.left = `${from.left}px`;
    ghost.style.top = `${from.top}px`;
    document.body.append(ghost);

    const dx = to.left - from.left;
    const dy = to.top - from.top;
    const scale = to.width / from.width;
    const radiusFrom = from.radius;
    const radiusTo = scale > 0 ? to.radius / scale : to.radius;

    // Quelle und Ziel während des Flugs ausblenden, damit nichts doppelt steht.
    const hidden = [fromNode, toNode];
    hidden.forEach((node) => { node.style.visibility = 'hidden'; });
    const restore = () => hidden.forEach((node) => { node.style.visibility = ''; });

    const animation = ghost.animate([
      { transform: 'translate3d(0, 0, 0) scale(1)', borderRadius: `${radiusFrom}px` },
      { transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`, borderRadius: `${radiusTo}px` }
    ], { duration: 780, easing: 'cubic-bezier(0.45, 0, 0.15, 1)', fill: 'forwards' });

    const cleanup = () => {
      ghost.remove();
      restore();
    };
    const hardStop = () => {
      cleanup();
      if (qrFlight && qrFlight.animation === animation) qrFlight = null;
    };
    const finish = () => {
      // Läuft schon ein neuer Flug? Dann den alten Geist nur aufräumen.
      if (!qrFlight || qrFlight.animation !== animation) { cleanup(); return; }
      qrFlight = null;
      // Auf der Zielposition warten, bis die Folie ihre Einblendung beendet hat –
      // sonst erscheint der echte QR versetzt unter dem fliegenden.
      settle(toNode, () => {
        restore();
        const fade = ghost.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 90, easing: 'linear', fill: 'forwards' });
        fade.onfinish = () => ghost.remove();
        fade.oncancel = () => ghost.remove();
      });
    };

    animation.onfinish = finish;
    qrFlight = { ghost, animation, cancel: hardStop };
  }

  // Wartet, bis das Zielelement vollständig sichtbar und nicht mehr verschoben ist.
  function settle(node, done) {
    const host = node.closest('.qr-card') ?? node;
    const start = performance.now();
    const check = () => {
      const style = getComputedStyle(host);
      const opacity = Number(style.opacity);
      const moved = style.transform !== 'none' && style.transform !== 'matrix(1, 0, 0, 1, 0, 0)';
      if ((opacity > 0.995 && !moved) || performance.now() - start > 1400) { done(); return; }
      requestAnimationFrame(check);
    };
    check();
  }

  // Äußere Lage ohne Transform der Folie – getBoundingClientRect würde die
  // halb eingeblendete Folie (26 px Versatz) und den Eck-QR (scale 0.9) liefern.
  function qrContentBox(node) {
    const style = getComputedStyle(node);
    const padLeft = parseFloat(style.paddingLeft) || 0;
    const padRight = parseFloat(style.paddingRight) || 0;
    const padTop = parseFloat(style.paddingTop) || 0;
    const padBottom = parseFloat(style.paddingBottom) || 0;
    const width = node.offsetWidth - padLeft - padRight;
    const height = node.offsetHeight - padTop - padBottom;
    if (!width || !height) return null;

    const host = node.closest('.corner-qr');
    if (host) {
      const hostStyle = getComputedStyle(host);
      const right = parseFloat(hostStyle.right) || 0;
      const top = parseFloat(hostStyle.top) || 0;
      return {
        left: window.innerWidth - right - node.offsetWidth + padLeft,
        top: top + padTop,
        width,
        height
      };
    }

    let left = 0;
    let top = 0;
    let el = node;
    while (el && el !== document.body) {
      left += el.offsetLeft;
      top += el.offsetTop;
      if (!el.offsetParent) break;
      el = el.offsetParent;
    }
    return { left: left + padLeft, top: top + padTop, width, height };
  }

  // Komplette Kachel inklusive weißem Rahmen – Verhältnis und Radius kommen
  // aus dem echten Element, damit der Übergang ohne Sprung passt.
  function qrTileBox(node, key) {
    const content = qrContentBox(node);
    if (!content) return null;
    const frame = key === 'final' ? (node.closest('.qr-card') ?? node) : node;
    const style = getComputedStyle(frame);
    const pad = parseFloat(style.paddingLeft) || 0;
    const radius = parseFloat(style.borderTopLeftRadius) || 0;
    return {
      left: content.left - pad,
      top: content.top - pad,
      width: content.width + pad * 2,
      height: content.height + pad * 2,
      pad,
      radius
    };
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
    writeStore('fly2you-deck-qr-size-v2', String(value));
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
  const storedSize = Number(readStore('fly2you-deck-qr-size-v2'));
  if (Number.isFinite(storedSize) && storedSize >= 80) setQrSize(storedSize);
  else setQrSize(138);

  sync();
})();
