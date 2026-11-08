# Fly2You · Pitch-Deck

Präsentation im Stil der Website: 10 Folien, 3–5 Minuten, Plattform + Produkt,
QR-Code zur Live-Demo ab Folie 1.

Reines HTML/CSS/JS ohne Build-Schritt — läuft in Chromium und Firefox,
funktioniert auch offline (alle Bilder und Logos liegen lokal).

## Starten

```bash
npm run praesentation
```

Öffnet einen kleinen lokalen Server auf <http://localhost:8910/> und startet Firefox.

| Befehl | Wirkung |
| --- | --- |
| `npm run praesentation -- --no-open` | nur Server starten |
| `npm run praesentation -- --port 8911` | anderer Port |
| `npm run praesentation -- --browser chromium` | anderen Browser öffnen |
| `npm run praesentation -- --browser default` | Standardbrowser über `xdg-open` |

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

Der QR-Code zeigt auf <https://basalthasar.github.io/Hackathon/> und ist ab
Folie 1 unten rechts sichtbar. In der Werkzeugleiste lässt sich die Größe
umschalten (S / M / L / XL); die Auswahl bleibt im Browser gespeichert.
Auf der letzten Folie erscheint der große QR-Code, der Eck-QR wird dort
automatisch ausgeblendet.

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
| `assets/logos/*.svg` | DeepSeek, GitHub Copilot, Qwen |

Logos stammen von [Simple Icons](https://simpleicons.org/) (CC0); die Marken
gehören den jeweiligen Inhabern. Für Modelle ohne frei verfügbares Logo
(GPT-6 Astra, Codex, ohmypi, opencode, Jülich-Harness) stehen neutrale
Monogramm-Kacheln.
