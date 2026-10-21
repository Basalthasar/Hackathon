import { offers, type CartLine } from './catalog';
import { assertQuote, cartFingerprint, DomainError, type FulfillmentMode, type Quote } from './checkout';
import { planRoute, type Scenario } from './routing';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'FULFILLING' | 'COMPLETED';
export type PaymentStatus = 'AUTHORIZED' | 'CAPTURED';
export type PreparationStatus = 'NEW' | 'ACCEPTED' | 'PICKING' | 'READY' | 'HANDED_OVER';
export type DeliveryStatus = 'CREATED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'AT_DESTINATION' | 'STORED' | 'READY_FOR_COLLECTION' | 'COLLECTED' | 'DELIVERED';
export interface DemoEvent { id: string; label: string; at: number; source: 'simulation' }
export interface DemoDelivery { id: string; status: DeliveryStatus; method: 'DRONE' | 'BICYCLE'; courierName: string; progress: number }
export interface DemoOrder {
  id: string; checkoutKey: string; requestFingerprint: string; createdAt: number; updatedAt: number;
  quote: Quote; mode: FulfillmentMode; step: number; orderStatus: OrderStatus;
  paymentStatus: PaymentStatus; preparationStatus: PreparationStatus; delivery: DemoDelivery | null;
  events: DemoEvent[]; isDemo: true;
}
export interface CheckoutInput { quote: Quote; cart: readonly CartLine[]; idempotencyKey: string; mode?: FulfillmentMode; destinationId?: string; scenario?: Scenario }
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const bicycleLabels = ['Demo-Bestellung eingegangen', 'Händler nimmt an · Demo-Zahlung bestätigt', 'Artikel werden zusammengestellt', 'Beim Händler abholbereit', 'Fahrradkurier hat übernommen', 'Fahrradkurier ist unterwegs', 'Am Beispielziel angekommen', 'Empfang in der Demo bestätigt'];
const pickupLabels = ['Demo-Bestellung eingegangen', 'Händler nimmt an · Demo-Zahlung bestätigt', 'Artikel werden zusammengestellt', 'Beim Händler abholbereit', 'Selbstabholung in der Demo bestätigt'];
const droneLabels = ['Demo-Bestellung eingegangen', 'Händler nimmt an · Demo-Zahlung bestätigt', 'Artikel werden zusammengestellt', 'Für den Zubringer zum Hub bereit', 'Im Demo-Hub an die Drohne übergeben', 'Drohne ist unterwegs', 'An der Zielstation angekommen', 'Paket in der Station eingelagert', 'Paket an der Station abholbereit', 'Kundenabholung in der Demo bestätigt'];
export function orderStepLabels(mode: FulfillmentMode): readonly string[] { return mode === 'DRONE' ? droneLabels : mode === 'PICKUP' ? pickupLabels : bicycleLabels; }

/** One explicit, deterministic demo event. Arrival is a separate event from receipt. */
export function stepOrder(order: DemoOrder, now = Date.now()): DemoOrder {
  if (!restoreOrder(order)) throw new DomainError('INVALID_STATE', 'Der gespeicherte Demo-Zustand ist ungültig. Bitte die Demo neu starten.');
  if (order.orderStatus === 'COMPLETED') return clone(order);
  const next = clone(order);
  const labels = orderStepLabels(order.mode);
  const step = Math.min(order.step + 1, labels.length - 1);
  next.step = step;
  next.updatedAt = Math.max(order.updatedAt, now);
  if (step === 1) {
    next.orderStatus = 'CONFIRMED'; next.paymentStatus = 'CAPTURED'; next.preparationStatus = 'ACCEPTED';
    if (next.delivery) next.delivery.status = 'ASSIGNED';
  } else if (step === 2) {
    if (next.paymentStatus !== 'CAPTURED' || next.preparationStatus !== 'ACCEPTED') throw new DomainError('INVALID_TRANSITION', 'Zusammenstellen erfordert die bestätigte Demo-Zahlung und Händlerannahme.');
    next.orderStatus = 'FULFILLING'; next.preparationStatus = 'PICKING';
  } else if (step === 3) {
    if (next.paymentStatus !== 'CAPTURED' || next.preparationStatus !== 'PICKING') throw new DomainError('INVALID_TRANSITION', 'Abholbereitschaft erfordert die abgeschlossene Vorbereitung.');
    next.preparationStatus = 'READY';
  } else if (step === 4) {
    if (next.paymentStatus !== 'CAPTURED' || next.preparationStatus !== 'READY') throw new DomainError('INVALID_TRANSITION', 'Übergabe ist erst nach Demo-Zahlung und Abholbereitschaft möglich.');
    next.preparationStatus = 'HANDED_OVER';
    if (next.delivery) { next.delivery.status = 'PICKED_UP'; next.delivery.progress = 0; }
    else next.orderStatus = 'COMPLETED';
  } else if (next.delivery && step === 5) {
    next.delivery.status = 'IN_TRANSIT'; next.delivery.progress = 0.5;
  } else if (next.delivery && step === 6) {
    next.delivery.status = 'AT_DESTINATION'; next.delivery.progress = 1;
  } else if (next.delivery && step === 7) {
    next.delivery.status = next.mode === 'DRONE' ? 'STORED' : 'DELIVERED'; next.delivery.progress = 1;
    if (next.mode !== 'DRONE') next.orderStatus = 'COMPLETED';
  } else if (next.delivery && next.mode === 'DRONE' && step === 8) {
    next.delivery.status = 'READY_FOR_COLLECTION';
  } else if (next.delivery && next.mode === 'DRONE' && step === 9) {
    next.delivery.status = 'COLLECTED'; next.orderStatus = 'COMPLETED';
  }
  next.events.push({ id: `${next.id}-E${step}`, label: labels[step], at: next.updatedAt, source: 'simulation' });
  return next;
}

