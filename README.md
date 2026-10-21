# Lokale Lieferplattform

Hackathon-Projekt im Rahmen von **Vibecode+** · **Team Routing**

Wir entwickeln eine Plattform, auf der Menschen Produkte bei teilnehmenden lokalen Händlern und Supermärkten suchen, vergleichen und bestellen können – zur Lieferung oder Selbstabholung. Vor dem Kauf sollen Bestandsaktualität, Gesamtpreis und ein berechnetes Empfangsfenster erkennbar sein.

**Stand: 21. Oktober 2026 – integriertes Konzept, keine App implementiert.** Die Gruppenunterlagen und die technische Arbeitsgrundlage sind aufgenommen. Deutschland/EU ist die Arbeitsannahme; reale Partner, Tarife und Betriebsprozesse sind offen.

## Produkt und geplanter Einstieg

Transportmittel, Empfangsort und Servicelevel sind getrennte Eigenschaften. So nutzen „Express per Fahrrad zur Hausadresse“ und später „Standard per Drohne zur Station“ denselben Bestellkern. Selbstabholung funktioniert ohne Lieferauftrag.

**Empfohlener MVP:** ein kleines Gebiet, ausgewählte Händler, eine Filiale pro Warenkorb, menschliche Kuriere und Selbstabholung. Kundenoberfläche, Händlerportal, Kurieransicht und Betrieb/Support bilden gemeinsam den Ablauf von Suche und Bestandsreservierung über Zahlung und Vorbereitung bis zum bestätigten Empfang ab. Konto, Historie, erneute Bestellung, Bewertungen, Hell/Dunkel und zugängliche Bedienung gehören zum vorgeschlagenen Umfang.

| Stufe | Vorgesehener Umfang |
|---|---|
| P0 | Durchspielbarer Prototyp mit erkennbaren Demo-Daten und simulierten Integrationen |
| M1 | Begrenzter echter Pilot mit Bestands-, Zahlungs- und Kurierpartnern sowie Support |
| A2 | Bildsuche, Terminfenster, Stationen, Umleitung, Eigenversand, Bündelung und mehrere Händler |
| A3 | Drohnen, autonome Fahrzeuge, längere Transportketten und automatische Warenausgabe |

Die Stufen sind Konzeptvorschläge. Bestände werden beim Checkout erneut geprüft und reserviert; eine Suche reserviert keine Ware. Lieferzeit ist eine berechnete Spanne aus Vorbereitung, Kapazität und Strecke. Für spätere autonome Lieferungen sind gesonderte Nachweise und Freigaben erforderlich.

## Die Teams

| Team | Schwerpunkt im gemeinsamen Konzept |
|---|---|
| Design | Gestaltung und verständliche Darstellung von Abläufen und Status; genaue Zuständigkeit noch abzustimmen |
| **Routing – unser Team** | Lieferbarkeit, Transportkosten, Zeit und Kapazitäten planen; später Drohnen zuweisen und Touren bündeln |
| Drohnen Typen | Geeignete Fahrzeuge, Leistungsdaten und technische Einsatzgrenzen |
| Packstationen | Standorte, Landung, Paketübergabe, Kapazitäten und Ladeinfrastruktur |

Der Abstimmungsbedarf zwischen Routing und den anderen Teams ist im [Konzept](Konzept.md#22-abstimmung-mit-den-anderen-teams) beschrieben.

## Unser Schwerpunkt: Routing

Routing liefert Machbarkeit, Transportkosten und Zeitprognosen an den Bestellkern und bindet Kapazitäten. Im Einstieg betrifft dies menschliche Kuriere; Selbstabholung braucht keine Tour. Die App erhält nachvollziehbare Gründe für nicht verfügbare Angebote.

Die bestehenden Drohnenanforderungen **R01–R14** bleiben als Ausbau erhalten: geeignete Drohne, Energie/Reserve, Wetter, feste und dynamische Routen, Landeflächen, Kollisionen und Sperrzonen. Sicherheitskritische Flugführung gehört zum geeigneten Flottenbetrieb. Details stehen im [Konzept](Konzept.md#21-team-routing--erweiterte-anforderungen).

## Dokumentation und Einstieg

| Datei | Inhalt |
|---|---|
| [Konzept.md](Konzept.md) | Aktueller Produktstand, MVP/Ausbau, Geschäftsregeln, Routing-Anforderungen, Quellen und Übergabe |
| [Architekture.md](Architekture.md) | Plattform- und Drohnenarchitektur, Datenmodell, Zustände, API-Vorschläge, zehn Entwicklungspakete und 16 geplante Abnahmeszenarien |
| [Gelieferte Grundlagen](docs/grundlagen/README.md) | Unverändertes Word-Konzept und vollständige Markdown-Arbeitsgrundlage einschließlich Coding-Startprompt |
| [AGENTS.md](AGENTS.md) | Dauerhafte Arbeitsregeln und Commit-Konvention |

Zum Einstieg Konzept und Übergabe lesen, danach Architektur. Der Startprompt in den Grundlagen ist eine Vorlage für einen gesonderten Entwicklungsauftrag. Technische Vorschläge und Demo-Werte sind noch nicht implementiert oder praktisch geprüft.

## Pitch-Bilder

Drei App-/Routing-Motive im Stil der gelieferten DroneDeliver-Referenz und eine Stadtvision liegen unter [assets/pitch](assets/pitch/README.md). Alle Bilder sind **KI-generierte Konzeptvisualisierungen mit Beispieldaten**.

## Nächste Schritte

1. MVP-Vorschlag und ersten P0-Durchstich abstimmen und gezielt beauftragen.
2. Liefergebiet, Händler, Picking-Verantwortung und Kuriermodell festlegen.
3. Bestandskontingent, Zahlungs-/Vertragsmodell, Kosten und Rückabwicklung klären.
4. Routing-Vertrag für Machbarkeit, Preis, Zeit und Kapazitätsbindung abstimmen.
5. B01–B09 anhand der geplanten Abnahmeszenarien umsetzen; B10 mit realen Partnerzugängen gesondert aktivieren.

## Mitarbeit

Anforderungen und wesentliche Ergebnisse in der zuständigen Projektdatei pflegen. Vorschläge, Annahmen, beschlossene Anforderungen, Implementierung und tatsächlich durchgeführte Prüfungen klar kennzeichnen. Bestehende Ergebnisse anderer Teams erhalten.

Für Commits gilt `what(where): what in detail`, beispielsweise:

```text
docs(routing): describe mission planning requirements
```

Die vollständige Konvention steht in [AGENTS.md](AGENTS.md#commit-schema).
