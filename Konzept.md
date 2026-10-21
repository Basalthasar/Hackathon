# Urbane Paketversorgung durch Drohnen – Konzept

Stand: 2026-10-21 · Phase: Routing-Anforderungen · Kein Realbetrieb freigegeben.

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

### 2.1 Team Routing – erweiterte Anforderungen
**Beschlossene Anforderung (Nutzerauftrag 2026-10-21):** Die Teams sind Design, Routing, Drohnen Typen und Packstationen. Unser Team bearbeitet Routing und erweitert die vorgelegten ersten Notizen. Die fachlichen Ausgangspunkte sind Drohnenauswahl, Lieferbündelung, Wetteranbindung, feste und dynamische Routen, geeignete Landeflächen, Sicherheitsbelehrung und Kollisions-/Luftraumschutz. Die folgende Ausgestaltung ist ein **Vorschlag**, keine Betriebsfreigabe.

**Umfang:** Das bestehende Kernkonzept verbindet Lager/Anbieter mit Packstationen. Direkte Kundenlieferungen werden als gesonderte Erweiterung untersucht; ihre Aufnahme in einen Pilotbetrieb ist offen. Dynamische Umplanung innerhalb zulässiger Korridore ist auch beim Packstationsnetz erforderlich und von Direktzustellung zu unterscheiden.

