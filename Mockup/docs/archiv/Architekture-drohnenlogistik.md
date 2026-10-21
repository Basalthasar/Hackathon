# Architektur - Urbane Paketversorgung durch Drohnen

Stand: 2026-10-21
Status: Entwurf. Der Prototyp in `app/` ist eine React-Oberfläche mit Demodaten,
keine Flugsteuerung und kein Nachweis für einen sicheren Realbetrieb.

## 1. Systemüberblick

```
Empfänger-App/Web
        |
        v
API-Gateway  --->  Sendungs- und Stationsservice
        |                    |
        |                    v
        |          Packstationssteuerung (Fächer, Übergabe, Zugang)
        |
        +------>  Missions- und Freigabeservice
                       |
        +--------------+--------------+
        |              |              |
        v              v              v
 Wetterdienst     Luftraum-/U-Space  Flotten- und Ladeservice
        |              |              |
        +--------------+--------------+
                       |
                       v
              Telemetrie und Audit-Log
                       |
                       v
                 Leitstellen-Oberfläche
```

Der Prototyp bildet nur die Oberfläche und eine lokale, nachvollziehbare
Entscheidungslogik ab. Es gibt keine Verbindung zu Drohnen, Wetterdiensten oder
Luftraumdiensten.

## 2. Komponenten und Verantwortlichkeiten

| Komponente | Verantwortung | Im Prototyp |
|---|---|---|
| Empfänger-Oberfläche | Sendung verfolgen, Abholung, Ausweichstation, Support | simuliert |
| Leitstellen-Oberfläche | Lagebild, Flugfreigabe, Missionen, Störungen | simuliert |
| Stations-Oberfläche | Fächer, Kapazität, Laden, Übergabe, Ausfall | simuliert |
| API-Gateway | Authentifizierung, Mandanten, Rate Limits | nicht vorhanden |
| Sendungsservice | Auftrag, Status, Empfänger, Benachrichtigung | Demodaten im Client |
| Stationsservice | Fächer, Reservierung, Öffnung, Protokoll | Demodaten im Client |
| Missionsservice | Planung, Zustandsmaschine, Freigabe, Historie | lokale Zustandslogik |
| Wetterdienst | Beobachtungen, Vorhersagen, Datenqualität | simulierte Momentaufnahme |
| Luftraumdienst | Korridore, Geofences, Genehmigungsstatus | statische Demo-Daten |
| Flottenservice | Drohne, Batterie, Wartung, Ladestatus | Demodaten |
| Telemetrieservice | Position, Link, Sequenz, Zeitstempel | nicht vorhanden |
| Audit-Log | unveränderliche Ereignisse und Entscheidungen | nicht vorhanden |

## 2a. Referenzraum Wuppertal

Die Demo-Daten verwenden Wuppertal als schematischen Referenzraum:
Wuppertal Hauptbahnhof (Elberfeld), Alter Markt (Barmen), Vohwinkel und
Cronenberg als Packstationen; Logistikzentrum Vohwinkel und Mikro-Hub
Oberbarmen als Umschlagpunkte. Die Karte ist ausdrücklich keine Geodatenkarte.
Topographie, Wupper, Schwebebahn, Straßenachsen, Anflugwege und reale
Grundstücksgrenzen sind in der Standortprüfung zu ergänzen.

## 3. Drohnen, Stationen und Laden

### 3.1 Drohnenprofil

Parameter, die vor einem Realbetrieb festgelegt und belegt werden müssen:

- Abmessungen, Gesamtmasse, maximale Nutzlast.
- Geschwindigkeitsbereiche je Höhenband.
- Energieverbrauch, Reichweite, Reservepolitik.
- Lärmemission mit Messbedingungen und Abstand.
- Wettertauglichkeit: Wind, Böen, Niederschlag, Temperatur, Sicht.
- Sicherheitsfunktionen: Rückkehr, Notlandung, Link-Verlust, Geofence.
- Kennzeichnung, Remote ID, Wartungsstände.

Im Prototyp: vier Drohnen mit Demo-Batterieständen und Stati. Die Werte sind
keine Herstellerangaben.

### 3.2 Packstation

Komponenten:

- öffentlicher Abholbereich,
- verschlossene Paketfächer,
- Landeplattform mit freien An- und Abflugwegen,
- Übergabevorrichtung von der Drohne in das Fach,
- Ladeplätze und Energieanschluss,
- Sensorik für Belegung, Zutritt und Störungen,
- lokale Steuerung mit sicherem Offline-Verhalten,
- Wartungsbereich mit getrenntem Zugang.

Sicherheitsentscheidungen:

