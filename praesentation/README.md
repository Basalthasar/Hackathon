# Fly2You · Pitch-Deck

Präsentation im Stil der Website: 10 Folien, 3–5 Minuten, Plattform + Produkt,
QR-Code zur Live-Demo ab Folie 1.

Reines HTML/CSS/JS ohne Build-Schritt — läuft in Chromium, Firefox und Safari
(Safari ab 16.4 wegen `color-mix()`), funktioniert auch offline
(alle Bilder und Logos liegen lokal).

## Starten

```bash
npm run praesentation
```

Öffnet einen kleinen lokalen Server auf <http://localhost:8910/> und startet Firefox.
Das Startskript ist plattformunabhängig (Linux, macOS, Windows):

- **Linux** – `firefox` bzw. `xdg-open`
- **macOS** – `open -a Firefox` bzw. `open` für den Systemstandard
- **Windows** – `start`

Findet sich der Wunschbrowser nicht, wird automatisch der Systemstandard
geöffnet; klappt auch das nicht, bleibt die URL zum manuellen Öffnen stehen.

| Befehl | Wirkung |
| --- | --- |
| `npm run praesentation -- --no-open` | nur Server starten |
| `npm run praesentation -- --port 8911` | anderer Port |
| `npm run praesentation -- --browser chromium` | anderen Browser öffnen |
| `npm run praesentation -- --browser safari` | Safari (macOS) |
| `npm run praesentation -- --browser default` | Systemstandardbrowser |
| `npm run praesentation -- --browser none` | keinen Browser starten |

Alternativ `praesentation/index.html` direkt im Browser öffnen — der
QR-Code funktioniert auch dann, nur das Nachladen entfällt.

## Steuerung

| Taste | Wirkung |
| --- | --- |
| `←` / `→`, `Bild↑` / `Bild↓`, `Leertaste` | Folie wechseln |
| `Pos1` / `Ende` | erste / letzte Folie |
| `TAB` | Werkzeugleiste und HUD aus- und einblenden |
| `S` oder ⚙ | Werkzeugleiste öffnen |
| `O` | Folienübersicht |
| `N` | Sprechnotizen mit Zeitangabe |
| `F` | Vollbild |
| `D` | hell / dunkel |
| `Q` | QR-Code in der Ecke ein-/ausblenden |
| `Esc` | Panels schließen |

Wischen funktioniert auf Touch-Geräten.

## QR-Code

Der QR-Code zeigt auf <https://basalthasar.github.io/Hackathon/> und sitzt ab
Folie 1 **oben rechts** — auf der Titelfolie größer als Blickfang, auf den
übrigen Folien kleiner. In der Werkzeugleiste lässt sich die Größe umschalten
(S / M / L / XL); die Auswahl bleibt im Browser gespeichert. Auf der letzten
Folie erscheint der große QR-Code, der Eck-QR wird dort automatisch
ausgeblendet. Mit `TAB` verschwinden HUD, Werkzeugleiste und Eck-QR komplett.

## Folien

1. Titel · 2. Ausgangslage · 3. Plattform in drei Schritten ·
4.–6. Produkt (Entdecken, Routing, Stationen) · 7. Wetter und Grenzen ·
8. Reifegrad · 9. Werkzeuge und Team · 10. QR und Abschluss

Sprechnotizen liegen als `<aside class="notes">` in jeder Folie und beginnen
mit der geplanten Dauer (z. B. `25 s.`).

## Druck / PDF

`Strg + P` erzeugt ein PDF im Querformat (297 × 167 mm pro Folie). HUD,
Werkzeugleiste, Notizen und Eck-QR werden dabei ausgeblendet.

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Folien, HUD, Werkzeugleiste, Notizen |
| `styles.css` | Design-Tokens der Website, Layout, Druckansicht |
| `app.js` | Navigation, Panels, QR-Einstellungen |
| `assets/desktop-*.png`, `assets/mobile-*.png` | Screenshots der Demo |
| `assets/qr.svg` | QR-Code zur Demo |
| `assets/logos/` | Logos der Werkzeuge (siehe unten) |

Logos stammen von [Simple Icons](https://simpleicons.org/) (CC0, DeepSeek,
GitHub Copilot, Qwen, opencode) sowie aus den offiziellen Markenauftritten von
OpenAI (Knoten für GPT, Codex-App-Icon) und Ohmypi (`ohmypi.png`). Die Marken
gehören den jeweiligen Inhabern. Für das Jülich-Harness steht ein neutrales
Monogramm (FSZJ).
