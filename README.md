# Fly2You

Mobile Pitch-App für eine lokale Lieferplattform in Wuppertal. Hackathon **Vibecode+ · Team Routing**.

**Implementiert, Stand 21. Oktober 2026:** Produkte entdecken und Filialangebote vergleichen, einen Einkauf per Drohne zur gewählten Station verfolgen und das fiktive Drohnen-/Stationsnetz erkunden. Drohnenlieferung ist vorausgewählt; Fahrrad und Selbstabholung sind Alternativen. Die Anwendung läuft auf dem Präsentationsrechner und lässt sich im lokalen WLAN öffnen.

Händler, Angebote, Bestände, Preise, Fahrzeuge, Stationen, Zahlungen und Lieferereignisse sind **Beispieldaten**. Karten und Wettervorhersagen werden online geladen. Es gibt keine echten Käufe, Geschäftsdatenbank, Benutzerkonten, Flugsteuerung oder Flugfreigabe. Der App-Name lautet **Fly2You**; die ursprünglichen DroneDeliver-Bildentwürfe bleiben unverändert erhalten.

## Starten

Voraussetzung für App und Tests: Node.js **22 ab 22.12**, **24** oder **26 und neuer** sowie npm (entsprechend den installierten Testwerkzeugen). Next.js allein benötigt mindestens 20.9. Die Entwicklung wurde mit Node.js **26.8.2** ausgeführt. Internet wird für die Paketinstallation sowie für Kartenkacheln und aktuelle Vorhersagen benötigt.

Im Projektordner:

```sh
npm ci
npm run build
npm start
```

