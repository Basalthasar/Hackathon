# Konzept - FlyToYou

Stand: 2026-10-21
Status: P0-Prototyp umgesetzt, Demodaten. Kein echter Zahlungs-, Liefer- oder
Flugbetrieb. Drohnen sind das primäre Transportmittel, aber nicht zertifiziert
oder genehmigt.

## 1. Produkt und Versprechen

FlyToYou verbindet lokale Händler und Apotheken mit Menschen, die Produkte per
Drohne geliefert oder selbst abholen möchten. Kunden sehen vor dem Kauf:

- welches konkrete Filialangebot verfügbar ist,
- wie aktuell der Bestand ist,
- was die Bestellung inklusive Lieferung kostet,
- wann die Drohne voraussichtlich an der Abgabestelle ankommt.

Sehr kurze Lieferzeiten sind ein Ziel für geeignete lokale Bestellungen. Die App
zeigt ein berechnetes Zeitfenster und verspricht keine pauschale Lieferung in
wenigen Minuten.

Arbeitsannahme: Wuppertal, deutsche Oberfläche, Euro, Ortszeit. Beispielorte sind
Elberfeld, Barmen, Vohwinkel, Cronenberg, Ronsdorf, Varresbeck, Oberbarmen und
Sonnborn.

## 2. Zielgruppen und Rollen

| Rolle | Bedarf | Oberfläche |
|---|---|---|
| Kunde | Produkt finden, Preis und Ankunft verstehen, bestellen, verfolgen | Suche, Angebotsvergleich, Warenkorb, Checkout, Tracking, Abholung |
| Händler / Apotheke | Aufträge annehmen, Ware packen, an Drohne übergeben | Arbeitsliste, Bestand, Ablehnungsgründe, Vorbereitung, Übergabe |
| Flugbetrieb | Drohnen, Missionen, Batterie, Wetter, Startfenster | Flottenansicht, Missionen, Countdown, Landung |
| Betrieb | Zuweisung, Ausnahmen, Zahlungen, Partnerstatus | Bestellübersicht, Drohnenzuweisung, Bestandsausnahmen, Zahlungsstatus |

Der Demo-Rollenwechsel ist sichtbar. In echten Konten werden Rechte serverseitig
und mandantenbezogen geprüft; ein frei wählbarer Rollenschalter ist unzulässig.

## 3. Transportmodell

Drohnen sind der Standard. Fahrrad und E-Scooter sind im Pilot nicht vorgesehen.
Auto ist nur der Bodenfall oberhalb der Drohnengrenze.

| Klasse | Nutzlast | Reichweite | Einsatz |
|---|---:|---:|---|
| D25 | 25 kg | 18 km | Standardlieferungen, Apotheke, Lebensmittel |
| H60 | 60 kg | 30 km | Gebinde, Kisten, schwerere Waren |
| Auto | bis 80 kg | Liefergebiet | Nur wenn Nutzlast oder Reichweite der Drohne nicht reichen |

Der Lieferradius der Pilotfilialen liegt bei 10 bis 12 km. Die Drohne fliegt zur
angegebenen **Abgabestelle**, nicht zu einer Übergabestation. Die letzte Meile
zur Haustür ist nicht automatisch Teil des Flugs und muss vor Ort geklärt werden.

## 4. Bestellablauf

1. Ziel eingeben, Produkt suchen, konkretes Filialangebot wählen.
2. Empfangsart wählen: Drohnenlieferung oder Selbstabholung.
3. System prüft Bestand, Öffnungszeiten, Vorbereitung, Lieferradius, Nutzlast,
   Reichweite und Wetter.
4. Befristetes Angebot mit Kosten, Zeitfenster, Drohne und Abgabestelle.
5. Checkout: serverseitige Prüfung, Reservierung, Zahlungsautorisierung.
6. Händler bestätigt Ware und Vorbereitung.
7. Händler stellt zusammen, packt und übergibt an die Drohne.
8. **Erwarteter Start:** Die Drohne startet frühestens 30 bis 60 Sekunden nach
   Bestellaufgabe. Der Delay ist randomisiert und liegt in der Zustandslogik
   (Demo-Backend), nicht in einer CSS-Animation. Vorher bleibt der Status
   „Abholbereit“ beziehungsweise „wartet“.
9. Drohne fliegt zur Abgabestelle. Die Bewegung auf der Karte ist simuliert.
10. Landung, Empfangscode, Beleg, Bewertung oder Problemfall.

## 5. Suche, Angebot und Bestand

Die Suche startet mit Adresse oder freiwilliger Standortfreigabe. Ergebnisse
zeigen Produkt, Händler, Filiale, Preis, Bestandsstatus, Entfernung und Zeit.
Filter: Kategorie, Preis, Entfernung, Verfügbarkeit, geöffnete Filiale,
Selbstabholung, Lieferbarkeit. Sortierung: Preis, Zeit, Nähe.

