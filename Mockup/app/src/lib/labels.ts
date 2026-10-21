import type {
  DeliveryStatus,
  MerchantTaskStatus,
  OrderStatus,
  PaymentStatus,
  StockQuality,
  StockStatus,
  TransportMethod,
} from '../data/types';

export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING: 'Ausstehend',
  CONFIRMED: 'Bestätigt',
  FULFILLING: 'In Vorbereitung',
  READY: 'Abholbereit',
  IN_TRANSIT: 'Unterwegs',
  DELIVERED: 'Zugestellt',
  REJECTED: 'Abgelehnt',
  CANCELLED: 'Storniert',
  EXPIRED: 'Abgelaufen',
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  PENDING: 'Zahlung offen',
  AUTHORIZED: 'Autorisiert',
  CAPTURED: 'Eingezogen',
  REFUNDED: 'Erstattet',
  FAILED: 'Fehlgeschlagen',
  VOIDED: 'Aufgehoben',
};

export const deliveryStatusLabel: Record<DeliveryStatus, string> = {
  NONE: 'Kein Lieferauftrag',
  UNASSIGNED: 'Drohne offen',
  ASSIGNED: 'Drohne zugewiesen',
  PICKED_UP: 'An Bord',
  IN_TRANSIT: 'Im Flug',
  DELIVERED: 'Gelandet',
  FAILED: 'Fehlgeschlagen',
};

export const merchantTaskLabel: Record<MerchantTaskStatus, string> = {
  NEW: 'Neu',
  ACCEPTED: 'Angenommen',
  PICKING: 'Wird gepackt',
  READY: 'Abholbereit',
  HANDED_OVER: 'Übergeben',
  REJECTED: 'Abgelehnt',
};

export const stockStatusLabel: Record<StockStatus, string> = {
  available: 'Verfügbar',
  low: 'Wenige verfügbar',
  unavailable: 'Nicht verfügbar',
  unconfirmed: 'Unbestätigt',
};

export const stockQualityLabel: Record<StockQuality, string> = {
  fresh: 'frisch',
  delayed: 'verzögert',
  stale: 'veraltet',
};

export const methodLabel: Record<TransportMethod | 'none', string> = {
  bicycle: 'Fahrrad',
  scooter: 'E-Scooter',
  car: 'Auto (Bodenfall)',
  drone: 'Drohne',
  heavy_drone: 'Schwerlast-Drohne',
  none: 'Selbstabholung',
};

export const fulfillmentLabel = {
  delivery: 'Lieferung',
  pickup: 'Selbstabholung',
} as const;

export const serviceLabel = {
  standard: 'Standard',
  express: 'Express',
} as const;