`npm start` startet den Produktionsserver auf **0.0.0.0:3000**. Auf dem Präsentationsrechner [http://localhost:3000](http://localhost:3000) öffnen. Für die Entwicklung gibt es alternativ `npm run dev`, ebenfalls auf `0.0.0.0:3000`.

Rechner und Smartphone müssen im selben WLAN sein. Dieser Befehl zeigt in einem zweiten Terminal die IPv4-Adressen des Rechners:

```sh
node -e 'for (const [name, entries] of Object.entries(require("node:os").networkInterfaces())) for (const entry of entries ?? []) if (entry.family === "IPv4" && !entry.internal) console.log(name + ": http://" + entry.address + ":3000")'
```

Die Adresse der aktiven WLAN-Schnittstelle im Smartphone-Browser öffnen. Bei mehreren Einträgen die zum gemeinsamen WLAN gehörende Adresse wählen. Falls der Zugriff scheitert, lokale Firewallfreigabe für Node/Port 3000 und eine mögliche Geräteisolation des WLANs prüfen. Den Server mit `Ctrl+C` beenden.

**Prüflücke:** Ein Zugriff über ein tatsächlich zweites physisches Gerät im WLAN ist noch nicht nachgewiesen. Ein erfolgreicher lokaler Produktionsstart oder ein emulierter Mobilbrowser ersetzt diese Prüfung nicht.

### Optionale Konfiguration

Standardmäßig sind keine API-Schlüssel erforderlich. [`.env.example`](.env.example) bei Bedarf als `.env.local` kopieren:

| Variable | Zweck |
|---|---|
| `MET_USER_AGENT` | Serverseitige Projektkennung für MET Norway mit erreichbarer Projekt-/Kontakt-URL; standardmäßig die vorhandene Repository-URL. Keine erfundenen Kontaktdaten. |
| `NEXT_PUBLIC_MAP_TILE_URL` | Kartenkachelquelle, standardmäßig `https://tile.openstreetmap.org/{z}/{x}/{y}.png`. |
| `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION` | Zur Kartenquelle passende sichtbare Attribution. |

`NEXT_PUBLIC_*` wird in den Browserbuild übernommen. Nach Änderungen erneut `npm run build` ausführen und den Server neu starten. Diese Variablen dürfen keine Geheimnisse enthalten. Bei einer anderen Kartenquelle gelten deren Nutzungsbedingungen.

## In fünf Minuten vorführen

1. **Entdecken, etwa eine Minute:** „Bio Haferflocken“ suchen und die Filialangebote vergleichen. Zwei Produkte derselben Filiale in die Tasche legen. Ein Artikel einer anderen Filiale zeigt den ausdrücklichen Wechselhinweis; „Tasche behalten“ erhält den bisherigen Einkauf.
2. **Einkauf, etwa eine Minute:** Tasche öffnen, die vorausgewählte Drohne und eine Zielstation wählen, Demo-Angebot berechnen und „Demo-Bestellung starten“. Gesamtpreis und Zeitspanne sind Demo-Werte. Alternativ „Fahrrad als Alternative“ oder „Abholen“ wählen. Selbstabholung: ohne Liefergebühr und Lieferauftrag.
3. **Lieferung, etwa eine Minute:** Mit „Pause“ und „Nächster Schritt“ den Ablauf erklären. Händlerannahme, Vorbereitung, Zubringer zum Hub, Drohnenflug, Ankunft, Einlagerung und Abholbereitschaft sind eigene simulierte Ereignisse. Die Wiedergabe stoppt vor der Kundenabholung; diese mit „Abholung in der Demo bestätigen“ abschließen. Die Bewegung folgt einer vorbereiteten Route und ist keine Navigation.
4. **Routing, etwa eine Minute:** Zielstation Barmen wählen, normalen Weg und „Korridor gesperrt“ vergleichen. Die Nordverbindung umgeht die Sperre. „Zielstation voll“, „Zielstation ausgefallen“ und „Wetterbedingte Pause“ begründen eine Verschiebung.
5. **Stationen und Wetter, etwa eine Minute:** „Simulation abspielen“ öffnet die gesonderte Stationsvorschau. Ankunft, Einlagerung, Abholbereitschaft und Kundenabholung bleiben getrennt. In Routing die Wetterdetails öffnen: Ort, Herkunft, Zeitangaben und Fenster einschließlich Rückweg erläutern. Reale Bewertung: **UNBESTIMMT**.

Das **Pitch-Menü** bietet Seitenwechsel, Pause/Fortsetzung, manuelle Schritte, Szenarioauswahl und einen bestätigten Neustart. Ein Szenario- oder Zielwechsel beginnt die Stationssimulation neu und verwirft ein noch ungebuchtes Drohnen-Angebot. Bestehende Aufträge behalten ihr gespeichertes Ziel und Szenario. Der Neustart löscht Warenkorb, Demo-Bestellungen und Stationsfortschritt dieses Browsers. Jedes Gerät hat eine eigene Sitzung ohne geräteübergreifende Synchronisierung.

## Umfang und Fehlerfälle

- **Katalog:** 6 fiktive Händler, 7 Filialen, 36 Varianten und 40 Angebote. Suche, Kategorien, Filialfilter, Preisreihenfolge und Vergleich derselben Variante. Ausverkaufte Artikel, unbestätigter Bestand und eine geschlossene Filiale sind enthalten.
- **Bestellung:** Ein-Filial-Warenkorb, Cent-Beträge, 120 Sekunden gültiges Demo-Angebot und erneute Prüfung beim Start. Wiederholter identischer Checkout erzeugt innerhalb derselben Sitzung keine zweite Bestellung. Bestellung, Demo-Zahlung, Vorbereitung und Lieferung haben getrennte Zustände. Drohnen-Quotes berücksichtigen Station und Routen-/Wetterszenario; volle/ausgefallene Ziele und simulierter Wetterstopp sperren neue Drohnen-Checkouts. Eine Korridorsperre kann eine längere Alternative ergeben.
- **Routing:** Gerichtetes Dijkstra-Netz mit illustrativen Minutenwerten, einem Hub, 3 Stationen, 3 Drohnen und Zwischenpunkten einschließlich Nord-Alternative. Verfügbarkeit und Zielkapazität werden vor der Wegwahl geprüft. Hinweg, Rückweg und illustrative Übergabezeit bilden das Planfenster.
- **Karten:** Leaflet und echte geografische Grundlage mit fiktiven Standorten und Routen. Bei Kachelfehlern bleiben Listen und Aktionen nutzbar. Über „Netz“ ist eine schematische Ansicht erreichbar.
- **Wetter:** `GET /api/weather?locationId=HUB` akzeptiert ausschließlich 7 konfigurierte Demo-Orte. MET Norway liefert eine 24-Stunden-Vorhersage; inklusive angefangener Stunde können 25 Punkte erscheinen. Temperatur, Wind, Richtung, Niederschlagsintervall und Zustand werden mit Zeitbezug angezeigt. Dies ist keine Live-Messung.
- **Wettergrenzen:** Abrufzeit, Anbieteraktualisierung und Prognosezeit sind getrennt. Fehlende Pflichtdaten, Timeout, HTTP 429 und veraltete Daten erzeugen keinen positiven Prüfstatus. Temperatur in 2 m und Wind in 10 m über Modellboden ersetzen keine Daten in Flughöhe. Ungefähr 9 km globale Modellauflösung bildet lokale Gebäudewinde nicht ab.
- **Datentrennung:** Online-Vorhersage, gespeicherter Wetterstand und simulierte Wettersperre bleiben unterscheidbar. Reale Bewertung immer **UNBESTIMMT**: Fahrzeuggrenzen und vollständige Pflichtdaten fehlen. Cache und 24-Stunden-Altersmarkierung sind technische Demo-Regeln, keine bestätigten Fluggrenzen.

Vorhersagen werden bei Bedarf über den Server geladen; kein regelmäßiges Hintergrund-Polling. Nach längerer Unterbrechung „Wetter neu abrufen“ verwenden. Der prozesslokale Servercache respektiert `Expires` und revalidiert mit `Last-Modified`. Die API ist kein frei verwendbarer Proxy.

Nach dem Laden der Anwendung und ihrer benötigten Ansichten bleiben vorbereitete Szenarien bei Internetverlust bedienbar. Eine vollständige Offline-Erstinstallation oder ein neuer Seitenaufruf ohne Verbindung ist nicht zugesagt. Die Standardkarte überträgt Verbindungsdaten an den Kachelanbieter; MET Norway wird vom Server mit festen Demo-Koordinaten angefragt. Standort- und Kamerafreigaben sind nicht erforderlich.

## Produktfotos

Jede der 36 Produktvarianten erhält zwei eigens mit dem integrierten Imagegen-Tool generierte Fotoansichten. Filialangebote derselben Variante teilen dieselben Fotos. Die Produktkarte öffnet eine Galerie mit Hauptbild, zweiter Ansicht, Miniaturen und Warenkorb-Aktion. Die Bilder sind KI-generiert und zeigen keine tatsächlich angeschlossenen Händlerprodukte.

Das Drohnenbild im Startbereich ist eine optimierte Kopie des vorhandenen KI-Konzeptbildes `assets/pitch/04-stadtvision.png`. Die Konzeptbild-Kennzeichnung bleibt sichtbar.

Originale liegen als PNG unter `public/products/`, die Website verwendet optimierte WebP-Dateien. Prompts und Herkunft: `docs/assets/product-photos-*.json`. Nach neuen PNGs `npm run assets:products` ausführen; der Befehl optimiert die Dateien und prüft, dass alle 72 Bilder vorhanden sind. Alle 72 Fotoansichten sind erstellt, visuell geprüft und durch die automatisierte Dateiprüfung abgedeckt. Abschließende Browserresultate stehen in der Architektur.

Sortimente: Lebensmittel und Vorrat, Kaffee/Tee, Süßes, Bücher, Pflege/Zuhause, Technik, Spielzeug und Blumen. Taltechnik ist ein fiktiver Technikhandel; es wird keine reale MediaMarkt-Anbindung behauptet. Frischware, Blumen und Akkuprodukte benötigen für echte Lieferungen eigene Eignungs- und Verpackungsprozesse.

## Prüfen

```sh
npm run typecheck
npm test
npm run build
```

Für Browserprüfungen zuerst den Produktionsserver mit `npm start` laufen lassen. In einem zweiten Terminal:

```sh
npx playwright install chromium
npm run test:e2e
```

Die Playwright-Konfiguration startet keinen eigenen Server und erwartet Port 3000. Eine vorhandene Chromium-Datei kann ausdrücklich angegeben werden:

```sh
PLAYWRIGHT_CHROMIUM_EXECUTABLE='/absoluter/pfad/zur/chromium-datei' npm run test:e2e
```

Das hilft auch bei einem nicht zur Playwright-Version passenden Browsercache. Regulär installiert `npx playwright install chromium` die passende Version. Fehleraufzeichnungen liegen unter `/tmp/fly2you-test-results/`; der Listenreport erscheint im Terminal. Ein HTML-Bericht wird nicht automatisch erstellt.

Die Prüfungen in [`tests/pitch.spec.ts`](tests/pitch.spec.ts) umfassen Drohnenstandard, Stationsauswahl, getrennte Kundenabholung, Routen-Snapshots, v1→v2-Sitzungsmigration, Fahrrad/Selbstabholung, Filialwechsel, Quoteablauf, Doppelklick, Wiederherstellung, Stationen, Szenarien, Kartenfehler, Wetterherkunft, Tastaturbedienung, reduzierte Bewegung und automatische axe-Prüfungen. Karten- und Wetterfixtures vermeiden externe Abrufe und belegen keine echte Anbieterantwort. Für diesen Arbeitslauf war kein Browser-Plugin verfügbar, daher wird direkt Playwright verwendet.

**Geprüft am 21. Oktober 2026:** 72/72 Fotoansichten vollständig, 65/65 Vitest-Tests, TypeScript und Produktionsbuild bestanden. 21/21 Playwright-Browserfälle bestanden, einschließlich Drohnen-Checkout, Sperren/Alternativroute, Migration, aller Kategorien, Galerie/Warenkorb und automatischer axe-Prüfung. Sichtprüfung bei 1440×1000 und 360×800: kein horizontaler Überlauf, keine Framework-Fehleranzeige, keine unerwarteten JavaScript-/Konsolenfehler im abschließenden Browserlauf (gezielt ausgelöste Netzfehler ausgenommen). Chromium 151.0.7922.34; Safari und Firefox wurden nicht geprüft. Mangels Browser-Plugin wurde der vorhandene Playwright-Workflow verwendet.

Ein echter Hub-Abruf über den fertigen Wetterendpunkt wurde am **21. Oktober 2026 um 12:55:10 Uhr Berlin mit HTTP 200** bestätigt: 25 Prognosepunkte und reale Bewertung weiterhin UNBESTIMMT. Das ist ein Integrationsnachweis, keine Dauerverfügbarkeitszusage. Ein **zweites physisches WLAN-Gerät bleibt eine Prüflücke**. Detaillierte Ergebnisse und Grenzen in [Architekture.md, Abschnitt 13](Architekture.md#13-implementierte-p0-pitch-demo).

## Technik, Quellen und Lizenzen

React, TypeScript und Next.js App Router; CSS Modules, Leaflet, Vitest und Playwright. Texte der direkten UI-Bibliothekslizenzen liegen unter [docs/licenses](docs/licenses/README.md). Fachlogik liegt in [`src/domain`](src/domain), Sitzungs-/Routendaten in [`src/demo`](src/demo), Wetteradapter in [`src/weather`](src/weather). Der Online-Serverendpunkt liefert Vorhersagen; es gibt keine öffentlichen Schreib-APIs.

Am **21. Oktober 2026** geprüfte Anbieterquellen:

| Bestandteil | Quelle und Bedeutung |
|---|---|
| Leaflet | [BSD-2-Clause-Lizenz](https://github.com/Leaflet/Leaflet/blob/main/LICENSE); Bibliotheks-Lizenzhinweise bleiben erhalten. |
| OpenStreetMap | [Copyright und ODbL](https://www.openstreetmap.org/copyright), [Standardkachel-Nutzungsrichtlinie](https://operations.osmfoundation.org/policies/tiles/). Sichtbare Attribution, reguläres Browser-Caching; kein Massendownload, Vorladen oder Offline-Kachelpaket. |
| MET Norway | [Datenlizenz und Attribution](https://api.met.no/doc/License): grundsätzlich CC BY 4.0 bzw. NLOD 2.0. Quelle und Lizenz werden angezeigt; Prognosen ausgewählt und normalisiert. |
| MET-Anbindung | [Nutzungsbedingungen](https://api.met.no/doc/TermsOfService), [Getting Started](https://api.met.no/doc/GettingStarted): Projektkennung, höchstens vier Koordinatennachkommastellen, Cache und begrenzte Anfragen. |
| MET-Datenmodell | [Variablen und Abdeckung](https://api.met.no/doc/locationforecast/datamodel), [Forecast JSON](https://api.met.no/doc/ForecastJSON): Messhöhen, Modellgrenzen, UTC-Zeitpunkte und Niederschlagssummen über definierte Intervalle. |

Die App belegt keine Zulässigkeit eines Drohnenbetriebs, genehmigten Korridore, sicheren Landestellen oder Umweltentlastung. Diese Nachweise bleiben eigenständige Aufgaben des weitergehenden Konzepts.

## Gemeinsames Konzept und Teams

Die App ist eine beauftragte **Teilmenge von P0**. Der größere Plattformentwurf bleibt erhalten: M1 mit realen Bestands-, Zahlungs- und Kurierpartnern sowie Support; A2 unter anderem mit Terminfenstern, Stationen, Bündelung und Eigenversand; A3 mit Drohnen und autonomen Transportnetzen. Diese Ausbaustufen sind keine bereits umgesetzten Funktionen. Transportmittel, Empfang und Servicelevel bleiben im Konzept eigenständige Eigenschaften.

| Team | Schwerpunkt im gemeinsamen Konzept |
|---|---|
| Design | Gestaltung und verständliche Bedienung; weitergehende Zuständigkeit gemeinsam abstimmen |
| **Routing – unser Team** | Lieferbarkeit, Transportkosten, Zeit und Kapazitäten; später Fahrzeugzuweisung und Tourenbündelung |
| Drohnen Typen | Fahrzeuge, Leistungsdaten und belegte Einsatzgrenzen |
| Packstationen | Standorte, Übergabe, Kapazitäten und Ladeinfrastruktur |

Die Drohnenanforderungen R01–R14 bleiben als Ausbau erhalten. Die Simulation ersetzt keine Energieplanung, echten Luftraumdaten, lokale Kollisionsvermeidung, Stationshardware oder betriebliche Freigabe. Partner, Kosten, Vertrags-/Zahlungsmodell und reale Prozesse sind vor einem echten Pilotbetrieb zu klären.

| Dokument | Inhalt |
|---|---|
| [Konzept.md](Konzept.md) | Fachstand, beschlossener Pitch-Umfang, Ausbau, Anforderungen, Risiken, Entscheidungen und Übergabe |
| [Architekture.md](Architekture.md) | Implementierung, Architektur, Fehlerlogik und tatsächliche Prüfungen; breitere Pilotvorschläge getrennt erhalten |
| [Grundlagen](docs/grundlagen/README.md) | Unverändertes Word-Konzept und Markdown-Arbeitsgrundlage; zusätzlich der [Pitch-Auftrag](docs/grundlagen/Pitch_Auftrag_2026-10-21.md) |
| [Pitch-Bilder](assets/pitch/README.md) | Vier ursprüngliche KI-Konzeptvisualisierungen mit Beispieldaten; historische DroneDeliver-Benennung, keine Bildschirmnachweise der App |
| [AGENTS.md](AGENTS.md) | Dauerhafte Arbeitsregeln und verbindliche Commit-Konvention |

Anforderungen und Ergebnisse in der zuständigen Projektdatei pflegen. Annahmen, Vorschläge, beschlossene Anforderungen, Implementierung und Prüfungen kennzeichnen; Ergebnisse anderer Teams erhalten. Für Commits gilt `what(where): what in detail`, etwa `docs(project): document local pitch setup and verification`.
