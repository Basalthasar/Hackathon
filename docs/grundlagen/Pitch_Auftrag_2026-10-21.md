# Erste Pitch-Version: lokale Lieferplattform für Wuppertal

## 1. Ziel und festgelegter Umfang

Wir entwickeln eine **mobile React-Website**, die innerhalb einer etwa fünfminütigen Vorführung eine zusammenhängende Geschichte erzählt:

**Lokal einkaufen → Lieferung verfolgen → Routing verstehen → Drohnen und Packstationen als Ausbau erleben.**

Festgelegt sind Wuppertal als Demo-Gebiet, eine interaktive Pitch-Demo und der Betrieb auf dem Präsentationsrechner mit Zugriff über das lokale WLAN. Karten und Wetter werden tatsächlich online geladen. Händler, Angebote, Bestände, Zahlungen, Fahrzeuge und Lieferungen sind gekennzeichnete Beispieldaten.

Die Version ist ein abgegrenzeter Teil des dokumentierten P0-Konzepts. Die weitergehenden Anforderungen an einen echten Pilotbetrieb bleiben erhalten. Benutzerkonten, Zahlungsanbieter, Datenbank, echte Händleranbindungen und öffentliche Veröffentlichung gehören nicht zu dieser Implementierung.

**Erfolgskriterium:** Zuschauer können auf ihrem Smartphone selbst einen Einkauf durchspielen und anschließend nachvollziehen, wie Route, Station und Wetter die Lieferplanung beeinflussen.

## 2. Oberfläche und Pitch-Ablauf

Die Gestaltung übernimmt die Richtung der vorhandenen Pitch-Bilder: helle Oberflächen, dunkelblaue Typografie, blaue Aktionen und Routen, großzügige Abstände. „DroneDeliver“ bleibt ein vorläufiger Arbeitsname. Die Bildentwürfe dienen als Referenz; Bedienelemente und Karten werden als echte Komponenten umgesetzt.

Die mobile Navigation enthält **Entdecken, Lieferung, Stationen und Routing**. Auf größeren Bildschirmen werden Karte und Details nebeneinander dargestellt.

| Bereich | Verhalten der ersten Version |
|---|---|
| **Entdecken** | Kurzer Einstieg in das Konzept; Produktsuche, Kategorien und Angebotsvergleich. Drei fiktive Händler mit vier Filialen und etwa 20 Produktvarianten im Gebiet Elberfeld–Barmen. |
| **Warenkorb** | Mehrere Artikel derselben Filiale. Bei Filialwechsel ausdrückliche Rückfrage. Gesamtpreis mit Gebühren und gekennzeichnetem Demo-Zeitfenster. |
| **Demo-Bestellung** | Auswahl zwischen Fahrradlieferung an einen vorgegebenen Beispielort und Selbstabholung. Abschluss über „Demo-Bestellung starten“, ohne Zahlungsdaten. |
| **Lieferung** | Ereignisfolge von Händlerannahme bis Empfang; simulierte Bewegung auf einer vorbereiteten Route. Selbstabholung funktioniert ohne Lieferauftrag und Liefergebühr. |
| **Stationen** | Liste und Karte mit drei fiktiven Stationsstandorten, Fachverfügbarkeit und Detailansicht. Einlagerung, Abholbereitschaft und Abholung bleiben getrennte Ereignisse. |
| **Routing** | Ein Demo-Hub, drei Stationen, drei Drohnen und ein kleines Korridornetz. Route wählen, Planung erklären lassen, Störung auslösen und Alternative ansehen. |

Ein vom Tracking erreichbarer Einstieg **„Drohnenlieferung als Vorschau erleben“** öffnet die gesonderte Stationssimulation. Dadurch bleiben heutiger Kurierablauf und spätere Drohnenvision verständlich.

Weitere Bedienentscheidungen:

- Mobile zuerst ab 360 Pixel Breite; mindestens 44 Pixel große Touch-Ziele, sichtbarer Fokus und verständliche Statusbeschriftungen.
- Karten ergänzen Listen und Zeitleisten; sämtliche wesentlichen Aktionen funktionieren ohne Kartenbedienung.
- Heller Standardmodus, zusätzlich Dunkelmodus und reduzierte Animationen gemäß Systemeinstellung.
- Ein Pitch-Menü bietet Neustart, Pause, nächsten Simulationsschritt und Szenarioauswahl.
- Keine Standort- oder Kamerafreigabe erforderlich. Vorgegebene Beispielorte machen die WLAN-Vorführung unabhängig von entsprechenden Browserberechtigungen.

