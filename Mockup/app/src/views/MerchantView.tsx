import { useMemo, useState } from 'react';
import { Badge } from '../components/Badge';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { CURRENT_CUSTOMER_ID, merchantById, merchants, offers, productById, storeById, stores } from '../data/demo';
import type { Order, OrderStatus, StockStatus } from '../data/types';
import { euro } from '../lib/format';
import {
  deliveryStatusLabel,
  fulfillmentLabel,
  merchantTaskLabel,
  orderStatusLabel,
  paymentStatusLabel,
  stockQualityLabel,
  stockStatusLabel,
} from '../lib/labels';

const orderTone: Record<OrderStatus, 'ok' | 'warn' | 'bad' | 'info' | 'mute'> = {
  PENDING: 'warn',
  CONFIRMED: 'info',
  FULFILLING: 'info',
  READY: 'ok',
  IN_TRANSIT: 'info',
  DELIVERED: 'ok',
  REJECTED: 'bad',
  CANCELLED: 'bad',
  EXPIRED: 'mute',
};

const stockTone: Record<StockStatus, 'ok' | 'warn' | 'bad' | 'mute'> = {
  available: 'ok',
  low: 'warn',
  unavailable: 'bad',
  unconfirmed: 'mute',
};

const rejectReasons = [
  'Artikel nicht verfügbar',
  'Filiale überlastet',
  'Vorbereitungszeit nicht ausreichend',
  'Bestand unklar',
];

