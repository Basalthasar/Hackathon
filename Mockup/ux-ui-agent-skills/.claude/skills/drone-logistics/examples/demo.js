/* demo.js - interactions for the two drone-logistics examples.
 * No framework, no network, no fabricated live connection. Every change is a
 * local demonstration of a state the real product must handle. */

(function () {
  'use strict';

  var html = document.documentElement;

  function text(node, value) {
    if (node) node.textContent = value;
  }

  function show(node, visible) {
    if (!node) return;
    if (visible) node.removeAttribute('hidden');
    else node.setAttribute('hidden', '');
  }

  function setPressed(node, pressed) {
    if (node) node.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }

  /* Theme ---------------------------------------------------------------- */
  var themeBtn = document.querySelector('[data-theme-toggle]');
  if (themeBtn) {
    var syncTheme = function () {
      var dark = html.getAttribute('data-theme') === 'dark';
      var use = themeBtn.querySelector('use');
      if (use) use.setAttribute('href', dark ? '#i-sun' : '#i-moon');
      text(themeBtn.querySelector('.lbl'), dark ? 'Light' : 'Dark');
      themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      setPressed(themeBtn, dark);
    };
    themeBtn.addEventListener('click', function () {
      html.setAttribute('data-theme', html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
      syncTheme();
    });
    syncTheme();
  }

  /* Consumer ------------------------------------------------------------- */
  var delivery = document.getElementById('delivery');
  if (delivery) {
    var codeBtn = document.getElementById('show-code');
    var codeBox = document.getElementById('code-box');
    var staleBtn = document.getElementById('stale-toggle');
    var deliverBtn = document.getElementById('deliver-toggle');
    var resetBtn = document.getElementById('reset-demo');
    var statusLabel = document.getElementById('status-label');
    var statusBadge = document.getElementById('status-badge');
    var freshness = document.getElementById('freshness-text');
    var mapNote = document.getElementById('map-note');
    var heading = document.getElementById('delivery-title');

    if (codeBtn && codeBox) {
      codeBtn.addEventListener('click', function () {
        var open = codeBtn.getAttribute('aria-expanded') === 'true';
        codeBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
        show(codeBox, !open);
        text(codeBtn, open ? 'Show handover code' : 'Hide handover code');
      });
    }

    if (staleBtn) {
      staleBtn.addEventListener('click', function () {
        var stale = delivery.getAttribute('data-stale') === 'true';
        delivery.setAttribute('data-stale', stale ? 'false' : 'true');
        setPressed(staleBtn, !stale);
        text(staleBtn, stale ? 'Simulate stale feed' : 'Restore live feed');
        text(freshness, stale ? 'Position stale for 2 min' : 'Updated 4 sec ago');
        text(mapNote, stale ? 'Stale. Do not use for handover.' : 'Last observed 4 sec ago');
      });
    }

    if (deliverBtn) {
      deliverBtn.addEventListener('click', function () {
        var delivered = deliverBtn.getAttribute('aria-pressed') === 'true';
        setPressed(deliverBtn, !delivered);
        if (!delivered) {
          text(statusLabel, 'Delivered');
          statusBadge.className = 'badge b-ok';
          text(heading, 'Delivered at 14:24');
          text(freshness, 'Completed just now');
          text(deliverBtn, 'Undo delivered');
        } else {
          resetConsumer();
        }
      });
    }

    var resetConsumer = function () {
      delivery.setAttribute('data-stale', 'false');
      setPressed(staleBtn, false);
      text(staleBtn, 'Simulate stale feed');
      setPressed(deliverBtn, false);
      text(deliverBtn, 'Mark delivered');
      text(statusLabel, 'On its way');
      statusBadge.className = 'badge b-info';
      text(heading, 'Arriving 14:20 to 14:35');
      text(freshness, 'Updated 4 sec ago');
      text(mapNote, 'Last observed 4 sec ago');
      if (codeBtn && codeBox) {
        codeBtn.setAttribute('aria-expanded', 'false');
        show(codeBox, false);
        text(codeBtn, 'Show handover code');
      }
    };

    if (resetBtn) resetBtn.addEventListener('click', resetConsumer);
  }

  /* Operations ----------------------------------------------------------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var seconds = 14 * 3600 + 12 * 60 + 6;
    setInterval(function () {
      seconds += 1;
      var h = Math.floor(seconds / 3600) % 24;
      var m = Math.floor(seconds / 60) % 60;
      var s = seconds % 60;
      var pad = function (n) { return String(n).padStart(2, '0'); };
      text(clock, pad(h) + ':' + pad(m) + ':' + pad(s));
    }, 1000);
  }

  var missionData = {
    'M-2043': { battery: '54%', reserve: '12%', altitude: '72 m', speed: '9.8 m/s', link: 'Degraded', wind: '11.2 m/s' },
    'M-2038': { battery: '18%', reserve: '6%', altitude: '34 m', speed: '11.4 m/s', link: 'Good', wind: '7.1 m/s' },
    'M-2041': { battery: '71%', reserve: '24%', altitude: '60 m', speed: '14.2 m/s', link: 'Good', wind: '6.4 m/s' },
    'M-2036': { battery: '42%', reserve: '16%', altitude: '48 m', speed: '12.6 m/s', link: 'Good', wind: '5.8 m/s' },
    'M-2032': { battery: '88%', reserve: '31%', altitude: '66 m', speed: '13.1 m/s', link: 'Good', wind: '6.0 m/s' }
  };

  var selectedTitle = document.getElementById('selected-title');
  var batteryMeter = document.querySelector('#selected-mission .meter');
  var missionButtons = document.querySelectorAll('[data-mission]');
  for (var i = 0; i < missionButtons.length; i++) {
    missionButtons[i].addEventListener('click', function () {
      var id = this.getAttribute('data-mission');
      var data = missionData[id];
      if (!data) return;
      for (var j = 0; j < missionButtons.length; j++) setPressed(missionButtons[j], missionButtons[j] === this);
      text(selectedTitle, id + ' · telemetry');
      text(document.getElementById('t-battery'), data.battery);
      text(document.getElementById('t-reserve'), data.reserve);
      text(document.getElementById('t-altitude'), data.altitude);
      text(document.getElementById('t-speed'), data.speed);
      text(document.getElementById('t-link'), data.link);
      text(document.getElementById('t-wind'), data.wind);
      if (batteryMeter) batteryMeter.querySelector('i').style.inlineSize = data.battery;
      text(document.getElementById('command-note'), 'Selected ' + id + '. Telemetry is demo data.');
    });
  }

  var filterButtons = document.querySelectorAll('[data-filter]');
  var rows = document.querySelectorAll('#mission-rows tr');
  for (var f = 0; f < filterButtons.length; f++) {
    filterButtons[f].addEventListener('click', function () {
      var filter = this.getAttribute('data-filter');
      for (var k = 0; k < filterButtons.length; k++) setPressed(filterButtons[k], filterButtons[k] === this);
      for (var r = 0; r < rows.length; r++) {
        var state = rows[r].getAttribute('data-state');
        var visible = filter === 'all' || state === filter;
        if (visible) rows[r].removeAttribute('hidden');
        else rows[r].setAttribute('hidden', '');
      }
    });
  }

  var ackNote = document.getElementById('ack-note');
  var ackButtons = document.querySelectorAll('[data-ack]');
  for (var a = 0; a < ackButtons.length; a++) {
    ackButtons[a].addEventListener('click', function () {
      var pressed = this.getAttribute('aria-pressed') === 'true';
      setPressed(this, !pressed);
      text(this, pressed ? 'Acknowledge' : 'Acknowledged');
      if (ackNote) {
        text(ackNote, pressed
          ? 'Acknowledgement withdrawn.'
          : 'Acknowledgement recorded with your name and timestamp.');
      }
    });
  }

  function closeConfirm(id) {
    var panel = document.getElementById(id);
    var trigger = document.getElementById(id === 'hold-confirm' ? 'hold-btn' : 'rth-btn');
    show(panel, false);
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
  }

  var holdBtn = document.getElementById('hold-btn');
  var rthBtn = document.getElementById('rth-btn');
  if (holdBtn) {
    holdBtn.addEventListener('click', function () {
      var open = holdBtn.getAttribute('aria-expanded') === 'true';
      closeConfirm('rth-confirm');
      holdBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      show(document.getElementById('hold-confirm'), !open);
    });
  }
  if (rthBtn) {
    rthBtn.addEventListener('click', function () {
      var open = rthBtn.getAttribute('aria-expanded') === 'true';
      closeConfirm('hold-confirm');
      rthBtn.setAttribute('aria-expanded', open ? 'false' : 'true');
      show(document.getElementById('rth-confirm'), !open);
    });
  }

  var cancelButtons = document.querySelectorAll('[data-cancel]');
  for (var c = 0; c < cancelButtons.length; c++) {
    cancelButtons[c].addEventListener('click', function () {
      closeConfirm(this.getAttribute('data-cancel'));
    });
  }

  var confirmButtons = document.querySelectorAll('[data-confirm]');
  for (var cf = 0; cf < confirmButtons.length; cf++) {
    confirmButtons[cf].addEventListener('click', function () {
      var kind = this.getAttribute('data-confirm');
      var id = this.getAttribute('data-mission');
      closeConfirm(kind === 'hold' ? 'hold-confirm' : 'rth-confirm');
      text(document.getElementById('command-note'),
        kind === 'hold'
          ? 'Hold requested for ' + id + '. Awaiting pilot acknowledgement.'
          : 'Return requested for ' + id + '. Awaiting pilot acknowledgement.');
    });
  }
}());
