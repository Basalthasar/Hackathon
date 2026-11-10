#!/usr/bin/env node
/**
 * Baut einen eigenständigen Ordner, den man weitergeben oder zippen kann.
 *
 *   npm run praesentation:export        # Ordner pitch-deck-export/ erzeugen
 *   npm run praesentation:export -- --zip
 *
 * Im Zielordner landet nur, was das Deck zum Laufen braucht: HTML, CSS, JS,
 * Assets und ein Startskript ohne Abhängigkeiten. Kein node_modules, kein
 * package.json, kein Build-Schritt.
 */
import { cp, chmod, mkdir, rm, stat, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repo = join(here, '..');
const source = join(repo, 'praesentation');
const target = join(repo, 'pitch-deck-export');

const steps = [];

async function copy(relativePath, options = {}) {
  await cp(join(source, relativePath), join(target, relativePath), { recursive: true, ...options });
  steps.push(relativePath);
}

async function sizeOfDir(dir) {
  let total = 0;
  const { readdir } = await import('node:fs/promises');
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) total += await sizeOfDir(full);
    else total += (await stat(full)).size;
  }
  return total;
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });

for (const file of ['index.html', 'styles.css', 'app.js']) await copy(file);
await copy('assets');

// Derselbe Server wie im Repo, nur umbenannt: er findet das Deck neben sich.
await cp(join(here, 'praesentation.mjs'), join(target, 'start.mjs'));
await chmod(join(target, 'start.mjs'), 0o755);

const liesmich = `Fly2You · Pitch-Deck
====================

Zehn Folien im Stil der Website: Plattform, Produkt, Grenzen, Werkzeuge und
Team, dazu ein QR-Code zur Live-Demo.

SCHNELLSTART
------------
index.html doppelklicken. Fertig. Das Deck läuft in jedem aktuellen Browser
(Chrome, Edge, Firefox, Safari ab 16.4) und braucht kein Internet, weil alle
Bilder und Logos im Ordner liegen.


MIT SERVER STARTEN (optional)
-----------------------------
Empfohlen, wenn du den QR-Code vom Handy scannen willst: dann sind Rechner und
Handy im selben WLAN und der Link funktioniert direkt.

  Linux / macOS:   ./start.sh          (oder: node start.mjs)
                   ./start.command     (macOS, Doppelklick im Finder)
  Windows:         start.cmd doppelklicken
  Ohne Node:       node start.mjs      (Node 18 oder neuer, sonst nichts nötig)

Der Server meldet sich auf http://localhost:8910/ und öffnet den Firefox bzw.
den Standardbrowser. Anderer Port:  node start.mjs --port 9000
Kein Browser soll aufgehen:      node start.mjs --no-open

Wichtig: start.sh und start.command brauchen in manchen ZIP-Werkzeugen das
Ausführungsrecht (chmod +x start.sh). Wenn das fehlt, einfach
"node start.mjs" im Ordnern ausführen.


STEUERUNG
---------
  <- / ->, Bild auf/ab, Leertaste   Folie wechseln
  Pos1 / Ende                       erste / letzte Folie
  TAB                               Werkzeugleiste und HUD aus-/einblenden
  S oder das Zahnrad                 Werkzeugleiste öffnen
  O                                 Folienübersicht
  N                                 Sprechnotizen mit Zeitangabe
  F                                 Vollbild
  D                                 hell / dunkel
  Q                                 QR-Code in der Ecke ein-/ausblenden
  Esc                               Panels schließen
  Wischen                           auf Touch-Geräten

In der Werkzeugleiste lässt sich die QR-Größe (S / M / L / XL) umschalten; die
Auswahl bleibt im Browser gespeichert.


PDF ERZEUGEN
------------
Strg+P (macOS: Cmd+P) -> als PDF speichern, Querformat. HUD, Notizen und der
Eck-QR werden dabei automatisch ausgeblendet.


QR-CODE
-------
Der QR-Code zeigt auf https://basalthasar.github.io/Hackathon/ - dort läuft die
Demo online, ohne Installation. Die Adresse auf der letzten Folie ist anklickbar
und öffnet die Demo in einem neuen Tab.


INHALT
------
  index.html, styles.css, app.js   das Deck
  assets/                          Screenshots, QR-Code, Logos
  start.mjs, start.sh, .command    optionaler lokaler Server
  LIESMICH.txt                     diese Datei


LIZENZEN UND MARKEN
-------------------
Schriften: Systemschriften (Georgia, Arial). Logos: DeepSeek, GitHub Copilot,
Qwen und opencode von Simple Icons (CC0), OpenAI-Knoten und Codex-Icon aus den
offiziellen Markenauftritten. Die Marken gehören den jeweiligen Inhabern.
Screenshots zeigen die eigene Demo mit Demodaten.
`;

const startSh = `#!/bin/sh
# Startet den lokalen Server; ohne Node wird das Deck direkt geöffnet.
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  exec node start.mjs "$@"
fi
echo "Node.js nicht gefunden - oeffne index.html direkt."
if command -v xdg-open >/dev/null 2>&1; then xdg-open index.html
elif command -v open >/dev/null 2>&1; then open index.html
else echo "Bitte index.html von Hand im Browser oeffnen."; fi
`;

const startCommand = `#!/bin/sh
# macOS: Doppelklick im Finder. Startet den Server oder öffnet das Deck direkt.
cd "$(dirname "$0")" || exit 1
if command -v node >/dev/null 2>&1; then
  exec node start.mjs "$@"
fi
open index.html
`;

const startCmd = `@echo off
rem Windows: Doppelklick. Startet den Server; ohne Node wird das Deck direkt geoeffnet.
cd /d "%~dp0"
where node >nul 2>nul
if %errorlevel%==0 (
  node start.mjs %*
) else (
  echo Node.js nicht gefunden - oeffne index.html direkt.
  start "" "index.html"
)
`;

await writeFile(join(target, 'LIESMICH.txt'), liesmich, 'utf8');
await writeFile(join(target, 'start.sh'), startSh, 'utf8');
await writeFile(join(target, 'start.command'), startCommand, 'utf8');
await writeFile(join(target, 'start.cmd'), startCmd.replace(/\n/g, '\r\n'), 'utf8');
await chmod(join(target, 'start.sh'), 0o755);
await chmod(join(target, 'start.command'), 0o755);

const bytes = await sizeOfDir(target);
console.log(`Export fertig: ${target}`);
console.log(`Enthalten: ${steps.join(', ')}, start.mjs, start.sh, start.command, start.cmd, LIESMICH.txt`);
console.log(`Größe: ${(bytes / 1024 / 1024).toFixed(1)} MB`);
console.log(`Zippen:  cd "${repo}" && zip -r pitch-deck-export.zip pitch-deck-export`);