#### Betrieb und Auftragsplanung
- **R01 – Geeignete Drohne auswählen:** Verfügbarkeit, aktuellen Standort samt Datenalter, bestehende Aufträge, Paketmaße/-masse, Wartungsstatus und Kompatibilität mit Start/Ziel prüfen. Erst unter zulässigen Kandidaten nach der frühesten sicheren Übergabe auswählen. Die nächstgelegene oder schnellste Drohne muss nicht die schnellste Lieferung ermöglichen.
- **R02 – Gesamte Lieferzeit berechnen:** Bereitstellung/Leerflug zum Lager, Beladung, nötiges Laden oder Akkutausch, Startslot, Flug, Zwischenstopps, Wartezeit und bestätigte Übergabe berücksichtigen. Lieferzeitfenster und Unsicherheit anzeigen; Rückflug/Weiterleitung beeinflussen Energiebedarf und nächste Verfügbarkeit.
- **R03 – Energie für die Mission sichern:** Verbrauch abhängig von Strecke, Nutzlast je Abschnitt, Wind, Temperatur und Batteriezustand planen; begründete Reserve und erreichbare Alternative berücksichtigen. Ein pauschaler Akku-Prozentwert genügt nicht. Ladeplätze und Ladezeiten mitreservieren.
- **R04 – Kundenlieferungen verbinden:** Mehrere Pakete zur gleichen Station bündeln; mehrere Stopps nur bei dafür geeigneter Drohne und gesicherter selektiver Übergabe. Reihenfolge nach Lieferfenstern, Kapazität, Energie und zusätzlicher Wartezeit bestimmen. Bereits zugesagte Lieferungen dürfen durch neue Aufträge nicht ungeprüft verschoben werden. Rücksendungen bleiben eine offene Erweiterung.
- **R05 – Wetter berücksichtigen:** Beobachtungen und Vorhersagen anbinden, für sämtliche Flugabschnitte und das gesamte Missionsfenster auswerten. Lokale Bedingungen an Landestellen einbeziehen. Fehlende/veraltete Pflichtdaten verhindern eine positive Freigabe; Bewertungszustände und Datenanforderungen siehe [Architektur, Abschnitt 4](Architekture.md#4-wetterdaten-und-entscheidung).
- **R06 – Engpässe und Ausfälle behandeln:** Flugsegmente, Start-/Landeplätze, Fächer und Ladeplätze zeitlich koordinieren. Bei fehlender zulässiger Route verschieben oder bodengebundene Ersatzlieferung anbieten. Auftragsalter und Lieferfristen berücksichtigen, damit ungünstige Aufträge nicht dauerhaft zurückgestellt werden.

#### Flugrouten und Zustellung
- **R07 – Feste Flugrouten:** Gerichtetes Netz zwischen Lagern/Anbietern und Packstationen planen. Korridore, Höhenbezug, Kreuzungen, Ebenenwechsel und An-/Abflugbereiche explizit abbilden. Ein fest eingezeichneter Korridor ist weder genehmigt noch jederzeit nutzbar; Nutzung je Mission prüfen.
- **R08 – Dynamische Routen / Direktzustellung:** Nur innerhalb des zulässigen Betriebsrahmens planen. Empfängeradresse allein genügt nicht: geprüfter Übergabeort, erforderliche Standortberechtigung, aktuelle Hindernis-/Personenlage, geeigneter An-/Abflug und erreichbare Alternative sind Voraussetzungen. Fehlt eine Voraussetzung, keine Direktzustellung; Packstation oder Ersatzversorgung vorsehen. Übergabeverfahren (Landen, Seil oder anderes) ist offen und separat zu bewerten.
- **R09 – Passende Landefläche:** Drohnenabmessungen einschließlich Rotoren, erforderliche Freiräume, Navigationsgenauigkeit, Untergrund/Tragfähigkeit, Neigung, Abwind, Hindernisse und Zutrittsschutz berücksichtigen. Freie Fläche vor Anflug und Landung bestätigen. Grenzwerte liefert die technische Auslegung; keine universelle Mindestfläche festlegen.
- **R10 – Sicherheitsbelehrung und Übergabe:** Verständliche Hinweise zu Abstand, Rotoren, Kindern/Tieren, Annäherung erst nach bestätigtem sicheren Zustand und Verhalten bei Störungen vorsehen. Kenntnisnahme kann dokumentiert werden; sie ersetzt keine physischen Schutzmaßnahmen. Eine pauschale rechtliche Absicherung durch Zustimmung wird nicht angenommen; Haftung und Versicherung bleiben gesonderte Prüfpunkte.

#### Flugsicherheit und Nachvollziehbarkeit
- **R11 – Kollisionen vermeiden:** Eigene Drohnen durch zeitliche Planung und Konfliktprüfung koordinieren. Fremde Drohnen, bemannte Luftfahrt, Gebäude, Leitungen und bewegliche Hindernisse zusätzlich berücksichtigen. Strategische Routenplanung und unmittelbare Kollisionsvermeidung an Bord sind getrennte Aufgaben; Verfahren und Zuständigkeiten müssen zusammenpassen.
- **R12 – Luftraumbeschränkungen beachten:** Permanente und temporäre Einschränkungen mit räumlicher Ausdehnung, Höhe und Aktivierungszeit prüfen, etwa bei VIP-Besuchen oder Einsätzen. Amtliche Geozonen sowie relevante AIP-/NfL-/NOTAM-Informationen berücksichtigen (Q02). Vor Start aktualisieren und Änderungen im Betrieb verarbeiten. Umfliegen ist nur möglich, wenn auch die Alternative vollständig zulässig und energetisch machbar ist.
- **R13 – Bei Störungen handlungsfähig bleiben:** Verfahren für Kommunikations-/Navigationsausfall, unerwarteten Energieverbrauch, Wetterverschlechterung und blockiertes Ziel definieren. Rückkehr ist nicht automatisch die sicherste Lösung; Situation und erreichbare geprüfte Alternativen entscheiden. Kein unbegrenztes Warten in der Luft.
- **R14 – Entscheidungen erklären und schützen:** Auswahl-/Ablehnungsgrund, Lieferprognose, Datenstand und Missionsversion nachvollziehbar speichern. Zugriff auf Positionen, Kundendaten und Flugbefehle beschränken; nur benötigte Daten austauschen. Manuelle Eingriffe benötigen Zuständigkeit und Protokollierung und dürfen Pflichtprüfungen nicht stillschweigend umgehen.

**Vorgeschlagene Optimierungsreihenfolge:** Zuerst Zulässigkeit und Sicherheitsbedingungen als harte Ausschlusskriterien, dann Lieferfristen und früheste Übergabe; anschließend Energie, Leerflüge und Auslastung optimieren. Gewichtung, Prioritätsregeln und messbare Ziele sind mit dem Team abzustimmen. Technische Umsetzung und überprüfbare Fälle stehen in [Architekture.md](Architekture.md).

### 2.2 Abstimmung mit den anderen Teams
| Team | Benötigte Angaben für Routing | Ergebnis / Rückmeldung von Routing |
|---|---|---|
| Drohnen Typen | Versionierte Leistungs-/Energieprofile, Paketkapazität, belegte Wettergrenzen, Ladezeiten, Landeanforderungen, Navigation und lokale Sicherheitsfunktionen | Missionsanforderungen, Zuordnung geeigneter Typen, fehlende Nachweise und abgelehnte Einsätze |
| Packstationen | Position/Höhe, An-/Abfluggeometrie, kompatible Drohnen, bestätigter Lande-/Fach-/Ladestatus, Öffnungs-/Betriebszeiten, Reservierungen und Störungen | Ankunftsfenster, Reservierung/Änderung/Storno, Paketprofil und Alternativbedarf |
| Design | Darstellungs- und Bedienanforderungen mit Routing abstimmen; Zuständigkeit für Oberfläche versus physische Gestaltung noch klären | Route, Lieferprognose, Status, verständliche Ablehnungsgründe, Sicherheitshinweise; Vorschau und tatsächliche Freigabe klar unterscheiden |

**Nächste gemeinsame Entscheidungen:** Pilotgebiet und Standorte; Paket-/Nachfrageprofil; unterstützte Drohnentypen; Direktzustellung im oder außerhalb des Piloten; Betreiber-/Aufsichtsrollen; Datenquellen; Prioritäten und Abnahmekriterien. Vorschlag für den Einstieg: zunächst feste Verbindungen und Packstationszustellung spezifizieren, Direktzustellung separat ausarbeiten.

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
**Status:** Am 2026-10-21 erfolgte eine begrenzte offizielle Quellenprüfung für Routing (Q01–Q03). Keine projektspezifische Betriebskategorie, Höhe, Route oder Genehmigungsfähigkeit ist festgestellt. Die folgende Matrix bleibt der weitergehende Rechercheauftrag.

| Prüffeld | Zu klärende Anwendbarkeit | Vorgesehene offizielle Recherchewege |
|---|---|---|
| Betrieb | Kategorie, Genehmigungen, Sichtweite/BVLOS, Betreiberverantwortung | EU-Rechtsakte über EUR-Lex, EASA, LBA, zuständige Luftfahrtbehörden |
| Luftraum | Geografische Flugzonen, Höhen, Personenüberflug, lokale Beschränkungen | Zuständige Luftfahrtbehörden und amtliche Geozoneninformationen |
| Standort / Lärm | Standortzulässigkeit, Lärmbewertung und lokale Anforderungen | Zuständige kommunale und Landesbehörden, amtliche Vorschriften |
| Datenschutz | Personenbezug von Sensorik, Auftrags- und Zugriffsprotokollen, Rechtsgrundlagen und Aufbewahrung | EU-Rechtsakte und zuständige Datenschutzaufsicht |
| Versicherung | Erforderlicher Umfang und Nachweise für den vorgesehenen Betrieb | Amtliche Vorschriften und zuständige Behörden |

Für jede spätere Quellenaufnahme festhalten: Quellen-ID, Titel, Herausgeber, genaue URL/Fundstelle, Veröffentlichungs-/Versionsstand soweit vorhanden, Prüfdatum, räumlicher Geltungsbereich, gestützte Aussage und Bedeutung für das Konzept. Herstellerangaben und unabhängige technische Nachweise getrennt kennzeichnen.

| ID / Art | Quelle und Versionsstand | Prüfdatum / Raum | Aussage und Bedeutung |
|---|---|---|---|
| Q01 / Behördeninformation | EASA, [Specific Category — Civil Drones](https://www.easa.europa.eu/en/domains/drones-air-mobility/operating-drone/specific-category-civil-drones), laufende Webseite, kein Versionsdatum erfasst | 2026-10-21 / EU | BVLOS ist ein typischer Anwendungsfall der speziellen Kategorie. Regelmäßig ist eine Betriebsgenehmigung erforderlich; Ausnahmen betreffen unter anderem passende Standardszenario-Erklärungen und entsprechende LUC-Rechte. Der konkrete Genehmigungspfad bleibt offen. Feste gegenüber dynamischen Routen entscheiden nicht allein über die Kategorie. |
| Q02 / Flugsicherungsinformation | DFS, [FAQ for drone flights](https://www.dfs.de/homepage/en/drone-flight/faq-for-drone-flights/), laufende Webseite, kein Versionsdatum erfasst | 2026-10-21 / Deutschland | Beschränkungen und Aktivierungszeiten erfordern passende amtliche Informationen: AIP, NfL und NOTAM-Briefing. Eine statische Routenkarte genügt nicht. Maschinenlesbare Anbindung, Nutzungsrechte und Aktualität sind noch ungeprüft. |
| Q03 / Rechtsnorm | [§ 43 Abs. 2 LuftVG](https://www.gesetze-im-internet.de/luftvg/__43.html), amtlich bereitgestellte Onlinefassung am Prüfdatum | 2026-10-21 / Deutschland | Halterpflicht zur Haftpflichtversicherung in vorgeschriebener Höhe. Deckung für den konkreten Lieferbetrieb prüfen; Sicherheitsbelehrung nicht als Versicherungs- oder Haftungsnachweis behandeln. |

Keine Herstellerangaben oder technischen Leistungsnachweise recherchiert. Personenüberflug, lokale Höhen-/Zonenauflagen, Standort/Lärm, Datenschutz, konkrete Versicherungsdeckung und das vollständige Zulassungsverfahren bleiben offen.

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
| 2026-10-21 | Beschlossene Anforderung | Team Routing erweitert die ersten Routing-Notizen; Teamaufteilung und Schnittstellen in Abschnitt 2 dokumentieren. Kein Implementierungsauftrag. |

## 10. Übergabestand
Commit-Konvention: Am 2026-10-21 vom Nutzer festgelegt; verbindliche Definition in [AGENTS.md](AGENTS.md#commit-schema).

Stand: 2026-10-21.
- **Erledigt:** Erste `README.md` als Projekteinstieg mit Ziel, Teamaufteilung, Routing-Schwerpunkten, Dokumentverweisen und nächsten Schritten erstellt. Routing-Notizen zu R01–R14 erweitert, Team-Schnittstellen und offene Entscheidungen erfasst; Architektur um Auswahlablauf, Datenbedarf und Prüffälle ergänzt. Offizielle Quellen Q01–Q03 für ausgewählte regulatorische Punkte geprüft.
- **Offen:** Pilotgebiet, Fahrzeugnachweise, Datenquellen und deren Anbindung, Zuständigkeiten, Optimierungsziele und Umfang der Direktzustellung abstimmen; übrige regulatorische Prüffelder bearbeiten.
- **Blockiert:** Keine Blockade der Konzeptarbeit. Konkrete Flugplanung und belastbare Leistungs-/Sicherheitsbewertung benötigen die offenen Parameter und Nachweise.
- **Nächster Schritt:** Mit Drohnen Typen und Packstationen einen gemeinsamen Beispieldatensatz für eine Lager-Station-Mission festlegen und den Planungsablauf anhand dessen durchgehen; Prototypumfang erst danach beauftragen.
- **Geänderte Dateien:** Routing-Erweiterung: `Konzept.md`, `Architekture.md`. README-Auftrag: `README.md`, `Konzept.md` (Übergabe); dauerhafte Arbeitsregeln unverändert.
- **Prüfumfang:** Dokumentstruktur, lokale Dateiverweise, Abdeckung aller Nutzerstichpunkte und Konsistenz der Routing-Anforderungen mit dem Architekturentwurf geprüft. Begrenzte Webrecherche Q01–Q03; keine vollständige Rechtsprüfung. Keine Software-, Simulations-, Flug- oder Sicherheitsprüfung durchgeführt.

**Prüfung README-Auftrag (2026-10-21):** Überblick gegen Konzept und Architektur abgeglichen; lokale Dateiverweise und Markdown-Diff geprüft. Keine technischen Tests erforderlich oder durchgeführt.
