# Architektur - FlyToYou

Stand: 2026-10-21
Status: React-Prototyp mit Demodaten. Keine echte Flug-, Zahlungs- oder
Bestandssteuerung. Die Karte nutzt OpenStreetMap, die Drohnenbewegung ist
simuliert.

## 1. Systemüberblick

```
Kundenoberfläche
  Suche -> Angebot -> Warenkorb -> Checkout -> Bestellverfolgung
      |                |              |
      v                v              v
  Katalog/Bestand   Preislogik     Auftrag/Status
      |                |              |
      +----------------+--------------+
                       |
        +--------------+--------------+
        |              |              |
   Händleransicht  Flottenansicht  Betriebsansicht
        |              |              |
   Vorbereitung    Drohne/Start    Zuweisung/Ausnahmen
                       |
                 OSM-Karte + Simulation
```

Der Prototyp läuft vollständig im Browser. Es gibt keine API, Datenbank,
Authentifizierung oder Telemetrie. Die Zustandslogik simuliert das spätere
Backend.

## 2. Module

| Modul | Verantwortung | Umsetzung |
|---|---|---|
| Katalog | Produkte, Kategorien, Angebote | `app/src/data/demo.ts` |
| Bestand | Verfügbarkeit, Qualität, Zeitstempel | Demo-Daten |
| Preis | Basis, Distanz, Gewicht, Service | `app/src/lib/pricing.ts` |
| Karte | OSM, Route, Radius, simulierte Drohne | `app/src/components/DeliveryMap.tsx` |
| Bestellung | Warenkorb, Checkout, Status | `app/src/App.tsx` |
| Händler | Arbeitsliste, Vorbereitung, Übergabe | `app/src/views/MerchantView.tsx` |
| Flotte | Drohnen, Missionen, Startfenster, Landung | `app/src/views/FleetView.tsx` |
| Betrieb | Zuweisung, Zahlungen, Ausnahmen | `app/src/views/OpsView.tsx` |
| Kunde | Suche, Checkout, Tracking | `app/src/views/CustomerView.tsx` |

## 3. Datenmodell

```ts
interface Store {
  id: string;
  merchantId: string;
  name: string;
  district: string;
  address: string;
  status: 'open' | 'closed' | 'paused';
  prepMinutes: number;
  distanceKm: number;
  pickupHours: string;
  deliveryRadiusKm: number;
  x: number;
  y: number;
  lat: number;
  lon: number;
  note: string;
}

interface Destination {
  id: string;
  label: string;
  district: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
}

interface Drone {
  id: string;
  model: string;
  maxPayloadKg: number;
  maxRangeKm: number;
  batteryPct: number;
  reservePct: number;
  state: 'ready' | 'flying' | 'charging' | 'grounded';
  note: string;
}

interface Quote {
  itemsSubtotalMinor: number;
  payloadKg: number;
  weightFeeMinor: number;
  droneId: string | null;
  altitudeBandM: [number, number] | null;
  weather: 'go' | 'restricted' | 'no_go' | 'unknown' | null;
  distanceKm: number;
  baseFeeMinor: number;
  distanceFeeMinor: number;
  perKmFeeMinor: number;
  deliveryFeeMinor: number;
  serviceFeeMinor: number;
  totalMinor: number;
  etaFromMinutes: number;
  etaToMinutes: number;
  method: 'drone' | 'heavy_drone' | 'car' | 'bicycle' | 'scooter' | null;
  methodPolicy: string;
  validUntil: number;
  isDemo: true;
}

interface Order {
  id: string;
  customerId: string;
  storeId: string;
  status: OrderStatus;
  merchantTask: MerchantTaskStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  fulfillment: 'delivery' | 'pickup';
  service: 'standard' | 'express';
  lines: OrderLine[];
  quote: Quote;
  address: string;
  droneId: string | null;
  droneDepartAt: number;
  pickupCode: string;
  deliveryCode: string;
  timeline: TimelineEntry[];
}
```

Geld wird in Cent als Integer gespeichert. Zeitpunkte werden als UTC beziehungsweise
als absolute Millisekunden geführt und in der Oberfläche lokal formatiert.

## 4. Zustände

| Bereich | Ablauf | Abweichungen |
|---|---|---|
| Bestellung | PENDING -> CONFIRMED -> FULFILLING -> READY -> IN_TRANSIT -> DELIVERED | REJECTED, CANCELLED, EXPIRED |
| Vorbereitung | NEW -> ACCEPTED -> PICKING -> READY -> HANDED_OVER | REJECTED |
| Zahlung | PENDING -> AUTHORIZED -> CAPTURED | FAILED, VOIDED, REFUNDED |
| Lieferung | NONE/UNASSIGNED -> ASSIGNED -> PICKED_UP -> IN_TRANSIT -> DELIVERED | FAILED |

Der Status wird nicht frei gesetzt. Die UI leitet ihn aus den Übergängen ab.
Der Kundenstatus ist eine verständliche Zusammenfassung, nicht ein einzelnes
Boolean.

## 5. Preislogik

```
Basisgebühr = je Transportart
Distanzkosten = distanceKm × perKmFee
Gewichtszuschlag = max(0, payloadKg - 5) × 0,25 €
Service = Express ? 2,50 € : 0
Gesamt = Warenwert + Basisgebühr + Distanzkosten + Gewichtszuschlag + Service
```