- Rotorbereich während Start, Landung und Übergabe sperren.
- Übergabe nur in ein verschlossenes Fach.
- Abholung nur mit authentifiziertem Code oder App.
- Jede Öffnung, Übergabe und Störung protokollieren.
- Bei unklarer Übergabe das Fach geschlossen halten und den Fall eskalieren.

## 4. Routen-, Höhen- und Geschwindigkeitsmodell

Das Modell ist ein **Entwurf**, keine genehmigte Struktur.

```
Korridor K1
  Abschnitt A: Hub Vohwinkel -> Waypoint W1
  Abschnitt B: W1 -> Station Wuppertal Hauptbahnhof
  Abschnitt C: Wuppertal Hauptbahnhof -> Ausweichpunkt A1
  Höhenbänder: 40-60 m, 60-80 m, 80-100 m
  Geschwindigkeit: je Band und Abschnitt zu kalibrieren
  Kapazität: Missionen pro Zeitfenster
  Konflikte: Kreuzungen, Gegenverkehr, Hindernisse
```

Regeln:

- Ebenenwechsel nur an definierten Wechselpunkten.
- Mindestabstände und Ausweichräume explizit prüfen.
- Höhere Ebene ist nicht automatisch leiser. Lärm wird mit Messbedingungen,
  Abstand und Richtwirkung bewertet.
- Geschwindigkeit wird aus Flugprofil, Energie, Lärm und Regulierung abgeleitet,
  nicht aus einer einzelnen Kennzahl.
- Korridore und Höhen werden im UI als "Entwurf" oder "Arbeitshypothese"
  gekennzeichnet.

## 5. Wetterdaten und Entscheidungslogik

### 5.1 Eingangsdaten

```ts
interface WeatherSnapshot {
  source: string;
  fetchedAt: string;
  validFrom: string;
  validUntil: string;
  spatialResolutionKm: number;
  kind: 'observation' | 'forecast';
  windMps: number;
  gustMps: number;
  gustLimitMps: number;
  windDirectionDeg: number;
  precipitation: 'none' | 'rain' | 'snow' | 'hail';
  lightningDistanceKm: number | null;
  icingRisk: 'low' | 'medium' | 'high' | 'unknown';
  visibilityKm: number;
  temperatureC: number;
  ceilingM: number | null;
  quality: 'fresh' | 'delayed' | 'stale' | 'missing';
}
```

### 5.2 Entscheidungsbaum

```
if Daten fehlen oder veraltet oder unsicher:
    -> keine belastbare Entscheidung
else if ein harter Grenzwert verletzt:
    -> nicht möglich
else if ein weicher Grenzwert nahe Limit oder Einschränkung:
    -> eingeschränkt
else:
    -> möglich

Danach Gesamtfreigabe:
  Wetter OK
  AND Luftraum/Genehmigung gültig
  AND Route/Korridor frei
  AND Energie/Reserve ausreichend
  AND Nutzlast/Gewicht zulässig
  AND Station/Fach verfügbar
  AND Sicherheitscheck abgeschlossen
```

Wichtig: Die Wetterbewertung darf keine positive Gesamtfreigabe erzeugen, wenn
eine andere Prüfung fehlschlägt. Veraltete Daten führen nie zu "möglich".

### 5.3 Datenqualität

Jede Anzeige führt Quelle, Abrufzeit, Gültigkeit, räumliche Auflösung und
Datenalter. Beobachtung und Vorhersage werden unterschieden. Das UI zeigt das
Alter und den Zustand, nicht nur ein Symbol.

## 6. Datenmodelle

```ts
type WeatherDecision = 'go' | 'restricted' | 'no_go' | 'unknown';
type MissionState =
  | 'planned' | 'checking' | 'authorized' | 'held'
  | 'enroute' | 'arriving' | 'returning' | 'completed' | 'aborted';

type StationState = 'open' | 'busy' | 'degraded' | 'closed';

interface Station {
  id: string;
  name: string;
  district: string;
  state: StationState;
  lockersTotal: number;
  lockersFree: number;
  landingPads: number;
  chargingBays: number;
  chargingFree: number;
  weatherDecision: WeatherDecision;
  note: string;
}

interface Mission {
  id: string;
  droneId: string;
  fromStationId: string;
  toStationId: string;
  state: MissionState;
  altitudeBandM: [number, number];
  distanceKm: number;
  payloadKg: number;
  batteryPct: number;
  reservePct: number;
  eta: string;
  weatherDecision: WeatherDecision;
  releaseReasons: string[];
  orderIds: string[];
}

interface DeliveryOrder {
  id: string;
  missionId: string;
  recipientLabel: string;
  stationId: string;
  state: 'confirmed' | 'in_transit' | 'at_station' | 'picked_up' | 'exception';
  window: { start: string; end: string; confidence: 'high' | 'medium' | 'low' };
  locker: string;
  pickupCode: string;
  coldChain: boolean;
}
```

