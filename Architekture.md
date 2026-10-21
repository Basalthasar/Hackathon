# Urbane Paketversorgung durch Drohnen – Architektur

Stand: 2026-10-21 · **Entwurf / Vorschlag**, sofern nicht ausdrücklich anders markiert.

Keine Komponenten implementiert. Keine Flugkorridore, Höhen oder Betriebsverfahren genehmigt oder sicherheitstechnisch nachgewiesen. Fachliche Anforderungen und Quellenregister: [Konzept.md](Konzept.md). Arbeitsregeln: [AGENTS.md](AGENTS.md).

## 1. Komponenten und Verantwortlichkeiten
| Komponente | Vorgesehene Aufgabe |
|---|---|
| Auftragsverwaltung | Paketdaten, Status, Empfängerberechtigung und eindeutige Zuordnung verwalten |
| Missionsplanung | Route, Zeitfenster, Fahrzeug, Nutzlast, Energie und Alternativen zusammenführen |
| Routen-/Luftraummodell | Korridore, Ebenen, Kreuzungen, Kapazitäten und zeitabhängige Einschränkungen abbilden |
| Wetteradapter / Bewertung | Beobachtungen und Vorhersagen beziehen, Qualität prüfen, missionsbezogen bewerten |
| Freigabedienst | Pflichtprüfungen zusammenführen und begründete, zeitlich begrenzte Entscheidung dokumentieren |
| Flottenbetrieb / Flugaufsicht | Fahrzeugzustand, Missionsüberwachung, Eskalation und betriebliche Verantwortung |
| Drohne / lokale Steuerung | Flugführung, Telemetrie und nachzuweisende lokale Sicherheitsverfahren |
| Stationssteuerung | Landebereich, geschützte Übergabe, Paketfächer, Zugang und Ladeplätze überwachen |
| Energie / Wartung | Batteriegesundheit, Ladeplanung, Inspektionen und Einsatzsperren verwalten |
| Nutzerstatus / Audit | Verständlichen Status und Gründe anzeigen; Entscheidungen und Übergaben nachvollziehbar halten |

Organisatorische Rollen, Eingriffsrechte und Verantwortungsübergänge sind noch festzulegen. Die Software ersetzt keine erforderliche betriebliche Verantwortung.

## 2. Physische Struktur
Logistikstandort → festgelegter Korridor → geschützter Stationslande-/Übergabebereich → verschlossenes Paketfach → öffentlicher Abholbereich.

Lade- und Wartungsbereiche sind vom Publikum getrennt. Eine gesicherte mechanische Paketübergabe ist zu entwerfen; Fachzuordnung, Verriegelung, Paketnachweis und Drohnenfreigabe benötigen bestätigte Zustände. Ein fehlender Übergabenachweis darf keine erfolgreiche Zustellung erzeugen.

Standorte benötigen dokumentierte Hindernisprüfung einschließlich temporärer Änderungen. Reservestationen müssen zur Route, Energie, Nutzlast und aktuellen Lage passen; eine theoretisch vorhandene Station ist keine garantierte Alternative. Ladung versus Akkutausch, Ladezeiten, Netzanschluss und Brandschutz sind offene Auslegungsfragen.

## 3. Routen-, Höhen-, Geschwindigkeits- und Energiemodell
- Korridore bestehen aus gerichteten Segmenten mit Geometrie, Bezugssystem, Höhenbezug, Geschwindigkeitsbereich, Gültigkeit und Kapazität.
- Höhenebenen benötigen eindeutige Höhenreferenz; Gelände- und Hindernisabstände dürfen nicht aus uneindeutigen Höhenangaben abgeleitet werden.
- Ebenenwechsel, Kreuzungen und An-/Abflüge sind eigene zu prüfende Segmente. Abstände und Konfliktregeln hängen von Fahrzeug, Navigation, Umgebung und genehmigtem Betriebskonzept ab.
- Reservierungen berücksichtigen Zeit, Kapazität und mögliche Konflikte. Ein Reservierungskonzept allein ist kein Nachweis sicherer Flugtrennung.
- Energieplanung berücksichtigt Nutzlast, Wind, Temperatur, Batteriezustand, Steig-/Sinkflug, Wartezeiten, Rückflug/Weiterleitung und begründete Reserven.
- Abmessungen, Masse, Nutzlast, Geräuschdaten samt Messbedingungen, Geschwindigkeit, Reichweite und Wettergrenzen werden als versioniertes Fahrzeugprofil hinterlegt. Keine Zahlenwerte festgelegt.
- Die Hypothese unterschiedlicher Geschwindigkeiten je Höhe ist in Konzept.md als H01 geführt und noch nicht validiert.

## 4. Wetterdaten und Entscheidung
### Datenumfang
Windgeschwindigkeit und -richtung, Böen, Niederschlag und Art, Gewitter/Blitzaktivität, Vereisungsrisiko, Temperatur und Sichtweite berücksichtigen. Abdeckung für Route, Start, Ziel und Ausweichstationen sowie vorgesehene Höhen prüfen. Fehlende Höhendaten nicht durch unbezeichnete Bodenwerte ersetzen.