/** Defensive restoration of our versioned browser data; invalid sessions reset safely. */
export function restoreOrder(value: unknown): DemoOrder | null {
  if (!value || typeof value !== 'object') return null;
  const order = value as DemoOrder;
  if (order.isDemo !== true || typeof order.id !== 'string' || typeof order.checkoutKey !== 'string' || !order.checkoutKey || typeof order.requestFingerprint !== 'string') return null;
  if (order.mode !== 'DRONE' && order.mode !== 'PICKUP' && order.mode !== 'BICYCLE') return null;
  if (!Number.isFinite(order.createdAt) || !Number.isFinite(order.updatedAt) || order.updatedAt < order.createdAt) return null;
  const labels = orderStepLabels(order.mode);
  if (!Number.isInteger(order.step) || order.step < 0 || order.step >= labels.length) return null;
  if (!order.quote || order.quote.mode !== order.mode || order.quote.isDemo !== true || !Array.isArray(order.quote.lines) || !order.quote.lines.length) return null;
  if (!Number.isFinite(order.quote.createdAt) || !Number.isFinite(order.quote.expiresAt) || order.quote.expiresAt !== order.quote.createdAt + 120_000) return null;
  if (!order.quote.lines.every(line => line && typeof line.name === 'string' && typeof line.offerId === 'string' && Number.isSafeInteger(line.quantity) && line.quantity > 0 && Number.isSafeInteger(line.priceMinor) && line.priceMinor >= 0)) return null;
  const known = new Set<string>();
  for (const line of order.quote.lines) {
    const offer = offers.find(item => item.id === line.offerId);
    if (!offer || offer.storeId !== order.quote.storeId || offer.variantId !== line.variantId || line.quantity > offer.stock || known.has(line.offerId)) return null;
    known.add(line.offerId);
  }
  const subtotal = order.quote.lines.reduce((sum, line) => sum + line.priceMinor * line.quantity, 0);
  const fee = order.mode === 'PICKUP' ? 0 : 390;
  if (!Number.isSafeInteger(subtotal) || order.quote.itemsSubtotalMinor !== subtotal || order.quote.deliveryFeeMinor !== fee || order.quote.serviceFeeMinor !== 0 || order.quote.totalMinor !== subtotal + fee) return null;
  if (order.quote.fingerprint !== cartFingerprint(order.quote.lines, order.mode, order.quote.destinationId, order.quote.routingScenario)) return null;
  if (order.mode === 'DRONE') {
    if (!['normal', 'blocked'].includes(order.quote.routingScenario ?? '')) return null;
    const route = planRoute(order.quote.destinationId, order.quote.routingScenario);
    if (!route.available || order.quote.vehicleId !== route.vehicleId || order.quote.routeMinutes !== route.minutes || order.quote.missionMinutes !== route.missionMinutes || order.quote.flightClearance !== false || order.quote.realWeatherStatus !== 'UNBESTIMMT') return null;
  }
  if (order.requestFingerprint !== `${order.quote.id}:${order.quote.fingerprint}`) return null;
  const step = order.step;
  const completed = step === labels.length - 1;
  const expectedOrder: OrderStatus = completed ? 'COMPLETED' : step === 0 ? 'PENDING' : step === 1 ? 'CONFIRMED' : 'FULFILLING';
  const expectedPreparation: PreparationStatus = step === 0 ? 'NEW' : step === 1 ? 'ACCEPTED' : step === 2 ? 'PICKING' : step === 3 ? 'READY' : 'HANDED_OVER';
  if (order.orderStatus !== expectedOrder || order.paymentStatus !== (step === 0 ? 'AUTHORIZED' : 'CAPTURED') || order.preparationStatus !== expectedPreparation) return null;
  if (order.mode === 'PICKUP') { if (order.delivery !== null) return null; }
  else {
    const expectedDelivery: DeliveryStatus = step === 0 ? 'CREATED' : step <= 3 ? 'ASSIGNED' : step === 4 ? 'PICKED_UP' : step === 5 ? 'IN_TRANSIT' : step === 6 ? 'AT_DESTINATION' : order.mode === 'DRONE' && step === 7 ? 'STORED' : order.mode === 'DRONE' && step === 8 ? 'READY_FOR_COLLECTION' : order.mode === 'DRONE' ? 'COLLECTED' : 'DELIVERED';
    if (!order.delivery || order.delivery.status !== expectedDelivery || order.delivery.method !== order.mode || order.delivery.progress !== (step >= 6 ? 1 : step === 5 ? 0.5 : 0)) return null;
  }
  if (!Array.isArray(order.events) || order.events.length !== step + 1 || !order.events.every((event, index) => event && event.id === `${order.id}-E${index}` && event.label === labels[index] && event.source === 'simulation' && Number.isFinite(event.at))) return null;
  return clone(order);
}
export function restoreOrders(value: unknown): DemoOrder[] {
  if (!Array.isArray(value)) return [];
  const result: DemoOrder[] = [];
  for (const item of value) { const restored = restoreOrder(item); if (restored && !result.some(order => order.id === restored.id || order.checkoutKey === restored.checkoutKey)) result.push(restored); }
  return result;
}

