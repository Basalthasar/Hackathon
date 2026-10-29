import { findDestination, findDrone, findGroundUnit, MAP_KM_PER_UNIT, offerById, productById, storeById } from '../data/demo';
import type { Cart, FulfillmentMode, Quote, ServiceLevel, TransportMethod } from '../data/types';

const baseFee: Record<TransportMethod, number> = {
  drone: 290,
  heavy_drone: 490,
  car: 650,
  bicycle: 250,
  scooter: 320,
};

const perKmFee: Record<TransportMethod, number> = {
  drone: 22,
  heavy_drone: 32,
  car: 65,
  bicycle: 35,
  scooter: 55,
};

export function calculateQuote({
  cart,
  storeId,
  fulfillment,
  service,
  address,
}: {
  cart: Cart;
  storeId: string;
  fulfillment: FulfillmentMode;
  service: ServiceLevel;
  address: string;
}): { quote?: Quote; error?: string } {
  const store = storeById(storeId);
  if (!store) return { error: 'Filiale nicht gefunden.' };
  if (store.status !== 'open') {
    return { error: 'Die Filiale ist derzeit geschlossen. Selbstabholung oder eine andere Filiale wählen.' };
  }
  if (cart.lines.length === 0) return { error: 'Der Warenkorb ist leer.' };

  const destination = findDestination(address);
  const rawDistance = Math.hypot(store.x - destination.x, store.y - destination.y) * MAP_KM_PER_UNIT;
  const distanceKm = fulfillment === 'delivery' ? Math.max(0.4, Math.round(rawDistance * 10) / 10) : 0;

  if (fulfillment === 'delivery' && distanceKm > store.deliveryRadiusKm) {
    return {
      error: `Die Adresse liegt ${distanceKm.toFixed(1).replace('.', ',')} km entfernt, außerhalb des Lieferradius von ${store.deliveryRadiusKm} km. Selbstabholung ist möglich.`,
    };
  }

  let subtotal = 0;
  let weight = 0;
  for (const line of cart.lines) {
    const offer = offerById(line.offerId);
    const product = offer ? productById(offer.productId) : undefined;
    if (!offer || !product) return { error: 'Ein Artikel im Warenkorb ist nicht mehr verfügbar.' };
    if (offer.storeId !== storeId) return { error: 'Alle Artikel müssen aus derselben Filiale stammen.' };
    if (offer.stock === 'unavailable') return { error: `${product.title} ist in dieser Filiale nicht verfügbar.` };
    if (offer.stock === 'unconfirmed') {
      return { error: `Der Bestand von ${product.title} ist unbestätigt. Erst nach Bestätigung ist eine verbindliche Bestellung möglich.` };
    }
    subtotal += offer.priceMinor * line.quantity;
    weight += product.weightKg * line.quantity;
  }

  let method: TransportMethod | null = null;
  let droneId: string | null = null;
  let groundUnitId: string | null = null;
  if (fulfillment === 'delivery') {
    if (weight > 80) return { error: 'Die Bestellung überschreitet die Kapazität der verfügbaren Drohnen und des Bodenfalls.' };
    const drone = findDrone(weight, distanceKm);
    if (drone) {
      method = drone.maxPayloadKg <= 25 ? 'drone' : 'heavy_drone';
      droneId = drone.id;
    } else {
      // Bodenfall: ohne Bodeneinheit ist die Bestellung nicht abschließbar, also nicht buchbar.
      const unit = findGroundUnit(weight);
      if (!unit) {
        return { error: `Für ${weight.toFixed(1).replace('.', ',')} kg ist weder eine Drohne noch eine Bodeneinheit verfügbar. Selbstabholung wählen.` };
      }
      method = 'car';
      groundUnitId = unit.id;
    }
  }

  const base = method ? baseFee[method] : 0;
  const perKm = method ? perKmFee[method] : 0;
  const distanceFee = method ? Math.round(distanceKm * perKm) : 0;
  const deliveryFee = base + distanceFee;
  const weightFee = method ? Math.round(Math.max(0, weight - 5) * 25) : 0;
  const expressFee = service === 'express' && fulfillment === 'delivery' ? 250 : 0;
  const baseEta = store.prepMinutes + (fulfillment === 'pickup' ? 5 : 7 + Math.round(distanceKm * 2));
  const etaFrom = service === 'express' ? Math.max(10, baseEta - 5) : baseEta;
  const etaTo = service === 'express' ? etaFrom + 10 : etaFrom + 15;

  return {
    quote: {
      itemsSubtotalMinor: subtotal,
      payloadKg: weight,
      weightFeeMinor: weightFee,
      droneId,
      groundUnitId,
      // Illustrative Annahme des Prototyps, kein nachgewiesener Höhenbereich.
      altitudeBandM: method === 'drone' || method === 'heavy_drone' ? [60, 80] : null,
      // Ohne belegte Wetterquelle und belegte Fahrzeuggrenzen bleibt die Bewertung unbestimmt.
      weather: method === 'drone' || method === 'heavy_drone' ? 'unknown' : null,
      distanceKm,
      baseFeeMinor: base,
      distanceFeeMinor: distanceFee,
      perKmFeeMinor: perKm,
      deliveryFeeMinor: deliveryFee,
      serviceFeeMinor: expressFee,
      totalMinor: subtotal + deliveryFee + weightFee + expressFee,
      etaFromMinutes: etaFrom,
      etaToMinutes: etaTo,
      method,
      methodPolicy: fulfillment === 'pickup'
        ? 'Selbstabholung, kein Transportauftrag'
        : 'Drohne zuerst; Auto nur bei Überschreitung von Nutzlast oder Reichweite (Kapazitäten illustrativ)',
      validUntil: Date.now() + 120_000,
      isDemo: true,
    },
  };
}
