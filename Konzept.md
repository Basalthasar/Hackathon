# Urbane Paketversorgung durch Drohnen – Konzept

Stand: 2026-10-21 · Phase: Initialisierung · Kein Realbetrieb freigegeben.

## 1. Problem und Ziel
Steigende Paketmengen verursachen Lieferverkehr. Das Projekt untersucht, ob ein Drohnennetz zwischen Logistikstandorten und zentralen innerstädtischen Packstationen Straßenverkehr verringern und zuverlässig versorgen kann. Der Nutzen ist nachzuweisen, einschließlich zusätzlicher Wege und Ausfälle.

**Beschlossene Anforderungen:** Die Nutzeranweisung bildet den Projektauftrag. Er umfasst ein schrittweise auszuarbeitendes Konzept; eine Softwareimplementierung, Beschaffung oder Flugerprobung ist noch nicht beauftragt. Arbeitsweise: [AGENTS.md](AGENTS.md). Technischer Entwurf: [Architekture.md](Architekture.md).

**Vorgeschlagene Zielgruppen:** Paketempfänger, Logistikunternehmen, Kommunen und Stationsbetreiber. Anwohner und Beschäftigte sind als betroffene Gruppen einzubeziehen.

**Vorgeschlagene Nutzungsszenarien:** gebündelter Transport geeigneter Pakete vom Logistikstandort zu Abholstationen; Rücktransport der Drohne; wetterbedingte Verschiebung oder bodengebundene Ersatzversorgung. Rücksendungen sind eine offene Erweiterung.

## 2. Anforderungen und Priorisierung
Die folgenden Prioritäten sind ein **Vorschlag** für die Bearbeitung, keine beschlossene Lieferplanung.

| ID | Anforderung aus dem Projektauftrag | Priorität |
|---|---|---|
| K01 | Vollständiger Ablauf von Auftrag und Beladung bis Übergabe, Rückflug, Laden und Wartung | P0 |
| K02 | Paketmaße und Nutzlast als zu bestimmende Parameter; Einsatzgrenzen aus Drohne, Umgebung und Vorgaben ableiten | P0 |
| K03 | Definierte Korridore und Höhenebenen mit Geschwindigkeitsbereichen, sicheren Wechseln, Kreuzungen, Abständen, Kapazitäten und Ausweichmöglichkeiten | P0 |
| K04 | Wetterbewertung für die gesamte Mission und Gesamtflugfreigabe mit weiteren Sicherheitsprüfungen | P0 |
| K05 | Erreichbare Stationen mit freien An-/Abflugwegen, Hindernisprüfung, Energieversorgung und Ausfallreserven | P0 |
| K06 | Öffentliche Abholung von Flug-, Lade- und Wartungsbereichen trennen; geschützte Übergabe und überprüfbarer Diebstahlschutz | P0 |
| K07 | Regulatorische Zulässigkeit, Datenqualität und technische Nachweise klären | P0 |
| K08 | Fehlerfälle, Rückfallversorgung und verständliche Status-/Gründeanzeige vorsehen | P0 |
| K09 | Nutzen, Kosten, Energie, Lärm, Zuverlässigkeit und Zugänglichkeit gegen Vergleichsversorgung bewerten | P1 |
| K10 | Prototyp bei späterer Beauftragung klar abgrenzen und Einschränkungen dokumentieren | P1 |

## 3. Lieferablauf und Betriebskonzept – Entwurf
1. Auftrag erfassen; Paketmaße, Masse und Eignung prüfen. Zustelloption und erwartetes Zeitfenster anzeigen.
2. Zielpaketfach, Landebereich, Route und benötigte Energie-/Ladekapazität planen und reservieren; sichere Alternativen berücksichtigen.
3. Paket geschützt beladen, Zuordnung prüfen; Wartungs- und Batteriestatus berücksichtigen.
4. Gesamte Mission einschließlich Rückflug oder sicherer Weiterleitung bewerten. Unmittelbar vor Start erneut prüfen; keine Freigabe bei ungeklärten Pflichtprüfungen.
5. Entlang der vorgesehenen Route fliegen und relevante Änderungen überwachen. Verfahren bei Störungen gemäß Architekturentwurf auslösen.
6. Zielbereich auf Verfügbarkeit und Zutritt prüfen; Paket über geschützte Übergabe in ein verschlossenes Fach bringen. Übergabe bestätigen und nachvollziehbar protokollieren.
7. Empfänger authentifiziert abholen lassen. Personen dürfen weder Rotoren noch ungesicherte Pakete erreichen.
8. Rückflug oder geplante Weiterleitung durchführen; laden bzw. optional Akku tauschen. Inspektion, Wartung und erneute Einsatzbereitschaft dokumentieren.

Verantwortlichkeiten für Betreiber, Flugaufsicht, Wartung, Station und Ersatzlieferung sind vor einem Pilotbetrieb verbindlich festzulegen. Bei Ausfällen keine zuverlässige Versorgung durch Drohnen allein versprechen.

