import { describe, expect, it } from 'vitest';
import { offers, searchOffers, stores } from './catalog';
import {
  createQuote,
  DELIVERY_ETA_MINUTES,
  DELIVERY_FEE_MINOR,
  deliveryFeeFor,
  etaFor,
  PICKUP_ETA_MINUTES,
  QUOTE_VALIDITY_MS,
} from './checkout';
import {
  deliveryStatusLabel,
  noDeliveryLabel,
  orderStatusLabel,
  paymentStatusLabel,
  preparationStatusLabel,
} from './orders';
import { DEFAULT_DRONE_TARGET, stations } from './routing';
import { createEmptySession, emptySession, restoreSession } from '../demo/session';

/**
 * Diese Tests halten die Stellen zusammen, an denen Anzeige und Fachlogik
 * auseinanderlaufen können: Anzeigetexte, Gebühren, Zeitfenster und Standardziel.
 */
describe('Anzeige und Fachlogik bleiben deckungsgleich', () => {
  it('beschriftet jeden internen Zustand auf Deutsch und nie mit dem Rohwert', () => {
    const maps = {
      Bestellung: orderStatusLabel,
      Zahlung: paymentStatusLabel,
      Vorbereitung: preparationStatusLabel,
      Lieferung: deliveryStatusLabel,
    };
    for (const [name, map] of Object.entries(maps)) {
      const entries = Object.entries(map);
      expect(entries.length, `${name} braucht Einträge`).toBeGreaterThan(0);
      for (const [key, label] of entries) {
        expect(label, `${name}.${key} darf nicht der Rohwert sein`).not.toBe(key);
        expect(label.trim(), `${name}.${key} braucht einen Text`).not.toBe('');
        expect(label, `${name}.${key} muss deutsch beschriftet sein`).not.toMatch(/^[A-Z_]+$/);
      }
    }
    expect(noDeliveryLabel).toBe('Kein Lieferauftrag');
  });

  it('nutzt für alle Modi dieselbe Gebühr wie das Angebot', () => {
    const cart = [{ offerId: offers[0].id, quantity: 1 }];
    for (const mode of ['DRONE', 'BICYCLE', 'PICKUP'] as const) {
      const quote = createQuote(cart, mode, 1_000);
      expect(quote.deliveryFeeMinor, mode).toBe(deliveryFeeFor(mode));
      expect(quote.totalMinor, mode).toBe(quote.itemsSubtotalMinor + deliveryFeeFor(mode));
      const eta = etaFor(mode);
      expect([quote.etaFromMinutes, quote.etaToMinutes], mode).toEqual([eta.from, eta.to]);
    }
    expect(deliveryFeeFor('PICKUP')).toBe(0);
    expect(deliveryFeeFor('DRONE')).toBe(DELIVERY_FEE_MINOR);
    expect(etaFor('PICKUP')).toEqual(PICKUP_ETA_MINUTES);
    expect(etaFor('DRONE')).toEqual(DELIVERY_ETA_MINUTES);
  });

  it('hält die Angebotsgültigkeit an einer Stelle', () => {
    const quote = createQuote([{ offerId: offers[0].id, quantity: 1 }], 'PICKUP', 5_000);
    expect(quote.expiresAt).toBe(5_000 + QUOTE_VALIDITY_MS);
    expect(quote.validForSeconds * 1_000).toBe(QUOTE_VALIDITY_MS);
  });

  it('findet Kategorien über die Suche, weil sie als Filter sichtbar sind', () => {
    for (const term of ['Blumen', 'Technik', 'Bücher', 'Pflege & Zuhause']) {
      const hits = searchOffers(term, 'Alle');
      expect(hits.length, term).toBeGreaterThan(0);
      expect(hits.every(offer => offer.category === term), term).toBe(true);
    }
    expect(searchOffers('Auswahl ohne Treffer', 'Alle')).toEqual([]);
  });

  it('sucht weiterhin nach Produkt und Filiale', () => {
    expect(searchOffers('Haferflocken', 'Alle').length).toBeGreaterThan(0);
    expect(searchOffers('Elberfeld', 'Alle').length).toBeGreaterThan(0);
    expect(searchOffers('Haferflocken', 'Technik')).toEqual([]);
  });

  it('verwendet ein Standardziel, das im Demo-Netz existiert', () => {
    expect(stations.some(station => station.id === DEFAULT_DRONE_TARGET)).toBe(true);
    expect(emptySession.target).toBe(DEFAULT_DRONE_TARGET);
  });

  it('gibt für eine neue Sitzung keine geteilten Arrays zurück', () => {
    const first = createEmptySession();
    const second = createEmptySession();
    expect(first.cart).not.toBe(second.cart);
    expect(first.orders).not.toBe(second.orders);
    expect(first.cart).not.toBe(emptySession.cart);
    first.cart.push({ offerId: offers[0].id, quantity: 1 });
    expect(emptySession.cart).toEqual([]);
    expect(emptySession.orders).toEqual([]);
    expect(second.cart).toEqual([]);
  });

  it('stellt eine gültige Sitzung unverändert wieder her und lehnt Altstände ab', () => {
    const openStore = stores.find(store => store.open)!;
    const offer = offers.find(item => item.storeId === openStore.id && item.stock > 0)!;
    const raw = JSON.stringify({ ...createEmptySession(), cart: [{ offerId: offer.id, quantity: 2 }], target: 'Z01' });
    const restored = restoreSession(raw);
    expect(restored.cart).toEqual([{ offerId: offer.id, quantity: 2 }]);
    expect(restored.target).toBe('Z01');
    expect(restoreSession('kein json').cart).toEqual([]);
    expect(restoreSession(JSON.stringify({ version: 3 })).cart).toEqual([]);
  });
});
