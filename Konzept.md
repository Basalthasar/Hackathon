# Lokale Lieferplattform – Konzept

Stand: 2026-10-21 · Phase: lokale P0-Pitch-Demo implementiert und begrenzt geprüft · Kein Realbetrieb freigegeben.

## 1. Problem und Ziel
Die Plattform soll Menschen helfen, Produkte bei teilnehmenden lokalen Händlern und Supermärkten zu finden, Angebote zu vergleichen, zu bestellen und liefern zu lassen oder selbst abzuholen. Vor dem Kauf sollen konkrete Variante, Bestandsaktualität, Gesamtpreis und voraussichtliches Empfangsfenster erkennbar sein. Unser Team verantwortet weiterhin Routing als Dienst für Lieferbarkeit, Transportkosten und Zeitprognosen.

**Beschlossene Anforderung (Nutzerauftrag 2026-10-21):** Die Notizen der anderen Gruppen sowie das gelieferte Word-Konzept und die vollständige Markdown-Arbeitsgrundlage in den Projektstand integrieren. Beides liegt unverändert unter [docs/grundlagen](docs/grundlagen/README.md). Der damalige Integrationsauftrag betraf Dokumentation. Der gesonderte Pitch-Auftrag vom selben Tag aktiviert jetzt ausschließlich den abgegrenzten P0-Umfang in Abschnitt 12; der umfassende Pilot-Startprompt bleibt eine Vorlage.

**Einordnung des bisherigen Stands:** Das urbane Drohnennetz zwischen Lagern/Anbietern und sicheren Packstationen bleibt als Ausbau erhalten. Die folgenden Plattformabschnitte ergänzen den Auftrag; die bisherigen Drohnenanforderungen K01–K10 und R01–R14 sind Anforderungen an diesen Ausbau, keine Voraussetzungen für den ersten Kurier-Prototyp. Die dauerhaften Arbeitsregeln in [AGENTS.md](AGENTS.md) bleiben maßgeblich. Technische Spezifikation: [Architekture.md](Architekture.md).

### 1.1 Produktstruktur und Rollen
**Übernommener Konzeptvorschlag:** Vorgang, Empfang, Transport und Service sind unabhängige Eigenschaften. Nicht jede Kombination ist verfügbar.

| Dimension | Optionen und Bedeutung |
|---|---|
| Vorgang | Reine Produktsuche, Kauf; später Eigenversand ohne Produktwarenkorb |
| Empfang | Selbstabholung, Hausadresse; später kompatible Station. Haus- versus Wohnungstür vor Buchung konkret benennen. |
| Transport | Automatische Auswahl oder Präferenz für Fahrrad, E-Scooter, Auto; später Drohne/autonomes Fahrzeug. Selbstabholung benötigt keinen Lieferauftrag. |
| Service | Standard, Express bei belegter Kapazität; später buchbare Terminfenster. Express bezeichnet kein Fahrzeug. |

Kunden suchen, bestellen, empfangen und melden Probleme. Händler/Filialmitarbeiter pflegen Angebote, bestätigen Ware, stellen zusammen und verpacken. Kuriere melden Kapazität, übernehmen und liefern. Plattformbetrieb/Support verwalten Partner, weisen bei Bedarf manuell zu und bearbeiten Ausnahmen und Erstattungen. Stations-/Flottenbetreiber ergänzen später eigene Kapazitäts- und Statusschnittstellen.

### 1.2 MVP und Ausbau
**Vorschlag aus den Gruppenunterlagen, keine Termin- oder Betriebszusage:**

| Stufe | Umfang | Abgrenzung |
|---|---|---|
| P0 – Entwicklungsprototyp | Vollständiger Ablauf mit erkennbaren Demo-Daten und austauschbaren Adaptern für Bestand, Zahlung, Transport und Nachrichten | Begrenzte Pitch-Teilmenge durch Abschnitt 12 beauftragt; keine echte Zahlung oder Lieferzusage |
| M1 – erster echter Pilot | Kleines Gebiet, ausgewählte Händler, eine Filiale je Warenkorb; menschliche Kuriere und Selbstabholung; belastbare Bestandsanbindung/Onlinekontingent, Zahlungsdienst, Support | Nur tatsächlich verfügbare Fahrzeugarten aktivieren; Partner, Prozesse und Verträge vorher klären |
| A2 – lokaler Ausbau | Terminfenster, KI-Bildsuche, Stationsempfang mit QR/PIN, Umleitung, Eigenversand, Lieferbündelung, mehrere Händler, vollständigeres Supermarktsortiment | Jeweilige Kapazitäts-, Übergabe- und Rückabwicklungsprozesse erforderlich |
| A3 – Transportnetze | Lange Strecken mit Zwischenstopps, Drohnen zwischen Stationen und direkt zu Kunden, autonome Fahrzeuge, automatische Warenausgabe | Eigenständige Partner-, Sicherheits- und Betriebsnachweise; keine Flugsteuerung im Bestellkern |

