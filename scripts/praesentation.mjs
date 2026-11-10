#!/usr/bin/env node
/**
 * Startet einen kleinen statischen Server für das Pitch-Deck und öffnet
 * den gewünschten Browser. Reines Node, keine zusätzlichen Abhängigkeiten –
 * läuft auf Linux, macOS und Windows.
 *
 *   npm run praesentation            # Server + Firefox
 *   npm run praesentation -- --no-open
 *   npm run praesentation -- --port 8911 --browser chromium
 *   npm run praesentation -- --browser default   # Systemstandard (Safari auf macOS)
 *   npm run praesentation -- --dir ../pitch-deck-export
 *
 * Findet sich der Wunschbrowser nicht, wird der Systemstandard geöffnet; klappt
 * auch das nicht, bleibt die URL zum manuellen Öffnen stehen.
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = fileURLToPath(new URL('.', import.meta.url));
const platform = process.platform;

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};

const port = Number(readFlag('port', process.env.PORT ?? 8910));
const browser = readFlag('browser', 'firefox');
const shouldOpen = !args.includes('--no-open');
const rootDir = resolveDeckRoot(readFlag('dir', null));

// Im Repo liegt das Deck neben scripts/, im Exportordner direkt neben dem
// Startskript – deshalb wird der Ordner mit index.html gesucht, nicht geraten.
function resolveDeckRoot(dirFlag) {
  // normalize() behält einen abschließenden Trenner; der würde die spätere
  // Prüfung auf Pfad-Ausbrüche (rootDir + sep) kaputt machen.
  const clean = (value) => normalize(value).replace(/[\\/]+$/, '');
  if (dirFlag) return clean(resolve(dirFlag));
  const candidates = [join(here, '..', 'praesentation'), here, join(here, '..')];
  for (const candidate of candidates) {
    if (existsSync(join(candidate, 'index.html'))) return clean(candidate);
  }
  return clean(join(here, '..', 'praesentation'));
}

// Anzeigenamen für `open -a` unter macOS.
const appNames = {
  firefox: 'Firefox',
  chromium: 'Chromium',
  chrome: 'Google Chrome',
  safari: 'Safari',
  edge: 'Microsoft Edge'
};

// Kandidaten in Wunschreihenfolge: erst der gewünschte Browser, dann der
// Systemstandard. Auf macOS geht das über `open`, auf Windows über `start`.
function openCandidates(url) {
  if (browser === 'none') return [];
  const list = [];

  if (browser !== 'default') {
    if (platform === 'darwin') list.push(['open', ['-a', appNames[browser] ?? browser, url]]);
    else if (platform === 'win32') list.push(['cmd', ['/c', 'start', '', browser, url]]);
    list.push([browser, [url]]);
  }

  if (platform === 'darwin') list.push(['open', [url]]);
  else if (platform === 'win32') list.push(['cmd', ['/c', 'start', '', url]]);
  else list.push(['xdg-open', [url]]);

  return list;
}

// Startet einen Kandidaten. GUI-Browser laufen weiter, deshalb gilt "nach
// kurzer Zeit noch am Leben" als Erfolg; ein Fehlstart meldet sich per exit.
function launch([command, commandArgs]) {
  return new Promise((resolve) => {
    let child;
    try {
      child = spawn(command, commandArgs, { stdio: 'ignore', detached: true });
    } catch {
      resolve(false);
      return;
    }
    child.unref();

    let settled = false;
    const settle = (ok) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(ok);
    };
    const timer = setTimeout(() => settle(true), 700);
    child.on('error', () => settle(false));
    child.on('exit', (code) => settle(code === 0));
  });
}

async function openBrowser(url) {
  for (const candidate of openCandidates(url)) {
    if (await launch(candidate)) return candidate[0];
  }
  return null;
}

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8'
};

async function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  const relative = clean === '/' ? 'index.html' : clean.replace(/^\/+/, '');
  const target = normalize(join(rootDir, relative));

  // Kein Ausbruch aus dem Präsentationsordner.
  if (!target.startsWith(rootDir + sep) && target !== rootDir) return null;

  try {
    const info = await stat(target);
    if (info.isDirectory()) {
      const indexFile = join(target, 'index.html');
      const indexInfo = await stat(indexFile);
      return indexInfo.isFile() ? indexFile : null;
    }
    return info.isFile() ? target : null;
  } catch {
    return null;
  }
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url ?? '/');

  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Nicht gefunden. Deck startet unter /');
    return;
  }

  res.writeHead(200, {
    'content-type': mime[extname(file).toLowerCase()] ?? 'application/octet-stream',
    'cache-control': 'no-cache'
  });
  createReadStream(file).pipe(res);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} ist belegt. Anderen Port wählen: npm run praesentation -- --port ${port + 1}`);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
});

server.listen(port, () => {
  const url = `http://localhost:${port}/`;
  console.log(`Pitch-Deck läuft auf ${url}`);
  console.log('Steuerung: ←/→ · TAB Werkzeuge · O Übersicht · N Notizen · F Vollbild · Q QR · D Hell/Dunkel');
  if (!shouldOpen) return;

  openBrowser(url).then((opened) => {
    if (opened) console.log(`Browser geöffnet (${opened}).`);
    else console.log(`Browser bitte manuell öffnen: ${url}`);
  });
});