export function MerchantView({
  orders,
  storeId,
  onStore,
  onAccept,
  onReject,
  onPick,
  onReady,
  onHandover,
  onNotify,
}: {
  orders: Order[];
  storeId: string;
  onStore: (id: string) => void;
  onAccept: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onPick: (id: string) => void;
  onReady: (id: string) => void;
  onHandover: (id: string) => void;
  onNotify: (message: string) => void;
}) {
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const store = storeById(storeId) ?? stores[0];
  const merchant = merchantById(store.merchantId);
  const merchantOptions = merchants.filter((item) => stores.some((candidate) => candidate.merchantId === item.id));
  const merchantStores = stores.filter((item) => item.merchantId === store.merchantId);
  const storeOrders = useMemo(
    () => orders.filter((order) => order.storeId === store.id && order.customerId === CURRENT_CUSTOMER_ID && !['DELIVERED', 'REJECTED', 'CANCELLED', 'EXPIRED', 'IN_TRANSIT'].includes(order.status)),
    [orders, store.id],
  );
  const storeOffers = offers.filter((offer) => offer.storeId === store.id);
  const newCount = storeOrders.filter((order) => order.status === 'PENDING').length;
  const pickingCount = storeOrders.filter((order) => ['CONFIRMED', 'FULFILLING'].includes(order.status)).length;
  const readyCount = storeOrders.filter((order) => order.status === 'READY').length;

  return (
    <>
      <PageHeader
        eyebrow="FlyToYou · Händler"
        title={merchant?.name ?? store.name}
        description={`${store.name} · ${store.district}. Neue Aufträge annehmen, Ware zusammenstellen, Abholbereitschaft melden und Übergabe bestätigen.`}
        actions={
          <div className="merchant-picker">
            <div className="customer-tabs" role="group" aria-label="Händler wählen">
              {merchantOptions.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={item.id === store.merchantId}
                  onClick={() => {
                    const firstStore = stores.find((candidate) => candidate.merchantId === item.id);
                    if (firstStore) onStore(firstStore.id);
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>
            {merchantStores.length > 1 ? (
              <div className="customer-tabs" role="group" aria-label="Filiale wählen">
                {merchantStores.map((item) => (
                  <button key={item.id} type="button" aria-pressed={item.id === store.id} onClick={() => onStore(item.id)}>
                    {item.district}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        }
      />

      <div className="metrics">
        <div className="metric"><span className="metric-value mono">{newCount}</span><span className="metric-label">Neue Aufträge</span><span className="metric-note">warten auf Annahme</span></div>
        <div className="metric"><span className="metric-value mono">{pickingCount}</span><span className="metric-label">In Vorbereitung</span><span className="metric-note">bestätigt oder gepackt</span></div>
        <div className="metric"><span className="metric-value mono">{readyCount}</span><span className="metric-label">Abholbereit</span><span className="metric-note">warten auf Drohne oder Kunde</span></div>
        <div className="metric"><span className="metric-value mono">{store.prepMinutes}</span><span className="metric-label">Vorbereitungszeit</span><span className="metric-note">Minuten, Demo-Wert</span></div>
        <div className="metric metric-muted"><span className="metric-value">{store.status === 'open' ? 'Offen' : 'Geschlossen'}</span><span className="metric-label">Filialstatus</span><span className="metric-note">{store.pickupHours}</span></div>
      </div>

      <div className="merchant-layout">
        <section className="panel span-8" aria-labelledby="worklist-title">
          <header>
            <div>
              <h2 id="worklist-title">Arbeitsliste</h2>
              <p className="muted">Nur Aufträge des Demo-Kunden A. Yilmaz. Aktionen sind protokolliert und erscheinen direkt in seiner Bestellverfolgung.</p>
            </div>
            <Badge tone={store.status === 'open' ? 'ok' : 'bad'}>{store.status === 'open' ? 'Geöffnet' : 'Geschlossen'}</Badge>
          </header>

          {storeOrders.length === 0 ? (
            <div className="empty-state">
              <strong>Keine offenen Aufträge für den Demo-Kunden.</strong>
              <p>Neue Bestellungen erscheinen hier nach der Zahlungsautorisierung.</p>
            </div>
          ) : null}

          <div className="worklist">
            {storeOrders.map((order) => (
              <article key={order.id} className="work-card">
                <header className="work-head">
                  <div>
                    <span className="mono">{order.id}</span>
                    <span className="muted small">{order.customerName} · {fulfillmentLabel[order.fulfillment]} · {order.service === 'express' ? 'Express' : 'Standard'}</span>
                  </div>
                  <Badge tone={orderTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
                </header>
                <ul className="work-lines">
                  {order.lines.map((line) => (
                    <li key={line.offerId}><span>{line.quantity} × {line.titleSnapshot}</span><span className="mono">{euro(line.unitPriceMinor * line.quantity)}</span></li>
                  ))}
                </ul>
                <div className="work-meta">
                  <span>{paymentStatusLabel[order.paymentStatus]}</span>
                  <span>{deliveryStatusLabel[order.deliveryStatus]}</span>
                  <span>{order.fulfillment === 'delivery' ? order.address : 'Selbstabholung'}</span>
                  <span className="mono">{euro(order.quote.totalMinor)}</span>
                </div>
                <div className="work-actions">
                  {order.status === 'PENDING' ? (
                    <>
                      <button type="button" className="btn btn-primary" onClick={() => onAccept(order.id)}>
                        <Icon name="check" size={15} /> Annehmen
                      </button>
                      <button type="button" className="btn btn-secondary" onClick={() => setRejectingId(order.id)}>
                        <Icon name="x" size={15} /> Ablehnen
                      </button>
                    </>
                  ) : null}
                  {order.status === 'CONFIRMED' ? (
                    <button type="button" className="btn btn-primary" onClick={() => onPick(order.id)}>
                      <Icon name="package" size={15} /> Zusammenstellen starten
                    </button>
                  ) : null}
                  {order.status === 'FULFILLING' ? (
                    <button type="button" className="btn btn-primary" onClick={() => onReady(order.id)}>
                      <Icon name="check" size={15} /> Abholbereit melden
                    </button>
                  ) : null}
                  {order.status === 'READY' && order.merchantTask !== 'HANDED_OVER' ? (
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={order.fulfillment === 'delivery' && !order.droneId}
                      onClick={() => onHandover(order.id)}
                    >
                      <Icon name={order.fulfillment === 'pickup' ? 'lock' : 'bike'} size={15} />
                      {order.fulfillment === 'pickup' ? 'Abholung bestätigen' : 'An Drohne übergeben'}
                    </button>
                  ) : null}
                  {order.status === 'READY' && order.merchantTask === 'HANDED_OVER' ? (
                    <span className="muted small">Ware übergeben. Wartet auf Drohnenstart.</span>
                  ) : null}
                  {order.status === 'READY' && order.fulfillment === 'delivery' && !order.droneId ? (
                    <span className="muted small">Noch keine Drohne zugewiesen. Flotte muss zuordnen.</span>
                  ) : null}
                  <span className="muted small">Aufgabe: {merchantTaskLabel[order.merchantTask]}</span>
                </div>
                {rejectingId === order.id ? (
                  <div className="reject-box" role="group" aria-label={`Auftrag ${order.id} ablehnen`}>
                    <p><strong>Auftrag ablehnen?</strong> Reservierung und Zahlungsautorisierung werden freigegeben.</p>
                    <div className="chip-row">
                      {rejectReasons.map((reason) => (
                        <button
                          key={reason}
                          type="button"
                          className="chip"
                          onClick={() => {
                            onReject(order.id, reason);
                            setRejectingId(null);
                          }}
                        >
                          {reason}
                        </button>
                      ))}
                      <button type="button" className="chip" onClick={() => setRejectingId(null)}>Abbrechen</button>
                    </div>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <aside className="panel span-4" aria-labelledby="inventory-title">
          <header>
            <div>
              <h2 id="inventory-title">Bestand dieser Filiale</h2>
              <p className="muted">Quelle, Zeitstempel und Qualität sind sichtbar.</p>
            </div>
          </header>
          <div className="inventory-list">
            {storeOffers.map((offer) => {
              const product = productById(offer.productId);
              return (
                <div key={offer.id} className="inventory-row">
                  <div>
                    <strong>{product?.title}</strong>
                    <span className="muted small">{product?.variant} · {offer.observedAt} · {stockQualityLabel[offer.quality]}</span>
                  </div>
                  <Badge tone={stockTone[offer.stock]}>{stockStatusLabel[offer.stock]}</Badge>
                </div>
              );
            })}
          </div>
          <button type="button" className="btn btn-secondary btn-block" onClick={() => onNotify('Bestandsabgleich ist im Prototyp simuliert. Keine echte Warenwirtschaft angebunden.')}>
            <Icon name="refresh" size={15} /> Bestand abgleichen
          </button>
        </aside>
      </div>
    </>
  );
}