Weitere Großanbieter sind Partnerintegrationen in A2/A3. Ein fremdes Lager oder Stationsnetz wird erst nach bestätigter Anbindung als nutzbar angeboten. Die vollständige Ideen-/Stufenzuordnung bleibt in [Kapitel 6 der Eingangsfassung](docs/grundlagen/Lieferplattform_Arbeitsgrundlage.md#6-ausbauplan-für-alle-weiteren-ideen) nachvollziehbar.

### 1.3 Funktionen für den empfohlenen Start
- **Suche und Vergleich:** Suchleiste, Kategorien, Umkreis, Preis-/Verfügbarkeits-/Öffnungsfilter, Sortierung nach Gesamtpreis, Ankunft oder Nähe. Gastzugang und manuelle Adresse ohne Standortfreigabe. Konkrete Produktvarianten von Filialangeboten trennen; reine Suche reserviert nichts.
- **Händler und Bestand:** Filialspezifische Preise, Quelle, Aktualität und Qualitätsstatus anzeigen. Veraltete Daten erlauben keine verbindliche Sofortzusage. Warenwirtschaft/Kasse oder Onlinekontingent mit Händlerbestätigung abstimmen; lokale Reservierung allein schützt nicht vor parallelem Ladenverkauf.
- **Bestellung und Zahlung:** Mehrere Artikel derselben Filiale, Gesamtpreis mit transparenten Gebühren, Steuern/Pfand und Rabatten; befristete Quote. Preis und Bestand beim Checkout erneut prüfen. Keine stillen Ersatzartikel oder Preisänderungen.
- **Empfang und Tracking:** Hauszustellung oder Selbstabholung an der Warenausgabe; Ereignisfolge, berechnete Zeitspanne und Statusnachrichten. Positionskarte nur mit realen oder ausdrücklich markierten simulierten Daten samt Aktualität.
- **Konto und Bedienung:** Anmeldung, Adressen, Historie, Beleg, erneute Bestellung mit aktuellen Preisen/Beständen, getrennte Händler-/Lieferbewertung nach Abschluss und Hilfe. Responsive deutsche Oberfläche, Hell/Dunkel, Tastatur-/Screenreaderbedienung, skalierbare Schrift und verständliche Statusanzeigen auch ohne Karte/Farbe.
- **Betrieb:** Händlerarbeitsliste mit Annahme, Ablehnung, Vorbereitung, Bereitschaft, Auftragslimit und Pause; Kurieransicht für Verfügbarkeit, Übernahme und Empfang; Betriebsansicht für Zuweisung, Partnerstatus, Ausnahmen und Erstattungen.

**Sortimentsvorschlag M1:** Auch verpackte, ungekühlte Supermarktartikel mit festen Stückpreisen. Kühlware, Gewichtsware, altersbeschränkte oder besonders regulierte Produkte erst mit passenden Prozessen. KI-Bildersuche in A2 erzeugt Katalogkandidaten; Kunde bestätigt Identität/Variante, Fotoverarbeitung und Löschfrist sind festzulegen.

### 1.4 Bestellablauf und Geschäftsregeln
1. Konkretes Filialangebot wählen, Warenkorb bilden und Empfang/Service festlegen. Lieferbarkeit umfasst Öffnungszeiten, Vorbereitung, Paketprofil, Gebiet und Transportkapazität.
2. Befristete Quote mit Gesamtpreis, Methode/Auswahlregel und Empfangsfenster anzeigen. Änderungen an Menge, Ziel oder Warenkorb erfordern Neuberechnung und Zustimmung.
3. Checkout erzeugt eine ausstehende Bestellung mit Bestandsreservierung; Zahlung autorisieren. Händlerannahme und bei Lieferung eine verbindliche Transportzusage abwarten. Selbstabholung benötigt keine Kurierzusage.
4. Vor Einzug Gültigkeit nochmals prüfen. Erst nach bestätigtem Zahlungseinzug Bestellung bestätigen und Bestand fest zuteilen. Bei unklarem Einzug Abgleich durchführen und Ware gegen versehentliche Freigabe schützen.
5. Händler stellt zusammen, verpackt und meldet abholbereit. Zugeordneter Kurier bestätigt Übernahme mit zweckgebundenem Einmalcode; Selbstabholer übernimmt direkt beim Händler.
6. Empfang mit eigenem Nachweis bestätigen, danach Abschluss/Bewertung ermöglichen. Übergabecode und Empfangscode haben getrennte Zwecke. Bei späteren Stationen sind Einlagerung und Kundenabholung verschiedene Ereignisse.

**Abweichungen:** Händlerabsage, fehlende Kapazität oder Fristablauf vor Einzug lösen Reservierung/Autorisierung; nach Einzug ist ein gesonderter Erstattungsauftrag nötig. Unbekannte Zahlung bleibt ausstehend und sperrt Übergabe. Zustellfehler und Nichterreichbarkeit starten Kontakt-, Support- oder Rückführungsprozesse; kein unbelegtes „zugestellt“ und keine automatische Wiederverfügbarkeit zurückgeführter Ware. Direkter Stornoantrag ist im Vorschlag vor PICKING vorgesehen, danach Support; anwendbare Kundenrechte und Vertragsgestaltung bleiben gesondert zu prüfen.

**Änderungen:** Zugesagte Transportmethode nur nach vereinbarten Wechselregeln ändern. Mehrpreis oder andere Empfangsart erfordern Zustimmung. Eine spätere Umleitung gilt erst nach Machbarkeits-/Preisprüfung, Kundenzustimmung und Partnerannahme; bis dahin bleibt das bisherige Ziel bestehen.

### 1.5 Annahmen, Wirtschaftlichkeit und Routing-Grenze
**Annahmen:** Deutschland/EU; deutsche Oberfläche, EUR und Ortszeit des Gebiets. Händler als Warenverkäufer, Plattform als Vermittler und geeigneter Zahlungsdienst – konkrete Verträge offen. Händler übernimmt zunächst Picking/Verpackung; externe Picker sind eine Erweiterung. Eigenversand bedeutet Privatpakete über kompatible Stationen, ist vor Umsetzung zu bestätigen und von Rücksendungen aus Käufen zu trennen.

**Vorschlag für Nutzen/Kosten:** Kundenpreis und interne Kosten getrennt kalkulieren. Picking, Kuriervergütung, Zahlung, Support, Ausfälle und später Stationen einbeziehen. Provision, Liefer-/Servicegebühr und Händlerabo sind Erlöshypothesen; keine Tarife beschlossen. Zusätzlich zur bisherigen Umwelt-/Verkehrsbewertung in Abschnitt 7 Bestandsfehler, Stornogründe, Vorbereitungszeit, Pünktlichkeit, Händleraufwand, Wiederbestellungen und Deckungsbeitrag messen. Keine pauschale Lieferung „in wenigen Minuten“ bewerben; ETA aus dem tatsächlichen kritischen Pfad ableiten.

**Routing als Hintergrunddienst:** Plattform fragt Machbarkeit, Preis und Zeit an und erhält Gründe für nicht verfügbare Optionen. Im MVP betrifft dies menschliche Kuriere und Selbstabholung. Später kapselt der Transportadapter Flotten-/Stationsdienste; Flugfreigabe und lokale Kollisionsvermeidung bleiben beim dafür geeigneten Betriebssystem/Betreiber. R01–R14 gelten für den Drohnenausbau und ergänzen diese Produktgrenze.

### 1.6 Stationen und Eigenversand im Ausbau
**Vorschlag A2:** Stationen benötigen Betreiber-/Partnerfreigabe, Fachgröße, Zugangszeiten, technischen Status und bestätigte Fachreservierung vor einer Zusage. QR/PIN berechtigen zur vorgesehenen Aktion, sind begrenzt gültig und nur einmal einlösbar. Fehlversuche begrenzen; ein Türsignal allein ist kein Entnahmenachweis. Abholfrist, Defekt und Verbindungsabbruch benötigen Support-/Rückführungsverfahren.

Eigenversand verwendet einen separaten Versandauftrag mit Startstation, Ziel, Paketmaßen/-gewicht und Service. Nach Preisbestätigung und Zahlung folgt ein Einlieferungscode; erst nach nachgewiesener Einlagerung startet der Transport. Erlaubte Inhalte, Identifizierung, Empfängerkontakt, Verpackung, Haftung und Rückführung sind offen. Langstrecken in A3 benötigen dokumentierte Transportabschnitte, Anschlusskapazität und Verantwortungswechsel.

## 2. Anforderungen und Priorisierung
Die folgenden Drohnenanforderungen und Prioritäten stammen aus dem ursprünglichen Teilkonzept und gelten für den Ausbau A3. Sie sind ein **Vorschlag** für dessen Bearbeitung, keine MVP-Lieferplanung.

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

**Nächste gemeinsame Entscheidungen für A3:** Pilotgebiet und Standorte; Paket-/Nachfrageprofil; unterstützte Drohnentypen; Direktzustellung im oder außerhalb des Piloten; Betreiber-/Aufsichtsrollen; Datenquellen; Prioritäten und Abnahmekriterien. Vorschlag für den Einstieg in A3: zunächst feste Verbindungen und Packstationszustellung spezifizieren, Direktzustellung separat ausarbeiten. Für den Plattform-MVP gilt Abschnitt 1.2.

## 3. Drohnen-Lieferablauf und Betriebskonzept – Entwurf
1. Auftrag erfassen; Paketmaße, Masse und Eignung prüfen. Zustelloption und erwartetes Zeitfenster anzeigen.
2. Zielpaketfach, Landebereich, Route und benötigte Energie-/Ladekapazität planen und reservieren; sichere Alternativen berücksichtigen.
3. Paket geschützt beladen, Zuordnung prüfen; Wartungs- und Batteriestatus berücksichtigen.
4. Gesamte Mission einschließlich Rückflug oder sicherer Weiterleitung bewerten. Unmittelbar vor Start erneut prüfen; keine Freigabe bei ungeklärten Pflichtprüfungen.
5. Entlang der vorgesehenen Route fliegen und relevante Änderungen überwachen. Verfahren bei Störungen gemäß Architekturentwurf auslösen.
6. Zielbereich auf Verfügbarkeit und Zutritt prüfen; Paket über geschützte Übergabe in ein verschlossenes Fach bringen. Übergabe bestätigen und nachvollziehbar protokollieren.
7. Empfänger authentifiziert abholen lassen. Personen dürfen weder Rotoren noch ungesicherte Pakete erreichen.
8. Rückflug oder geplante Weiterleitung durchführen; laden bzw. optional Akku tauschen. Inspektion, Wartung und erneute Einsatzbereitschaft dokumentieren.

Verantwortlichkeiten für Betreiber, Flugaufsicht, Wartung, Station und Ersatzlieferung sind vor einem Pilotbetrieb verbindlich festzulegen. Bei Ausfällen keine zuverlässige Versorgung durch Drohnen allein versprechen.

## 4. Drohneninfrastruktur, Sicherheit und Betriebsgrenzen
Stationswahl berücksichtigt Erreichbarkeit und Barrierefreiheit, Gebäude, Bäume, Leitungen, temporäre Hindernisse sowie künftige Standortentwicklung. Stromversorgung, Ladezeit, Ladekapazität und Wartungszugang sind zu dimensionieren. Laden am Logistikstandort, an Zielstationen und Akkutausch sind gegeneinander zu bewerten. Reservekapazität für belegte, ausgefallene oder unerreichbare Stationen ist erforderlich.

Schutzmaßnahmen umfassen getrennte Bereiche, Zugangskontrolle, Manipulationserkennung, authentifizierte Abholung und Übergabeprotokolle. Ihr Erfolg benötigt definierte Prüfverfahren; absolute Diebstahlsicherheit wird nicht zugesagt. Reaktionen auf Zutritt, blockierte Landeflächen und Übergabefehler stehen in der [Fehlerfallmatrix](Architekture.md#7-fehlerbehandlung-und-prüffälle--entwurf).

**Zu bestimmende Drohnenparameter:** Abmessungen, Gesamtmasse, Nutzlast, Paketmaße, Geschwindigkeitsbereiche, Energieverbrauch, Reichweite, Reserven und Wettertauglichkeit. Geräuschemissionen benötigen Messbedingungen, Betriebszustand und Bewertungsort. Größe und Dezibel allein bestimmen keine Einsatzfreigabe.

**Ungeprüfte Hypothese H01:** Höhere Ebenen könnten höhere Geschwindigkeiten bei geringerer Lärmbelastung am Boden ermöglichen. Akustische Ausbreitung, Antriebszustand, Wind, Energiekosten, Sicherheit und regulatorische Grenzen können dagegen sprechen. „Höher = schneller = leiser“ ist keine belegte Regel. Benötigt werden technische, akustische und regulatorische Bewertungen.

Wetter ist eine zentrale Betriebsgrenze. Datenbedarf, vier Bewertungszustände und Gesamtfreigabe sind ausschließlich in [Architekture.md](Architekture.md) spezifiziert. Ein nächstes geeignetes Zeitfenster ist immer eine Prognose.

## 5. Annahmen und offene Fragen
| ID | Status | Aussage / Klärung |
|---|---|---|
| A01 | Annahme | Deutschland/EU als vorläufiger Einsatzraum; Demo-Gebiet Wuppertal beschlossen; reales Pilotgebiet und geprüfte Standorte offen |
| A02 | Vorschlag | Für A3 einen überschaubaren Pilotkorridor mit wenigen Stationen untersuchen; ersetzt nicht den vorgeschlagenen Kurier-Pilot M1 |
| F01 | Offen | Einsatzgebiet, Nachfrage, Vergleichsversorgung, betroffene Gruppen und Zugänglichkeitsbedarf |
| F02 | Offen | Drohnenmodell, belegte Parameter, Paketprofil und Wartungskonzept |
| F03 | Offen | Pilotumfang, Zielkennzahlen, Budget und Akzeptanzkriterien |
| F04 | Offen | Geeignete Wetter-, Luftraum-, Gelände-, Hindernis-, Nachfrage- und Stationsdaten samt Nutzungsrechten |
| F05 | Offen | Rollen, Genehmigungspfad, Sicherheitsnachweise, Datenschutz- und Versicherungskonzept |
| F06 | Offen | Ladeverfahren, Stationsmechanik, Reserven und bodengebundene Ersatzversorgung für A3 |
| F07 | Offen | P0-Pitch-Umfang und Demo-Gebiet Wuppertal beschlossen (Abschnitt 12); M1-Pilotgebiet, reale Filialen, Kuriermodell, Picking-Verantwortung und Vergütung offen |
| F08 | Offen | Bestandskontingent/-anbindung, Zahlungsdienst, Vertragspartner, Kundenrechte, Abrechnung und Erstattungsprozess für M1 klären |
| F09 | Offen | Plattform-Datenschutz, Zugriffs-/Löschfristen, Nachweisverfahren und Supportverantwortung festlegen |
| F10 | Offen | Kundenpreis, reale ETA, Kosten und messbare Abnahmeziele aus Partnerprozessen ableiten |

## 6. Regulatorische Prüfung und Quellen
**Status:** Am 2026-10-21 erfolgte eine begrenzte offizielle Quellenprüfung für Routing (Q01–Q03) und Plattformintegrationen (Q04/Q05). Keine projektspezifische Betriebskategorie, Höhe, Route oder Genehmigungsfähigkeit ist festgestellt. Die folgende Matrix bleibt der weitergehende Rechercheauftrag.

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
| Q04 / Herstellerdokumentation | Amazon SP-API, [Get inventory summaries](https://developer-docs.amazon.com/sp-api/docs/get-fba-inventory-summaries) und [Authorize Applications](https://developer-docs.amazon.com/sp-api/docs/authorizing-selling-partner-api-applications), laufende Dokumentation | 2026-10-21 / jeweilige SP-API-Marktplätze | FBA-Bestandszusammenfassungen betreffen Verkäuferartikel; Aufruf auf Partnerdaten benötigt passenden autorisierten Zugriff. Konzeptfolgerung: keine öffentliche Gesamtlager-Suche oder zugesagte Lagerabholung. Kein Partnerzugang getestet. |
| Q05 / Herstellerdokumentation | Stripe, [Place a hold on a payment method](https://docs.stripe.com/payments/place-a-hold-on-a-payment-method), laufende Dokumentation | 2026-10-21 / jeweils unterstützte Konten, Regionen und Zahlarten | Getrennte Autorisierung und späterer Einzug nur bei geeigneten Zahlarten und innerhalb ihrer Fristen. Stripe ist ein Beispiel, keine Anbieterentscheidung; keine Integration getestet. |

**Ergänzende Anbieterquellen für die Pitch-Umsetzung (geprüft 2026-10-21):**

| ID / Art | Quelle / Stand | Geltung / Bedeutung |
|---|---|---|
| Q06 / Bibliothekslizenz | Leaflet [BSD-2-Clause](https://github.com/Leaflet/Leaflet/blob/main/LICENSE); installiert 1.9.4, Lizenzkopie unter docs/licenses | Weltweit / Bibliotheksnutzung und Beibehaltung der Lizenzhinweise; keine Kartenlizenz |
| Q07 / Dienst-Nutzungsrichtlinie | OSM Foundation [Tile Usage Policy](https://operations.osmfoundation.org/policies/tiles/), laufende Onlinefassung | Standarddienst tile.openstreetmap.org / sichtbare Attribution, Browser-Caching und gültiger Referer; kein Massen-/Offline-Vorladen, keine Verfügbarkeitszusage |
| Q08 / Anbieterbedingungen | MET Norway [Terms of Service](https://api.met.no/doc/TermsOfService), [Getting Started](https://api.met.no/doc/GettingStarted), laufende Onlinefassung | Wetter-API weltweit / identifizierender User-Agent, begrenzte Koordinatenpräzision und respektiertes Expires/Last-Modified-Caching |
| Q09 / Anbieter-Datenbeschreibung | MET [Locationforecast-Datenmodell](https://api.met.no/doc/locationforecast/datamodel), [Forecast JSON](https://api.met.no/doc/ForecastJSON), Version 2.0 | Wuppertal im globalen Modell, ungefähr 9km Auflösung; Temperatur 2m, Wind 10m über Modellboden. Keine lokalen Gebäudewinde/Flughöhenwerte; Intervallsummen und UTC-Zeiten korrekt einordnen |
| Q10 / Datenlizenz | MET [License and attribution](https://api.met.no/doc/License), laufende Onlinefassung | Prognosedaten grundsätzlich CC BY 4.0/NLOD; Attribution und Lizenz in der Wetteransicht. Normalisierung als Bearbeitung angegeben |

**Gelieferte Grundlagen G01/G02:** [Word-Produktkonzept und Markdown-Arbeitsgrundlage Version 1 vom 2026-10-21](docs/grundlagen/README.md), vom Nutzer geliefert und inhaltlich am selben Datum ausgewertet. Produktumfang, Stufen, Geschäftsregeln und Stackempfehlungen sind Teamvorschläge. Externe Quellenbehauptungen der Vorlagen sind kein eigener Nachweis; Q04/Q05 wurden für die Integration separat geöffnet. Q01–Q03 stammen aus der vorherigen Routing-Recherche.

Keine Drohnenherstellerangaben oder technischen Leistungsnachweise recherchiert. Personenüberflug, lokale Höhen-/Zonenauflagen, Standort/Lärm, Datenschutz, konkrete Versicherungsdeckung und das vollständige Zulassungsverfahren bleiben offen.

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
- Veraltete Bestände, parallele Ladenverkäufe, unklare Zahlung oder fehlende Transportkapazität können bezahlte Aufträge ohne lieferbare Ware erzeugen; Transaktions- und Ausgleichsverfahren sind zu prüfen.
- Picking-, Kurier- und Supportkosten können das Geschäftsmodell unwirtschaftlich machen; rechtliche Rollen, Kundenrechte und Abrechnung sind vor M1 offen zu klären.
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
| 2026-10-21 | Beschlossene Anforderung | Gruppenübersicht, Word-Konzept und vollständige Markdown-Arbeitsgrundlage integrieren. P0/M1/A2/A3 und Geschäftsregeln als Konzeptvorschlag führen; Coding-Startprompt bleibt unaktivierte Vorlage. |

## 10. Übergabestand
Commit-Konvention: Am 2026-10-21 vom Nutzer festgelegt; verbindliche Definition in [AGENTS.md](AGENTS.md#commit-schema).

Historischer Übergabestand des Integrationsauftrags, vor der gesonderten Implementierung in Abschnitt 12 (2026-10-21).
- **Erledigt:** Gruppenunterlagen integriert: Produktstruktur, MVP P0/M1, Ausbau A2/A3, Rollen, Bestellablauf, Sonderfälle und Wirtschaftlichkeit ergänzt. Technische Spezifikation mit Datenmodell, Zuständen, API-Vorschlägen, B01–B10 und 16 Abnahmeszenarien eingebunden. Originale in `docs/grundlagen/` erhalten; Routing und Pitch-Ergebnisse bewahrt.
- **Offen:** MVP-Vorschlag, Pilotgebiet, Händler-/Kurierpartner, Bestandsverfahren, Picking, Vertrags-/Zahlungsmodell, Kosten und Akzeptanzkriterien entscheiden. Drohnenparameter und Betriebsvoraussetzungen vor A3 klären.
- **Blockiert:** Keine Blockade der Dokumentation. Echter Pilot benötigt Partner und betroffene Nachweise. Keine Softwareentwicklung durch diesen Integrationsauftrag beauftragt.
- **Nächster Schritt:** P0-Umfang gemeinsam bestätigen und dann B01–B09 gezielt beauftragen; B10 erst mit Partnerzugängen. Für Routing zuerst den Vertrag für Lieferbarkeit, Preis, Zeit und Kapazitätsbindung abstimmen.
- **Geänderte Dateien dieses Auftrags:** `Konzept.md`, `Architekture.md`, `README.md`, `docs/grundlagen/`. Bestehende Änderungen an Pitch-Dokumentation und `assets/` erhalten.
- **Prüfumfang:** Word-Text und Markdown-Kapitel inhaltlich ausgewertet, Integrationsgrenzen abgeglichen, lokale Verweise, B01–B10/16 Szenarien, Originaltreue der Kopien und Markdown-Diff geprüft. Amazon-/Stripe-Dokumentation begrenzt geprüft (Q04/Q05). Keine Word-Layoutprüfung, Implementierung, Tests der fachlichen Szenarien oder Betriebsfreigabe.

## 11. Pitch-Visualisierungen

**Implementiert als Bilddateien / Vorschlag für die Gestaltung (2026-10-21):** Drei DroneDeliver-App-/Routing-Motive anhand der vom Nutzer gelieferten Designübersicht und ein zusätzliches Stadtmotiv erstellt. Übersicht, PNGs, Prompt-Set und Einschränkungen: [assets/pitch/README.md](assets/pitch/README.md). Die Abbildungen sind KI-generierte Konzeptbilder mit illustrativen Daten; keine implementierten Oberflächen, technischen Nachweise oder Flugfreigaben. Name und Gestaltung sind aus der Referenz übernommen, keine zusätzliche verbindliche Markenentscheidung.

**Übergabe Pitch-Auftrag:** Erledigt: vier Bilder im Projekt gespeichert, visuell auf Aufbau und zentrale Inhalte geprüft und dokumentiert. Offen: Motive für den Pitch auswählen; spätere UI-Umsetzung separat beauftragen. Blockiert: nichts. Nächster Schritt: ausgewählte Bilder in die Pitch-Präsentation aufnehmen. Geändert: `assets/pitch/` und `Konzept.md`, `README.md` mit Verweis ergänzt. Prüfumfang: Sichtprüfung der generierten Bilder, Datei-/Verweisprüfung und Markdown-Diff; keine technische Validierung der abgebildeten Konzepte.


## 12. Beauftragte erste Pitch-Version – lokale Wuppertal-Demo

**Beschlossene Anforderung (Nutzerauftrag 2026-10-21):** [Unveränderter eingefügter Pitch-Auftrag](docs/grundlagen/Pitch_Auftrag_2026-10-21.md). Eine mobile deutsche React-/Next.js-Website erzählt in etwa fünf Minuten „lokal einkaufen → Lieferung verfolgen → Routing verstehen → Drohnen und Packstationen als Ausbau erleben“. Dieser ursprüngliche Schwerpunkt ist durch die unten dokumentierte Nutzerkorrektur zu Fly2You mit primärer Drohnenlieferung aktualisiert. Präsentationsrechner und lokales WLAN; keine öffentliche Veröffentlichung.

**Umfang:** Entdecken, Lieferung, Stationen, Routing; nach der beauftragten Sortimentserweiterung 6 fiktive Händler mit 7 Filialen, 36 Varianten und 40 Angeboten im Gebiet Elberfeld–Barmen. Der ursprüngliche Pitch-Auftrag umfasste 3 Händler/4 Filialen/20 Varianten; die spätere Nutzererweiterung ist unten dokumentiert. Ein-Filial-Warenkorb mit ausdrücklichem Wechsel, befristetem Demo-Angebot und Gesamtpreis. Drohne zur gewählten Station ist vorausgewählt; Fahrrad zum festen Beispielort und Selbstabholung ohne Lieferauftrag/-gebühr bleiben Alternativen. Ereignisse und Bewegung sind simuliert; Einlagerung, Abholbereitschaft und Kundenabholung bleiben getrennt. Eigenständige Stationsvorschau vom Tracking erreichbar.

**Routing:** Ein Hub, 3 Stationen, 3 Drohnen, gerichtetes Demo-Netz mit Beispielzeiten. Dijkstra prüft verfügbare Verbindungen sowie Zielkapazität und Fahrzeugverfügbarkeit. Reproduzierbare Fälle: normal, Korridorsperre mit Alternative, volle/ausgefallene Station und ausdrücklich simulierte Wetterpause. Keine Flugfreigabe; reale Wetterbewertung ohne belegte Fahrzeuggrenzen und vollständige Pflichtdaten stets **UNBESTIMMT**.

**Online-Daten:** Leaflet mit konfigurierbarer OSM-Kartenquelle und sichtbarer Attribution; Listen und Netzansicht bleiben ohne Kacheln bedienbar. MET Norway Locationforecast über serverseitigen, ortsgebundenen Wetterendpunkt mit Cache. Vorhersage, Abruf-/Anbieter-/Prognosezeit, Messhöhe und Datenlücken getrennt ausweisen. Keine Live-Messung. Anbieterquellen und technische Umsetzung in [Architektur, Abschnitt 13](Architekture.md#13-implementierte-p0-pitch-demo).

**Bedienung:** Mobile ab 360 px, sichtbarer Fokus, mindestens 44 px große Touch-Ziele, Hell/Dunkel, reduzierte Bewegung; wesentliche Aktionen ohne Karte. Pitch-Menü mit Neustart, Pause, nächsten Schritten und Szenarien. Versionierter lokaler Browser-Speicher; jedes Gerät besitzt eine eigene Sitzung. Keine Standort-/Kameraberechtigung nötig.

**Ausgeschlossen:** Benutzerkonten, Zahlungsanbieter, Geschäftsdatenbank, reale Händler-/Bestands-/Fahrzeuganbindungen und öffentliche Veröffentlichung. Die breiteren M1/A2/A3-Anforderungen und historischen B01–B10 sind erhalten und werden durch diese Demo nicht als umgesetzt oder geprüft ausgegeben. Originalunterlagen und Pitch-Bilder bleiben erhalten; AGENTS.md bleibt unverändert.

**Abnahme:** Einkauf bis bestätigter Kundenabholung für Drohne sowie Empfang für Fahrrad/Selbstabholung; Filialwechsel, unbestätigter Bestand, Quoteablauf und Doppelklick; Stationankunft ≠ Abholung; alternative/fehlende Route; Wetterlücken, Alter, Timeout und 429 ohne positive Bewertung; Herkunft über Szenariowechsel/Reset; Kartenfehler; mobile Bedienung, Fokus, Kontraste und reduzierte Bewegung; Produktionsbuild und tatsächlicher WLAN-Test. Prüfresultate werden in Architektur Abschnitt 13 geführt, verbleibende Prüflücken ausdrücklich ausgewiesen.


**Frühere Namens-/Textentscheidung (2026-10-21; Name durch spätere Nutzerkorrektur ersetzt):** Die App hieß **Fly to you**. Ergänzende werbliche Meta-Zeilen wie „Lokal. Verbunden.“ und „Für deinen Alltag. Für unser Tal.“ werden aus der Oberfläche entfernt. Funktionale Hinweise zu Demo-Daten, Datenherkunft, Status und Bedienung bleiben erforderlich. Der ältere Arbeitsname DroneDeliver in Originalaufträgen und Pitch-Bildern bleibt als historischer Quellstand erhalten.


**Beschlossene Sortiment-/Bild-Erweiterung (Nutzerauftrag 2026-10-21):** Für jede Produktvariante werden zwei einzelne KI-generierte Produktfotos mit dem integrierten Imagegen-Skill erstellt und in der App als Galerie eingebunden. Pro Kategorie arbeitet ein eigener Subagent; maximal drei Subagenten laufen parallel, weitere Kategorien folgen gestaffelt. Erweiterung auf 36 Varianten/40 Angebote, 6 fiktive Händler und 7 Filialen: Lebensmittel, Technik, Spielzeug und Blumen ergänzen Vorrat, Kaffee/Tee, Süßes, Bücher und Pflege/Zuhause. Taltechnik steht als fiktiver Elektronikhandel für den genannten Geschäftstyp (beispielsweise MediaMarkt); keine reale Händlerpartnerschaft oder tatsächliche Filialverfügbarkeit wird behauptet. Frischware, Blumen und Akkuprodukte sind nur Beispielszenarien; Kühlung, Bruchschutz, Gefahrgut-/Transportvorgaben und Fahrzeugeignung sind nicht nachgewiesen und für M1 gesondert zu prüfen. Historische Sortimentsbegrenzungen für den echten Pilot bleiben bestehen.


**Beschlossene Aktualisierung (Nutzerkorrektur 2026-10-21):** Der aktuelle App-Name ist **Fly2You** und ersetzt „Fly to you“ in der aktiven Oberfläche. Hauptfokus ist die simulierte Drohnenlieferung vom Demo-Hub zur gewählten Station: im Einkauf vorausgewählt, mit Stationsauswahl und Bestellverfolgung. Fahrrad und Selbstabholung bleiben Alternativen. Ankunft, Einlagerung, Abholbereitschaft und bestätigte Kundenabholung bleiben getrennt. Ergänzende Werbe-Meta-Zeilen bleiben entfernt. Historische Originalaufträge und Bildquellen werden bewahrt. **Implementiert und geprüft; aktueller Übergabestand folgt unten.**

### Frühere Übergabe nach Implementierung und Bilderweiterung (2026-10-21)

- **Erledigt:** Fly to you als mobile lokale Pitch-App umgesetzt: Einkauf, Filialvergleich/-wechsel, Quote, Fahrrad/Selbstabholung, Tracking, Stationen, Dijkstra-Szenarien, OSM-Karte/Netz-Fallback und MET-Vorhersage. Ergänzende Werbe-Meta-Zeilen entfernt. 36 Varianten/40 Angebote in 9 Kategorien bei 6 fiktiven Händlern/7 Filialen. Neun Kategorie-Subagenten haben 72 einzelne Produktfotos fertiggestellt; je zwei konsistente Ansichten, Galerie, Kennzeichnung, Originale und Promptprotokolle erhalten.
- **Geprüft:** 72/72 Bilddateien, 57/57 Fach-/Wetter-/Vollständigkeitstests, TypeScript, Produktionsbuild und 16/16 Browserfälle. Desktop 1440×1000, mobil 360×800; Galerie, Bildladung, Fehlerszenarien, Tastatur, reduzierte Bewegung, automatische axe-Prüfung und Konsole. Echter Wetterendpunkt HTTP 200 mit 25 Prognosepunkten; reale Bewertung UNBESTIMMT. Einzelheiten und Grenzen primär in Architektur Abschnitt 13.
- **Offen:** Tatsächlicher Aufruf von einem zweiten physischen Gerät im selben WLAN; Safari/Firefox und umfassende manuelle Screenreaderprüfung. Reale Partner, Betrieb, Produkt-/Transporteignung, Verträge und alle Drohnen-Nachweise bleiben vor M1/A3 offen.
- **Blockiert:** Keine weitere Blockade der lokalen Demo-Implementierung. Das fehlende zweite Prüfgerät begrenzt den WLAN-Abnahmenachweis; es wird kein erfolgreicher Smartphone-Test behauptet.
- **Nächster Schritt:** Präsentationsrechner per README starten, Smartphone im selben WLAN verbinden und den Fünf-Minuten-Ablauf vorführen. Ein späterer echter Pilot ist gesondert abzugrenzen und zu beauftragen.
- **Geänderte Dateien:** Konzept.md, Architekture.md, README.md und Grundlagenverweis; neue App-/Test-/Builddateien unter src/, tests/, scripts/ und im Projektstamm; PNG/WebP unter public/products/; Prompt-/Quellenprotokolle unter docs/assets/ und Bibliothekslizenzen unter docs/licenses/. AGENTS.md, vorhandene Pitch-Bilder, Word und ursprüngliche Markdown-Grundlage unverändert erhalten. Keine öffentliche Veröffentlichung und kein Commit/Push ausgeführt.


### Aktuelle Übergabe – Fly2You und Drohnenfokus (2026-10-21)

- **Erledigt / implementiert:** Name Fly2You in App, Seitentitel, Paketkennung und Wetter-User-Agent. Startbereich mit vorhandenem Drohnen-Konzeptbild; Drohnenlieferung als vorausgewählte Hauptoption, Zielstation im Warenkorb, Fahrrad als sekundäre Alternative. Demo-Checkout ist mit Routen-/Stationsprüfung und zehn Bestellschritten verbunden. Flugankunft, Einlagerung, Abholbereitschaft und explizit bestätigte Kundenabholung sind getrennt. Automatische Wiedergabe endet vor der Kundenabholung. Aufträge behalten Ziel, Szenario, Fahrzeug und Beispielzeiten unabhängig von späteren Planungsänderungen. Version-1-Sitzungen werden ohne Verlust gültiger Warenkörbe/Bestellungen übernommen; alte Fahrrad-Standardauswahl wird einmal zur Drohnenauswahl, explizite Version-2-Alternativen bleiben erhalten. Alle 72 Produktfotos und Originalquellen bleiben erhalten.
- **Geprüft:** 65/65 Vitest-Tests, TypeScript/Produktionsbuild und 21/21 Playwright-Browserfälle bestanden. Mobil 360×800 und Desktop 1440×1000 einschließlich Drohnen-Checkout, Migration, Alternativroute, Stations-/Wettersperren, Auftragsroute nach globaler Änderung/Reload sowie axe. Sichtprüfung der neuen Start-/Warenkorb-/Trackingansichten; Ergebnisse und Grenzen primär in [Architekture.md, Abschnitt 13](Architekture.md#13-implementierte-p0-pitch-demo).
- **Offen:** Zweites physisches WLAN-Gerät, Safari/Firefox, umfassende manuelle Screenreaderprüfung und die bereits dokumentierten Voraussetzungen für einen echten Pilotbetrieb.
- **Blockiert:** Keine funktionale Blockade der lokalen Demo. Kein Nachweis realer Flug-/Transport- oder Betriebseignung.
- **Nächster Schritt:** Die laufende Vorschau auf Port 3000 für den Pitch nutzen; tatsächlichen Smartphone-Aufruf im gemeinsamen WLAN prüfen.
- **Geänderte Dateien:** `src/components/PitchApp.tsx`/CSS, `NetworkMap.tsx`, `src/domain/checkout.ts`, `orders.ts`, `drone.test.ts`, `src/demo/session.ts`, `src/app/layout.tsx`, Wetter-Provider, Paketdateien, `.env.example`, Browser-Tests/-Konfiguration, optimierte Kopie `public/images/drone-delivery-vision.webp` sowie Konzept, Architektur, README und Assetverzeichnis. AGENTS.md und Originalbilder/-aufträge unverändert. **Versionierung beauftragt:** Der Nutzer hat anschließend Commit und Push des geprüften Gesamtstands auf `main` im bestehenden Repository `origin` angefordert. Dies veröffentlicht den Quellstand im Repository; ein Hosting-/App-Deployment ist nicht Bestandteil dieses Auftrags.


**Git-Übergabe (2026-10-21):** Der geprüfte Fly2You-Stand einschließlich App, Tests, Produktfotos, Bildquellen und Dokumentation wird im bestehenden `main` versioniert. Vor Commit: Remote-Stand abgerufen, vorgesehene Dateien, Ignore-Regeln, Dateigrößen, Schlüssel-Stichmuster und Whitespace geprüft. Keine blockierenden Befunde; keine Buildausgaben, Abhängigkeiten oder echten `.env`-Dateien vorgesehen. Offen bleiben die oben genannten externen Validierungen. Commit und Remote-Abgleich werden direkt nach Ausführung geprüft; die Git-Historie ist der maßgebliche Versionsnachweis.


### Übergabe – QR-Launcher für Mockup und Produktionsseite (2026-10-22)

**Beschlossene Anforderung (Nutzerauftrag 2026-10-22):** Ein Python-Skript im
Projektstamm startet Mockup und echte Website gemeinsam über die
Cloudflare-Quick-Tunnel-Methode und legt für beide beschriftete QR-Code-Bilder im
Arbeitsverzeichnis ab. Der Nutzer hat ergänzt, dass die Lösung nur auf diesem
Rechner funktionieren muss. Technische Umsetzung und Prüfresultate:
[Architekture.md, Abschnitt 13](Architekture.md#qr-launcher-für-mockup-und-produktionsseite-2026-10-22);
Aufruf und Voraussetzungen in [README.md](README.md#mockup-und-produktionsseite-gemeinsam-mit-qr-codes).

- **Erledigt:** `launch_sites_qr.py` startet `next start` auf Port 3000 und das
  gebaute Vite-Mockup (`Mockup/app/dist`) auf Port 4173, öffnet pro Website einen
  Quick Tunnel und erzeugt `qr-mockup.png` (**MOCKUP**) und `qr-prod.png`
  (**PROD**) mit URL-Text. Builds werden bei veralteten Artefakten automatisch
  erneuert; `--rebuild` erzwingt dies. `Ctrl+C`/SIGTERM räumt Server und Tunnel ab.
- **Geprüft:** Zwei Läufe mit neuen Tunnel-URLs; beide URLs HTTP 200 mit erwarteten
  Seitentiteln; beide QR-PNGs dekodiert und sichtgeprüft; Ports und Tunnel nach
  Beenden frei. Details in Architektur Abschnitt 13.
- **Offen:** Quick Tunnels bleiben ohne Uptime-Zusage; jede Ausführung erzeugt neue
  URLs. Ein Zugriff von einem zweiten physischen Gerät wurde nicht erneut geprüft.
- **Blockiert:** Nichts.
- **Nächster Schritt:** `python3 launch_sites_qr.py` vor der Präsentation starten
  und die erzeugten QR-Bilder verwenden; Skript bis zum Ende der Vorführung laufen
  lassen.
- **Geänderte Dateien:** `launch_sites_qr.py` (neu), `README.md`,
  `Architekture.md`, `Konzept.md`, `.gitignore`; generierte `qr-*.png` bleiben
  unversionierte Laufzeitartefakte. `AGENTS.md` unverändert. Kein Commit/Push ausgeführt.
