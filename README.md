# Urbane Paketversorgung durch Drohnen

Hackathon-Projekt im Rahmen von **Vibecode+** · **Team Routing**

Wir entwickeln ein Konzept für ein urbanes Drohnen-Liefernetz zwischen Logistikstandorten, Anbietern und sicheren Packstationen. Unsere Leitfrage: Wie können wir Städte bei steigenden Bestellungen entlasten und zugleich eine zuverlässige Paketversorgung ermöglichen?

**Stand: 21. Oktober 2026 – Konzeptphase.** Anforderungen und Architekturentwurf sind dokumentiert. Software, Simulation und Hardwareanbindung sind noch nicht implementiert. Deutschland/EU ist der vorläufig angenommene Einsatzraum. Nutzen, Machbarkeit und Sicherheit müssen noch nachgewiesen werden; ein Realbetrieb ist nicht freigegeben.

## Projektidee

Geeignete Pakete sollen über feste Flugkorridore vom Lager zu Packstationen transportiert und dort geschützt übergeben werden. Die Planung berücksichtigt Drohnen, Energie, Wetter, Luftraum und Stationskapazitäten gemeinsam. Bei ungeeigneten Bedingungen braucht es eine Verschiebung oder bodengebundene Ersatzversorgung.

Direkte Kundenlieferungen über dynamische Routen werden als mögliche Erweiterung untersucht. Ob sie Teil eines späteren Piloten werden, ist offen.

## Die Teams

| Team | Schwerpunkt im gemeinsamen Konzept |
|---|---|
| Design | Gestaltung und verständliche Darstellung von Abläufen und Status; genaue Zuständigkeit noch abzustimmen |
| **Routing – unser Team** | Drohnen zuweisen, Missionen planen, Lieferungen bündeln und Änderungen berücksichtigen |
| Drohnen Typen | Geeignete Fahrzeuge, Leistungsdaten und technische Einsatzgrenzen |
| Packstationen | Standorte, Landung, Paketübergabe, Kapazitäten und Ladeinfrastruktur |

Der Abstimmungsbedarf zwischen Routing und den anderen Teams ist im [Konzept](Konzept.md#22-abstimmung-mit-den-anderen-teams) beschrieben.

## Unser Schwerpunkt: Routing

Die vorgeschlagenen Routing-Anforderungen umfassen:

- **Drohnenauswahl:** Welche geeignete Drohne kann die Lieferung am frühesten sicher abschließen? Verfügbarkeit, Position, Beladung, Nutzlast, Wartung und Akku zählen gemeinsam.
- **Lieferbündelung:** Passende Aufträge verbinden und Zwischenstopps unter Berücksichtigung von Lieferfristen und Kapazitäten planen.
- **Routenplanung:** Feste Verbindungen, Höhenebenen, Kreuzungen sowie Start- und Landevorgänge koordinieren; bei Änderungen zulässige Alternativen bewerten.
- **Wetter und Luftraum:** Aktuelle Daten und Vorhersagen für die gesamte Mission einschließlich Rückflug oder sicherer Weiterleitung berücksichtigen.
- **Energie und Stationen:** Verbrauch, Reserven sowie freie Lande-, Paketfach- und Ladekapazitäten einplanen.
- **Sicherheit und Störungen:** Konflikte vermeiden, geeignete Landeflächen voraussetzen und Verfahren für Ausfälle, Umleitungen und gesperrte Ziele festlegen.
- **Nachvollziehbarkeit:** Lieferprognosen, Auswahlentscheidungen und Ablehnungsgründe verständlich darstellen.

Die vollständigen Anforderungen **R01–R14** stehen im [Konzept](Konzept.md#21-team-routing--erweiterte-anforderungen). Planungsablauf, Datenbedarf und vorgesehene Fehlerfallprüfungen stehen in der [Architektur](Architekture.md).

## Dokumentation und Einstieg

| Datei | Inhalt |
|---|---|
| [Konzept.md](Konzept.md) | Fachlicher Stand, Anforderungen, Annahmen, Risiken, Quellen, Entscheidungen und aktuelle Übergabe |
| [Architekture.md](Architekture.md) | Technische und physische Architektur, Daten, Schnittstellen, Entscheidungslogik und geplante Prüfungen |
| [AGENTS.md](AGENTS.md) | Verbindliche Arbeitsregeln und Commit-Konvention |

Zum Einstieg das Konzept und den dortigen Übergabestand lesen, anschließend den Architekturentwurf. Für die Mitarbeit gelten die Arbeitsregeln. Diese README dient als Überblick; die verbindlichen Projektdateien enthalten den jeweiligen Detailstand.

## Nächste Schritte

1. Pilotgebiet, Lager und mögliche Zielstationen festlegen.
2. Mit den Teams Drohnen Typen und Packstationen einen gemeinsamen Beispieldatensatz für eine Mission abstimmen.
3. Paketprofil, Nachfrage, Lieferfenster und Vergleichsversorgung beschreiben.
4. Datenquellen, technische Grenzen und regulatorische Voraussetzungen konkretisieren.
5. Messbare Abnahmekriterien und einen abgegrenzten Prototypumfang vereinbaren.

## Mitarbeit

Anforderungen und wesentliche Ergebnisse in der zuständigen Projektdatei pflegen. Vorschläge, Annahmen, beschlossene Anforderungen, Implementierung und tatsächlich durchgeführte Prüfungen klar kennzeichnen. Bestehende Ergebnisse anderer Teams erhalten.

Für Commits gilt `what(where): what in detail`, beispielsweise:

```text
docs(routing): describe mission planning requirements
```

Die vollständige Konvention steht in [AGENTS.md](AGENTS.md#commit-schema).