## 3. Karten, Wetter und Routing

### Karten

**Leaflet mit OpenStreetMap-Standardkarten** bildet die erste Kartenversion. Leaflet steht unter BSD-2-Clause. Der öffentliche OSM-Kartendienst benötigt sichtbare Attribution, reguläres Browser-Caching und darf nicht für Massendownloads oder Offline-Vorladen genutzt werden. Die Kartenquelle bleibt konfigurierbar. [Leaflet-Lizenz](https://github.com/Leaflet/Leaflet/blob/main/LICENSE), [OSM-Nutzungsbedingungen](https://operations.osmfoundation.org/policies/tiles/)

- Echte geografische Grundlage für Wuppertal; eigene Marker und GeoJSON-Routen darüber.
- Händler, Hub, Stationen, Flugkorridore und Sperrbereiche ausdrücklich als fiktiv kennzeichnen.
- Für Fahrradtracking vorbereitete Beispielrouten verwenden; keine aktuelle Verkehrslage oder echte Navigation behaupten.
- Bei Kartenfehlern bleiben Liste und Details bedienbar. Die Routing-Demo erhält zusätzlich eine schematische Netzansicht ohne Kartenkacheln.

### Wetter

**MET Norway Locationforecast 2.0** wird über einen eigenen Server-Endpunkt eingebunden. Die Daten stehen grundsätzlich unter CC BY 4.0 beziehungsweise NLOD; Quellenangabe und Lizenzverweis werden sichtbar aufgenommen. [Lizenz und Attribution](https://api.met.no/doc/License)

- Temperatur, Windgeschwindigkeit, Windrichtung, Niederschlag und Wetterzustand für die nächsten 24 Stunden anzeigen.
- Wetter an Hub, Stationen und festgelegten Zwischenpunkten abrufen; im Missionsdetail das geplante Zeitfenster einschließlich Rückweg hervorheben.
- Abrufzeit, Aktualisierungszeit des Anbieters, Prognosezeit und Messhöhen getrennt behandeln. Die Anzeige heißt **„Aktuell abgerufene Wettervorhersage“**, nicht Live-Messung.
- Fehlende Böen-, Sichtweiten-, Vereisungs- oder Höhendaten sichtbar ausweisen. Die räumliche Modellauflösung bildet keine lokalen Hindernisse oder Windverhältnisse zwischen Gebäuden ab. [Datenmodell und Abdeckung](https://api.met.no/doc/locationforecast/datamodel)
- Server-Cache respektiert `Expires` und `Last-Modified`; identifizierender User-Agent, maximal vier Koordinatennachkommastellen und begrenzte Wiederholungen bei Fehlern. Kein Hintergrund-Polling bei versteckter App. [API-Nutzungsbedingungen](https://api.met.no/doc/TermsOfService)

Open-Meteo wird zunächst nicht integriert: Der kostenlose Zugang schließt kommerzielle beziehungsweise werbliche Nutzung aus und wäre deshalb für spätere Pitch-Verwendungen gesondert zu bewerten. [Open-Meteo-Bedingungen](https://open-meteo.com/en/terms)

### Routing-Simulation

- Gerichteter Demo-Graph mit festgelegten Verbindungen und gekennzeichneten Beispielzeiten.
- Dijkstra berechnet den zeitlich kürzesten verfügbaren Demo-Weg; gesperrte Segmente und ausgefallene Stationen werden ausgeschlossen.
- Fahrzeugverfügbarkeit, Stationskapazität und Routensperren werden vor der Auswahl geprüft. Ablehnungsgründe erscheinen verständlich neben der Karte.
- Drei reproduzierbare Szenarien: normaler Ablauf, gesperrter Korridor mit Alternative und volle beziehungsweise ausgefallene Zielstation.
- Ein zusätzliches Wetterszenario demonstriert eine Verschiebung ausschließlich mit markierten Simulationsdaten.

**Live-Vorhersage und Szenariowerte bleiben getrennt.** Ohne belegte Fahrzeuggrenzen und vollständige Pflichtdaten lautet eine reale Wetterbewertung „UNBESTIMMT“. Die App erzeugt keine Flugfreigabe; erfolgreiche Animationen heißen „Simulation abspielen“.

## 4. Technische Umsetzung und Reihenfolge

**Stack:** React, TypeScript und Next.js mit App Router; CSS Modules und gemeinsame Designvariablen; Leaflet für Karten; Vitest für Fachlogik und Playwright für Browserabläufe.

Eine Anwendung mit getrennten Modulen genügt:

- `catalog`: Produkte, Filialangebote, Suche und Filter.
- `checkout`: Warenkorb, Beispielpreise und befristete Demo-Angebote.
- `orders`: Bestellzustände, Zeitleiste und Empfang.
- `routing` und `stations`: Graph, Szenarien und Stationszustände.
- `weather`: Anbieteradapter, Normalisierung, Cache und Fehlerzustände.
- `demo`: Beispieldaten, kontrollierbare Simulationsuhr und Zurücksetzen.
- Gemeinsame UI-Komponenten für Navigation, Karten, Status und Dialoge.

**Schnittstellen und Zustand:**

- Ein eigener Endpunkt `GET /api/weather?locationId=…` akzeptiert ausschließlich konfigurierte Demo-Orte. Er ist kein frei verwendbarer Proxy.
- `WeatherProvider` kapselt MET Norway; Kartenkomponenten erhalten Anbieter-Konfiguration und GeoJSON.
- `DemoOrderService` und `RoutingService` enthalten Fachlogik unabhängig von React.
- Datensätze unterscheiden Herkunft, Zeitbezug und Qualität: online abgerufene Vorhersage, gespeicherter Stand oder Simulation.
- Bestell-, Zahlungs-, Vorbereitungs- und Lieferzustand bleiben getrennt, obwohl sie simuliert werden.
- Versionierter Browser-Speicher erhält Warenkorb und Demo-Fortschritt. Jedes Gerät besitzt eine eigene Sitzung; keine geräteübergreifende Synchronisierung.
- Keine Geschäftsdatenbank und keine öffentlichen Schreib-APIs in dieser Version.

**Implementierungsfolge:**

1. App-Grundgerüst, Gestaltung, Navigation und Wuppertaler Beispieldaten.
2. Vollständiger Durchlauf von Suche über Warenkorb bis Lieferung beziehungsweise Selbstabholung.
3. Echte Karte, Wetteradapter und transparente Lade-/Fehlerzustände.
4. Stationsansicht, Routing-Graph und kontrollierbare Störungsszenarien.
5. Mobile Prüfung, Pitch-Ablauf, Produktionsbuild und WLAN-Startanleitung.

Die Anwendung startet nach dem Build über einen dokumentierten LAN-Startbefehl auf `0.0.0.0`. Karten und aktuelles Wetter benötigen Internet; nach geladener Anwendung bleiben die vorbereiteten Szenarien auch bei einem Verbindungsausfall bedienbar.

## 5. Abnahme und Dokumentation

Die erste Implementierung gilt als fertig, wenn folgende Prüfungen bestanden und dokumentiert sind:

- Vollständige Fahrradlieferung und Selbstabholung auf kleinen Bildschirmen; kein horizontaler Überlauf.
- Filialwechsel, unbestätigter Bestand und abgelaufenes Angebot werden verständlich behandelt.
- Mehrfachklick erzeugt in derselben Demo-Sitzung keine doppelte Bestellung.
- Stationsankunft wird nicht als Kundenabholung ausgegeben.
- Routensperre führt zur Alternative oder zu einem begründeten „keine Route“.
- Fehlende Wetterfelder, veraltete Daten, Timeout und HTTP 429 erzeugen keinen positiven Prüfstatus.
- Live-Daten und Simulation bleiben auch nach Szenariowechsel und Neustart eindeutig unterscheidbar.
- Kartenfehler blockieren den übrigen Ablauf nicht; Attribution bleibt auf mobilen Geräten sichtbar.
- Tastaturbedienung, Fokusführung, Kontraste und reduzierte Bewegung werden geprüft.
- Produktionsbuild und Zugriff über ein zweites Gerät im WLAN werden tatsächlich getestet; nicht verfügbare Prüfgeräte werden als Prüflücke benannt.

Zum Abschluss der Implementierung werden **Konzept.md**, **Architekture.md** und **README.md** aktualisiert: beschlossener Pitch-Umfang, Architektur, Quellen mit Prüfdatum, Startanleitung, Demo-Szenarien, verwendete Lizenzen und tatsächliche Prüfergebnisse. Originalunterlagen und Pitch-Bilder bleiben erhalten; AGENTS.md bleibt unverändert.

**Planungsstand:** Projektunterlagen und vorhandene Bildentwürfe geprüft, Anbieter-Dokumentation recherchiert. Ein erfolgreicher Wetter-API-Abruf ist noch nicht nachgewiesen. Dieser Plan ist bislang nur im Chat vorhanden; im Plan-Modus wurden keine Dateien geändert.
