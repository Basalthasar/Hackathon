# Konzept - Urbane Paketversorgung durch Drohnen

Stand: 2026-10-21
Status: Entwurf, Prototyp in Arbeit. Keine Genehmigung, kein Realbetrieb.

## 1. Problem und Ziel

Städte tragen einen wachsenden Lieferverkehr. Straßen werden belastet,
Zustellfenster schwer planbar, Zubringerwege lang. Das Konzept prüft, ob ein
urbanes Drohnen-Liefernetz einen Teil der Paketströme zwischen Logistikstandorten
und innerstädtischen Packstationen übernehmen kann, ohne Sicherheit,
Zugänglichkeit und Umweltbelastung ungeprüft zu verbessern.

Das Netz soll:

- Pakete zwischen einem Logistikstandort und einer innerstädtischen Packstation
  transportieren.
- feste Flugkorridore und definierte Höhenebenen nutzen.
- sichere Packstationen mit geschützter Übergabe und Ladeinfrastruktur
  verbinden.
- Wetter, Datenqualität und Betriebsgrenzen nachvollziehbar in die Flugfreigabe
  einbeziehen.
- Fehlerfälle sichtbar machen, statt sie in einer Erfolgsdarstellung zu
  verstecken.

Nicht Teil des Anspruchs: ein genehmigter Betrieb, ein Nachweis der
Wirtschaftlichkeit oder eine Garantie für Lärmminderung.

### Arbeitsannahme Wuppertal

Der Prototyp verwendet Wuppertal als Beispielraum, weil die Stadt mehrere
relevante Bedingungen in einem überschaubaren Gebiet verbindet: dichte
Stadtteile in Elberfeld und Barmen, topographische Höhenunterschiede, den Fluss
Wupper, stark befahrene Achsen und ein polyzentrisches Zentrennetz. Die
Beispielstationen sind Wuppertal Hauptbahnhof (Elberfeld), Alter Markt (Barmen),
Vohwinkel und Cronenberg; die Hubs liegen in Vohwinkel und Oberbarmen.

Diese Zuordnung ist eine Planungsannahme, keine Standortentscheidung. Reale
Grundstücke, Anflugwege, Lärmwirkung, Luftraum und Genehmigungsfähigkeit sind
für jeden Standort separat zu prüfen.

## 2. Zielgruppen und Nutzungsszenarien

| Zielgruppe | Bedarf | Erfolg |
|---|---|---|
| Empfängerin | Paket zuverlässig an einer sicheren Station abholen | Klarer Status, verlässliches Zeitfenster, einfache Abholung |
| Logistikbetrieb | Pakete konsolidiert und planbar zustellen | Hohe Zustellquote, wenige Ausfälle, nachvollziehbare Kosten |
| Packstationsbetreiber | Auslastung, Sicherheit und Wartung steuern | Freie Fächer, funktionierende Übergabe, keine Zugangsrisiken |
| Leitstelle | Flüge freigeben, überwachen und eingreifen | Vollständiges Lagebild, begründete Entscheidungen |
| Kommunale Planung | Verkehr, Lärm und Stadtbild bewerten | Belastbare Kennzahlen und transparente Grenzen |
| Regulierung und Prüfung | Auflagen und Nachweise prüfen | Trennung von Vorgabe, Herstellerangabe, Annahme und Nachweis |

Szenarien:

1. **Regelbetrieb:** Zwei Missionen pro Stunde zwischen Logistikstandort und
   Packstation, tagsüber, stabile Wetterlage.
2. **Wetterfenster:** Start verschoben, weil eine Böe im Rückflugfenster über
   dem definierten Grenzwert liegt. Die Station zeigt das nächste geeignete
   Fenster als Prognose.
3. **Stationsausfall:** Eine Packstation ist nicht erreichbar. Die Sendung wird
   an eine Ausweichstation umgeplant oder zurückgehalten.
4. **Datenausfall:** Wetterdaten sind veraltet. Das System gibt nicht frei,
   sondern zeigt "keine belastbare Entscheidung" und einen manuellen Prüfpfad.
5. **Übergabefehler:** Fach oder Code funktioniert nicht. Die Sendung bleibt
   gesichert, ein Supportfall wird eröffnet, die Rückgabe wird geplant.

## 3. Anforderungen

### 3.1 Priorisierte Funktionen

