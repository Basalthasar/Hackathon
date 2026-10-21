import { useEffect, useState } from 'react';
import { Badge } from './components/Badge';
import { Icon } from './components/Icon';
import {
  demoDisclosure,
  initialCart,
  initialOrders,
  CURRENT_CUSTOMER_ID,
  offerById,
  productById,
  roles,
  storeById,
} from './data/demo';
import type {
  Cart,
  CustomerStep,
  FulfillmentMode,
  Order,
  Quote,
  Role,
  ServiceLevel,
  Theme,
} from './data/types';
import { calculateQuote } from './lib/pricing';
import { clockNow, euro } from './lib/format';
import { FleetView } from './views/FleetView';
import { CustomerView } from './views/CustomerView';
import { MerchantView } from './views/MerchantView';
import { OpsView } from './views/OpsView';

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 7h18" />
      <path d="M6 7v5" />
      <path d="M18 7v5" />
      <path d="M4 18h16" />
      <path d="M7 18l2-6" />
      <path d="M17 18l-2-6" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
    </svg>
  );
}

export default function App() {
  const [role, setRole] = useState<Role>('customer');
  const [theme, setTheme] = useState<Theme>('light');
  const [customerStep, setCustomerStep] = useState<CustomerStep>('search');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Alle');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [cart, setCart] = useState<Cart>(initialCart);
  const [fulfillment, setFulfillment] = useState<FulfillmentMode>('delivery');
  const [service, setService] = useState<ServiceLevel>('standard');
  const [address, setAddress] = useState('Luisenstraße 14, Wuppertal');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialOrders[0]?.id ?? null);
  const [merchantStoreId, setMerchantStoreId] = useState('s-elberfeld');
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.title = `FlyToYou - ${role === 'customer' ? 'Bestellen' : role === 'merchant' ? 'Händler' : role === 'fleet' ? 'Flotte' : 'Betrieb'}`;
  }, [role]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOrders((current) => current.map((order) => {
        const shouldStart =
          order.droneId !== null &&
          order.status === 'READY' &&
          order.merchantTask === 'HANDED_OVER' &&
          order.droneDepartAt > 0 &&
          Date.now() >= order.droneDepartAt;
        if (!shouldStart) return order;
        return {
          ...order,
          status: 'IN_TRANSIT',
          deliveryStatus: 'IN_TRANSIT',
          paymentStatus: 'CAPTURED',
          timeline: [
            ...order.timeline,
            {
              at: clockNow(),
              label: 'Drohne automatisch gestartet',
              detail: 'Erwarteter Startzeitpunkt nach der Bestellung erreicht. Drohne im Flug zur Abgabestelle.',
              actor: 'Flugbetrieb',
            },
          ],
          note: 'Drohne ist im Flug.',
        };
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const changeRole = (next: Role) => {
    setRole(next);
    if (next === 'customer') {
      const order = orders.find((item) => item.id === selectedOrderId);
      setCustomerStep(order?.customerId === CURRENT_CUSTOMER_ID ? 'tracking' : 'search');
    } else {
      setCustomerStep('search');
    }
  };

  const goHome = () => {
    setRole('customer');
    setCustomerStep('search');
    setSelectedProductId(null);
    setQuery('');
    setCategory('Alle');
    window.scrollTo({ top: 0, left: 0 });
  };

  const invalidateQuote = () => {
    setQuote(null);
    setQuoteError(null);
  };

  const addToCart = (offerId: string) => {
    const offer = offerById(offerId);
    if (!offer) return;
    if (offer.stock === 'unavailable' || offer.stock === 'unconfirmed') {
      setToast('Dieses Angebot ist nicht verbindlich buchbar. Bestand prüfen oder andere Filiale wählen.');
      return;
    }
    if (cart.storeId && cart.storeId !== offer.storeId) {
      setToast('Eine Bestellung umfasst nur eine Filiale. Bitte den Warenkorb zuerst leeren.');
      return;
    }
    setCart((current) => {
      const existing = current.lines.find((line) => line.offerId === offerId);
      return {
        storeId: offer.storeId,
        lines: existing
          ? current.lines.map((line) => line.offerId === offerId ? { ...line, quantity: line.quantity + 1 } : line)
          : [...current.lines, { offerId, quantity: 1 }],
      };
    });
    invalidateQuote();
    setCustomerStep('cart');
    setToast('Artikel in den Warenkorb gelegt. Preis und Zeit neu berechnen.');
  };

  const changeQuantity = (offerId: string, delta: number) => {
    setCart((current) => {
      const lines = current.lines
        .map((line) => line.offerId === offerId ? { ...line, quantity: line.quantity + delta } : line)
        .filter((line) => line.quantity > 0);
      return { storeId: lines.length > 0 ? current.storeId : null, lines };
    });
    invalidateQuote();
  };

  const removeLine = (offerId: string) => {
    setCart((current) => {
      const lines = current.lines.filter((line) => line.offerId !== offerId);
      return { storeId: lines.length > 0 ? current.storeId : null, lines };
    });
    invalidateQuote();
  };

  const requestQuote = () => {
    if (!cart.storeId) {
      setQuoteError('Keine Filiale im Warenkorb.');
      return;
    }
    const result = calculateQuote({ cart, storeId: cart.storeId, fulfillment, service, address });
    if (result.error) {
      setQuote(null);
      setQuoteError(result.error);
      return;
    }
    setQuote(result.quote ?? null);
    setQuoteError(null);
  };

  const createOrder = () => {
    if (!quote || !cart.storeId) return;
    const store = storeById(cart.storeId);
    if (!store) return;
    const now = clockNow();
    const lines = cart.lines.map((line) => {
      const offer = offerById(line.offerId);
      const product = offer ? productById(offer.productId) : undefined;
      return {
        offerId: line.offerId,
        productId: offer?.productId ?? '',
        quantity: line.quantity,
        unitPriceMinor: offer?.priceMinor ?? 0,
        titleSnapshot: product ? `${product.title} · ${product.variant}` : 'Artikel',
      };
    });
    const id = `SK-${1047 + orders.filter((order) => order.id.startsWith('SK-')).length}`;
    const order: Order = {
      id,
      createdAt: now,
      customerId: CURRENT_CUSTOMER_ID,
      customerName: 'A. Yilmaz',
      storeId: store.id,
      merchantId: store.merchantId,
      status: 'PENDING',
      merchantTask: 'NEW',
      paymentStatus: 'AUTHORIZED',
      deliveryStatus: fulfillment === 'delivery' ? (quote.droneId ? 'ASSIGNED' : 'UNASSIGNED') : 'NONE',
      fulfillment,
      service,
      lines,
      quote,
      address: fulfillment === 'delivery' ? address : `Abholung: ${store.address}`,
      droneId: quote.droneId,
      droneDepartAt: quote.droneId ? Date.now() + (30 + Math.floor(Math.random() * 31)) * 1000 : 0,
      pickupCode: `P-${Math.floor(1000 + Math.random() * 9000)}`,
      deliveryCode: fulfillment === 'delivery' ? `D-${Math.floor(1000 + Math.random() * 9000)}` : '',
      timeline: [
        { at: now, label: 'Bestellung angelegt', detail: 'Zahlung autorisiert, Händlerbestätigung offen.', actor: 'System' },
      ],
      note: 'Wartet auf Händlerbestätigung.',
    };
    setOrders((current) => [order, ...current]);
    setSelectedOrderId(order.id);
    setCart(initialCart);
    setQuote(null);
    setQuoteError(null);
    setCustomerStep('tracking');
    setToast(`Bestellung ${id} angelegt. ${euro(order.quote.totalMinor)} autorisiert, noch nicht eingezogen.`);
  };

  const updateOrder = (id: string, updater: (order: Order) => Order) => {
    setOrders((current) => current.map((order) => order.id === id ? updater(order) : order));
  };

  const cancelOrder = (id: string) => {
    setSelectedOrderId(id);
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      setToast('Storno nach Beginn der Vorbereitung läuft über den Support. Demo, kein echter Fall.');
      return;
    }
    updateOrder(id, (current) => ({
      ...current,
      status: 'CANCELLED',
      paymentStatus: 'VOIDED',
      timeline: [...current.timeline, { at: clockNow(), label: 'Storniert', detail: 'Reservierung und Autorisierung freigegeben.', actor: 'Kunde' }],
      note: 'Storno vor Beginn der Vorbereitung.',
    }));
    setToast(`Bestellung ${id} storniert. Demo-Autorisierung aufgehoben.`);
  };

  const acceptOrder = (id: string) => {
    setSelectedOrderId(id);
    updateOrder(id, (current) => ({
      ...current,
      status: 'CONFIRMED',
      merchantTask: 'ACCEPTED',
      timeline: [...current.timeline, { at: clockNow(), label: 'Vom Händler angenommen', detail: 'Vorbereitung wird eingeplant.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
      note: 'Händler hat die Ware bestätigt.',
    }));
    setToast(`Bestellung ${id} angenommen.`);
  };

  const rejectOrder = (id: string, reason: string) => {
    setSelectedOrderId(id);
    updateOrder(id, (current) => ({
      ...current,
      status: 'REJECTED',
      merchantTask: 'REJECTED',
      paymentStatus: 'VOIDED',
      timeline: [...current.timeline, { at: clockNow(), label: 'Händler hat abgelehnt', detail: reason + '. Autorisierung aufgehoben.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
      note: `Abgelehnt: ${reason}.`,
    }));
    setToast(`Bestellung ${id} abgelehnt. Autorisierung aufgehoben.`);
  };

  const startPicking = (id: string) => {
    setSelectedOrderId(id);
    updateOrder(id, (current) => ({
      ...current,
      status: 'FULFILLING',
      merchantTask: 'PICKING',
      timeline: [...current.timeline, { at: clockNow(), label: 'Vorbereitung gestartet', detail: 'Ware wird zusammengestellt und verpackt.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
      note: 'Ware wird zusammengestellt.',
    }));
    setToast(`Vorbereitung für ${id} gestartet.`);
  };

  const markReady = (id: string) => {
    setSelectedOrderId(id);
    updateOrder(id, (current) => ({
      ...current,
      status: 'READY',
      merchantTask: 'READY',
      timeline: [...current.timeline, { at: clockNow(), label: 'Abholbereit', detail: current.fulfillment === 'pickup' ? 'Kunde kann abholen.' : 'Wartet auf Drohnenübergabe.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
      note: current.fulfillment === 'pickup' ? 'Abholbereit an der Warenausgabe.' : 'Abholbereit für die Drohne.',
    }));
    setToast(`Bestellung ${id} ist abholbereit.`);
  };

  const handoverOrder = (id: string) => {
    setSelectedOrderId(id);
    const order = orders.find((item) => item.id === id);
    if (!order) return;
    if (order.fulfillment === 'pickup') {
      updateOrder(id, (current) => ({
        ...current,
        status: 'DELIVERED',
        merchantTask: 'HANDED_OVER',
        paymentStatus: 'CAPTURED',
        timeline: [...current.timeline, { at: clockNow(), label: 'Abgeholt', detail: 'Übergabe an der Warenausgabe bestätigt.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
        note: 'Abgeschlossen. Kein Lieferauftrag.',
      }));
      setToast(`Abholung ${id} bestätigt. Zahlung eingezogen.`);
      return;
    }
    if (!order.droneId) {
      setToast('Keine Drohne zugewiesen. Zuerst im Betrieb zuordnen.');
      return;
    }
    updateOrder(id, (current) => ({
      ...current,
      merchantTask: 'HANDED_OVER',
      timeline: [...current.timeline, { at: clockNow(), label: 'An Drohne übergeben', detail: 'Ware an der Warenausgabe übergeben. Drohne startet nach dem erwarteten Startfenster.', actor: storeById(current.storeId)?.name ?? 'Händler' }],
      note: 'Wartet auf den erwarteten Start der Drohne.',
    }));
    setToast(`Ware für ${id} an die Drohne übergeben.`);
  };

  const assignDrone = (orderId: string, droneId: string) => {
    setSelectedOrderId(orderId);
    updateOrder(orderId, (current) => ({
      ...current,
      droneId,
      deliveryStatus: 'ASSIGNED',
      timeline: [...current.timeline, { at: clockNow(), label: 'Drohne zugewiesen', detail: `${droneId} übernimmt den Flug.`, actor: 'Betrieb' }],
    }));
  };

  const landDrone = (id: string) => {
    setSelectedOrderId(id);
    updateOrder(id, (current) => ({
      ...current,
      status: 'DELIVERED',
      deliveryStatus: 'DELIVERED',
      paymentStatus: 'CAPTURED',
      timeline: [...current.timeline, { at: clockNow(), label: 'Landung bestätigt', detail: 'Drohne am Übergabepunkt gelandet. Empfangscode dokumentiert.', actor: 'Flugbetrieb' }],
      note: 'Am Übergabepunkt angekommen.',
    }));
  };

  return (
    <div className={`app surface-${role}`}>
      <a className="skip-link" href="#main">Zum Inhalt springen</a>

      <header className="app-header">
        <button type="button" className="brand brand-button" onClick={goHome} aria-label="FlyToYou Startseite">
          <span className="brand-mark-wrap" aria-hidden="true"><BrandMark /></span>
          <span className="brand-copy">
            <strong>FlyToYou</strong>
            <span>Lokale Lieferplattform · Prototyp</span>
          </span>
        </button>

        <div className="header-center">
          <div className="surface-switch" role="group" aria-label="Demo-Rolle wählen">
            {roles.map((item) => (
              <button key={item.id} type="button" aria-pressed={role === item.id} onClick={() => changeRole(item.id)}>
                <Icon name={item.icon} size={15} /> {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="header-actions">
          <Badge tone="warn" icon="info">Demo-Daten</Badge>
          <button
            type="button"
            className="icon-button"
            aria-label={theme === 'dark' ? 'Zu hellem Theme wechseln' : 'Zu dunklem Theme wechseln'}
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </header>

      <main id="main" className="app-main">
        {role === 'customer' ? (
          <CustomerView
            step={customerStep}
            onStep={setCustomerStep}
            query={query}
            onQuery={(value) => { setQuery(value); setCustomerStep('search'); }}
            category={category}
            onCategory={(value) => { setCategory(value); setCustomerStep('search'); }}
            selectedProductId={selectedProductId}
            onSelectProduct={(id) => { setSelectedProductId(id); setCustomerStep('offers'); }}
            cart={cart}
            onAdd={addToCart}
            onQuantity={changeQuantity}
            onRemove={removeLine}
            fulfillment={fulfillment}
            onFulfillment={(value) => { setFulfillment(value); invalidateQuote(); }}
            service={service}
            onService={(value) => { setService(value); invalidateQuote(); }}
            address={address}
            onAddress={(value) => { setAddress(value); invalidateQuote(); }}
            quote={quote}
            quoteError={quoteError}
            onQuote={requestQuote}
            onCheckout={createOrder}
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            onCancel={cancelOrder}
            onNotify={setToast}
          />
        ) : null}

        {role === 'merchant' ? (
          <MerchantView
            orders={orders}
            storeId={merchantStoreId}
            onStore={setMerchantStoreId}
            onAccept={acceptOrder}
            onReject={rejectOrder}
            onPick={startPicking}
            onReady={markReady}
            onHandover={handoverOrder}
            onNotify={setToast}
          />
        ) : null}

        {role === 'fleet' ? (
          <FleetView
            orders={orders}
            onLand={landDrone}
            onNotify={setToast}
          />
        ) : null}

        {role === 'ops' ? (
          <OpsView
            orders={orders}
            onAssignDrone={assignDrone}
            onCancel={cancelOrder}
            onNotify={setToast}
          />
        ) : null}
      </main>

      <footer className="app-footer">
        <span>{demoDisclosure}</span>
        <span>Wuppertal · Konzeptstand 2026-10-21 · React-Prototyp</span>
      </footer>

      <div className="toast" role="status" aria-live="polite" hidden={!toast}>
        {toast ? <><Icon name="info" size={16} /><span>{toast}</span></> : null}
      </div>
    </div>
  );
}