Ein Produkt beschreibt eine konkrete Variante. Ein Angebot ergänzt Filiale,
Preis, SKU und Verfügbarkeit. Jeder Bestand hat Quelle, Zeitstempel und
Qualitätsstatus:

- verfügbar,
- wenige verfügbar,
- nicht verfügbar,
- unbestätigt.

Veraltete oder unbestätigte Bestände sind nicht sofort verbindlich buchbar.

## 6. Preis und Lieferzeit

### Kostenformel

```
Liefergebühr = Basisgebühr je Transportart
             + Entfernung in km × Kilometerpreis je Transportart
             + Gewichtszuschlag ab 5 kg
```

Demo-Werte:

| Transportart | Basisgebühr | Kilometerpreis |
|---|---:|---:|
| Drohne D25 | 2,90 € | 0,22 €/km |
| Schwerlast-Drohne H60 | 4,90 € | 0,32 €/km |
| Auto | 6,50 € | 0,65 €/km |

Gewichtszuschlag: 0,25 € je Kilogramm über 5 kg. Selbstabholung hat keine
Liefergebühr. Express ist ein separater Serviceaufschlag von 2,50 €.

### Kostenaufschlüsselung

In der Kostenaufschlüsselung stehen **nur Kostenzeilen**. Distanz und Gewicht
erscheinen als Zahl in der Kostenzeile, die sie verursachen:

```
Warenwert                         3,49 €
Basisgebühr                       2,90 €
Distanzkosten (8,2 km)            1,80 €
Gewichtszuschlag (0,1 kg)         0,00 €
Service                           0,00 €
Gesamt                            8,19 €
```

Keine separaten Zeilen „Gewicht: 0,1 kg“ oder „Distanz: 8,2 km“ ohne
Kostenbezug.

### Karte und Bewegung

Der Checkout und die Bestellverfolgung nutzen OpenStreetMap mit Attribution.
Die Karte zeigt Start, Abgabestelle, Lieferradius und die Route. Die Drohne
bewegt sich sichtbar simuliert. Es gibt keine Live-Telemetrie.

Vor der Bestellung zeigt die Karte eine Vorschau. Nach der Bestellung wartet die
Drohne, bis der erwartete Start erreicht ist. Erst bei Status „Unterwegs“ bewegt
sich der Marker. Bei „Zugestellt“ steht er an der Abgabestelle.

### ETA

Die ETA ist ein Fenster ab Bestellung. Bestätigung, Vorbereitung, Startfenster,
Flug und Empfang bestimmen den Ablauf. Entfernung ist nur ein Einflussfaktor.
Die App zeigt keine Minutenpräzision, die sie nicht belegen kann.

## 7. Händler und Apotheke

Der Händler sieht neue, bestätigte, in Vorbereitung befindliche und abholbereite
Aufträge. In der Demo kann der Händler beziehungsweise die Filiale gewählt werden;
die Arbeitsliste zeigt die Aufträge des Demo-Kunden A. Yilmaz. Jede Aktion
(annehmen, vorbereiten, abholbereit, übergeben) aktualisiert unmittelbar dieselbe
Bestellung in der Kundenverfolgung. Aktionen: annehmen, mit Grund ablehnen, Zusammenstellen starten,
abholbereit melden, an Drohne übergeben oder Abholung bestätigen.

Apotheke:

- nicht rezeptpflichtige Produkte im Pilot,
- keine Beratung, keine rezeptpflichtigen Arzneimittel,
- Kühlware und besondere Arzneimittel nicht buchbar,
- Bestand und Verfügbarkeit wie bei anderen Händlern.

## 8. Flugbetrieb und Status

Die Flottenansicht zeigt Drohnen, Batterie, Nutzlast, Reichweite und Missionen.
Ein Auftrag durchläuft getrennt:

- Bestellstatus: PENDING, CONFIRMED, FULFILLING, READY, IN_TRANSIT, DELIVERED,
  REJECTED, CANCELLED, EXPIRED.
- Vorbereitung: NEW, ACCEPTED, PICKING, READY, HANDED_OVER, REJECTED.
- Zahlung: PENDING, AUTHORIZED, CAPTURED, REFUNDED, FAILED, VOIDED.
- Lieferung: NONE, UNASSIGNED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED,
  FAILED.

Der erwartete Start wird aus `droneDepartAt` berechnet. Der Status wechselt erst
nach Ablauf des Delays und nach Händlerübergabe auf „Unterwegs“. Die
Bestellverfolgung zeigt denselben Status und dieselbe Karte wie die konkrete
Bestellung.

## 9. Fehlerfälle