| Priorität | Funktion | Status im Prototyp |
|---|---|---|
| P0 | Netzlagebild mit Missionen, Stationen und Wetterzustand | umgesetzt, Demodaten |
| P0 | Flugfreigabe mit vier Wetterzuständen und Begründung | umgesetzt, simulierte Logik |
| P0 | Stationskapazität, Fächer, Ladezustand und Ausfälle | umgesetzt, Demodaten |
| P0 | Sendungsverfolgung und Abholung aus Empfängersicht | umgesetzt, Demodaten |
| P0 | Fehlerfälle sichtbar machen | umgesetzt als Zustände und Hinweise |
| P1 | Höhen- und Geschwindigkeitsmodell | als Arbeitshypothese dargestellt |
| P1 | Missionsdetail mit Energie-, Nutzlast- und Routenprüfung | teilweise umgesetzt |
| P1 | Ausweichstation und Umplanung | als Aktion angelegt, nicht vollständig simuliert |
| P2 | Kennzahlen-Dashboard mit vermiedenen Straßenfahrten | Platzhalter, keine Messung |
| P2 | Lärm- und Akzeptanzanalyse | offen |

### 3.2 Zulässige Paketmaße und Nutzlast

Diese Werte sind **zu bestimmende Parameter**, keine beschlossenen Grenzwerte:

- max. Nutzlast pro Mission,
- max. Außenmaße und Volumen des Pakets oder der Tasche,
- Schwerpunkt und Befestigung,
- Temperaturführung für gekühlte Ware,
- zulässige Witterung für die Ladung.

Der Prototyp verwendet Beispielwerte und kennzeichnet sie als Demo. Die echten
Grenzen müssen aus Herstellerangaben, Betriebsgenehmigung und Standortprüfung
abgeleitet werden.

## 4. Lieferablauf und Betriebskonzept

1. Auftrag wird angenommen und einem Logistikstandort zugeordnet.
2. Paket wird auf Maß, Masse, Schwerpunkt und Temperatur geprüft.
3. Mission wird geplant: Route, Höhenband, Zeitfenster, Drohne, Nutzlast.
4. Flugfreigabe prüft Wetter, Luftraum, Route, Energie, Station und Sicherheit.
5. Paket wird in die Tasche geladen und gesichert.
6. Start erfolgt nur bei gültiger Freigabe und freiem Startbereich.
7. Flug folgt dem Korridor und der vorgesehenen Höhenebene.
8. Ankunft an der Packstation, geschützte Übergabe in ein verschlossenes Fach.
9. Empfängerin authentifiziert sich und entnimmt das Paket.
10. Drohne lädt, wird geprüft und für die nächste Mission freigegeben.
11. Bei Abbruch: Rückkehr, Ausweichlandung oder sichere Weiterleitung nach
    definiertem Verfahren.

## 5. Infrastruktur

### 5.1 Packstationen

- Zentral und barrierearm erreichbar.
- Getrennte Bereiche: öffentliche Abholung, Landebereich, Laden, Wartung.
- Freie An- und Abflugwege, Abstand zu Gebäuden, Bäumen, Leitungen und
  temporären Hindernissen.
- Verschlossene Fächer mit authentifizierter Abholung.
- Ladeinfrastruktur, Energieversorgung, Ladezeiten, Reserven.
- Ausweichfächer und Reservekapazität für belegte oder ausgefallene Stationen.
- Wartungszugang ohne Publikumsverkehr.

### 5.2 Ladeinfrastruktur

Zu bewerten:

- Laden an der Station versus Akkutausch,
- Ladezeit und Missionsdichte,
- Netzanschluss und Lastspitzen,
- Temperaturführung beim Laden,
- Reserven bei Stromausfall,
- Wartungs- und Prüfintervalle.

Der Prototyp zeigt Ladezustand und freie Fächer, nicht die elektrische
Auslegung.

### 5.3 Sicherheit und Diebstahlschutz

Schutzmaßnahmen, die überprüfbar formuliert werden:

- Trennung von Publikumsbereich und Rotorbereich.
- Verriegelung während Start, Landung und Übergabe.
- Übergabe nur in ein verschlossenes Fach, nicht in offene Hände während des
  Rotorbetriebs.
