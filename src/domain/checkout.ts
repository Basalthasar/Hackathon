import { offers, stores, type CartLine, type Offer, type Store } from './catalog';
import { planRoute, type Scenario } from './routing';

export type FulfillmentMode = 'DRONE' | 'BICYCLE' | 'PICKUP';
export class DomainError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'DomainError'; }
}
export interface QuoteLine extends CartLine { name: string; priceMinor: number; variantId: string; unit: string }
export interface Quote {
  id: string; fingerprint: string; storeId: string; mode: FulfillmentMode; destinationId: string;
  lines: QuoteLine[]; currency: 'EUR'; itemsSubtotalMinor: number; deliveryFeeMinor: number;
  serviceFeeMinor: number; totalMinor: number; etaFromMinutes: number; etaToMinutes: number;
  createdAt: number; expiresAt: number; validForSeconds: 120; isDemo: true;
  vehicleId?: string; routingScenario?: Scenario; routeMinutes?: number; missionMinutes?: number; flightClearance?: false; realWeatherStatus?: 'UNBESTIMMT';
}
export const QUOTE_VALIDITY_MS = 120_000;
export const DEFAULT_DESTINATION = 'demo-home';

function modeCheck(mode: FulfillmentMode): void {
  if (mode !== 'DRONE' && mode !== 'BICYCLE' && mode !== 'PICKUP') throw new DomainError('INVALID_MODE', 'Bitte Drohnenlieferung, Fahrradlieferung oder Selbstabholung wählen.');
}
export function cartFingerprint(cart: readonly CartLine[], mode: FulfillmentMode, destinationId: string, scenario: Scenario = 'normal'): string {
  return JSON.stringify({ mode, destinationId, ...(mode === 'DRONE' ? { scenario } : {}), cart: [...cart].sort((a, b) => a.offerId.localeCompare(b.offerId)).map(line => [line.offerId, line.quantity]) });
}
export function validateCart(cart: readonly CartLine[], catalog: readonly Offer[] = offers, storeCatalog: readonly Store[] = stores): { storeId: string; lines: QuoteLine[] } {
  if (!cart.length) throw new DomainError('EMPTY_CART', 'Dein Warenkorb ist noch leer.');
  const known = new Set<string>();
  const lines: QuoteLine[] = [];
  let storeId = '';
  for (const line of cart) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity <= 0) throw new DomainError('INVALID_QUANTITY', 'Die Menge muss eine positive ganze Stückzahl sein.');
    if (known.has(line.offerId)) throw new DomainError('DUPLICATE_LINE', 'Ein Artikel darf nur eine Warenkorbposition haben.');
    known.add(line.offerId);
    const offer = catalog.find(item => item.id === line.offerId);
    if (!offer) throw new DomainError('UNKNOWN_OFFER', 'Dieses Angebot ist nicht mehr verfügbar.');
    if (!Number.isSafeInteger(offer.priceMinor) || offer.priceMinor < 0) throw new DomainError('INVALID_PRICE', 'Dieses Angebot hat keinen gültigen Preis.');
    if (storeId && storeId !== offer.storeId) throw new DomainError('STORE_MISMATCH', 'Ein Warenkorb gehört zu einer Filiale. Bitte den Filialwechsel bestätigen.');
    storeId = offer.storeId;
    const store = storeCatalog.find(item => item.id === storeId);
    if (!store?.open) throw new DomainError('STORE_CLOSED', 'Diese Filiale ist in der Demo geschlossen.');
    if (offer.quality !== 'confirmed') throw new DomainError('STOCK_UNCONFIRMED', 'Dieser Bestand ist veraltet oder unbestätigt. Eine Sofortbestellung ist nicht möglich.');
    if (line.quantity > offer.stock) throw new DomainError('OUT_OF_STOCK', `Für „${offer.name}“ ist die gewünschte Menge nicht verfügbar.`);
    lines.push({ ...line, name: offer.name, priceMinor: offer.priceMinor, variantId: offer.variantId, unit: offer.unit });
  }
  return { storeId, lines };
}
export function addToCart(cart: readonly CartLine[], offerId: string, quantity = 1, allowStoreSwitch = false): CartLine[] {
  if (!Number.isSafeInteger(quantity) || quantity <= 0) throw new DomainError('INVALID_QUANTITY', 'Die zusätzliche Menge muss eine positive ganze Stückzahl sein.');
  const offer = offers.find(item => item.id === offerId);
  if (!offer) throw new DomainError('UNKNOWN_OFFER', 'Dieses Angebot ist nicht verfügbar.');
  const existingStore = cart.length ? offers.find(item => item.id === cart[0].offerId)?.storeId : undefined;
  if (existingStore && existingStore !== offer.storeId && !allowStoreSwitch) throw new DomainError('STORE_MISMATCH', 'Der Filialwechsel ersetzt den bisherigen Warenkorb.');
  const next = existingStore && existingStore !== offer.storeId ? [] : cart.map(line => ({ ...line }));
  const match = next.find(line => line.offerId === offerId);
  if (match) match.quantity += quantity;
  else next.push({ offerId, quantity });
  validateCart(next);
  return next;
}
export function createQuote(cart: readonly CartLine[], mode: FulfillmentMode, now = Date.now(), destinationId = mode === 'DRONE' ? 'Z03' : DEFAULT_DESTINATION, scenario: Scenario = 'normal'): Quote {
  modeCheck(mode);
  if (!['normal', 'blocked', 'full', 'offline', 'weather'].includes(scenario)) throw new DomainError('INVALID_SCENARIO', 'Dieses Demo-Szenario ist nicht verfügbar.');
  const route = mode === 'DRONE' ? planRoute(destinationId, scenario) : null;
  if (route && !route.available) throw new DomainError('DRONE_UNAVAILABLE', route.reasons.join(' '));
  if (mode === 'BICYCLE' && destinationId !== DEFAULT_DESTINATION) throw new DomainError('OUT_OF_AREA', 'Die Fahrrad-Demo liefert ausschließlich an den vorgegebenen Beispielort.');
  const { storeId, lines } = validateCart(cart);
  const itemsSubtotalMinor = lines.reduce((sum, line) => sum + line.priceMinor * line.quantity, 0);
  const deliveryFeeMinor = mode === 'PICKUP' ? 0 : 390;
  if (!Number.isSafeInteger(itemsSubtotalMinor + deliveryFeeMinor)) throw new DomainError('INVALID_TOTAL', 'Der Warenkorb kann nicht berechnet werden.');
  const fingerprint = cartFingerprint(cart, mode, destinationId, scenario);
  let hash = 0;
  for (const char of fingerprint) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) | 0;
  return {
    id: `DQ-${now}-${Math.abs(hash).toString(36)}`, fingerprint, storeId, mode, destinationId, lines,
    currency: 'EUR', itemsSubtotalMinor, deliveryFeeMinor, serviceFeeMinor: 0, totalMinor: itemsSubtotalMinor + deliveryFeeMinor,
    etaFromMinutes: mode === 'PICKUP' ? 10 : 25, etaToMinutes: mode === 'PICKUP' ? 15 : 40,
    createdAt: now, expiresAt: now + QUOTE_VALIDITY_MS, validForSeconds: 120, isDemo: true,
    ...(route ? { vehicleId: route.vehicleId!, routingScenario: scenario, routeMinutes: route.minutes, missionMinutes: route.missionMinutes, flightClearance: false as const, realWeatherStatus: 'UNBESTIMMT' as const } : {}),
  };
}
export function assertQuote(quote: Quote, cart: readonly CartLine[], mode = quote.mode, now = Date.now(), destinationId = quote.destinationId, scenario: Scenario = quote.routingScenario ?? 'normal'): void {
  modeCheck(mode);
  if (!Number.isFinite(quote.createdAt) || !Number.isFinite(quote.expiresAt) || quote.expiresAt !== quote.createdAt + QUOTE_VALIDITY_MS || now < quote.createdAt || now >= quote.expiresAt) throw new DomainError('QUOTE_EXPIRED', 'Das Demo-Angebot ist abgelaufen. Bitte neu berechnen.');
  if (quote.mode !== mode || quote.destinationId !== destinationId || quote.isDemo !== true || quote.currency !== 'EUR' || quote.fingerprint !== cartFingerprint(cart, mode, destinationId, scenario) || (mode === 'DRONE' && quote.routingScenario !== scenario)) throw new DomainError('QUOTE_CHANGED', 'Warenkorb, Empfang oder Ziel wurden geändert. Bitte neu berechnen.');
  const current = createQuote(cart, mode, now, destinationId, scenario);
  const sorted = (lines: QuoteLine[]) => [...lines].sort((a, b) => a.offerId.localeCompare(b.offerId));
  if ((mode === 'DRONE' && (quote.vehicleId !== current.vehicleId || quote.routeMinutes !== current.routeMinutes || quote.missionMinutes !== current.missionMinutes || quote.flightClearance !== false || quote.realWeatherStatus !== 'UNBESTIMMT')) || quote.storeId !== current.storeId || quote.totalMinor !== current.totalMinor || quote.itemsSubtotalMinor !== current.itemsSubtotalMinor || quote.deliveryFeeMinor !== current.deliveryFeeMinor || quote.serviceFeeMinor !== current.serviceFeeMinor || JSON.stringify(sorted(quote.lines)) !== JSON.stringify(sorted(current.lines))) throw new DomainError('QUOTE_CHANGED', 'Preis oder Artikel sind nicht mehr aktuell. Bitte neu berechnen.');
}
