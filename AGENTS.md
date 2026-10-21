# Urbane Paketversorgung durch Drohnen

## Ziel und Umfang
Wir entwickeln auf Deutsch ein nachvollziehbares Konzept für ein urbanes Drohnen-Liefernetz zwischen Logistikstandorten und sicheren Packstationen: feste Flugkorridore, Höhenebenen, Ladeinfrastruktur und wetterabhängige Flugfreigabe. Leitfrage: Wie entlasten wir Städte bei steigenden Bestellungen und sichern zugleich eine zuverlässige Versorgung?

Nutzen, Machbarkeit, Sicherheit, regulatorische Voraussetzungen und Grenzen sind zu bewerten. Simulationen und Prototypen belegen weder die Genehmigung noch die Sicherheit eines Realbetriebs. Deutschland/EU ist vorläufige räumliche Arbeitsannahme.

## Verbindliche Projektdateien
- `Konzept.md`: fachlicher Stand, Anforderungen, Betriebskonzept, Annahmen, Risiken, Quellen, Entscheidungen und Übergabe.
- `Architekture.md`: technische und physische Architektur, Daten und Schnittstellen, Entscheidungslogik, Fehlerbehandlung, Umsetzung und Prüfungen. Schreibweise beibehalten.
- `AGENTS.md`: kompakte, dauerhafte Arbeitsregeln; kein Chatprotokoll. Grundlegende Regeln nur nach ausdrücklicher Nutzerentscheidung ändern.

## Zusammenarbeit und Dokumentation
1. Zu Beginn jeder Aufgabe alle drei Dateien und relevante vorhandene Arbeitsdateien lesen. Am dokumentierten Stand ansetzen; keinen Zugriff auf frühere Chats voraussetzen.
2. Bestehende Entscheidungen und Ergebnisse bewahren. Vor jedem Speichern aktuellen Inhalt prüfen und Änderungen anderer Chats erhalten. Widersprüche ausdrücklich klären.
3. Anforderungen aus Chats sowie wesentliche Entscheidungen, Erkenntnisse und Änderungen unmittelbar in der zuständigen Datei pflegen. Einen Sachverhalt primär an einer Stelle dokumentieren und ansonsten verlinken.
4. Kennzeichnen: **Vorschlag**, **Annahme**, **beschlossene Anforderung**, **implementiert**, **geprüft**. Keine Entscheidungen, Messwerte, Quellen oder Freigaben erfinden.
5. Reversible Annahmen erlauben Fortschritt. Nur nachfragen, wenn fehlende Angaben die nächste wesentliche Entscheidung verhindern.
6. Vor Abschluss Dokumente synchronisieren und in `Konzept.md` eine kurze Übergabe hinterlassen: erledigt, offen, blockiert, nächster Schritt. Geänderte Dateien und tatsächlichen Prüfumfang nennen. Ohne Dateizugriff Änderungen als ungespeichert kennzeichnen.

## Commit-Schema
Verbindlich nach Nutzerentscheidung vom 2026-10-21: `what(where): what in detail`.
- `what`: Art der Änderung (beispielsweise `docs`, `feat`, `fix`, `refactor`, `test`, `chore`).
- `where`: betroffener Bereich; immer angeben (beispielsweise `project`, `weather`, `stations`).
- `what in detail`: konkrete, aussagekräftige Beschreibung der Änderung.
- Beispiel: `docs(project): initialize concept, architecture and working rules`.
Die Beispiele sind keine abschließende Liste zulässiger Werte. Vor einem Commit den vorgesehenen Inhalt und danach Commit und Arbeitsbaum prüfen.

## Recherche und Entwicklung
- Aktuelle offizielle Quellen für geltende Vorschriften nutzen; Quelle, Prüfdatum, räumlichen Geltungsbereich und Bedeutung dokumentieren. Recht, Herstellerangaben/technische Nachweise und eigene Annahmen getrennt führen.
- Betriebskategorie, Genehmigungen, BVLOS/Sichtweite, geografische Zonen, Höhen, Personenüberflug, Lärm, Datenschutz und Versicherung prüfen. Geplante Korridore/Höhen niemals als genehmigt darstellen.
- Keine universellen Wetter-, Nutzlast-, Energie- oder Fluggrenzen erfinden. Drohnenbezogene Nachweise und lokale Bedingungen benötigen nachvollziehbare Herkunft.
- Wetterbewertung umfasst Route, Stationen und gesamtes Flugzeitfenster inklusive Rückflug oder sicherer Weiterleitung. Fehlende/veraltete Daten erzeugen keine positive Freigabe; Wetter allein genügt nicht.
- Nutzen gegenüber einer beschriebenen Vergleichsversorgung bewerten, einschließlich Zubringer, Abholwegen und Ersatzlieferungen. Umweltentlastung und absolute Diebstahlsicherheit nicht voraussetzen.
- Implementierung erst aus einem beauftragten, abgegrenzten Prototypumfang ableiten. Sicherheitskritische Fehlerfälle ausdrücklich prüfen; Ergebnisse und Grenzen in `Architekture.md` dokumentieren.
