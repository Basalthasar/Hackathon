import { describe, expect, it } from 'vitest';
import { createQuote } from './checkout';
import { DemoOrderService, restoreOrder, restoreOrders, stepOrder, type DemoOrder } from './orders';

const cart = [{ offerId: 'O01', quantity: 1 }];
const checkout = (service: DemoOrderService, mode: 'BICYCLE' | 'PICKUP' = 'BICYCLE', key = 'click-1') => service.checkout({ quote: createQuote(cart, mode, 1_000), cart, idempotencyKey: key }, 2_000);
describe('session-local demo ordering', () => {
  it('repeats a checkout once even after the original quote expires', () => {
    const service = new DemoOrderService();
    const input = { quote: createQuote(cart, 'BICYCLE', 1_000), cart, idempotencyKey: 'click' };
    const first = service.checkout(input, 2_000);
    const repeated = service.checkout(input, 999_999);
    expect(repeated.id).toBe(first.id);
    expect(service.list()).toHaveLength(1);
  });
  it('rejects reuse of an idempotency key for changed checkout data', () => {
    const service = new DemoOrderService(); checkout(service);
    const changed = [{ offerId: 'O03', quantity: 1 }];
    expect(() => service.checkout({ quote: createQuote(changed, 'BICYCLE', 1_000), cart: changed, idempotencyKey: 'click-1' }, 2_000)).toThrow(/anderen Auftrag/);
  });
  it('does not allocate the last unit to two different orders in one session', () => {
    const service = new DemoOrderService();
    const last = [{ offerId: 'O05', quantity: 1 }];
    const quote = createQuote(last, 'BICYCLE', 1_000);
    service.checkout({ quote, cart: last, idempotencyKey: 'one' }, 2_000);
    expect(() => service.checkout({ quote, cart: last, idempotencyKey: 'two' }, 2_001)).toThrow(/bereits vergeben/);
    expect(service.list()).toHaveLength(1);
  });
  it('keeps arrival and receipt separate, and stops after completion', () => {
    let order = checkout(new DemoOrderService());
    const original = JSON.stringify(order);
    const first = stepOrder(order, 3_000);
    expect(JSON.stringify(order)).toBe(original);
    expect(first.orderStatus).toBe('CONFIRMED');
    expect(first.paymentStatus).toBe('CAPTURED');
    expect(first.preparationStatus).toBe('ACCEPTED');
    for (let index = 0; index < 6; index++) order = stepOrder(order, 3_000 + index);
    expect(order.delivery?.status).toBe('AT_DESTINATION');
    expect(order.orderStatus).toBe('FULFILLING');
    order = stepOrder(order, 4_000);
    expect(order.orderStatus).toBe('COMPLETED');
    expect(order.delivery?.status).toBe('DELIVERED');
    expect(stepOrder(order, 5_000)).toEqual(order);
  });
  it('finishes pickup without ever creating a delivery job', () => {
    let order = checkout(new DemoOrderService(), 'PICKUP');
    expect(order.quote.deliveryFeeMinor).toBe(0);
    expect(order.delivery).toBeNull();
    for (let index = 0; index < 4; index++) { order = stepOrder(order, 3_000 + index); expect(order.delivery).toBeNull(); }
    expect(order.orderStatus).toBe('COMPLETED');
    expect(order.preparationStatus).toBe('HANDED_OVER');
  });
  it('will not hand over or complete an unpaid, inconsistent persisted order', () => {
    let order = checkout(new DemoOrderService());
    for (let index = 0; index < 3; index++) order = stepOrder(order, 3_000 + index);
    const invalid = { ...order, paymentStatus: 'AUTHORIZED' as const };
    expect(restoreOrder(invalid)).toBeNull();
    expect(() => stepOrder(invalid, 5_000)).toThrow(/ungültig/);
  });
  it('restores valid progress and idempotency after a browser refresh', () => {
    const service = new DemoOrderService();
    const order = checkout(service);
    const progressed = service.step(order.id, 3_000);
    const restored = new DemoOrderService(restoreOrders(JSON.parse(JSON.stringify(service.list()))));
    expect(restored.get(order.id)).toEqual(progressed);
    expect(checkout(restored).id).toBe(order.id);
    expect(restored.list()).toHaveLength(1);
  });
  it('rejects corrupt storage and prevents duplicates while preserving good entries', () => {
    const order = checkout(new DemoOrderService());
    expect(restoreOrders({ orders: [] })).toEqual([]);
    expect(restoreOrders([null, {}, order, order])).toEqual([order]);
    expect(restoreOrder({ ...order, step: 20 })).toBeNull();
    expect(restoreOrder({ ...order, quote: { ...order.quote, totalMinor: -1 } })).toBeNull();
    expect(restoreOrder({ ...order, delivery: null } as DemoOrder)).toBeNull();
  });
  it('returns copies so consumers cannot mutate service history accidentally', () => {
    const service = new DemoOrderService();
    const order = checkout(service);
    order.quote.totalMinor = 1;
    expect(service.get(order.id)?.quote.totalMinor).toBe(579);
  });
});