- Authentifizierte Abholung mit Code oder App.
- Protokollierung von Öffnung, Übergabe und Störung.
- Manipulations- und Zutrittserkennung.
- Verhalten bei blockierter Landefläche, unbefugtem Zutritt und fehlgeschlagener
  Übergabe.

Es wird keine absolute Diebstahlsicherheit versprochen. Die Wirksamkeit muss
geprüft und gegen Insider-, Technik- und Gewaltrisiken bewertet werden.

## 6. Routen, Höhen und Geschwindigkeit

- Drohnen nutzen definierte Korridore und Höhenbänder.
- Ebenenwechsel nur an definierten Punkten, mit sicheren Abständen und
  Ausweichmöglichkeiten.
- Kreuzungen und Kapazitäten werden explizit geplant.
- Höhere Ebenen können höhere Geschwindigkeiten ermöglichen, sind aber nicht
  automatisch leiser. Die Hypothese "höher = schneller = leiser" ist offen.
- Lärm muss mit Messbedingungen, Abstand, Richtwirkung und Bodenbeschaffenheit
  bewertet werden. Eine Dezibelzahl allein genügt nicht.
- Der Prototyp kennzeichnet das Höhenmodell als Arbeitshypothese und zeigt
  Geschwindigkeitsbereiche nur als Planungsannahme.

## 7. Wetter und Flugfreigabe

### 7.1 Benötigte Daten

- Windgeschwindigkeit, Richtung und Böen.
- Niederschlag und Art.
- Gewitter, Blitzaktivität, Vereisungsrisiko.
- Temperatur und Sichtweite.
- Bedingungen entlang der Route und an Start-, Ziel- und Ausweichstationen.
- Bedingungen in den geplanten Flughöhen, soweit belastbare Daten vorliegen.
- Gesamtes Flugzeitfenster inklusive Rückflug.

### 7.2 Zustände

| Zustand | Bedeutung | UI-Verhalten |
|---|---|---|
| Flug möglich | Alle Prüfungen erfüllt | Freigabe möglich, mit Restrisiko und Aktualität |
| Flug eingeschränkt | Definierte Einschränkung, z. B. Böen nahe Grenzwert | Freigabe nur mit bestätigter Einschränkung |
| Flug nicht möglich | Grenzwert oder Bedingung verletzt | Keine Freigabe, Grund und nächstes Fenster |
| Keine belastbare Entscheidung | Daten fehlen, sind veraltet oder unsicher | Keine automatische Freigabe, manueller Prüfpfad |

Eine positive Wetterbewertung ist nur ein Teil der Gesamtfreigabe. Route,
Luftraum, Energie, Nutzlast, Stationsverfügbarkeit und Sicherheitsbedingungen
werden zusätzlich geprüft.

### 7.3 Datenqualität

Zu speichern und anzuzeigen: Quelle, Abrufzeit, Gültigkeitszeitraum, räumliche
Auflösung, Beobachtung oder Vorhersage, Unsicherheit und Alter. Veraltete Daten
erzeugen nie automatisch eine positive Freigabe. Während des Flugs werden
relevante Änderungen überwacht; Verfahren für Verschiebung, Umleitung, Rückkehr
und alternative Landung sind definiert.

## 8. Regulierung

Arbeitsannahme: Deutschland und EU, solange kein anderer Einsatzort festgelegt
ist. Die folgenden Punkte sind **Prüfaufträge**, keine Rechtsaussage:

- Betriebskategorie und Genehmigungsweg.
- Sichtweite, BVLOS und gegebenenfalls SORA.
- Geografische Flugzonen und U-space.
- Flughöhen, Abstände und Personenüberflug.
- Lärm- und Naturschutzanforderungen.
- Datenschutz, Videoaufnahmen und Datenspeicherung.
- Versicherung und Haftung.
- Kennzeichnung, Remote ID und Registrierung.

Zu dokumentieren sind Quelle, Prüfdatum, räumlicher Geltungsbereich und Bedeutung
für das Konzept. Geplante Korridore und Höhenebenen werden nie als genehmigt
dargestellt.

## 9. Bewertung

Kennzahlen, die tatsächlich gemessen werden müssen:

- vermiedene Straßenfahrten und Lieferkilometer, inklusive Zubringerverkehr,
- Zustellzuverlässigkeit und Lieferdauer,
- wetterbedingte Ausfallzeiten,
- Energieverbrauch und Kosten pro erfolgreicher Zustellung,
- Lärmbelastung und Stationsauslastung,
- Sicherheitsereignisse und Zugänglichkeit,
- Abholwege der Empfänger.

