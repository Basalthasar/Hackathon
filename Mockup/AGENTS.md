# AGENTS.md - Arbeitsanweisung FlyToYou

## Projektziel

FlyToYou ist eine drohnenzentrierte lokale Lieferplattform: Menschen finden
Produkte bei teilnehmenden Händlern und Apotheken, vergleichen Filialangebote,
bestellen zur Drohnenlieferung oder Selbstabholung und verfolgen den Auftrag.
Drohnen sind das primäre Transportmittel. Der Prototyp zeigt den vollständigen
Ablauf mit Demodaten. Er ist keine echte Flug-, Zahlungs- oder Bestandssteuerung
und kein Nachweis für einen genehmigten Betrieb.

Leitfrage: Wie wird lokale Versorgung mit Drohnen planbar, transparent und
zugänglich, ohne Lieferzeiten, Nutzlast oder Verfügbarkeit zu übertreiben?

## Maßgebliche Projektdateien

| Datei | Inhalt | Primäre Wahrheit für |
|---|---|---|
| `AGENTS.md` | Arbeitsregeln, Rollen, Prüfregeln | Zusammenarbeit |
| `Konzept.md` | Produkt, Rollen, Ablauf, Preise, Fehlerfälle, Entscheidungen, Arbeitsstand | Fachliches Konzept |
| `Architekture.md` | Systemkomponenten, Datenmodell, Zustände, Preislogik, Schnittstellen, Grenzen | Technik |
| `docs/Lieferplattform_Vibecoding.md` | Ursprüngliche externe Arbeitsgrundlage | Ausgangsspezifikation |
| `README.md` | Startanleitung, Rollen, Netzwerk und Grenzen | Betrieb und Aufruf |
| `app/` | React-Prototyp mit Demodaten | Umsetzungsstand |

Das frühere Drohnenkonzept liegt archiviert unter `docs/archiv/`. Es ist die
fachliche Grundlage für Betrieb, Sicherheit und Regulierung, aber nicht der
aktuelle Produktstand.

## Arbeitsweise

1. Vor jeder Aufgabe `AGENTS.md`, `Konzept.md` und `Architekture.md` lesen.
2. Am dokumentierten Stand ansetzen. Keinen Zugriff auf frühere Chats unterstellen.
3. Bestehende Entscheidungen und Arbeitsergebnisse bewahren. Widersprüche
   ausdrücklich klären, nicht still überschreiben.
4. Neue Anforderungen aus dem Chat unmittelbar in `Konzept.md` dokumentieren.
5. Zwischen Vorschlag, Annahme, beschlossener Anforderung, implementierter
   Funktion und geprüftem Ergebnis unterscheiden.
6. Keine Entscheidungen, Messwerte, Quellen, Preise, Zahlungen oder Freigaben
   erfinden.

## Produktregeln

- Deutsche Oberfläche, Euro, Ortszeit des Liefergebiets. Interne Namen englisch.
- Der Händler oder die Apotheke verkauft die Ware. Die Plattform vermittelt
  Bestellung und Lieferung. Zahlung und Abrechnung erfolgen später über einen
  Dienstleister.
- Eine Filiale pro Warenkorb. Ein Filialwechsel darf den Warenkorb nicht
  stillschweigend mischen.
- Drohne ist der Standard. Nutzlastklassen: D25 bis 25 kg und 18 km Reichweite,
  H60 bis 60 kg und 30 km Reichweite. Auto ist der Bodenfall oberhalb der
  Drohnengrenze. Fahrrad und E-Scooter sind im Pilot nicht vorgesehen.
- Lieferziel ist die angegebene Abgabestelle, nicht eine Übergabestation.
- Karte: OpenStreetMap mit Attribution. Die Drohnenbewegung ist sichtbar simuliert und keine Live-Position.
- Nach Bestellaufgabe startet die Drohne frühestens nach einem randomisierten Delay von 30 bis 60 Sekunden. Der Delay liegt in der Zustandslogik (Demo-Backend), nicht in einer CSS-Animation. Vorher bleibt der Status „wartet“.
- Liefergebühr = Basisgebühr + Distanz × Kilometerpreis + Gewichtszuschlag.
  Selbstabholung hat keine Liefergebühr.
- In der Kostenaufschlüsselung stehen nur Kostenzeilen. Distanz und Gewicht erscheinen als Zahl in derjenigen Kostenzeile, die sie verursachen, zum Beispiel „Distanzkosten (8,2 km)“ und „Gewichtszuschlag (0,1 kg)“. Keine separaten Datenzeilen ohne Kosten.
- Die Karte ist schematisch, solange keine echten Geodaten und keine echte
  Telemetrie angebunden sind. Keine erfundene Live-Position.
- Apothekenprodukte: nur nicht rezeptpflichtige Artikel im Pilot. Keine
  Beratung, keine rezeptpflichtigen Arzneimittel.
- Veraltete oder unbestätigte Bestände sind nicht sofort verbindlich buchbar.
- Lieferzeit ist ein Fenster, keine pauschale Minutenversprechung.
- Drohnenbetrieb ist im Prototyp dargestellt, aber nicht zertifiziert oder
  genehmigt. Keine Flugfreigabe behaupten.

## Entwicklungs- und Prüfregeln

- Apotheke als Partner: nur nicht rezeptpflichtige Produkte im Pilot, keine Beratung.
- Die Kundenbestellungen zeigen eine kleine, vollständige Auswahl statt aller Demo-Aufträge.
- Die Händleransicht lässt die Wahl des Händlers zu und zeigt die Aufträge des Demo-Kunden. Jede Händleraktion aktualisiert unmittelbar dieselbe Bestellung in der Kundenverfolgung.


- React, TypeScript, Vite. Keine UI-Bibliothek, keine externen Kartendienste.
- Mobile ist die Basis. Jede interaktive Komponente hat Default-, Hover-,
  Focus-, Active-, Disabled- und, wo zutreffend, Lade-, Fehler- und
  Auswahlzustand.
- Keine Emoji in UI, Code, Dokumenten oder Commit-Texten.
- Keine erfundenen Kennzahlen. Demo-Werte sind sichtbar als Demo gekennzeichnet.
- Preise, Distanz, Gewicht und Gesamtbetrag müssen zusammenpassen.
- Vor Abschluss: `npm run build` in `app/` und die betroffenen Ansichten im
  Browser prüfen. Ergebnis und Grenzen dokumentieren.

## Übergabe

Vor Abschluss einer Aufgabe in `Konzept.md` unter "Arbeitsstand" festhalten:
erledigt, offen, blockiert, nächster Schritt. Geänderte Dateien und der Umfang
der Prüfung werden in der Antwort genannt. Eine Speicherung oder Prüfung wird
nur behauptet, wenn sie tatsächlich stattgefunden hat.