## 4. Infrastruktur, Sicherheit und Betriebsgrenzen
Stationswahl berücksichtigt Erreichbarkeit und Barrierefreiheit, Gebäude, Bäume, Leitungen, temporäre Hindernisse sowie künftige Standortentwicklung. Stromversorgung, Ladezeit, Ladekapazität und Wartungszugang sind zu dimensionieren. Laden am Logistikstandort, an Zielstationen und Akkutausch sind gegeneinander zu bewerten. Reservekapazität für belegte, ausgefallene oder unerreichbare Stationen ist erforderlich.

Schutzmaßnahmen umfassen getrennte Bereiche, Zugangskontrolle, Manipulationserkennung, authentifizierte Abholung und Übergabeprotokolle. Ihr Erfolg benötigt definierte Prüfverfahren; absolute Diebstahlsicherheit wird nicht zugesagt. Reaktionen auf Zutritt, blockierte Landeflächen und Übergabefehler stehen in der [Fehlerfallmatrix](Architekture.md#7-fehlerbehandlung-und-prüffälle--entwurf).

**Zu bestimmende Drohnenparameter:** Abmessungen, Gesamtmasse, Nutzlast, Paketmaße, Geschwindigkeitsbereiche, Energieverbrauch, Reichweite, Reserven und Wettertauglichkeit. Geräuschemissionen benötigen Messbedingungen, Betriebszustand und Bewertungsort. Größe und Dezibel allein bestimmen keine Einsatzfreigabe.

**Ungeprüfte Hypothese H01:** Höhere Ebenen könnten höhere Geschwindigkeiten bei geringerer Lärmbelastung am Boden ermöglichen. Akustische Ausbreitung, Antriebszustand, Wind, Energiekosten, Sicherheit und regulatorische Grenzen können dagegen sprechen. „Höher = schneller = leiser“ ist keine belegte Regel. Benötigt werden technische, akustische und regulatorische Bewertungen.

Wetter ist eine zentrale Betriebsgrenze. Datenbedarf, vier Bewertungszustände und Gesamtfreigabe sind ausschließlich in [Architekture.md](Architekture.md) spezifiziert. Ein nächstes geeignetes Zeitfenster ist immer eine Prognose.

## 5. Annahmen und offene Fragen
| ID | Status | Aussage / Klärung |
|---|---|---|
| A01 | Annahme | Deutschland/EU als vorläufiger Einsatzraum; Stadt und konkrete Standorte offen |
| A02 | Vorschlag | Zunächst einen überschaubaren Pilotkorridor mit wenigen Stationen untersuchen; Umfang noch nicht beschlossen |
| F01 | Offen | Einsatzgebiet, Nachfrage, Vergleichsversorgung, betroffene Gruppen und Zugänglichkeitsbedarf |
| F02 | Offen | Drohnenmodell, belegte Parameter, Paketprofil und Wartungskonzept |
| F03 | Offen | Pilotumfang, Zielkennzahlen, Budget und Akzeptanzkriterien |
| F04 | Offen | Geeignete Wetter-, Luftraum-, Gelände-, Hindernis-, Nachfrage- und Stationsdaten samt Nutzungsrechten |
| F05 | Offen | Rollen, Genehmigungspfad, Sicherheitsnachweise, Datenschutz- und Versicherungskonzept |
| F06 | Offen | Ladeverfahren, Stationsmechanik, Reserven und bodengebundene Ersatzversorgung |

## 6. Regulatorische Prüfung und Quellen
**Status:** Bei der Repository-Initialisierung wurde keine Rechts- oder Herstellerrecherche durchgeführt. Keine Betriebskategorie, Höhe, Route oder Genehmigungsfähigkeit ist festgestellt. Die folgenden Punkte sind ein Rechercheauftrag, keine Aussage über geltendes Recht.

| Prüffeld | Zu klärende Anwendbarkeit | Vorgesehene offizielle Recherchewege |
|---|---|---|
| Betrieb | Kategorie, Genehmigungen, Sichtweite/BVLOS, Betreiberverantwortung | EU-Rechtsakte über EUR-Lex, EASA, LBA, zuständige Luftfahrtbehörden |
| Luftraum | Geografische Flugzonen, Höhen, Personenüberflug, lokale Beschränkungen | Zuständige Luftfahrtbehörden und amtliche Geozoneninformationen |
| Standort / Lärm | Standortzulässigkeit, Lärmbewertung und lokale Anforderungen | Zuständige kommunale und Landesbehörden, amtliche Vorschriften |
| Datenschutz | Personenbezug von Sensorik, Auftrags- und Zugriffsprotokollen, Rechtsgrundlagen und Aufbewahrung | EU-Rechtsakte und zuständige Datenschutzaufsicht |
| Versicherung | Erforderlicher Umfang und Nachweise für den vorgesehenen Betrieb | Amtliche Vorschriften und zuständige Behörden |

Für jede spätere Quellenaufnahme festhalten: Quellen-ID, Titel, Herausgeber, genaue URL/Fundstelle, Veröffentlichungs-/Versionsstand soweit vorhanden, Prüfdatum, räumlicher Geltungsbereich, gestützte Aussage und Bedeutung für das Konzept. Herstellerangaben und unabhängige technische Nachweise getrennt kennzeichnen. Noch keine externe Quelle geprüft.

## 7. Nutzenbewertung – vorgeschlagener Untersuchungsrahmen
Vergleich: dieselbe Nachfrage im selben Gebiet und Zeitraum bei nachvollziehbar beschriebener Straßenversorgung. Systemgrenzen, Datenherkunft und Unsicherheiten ausweisen; Simulationsergebnisse als solche kennzeichnen.

| Kennzahl | Erforderliche Betrachtung |
|---|---|
| Vermiedene Straßenfahrten / Kilometer | Nettovergleich einschließlich Zubringer, Stationswartung, Abholwegen und Ersatzlieferungen |
| Lieferzuverlässigkeit / Dauer | Erfolgreiche Zustellungen und Zeit von Auftrag bis gesicherter Fachübergabe; Abholzeit gesondert |
| Wetterausfallzeit | Anteil nicht nutzbarer Betriebszeit; Unsicherheit und fehlende Daten getrennt erfassen |
| Energie / Kosten pro erfolgreicher Zustellung | Fehlversuche, Rückflug, Laden/Ladeverluste, Station, Wartung und Ersatzversorgung einbeziehen |
| Lärmbelastung | Messort, Messverfahren, Flugzustand, Häufigkeit und Hintergrundgeräusch dokumentieren |
| Stationsauslastung | Paketfächer, Landebereich und Ladeplätze getrennt betrachten |
| Sicherheit / Zugänglichkeit | Vorfälle, abgebrochene Vorgänge und überprüfte Schutzmaßnahmen; Erreichbarkeit und Barrieren |

Keine Umweltentlastung ohne belastbaren Vergleich ableiten. Zielwerte sind noch offen.

## 8. Risiken
- Wetter- und Datenlücken können die Verfügbarkeit erheblich begrenzen.
- Genehmigung, lokale Luftraumlage oder Standortbedingungen können den Ansatz einschränken oder verhindern.
- Energiebedarf, Reservebedarf und geringe Nutzlast können den erwarteten Nutzen reduzieren.
- Lärm, Abholwege und neue Infrastruktur können Belastungen verlagern.
- Stationsengpässe, Zutritt, Manipulation, Kommunikation und fehlerhafte Übergaben erfordern überprüfbare Schutzmaßnahmen.
- Ein positives Simulationsergebnis kann bei unpassenden Annahmen irreführend sein; Feldnachweise bleiben eigenständig.

## 9. Entscheidungen
| Datum | Status | Entscheidung / Begründung |
|---|---|---|
| 2026-10-21 | Beschlossen durch Nutzerauftrag | Repository mit `AGENTS.md`, `Konzept.md` und `Architekture.md` als gemeinsamem Projektgedächtnis vorbereiten; Zuständigkeiten trennen und Folgearbeit dokumentieren |
| 2026-10-21 | Beschlossene Anforderung | Nutzen, Machbarkeit, Sicherheit und Grenzen bewerten; Prototypen nicht als Realbetriebsnachweis darstellen |

## 10. Übergabestand
Commit-Konvention: Am 2026-10-21 vom Nutzer festgelegt; verbindliche Definition in [AGENTS.md](AGENTS.md#commit-schema).

Stand: 2026-10-21.
- **Erledigt:** Drei Projektdateien initialisiert; Anforderungen, Annahmen, Rechercheauftrag, Architekturentwurf und Fehlerfall-Prüfplan dokumentiert.
- **Offen:** Einsatzgebiet, Drohnenparameter, Pilotumfang, benötigte Datenquellen und messbare Abnahmekriterien festlegen; aktuelle offizielle Quellen recherchieren.
- **Blockiert:** Keine Blockade der Konzeptarbeit. Belastbare Auslegung und Realbetriebsbewertung benötigen die offenen Parameter und Nachweise.
- **Nächster Schritt:** Ein Pilot-Steckbrief mit Einsatzgebiet, Logistikstandort, möglichen Zielstationen, Nachfrage/Paketprofil und Vergleichsversorgung; anschließend passende Drohnenparameter und Datenquellen prüfen.
- **Prüfumfang Initialisierung:** Dokumentstruktur, Anforderungsabdeckung und relative Dateiverweise geprüft; vier Wetterzustände und sieben Pflichtfehlerfälle vorhanden. Commit-Schema ergänzt. Keine Software-, Flug-, Wetterdaten-, Rechts- oder Sicherheitsvalidierung durchgeführt.
