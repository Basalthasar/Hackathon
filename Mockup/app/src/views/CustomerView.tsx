import { useEffect, useMemo, useState } from 'react';
import { Badge } from '../components/Badge';
import { DeliveryMap } from '../components/DeliveryMap';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/PageHeader';
import { ReceiptCode } from '../components/ReceiptCode';
import {
  categories,
  CURRENT_CUSTOMER_ID,
  findDestination,
  offerById,
  offers,
  productById,
  products,
  storeById,
  stores,
} from '../data/demo';
import type {
  Cart,
  CustomerStep,
  FulfillmentMode,
  Order,
  OrderStatus,
  Product,
  Quote,
  ServiceLevel,
  StockStatus,
} from '../data/types';
import { euro, km, minutesLabel, weightKg } from '../lib/format';
import {
  decisionLabel,
  deliveryStatusLabel,
  fulfillmentLabel,
  methodLabel,
  orderStatusLabel,
  paymentStatusLabel,
  serviceLabel,
  stockQualityLabel,
  stockStatusLabel,
} from '../lib/labels';

const stockTone: Record<StockStatus, 'ok' | 'warn' | 'bad' | 'mute'> = {
  available: 'ok',
  low: 'warn',
  unavailable: 'bad',
  unconfirmed: 'mute',
};

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

const cartCount = (cart: Cart) => cart.lines.reduce((sum, line) => sum + line.quantity, 0);