| Situation | Verhalten |
|---|---|
| Bestand reicht nicht | Vor Bestätigung ablehnen, Reservierung lösen |
| Händler reagiert nicht | Frist ablaufen lassen, Kunde informieren, Autorisierung aufheben |
| Keine geeignete Drohne | Keine verbindliche Zusage, Auto als Fallback oder Storno |
| Nutzlast/Reichweite überschritten | Keine Drohne, Auto prüfen oder ablehnen |
| Preis oder Angebot abgelaufen | Neu berechnen, Zustimmung einholen |
| Zahlung unklar | Übergabe sperren, Provider abgleichen, kein zweiter Einzug |
| Kunde nicht erreichbar | Kontakt- und Warteprozess, sichere Rückführung |
| Wetter oder Partnerausfall | Machbarkeit neu prüfen, Option sperren oder neue ETA |
| Verbindungsverlust | Letzte bekannte Position, definierter Notfallpfad, kein Fake-Live |

## 10. Umfang des Prototyps

Umgesetzt:

- Suche, Kategorien, Sortierung, Angebotsvergleich,
- Bestandsstatus und Qualität,
- Warenkorb mit einer Filiale,
- Drohnenlieferung oder Selbstabholung,
- Standard oder Express,
- distanz- und gewichtsbasierte Liefergebühr,
- Kostenaufschlüsselung nur mit Kostenzeilen,
- OpenStreetMap mit simulierter Drohnenbewegung,
- befristetes Angebot, Checkout, Bestellung,
- 30 bis 60 Sekunden erwarteter Start nach Bestellaufgabe,
- Händler-Arbeitsliste inklusive Apotheke,
- Flottenansicht mit Drohnen, Batterie, Missionen und Startcountdown,
- Bestellverfolgung mit Karte, Statusfolge und Kosten,
- Betriebsansicht mit Zuweisung, Zahlungen und Ausnahmen,
- sieben vollständige Bestellungen für das Demo-Kundenkonto,
- Hell- und Dunkelmodus für alle Rollen.

Nicht umgesetzt:

- Backend, Datenbank, echte Authentifizierung,
- echte Zahlung, echte Bestandsanbindung, echtes Routing,
- echte Telemetrie, echte Flugfreigabe oder Zertifizierung,
- Benachrichtigungen, Bewertungen, Support-Workflow,
- autonome Fahrzeuge, Eigenversand, lange Transportketten.

## 11. Entscheidungen

| Datum | Entscheidung | Begründung |
|---|---|---|
| 2026-10-21 | Produktname FlyToYou | Aktueller Produktname |
| 2026-10-21 | Wuppertal als Demo-Pilotgebiet | Konkrete Beispiele |
| 2026-10-21 | Drohne als Standard, Auto als Bodenfall | Drohnenzentrierter Pilot |
| 2026-10-21 | D25 25 kg/18 km, H60 60 kg/30 km | Höhere Nutzlast und Reichweite |
| 2026-10-21 | Lieferradius 10 bis 12 km | Erweiterte Auslieferdistanz |
| 2026-10-21 | Abgabestelle statt Übergabestation | Drohne fliegt zur angegebenen Adresse |
| 2026-10-21 | Startdelay 30 bis 60 s in der Zustandslogik | Kein verfrühter Flug |
| 2026-10-21 | OSM-Karte mit simulierter Bewegung | Nachvollziehbare Route, keine Live-Position |
| 2026-10-21 | Kostenzeilen mit Distanz/Gewicht als Ursache | Nur Kosten, aber nachvollziehbare Mehrkosten |
| 2026-10-21 | Apotheke als Partner | Zusätzlicher lokaler Bedarf |
| 2026-10-21 | Fünf vollständige Kundenbestellungen | Übersichtliche, prüfbare Historie |

## 12. Arbeitsstand

Erledigt:

- React-Prototyp mit Kunden-, Händler-, Flotten- und Betriebsansicht.
- Drohnenzentrierte Preis-, Karten- und Statuslogik.
- OSM-Karte, simulierte Bewegung, Startdelay.
- Apotheke und erweiterte Mockdaten.
- Sieben vollständige Bestellungen im Kundenkonto.

Offen:

- Backend, Datenbank, echte Authentifizierung und Rechteprüfung.
- Echte Zahlungs-, Bestands- und Routing-Adapter.
- Echte Geodaten und Telemetrie.
- Benachrichtigungen, Bewertungen, Support und Rückerstattungen.
- Pilotpartner, Tarife und regulatorische Prüfung.

Blockiert:

- Nichts blockiert den Prototyp. Echter Betrieb ist ohne Partner, Drohnen-
  freigabe und rechtliche Prüfung nicht möglich.

Nächster Schritt:

- Backend-Skelett mit Quote- und Order-Endpunkten, danach einen echten
  Bestandsadapter und einen Zahlungsdienst im Testmodus anbinden.
