# Produktfotografie für Fly2You

**Implementiert und visuell geprüft, 2026-10-21:** Zwei unabhängige Bilddateien je Produktvariante, insgesamt 36 Varianten und 72 Ansichten. Eingesetzt wird der integrierte **Imagegen-Skill**, ausschließlich das eingebaute Tool, keine CLI/API-Alternative und keine Collagen. Die zweite Ansicht erhält das jeweilige Hauptfoto als Referenz, um Verpackung und Produkt konsistent zu halten. Alle Motive werden einzeln visuell geprüft.

Ein Subagent verantwortet jeweils eine Kategorie. Drei Kategorie-Agenten können gleichzeitig arbeiten, weitere starten gestaffelt. Vorratsartikel umfassen neun Varianten; Kaffee/Tee zwei, Süßes eine und die übrigen sechs Kategorien je vier.

| Kategorie | Varianten | Fotos |
|---|---|---|
| Vorrat | V01, V03, V04, V07–V12 | 18 |
| Kaffee & Tee | V02, V06 | 4 |
| Süßes | V05 | 2 |
| Bücher | V13–V16 | 8 |
| Pflege & Zuhause | V17–V20 | 8 |
| Technik | V21–V24 | 8 |
| Spielzeug | V25–V28 | 8 |
| Blumen | V29–V32 | 8 |
| Lebensmittel | V33–V36 | 8 |

Die `product-photos-*.json`-Dateien enthalten die tatsächlich verwendeten Prompts, Quellenpfade, Zielpfade und Prüfstatus. Das erste Haferflocken-Hauptfoto wurde vor der Kategorieaufteilung erstellt und vom Vorratsagenten übernommen. Es wird nicht doppelt generiert.

PNG-Kopien liegen unter `public/products/vNN-01.png` beziehungsweise `-02.png`; die Originalausgaben unter dem vom Tool zurückgegebenen generierten Bilderpfad bleiben erhalten. Der Optimierungsbefehl `npm run assets:products` erzeugt WebP-Dateien für die Website und prüft auf Vollständigkeit. Die Optimierung ändert Auflösung/Dateiformat, keine Bildinhalte.

Die App kennzeichnet die Bilder als **KI-generierte Produktfotos**. Es sind Illustrationen fiktiver Produktangebote, keine Herstellerbilder, Qualitätsnachweise oder zugesicherten realen Waren. Die Fotografien der Technikartikel tragen keine Hersteller-/Händlerlogos. Die Buchcover sind neu erfundene Beispiele.


**Vollständigkeitsprüfung:** Alle 72 PNG-Originalkopien und 72 WebP-Dateien vorhanden; zwei Ansichten je Variante, dieselben Fotos bei identischen Filialvarianten. Jedes Bild wurde vom zuständigen Kategorie-Agenten und zusätzlich in Kontaktbögen durch den App-Verantwortlichen gesichtet. Die PNGs sind 1254 × 1254 px; WebP ist auf maximal 1024 px optimiert. Gesamtdateigröße der PNGs etwa 152,8 MiB, WebP etwa 6,6 MiB (lokaler Dateivergleich 2026-10-21). Bildinhalte und Referenzprodukte stimmen bei der Sichtprüfung hinreichend überein; keine Produkt-/Sicherheitszertifizierung.


**Drohnen-Startmotiv (2026-10-21):** `public/images/drone-delivery-vision.webp` ist eine mit Sharp optimierte 1400px-Kopie von `assets/pitch/04-stadtvision.png` (WebP Qualität 88, keine inhaltliche Bearbeitung). Das vorhandene KI-Konzeptbild und dessen ursprüngliches Promptprotokoll bleiben erhalten. Sichtbar als Konzeptbild gekennzeichnet; keine Aufnahme eines echten Fly2You-Lieferbetriebs.