Transportauswahl:

1. Drohne D25, wenn Nutzlast ≤ 25 kg und Reichweite ≤ 18 km.
2. Schwerlast-Drohne H60, wenn Nutzlast ≤ 60 kg und Reichweite ≤ 30 km.
3. Auto als Bodenfall bis 80 kg.

Die Distanz wird im Prototyp aus den schematischen Koordinaten der Filiale und
der Abgabestelle berechnet. In einem echten System kommen Geocoding und Routing
hinzu. Die Kostenaufschlüsselung zeigt nur Kostenzeilen; Distanz und Gewicht
stehen als Zahl in der verursachenden Zeile.

## 6. Karte und Bewegung

- OpenStreetMap-Kacheln mit Attribution.
- Marker für Start und Abgabestelle.
- Polyline als geplante Route.
- Kreis für den Lieferradius.
- Drohnenmarker mit interpolierter Position.
- Phasen:
  - `preview`: vor Bestellaufgabe, statisch.
  - `waiting`: nach Bestellung, wartet auf erwarteten Start.
  - `flying`: Bewegung simuliert, nur bei Status IN_TRANSIT.
  - `landed`: Marker an der Abgabestelle, Status DELIVERED.
- Keine Live-Position, keine Telemetrie, keine Flugsteuerung.

## 7. Startdelay

Nach der Bestellaufgabe wird `droneDepartAt` gesetzt:

```
droneDepartAt = now + random(30, 60) Sekunden
```

Die Drohne startet nur, wenn:

1. die Bestellung den Status `READY` hat,
2. der Händler die Ware übergeben hat (`merchantTask = HANDED_OVER`),
3. `Date.now() >= droneDepartAt`.

Ein Intervall in `App.tsx` prüft dies jede Sekunde und setzt den Status auf
`IN_TRANSIT`, die Lieferung auf `IN_TRANSIT` und ergänzt die Statusfolge. Das ist
die Simulation einer Backend-Aufgabe. Vorher zeigen Karte und Bestellverfolgung
„erwarteter Start in X Sekunden“ und bewegen die Drohne nicht.

## 8. Schnittstellen (geplant)

| Methode/Pfad | Zweck |
|---|---|
| `GET /api/catalog/search` | Angebote suchen |
| `POST /api/quotes` | Preis, Distanz, Gewicht, ETA berechnen |
| `POST /api/checkout` | Bestellung idempotent anlegen |
| `GET /api/orders/:id` | Bestellung und Statusfolge |
| `POST /api/merchant/orders/:id/accept` | Händlerannahme |
| `POST /api/merchant/orders/:id/ready` | Abholbereit melden |
| `POST /api/orders/:id/handover` | Übergabe an Drohne |
| `POST /api/fleet/missions/:id/land` | Landung bestätigen |
| `POST /api/ops/jobs/:id/assign-drone` | Drohne zuweisen |
| `GET /api/orders/:id/map` | Route, Abgabestelle, Distanz |

Der Server berechnet Preise, Distanz und Status. Der Browser übermittelt
Absichten, keine verbindlichen Preise oder Statuswerte.

## 9. Sicherheit und Datenschutz

- Rollen: Kunde, Händler/Apotheke, Flugbetrieb, Betrieb.
- Kunden sehen nur eigene Bestellungen; der Prototyp filtert über `customerId`.
- Zugangs- und Empfangscodes sind einmalig und getrennt.
- Adressen und Kontaktdaten nur für den zugewiesenen Auftrag.
- Keine Zahlungsdaten im Browser; im echten Betrieb über Dienstleister.
- Keine Kamera-, Telemetrie- oder Standortdaten ohne Zweck und Einwilligung.
- Rezeptpflichtige Arzneimittel sind im Pilot nicht buchbar.

## 10. Umsetzungsstand und Grenzen

Umgesetzt:

- React/TypeScript/Vite-Oberfläche.
- Suche, Angebote, Warenkorb, Checkout, Tracking.
- Drohnenzentrierte Preislogik mit Distanz und Gewicht.
- OSM-Karte mit simulierter Bewegung.
- 30-60-Sekunden-Startdelay in der Zustandslogik.
- Händler-, Flotten- und Betriebsansicht.
- Apotheke und erweiterte Mockdaten.
- Sieben vollständige Bestellungen im Demo-Kundenkonto.
- Händlerauswahl nach Merchant; die Arbeitsliste ist auf den Demo-Kunden gefiltert.
- Gemeinsamer Order-State: Händleraktionen aktualisieren die Kundenverfolgung unmittelbar.

Nicht umgesetzt:

- Backend, Datenbank, Authentifizierung.
- echte Zahlung, Bestandsanbindung, Routing, Telemetrie.
- echte Flugfreigabe, Zertifizierung, Drohnensteuerung.
- Benachrichtigungen, Bewertungen, Support, Rückerstattungen.

Grenzen:

- Alle Werte sind Demodaten.
- OSM-Kacheln benötigen eine Internetverbindung.
- Die Drohnenbewegung ist eine Simulation, keine Live-Position.
- Die Preis- und Statuslogik ist Produktlogik, keine Betriebs- oder
  Rechtsfreigabe.
