# AGENTS.md - Arbeitsanweisung für dieses Projekt

## Projektziel

Konzept und klickbarer Prototyp für ein urbanes Drohnen-Liefernetz: feste
Flugkorridore, definierte Höhenebenen, sichere Packstationen,
Ladeinfrastruktur und wetterabhängige Flugfreigabe. Der Prototyp zeigt
Zusammenhänge und Fehlerfälle. Er ist kein Nachweis für einen genehmigten oder
sicheren Realbetrieb.

Leitfrage: Wie entlasten wir Städte bei steigendem Lieferverkehr und halten
gleichzeitig eine zuverlässige Versorgung?

## Maßgebliche Projektdateien

| Datei | Inhalt | Primäre Wahrheit für |
|---|---|---|
| `AGENTS.md` | Arbeitsregeln, Rollen, Prüfregeln | Zusammenarbeit |
| `Konzept.md` | Problem, Zielgruppen, Anforderungen, Abläufe, Sicherheit, Wetter, Regulierung, Entscheidungen, Arbeitsstand | Fachliches Konzept |
| `Architekture.md` | Systemkomponenten, Datenmodelle, Schnittstellen, Entscheidungslogik, technische Grenzen | Technik und Architektur |
| `app/` | React-Prototyp mit Demodaten | Umsetzungsstand der Oberfläche |

Ein Sachverhalt wird primär in der zuständigen Datei dokumentiert. Andere
Dateien verweisen darauf, statt ihn zu duplizieren.

## Arbeitsweise

1. Vor jeder Aufgabe `AGENTS.md`, `Konzept.md` und `Architekture.md` lesen.
2. Am dokumentierten Stand ansetzen. Keinen Zugriff auf frühere Chats
   unterstellen.
3. Bestehende Entscheidungen und Ergebnisse bewahren. Widersprüche ausdrücklich
   klären, nicht still überschreiben.
4. Neue Anforderungen aus dem Chat unmittelbar in `Konzept.md` dokumentieren.
5. Zwischen Vorschlag, Annahme, beschlossener Anforderung, implementierter
   Funktion und geprüftem Ergebnis unterscheiden.
6. Keine Entscheidungen, Messwerte, Quellen, Genehmigungen oder Freigaben
   erfinden.
7. Vor dem Speichern den aktuellen Dateiinhalt prüfen und Änderungen anderer
   Chats erhalten.

## Entwicklungs- und Prüfregeln

- Sprache der Oberfläche: Deutsch. Code, Typen und Identifier: Englisch.
- Der Prototyp verwendet ausschließlich Demodaten und kennzeichnet sie sichtbar.
- Wetterzustände immer vollständig: möglich, eingeschränkt, nicht möglich, keine
  belastbare Entscheidung.
- Fehlende oder veraltete Daten dürfen nie als positive Freigabe erscheinen.
- Eine Wetterfreigabe ist nur ein Teil der Gesamtfreigabe. Route, Luftraum,
  Energie, Nutzlast, Station und Sicherheit werden zusätzlich geprüft.
- Flugkorridore und Höhenebenen werden nie als genehmigt dargestellt.
- Die Hypothese "höher = schneller = leiser" wird als offene Arbeitshypothese
  gekennzeichnet und nicht als belegte Regel verwendet.
- Mobile ist die Basis. Jede interaktive Komponente hat Default-, Hover-,
  Focus-, Active-, Disabled- und, wo zutreffend, Lade-, Fehler- und
  Auswahlzustand.
- Keine Emoji in UI, Code, Dokumenten oder Commit-Texten.
- Keine erfundenen Kennzahlen. Demo-Kennzahlen sind als Demo gekennzeichnet.
- Vor Abschluss: `npm run build` im Ordner `app/` und die betroffenen Ansichten
  im Browser prüfen. Ergebnis und Grenzen dokumentieren.

## Übergabe

Vor Abschluss einer Aufgabe in `Konzept.md` unter "Arbeitsstand" festhalten:
erledigt, offen, blockiert, nächster Schritt. Geänderte Dateien und der Umfang
der Prüfung werden in der Antwort genannt. Eine Speicherung oder Prüfung wird
nur behauptet, wenn sie tatsächlich stattgefunden hat.
