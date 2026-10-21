import { describe, expect, it } from 'vitest';
import { assertQuote, createQuote } from './checkout';
import { DemoOrderService, restoreOrder, stepOrder } from './orders';
import { emptySession, restoreSession } from '../demo/session';

const cart = [{ offerId: 'O01', quantity: 1 }];
describe('drone checkout and station receipt', () => {
  it('records a station and illustrative route without giving flight clearance', () => {
    const quote = createQuote(cart, 'DRONE', 1_000);
    expect(quote.destinationId).toBe('Z03');
    expect(quote.deliveryFeeMinor).toBe(390);
    expect(quote.routingScenario).toBe('normal');
    expect(quote.missionMinutes).toBeGreaterThan(quote.routeMinutes!);
    expect(quote.flightClearance).toBe(false);
    expect(quote.realWeatherStatus).toBe('UNBESTIMMT');
    expect(() => assertQuote(quote, cart, 'DRONE', 2_000)).not.toThrow();
  });
  it.each(['full', 'offline', 'weather'] as const)('refuses a new drone order in %s while keeping ground alternatives', scenario => {
    expect(() => createQuote(cart, 'DRONE', 1_000, 'Z03', scenario)).toThrow();
    expect(() => createQuote(cart, 'BICYCLE', 1_000, undefined, scenario)).not.toThrow();
    expect(() => createQuote(cart, 'PICKUP', 1_000, undefined, scenario)).not.toThrow();
  });
  it('uses the longer alternative and invalidates quotes after scenario or station changes', () => {
    const normal = createQuote(cart, 'DRONE', 1_000, 'Z03');
    const alternative = createQuote(cart, 'DRONE', 1_000, 'Z03', 'blocked');
    expect(alternative.routeMinutes).toBeGreaterThan(normal.routeMinutes!);
    expect(alternative.id).not.toBe(normal.id);
    expect(() => assertQuote(normal, cart, 'DRONE', 2_000, 'Z03', 'blocked')).toThrow(/geändert/);
    expect(() => assertQuote(normal, cart, 'DRONE', 2_000, 'Z02')).toThrow(/geändert/);
    expect(() => createQuote(cart, 'DRONE', 1_000, 'demo-home')).toThrow(/Demo-Netz/);
    expect(() => assertQuote({ ...normal, flightClearance: true } as never, cart, 'DRONE', 2_000)).toThrow();
    expect(() => new DemoOrderService().checkout({ quote: normal, cart, idempotencyKey: 'stale', scenario: 'weather' }, 2_000)).toThrow(/geändert/);
  });
  it('restores each step and separates arrival, storage, readiness and customer receipt', () => {
    const service = new DemoOrderService();
    const quote = createQuote(cart, 'DRONE', 1_000, 'Z02', 'blocked');
    const input = { quote, cart, idempotencyKey: 'drone' };
    let order = service.checkout(input, 2_000);
    expect(order.delivery?.method).toBe('DRONE');
    expect(service.checkout(input, 999_999).id).toBe(order.id);
    for (let step = 1; step <= 9; step++) {
      order = stepOrder(order, 2_000 + step);
      expect(restoreOrder(JSON.parse(JSON.stringify(order)))).toEqual(order);
      if (step < 9) expect(order.orderStatus).not.toBe('COMPLETED');
      if (step === 6) expect(order.delivery?.status).toBe('AT_DESTINATION');
      if (step === 7) expect(order.delivery?.status).toBe('STORED');
      if (step === 8) expect(order.delivery?.status).toBe('READY_FOR_COLLECTION');
    }
    expect(order.delivery?.status).toBe('COLLECTED');
    expect(order.orderStatus).toBe('COMPLETED');
    expect(stepOrder(order, 3_000)).toEqual(order);
    expect(restoreOrder({ ...order, step: 8 })).toBeNull();
    expect(order.quote.destinationId).toBe('Z02');
    expect(order.quote.routingScenario).toBe('blocked');
  });
});
describe('Fly2You session migration', () => {
  it('defaults to drone and migrates the former bicycle checkout without losing orders or cart', () => {
    const service = new DemoOrderService();
    const order = service.checkout({ quote: createQuote(cart, 'BICYCLE', 1_000), cart, idempotencyKey: 'legacy' }, 2_000);
    const migrated = restoreSession(JSON.stringify({ ...emptySession, version: 1, mode: 'BICYCLE', cart, orders: [order], activeOrderId: order.id }));
    expect(migrated.version).toBe(2);
    expect(migrated.mode).toBe('DRONE');
    expect(migrated.cart).toEqual(cart);
    expect(migrated.orders[0].mode).toBe('BICYCLE');
    expect(migrated.activeOrderId).toBe(order.id);
    expect(restoreSession(null).mode).toBe('DRONE');
  });
  it('preserves explicit v2 alternatives and old pickup choices', () => {
    expect(restoreSession(JSON.stringify({ ...emptySession, mode: 'BICYCLE' })).mode).toBe('BICYCLE');
    expect(restoreSession(JSON.stringify({ ...emptySession, version: 1, mode: 'PICKUP' })).mode).toBe('PICKUP');
    expect(restoreSession('invalid').mode).toBe('DRONE');
  });
});