Der Prototyp hält diese Daten in `app/src/data/demo.ts`. Die Typen liegen in
`app/src/data/types.ts`.

## 7. Schnittstellen

Geplante Schnittstellen, nicht implementiert:

| Schnittstelle | Zweck | Format |
|---|---|---|
| `GET /api/network/overview` | Lagebild | JSON |
| `GET /api/missions` | Missionen und Status | JSON |
| `POST /api/missions/:id/release` | Freigabe mit Begründung | JSON, idempotent |
| `POST /api/missions/:id/hold` | Zurückhalten | JSON |
| `GET /api/stations` | Kapazität und Zustand | JSON |
| `POST /api/stations/:id/locker/open` | Abholung | authentifiziert |
| `GET /api/weather/decision` | Wetterentscheidung je Standort | JSON |
| `WS /ws/telemetry` | Position, Link, Sequenz | Binär/JSON |
| `GET /api/audit` | Entscheidungen und Übergaben | JSON |

Regeln: Server-Zeit ist maßgeblich. Kommandos sind idempotent. Sicherheitsrelevante
Aktionen werden nie optimistisch als ausgeführt dargestellt.

## 8. Sicherheitsmechanismen und Fehlerbehandlung

- Rollen und Berechtigungen: Empfänger, Stationsbetrieb, Leitstelle, Wartung,
  Audit. Keine Rechteableitung aus der sichtbaren Route.
- Zwei-Schritt-Bestätigung für Zurückhalten, Abbruch und Rückkehr.
- Keine automatische Freigabe bei fehlenden oder veralteten Daten.
- Getrennte Anzeige von Beobachtung, Vorhersage und Unsicherheit.
- Link-Verlust: letzte bekannte Position, Zeitstempel, definierter Notfallpfad.
- Stationsausfall: Ausweichstation, Rückhalt oder Rückkehr.
- Blockierte Landefläche: Annäherung abbrechen, Ausweichlandung.
- Volle Fächer: keine Annahme oder Umleitung.
- Jede Entscheidung mit Akteur, Zeit, Grund und Ergebnis protokollieren.
- Keine Kundendaten auf gemeinsamen Leitstellenwänden.

## 9. Technische Entscheidungen

| Datum | Entscheidung | Begründung |
|---|---|---|
| 2026-10-21 | React + TypeScript + Vite | Schneller, typisierter Prototyp ohne Backend |
| 2026-10-21 | Keine UI-Bibliothek | Volle Kontrolle über Tokens, Dichte und Zugänglichkeit |
| 2026-10-21 | Lokale Demo-Daten und Zustandslogik | Reproduzierbar, offline, klar als Demo erkennbar |
| 2026-10-21 | Ein Token-Layer, zwei Dichten | Leitstelle dicht, Empfänger ruhig, gleiche Semantik |
| 2026-10-21 | SVG statt Kartenbibliothek | Kein API-Key, keine Netzabhängigkeit, prüfbare Geometrie |
| 2026-10-21 | Keine 3D-Darstellung | Für Entscheidungen nicht nötig, erhöht Scheinpräzision |
| 2026-10-21 | Vier Wetterzustände | Fehlende Daten brauchen einen eigenen Zustand |

## 10. Umsetzungsstand und Grenzen

Umgesetzt:

- React-Oberfläche mit Leitstellen-, Stations- und Empfängeransicht.
- Netzlagebild mit Korridoren, Stationen und Missionen als SVG.
- Flugfreigabe mit vier Wetterzuständen und Begründungen.
- Stationskapazität, Ladezustand, Fächer und Ausfälle.
- Missionsliste mit Filter und Detailauswahl.
- Empfängersicht mit Zeitfenster, Abholcode und Ausweichstation.
- Mobile-First-Layout, Theme-Umschaltung, reduzierte Bewegung.
- Build-Prüfung mit `npm run build`.

Nicht umgesetzt:

- Backend, Authentifizierung, Datenbank.
- echte Wetter-, Luftraum- oder Telemetriequellen.
- Drohnensteuerung, Flugfreigabe im Rechtssinn, Zertifizierung.
- Lärmmessung, Verkehrsmodell, Wirtschaftlichkeitsrechnung.
- Karten-Geodaten und genehmigte Korridore.

Grenzen:

- Alle Werte sind Demodaten.
- Die Freigabelogik ist eine Produktlogik, keine regulatorische Entscheidung.
- Das Höhenmodell ist eine Arbeitshypothese.
- Der Prototyp beweist weder Sicherheit noch Umweltentlastung.