export function CustomerView({
  step,
  onStep,
  query,
  onQuery,
  category,
  onCategory,
  selectedProductId,
  onSelectProduct,
  cart,
  onAdd,
  onQuantity,
  onRemove,
  fulfillment,
  onFulfillment,
  service,
  onService,
  address,
  onAddress,
  quote,
  quoteError,
  onQuote,
  onCheckout,
  orders,
  selectedOrderId,
  onSelectOrder,
  onCancel,
  onConfirmReceipt,
  onNotify,
}: {
  step: CustomerStep;
  onStep: (step: CustomerStep) => void;
  query: string;
  onQuery: (value: string) => void;
  category: string;
  onCategory: (value: string) => void;
  selectedProductId: string | null;
  onSelectProduct: (id: string) => void;
  cart: Cart;
  onAdd: (offerId: string) => void;
  onQuantity: (offerId: string, delta: number) => void;
  onRemove: (offerId: string) => void;
  fulfillment: FulfillmentMode;
  onFulfillment: (value: FulfillmentMode) => void;
  service: ServiceLevel;
  onService: (value: ServiceLevel) => void;
  address: string;
  onAddress: (value: string) => void;
  quote: Quote | null;
  quoteError: string | null;
  onQuote: () => void;
  onCheckout: () => void;
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (id: string) => void;
  onCancel: (id: string) => void;
  onConfirmReceipt: (id: string, code: string) => boolean;
  onNotify: (message: string) => void;
}) {
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [sort, setSort] = useState<'price' | 'time' | 'distance'>('price');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const currentProduct = selectedProductId ? productById(selectedProductId) : undefined;
  const cartStore = cart.storeId ? storeById(cart.storeId) : undefined;
  const customerOrders = orders.filter((order) => order.customerId === CURRENT_CUSTOMER_ID);
  const selectedOrder = selectedOrderId
    ? customerOrders.find((order) => order.id === selectedOrderId)
    : customerOrders[0];

  const results = useMemo(() => {
    const text = query.trim().toLowerCase();
    return products
      .filter((product) => category === 'Alle' || product.category === category)
      .filter((product) =>
        !text ||
        [product.title, product.brand, product.category, product.variant]
          .some((value) => value.toLowerCase().includes(text)),
      )
      .map((product) => {
        const productOffers = offers.filter((offer) => offer.productId === product.id);
        const best = productOffers
          .filter((offer) => {
            const store = storeById(offer.storeId);
            return store?.status === 'open' && (offer.stock === 'available' || offer.stock === 'low');
          })
          .sort((a, b) => a.priceMinor - b.priceMinor)[0];
        return { product, offers: productOffers, best };
      })
      .filter((entry) => !onlyAvailable || entry.best)
      .sort((a, b) => {
        if (sort === 'time') {
          const aStore = a.best ? storeById(a.best.storeId) : undefined;
          const bStore = b.best ? storeById(b.best.storeId) : undefined;
          return (aStore?.prepMinutes ?? 99) - (bStore?.prepMinutes ?? 99);
        }
        if (sort === 'distance') {
          const aStore = a.best ? storeById(a.best.storeId) : undefined;
          const bStore = b.best ? storeById(b.best.storeId) : undefined;
          return (aStore?.distanceKm ?? 99) - (bStore?.distanceKm ?? 99);
        }
        return (a.best?.priceMinor ?? 99999) - (b.best?.priceMinor ?? 99999);
      });
  }, [category, onlyAvailable, query, sort]);

  const quoteExpired = quote ? quote.validUntil <= now : false;

  return (
    <>
      <PageHeader
        eyebrow="FlyToYou · Kunde"
        title={
          step === 'search' ? 'Was brauchst du heute?'
            : step === 'offers' ? currentProduct?.title ?? 'Angebote'
              : step === 'cart' ? 'Warenkorb'
                : step === 'checkout' ? 'Bestellung prüfen'
                  : step === 'tracking' ? 'Bestellung verfolgen'
                    : step === 'orders' ? 'Meine Bestellungen'
                      : 'Konto und Adressen'
        }
        description={
          step === 'search'
            ? 'Produkte bei lokalen Händlern finden, Preise und Verfügbarkeit vergleichen, liefern lassen oder selbst abholen.'
            : step === 'offers'
              ? 'Filialangebote mit Preis, Bestandsstatus und Aktualität vergleichen.'
              : step === 'cart'
                ? 'Eine Filiale pro Bestellung. Preis und Zeit werden serverseitig berechnet; hier als Demo.'
                : step === 'checkout'
                  ? 'Demo-Checkout ohne echte Zahlung. Erst Händlerannahme und Zahlungsstatus bestätigen die Bestellung.'
                  : step === 'tracking'
                    ? 'Statusfolge, Zeitfenster und Übergabecode. Keine erfundene Live-Position.'
                    : step === 'orders'
                      ? 'Vergangene und laufende Bestellungen mit Preis, Modus und Status.'
                      : 'Adresse, Benachrichtigungen und Demo-Zahlungsart.'
        }
        actions={
          <div className="customer-header-actions">
            <Badge tone="info" icon="user">Demo-Kunde A. Yilmaz</Badge>
            <div className="customer-tabs" role="group" aria-label="Kundenbereiche">
            <button type="button" aria-pressed={step === 'search' || step === 'offers'} onClick={() => onStep('search')}>
              <Icon name="search" size={15} /> Suche
            </button>
            <button type="button" aria-pressed={step === 'orders' || step === 'tracking'} onClick={() => onStep('orders')}>
              <Icon name="receipt" size={15} /> Bestellungen
            </button>
            <button type="button" aria-pressed={step === 'cart' || step === 'checkout'} onClick={() => onStep('cart')}>
              <Icon name="cart" size={15} /> Warenkorb {cartCount(cart) > 0 ? `(${cartCount(cart)})` : ''}
            </button>
              <button type="button" aria-pressed={step === 'account'} onClick={() => onStep('account')}>
                <Icon name="user" size={15} /> Konto
              </button>
            </div>
          </div>
        }
      />

      {step === 'search' ? (
        <div className="customer-search">
          <section className="panel search-panel" aria-labelledby="search-title">
            <header>
              <div>
                <h2 id="search-title">Lieferziel</h2>
                <p className="muted">Pilotgebiet Wuppertal. Adresse manuell eingeben oder Demo-Standort verwenden.</p>
              </div>
              <Badge tone="info">Pilotgebiet</Badge>
            </header>
            <div className="search-controls">
              <label className="field">
                <span>Adresse</span>
                <input value={address} onChange={(event) => onAddress(event.target.value)} />
              </label>
              <button type="button" className="btn btn-secondary" onClick={() => onNotify('Demo-Standort gesetzt: Wuppertal Elberfeld. Keine echte Ortung.')}>
                <Icon name="pin" size={16} /> Standort verwenden
              </button>
            </div>
            <div className="search-bar">
              <Icon name="search" size={18} />
              <input
                aria-label="Produkte suchen"
                placeholder="Produkt, Marke oder Kategorie"
                value={query}
                onChange={(event) => onQuery(event.target.value)}
              />
              {query ? (
                <button type="button" className="icon-button small-icon" aria-label="Suche leeren" onClick={() => onQuery('')}>
                  <Icon name="x" size={16} />
                </button>
              ) : null}
            </div>
            <div className="chip-row" role="group" aria-label="Kategorien">
              {categories.map((item) => (
                <button key={item} type="button" className="chip" aria-pressed={category === item} onClick={() => onCategory(item)}>
                  {item}
                </button>
              ))}
            </div>
            <div className="filter-row">
              <label className="checkbox">
                <input type="checkbox" checked={onlyAvailable} onChange={(event) => setOnlyAvailable(event.target.checked)} />
                Nur verbindlich verfügbare Angebote
              </label>
              <div className="sort-group" role="group" aria-label="Sortierung">
                <span className="muted small">Sortieren:</span>
                {(
                  [['price', 'Preis'], ['time', 'Zeit'], ['distance', 'Nähe']] as const
                ).map(([id, label]) => (
                  <button key={id} type="button" className="chip" aria-pressed={sort === id} onClick={() => setSort(id)}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div className="result-head">
            <h2>{results.length} Produkte</h2>
            <span className="muted small">Preise sind Demo-Werte. Bestand mit Quelle und Aktualität.</span>
          </div>

          <div className="product-grid">
            {results.map(({ product, offers: productOffers, best }) => {
              const bestStore = best ? storeById(best.storeId) : undefined;
              return (
                <article key={product.id} className="product-card">
                  <div className="product-mark" aria-hidden="true">{product.emojiFreeMark}</div>
                  <div className="product-copy">
                    <p className="eyebrow">{product.category}</p>
                    <h3>{product.title}</h3>
                    <p className="muted small">{product.brand} · {product.variant}</p>
                    <div className="product-meta">
                      {best ? (
                        <>
                          <strong className="mono">{euro(best.priceMinor)}</strong>
                          <span>{bestStore?.name}</span>
                          <Badge tone={stockTone[best.stock]}>{stockStatusLabel[best.stock]}</Badge>
                        </>
                      ) : (
                        <Badge tone="mute">Derzeit kein verbindliches Angebot</Badge>
                      )}
                    </div>
                    <p className="muted small">
                      {productOffers.length} {productOffers.length === 1 ? 'Angebot' : 'Angebote'}
                      {bestStore ? ` · ${bestStore.district} · ${km(bestStore.distanceKm)}` : ''}
                    </p>
                  </div>
                  <button type="button" className="btn btn-secondary btn-block" onClick={() => onSelectProduct(product.id)}>
                    Angebote ansehen <Icon name="arrow-right" size={15} />
                  </button>
                </article>
              );
            })}
          </div>

          {results.length === 0 ? (
            <div className="empty-state">
              <strong>Keine Treffer.</strong>
              <p>Andere Kategorie wählen, Suche leeren oder den Filter für unbestätigte Angebote öffnen.</p>
            </div>
          ) : null}

          <div className="notice">
            <Icon name="info" size={16} />
            <span>
              Drohnenlieferung ist der Standard im Prototyp. Auto ist der Bodenfall, wenn Nutzlast oder Reichweite der Drohne nicht reichen. Fahrrad und E-Scooter sind im Pilot nicht vorgesehen.
            </span>
          </div>
        </div>
      ) : null}

      {step === 'offers' && currentProduct ? (
        <div className="offers-view">
          <button type="button" className="link-button" onClick={() => onStep('search')}>
            <Icon name="chevron-down" size={15} /> Zurück zur Suche
          </button>
          <section className="panel product-hero" aria-labelledby="offer-product-title">
            <div className="product-mark large" aria-hidden="true">{currentProduct.emojiFreeMark}</div>
            <div>
              <p className="eyebrow">{currentProduct.category}</p>
              <h2 id="offer-product-title">{currentProduct.title}</h2>
              <p className="muted">{currentProduct.brand} · {currentProduct.variant} · GTIN {currentProduct.gtin}</p>
              <p className="muted small">{currentProduct.weightKg.toFixed(2)} kg · {currentProduct.packageNote}</p>
            </div>
          </section>

          <div className="offer-list">
            {offers
              .filter((offer) => offer.productId === currentProduct.id)
              .sort((a, b) => a.priceMinor - b.priceMinor)
              .map((offer) => {
                const store = storeById(offer.storeId);
                if (!store) return null;
                const disabled = store.status !== 'open' || offer.stock === 'unavailable' || offer.stock === 'unconfirmed';
                return (
                  <article key={offer.id} className={`offer-card ${disabled ? 'is-disabled' : ''}`}>
                    <div className="offer-main">
                      <div className="offer-head">
                        <div>
                          <h3>{store.name}</h3>
                          <p className="muted small">{store.district} · {km(store.distanceKm)} · Abholung {store.pickupHours}</p>
                        </div>
                        <Badge tone={store.status === 'open' ? 'ok' : 'bad'}>
                          {store.status === 'open' ? 'Geöffnet' : 'Geschlossen'}
                        </Badge>
                      </div>
                      <div className="offer-meta">
                        <Badge tone={stockTone[offer.stock]}>{stockStatusLabel[offer.stock]}</Badge>
                        <span className="muted small">Bestand {stockQualityLabel[offer.quality]} · {offer.observedAt}</span>
                        <span className="muted small">SKU {offer.merchantSku}</span>
                      </div>
                      <p className="offer-note">{offer.note}</p>
                    </div>
                    <div className="offer-buy">
                      <strong className="offer-price mono">{euro(offer.priceMinor)}</strong>
                      <span className="muted small">ca. {minutesLabel(store.prepMinutes + 15)} bis Übergabe</span>
                      <button
                        type="button"
                        className="btn btn-primary"
                        disabled={disabled}
                        onClick={() => onAdd(offer.id)}
                      >
                        <Icon name="plus" size={16} /> {offer.stock === 'unconfirmed' ? 'Nicht verbindlich' : 'In den Warenkorb'}
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        </div>
      ) : null}

      {step === 'cart' ? (
        <div className="cart-layout">
          <section className="panel cart-panel span-8" aria-labelledby="cart-title">
            <header>
              <div>
                <h2 id="cart-title">Warenkorb</h2>
                <p className="muted">{cartStore ? cartStore.name : 'Noch keine Filiale gewählt'}</p>
              </div>
              <Badge tone="info">{cartCount(cart)} Artikel</Badge>
            </header>

            {cart.lines.length === 0 ? (
              <div className="empty-state">
                <strong>Der Warenkorb ist leer.</strong>
                <p>Produkte suchen und ein Filialangebot auswählen.</p>
                <button type="button" className="btn btn-primary" onClick={() => onStep('search')}>
                  Produkte suchen
                </button>
              </div>
            ) : (
              <div className="cart-lines">
                {cart.lines.map((line) => {
                  const offer = offerById(line.offerId);
                  const product = offer ? productById(offer.productId) : undefined;
                  if (!offer || !product) return null;
                  return (
                    <div key={line.offerId} className="cart-line">
                      <div className="product-mark small" aria-hidden="true">{product.emojiFreeMark}</div>
                      <div className="cart-line-copy">
                        <strong>{product.title}</strong>
                        <span className="muted small">{product.brand} · {product.variant}</span>
                        <span className="muted small">{euro(offer.priceMinor)} pro Stück</span>
                      </div>
                      <div className="qty-control" role="group" aria-label={`Menge ${product.title}`}>
                        <button type="button" className="qty-button" aria-label="Menge verringern" onClick={() => onQuantity(line.offerId, -1)}>
                          <Icon name="minus" size={14} />
                        </button>
                        <span className="mono">{line.quantity}</span>
                        <button type="button" className="qty-button" aria-label="Menge erhöhen" onClick={() => onQuantity(line.offerId, 1)}>
                          <Icon name="plus" size={14} />
                        </button>
                      </div>
                      <strong className="mono line-total">{euro(offer.priceMinor * line.quantity)}</strong>
                      <button type="button" className="icon-button small-icon" aria-label={`${product.title} entfernen`} onClick={() => onRemove(line.offerId)}>
                        <Icon name="trash" size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="cart-options">
              <div className="option-block">
                <h3>Empfang</h3>
                <div className="segmented" role="group" aria-label="Empfangsart">
                  {(['delivery', 'pickup'] as const).map((mode) => (
                    <button key={mode} type="button" aria-pressed={fulfillment === mode} onClick={() => onFulfillment(mode)}>
                      {mode === 'delivery' ? <Icon name="bike" size={15} /> : <Icon name="store" size={15} />}
                      {fulfillmentLabel[mode]}
                    </button>
                  ))}
                </div>
              </div>

              {fulfillment === 'delivery' ? (
                <>
                  <div className="option-block">
                    <h3>Service</h3>
                    <div className="segmented" role="group" aria-label="Servicelevel">
                      {(['standard', 'express'] as const).map((level) => (
                        <button key={level} type="button" aria-pressed={service === level} onClick={() => onService(level)}>
                          {serviceLabel[level]}{level === 'express' ? ' · priorisiert' : ''}
                        </button>
                      ))}
                    </div>
                    <p className="muted small">Express ist eine priorisierte Leistung mit eigener Kapazität, kein bestimmtes Fahrzeug.</p>
                  </div>
                  <label className="field">
                    <span>Lieferadresse</span>
                    <input value={address} onChange={(event) => onAddress(event.target.value)} />
                  </label>
                </>
              ) : (
                <div className="notice">
                  <Icon name="store" size={16} />
                  <span>
                    Abholung bei {cartStore?.name}, {cartStore?.address}. Öffnungszeiten {cartStore?.pickupHours}.
                    Kein Drohnenauftrag und keine Liefergebühr.
                  </span>
                </div>
              )}
            </div>

            {quoteError ? (
              <div className="notice notice-bad" role="alert">
                <Icon name="alert" size={16} />
                <span>{quoteError}</span>
              </div>
            ) : null}

            <div className="quote-box">
              {quote ? (
                <>
                  <div className="quote-head">
                    <div>
                      <p className="eyebrow">Befristetes Angebot</p>
                      <h3>{minutesLabel(quote.etaFromMinutes)} bis {minutesLabel(quote.etaToMinutes)}</h3>
                    </div>
                    <Badge tone={quoteExpired ? 'bad' : 'warn'}>
                      {quoteExpired ? 'Abgelaufen' : '120 Sekunden gültig'}
                    </Badge>
                  </div>
                  <dl className="price-breakdown">
                    <div><dt>Warenwert</dt><dd className="mono">{euro(quote.itemsSubtotalMinor)}</dd></div>
                    <div><dt>Basisgebühr</dt><dd className="mono">{euro(quote.baseFeeMinor)}</dd></div>
                    <div><dt>Distanzkosten ({km(quote.distanceKm)})</dt><dd className="mono">{euro(quote.distanceFeeMinor)}</dd></div>
                    <div><dt>Gewichtszuschlag ({weightKg(quote.payloadKg)})</dt><dd className="mono">{euro(quote.weightFeeMinor)}</dd></div>
                    <div><dt>Service</dt><dd className="mono">{euro(quote.serviceFeeMinor)}</dd></div>
                    <div className="price-total"><dt>Gesamt</dt><dd className="mono">{euro(quote.totalMinor)}</dd></div>
                  </dl>
                  <p className="muted small">
                    Methode: {methodLabel[quote.method ?? 'none']} · {weightKg(quote.payloadKg)} ·
                    {' '}Höhe {quote.altitudeBandM?.join(' bis ') ?? 'offen'} m (illustrative Annahme) ·
                    {' '}Wetter {quote.weather ? decisionLabel[quote.weather] : 'für Bodenfall nicht bewertet'} · {quote.methodPolicy}
                  </p>
                  {quote.droneId ? (
                    <p className="muted small">
                      Drohne {quote.droneId} · Abgabestelle: {address}. Ziel wird vor dem Start geprüft.
                    </p>
                  ) : quote.groundUnitId ? (
                    <p className="muted small">
                      Bodenfall {quote.groundUnitId} · Abgabestelle: {address}. Kapazitäten sind illustrative Annahmen.
                    </p>
                  ) : null}
                  <div className="button-row">
                    <button type="button" className="btn btn-secondary" onClick={onQuote}>
                      <Icon name="refresh" size={16} /> Neu berechnen
                    </button>
                    <button type="button" className="btn btn-primary" disabled={quoteExpired} onClick={() => onStep('checkout')}>
                      Weiter zum Checkout <Icon name="arrow-right" size={16} />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h3>Preis und Zeitfenster</h3>
                  <p className="muted">
                    Warenkorb, Empfang oder Adresse ändern die Kalkulation. Deshalb wird das Angebot erst
                    auf Anforderung erstellt und ist danach 120 Sekunden gültig.
                  </p>
                  <button type="button" className="btn btn-primary" disabled={cart.lines.length === 0} onClick={onQuote}>
                    <Icon name="receipt" size={16} /> Preis und Zeit berechnen
                  </button>
                </>
              )}
            </div>
          </section>

          <aside className="panel cart-aside span-4" aria-labelledby="cart-rules-title">
            <h2 id="cart-rules-title">Regeln dieser Bestellung</h2>
            <ul className="rules-list">
              <li><Icon name="store" size={15} /><span>Eine Filiale pro Warenkorb. Ein Wechsel der Filiale leert den Warenkorb nicht stillschweigend.</span></li>
              <li><Icon name="package" size={15} /><span>Nur verpackte, ungekühlte Artikel im Pilot. Kühlware ist nicht buchbar.</span></li>
              <li><Icon name="clock" size={15} /><span>Die ETA ist ein Fenster ab Bestellung, keine pauschale Minutenversprechung.</span></li>
              <li><Icon name="shield" size={15} /><span>Bestand wird vor dem Kauf erneut geprüft und nur zeitlich begrenzt reserviert.</span></li>
              <li><Icon name="info" size={15} /><span>Drohne ist A3-Erweiterung und im Prototyp nicht buchbar.</span></li>
            </ul>
          </aside>
        </div>
      ) : null}

      {step === 'checkout' && quote ? (
        <div className="checkout-layout">
          <section className="panel span-8" aria-labelledby="checkout-title">
            <header>
              <div>
                <h2 id="checkout-title">Bestellung prüfen</h2>
                <p className="muted">{cartStore?.name} · {fulfillmentLabel[fulfillment]} · {serviceLabel[service]}</p>
              </div>
              <Badge tone={quoteExpired ? 'bad' : 'warn'}>
                {quoteExpired ? 'Angebot abgelaufen' : 'Angebot 120 s gültig'}
              </Badge>
            </header>
            <ul className="checkout-lines">
              {cart.lines.map((line) => {
                const offer = offerById(line.offerId);
                const product = offer ? productById(offer.productId) : undefined;
                if (!offer || !product) return null;
                return (
                  <li key={line.offerId}>
                    <span>{line.quantity} × {product.title}</span>
                    <span className="mono">{euro(offer.priceMinor * line.quantity)}</span>
                  </li>
                );
              })}
            </ul>
            <div className="checkout-address">
              <h3>{fulfillment === 'delivery' ? 'Lieferadresse' : 'Abholung'}</h3>
              <p>{fulfillment === 'delivery' ? address : `${cartStore?.name}, ${cartStore?.address}`}</p>
              <p className="muted small">
                {fulfillment === 'delivery'
                  ? 'Die Adresse wird nur für diesen Auftrag an die zugewiesene Drohne freigegeben.'
                  : `Abholung ${cartStore?.pickupHours}. Ein Abholcode wird nach der Bestätigung erzeugt.`}
              </p>
            </div>
            {fulfillment === 'delivery' && cartStore ? (
              <DeliveryMap store={cartStore} destination={findDestination(address)} quote={quote} phase="preview" />
            ) : (
              <div className="notice">
                <Icon name="store" size={16} />
                <span>Selbstabholung: Es entsteht keine Lieferstrecke und keine Liefergebühr. Die Karte zeigt deshalb keine Route.</span>
              </div>
            )}
            <div className="notice notice-warn">
              <Icon name="alert" size={16} />
              <span>
                Der Prototyp zieht keine Zahlung ein. Erst Händlerannahme, Zahlungsstatus und
                gegebenenfalls Transportzusage bestätigen die Bestellung.
              </span>
            </div>
            {quoteExpired ? (
              <div className="notice notice-bad" role="alert">
                <Icon name="alert" size={16} />
                <span>
                  Das Angebot ist abgelaufen. Preis und Zeitfenster müssen neu berechnet werden, bevor die
                  Bestellung angelegt wird.
                </span>
              </div>
            ) : null}
            <div className="button-row">
              <button type="button" className="btn btn-secondary" onClick={() => onStep('cart')}>Zurück zum Warenkorb</button>
              <button type="button" className="btn btn-primary" disabled={quoteExpired} onClick={onCheckout}>
                <Icon name="card" size={16} /> Bestellung verbindlich aufgeben
              </button>
            </div>
          </section>

          <aside className="panel span-4" aria-labelledby="checkout-summary-title">
            <h2 id="checkout-summary-title">Zusammenfassung</h2>
            <dl className="price-breakdown">
              <div><dt>Warenwert</dt><dd className="mono">{euro(quote.itemsSubtotalMinor)}</dd></div>
              <div><dt>Basisgebühr</dt><dd className="mono">{euro(quote.baseFeeMinor)}</dd></div>
              <div><dt>Distanzkosten ({km(quote.distanceKm)})</dt><dd className="mono">{euro(quote.distanceFeeMinor)}</dd></div>
              <div><dt>Gewichtszuschlag ({weightKg(quote.payloadKg)})</dt><dd className="mono">{euro(quote.weightFeeMinor)}</dd></div>
              <div><dt>Service</dt><dd className="mono">{euro(quote.serviceFeeMinor)}</dd></div>
              <div className="price-total"><dt>Gesamt</dt><dd className="mono">{euro(quote.totalMinor)}</dd></div>
            </dl>
            <p className="muted small">Zeitfenster {minutesLabel(quote.etaFromMinutes)} bis {minutesLabel(quote.etaToMinutes)}.</p>
            <p className="muted small">Methode: {methodLabel[quote.method ?? 'none']} · {weightKg(quote.payloadKg)}.</p>
            {quote.droneId ? <p className="muted small">Drohne {quote.droneId} · Abgabestelle: {address}</p> : null}
            {quote.groundUnitId ? <p className="muted small">Bodenfall {quote.groundUnitId} · Abgabestelle: {address}</p> : null}
            <Badge tone="info">Demodaten, keine echte Zahlung</Badge>
          </aside>
        </div>
      ) : null}

      {step === 'tracking' ? (
        <div className="tracking-layout">
          {selectedOrder ? (
            <>
              <section className={`panel tracking-hero span-12 tracking-${selectedOrder.status}`} aria-labelledby="tracking-title">
                <div>
                  <div className="tracking-top">
                    <Badge tone={orderTone[selectedOrder.status]}>{orderStatusLabel[selectedOrder.status]}</Badge>
                    <span className="muted small"><Icon name="clock" size={14} /> Bestellung {selectedOrder.id} · {selectedOrder.createdAt}</span>
                  </div>
                  <h2 id="tracking-title">
                    {selectedOrder.status === 'DELIVERED'
                      ? 'Bestellung abgeschlossen'
                      : selectedOrder.status === 'ARRIVED'
                        ? 'Angekommen · Empfang bestätigen'
                        : selectedOrder.status === 'REJECTED'
                          ? 'Bestellung abgelehnt'
                          : selectedOrder.status === 'CANCELLED'
                            ? 'Bestellung storniert'
                            : `Voraussichtlich in ${minutesLabel(selectedOrder.quote.etaFromMinutes)} bis ${minutesLabel(selectedOrder.quote.etaToMinutes)}`}
                  </h2>
                  <p>
                    {selectedOrder.fulfillment === 'delivery'
                      ? `Lieferung an ${selectedOrder.address}.`
                      : `Selbstabholung bei ${storeById(selectedOrder.storeId)?.name}.`}
                  </p>
                  <div className="tracking-meta">
                    <span><Icon name="store" size={15} /> {storeById(selectedOrder.storeId)?.name}</span>
                    <span><Icon name="package" size={15} /> {selectedOrder.lines.reduce((sum, line) => sum + line.quantity, 0)} Artikel · {weightKg(selectedOrder.quote.payloadKg)}</span>
                    <span><Icon name="card" size={15} /> {paymentStatusLabel[selectedOrder.paymentStatus]}</span>
                    <span><Icon name="bike" size={15} /> {deliveryStatusLabel[selectedOrder.deliveryStatus]}</span>
                    {selectedOrder.fulfillment === 'delivery' && selectedOrder.droneId && !['IN_TRANSIT', 'ARRIVED', 'DELIVERED'].includes(selectedOrder.status) ? (
                      <span><Icon name="clock" size={15} /> Erwarteter Start in {Math.max(0, Math.ceil((selectedOrder.droneDepartAt - now) / 1000))} Sekunden</span>
                    ) : null}
                  </div>
                </div>
                <div className="tracking-progress">
                  {['Bestellt', 'Bestätigt', 'Vorbereitung', selectedOrder.fulfillment === 'pickup' ? 'Abholbereit' : 'Unterwegs', 'Abgeschlossen'].map((label, index) => {
                    const progress = selectedOrder.status === 'PENDING' ? 0
                      : selectedOrder.status === 'CONFIRMED' ? 1
                        : selectedOrder.status === 'FULFILLING' ? 2
                          : selectedOrder.status === 'READY' ? (selectedOrder.fulfillment === 'pickup' ? 3 : 2)
                            : selectedOrder.status === 'IN_TRANSIT' ? 3
                              : selectedOrder.status === 'ARRIVED' ? 3
                                : selectedOrder.status === 'DELIVERED' ? 4 : 0;
                    return (
                      <div key={label} className={`progress-step ${index <= progress ? 'is-done' : ''}`}>
                        <span className="progress-dot" aria-hidden="true">{index <= progress ? <Icon name="check" size={12} /> : null}</span>
                        <span>{label}</span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {selectedOrder.fulfillment === 'delivery' && storeById(selectedOrder.storeId) ? (
                <section className="panel span-12" aria-labelledby="tracking-map-title">
                  <header>
                    <div>
                      <h2 id="tracking-map-title">
                        {selectedOrder.quote.method === 'car' ? 'Bodenfall-Route und Abgabestelle' : 'Drohnenroute und Abgabestelle'}
                      </h2>
                      <p className="muted">OpenStreetMap-Karte, keine Live-Position. Die Fahrt bzw. der Flug ist simuliert; Gewicht und Distanz stehen in der Kostenaufschlüsselung.</p>
                    </div>
                    <Badge tone="info">{selectedOrder.droneId ?? selectedOrder.groundUnitId ?? 'offen'}</Badge>
                  </header>
                  <DeliveryMap
                    store={storeById(selectedOrder.storeId)!}
                    destination={findDestination(selectedOrder.address)}
                    quote={selectedOrder.quote}
                    phase={
                      selectedOrder.status === 'IN_TRANSIT'
                        ? 'flying'
                        : selectedOrder.status === 'ARRIVED' || selectedOrder.status === 'DELIVERED'
                          ? 'landed'
                          : 'waiting'
                    }
                    departAt={selectedOrder.droneDepartAt}
                  />
                </section>
              ) : null}

              <section className="panel span-7" aria-labelledby="timeline-title">
                <header>
                  <div>
                    <h2 id="timeline-title">Statusfolge</h2>
                    <p className="muted">Nur bestätigte Ereignisse. Keine erfundene Live-Position.</p>
                  </div>
                </header>
                <ol className="timeline">
                  {selectedOrder.timeline.map((entry, index) => (
                    <li key={`${entry.at}-${index}`}>
                      <span className="timeline-time mono">{entry.at}</span>
                      <span className="timeline-dot" aria-hidden="true" />
                      <span>
                        <strong>{entry.label}</strong>
                        <span className="muted small">{entry.detail} · {entry.actor}</span>
                      </span>
                    </li>
                  ))}
                </ol>
                {selectedOrder.note ? <p className="muted small">{selectedOrder.note}</p> : null}
              </section>

              <section className="panel span-5" aria-labelledby="handover-title">
                <header>
                  <div>
                    <h2 id="handover-title">{selectedOrder.fulfillment === 'pickup' ? 'Abholcode' : 'Empfangscode'}</h2>
                    <p className="muted">Nur für diese Bestellung. Einmalig verwendbar.</p>
                  </div>
                  <Badge tone="warn">Demo</Badge>
                </header>
                <div className="handover-code">
                  <span className="eyebrow">{selectedOrder.fulfillment === 'pickup' ? 'Abholung' : 'Übergabe'}</span>
                  <output className="mono">
                    {(selectedOrder.fulfillment === 'pickup' ? selectedOrder.pickupCode : selectedOrder.deliveryCode) || 'offen'}
                  </output>
                  <p className="muted small">
                    {selectedOrder.fulfillment === 'pickup'
                      ? `Bei ${storeById(selectedOrder.storeId)?.name} vorzeigen.`
                      : 'Beim Empfang nennen. Der Code wird nach Nutzung ungültig.'}
                  </p>
                </div>
                <div className="code-details">
                  <div><span className="muted small">Zahlung</span><strong>{paymentStatusLabel[selectedOrder.paymentStatus]}</strong></div>
                  <div><span className="muted small">Lieferung</span><strong>{deliveryStatusLabel[selectedOrder.deliveryStatus]}</strong></div>
                  <div>
                    <span className="muted small">{selectedOrder.fulfillment === 'pickup' ? 'Abholung' : 'Transport'}</span>
                    <strong>
                      {selectedOrder.droneId ?? selectedOrder.groundUnitId
                        ?? (selectedOrder.fulfillment === 'pickup' ? storeById(selectedOrder.storeId)?.name : 'noch offen')}
                    </strong>
                  </div>
                </div>
                <dl className="price-breakdown">
                  <div><dt>Warenwert</dt><dd className="mono">{euro(selectedOrder.quote.itemsSubtotalMinor)}</dd></div>
                  <div><dt>Basisgebühr</dt><dd className="mono">{euro(selectedOrder.quote.baseFeeMinor)}</dd></div>
                  <div><dt>Distanzkosten ({km(selectedOrder.quote.distanceKm)})</dt><dd className="mono">{euro(selectedOrder.quote.distanceFeeMinor)}</dd></div>
                  <div><dt>Gewichtszuschlag ({weightKg(selectedOrder.quote.payloadKg)})</dt><dd className="mono">{euro(selectedOrder.quote.weightFeeMinor)}</dd></div>
                  <div><dt>Service</dt><dd className="mono">{euro(selectedOrder.quote.serviceFeeMinor)}</dd></div>
                  <div className="price-total"><dt>Gesamt</dt><dd className="mono">{euro(selectedOrder.quote.totalMinor)}</dd></div>
                </dl>
                {selectedOrder.fulfillment === 'delivery' && selectedOrder.status === 'ARRIVED' ? (
                  <ReceiptCode onConfirm={(code) => onConfirmReceipt(selectedOrder.id, code)} />
                ) : null}
                <div className="button-row">
                  {['PENDING', 'CONFIRMED'].includes(selectedOrder.status) ? (
                    <button type="button" className="btn btn-secondary" onClick={() => onCancel(selectedOrder.id)}>
                      <Icon name="x" size={16} /> Storno anfragen
                    </button>
                  ) : null}
                  <button type="button" className="btn btn-secondary" onClick={() => onNotify('Problemfall für ' + selectedOrder.id + ' geöffnet. Demo, keine echte Supportaktion.')}>
                    <Icon name="phone" size={16} /> Problem melden
                  </button>
                </div>
              </section>
            </>
          ) : (
            <div className="empty-state">
              <strong>Keine Bestellung ausgewählt.</strong>
              <p>Produkte suchen und eine Bestellung aufgeben.</p>
              <button type="button" className="btn btn-primary" onClick={() => onStep('search')}>Produkte suchen</button>
            </div>
          )}
        </div>
      ) : null}

      {step === 'orders' ? (
        <section className="panel" aria-labelledby="orders-title">
          <header>
            <div>
              <h2 id="orders-title">Bestellungen</h2>
              <p className="muted">Alle Demo-Bestellungen dieses Kontos.</p>
            </div>
            <Badge tone="info">{customerOrders.length} gesamt</Badge>
          </header>
          <div className="order-list">
            {customerOrders.map((order) => (
              <button
                key={order.id}
                type="button"
                className={`order-row ${order.id === selectedOrderId ? 'is-selected' : ''}`}
                aria-pressed={order.id === selectedOrderId}
                onClick={() => {
                  onSelectOrder(order.id);
                  onStep('tracking');
                }}
              >
                <span className="mono">{order.id}</span>
                <span>{storeById(order.storeId)?.name}</span>
                <span className="muted small">{fulfillmentLabel[order.fulfillment]} · {order.lines.reduce((sum, line) => sum + line.quantity, 0)} Artikel · {weightKg(order.quote.payloadKg)}</span>
                <Badge tone={orderTone[order.status]}>{orderStatusLabel[order.status]}</Badge>
                <span className="mono">{euro(order.quote.totalMinor)}</span>
                <Icon name="chevron-right" size={16} />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      {step === 'account' ? (
        <div className="account-grid">
          <section className="panel" aria-labelledby="account-address-title">
            <h2 id="account-address-title">Adresse</h2>
            <p>{address}</p>
            <p className="muted small">Wird nur für Lieferungen an die zugewiesene Drohne freigegeben.</p>
            <button type="button" className="btn btn-secondary" onClick={() => onNotify('Adressbearbeitung ist im Prototyp nicht implementiert.')}>Adresse bearbeiten</button>
          </section>
          <section className="panel" aria-labelledby="account-payment-title">
            <h2 id="account-payment-title">Zahlung</h2>
            <p>Demo-Zahlungsart: Karte, Autorisierung und Einzug simuliert.</p>
            <p className="muted small">Keine Kartendaten im Browser. Im echten Betrieb über einen Zahlungsdienstleister.</p>
            <Badge tone="warn">Nicht produktiv</Badge>
          </section>
          <section className="panel" aria-labelledby="account-notify-title">
            <h2 id="account-notify-title">Benachrichtigungen</h2>
            <ul className="rules-list">
              <li><Icon name="check" size={15} /><span>Bestellbestätigung und Statuswechsel</span></li>
              <li><Icon name="check" size={15} /><span>Neues Zeitfenster bei Verzögerung</span></li>
              <li><Icon name="check" size={15} /><span>Abhol- oder Empfangscode</span></li>
            </ul>
          </section>
          <section className="panel" aria-labelledby="account-privacy-title">
            <h2 id="account-privacy-title">Datenschutz</h2>
            <p className="muted small">
              Kunden sehen eigene Aufträge, Händler nur ihre Filialen, der Flugbetrieb nur zugewiesene Missionen.
              Positionsdaten werden nicht erfunden. Fotos und Kameradaten sind im Pilot nicht aktiv.
            </p>
          </section>
        </div>
      ) : null}
    </>
  );
}