/** Session-local service. No payment provider, shared database or cross-device stock. */
export class DemoOrderService {
  private orders = new Map<string, DemoOrder>();
  constructor(initialOrders: readonly DemoOrder[] = []) { for (const order of restoreOrders(initialOrders)) this.orders.set(order.id, order); }
  checkout(input: CheckoutInput, now = Date.now()): DemoOrder {
    const mode = input.mode ?? input.quote.mode;
    const destinationId = input.destinationId ?? input.quote.destinationId;
    const scenario = input.scenario ?? input.quote.routingScenario ?? 'normal';
    if (typeof input.idempotencyKey !== 'string' || !input.idempotencyKey.trim() || input.idempotencyKey.length > 200) throw new DomainError('INVALID_KEY', 'Für den Demo-Checkout fehlt ein gültiger Wiederholungsschlüssel.');
    const requestFingerprint = `${input.quote.id}:${cartFingerprint(input.cart, mode, destinationId, scenario)}`;
    const existing = [...this.orders.values()].find(order => order.checkoutKey === input.idempotencyKey);
    if (existing) {
      if (existing.requestFingerprint !== requestFingerprint) throw new DomainError('IDEMPOTENCY_CONFLICT', 'Dieser Checkout-Schlüssel wurde bereits für einen anderen Auftrag verwendet.');
      return clone(existing);
    }
    assertQuote(input.quote, input.cart, mode, now, destinationId, scenario);
    for (const line of input.cart) {
      const alreadyAllocated = [...this.orders.values()].reduce((sum, order) => sum + (order.quote.lines.find(item => item.offerId === line.offerId)?.quantity ?? 0), 0);
      const offer = offers.find(item => item.id === line.offerId)!;
      if (alreadyAllocated + line.quantity > offer.stock) throw new DomainError('OUT_OF_STOCK', 'Der Bestand wurde in dieser Demo-Sitzung bereits vergeben. Bitte einen anderen Artikel wählen oder die Demo neu starten.');
    }
    let sequence = this.orders.size + 1;
    while (this.orders.has(`DD-${String(sequence).padStart(4, '0')}`)) sequence++;
    const id = `DD-${String(sequence).padStart(4, '0')}`;
    const order: DemoOrder = {
      id, checkoutKey: input.idempotencyKey, requestFingerprint, createdAt: now, updatedAt: now,
      quote: clone(input.quote), mode, step: 0, orderStatus: 'PENDING', paymentStatus: 'AUTHORIZED', preparationStatus: 'NEW',
      delivery: mode !== 'PICKUP' ? { id: `${id}-D`, status: 'CREATED', method: mode, courierName: mode === 'DRONE' ? 'Drohne A · Simulation' : 'Mara · Demo-Kurierin', progress: 0 } : null,
      events: [{ id: `${id}-E0`, label: orderStepLabels(mode)[0], at: now, source: 'simulation' }], isDemo: true,
    };
    this.orders.set(id, order);
    return clone(order);
  }
  list(): DemoOrder[] { return [...this.orders.values()].map(order => clone(order)); }
  get(id: string): DemoOrder | undefined { const order = this.orders.get(id); return order ? clone(order) : undefined; }
  step(id: string, now = Date.now()): DemoOrder {
    const order = this.orders.get(id);
    if (!order) throw new DomainError('UNKNOWN_ORDER', 'Diese Demo-Bestellung wurde nicht gefunden.');
    const next = stepOrder(order, now); this.orders.set(id, next); return clone(next);
  }
  reset(): void { this.orders.clear(); }
}
