import { describe, expect, it } from 'vitest';
import { merchants, offers, stores, searchOffers } from './catalog';
import { addToCart, assertQuote, createQuote, validateCart } from './checkout';

const cart = [{ offerId: 'O01', quantity: 2 }, { offerId: 'O03', quantity: 1 }];
describe('fictional catalog', () => {
  it('keeps six merchants, seven stores and thirty-six concrete variants with separate store offers', () => {
    expect(merchants).toHaveLength(6);
    expect(stores).toHaveLength(7);
    expect(offers).toHaveLength(40);
    expect(new Set(offers.map(offer => offer.variantId)).size).toBe(36);
    const comparison = offers.filter(offer => offer.variantId === 'V01');
    expect(comparison).toHaveLength(2);
    expect(new Set(comparison.map(offer => offer.storeId)).size).toBe(2);
    expect(new Set(comparison.map(offer => offer.priceMinor)).size).toBe(2);
  });
  it('keeps fresh food and all three new store ranges discoverable without mixing their variants', () => {
    expect(searchOffers('', 'Technik')).toHaveLength(4);
    expect(searchOffers('', 'Spielzeug')).toHaveLength(4);
    expect(searchOffers('', 'Blumen')).toHaveLength(4);
    expect(searchOffers('', 'Lebensmittel')).toHaveLength(4);
    expect(searchOffers('65 W').map(offer => offer.variantId)).toEqual(['V23']);
    expect(searchOffers('Taltechnik').every(offer => offer.storeId === 'S05')).toBe(true);
  });
});
describe('single-store cart and quotes', () => {
  it('calculates integer cent totals with a separate bicycle fee', () => {
    const quote = createQuote(cart, 'BICYCLE', 1_000);
    expect(quote.itemsSubtotalMinor).toBe(607);
    expect(quote.deliveryFeeMinor).toBe(390);
    expect(quote.totalMinor).toBe(997);
    expect(quote.expiresAt).toBe(121_000);
  });
  it('offers pickup without a delivery fee and describes preparation time', () => {
    const quote = createQuote(cart, 'PICKUP', 1_000);
    expect(quote.deliveryFeeMinor).toBe(0);
    expect(quote.totalMinor).toBe(607);
    expect(quote.etaToMinutes).toBe(15);
  });
  it('requires explicit store switching and preserves the original cart', () => {
    expect(() => addToCart(cart, 'O13')).toThrow(/Filialwechsel/);
    expect(cart).toHaveLength(2);
    expect(addToCart(cart, 'O13', 1, true)).toEqual([{ offerId: 'O13', quantity: 1 }]);
    expect(() => createQuote([...cart, { offerId: 'O13', quantity: 1 }], 'PICKUP')).toThrow(/Filiale/);
  });
  it.each([0, -1, 0.5, NaN, Infinity])('rejects invalid item quantity %s', quantity => {
    expect(() => validateCart([{ offerId: 'O01', quantity }])).toThrow(/positive ganze/);
  });
  it('does not silently merge duplicate lines that could bypass stock checks', () => {
    expect(() => validateCart([{ offerId: 'O05', quantity: 1 }, { offerId: 'O05', quantity: 1 }])).toThrow(/Warenkorbposition/);
  });
  it('blocks sold-out, stale and closed-store offers', () => {
    expect(() => createQuote([{ offerId: 'O08', quantity: 1 }], 'BICYCLE')).toThrow(/Menge nicht verfügbar/);
    expect(() => createQuote([{ offerId: 'O09', quantity: 1 }], 'BICYCLE')).toThrow(/unbestätigt/);
    expect(() => createQuote([{ offerId: 'O21', quantity: 1 }], 'PICKUP')).toThrow(/geschlossen/);
  });
  it('expires exactly at 120 seconds rather than one millisecond later', () => {
    const quote = createQuote(cart, 'BICYCLE', 1_000);
    expect(() => assertQuote(quote, cart, 'BICYCLE', 120_999)).not.toThrow();
    expect(() => assertQuote(quote, cart, 'BICYCLE', 121_000)).toThrow(/abgelaufen/);
  });
  it('invalidates a quote after changing quantity, delivery mode or target', () => {
    const quote = createQuote(cart, 'BICYCLE', 1_000);
    expect(() => assertQuote(quote, [{ offerId: 'O01', quantity: 1 }], 'BICYCLE', 2_000)).toThrow(/geändert/);
    expect(() => assertQuote(quote, cart, 'PICKUP', 2_000)).toThrow(/geändert/);
    expect(() => assertQuote(quote, cart, 'BICYCLE', 2_000, 'other-place')).toThrow(/geändert/);
  });
  it('rechecks price snapshots and refuses a modified quote', () => {
    const quote = createQuote(cart, 'BICYCLE', 1_000);
    quote.totalMinor = 1;
    expect(() => assertQuote(quote, cart, 'BICYCLE', 2_000)).toThrow(/nicht mehr aktuell/);
  });
  it('accepts identical item quantities in a different presentation order', () => {
    const quote = createQuote(cart, 'BICYCLE', 1_000);
    expect(() => assertQuote(quote, [...cart].reverse(), 'BICYCLE', 2_000)).not.toThrow();
  });
  it('supports only the configured demo destination', () => {
    expect(() => createQuote(cart, 'BICYCLE', 1_000, 'outside')).toThrow(/Beispielort/);
  });
});
