import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ReceiptCode } from '../components/ReceiptCode';
import { drones, groundUnits, inventoryIssues, storeById } from '../data/demo';
import type { InventoryIssue, Order, OrderStatus } from '../data/types';
import { euro } from '../lib/format';
import {
  deliveryStatusLabel,
  fulfillmentLabel,
  methodLabel,
  orderStatusLabel,
  paymentStatusLabel,
} from '../lib/labels';

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

const issueTone: Record<InventoryIssue['severity'], 'bad' | 'warn' | 'info'> = {
  critical: 'bad',
  caution: 'warn',
  info: 'info',
};

export function OpsView({
  orders,
  onAssignDrone,
  onAssignGroundUnit,
  onArrive,
  onConfirmReceipt,
  onCancel,
  onNotify,
}: {
  orders: Order[];
  onAssignDrone: (orderId: string, droneId: string) => void;
  onAssignGroundUnit: (orderId: string, unitId: string) => void;
  onArrive: (id: string) => void;
  onConfirmReceipt: (id: string, code: string) => boolean;
  onCancel: (id: string) => void;
  onNotify: (message: string) => void;
}) {
  const openOrders = orders.filter((order) => !['DELIVERED', 'REJECTED', 'CANCELLED', 'EXPIRED'].includes(order.status));
  const droneMissions = orders.filter((order) => order.droneId && order.fulfillment === 'delivery');
  const unassigned = droneMissions.filter((order) => order.status === 'READY' && !order.droneId);
  const readyDrones = drones.filter((drone) => drone.state === 'ready');
  const pendingPayment = orders.filter((order) => order.paymentStatus === 'PENDING' || order.paymentStatus === 'AUTHORIZED');
  const criticalIssues = inventoryIssues.filter((issue) => issue.severity === 'critical');

  const assignable = (order: Order, droneId: string) => {
    const drone = drones.find((item) => item.id === droneId);
    if (!drone || drone.state === 'grounded') return false;
    return drone.maxPayloadKg >= (order.quote.payloadKg || 0) && drone.maxRangeKm >= order.quote.distanceKm;
  };

  return (
    <>
      <PageHeader
        eyebrow="FlyToYou · Betrieb"
        title="Betrieb und Ausnahmen"
        description="Drohnenmissionen, Zuweisung, offene Zahlungen, Bestandsqualität und Zielausnahmen. Manuelle Eingriffe sind protokolliert."
        actions={
          <button type="button" className="btn btn-secondary" onClick={() => onNotify('Betriebsbericht ist im Prototyp simuliert. Keine echten Partnerdaten.')}>
            <Icon name="receipt" size={16} /> Tagesbericht
          </button>
        }
      />

      <div className="metrics">
        <div className="metric"><span className="metric-value mono">{openOrders.length}</span><span className="metric-label">Offene Bestellungen</span><span className="metric-note">nicht abgeschlossen</span></div>
        <div className="metric"><span className="metric-value mono">{droneMissions.length}</span><span className="metric-label">Drohnenmissionen</span><span className="metric-note">Lieferaufträge mit Drohne</span></div>
        <div className="metric"><span className="metric-value mono">{readyDrones.length} / {drones.length}</span><span className="metric-label">Drohnen startbereit</span><span className="metric-note">Batterie und Wartung</span></div>
        <div className="metric"><span className="metric-value mono">{criticalIssues.length}</span><span className="metric-label">Kritische Ausnahmen</span><span className="metric-note">Bestand, Ziel oder Wetter</span></div>
        <div className="metric metric-muted"><span className="metric-value">n. v.</span><span className="metric-label">Deckungsbeitrag</span><span className="metric-note">nicht gemessen, keine Scheinkennzahl</span></div>
      </div>

      <div className="ops-layout">
        <section className="panel span-8" aria-labelledby="ops-orders-title">
          <header>
            <div>
              <h2 id="ops-orders-title">Bestellungen und Drohnen</h2>
              <p className="muted">Status, Zahlung, Lieferung und Drohnenzuweisung getrennt.</p>
            </div>
            <Badge tone="info">{orders.length} gesamt</Badge>
          </header>
          <div className="table-scroll">
            <table>
              <caption className="sr-only">Bestellungen mit Status, Zahlung, Lieferung und Drohnenaktionen</caption>
              <thead>
                <tr>
                  <th scope="col">Bestellung</th>
                  <th scope="col">Filiale</th>
                  <th scope="col">Status</th>
                  <th scope="col">Zahlung</th>
                  <th scope="col">Lieferung</th>
                  <th scope="col">Transport</th>
                  <th scope="col" className="end">Gesamt</th>
                  <th scope="col">Aktion</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <th scope="row" className="mono">{order.id}</th>
                    <td>{storeById(order.storeId)?.name}</td>
                    <td><Badge tone={orderTone[order.status]}>{orderStatusLabel[order.status]}</Badge></td>
                    <td><span className="muted small">{paymentStatusLabel[order.paymentStatus]}</span></td>
                    <td><span className="muted small">{fulfillmentLabel[order.fulfillment]} · {deliveryStatusLabel[order.deliveryStatus]}</span></td>
                    <td>
                      {order.droneId ? (
                        <span className="small">{drones.find((drone) => drone.id === order.droneId)?.id} · {drones.find((drone) => drone.id === order.droneId)?.model}</span>
                      ) : order.groundUnitId ? (
                        <span className="small">{order.groundUnitId} · {methodLabel[order.quote.method ?? 'car']}</span>
                      ) : order.fulfillment === 'pickup' ? (
                        <span className="muted small">Selbstabholung</span>
                      ) : (
                        <span className="muted small">offen</span>
                      )}
                    </td>
                    <td className="end mono">{euro(order.quote.totalMinor)}</td>
                    <td>
                      {order.fulfillment === 'delivery' && order.status === 'READY' && !order.droneId && !order.groundUnitId ? (
                        order.quote.method === 'car' ? (
                          <div className="assign-row">
                            {groundUnits.map((unit) => (
                              <button
                                key={unit.id}
                                type="button"
                                className="chip"
                                disabled={unit.state !== 'ready' || unit.maxPayloadKg < order.quote.payloadKg}
                                onClick={() => {
                                  onAssignGroundUnit(order.id, unit.id);
                                  onNotify(`${unit.id} wurde ${order.id} als Bodenfall zugewiesen. Demo.`);
                                }}
                              >
                                <Icon name="route" size={13} /> {unit.id} · Bodenfall
                              </button>
                            ))}
                            <span className="muted small">Keine Drohne trägt {order.quote.payloadKg.toFixed(1).replace('.', ',')} kg. Bodenfall ist der einzige Transportpfad.</span>
                          </div>
                        ) : (
                          <div className="assign-row">
                            {drones.map((drone) => (
                              <button
                                key={drone.id}
                                type="button"
                                className="chip"
                                disabled={!assignable(order, drone.id)}
                                onClick={() => {
                                  onAssignDrone(order.id, drone.id);
                                  onNotify(`${drone.id} wurde ${order.id} zugewiesen. Demo.`);
                                }}
                              >
                                <Icon name="route" size={13} /> {drone.id}
                              </button>
                            ))}
                          </div>
                        )
                      ) : null}
                      {order.status === 'IN_TRANSIT' && !order.droneId ? (
                        <button
                          type="button"
                          className="chip"
                          onClick={() => {
                            onArrive(order.id);
                            onNotify(`Ankunft für ${order.id} gemeldet. Empfang bleibt offen.`);
                          }}
                        >
                          <Icon name="check" size={13} /> Ankunft melden
                        </button>
                      ) : null}
                      {order.status === 'ARRIVED' ? (
                        <ReceiptCode compact onConfirm={(code) => onConfirmReceipt(order.id, code)} />
                      ) : null}
                      {['PENDING', 'CONFIRMED'].includes(order.status) ? (
                        <button type="button" className="chip" onClick={() => onCancel(order.id)}>Storno</button>
                      ) : null}
                      {order.droneId || order.groundUnitId ? (
                        <span className="muted small">
                          {order.address}
                        </span>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="panel span-4" aria-labelledby="ops-issues-title">
          <header>
            <div>
              <h2 id="ops-issues-title">Ausnahmen</h2>
              <p className="muted">Jede Ausnahme hat Grund, Verantwortung und nächsten Schritt.</p>
            </div>
            <Badge tone="bad">{criticalIssues.length} kritisch</Badge>
          </header>
          <div className="issue-list">
            {inventoryIssues.map((issue) => (
              <article key={issue.id} className="issue-item">
                <span className="issue-icon" aria-hidden="true"><Icon name="alert" size={15} /></span>
                <div>
                  <p><strong>{issue.label}</strong></p>
                  <p className="muted small">{issue.detail}</p>
                </div>
                <Badge tone={issueTone[issue.severity]}>{issue.severity === 'critical' ? 'Kritisch' : issue.severity === 'caution' ? 'Prüfen' : 'Info'}</Badge>
              </article>
            ))}
          </div>
        </aside>

        <section className="panel span-6" aria-labelledby="ops-fleet-title">
          <header>
            <div>
              <h2 id="ops-fleet-title">Drohnenflotte</h2>
              <p className="muted">Nutzlast, Reichweite und Batterie bestimmen die Eignung.</p>
            </div>
            <Badge tone="ok">{readyDrones.length} bereit</Badge>
          </header>
          <div className="drone-list">
            {drones.map((drone) => (
              <div key={drone.id} className="drone-card compact">
                <div className="drone-card-head">
                  <span className="mono">{drone.id}</span>
                  <Badge tone={drone.state === 'ready' ? 'ok' : drone.state === 'flying' ? 'info' : drone.state === 'charging' ? 'warn' : 'bad'}>
                    {drone.state === 'ready' ? 'Bereit' : drone.state === 'flying' ? 'Im Flug' : drone.state === 'charging' ? 'Lädt' : 'Gegroundet'}
                  </Badge>
                </div>
                <strong>{drone.model}</strong>
                <span className="muted small">{drone.maxPayloadKg} kg · {drone.maxRangeKm} km · Batterie {drone.batteryPct} %</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel span-6" aria-labelledby="ops-payment-title">
          <header>
            <div>
              <h2 id="ops-payment-title">Zahlungen und Autorisierungen</h2>
              <p className="muted">Zahlungsstatus ist vom Bestellstatus getrennt.</p>
            </div>
            <Badge tone="warn">{pendingPayment.length} offen</Badge>
          </header>
          <div className="payment-list">
            {pendingPayment.map((order) => (
              <div key={order.id} className="payment-row">
                <span className="mono">{order.id}</span>
                <span>{paymentStatusLabel[order.paymentStatus]}</span>
                <span className="mono">{euro(order.quote.totalMinor)}</span>
                <Badge tone={order.paymentStatus === 'AUTHORIZED' ? 'warn' : 'mute'}>
                  {order.paymentStatus === 'AUTHORIZED' ? 'Einzug ausstehend' : 'Prüfen'}
                </Badge>
              </div>
            ))}
          </div>
          <div className="notice notice-warn">
            <Icon name="alert" size={16} />
            <span>Bei unklarem Zahlungsstatus bleibt die Übergabe gesperrt, bis der Providerzustand abgeglichen ist.</span>
          </div>
        </section>

        <section className="panel span-12" aria-labelledby="ops-extension-title">
          <header>
            <div>
              <h2 id="ops-extension-title">Drohnenbetrieb und Abgabestellen</h2>
              <p className="muted">Drohnen sind der Standard. Bodenfall und autonome Zustellung bleiben Ausnahmen.</p>
            </div>
            <Badge tone="ok">Drohne aktiv</Badge>
          </header>
          <div className="extension-grid">
            <div><Icon name="route" size={16} /><strong>Drohnenkorridore</strong><span>Feste Korridore, Höhenband 60 bis 80 m, sichere Abgabestellen.</span><Badge tone="ok">Im Prototyp</Badge></div>
            <div><Icon name="battery" size={16} /><strong>Schwerlast</strong><span>H60 bis 60 kg und 30 km Reichweite. Auto nur oberhalb der Drohnengrenze.</span><Badge tone="ok">Im Prototyp</Badge></div>
            <div><Icon name="pin" size={16} /><strong>Abgabestelle</strong><span>Drohne fliegt direkt zur angegebenen Adresse. Übergabe und Sicherheit vor Ort prüfen.</span><Badge tone="ok">Im Prototyp</Badge></div>
          </div>
        </section>
      </div>
    </>
  );
}
