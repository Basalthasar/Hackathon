import { useEffect, useState } from 'react';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { drones, findDestination, storeById } from '../data/demo';
import type { Drone, Order, OrderStatus } from '../data/types';
import { euro, km, weightKg } from '../lib/format';
import { decisionLabel, deliveryStatusLabel, methodLabel, orderStatusLabel } from '../lib/labels';

const orderTone: Record<OrderStatus, 'ok' | 'warn' | 'bad' | 'info' | 'mute'> = {
  PENDING: 'warn',
  CONFIRMED: 'info',
  FULFILLING: 'info',
  READY: 'ok',
  IN_TRANSIT: 'info',
  ARRIVED: 'warn',
  DELIVERED: 'ok',
  REJECTED: 'bad',
  CANCELLED: 'bad',
  EXPIRED: 'mute',
};

const droneTone: Record<Drone['state'], 'ok' | 'info' | 'warn' | 'bad'> = {
  ready: 'ok',
  flying: 'info',
  charging: 'warn',
  grounded: 'bad',
};

export function FleetView({
  orders,
  onArrive,
  onNotify,
}: {
  orders: Order[];
  onArrive: (id: string) => void;
  onNotify: (message: string) => void;
}) {
  const droneOrders = orders.filter((order) => order.droneId && !['REJECTED', 'CANCELLED', 'EXPIRED'].includes(order.status));
  const ready = drones.filter((drone) => drone.state === 'ready');
  const active = droneOrders.filter((order) => ['READY', 'IN_TRANSIT', 'ARRIVED'].includes(order.status));
  const lowestBattery = Math.min(...drones.map((drone) => drone.batteryPct));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="FlyToYou · Flugbetrieb"
        title="Drohnenflotte"
        description="Drohnen sind das primäre Transportmittel. Die gezeigten Nutzlast- und Reichweitenwerte (25 kg, 60 kg, 30 km) sind illustrative Annahmen des Prototyps, keine belegten Betriebsgrenzen. Jede Mission braucht Wetter-, Energie- und Zielprüfung. Der Start erfolgt frühestens 30 bis 60 Sekunden nach Bestellung."
        actions={<Badge tone="warn">Wetterbewertung unbestimmt</Badge>}
      />

      <div className="metrics">
        <div className="metric"><span className="metric-value mono">{drones.length}</span><span className="metric-label">Drohnen</span><span className="metric-note">Demo-Flotte</span></div>
        <div className="metric"><span className="metric-value mono">{ready.length}</span><span className="metric-label">Startbereit</span><span className="metric-note">Batterie und Wartung ok</span></div>
        <div className="metric"><span className="metric-value mono">{active.length}</span><span className="metric-label">Aktive Missionen</span><span className="metric-note">abholbereit oder im Flug</span></div>
        <div className="metric"><span className="metric-value mono">{lowestBattery} %</span><span className="metric-label">Niedrigste Batterie</span><span className="metric-note">Reserveprüfung vor Start</span></div>
        <div className="metric"><span className="metric-value mono">60 kg</span><span className="metric-label">Max. Nutzlast</span><span className="metric-note">Schwerlast-Drohne H60</span></div>
      </div>

      <div className="fleet-layout">
        <section className="panel span-8" aria-labelledby="fleet-missions-title">
          <header>
            <div>
              <h2 id="fleet-missions-title">Missionen</h2>
              <p className="muted">Drohnenroute vom Händler zur Abgabestelle. Keine erfundene Live-Position.</p>
            </div>
            <Badge tone="info">{droneOrders.length} mit Drohne</Badge>
          </header>

          <div className="mission-cards">
            {droneOrders.map((order) => {
              const store = storeById(order.storeId);
              const destination = findDestination(order.address);
              const drone = drones.find((item) => item.id === order.droneId);
              return (
                <article key={order.id} className="drone-mission">
                  <header className="drone-mission-head">
                    <div>
                      <span className="mono">{order.id}</span>
                      <span className="muted small">{drone?.id} · {drone?.model} · {methodLabel[order.quote.method ?? 'drone']}</span>
                    </div>
                    <Badge tone={orderTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
                  </header>
                  <div className="drone-route">
                    <div><Icon name="store" size={16} /><span><strong>Start</strong>{store?.name}<span className="muted small">{store?.address}</span></span></div>
                    <div><Icon name="pin" size={16} /><span><strong>Abgabestelle</strong>{order.address}<span className="muted small">{destination.district} · direkte Zustellung</span></span></div>
                  </div>
                  <div className="drone-metrics">
                    <span><Icon name="package" size={14} /> {weightKg(order.quote.payloadKg)}</span>
                    <span><Icon name="route" size={14} /> {km(order.quote.distanceKm)}</span>
                    <span><Icon name="layers" size={14} /> {order.quote.altitudeBandM?.join(' bis ') ?? 'offen'} m (illustrativ)</span>
                    <span><Icon name="battery" size={14} /> {drone?.batteryPct ?? 'offen'} %</span>
                    <span><Icon name="shield" size={14} /> Wetter {order.quote.weather ? decisionLabel[order.quote.weather] : 'offen'}</span>
                    <span><Icon name="card" size={14} /> {euro(order.quote.totalMinor)}</span>
                  </div>
                  <div className="drone-mission-actions">
                    {order.status === 'READY' && order.merchantTask !== 'HANDED_OVER' ? (
                      <span className="muted small">Wartet auf Händlerübergabe und Beladung.</span>
                    ) : null}
                    {order.status === 'READY' && order.merchantTask === 'HANDED_OVER' ? (
                      Math.max(0, Math.ceil((order.droneDepartAt - now) / 1000)) > 0 ? (
                        <Badge tone="warn">
                          Erwarteter Start in {Math.max(0, Math.ceil((order.droneDepartAt - now) / 1000))} Sekunden
                        </Badge>
                      ) : (
                        <Badge tone="info">Start wird ausgelöst</Badge>
                      )
                    ) : null}
                    {order.status === 'IN_TRANSIT' ? (
                      <button type="button" className="btn btn-primary" onClick={() => { onArrive(order.id); onNotify(`Ankunft für ${order.id} bestätigt. Empfang bleibt offen.`); }}>
                        <Icon name="check" size={16} /> Ankunft bestätigen
                      </button>
                    ) : null}
                    {order.status === 'ARRIVED' ? (
                      <span className="muted small">
                        Angekommen. Übergabe und Empfang offen; der Abschluss erfolgt nur über den Empfangscode des Kunden.
                      </span>
                    ) : null}
                    {order.status === 'PENDING' || order.status === 'CONFIRMED' || order.status === 'FULFILLING' ? (
                      <span className="muted small">Wartet auf Händlerfreigabe und Beladung.</span>
                    ) : null}
                    <span className="muted small">{deliveryStatusLabel[order.deliveryStatus]}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="panel span-4" aria-labelledby="drone-fleet-title">
          <header>
            <div>
              <h2 id="drone-fleet-title">Flotte</h2>
              <p className="muted">Batterie, Nutzlast und Status.</p>
            </div>
          </header>
          <div className="drone-list">
            {drones.map((drone) => (
              <div key={drone.id} className="drone-card">
                <div className="drone-card-head">
                  <span className="mono">{drone.id}</span>
                  <Badge tone={droneTone[drone.state]}>
                    {drone.state === 'ready' ? 'Bereit' : drone.state === 'flying' ? 'Im Flug' : drone.state === 'charging' ? 'Lädt' : 'Gegroundet'}
                  </Badge>
                </div>
                <strong>{drone.model}</strong>
                <span className="muted small">{drone.note}</span>
                <div className="drone-battery">
                  <span className="meter" role="img" aria-label={`Batterie ${drone.batteryPct} Prozent`}>
                    <span style={{ inlineSize: `${drone.batteryPct}%` }} />
                  </span>
                  <span className="mono small">{drone.batteryPct} % · Reserve {drone.reservePct} %</span>
                </div>
                <div className="drone-facts">
                  <span>max. {drone.maxPayloadKg} kg</span>
                  <span>{drone.maxRangeKm} km Reichweite</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="panel span-12" aria-labelledby="drone-weather-title">
          <header>
            <div>
              <h2 id="drone-weather-title">Flugwetter und Freigabegrenzen</h2>
              <p className="muted">Wetter ist eine von mehreren Bedingungen. Ohne Datenquelle, Messhöhe, Zeitfenster und belegte Fahrzeuggrenzen gibt es keine positive Freigabe.</p>
            </div>
            <Badge tone="warn">Bewertung {decisionLabel.unknown}</Badge>
          </header>
          <div className="weather-grid">
            <div><span className="eyebrow">Wind</span><strong className="mono">6,4 m/s</strong><span className="muted small">Annahmewert 12,0 m/s (illustrativ)</span></div>
            <div><span className="eyebrow">Böen</span><strong className="mono">9,2 m/s</strong><span className="muted small">Reserve 2,8 m/s (illustrativ)</span></div>
            <div><span className="eyebrow">Sicht</span><strong className="mono">8,0 km</strong><span className="muted small">Annahmewert 2,0 km (illustrativ)</span></div>
            <div><span className="eyebrow">Niederschlag</span><strong>Keiner</strong><span className="muted small">feste Demo-Eingabe, keine Messung</span></div>
            <div><span className="eyebrow">Temperatur</span><strong className="mono">13,4 °C</strong><span className="muted small">feste Demo-Eingabe, keine Messung</span></div>
            <div><span className="eyebrow">Datenalter</span><strong className="mono">42 s</strong><span className="muted small">konstant, simuliert, keine Quelle</span></div>
          </div>
          <div className="notice notice-warn">
            <Icon name="alert" size={16} />
            <span>Diese Werte sind fest eingetragen. Es gibt keine Datenquelle, keine Messhöhe und kein Missionsfenster. Deshalb bleibt die reale Bewertung unbestimmt.</span>
          </div>
          <div className="notice">
            <Icon name="info" size={16} />
            <span>
              <strong>Ausdrücklich simuliertes Szenario:</strong> mit diesen Beispielwerten und vollständigen
              Pflichtdaten wäre eine Freigabe denkbar. Das ist eine getroffene Annahme für die Demo,
              kein Nachweis und keine belastbare Grenze.
            </span>
          </div>
          <div className="notice notice-warn">
            <Icon name="alert" size={16} />
            <span>Höhere Ebenen sind nicht automatisch leiser oder schneller. Lärm, Abstände, Kreuzungen und Regulatorik bleiben eigene Prüfungen.</span>
          </div>
        </section>
      </div>
    </>
  );
}