Beobachtungen und Vorhersagen getrennt speichern. Erforderliche Metadaten: Quelle, Abrufzeit, Beobachtungs-/Ausgabezeit, Gültigkeitsintervall, räumliche/zeitliche Auflösung, Höhenbezug, Einheiten, Unsicherheit und Qualitätskennzeichen.

### Wetterzustände
| Zustand | Bedeutung |
|---|---|
| MÖGLICH | Alle erforderlichen Wetterkriterien für die geplante Mission mit belegten Grenzen erfüllt |
| EINGESCHRÄNKT | Nur mit expliziten, belegten Einschränkungen möglich; geänderte Mission erneut vollständig prüfen |
| NICHT_MÖGLICH | Mindestens eine relevante Wettergrenze verletzt |
| UNBESTIMMT | Erforderliche Daten fehlen, sind veraltet, widersprüchlich oder zu unsicher |

Bewertung umfasst das gesamte geplante Zeitfenster einschließlich Rückflug oder sicherer Weiterleitung. Grenzen, Aktualisierungsintervalle, maximale Datenalter und Unsicherheitstoleranzen müssen aus Datenquellen, Fahrzeugnachweisen und Betriebskonzept begründet werden. Sie sind noch offen.

### Gesamtflugfreigabe
Wetter ist eine von mehreren Pflichtprüfungen: Route/Luftraum, Energie/Reserve, Nutzlast, Wartungszustand, Stations-/Fachverfügbarkeit, Sicherheitsbedingungen und betriebliche Berechtigungen. Vorschlag für deren Ergebnisse: bestanden, nicht bestanden, unbestimmt.

Eine Freigabe erfordert alle Pflichtprüfungen als bestanden und die Umsetzung sämtlicher Wetterauflagen. Nicht bestanden oder unbestimmt verhindert eine automatische Freigabe. Entscheidungen enthalten Gründe, bewertete Mission, verwendete Daten-/Regelversionen und Ablaufzeit. Änderungen an Mission oder relevanten Bedingungen lösen eine Neubewertung aus.

Unmittelbar vor Start erneut prüfen. Während des Fluges relevante Änderungen überwachen. Wetterdienst-Ausfall ist kein Grund, einen bereits laufenden Flug blind abzubrechen: nachzuweisende situationsabhängige Verfahren entscheiden über Fortsetzung, Umleitung, Rückkehr oder sichere alternative Landung. Neue Starts erhalten ohne ausreichende gültige Daten keine positive Freigabe.

Nutzer sehen Status und Gründe; mögliche spätere Zeitfenster sind ausdrücklich Prognosen.

## 5. Datenmodelle – erste Struktur
| Modell | Kerninformationen |
|---|---|
| Paket / Auftrag | ID, Maße, Masse, Eignung, Ziel, Status, Referenz auf Abholberechtigung |
| Fahrzeugprofil | Version, Abmessungen, Masse, Nutzlast, Betriebsgrenzen, Energie-/Lärmnachweise und Quellen |
| Fahrzeugzustand | Zeitstempel, Position, Energie, Batteriegesundheit, Wartung, Kommunikationszustand |
| Station | Standort, Hindernis-/Prüfstand, Landebereich, Fächer, Ladeplätze, Zugangsstatus, Verfügbarkeit |
| Routensegment | Geometrie, Koordinaten-/Höhenbezug, Ebene, Geschwindigkeit, Kapazität, Einschränkungen, Gültigkeit |
| Wetterdatensatz | Parameter und Metadaten gemäß Abschnitt 4; Beobachtung/Vorhersage getrennt |
| Mission | Auftrag, Fahrzeug, Segmente, Zeitfenster, Reservierungen, Energieplan, Alternativen |
| Freigabeentscheidung | Mission-/Regelversion, Prüfergebnisse, Gründe, Datenreferenzen, Auflagen, Ablaufzeit |
| Übergabeereignis | Auftrag, Station/Fach, Zeitpunkt, bestätigte Sensor-/Verriegelungszustände, Ergebnis |
| Vorfall / Audit | Ereignis, betroffene Objekte, Zeit, Akteur, Maßnahme, Nachweis und Auflösung |

Einheiten, Pflichtfelder, Aufbewahrungsfristen und konkrete Schemas noch nicht festgelegt. Personenbezogene Daten minimieren; Zugriff und Protokollierung rollenbezogen auslegen.

## 6. Schnittstellen und Datenfluss – Entwurf
1. Auftragsverwaltung übergibt Paketanforderungen an Missionsplanung.
2. Planung liest Fahrzeug-, Routen-, Luftraum-, Wetter- und Stationszustände und fordert Reservierungen an.
3. Freigabedienst bewertet einen versionierten Missionsstand; liefert Status, Gründe und Auflagen.
4. Betrieb übermittelt nur nach passender Freigabe eine Mission an die Drohne; lokale Steuerung und Stationssteuerung melden bestätigte Zustände zurück.
5. Telemetrie und externe Änderungen veranlassen bei Bedarf Neubewertung und betriebliche Eskalation.
6. Bestätigte Fachübergabe aktualisiert Auftrag und Abholstatus; Ereignisse und Entscheidungen fließen ins Audit.