Eine Umweltentlastung wird nicht vorausgesetzt. Der Prototyp zeigt Platzhalter
und keine erfundenen Messwerte.

## 10. Fehlerfälle

| Fehlerfall | Erwartetes Verhalten |
|---|---|
| Ungeeignetes Wetter | Keine Freigabe, Grund, nächstes prognostiziertes Fenster |
| Fehlende oder veraltete Wetterdaten | Keine belastbare Entscheidung, manueller Prüfpfad |
| Geringe Akkureserve | Keine Freigabe oder Rückkehr, Reserve sichtbar |
| Volle Paketfächer | Keine Annahme oder Ausweichstation |
| Stationsausfall | Umplanung, Rückhalt oder Rückkehr |
| Blockierter Landeplatz | Abbruch der Annäherung, Ausweichlandung |
| Verbindungsverlust | Definierter Notfallpfad, letzte bekannte Position, kein Fake-Live |

## 11. Annahmen und offene Fragen

Annahmen:

- Einsatzort zunächst Wuppertal, ausdrücklich als Arbeitsannahme.
- Transport zwischen Logistikstandort und Packstation, nicht direkt an die
  Haustür.
- Feste Korridore und Höhenbänder.
- Wetterdaten und Luftraumdaten kommen aus externen Quellen.
- Der Prototyp verwendet Demodaten.

Offen:

- Konkrete Drohnenklasse, Hersteller, Nutzlast und Lärmwerte.
- Genaue Routen, Höhen und Kapazitäten.
- Genehmigungsweg und Betreibermodell.
- Stationsstandorte und Eigentumsverhältnisse.
- Energie- und Ladekonzept.
- Wirtschaftlichkeit und Skalierung.
- Datenschutzfolgenabschätzung.
- Messplan für Lärm und Verkehrsentlastung.

## 12. Entscheidungen

| Datum | Entscheidung | Begründung |
|---|---|---|
| 2026-10-21 | Drei Produktoberflächen: Leitstelle, Stationen, Empfänger | Unterschiedliche Entscheidungen und Detailtiefe |
| 2026-10-21 | Vier Wetterzustände inkl. "keine belastbare Entscheidung" | Fehlende Daten dürfen keine Freigabe erzeugen |
| 2026-10-21 | Wetter ist nur ein Teil der Gesamtfreigabe | Route, Energie, Nutzlast und Station bleiben eigenständige Prüfungen |
| 2026-10-21 | Höhenmodell als Arbeitshypothese | "Höher = schneller = leiser" ist nicht belegt |
| 2026-10-21 | Prototyp mit Demodaten und sichtbarem Hinweis | Keine Verwechslung mit Realbetrieb |
| 2026-10-21 | React-Oberfläche mit drei Ansichten | Konzept und Fehlerfälle sollen prüfbar werden |

## 13. Arbeitsstand

Erledigt:

- Projektgedächtnis mit `AGENTS.md`, `Konzept.md`, `Architekture.md` angelegt.
- Fachliches Grundkonzept mit Zielgruppen, Ablauf, Wetterlogik,
  Sicherheitsmaßnahmen und Fehlerfällen dokumentiert.
- React-Prototyp in `app/` mit Leitstellen-, Stations- und Empfängeransicht
  umgesetzt.

Offen:

- Offizielle regulatorische Quellen mit Prüfdatum ergänzen.
- Drohnenparameter und Lärmmessplan festlegen.
- Konkrete Korridore, Höhen und Stationsstandorte prüfen.
- Kennzahlen mit realen oder belastbar simulierten Daten belegen.
- Nutzer tests mit Empfängern, Stationsbetrieb und Leitstelle.

Blockiert:

- Nichts blockiert die Prototyp-Arbeit. Ein Realbetrieb ist ohne
  Standortprüfung, Genehmigung und Sicherheitsnachweise nicht möglich.

Nächster Schritt:

- Einsatzgebiet und Drohnenklasse festlegen, danach Wettergrenzen und
  Stationskapazitäten parametrisieren. Anschließend den Prototyp mit diesen
  Parametern und einem dokumentierten Testszenario prüfen.
