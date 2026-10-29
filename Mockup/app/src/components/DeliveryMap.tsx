import { useEffect, useMemo, useState } from 'react';
import L from 'leaflet';
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import type { Destination, Quote, Store } from '../data/types';
import { km, weightKg } from '../lib/format';
import 'leaflet/dist/leaflet.css';

function FitRoute({ store, destination }: { store: Store; destination: Destination }) {
  const map = useMap();
  useEffect(() => {
    const bounds = L.latLngBounds(
      [store.lat, store.lon],
      [destination.lat, destination.lon],
    );
    map.fitBounds(bounds, { padding: [42, 42], maxZoom: 15 });
  }, [destination.lat, destination.lon, map, store.lat, store.lon]);
  return null;
}

const pinIcon = (kind: 'store' | 'target' | 'drone', label: string) => L.divIcon({
  className: 'map-div-icon',
  html: `<span class="map-pin map-pin-${kind}" title="${label}"><span class="map-pin-dot"></span></span>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

export function DeliveryMap({
  store,
  destination,
  quote,
  phase = 'preview',
  departAt,
}: {
  store: Store;
  destination: Destination;
  quote: Quote;
  phase?: 'preview' | 'waiting' | 'flying' | 'landed';
  departAt?: number;
}) {
  const [progress, setProgress] = useState(0.02);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const clock = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(clock);
  }, []);

  useEffect(() => {
    if (phase === 'landed') {
      setProgress(0.98);
      return;
    }
    if (phase !== 'flying') {
      setProgress(0.02);
      return;
    }
    const timer = window.setInterval(() => {
      setProgress((value) => (value >= 0.98 ? 0.05 : value + 0.012));
    }, 180);
    return () => window.clearInterval(timer);
  }, [phase, store.id, destination.id]);

  const dronePosition = useMemo<[number, number]>(() => [
    store.lat + (destination.lat - store.lat) * progress,
    store.lon + (destination.lon - store.lon) * progress,
  ], [destination.lat, destination.lon, progress, store.lat, store.lon]);

  const inside = quote.distanceKm <= store.deliveryRadiusKm;
  const isGround = quote.method === 'car' || quote.method === 'bicycle' || quote.method === 'scooter';
  const unitLabel = quote.droneId ?? quote.groundUnitId ?? (isGround ? 'Bodenfall' : 'Drohne');
  const secondsLeft = departAt ? Math.max(0, Math.ceil((departAt - now) / 1000)) : 0;
  const phaseLabel = phase === 'preview'
    ? 'Vorschau · Start erst nach Bestellung'
    : phase === 'waiting'
      ? secondsLeft > 0 ? `Drohne wartet · erwarteter Start in ${secondsLeft} Sekunden` : 'Start nach Freigabe'
      : phase === 'landed'
        ? isGround ? 'Simuliertes Fahrzeug am Ziel' : 'Drohne am Ziel'
        : isGround ? 'Simuliertes Fahrzeug unterwegs' : 'Drohne simuliert im Flug';
  const icons = useMemo(() => ({
    store: pinIcon('store', store.name),
    target: pinIcon('target', destination.label),
    drone: pinIcon('drone', isGround ? 'Simuliertes Fahrzeug' : 'Simulierte Drohne'),
  }), [destination.label, isGround, store.name]);

  return (
    <div className="delivery-map">
      <div className="osm-map" role="group" aria-label={`OpenStreetMap-Karte: ${isGround ? 'Fahrtroute' : 'Drohnenroute'} von ${store.name} zu ${destination.label}`}>
        <MapContainer
          key={`${store.id}-${destination.id}`}
          bounds={[[store.lat, store.lon], [destination.lat, destination.lon]]}
          boundsOptions={{ padding: [42, 42], maxZoom: 15 }}
          scrollWheelZoom={false}
          className="osm-map-canvas"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitRoute store={store} destination={destination} />
          <Circle
            center={[store.lat, store.lon]}
            radius={store.deliveryRadiusKm * 1000}
            pathOptions={{ color: 'var(--action-primary)', weight: 1.5, opacity: 0.55, fillOpacity: 0.04, dashArray: '8 7' }}
          />
          <Polyline
            positions={[[store.lat, store.lon], [destination.lat, destination.lon]]}
            pathOptions={{ color: inside ? 'var(--ok)' : 'var(--bad)', weight: 4, opacity: 0.9, dashArray: '10 8' }}
          />
          <Marker position={[store.lat, store.lon]} icon={icons.store}>
            <Popup><strong>{store.name}</strong><br />Startpunkt, {store.address}</Popup>
          </Marker>
          <Marker position={[destination.lat, destination.lon]} icon={icons.target}>
            <Popup><strong>Abgabestelle</strong><br />{destination.label}</Popup>
          </Marker>
          <Marker position={dronePosition} icon={icons.drone}>
            <Popup><strong>{isGround ? 'Simuliertes Fahrzeug' : 'Simulierte Drohne'}</strong><br />{unitLabel} · {km(quote.distanceKm)} · {weightKg(quote.payloadKg)}</Popup>
          </Marker>
        </MapContainer>
        <div className="osm-overlay">
          <span className="osm-live"><span className="pulse-dot" aria-hidden="true" /> {phaseLabel}</span>
          <span>OpenStreetMap · keine Live-Position</span>
        </div>
      </div>

      <div className="distance-card">
        <div>
          <span className="eyebrow">{isGround ? 'Fahrtstrecke' : 'Drohnenstrecke'}</span>
          <strong className="mono">{km(quote.distanceKm)}</strong>
          <span className="muted small">{store.name} zu {destination.label}</span>
        </div>
        <div>
          <span className="eyebrow">Nutzlast</span>
          <strong className="mono">{weightKg(quote.payloadKg)}</strong>
          <span className="muted small">
            {isGround
              ? `${unitLabel} · Kapazität illustrativ`
              : `${quote.droneId ?? 'Drohne offen'} · Klasse bis ${quote.method === 'heavy_drone' ? '60 kg' : '25 kg'} (illustrativ)`}
          </span>
        </div>
        <div>
          <span className="eyebrow">{isGround ? 'Höhenprofil' : 'Flugprofil'}</span>
          <strong className="mono">{quote.altitudeBandM?.join(' bis ') ?? 'nicht relevant'} {quote.altitudeBandM ? 'm' : ''}</strong>
          <span className="muted small">Kosten siehe Aufschlüsselung. Karte und Bewegung sind simuliert.</span>
        </div>
      </div>
    </div>
  );
}