Protokolle und Technologien sind offen. Schnittstellen benötigen Authentifizierung, Berechtigungsprüfung, Zeitstempel, Versionsbezug, Wiederholungsschutz und idempotente Verarbeitung. Reservierungen brauchen Ablauf-/Freigabeverfahren, damit doppelte Aufträge oder Verbindungsabbrüche keine Doppelbelegung erzeugen. Sensordaten und Befehle sind auf Plausibilität und Aktualität zu prüfen.

## 7. Fehlerbehandlung und Prüffälle – Entwurf
Alle folgenden Reaktionen sind zu konkretisieren und nachzuweisen. Keine davon wurde implementiert oder getestet.

| Fehlerfall | Vorgesehene Reaktion | Später zu prüfendes Ergebnis |
|---|---|---|
| Ungeeignetes Wetter | Start sperren/verschieben; während Mission situationsgerechtes Alternativverfahren | Keine Freigabe bei verletzten Grenzen; Gründe sichtbar |
| Fehlende/veraltete Wetterdaten | UNBESTIMMT; keine automatische positive Freigabe | Ausfall und veraltete Daten werden erkannt, kein positiver Standardwert |
| Geringe Akkureserve | Mission ablehnen oder neu planen; in der Luft zulässige sichere Alternative bewerten | Reserve einschließlich Alternativplan berücksichtigt |
| Volle Paketfächer | Keine Mission ohne bestätigte Kapazität; Verschiebung oder neue Zielplanung | Gleichzeitige Reservierungen führen nicht zur Doppelbelegung |
| Stationsausfall | Neue Anflüge sperren; erreichbare geprüfte Alternative oder Rückkehrverfahren | Veraltete Verfügbarkeit reicht nicht zur Landefreigabe |
| Blockierter Landeplatz | Keine Landung in blockiertem Bereich; begrenztes Warten nur mit ausreichender Reserve | Hindernis erkannt, alternative Handlung ausgelöst |
| Verbindungsverlust | Nachgewiesenes lokales Verfahren abhängig von Flugphase und Umgebung | Keine Abhängigkeit von ständig verfügbarer Cloud für notwendige Sicherheitsreaktionen |
| Unbefugter Zutritt | Gefährdende Stationsvorgänge verhindern/unterbrechen; Alarm und Flugreaktion situationsabhängig | Publikum erreicht keine laufenden Rotoren |
| Fehlgeschlagene Übergabe | Paket sichern, keine Erfolgsbuchung; Wiederholung nur bei sicheren Bedingungen, sonst Eskalation | Kein falscher Zustellnachweis, Paketort nachvollziehbar |
| Manipulation / falsche Abholberechtigung | Zugriff verweigern, Ereignis erfassen, bei Bedarf Betrieb sperren | Fach bleibt ohne gültige Berechtigung verschlossen |
| Routen-/Luftraumänderung | Betroffene Planung/Freigabe neu bewerten, im Flug vorgesehene Verfahren anwenden | Alte Entscheidung nicht ungeprüft weiterverwenden |

## 8. Technische Entscheidungen, Umsetzung und Prüfung
**Festgelegt durch Nutzerauftrag:** Feste Routen/Höhenebenen als Konzeptbestandteil, wetterabhängige Bewertung, sichere Stationen und Ladeinfrastruktur. Konkrete Auslegung offen.

**Noch nicht entschieden:** Drohnenplattform, Stationsmechanik, Softwarestack, Sensorik, Kommunikationswege, Anbieter, Datenintervalle, Grenzwerte, Routingverfahren und Sicherheitsarchitektur.

**Umsetzung:** Nur Projektdokumentation initialisiert. Kein Code, keine Simulation, keine Hardwareanbindung.

**Prüfplan:** Nach Umfangsfestlegung Daten- und Regelvalidierung, Zustandsübergänge, Reservierungskonflikte und Fehlerfallmatrix prüfen. Ein späterer Simulator benötigt gekennzeichnete Eingaben, reproduzierbare Szenarien, Vergleichsversorgung und Sensitivitätsanalysen. Physische Schutzmaßnahmen, Flugverhalten, Lärm, Wettertauglichkeit und Genehmigung erfordern separate Nachweise.

**Bekannte Einschränkungen:** Keine aktuellen externen Quellen geprüft, keine Einsatzorte oder Fahrzeuge ausgewählt, keine quantitativen Betriebsgrenzen und keine belastbaren Leistungs-/Sicherheitsaussagen möglich. Die Initialisierung wird ausschließlich auf Dokumentstruktur, Anforderungsabdeckung und interne Verweise geprüft.
