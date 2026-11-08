#!/usr/bin/env node
/**
 * Startet einen kleinen statischen Server für das Pitch-Deck und öffnet
 * standardmäßig Firefox. Reines Node, keine zusätzlichen Abhängigkeiten.
 *
 *   npm run praesentation            # Server + Firefox
 *   npm run praesentation -- --no-open
 *   npm run praesentation -- --port 8911 --browser chromium
 */
import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const here = fileURLToPath(new URL('.', import.meta.url));
const rootDir = normalize(join(here, '..', 'praesentation'));

const args = process.argv.slice(2);
const readFlag = (name, fallback) => {
  const index = args.indexOf(`--${name}`);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};

const port = Number(readFlag('port', process.env.PORT ?? 8910));
const browser = readFlag('browser', 'firefox');
const shouldOpen = !args.includes('--no-open');

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

  const commands = browser === 'none' ? [] : browser === 'default' ? ['xdg-open', [url]] : [browser, [url]];
  if (!commands.length) return;

  const child = spawn(commands[0], commands[1], { stdio: 'ignore', detached: true });
  child.on('error', () => {
    spawn('xdg-open', [url], { stdio: 'ignore', detached: true }).on('error', () => {
      console.log('Browser bitte manuell öffnen.');
    }).unref();
  });
  child.unref();
});
