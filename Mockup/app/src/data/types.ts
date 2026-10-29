export type Role = 'customer' | 'merchant' | 'fleet' | 'ops';
export type CustomerStep = 'search' | 'offers' | 'cart' | 'checkout' | 'tracking' | 'orders' | 'account';
export type Theme = 'light' | 'dark';

export type FulfillmentMode = 'delivery' | 'pickup';
export type ServiceLevel = 'standard' | 'express';
export type TransportMethod = 'drone' | 'heavy_drone' | 'car' | 'bicycle' | 'scooter';
export type StockStatus = 'available' | 'low' | 'unavailable' | 'unconfirmed';
export type StockQuality = 'fresh' | 'delayed' | 'stale';
export type StoreStatus = 'open' | 'closed' | 'paused';

export type Decision = 'go' | 'restricted' | 'no_go' | 'unknown';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'FULFILLING'
  | 'READY'
  | 'IN_TRANSIT'
  /** Am Übergabepunkt angekommen. Der Empfang ist noch nicht bestätigt. */
  | 'ARRIVED'
  | 'DELIVERED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'EXPIRED';

export type PaymentStatus = 'PENDING' | 'AUTHORIZED' | 'CAPTURED' | 'REFUNDED' | 'FAILED' | 'VOIDED';
export type DeliveryStatus = 'NONE' | 'UNASSIGNED' | 'ASSIGNED' | 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED' | 'DELIVERED' | 'FAILED';
export type MerchantTaskStatus = 'NEW' | 'ACCEPTED' | 'PICKING' | 'READY' | 'HANDED_OVER' | 'REJECTED';

export interface Product {
  id: string;
  title: string;
  brand: string;
  category: string;
  variant: string;
  gtin: string;
  size: string;
  weightKg: number;
  packageNote: string;
  emojiFreeMark: string;
}

export interface Merchant {
  id: string;
  name: string;
}

export interface Store {
  id: string;
  merchantId: string;
  name: string;
  district: string;
  address: string;
  status: StoreStatus;
  prepMinutes: number;
  distanceKm: number;
  pickupHours: string;
  deliveryRadiusKm: number;
  x: number;
  y: number;
  lat: number;
  lon: number;
  note: string;
}

export interface Offer {
  id: string;
  productId: string;
  storeId: string;
  merchantSku: string;
  priceMinor: number;
  stock: StockStatus;
  stockCount: number | null;
  quality: StockQuality;
  observedAt: string;
  note: string;
}

export interface Quote {
  itemsSubtotalMinor: number;
  payloadKg: number;
  weightFeeMinor: number;
  droneId: string | null;
  /** Bodeneinheit für den Auto-Fallback. Nur gesetzt, wenn keine Drohne tragen kann. */
  groundUnitId: string | null;
  /** Illustrative Annahme, kein nachgewiesener Höhenbereich. */
  altitudeBandM: [number, number] | null;
  /** Wetterbewertung der Mission. Ohne belegte Datenquelle immer 'unknown'. */
  weather: Decision | null;
  distanceKm: number;
  baseFeeMinor: number;
  distanceFeeMinor: number;
  perKmFeeMinor: number;
  deliveryFeeMinor: number;
  serviceFeeMinor: number;
  totalMinor: number;
  etaFromMinutes: number;
  etaToMinutes: number;
  method: TransportMethod | null;
  methodPolicy: string;
  validUntil: number;
  isDemo: true;
}

export interface OrderLine {
  offerId: string;
  productId: string;
  quantity: number;
  unitPriceMinor: number;
  titleSnapshot: string;
}

export interface TimelineEntry {
  at: string;
  label: string;
  detail: string;
  actor: string;
}

export interface Order {
  id: string;
  createdAt: string;
  customerId: string;
  customerName: string;
  storeId: string;
  merchantId: string;
  status: OrderStatus;
  merchantTask: MerchantTaskStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  fulfillment: FulfillmentMode;
  service: ServiceLevel;
  lines: OrderLine[];
  quote: Quote;
  address: string;
  droneId: string | null;
  groundUnitId: string | null;
  droneDepartAt: number;
  pickupCode: string;
  deliveryCode: string;
  timeline: TimelineEntry[];
  note: string;
}

export interface Drone {
  id: string;
  model: string;
  maxPayloadKg: number;
  maxRangeKm: number;
  batteryPct: number;
  reservePct: number;
  state: 'ready' | 'flying' | 'charging' | 'grounded';
  note: string;
}

export interface GroundUnit {
  id: string;
  label: string;
  maxPayloadKg: number;
  state: 'ready' | 'driving';
  note: string;
}

export interface Destination {
  id: string;
  label: string;
  district: string;
  x: number;
  y: number;
  lat: number;
  lon: number;
}

export interface CartLine {
  offerId: string;
  quantity: number;
}

export interface Cart {
  storeId: string | null;
  lines: CartLine[];
}

export interface InventoryIssue {
  id: string;
  offerId: string;
  type: 'stale' | 'low' | 'unavailable' | 'closed';
  label: string;
  detail: string;
  severity: 'info' | 'caution' | 'critical';
}

export interface RoleNavItem {
  id: Role;
  label: string;
  icon: 'search' | 'store' | 'bike' | 'radar';
}
