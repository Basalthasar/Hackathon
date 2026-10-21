import type {
  Cart,
  Destination,
  Drone,
  InventoryIssue,
  Merchant,
  Offer,
  Order,
  Product,
  Quote,
  RoleNavItem,
  Store,
} from './types';

export const demoDisclosure =
  'FlyToYou-Prototyp mit Demodaten. Keine echte Zahlung, keine reale Lieferung, keine Betriebszusage.';

export const roles: RoleNavItem[] = [
  { id: 'customer', label: 'Kunde', icon: 'search' },
  { id: 'merchant', label: 'Händler', icon: 'store' },
  { id: 'fleet', label: 'Flotte', icon: 'radar' },
  { id: 'ops', label: 'Betrieb', icon: 'radar' },
];

export const merchants: Merchant[] = [
  { id: 'm-frische', name: 'Frischemarkt Wuppertal' },
  { id: 'm-barmen', name: 'Barmen Nahversorgung' },
  { id: 'm-vorrat', name: 'Vorratskammer' },
  { id: 'm-cronenberg', name: 'Cronenberg Frisch' },
  { id: 'm-apotheke', name: 'Apotheke am Alter Markt' },
];

export const stores: Store[] = [
  {
    id: 's-elberfeld',
    merchantId: 'm-frische',
    name: 'Frischemarkt Elberfeld',
    district: 'Elberfeld',
    address: 'Friedrich-Ebert-Straße 12, Wuppertal',
    status: 'open',
    prepMinutes: 8,
    distanceKm: 0.8,
    pickupHours: '08:00 bis 20:00',
    deliveryRadiusKm: 12,
    x: 420,
    lat: 51.2562,
    lon: 7.1508,
    y: 180,
    note: 'Pilotfiliale mit festen Stückpreisen und vorbereiteter Warenausgabe.',
  },
  {
    id: 's-barmen',
    merchantId: 'm-barmen',
    name: 'Kiosk & Markt Barmen',
    district: 'Barmen',
    address: 'Alter Markt 4, Wuppertal',
    status: 'open',
    prepMinutes: 6,
    distanceKm: 2.1,
    pickupHours: '08:00 bis 22:00',
    deliveryRadiusKm: 12,
    x: 640,
    lat: 51.269,
    lon: 7.1965,
    y: 230,
    note: 'Kompaktes Sortiment, schnelle Vorbereitung, eine Drohne bereits vorgesehen.',
  },
  {
    id: 's-vohwinkel',
    merchantId: 'm-vorrat',
    name: 'Vorratskammer Vohwinkel',
    district: 'Vohwinkel',
    address: 'Bahnhofstraße 30, Wuppertal',
    status: 'closed',
    prepMinutes: 10,
    distanceKm: 4.3,
    pickupHours: '09:00 bis 19:00',
    deliveryRadiusKm: 10,
    x: 180,
    lat: 51.2313,
    lon: 7.0705,
    y: 300,
    note: 'Heute geschlossen. Bestellungen sind erst nach der Öffnung möglich.',
  },
  {
    id: 's-apotheke',
    merchantId: 'm-apotheke',
    name: 'Apotheke am Alter Markt',
    district: 'Barmen',
    address: 'Alter Markt 6, Wuppertal',
    status: 'open',
    prepMinutes: 5,
    distanceKm: 2,
    pickupHours: '08:30 bis 19:00',
    deliveryRadiusKm: 12,
    x: 652,
    lat: 51.2694,
    lon: 7.199,
    y: 236,
    note: 'Apotheke im Pilot. Nur nicht rezeptpflichtige Produkte, keine Beratung ersetzt.',
  },
  {
    id: 's-cronenberg',
    merchantId: 'm-cronenberg',
    name: 'Cronenberg Frisch',
    district: 'Cronenberg',
    address: 'Hauptstraße 8, Wuppertal',
    status: 'open',
    prepMinutes: 12,
    distanceKm: 5.6,
    pickupHours: '09:00 bis 18:00',
    deliveryRadiusKm: 12,
    x: 420,
    lat: 51.2153,
    lon: 7.1335,
    y: 400,
    note: 'Erweiterter Pilotradius. Windexponiert, Drohnenfreigabe einzeln prüfen.',
  },
];

export const drones: Drone[] = [
  { id: 'D-01', model: 'FlyToYou D25', maxPayloadKg: 25, maxRangeKm: 18, batteryPct: 87, reservePct: 24, state: 'ready', note: 'Kurzkorridor Elberfeld, wettergeprüft.' },
  { id: 'D-02', model: 'FlyToYou D25', maxPayloadKg: 25, maxRangeKm: 18, batteryPct: 64, reservePct: 18, state: 'flying', note: 'Im Einsatz für SK-1043.' },
  { id: 'D-03', model: 'FlyToYou H60', maxPayloadKg: 60, maxRangeKm: 30, batteryPct: 92, reservePct: 31, state: 'ready', note: 'Schwerlast für Gebinde und Kisten.' },
  { id: 'D-04', model: 'FlyToYou D25', maxPayloadKg: 25, maxRangeKm: 18, batteryPct: 23, reservePct: 6, state: 'grounded', note: 'Reserve unter Mindestwert, Wartung offen.' },  { id: 'D-05', model: 'FlyToYou D25', maxPayloadKg: 25, maxRangeKm: 18, batteryPct: 78, reservePct: 21, state: 'ready', note: 'Bereit für Cronenberg, windgeprüft.' },
  { id: 'D-06', model: 'FlyToYou H60', maxPayloadKg: 60, maxRangeKm: 30, batteryPct: 88, reservePct: 27, state: 'ready', note: 'Schwerlast, aktuell für M-1051 vorgesehen.' },
  { id: 'D-07', model: 'FlyToYou D25', maxPayloadKg: 25, maxRangeKm: 18, batteryPct: 56, reservePct: 15, state: 'charging', note: 'Lädt am Hub Elberfeld, 18 Minuten.' },
  { id: 'D-08', model: 'FlyToYou H60', maxPayloadKg: 60, maxRangeKm: 30, batteryPct: 34, reservePct: 8, state: 'grounded', note: 'Wartung: Rotorlager, Ersatzteil offen.' },

];

export function findDrone(payloadKg: number, distanceKm = 0): Drone | undefined {
  return drones
    .filter((drone) => drone.maxPayloadKg >= payloadKg && drone.maxRangeKm >= distanceKm && drone.batteryPct > 25 && drone.state !== 'grounded')
    .sort((a, b) => a.maxPayloadKg - b.maxPayloadKg)[0];
}

export const destinations: Destination[] = [
  { id: 'd-luisen', label: 'Luisenstraße 14, Wuppertal', district: 'Elberfeld', x: 450, y: 200, lat: 51.2568, lon: 7.146 },
  { id: 'd-berliner', label: 'Berliner Platz 7, Wuppertal', district: 'Barmen', x: 610, y: 245, lat: 51.2698, lon: 7.187 },
  { id: 'd-nuetzenberg', label: 'Nützenberger Straße 22, Wuppertal', district: 'Elberfeld', x: 350, y: 220, lat: 51.249, lon: 7.129 },
  { id: 'd-sehlhof', label: 'Obere Sehlhofstraße 3, Wuppertal', district: 'Elberfeld', x: 450, y: 250, lat: 51.256, lon: 7.142 },
  { id: 'd-cronenberg', label: 'Cronenberger Straße 10, Wuppertal', district: 'Cronenberg', x: 410, y: 350, lat: 51.2158, lon: 7.132 },
  { id: 'd-alter-markt', label: 'Alter Markt 4, Wuppertal', district: 'Barmen', x: 640, y: 230, lat: 51.269, lon: 7.1965 },
  { id: 'd-ronsdorf', label: 'Ronsdorfer Straße 12, Wuppertal', district: 'Ronsdorf', x: 600, y: 400, lat: 51.226, lon: 7.2 },
  { id: 'd-varresbeck', label: 'Varresbecker Straße 40, Wuppertal', district: 'Varresbeck', x: 230, y: 250, lat: 51.249, lon: 7.1 },
  { id: 'd-oberbarmen', label: 'Oberbarmer Straße 5, Wuppertal', district: 'Oberbarmen', x: 690, y: 300, lat: 51.274, lon: 7.22 },
  { id: 'd-sonnborn', label: 'Sonnborner Straße 8, Wuppertal', district: 'Sonnborn', x: 310, y: 320, lat: 51.238, lon: 7.1 },
];

export const MAP_KM_PER_UNIT = 0.04;

export function findDestination(address: string): Destination {
  const normalized = address.trim().toLowerCase();
  return destinations.find((destination) =>
    normalized.includes(destination.label.split(',')[0].toLowerCase().split(' ')[0]) ||
    normalized.includes(destination.district.toLowerCase()),
  ) ?? { id: 'd-default', label: address || 'Wuppertal Zentrum', district: 'Wuppertal', x: 480, y: 240, lat: 51.256, lon: 7.15 };
}

export const products: Product[] = [
  { id: 'p-hafer', title: 'Haferdrink Natur', brand: 'Kornwerk', category: 'Lebensmittel', variant: '1 L', gtin: '4000000000011', size: '1 L', weightKg: 1.05, packageNote: 'Karton', emojiFreeMark: 'HD' },
  { id: 'p-brot', title: 'Sauerteigbrot', brand: 'Bäckerei Elberfeld', category: 'Backwaren', variant: '750 g', gtin: '4000000000028', size: '750 g', weightKg: 0.75, packageNote: 'Papierbeutel', emojiFreeMark: 'SB' },
  { id: 'p-wasser', title: 'Mineralwasser still', brand: 'Wupperquelle', category: 'Getränke', variant: '6 x 1,5 L', gtin: '4000000000035', size: '9 L', weightKg: 9.2, packageNote: 'Folie', emojiFreeMark: 'MW' },
  { id: 'p-kaffee', title: 'Kaffee gemahlen', brand: 'Röstwerk', category: 'Lebensmittel', variant: '500 g', gtin: '4000000000042', size: '500 g', weightKg: 0.5, packageNote: 'Beutel', emojiFreeMark: 'KG' },
  { id: 'p-tomaten', title: 'Rispentomaten', brand: 'Hof Cronenberg', category: 'Obst & Gemüse', variant: '500 g', gtin: '4000000000059', size: '500 g', weightKg: 0.55, packageNote: 'Schale', emojiFreeMark: 'RT' },
  { id: 'p-spuel', title: 'Spülmittel Zitrone', brand: 'Hausklar', category: 'Haushalt', variant: '500 ml', gtin: '4000000000066', size: '500 ml', weightKg: 0.55, packageNote: 'Flasche', emojiFreeMark: 'SZ' },
  { id: 'p-kuechenrolle', title: 'Küchenrolle', brand: 'Papierwerk', category: 'Haushalt', variant: '4 Rollen', gtin: '4000000000073', size: '4 Rollen', weightKg: 0.8, packageNote: 'Folie', emojiFreeMark: 'KR' },
  { id: 'p-schoko', title: 'Zartbitterschokolade', brand: 'Kakao Kontor', category: 'Lebensmittel', variant: '100 g', gtin: '4000000000080', size: '100 g', weightKg: 0.1, packageNote: 'Tafel', emojiFreeMark: 'ZK' },
  { id: 'p-batterien', title: 'Batterien AA', brand: 'Volt & Co', category: 'Elektronik', variant: '4 Stück', gtin: '4000000000097', size: '4 Stück', weightKg: 0.1, packageNote: 'Blister', emojiFreeMark: 'AA' },
  { id: 'p-pasta', title: 'Pasta Penne', brand: 'Teigwerk', category: 'Lebensmittel', variant: '500 g', gtin: '4000000000103', size: '500 g', weightKg: 0.5, packageNote: 'Karton', emojiFreeMark: 'PP' },
  { id: 'p-wasserkiste', title: 'Wasserkiste', brand: 'Wupperquelle', category: 'Getränke', variant: '12 x 1,5 L', gtin: '4000000000110', size: '18 L', weightKg: 19.5, packageNote: 'Kiste', emojiFreeMark: 'WK' },
  { id: 'p-eis', title: 'Vanilleeis', brand: 'Kaltwerk', category: 'Tiefkühl', variant: '500 ml', gtin: '4000000000127', size: '500 ml', weightKg: 0.6, packageNote: 'Becher', emojiFreeMark: 'VE' },
  { id: 'p-milch', title: 'H-Milch 1,5 %', brand: 'Wupperhof', category: 'Lebensmittel', variant: '1 L', gtin: '4000000000134', size: '1 L', weightKg: 1.05, packageNote: 'Karton', emojiFreeMark: 'HM' },
  { id: 'p-eier', title: 'Freilandeier', brand: 'Hof Cronenberg', category: 'Lebensmittel', variant: '10 Stück', gtin: '4000000000141', size: '10 Stück', weightKg: 0.65, packageNote: 'Karton', emojiFreeMark: 'EI' },
  { id: 'p-bananen', title: 'Bananen', brand: 'Obsthandel Süd', category: 'Obst & Gemüse', variant: '1 kg', gtin: '4000000000158', size: '1 kg', weightKg: 1, packageNote: 'Netz', emojiFreeMark: 'BA' },
  { id: 'p-aepfel', title: 'Äpfel Elstar', brand: 'Hof Cronenberg', category: 'Obst & Gemüse', variant: '1 kg', gtin: '4000000000165', size: '1 kg', weightKg: 1, packageNote: 'Beutel', emojiFreeMark: 'AE' },
  { id: 'p-kaese', title: 'Gouda jung', brand: 'Käserei Barmen', category: 'Lebensmittel', variant: '400 g', gtin: '4000000000172', size: '400 g', weightKg: 0.45, packageNote: 'Kühlpack', emojiFreeMark: 'GD' },
  { id: 'p-seife', title: 'Handseife Zitrone', brand: 'Hausklar', category: 'Haushalt', variant: '300 ml', gtin: '4000000000189', size: '300 ml', weightKg: 0.35, packageNote: 'Flasche', emojiFreeMark: 'HS' },
  { id: 'p-muesli', title: 'Hafermüsli', brand: 'Kornwerk', category: 'Lebensmittel', variant: '750 g', gtin: '4000000000196', size: '750 g', weightKg: 0.8, packageNote: 'Beutel', emojiFreeMark: 'MÜ' },
  { id: 'p-saft', title: 'Apfelsaft naturtrüb', brand: 'Wupperquelle', category: 'Getränke', variant: '1 L', gtin: '4000000000202', size: '1 L', weightKg: 1.1, packageNote: 'Flasche', emojiFreeMark: 'AS' },
  { id: 'p-palette', title: 'Wasserpalette', brand: 'Wupperquelle', category: 'Getränke', variant: '36 x 1,5 L', gtin: '4000000000219', size: '54 L', weightKg: 58, packageNote: 'Palette', emojiFreeMark: 'WP' },
  { id: 'p-pflaster', title: 'Pflaster-Set', brand: 'Mediwerk', category: 'Gesundheit', variant: '20 Stück', gtin: '4000000000226', size: '20 Stück', weightKg: 0.08, packageNote: 'Box', emojiFreeMark: 'PF' },
  { id: 'p-vitamin', title: 'Vitamin C Brausetabletten', brand: 'Vitaquelle', category: 'Gesundheit', variant: '20 Stück', gtin: '4000000000233', size: '20 Stück', weightKg: 0.12, packageNote: 'Röhre', emojiFreeMark: 'VC' },
  { id: 'p-desinfektion', title: 'Handdesinfektion', brand: 'Hygia', category: 'Gesundheit', variant: '250 ml', gtin: '4000000000240', size: '250 ml', weightKg: 0.3, packageNote: 'Flasche', emojiFreeMark: 'HD' },
  { id: 'p-thermometer', title: 'Fieberthermometer', brand: 'Mediwerk', category: 'Gesundheit', variant: '1 Stück', gtin: '4000000000257', size: '1 Stück', weightKg: 0.06, packageNote: 'Box', emojiFreeMark: 'FT' },
  { id: 'p-rezept', title: 'Rezeptpflichtiges Arzneimittel', brand: 'Demo', category: 'Gesundheit', variant: 'Nicht im Pilot', gtin: '4000000000264', size: '1 Packung', weightKg: 0.1, packageNote: 'Box', emojiFreeMark: 'RX' },

];

export const offers: Offer[] = [
  { id: 'o-hafer-e', productId: 'p-hafer', storeId: 's-elberfeld', merchantSku: 'FM-HD-01', priceMinor: 179, stock: 'available', stockCount: 12, quality: 'fresh', observedAt: '14:11', note: 'Bestand vor 1 Minute bestätigt.' },
  { id: 'o-brot-e', productId: 'p-brot', storeId: 's-elberfeld', merchantSku: 'FM-SB-01', priceMinor: 349, stock: 'available', stockCount: 6, quality: 'fresh', observedAt: '14:11', note: 'Frisch aus der Backstube.' },
  { id: 'o-wasser-e', productId: 'p-wasser', storeId: 's-elberfeld', merchantSku: 'FM-MW-06', priceMinor: 499, stock: 'low', stockCount: 2, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 2 Gebinde.' },
  { id: 'o-kaffee-e', productId: 'p-kaffee', storeId: 's-elberfeld', merchantSku: 'FM-KG-05', priceMinor: 699, stock: 'low', stockCount: 1, quality: 'fresh', observedAt: '14:09', note: 'Letzte verfügbare Einheit.' },
  { id: 'o-tomaten-e', productId: 'p-tomaten', storeId: 's-elberfeld', merchantSku: 'FM-RT-05', priceMinor: 249, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '14:11', note: 'Heute ausverkauft.' },
  { id: 'o-spuel-e', productId: 'p-spuel', storeId: 's-elberfeld', merchantSku: 'FM-SZ-05', priceMinor: 229, stock: 'available', stockCount: 9, quality: 'delayed', observedAt: '14:04', note: 'Bestand vor 8 Minuten bestätigt.' },
  { id: 'o-schoko-e', productId: 'p-schoko', storeId: 's-elberfeld', merchantSku: 'FM-ZK-01', priceMinor: 199, stock: 'available', stockCount: 20, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-pasta-e', productId: 'p-pasta', storeId: 's-elberfeld', merchantSku: 'FM-PP-05', priceMinor: 149, stock: 'available', stockCount: 15, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-eis-e', productId: 'p-eis', storeId: 's-elberfeld', merchantSku: 'FM-VE-05', priceMinor: 399, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '14:11', note: 'Kühlkette im Pilot nicht freigegeben.' },

  { id: 'o-hafer-b', productId: 'p-hafer', storeId: 's-barmen', merchantSku: 'BM-HD-01', priceMinor: 189, stock: 'available', stockCount: 20, quality: 'fresh', observedAt: '14:10', note: 'Bestand vor 2 Minuten bestätigt.' },
  { id: 'o-brot-b', productId: 'p-brot', storeId: 's-barmen', merchantSku: 'BM-SB-01', priceMinor: 329, stock: 'low', stockCount: 4, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 4 Laibe.' },
  { id: 'o-kaffee-b', productId: 'p-kaffee', storeId: 's-barmen', merchantSku: 'BM-KG-05', priceMinor: 749, stock: 'available', stockCount: 8, quality: 'fresh', observedAt: '14:09', note: 'Regulär verfügbar.' },
  { id: 'o-kuechenrolle-b', productId: 'p-kuechenrolle', storeId: 's-barmen', merchantSku: 'BM-KR-04', priceMinor: 449, stock: 'low', stockCount: 2, quality: 'fresh', observedAt: '14:08', note: 'Nur noch 2 Packungen.' },
  { id: 'o-schoko-b', productId: 'p-schoko', storeId: 's-barmen', merchantSku: 'BM-ZK-01', priceMinor: 219, stock: 'available', stockCount: 10, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },
  { id: 'o-batterien-b', productId: 'p-batterien', storeId: 's-barmen', merchantSku: 'BM-AA-04', priceMinor: 499, stock: 'available', stockCount: 7, quality: 'delayed', observedAt: '14:01', note: 'Bestand vor 11 Minuten bestätigt.' },
  { id: 'o-wasser-b', productId: 'p-wasser', storeId: 's-barmen', merchantSku: 'BM-MW-06', priceMinor: 529, stock: 'unconfirmed', stockCount: null, quality: 'stale', observedAt: '13:57', note: 'Bestand seit 14 Minuten unbestätigt. Nicht sofort verbindlich.' },
  { id: 'o-wasserkiste-b', productId: 'p-wasserkiste', storeId: 's-barmen', merchantSku: 'BM-WK-12', priceMinor: 899, stock: 'available', stockCount: 5, quality: 'fresh', observedAt: '14:09', note: 'Für D25 geeignet; Schwerlast nur bei größeren Gebinden.' },
  { id: 'o-pasta-b', productId: 'p-pasta', storeId: 's-barmen', merchantSku: 'BM-PP-05', priceMinor: 159, stock: 'available', stockCount: 12, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },

  { id: 'o-wasser-v', productId: 'p-wasser', storeId: 's-vohwinkel', merchantSku: 'VK-MW-06', priceMinor: 479, stock: 'available', stockCount: 8, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-spuel-v', productId: 'p-spuel', storeId: 's-vohwinkel', merchantSku: 'VK-SZ-05', priceMinor: 219, stock: 'available', stockCount: 4, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-eis-v', productId: 'p-eis', storeId: 's-vohwinkel', merchantSku: 'VK-VE-05', priceMinor: 349, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '13:58', note: 'Kühlkette im Pilot nicht freigegeben.' },

  { id: 'o-hafer-c', productId: 'p-hafer', storeId: 's-cronenberg', merchantSku: 'CF-HD-01', priceMinor: 209, stock: 'available', stockCount: 5, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-brot-c', productId: 'p-brot', storeId: 's-cronenberg', merchantSku: 'CF-SB-01', priceMinor: 379, stock: 'low', stockCount: 1, quality: 'fresh', observedAt: '14:08', note: 'Letzte verfügbare Einheit. Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-tomaten-c', productId: 'p-tomaten', storeId: 's-cronenberg', merchantSku: 'CF-RT-05', priceMinor: 299, stock: 'available', stockCount: 6, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-batterien-c', productId: 'p-batterien', storeId: 's-cronenberg', merchantSku: 'CF-AA-04', priceMinor: 549, stock: 'available', stockCount: 3, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },  { id: 'o-milch-e', productId: 'p-milch', storeId: 's-elberfeld', merchantSku: 'FM-HM-01', priceMinor: 129, stock: 'available', stockCount: 8, quality: 'fresh', observedAt: '14:11', note: 'Ungekühlt haltbar, Pilot geeignet.' },
  { id: 'o-eier-e', productId: 'p-eier', storeId: 's-elberfeld', merchantSku: 'FM-EI-10', priceMinor: 349, stock: 'low', stockCount: 2, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 2 Packungen.' },
  { id: 'o-bananen-e', productId: 'p-bananen', storeId: 's-elberfeld', merchantSku: 'FM-BA-01', priceMinor: 219, stock: 'available', stockCount: 15, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-aepfel-e', productId: 'p-aepfel', storeId: 's-elberfeld', merchantSku: 'FM-AE-01', priceMinor: 249, stock: 'available', stockCount: 10, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-kaese-e', productId: 'p-kaese', storeId: 's-elberfeld', merchantSku: 'FM-GD-04', priceMinor: 299, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '14:10', note: 'Kühlkette im Pilot nicht freigegeben.' },
  { id: 'o-seife-e', productId: 'p-seife', storeId: 's-elberfeld', merchantSku: 'FM-HS-03', priceMinor: 199, stock: 'available', stockCount: 12, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-muesli-e', productId: 'p-muesli', storeId: 's-elberfeld', merchantSku: 'FM-MÜ-07', priceMinor: 429, stock: 'available', stockCount: 7, quality: 'fresh', observedAt: '14:09', note: 'Regulär verfügbar.' },
  { id: 'o-saft-e', productId: 'p-saft', storeId: 's-elberfeld', merchantSku: 'FM-AS-01', priceMinor: 219, stock: 'available', stockCount: 9, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },
  { id: 'o-milch-b', productId: 'p-milch', storeId: 's-barmen', merchantSku: 'BM-HM-01', priceMinor: 139, stock: 'low', stockCount: 3, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 3 Kartons.' },
  { id: 'o-eier-b', productId: 'p-eier', storeId: 's-barmen', merchantSku: 'BM-EI-10', priceMinor: 329, stock: 'available', stockCount: 12, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },
  { id: 'o-bananen-b', productId: 'p-bananen', storeId: 's-barmen', merchantSku: 'BM-BA-01', priceMinor: 209, stock: 'available', stockCount: 20, quality: 'fresh', observedAt: '14:11', note: 'Regulär verfügbar.' },
  { id: 'o-aepfel-b', productId: 'p-aepfel', storeId: 's-barmen', merchantSku: 'BM-AE-01', priceMinor: 239, stock: 'low', stockCount: 2, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 2 kg.' },
  { id: 'o-seife-b', productId: 'p-seife', storeId: 's-barmen', merchantSku: 'BM-HS-03', priceMinor: 209, stock: 'available', stockCount: 5, quality: 'delayed', observedAt: '14:02', note: 'Bestand vor 10 Minuten bestätigt.' },
  { id: 'o-muesli-b', productId: 'p-muesli', storeId: 's-barmen', merchantSku: 'BM-MÜ-07', priceMinor: 449, stock: 'available', stockCount: 6, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },
  { id: 'o-saft-b', productId: 'p-saft', storeId: 's-barmen', merchantSku: 'BM-AS-01', priceMinor: 229, stock: 'available', stockCount: 11, quality: 'fresh', observedAt: '14:10', note: 'Regulär verfügbar.' },
  { id: 'o-milch-v', productId: 'p-milch', storeId: 's-vohwinkel', merchantSku: 'VK-HM-01', priceMinor: 119, stock: 'available', stockCount: 6, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-eier-v', productId: 'p-eier', storeId: 's-vohwinkel', merchantSku: 'VK-EI-10', priceMinor: 359, stock: 'available', stockCount: 8, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-bananen-v', productId: 'p-bananen', storeId: 's-vohwinkel', merchantSku: 'VK-BA-01', priceMinor: 229, stock: 'available', stockCount: 9, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-seife-v', productId: 'p-seife', storeId: 's-vohwinkel', merchantSku: 'VK-HS-03', priceMinor: 189, stock: 'available', stockCount: 4, quality: 'fresh', observedAt: '13:58', note: 'Filiale heute geschlossen.' },
  { id: 'o-aepfel-c', productId: 'p-aepfel', storeId: 's-cronenberg', merchantSku: 'CF-AE-01', priceMinor: 279, stock: 'available', stockCount: 8, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-muesli-c', productId: 'p-muesli', storeId: 's-cronenberg', merchantSku: 'CF-MÜ-07', priceMinor: 419, stock: 'low', stockCount: 2, quality: 'fresh', observedAt: '14:08', note: 'Nur noch 2 Beutel.' },
  { id: 'o-saft-c', productId: 'p-saft', storeId: 's-cronenberg', merchantSku: 'CF-AS-01', priceMinor: 239, stock: 'available', stockCount: 5, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-eier-c', productId: 'p-eier', storeId: 's-cronenberg', merchantSku: 'CF-EI-10', priceMinor: 369, stock: 'available', stockCount: 4, quality: 'fresh', observedAt: '14:08', note: 'Drohnenlieferung im erweiterten Pilotradius.' },
  { id: 'o-palette-b', productId: 'p-palette', storeId: 's-barmen', merchantSku: 'BM-WP-36', priceMinor: 1899, stock: 'available', stockCount: 3, quality: 'fresh', observedAt: '14:08', note: 'Nur Schwerlast-Drohne H60 oder Abholung.' },
  { id: 'o-pflaster-a', productId: 'p-pflaster', storeId: 's-apotheke', merchantSku: 'AP-PF-20', priceMinor: 349, stock: 'available', stockCount: 20, quality: 'fresh', observedAt: '14:12', note: 'Nicht rezeptpflichtig, im Pilot buchbar.' },
  { id: 'o-vitamin-a', productId: 'p-vitamin', storeId: 's-apotheke', merchantSku: 'AP-VC-20', priceMinor: 599, stock: 'available', stockCount: 15, quality: 'fresh', observedAt: '14:11', note: 'Nahrungsergänzung, keine Beratung ersetzt.' },
  { id: 'o-desinfektion-a', productId: 'p-desinfektion', storeId: 's-apotheke', merchantSku: 'AP-HD-250', priceMinor: 449, stock: 'low', stockCount: 3, quality: 'fresh', observedAt: '14:10', note: 'Nur noch 3 Flaschen.' },
  { id: 'o-thermometer-a', productId: 'p-thermometer', storeId: 's-apotheke', merchantSku: 'AP-FT-01', priceMinor: 1299, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '14:12', note: 'Nicht vorrätig. Bestellung erst nach Bestätigung.' },
  { id: 'o-rezept-a', productId: 'p-rezept', storeId: 's-apotheke', merchantSku: 'AP-RX-01', priceMinor: 0, stock: 'unavailable', stockCount: 0, quality: 'fresh', observedAt: '14:12', note: 'Rezeptpflichtige Arzneimittel sind im Pilot nicht buchbar.' },

];

const quote = (
  subtotal: number,
  deliveryFee: number,
  etaFrom: number,
  etaTo: number,
  method: Quote['method'],
): Quote => ({
  itemsSubtotalMinor: subtotal,
  payloadKg: 0,
  weightFeeMinor: 0,
  droneId: null,
  altitudeBandM: method === 'drone' || method === 'heavy_drone' ? [60, 80] : null,
  weather: method === 'drone' || method === 'heavy_drone' ? 'go' : null,
  distanceKm: method ? 2.4 : 0,
  baseFeeMinor: method === 'bicycle' ? 250 : method === 'scooter' ? 320 : method === 'car' ? 450 : 0,
  distanceFeeMinor: method ? Math.max(0, deliveryFee - (method === 'bicycle' ? 250 : method === 'scooter' ? 320 : 450)) : 0,
  perKmFeeMinor: method === 'bicycle' ? 35 : method === 'scooter' ? 55 : method === 'car' ? 80 : 0,
  deliveryFeeMinor: deliveryFee,
  serviceFeeMinor: 0,
  totalMinor: subtotal + deliveryFee,
  etaFromMinutes: etaFrom,
  etaToMinutes: etaTo,
  method,
  methodPolicy: 'Automatische Auswahl innerhalb der zulässigen Optionen',
  validUntil: Date.now() + 120_000,
  isDemo: true,
});

const baseTimeline = (label: string, detail: string): Order['timeline'] => [
  { at: '14:02', label: 'Bestellung angelegt', detail, actor: 'System' },
  { at: '14:02', label, detail, actor: 'System' },
];

const seedOrders: Omit<Order, 'customerId' | 'droneDepartAt'>[] = [
  {
    id: 'SK-1041',
    createdAt: '14:02',
    customerName: 'A. Yilmaz',
    storeId: 's-elberfeld',
    merchantId: 'm-frische',
    status: 'PENDING',
    merchantTask: 'NEW',
    paymentStatus: 'AUTHORIZED',
    deliveryStatus: 'UNASSIGNED',
    fulfillment: 'delivery',
    service: 'standard',
    lines: [
      { offerId: 'o-hafer-e', productId: 'p-hafer', quantity: 2, unitPriceMinor: 179, titleSnapshot: 'Haferdrink Natur · 1 L' },
      { offerId: 'o-brot-e', productId: 'p-brot', quantity: 1, unitPriceMinor: 349, titleSnapshot: 'Sauerteigbrot · 750 g' },
    ],
    quote: quote(707, 390, 25, 40, 'bicycle'),
    address: 'Luisenstraße 14, Wuppertal',
    droneId: 'D-01',
    pickupCode: 'P-4821',
    deliveryCode: 'D-7314',
    timeline: baseTimeline('Zahlung autorisiert', 'Bestellung wartet auf Händlerbestätigung.'),
    note: 'Wartet auf Annahme durch den Händler.',
  },
  {
    id: 'SK-1042',
    createdAt: '13:48',
    customerName: 'M. Kaya',
    storeId: 's-barmen',
    merchantId: 'm-barmen',
    status: 'CONFIRMED',
    merchantTask: 'ACCEPTED',
    paymentStatus: 'AUTHORIZED',
    deliveryStatus: 'NONE',
    fulfillment: 'pickup',
    service: 'standard',
    lines: [
      { offerId: 'o-kaffee-b', productId: 'p-kaffee', quantity: 1, unitPriceMinor: 749, titleSnapshot: 'Kaffee gemahlen · 500 g' },
      { offerId: 'o-schoko-b', productId: 'p-schoko', quantity: 2, unitPriceMinor: 219, titleSnapshot: 'Zartbitterschokolade · 100 g' },
    ],
    quote: quote(1187, 0, 15, 25, null),
    address: 'Abholung: Alter Markt 4, Wuppertal',
    droneId: null,
    pickupCode: 'P-7714',
    deliveryCode: '',
    timeline: baseTimeline('Vom Händler angenommen', 'Vorbereitung startet in Kürze.'),
    note: 'Selbstabholung. Kein Drohnenauftrag.',
  },
  {
    id: 'SK-1043',
    createdAt: '13:35',
    customerName: 'L. Schröder',
    storeId: 's-elberfeld',
    merchantId: 'm-frische',
    status: 'READY',
    merchantTask: 'READY',
    paymentStatus: 'CAPTURED',
    deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery',
    service: 'standard',
    lines: [
      { offerId: 'o-wasser-e', productId: 'p-wasser', quantity: 1, unitPriceMinor: 499, titleSnapshot: 'Mineralwasser still · 6 x 1,5 L' },
      { offerId: 'o-pasta-e', productId: 'p-pasta', quantity: 2, unitPriceMinor: 149, titleSnapshot: 'Pasta Penne · 500 g' },
    ],
    quote: quote(797, 390, 20, 35, 'bicycle'),
    address: 'Nützenberger Straße 22, Wuppertal',
    droneId: 'D-02',
    pickupCode: 'P-5301',
    deliveryCode: 'D-8822',
    timeline: [
      ...baseTimeline('Vom Händler angenommen', 'Ware wird zusammengestellt.'),
      { at: '13:52', label: 'Abholbereit', detail: 'Drohne D-02 ist zugewiesen.', actor: 'Frischemarkt Elberfeld' },
    ],
    note: 'Drohne wartet auf Startfreigabe.',
  },
  {
    id: 'SK-1044',
    createdAt: '13:10',
    customerName: 'R. Özdemir',
    storeId: 's-barmen',
    merchantId: 'm-barmen',
    status: 'IN_TRANSIT',
    merchantTask: 'HANDED_OVER',
    paymentStatus: 'CAPTURED',
    deliveryStatus: 'IN_TRANSIT',
    fulfillment: 'delivery',
    service: 'standard',
    lines: [
      { offerId: 'o-wasserkiste-b', productId: 'p-wasserkiste', quantity: 1, unitPriceMinor: 899, titleSnapshot: 'Wasserkiste · 12 x 1,5 L' },
    ],
    quote: quote(899, 590, 20, 35, 'car'),
    address: 'Berliner Platz 7, Wuppertal',
    droneId: 'D-03',
    pickupCode: 'P-6634',
    deliveryCode: 'D-4421',
    timeline: [
      ...baseTimeline('Vom Händler angenommen', 'Ware wird zusammengestellt.'),
      { at: '13:34', label: 'Übernahme bestätigt', detail: 'Nina K. hat die Ware übernommen.', actor: 'Nina K.' },
      { at: '13:41', label: 'Unterwegs', detail: 'Ziel: Berliner Platz 7.', actor: 'Nina K.' },
    ],
    note: 'Schwerlast-Drohne H60 oder Auto.',
  },
  {
    id: 'SK-1045',
    createdAt: '11:20',
    customerName: 'S. Demir',
    storeId: 's-elberfeld',
    merchantId: 'm-frische',
    status: 'DELIVERED',
    merchantTask: 'HANDED_OVER',
    paymentStatus: 'CAPTURED',
    deliveryStatus: 'NONE',
    fulfillment: 'pickup',
    service: 'standard',
    lines: [
      { offerId: 'o-brot-e', productId: 'p-brot', quantity: 1, unitPriceMinor: 349, titleSnapshot: 'Sauerteigbrot · 750 g' },
      { offerId: 'o-schoko-e', productId: 'p-schoko', quantity: 1, unitPriceMinor: 199, titleSnapshot: 'Zartbitterschokolade · 100 g' },
    ],
    quote: quote(548, 0, 10, 20, null),
    address: 'Abholung: Friedrich-Ebert-Straße 12, Wuppertal',
    droneId: null,
    pickupCode: 'P-1102',
    deliveryCode: '',
    timeline: [
      ...baseTimeline('Vom Händler angenommen', 'Ware wird zusammengestellt.'),
      { at: '11:38', label: 'Abgeholt', detail: 'Übergabe an der Warenausgabe bestätigt.', actor: 'Frischemarkt Elberfeld' },
    ],
    note: 'Abgeschlossen. Bewertung möglich.',
  },
  {
    id: 'SK-1046',
    createdAt: '10:44',
    customerName: 'T. Weber',
    storeId: 's-elberfeld',
    merchantId: 'm-frische',
    status: 'REJECTED',
    merchantTask: 'REJECTED',
    paymentStatus: 'VOIDED',
    deliveryStatus: 'NONE',
    fulfillment: 'delivery',
    service: 'standard',
    lines: [
      { offerId: 'o-tomaten-e', productId: 'p-tomaten', quantity: 1, unitPriceMinor: 249, titleSnapshot: 'Rispentomaten · 500 g' },
    ],
    quote: quote(249, 390, 20, 35, 'bicycle'),
    address: 'Obere Sehlhofstraße 3, Wuppertal',
    droneId: null,
    pickupCode: '',
    deliveryCode: '',
    timeline: [
      ...baseTimeline('Händler hat abgelehnt', 'Rispentomaten sind nicht verfügbar. Autorisierung aufgehoben.'),
    ],
    note: 'Abgelehnt, keine Zahlung eingezogen.',
  },  {
    id: 'SK-1047', createdAt: '14:15', customerName: 'N. Aydin', storeId: 's-barmen', merchantId: 'm-barmen',
    status: 'PENDING', merchantTask: 'NEW', paymentStatus: 'AUTHORIZED', deliveryStatus: 'NONE',
    fulfillment: 'pickup', service: 'standard',
    lines: [
      { offerId: 'o-eier-b', productId: 'p-eier', quantity: 1, unitPriceMinor: 329, titleSnapshot: 'Freilandeier · 10 Stück' },
      { offerId: 'o-saft-b', productId: 'p-saft', quantity: 1, unitPriceMinor: 229, titleSnapshot: 'Apfelsaft naturtrüb · 1 L' },
    ],
    quote: quote(558, 0, 15, 25, null), address: 'Abholung: Alter Markt 4, Wuppertal',
    droneId: null, pickupCode: 'P-2201', deliveryCode: '',
    timeline: baseTimeline('Bestellung angelegt', 'Selbstabholung, Zahlung autorisiert.'),
    note: 'Selbstabholung, wartet auf Händlerannahme.',
  },
  {
    id: 'SK-1048', createdAt: '14:12', customerName: 'J. Peters', storeId: 's-elberfeld', merchantId: 'm-frische',
    status: 'CONFIRMED', merchantTask: 'ACCEPTED', paymentStatus: 'AUTHORIZED', deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-bananen-e', productId: 'p-bananen', quantity: 2, unitPriceMinor: 219, titleSnapshot: 'Bananen · 1 kg' },
      { offerId: 'o-muesli-e', productId: 'p-muesli', quantity: 1, unitPriceMinor: 429, titleSnapshot: 'Hafermüsli · 750 g' },
    ],
    quote: quote(867, 390, 20, 35, 'drone'), address: 'Luisenstraße 14, Wuppertal',
    droneId: 'D-01', pickupCode: 'P-3302', deliveryCode: 'D-3302',
    timeline: baseTimeline('Vom Händler angenommen', 'Drohne D-01 vorgesehen, Beladung folgt.'),
    note: 'Drohnenlieferung an die Abgabestelle Luisenstraße 14.',
  },
  {
    id: 'SK-1049', createdAt: '14:08', customerName: 'K. Braun', storeId: 's-barmen', merchantId: 'm-barmen',
    status: 'FULFILLING', merchantTask: 'PICKING', paymentStatus: 'CAPTURED', deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery', service: 'express',
    lines: [
      { offerId: 'o-aepfel-b', productId: 'p-aepfel', quantity: 1, unitPriceMinor: 239, titleSnapshot: 'Äpfel Elstar · 1 kg' },
      { offerId: 'o-seife-b', productId: 'p-seife', quantity: 1, unitPriceMinor: 209, titleSnapshot: 'Handseife Zitrone · 300 ml' },
    ],
    quote: quote(448, 390, 18, 30, 'drone'), address: 'Berliner Platz 7, Wuppertal',
    droneId: 'D-03', pickupCode: 'P-4403', deliveryCode: 'D-4403',
    timeline: baseTimeline('Vorbereitung gestartet', 'Ware wird für die Drohne beladen.'),
    note: 'Express, Drohne H60.',
  },
  {
    id: 'SK-1050', createdAt: '13:56', customerName: 'P. Lang', storeId: 's-cronenberg', merchantId: 'm-cronenberg',
    status: 'READY', merchantTask: 'HANDED_OVER', paymentStatus: 'CAPTURED', deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-aepfel-c', productId: 'p-aepfel', quantity: 2, unitPriceMinor: 279, titleSnapshot: 'Äpfel Elstar · 1 kg' },
      { offerId: 'o-saft-c', productId: 'p-saft', quantity: 1, unitPriceMinor: 239, titleSnapshot: 'Apfelsaft naturtrüb · 1 L' },
    ],
    quote: quote(797, 390, 22, 36, 'drone'), address: 'Cronenberger Straße 10, Wuppertal',
    droneId: 'D-05', pickupCode: 'P-5504', deliveryCode: 'D-5504',
    timeline: baseTimeline('Abholbereit', 'Drohne D-05 wartet auf Startfreigabe.'),
    note: 'Ware übergeben. Erwarteter Start läuft.',
  },
  {
    id: 'SK-1051', createdAt: '13:30', customerName: 'S. Krüger', storeId: 's-elberfeld', merchantId: 'm-frische',
    status: 'IN_TRANSIT', merchantTask: 'HANDED_OVER', paymentStatus: 'CAPTURED', deliveryStatus: 'IN_TRANSIT',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-muesli-e', productId: 'p-muesli', quantity: 1, unitPriceMinor: 429, titleSnapshot: 'Hafermüsli · 750 g' },
      { offerId: 'o-saft-e', productId: 'p-saft', quantity: 2, unitPriceMinor: 219, titleSnapshot: 'Apfelsaft naturtrüb · 1 L' },
    ],
    quote: quote(867, 390, 20, 34, 'drone'), address: 'Varresbecker Straße 40, Wuppertal',
    droneId: 'D-06', pickupCode: 'P-6605', deliveryCode: 'D-6605',
    timeline: [
      ...baseTimeline('Start freigegeben', 'Drohne H60 im Korridor Richtung Varresbeck.'),
      { at: '13:55', label: 'Im Flug', detail: 'Höhe 60 bis 80 m, Link gut.', actor: 'Flugbetrieb' },
    ],
    note: 'Drohne im Flug.',
  },
  {
    id: 'SK-1052', createdAt: '12:48', customerName: 'M. Roth', storeId: 's-barmen', merchantId: 'm-barmen',
    status: 'DELIVERED', merchantTask: 'HANDED_OVER', paymentStatus: 'CAPTURED', deliveryStatus: 'DELIVERED',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-bananen-b', productId: 'p-bananen', quantity: 1, unitPriceMinor: 209, titleSnapshot: 'Bananen · 1 kg' },
      { offerId: 'o-eier-b', productId: 'p-eier', quantity: 1, unitPriceMinor: 329, titleSnapshot: 'Freilandeier · 10 Stück' },
    ],
    quote: quote(538, 390, 18, 30, 'drone'), address: 'Alter Markt 4, Wuppertal',
    droneId: 'D-01', pickupCode: 'P-7706', deliveryCode: 'D-7706',
    timeline: [
      ...baseTimeline('Start freigegeben', 'Drohne D-01 zum Alter Markt.'),
      { at: '13:12', label: 'Gelandet', detail: 'Abgabestelle Alter Markt, Empfang bestätigt.', actor: 'Flugbetrieb' },
    ],
    note: 'Abgeschlossen.',
  },
  {
    id: 'SK-1053', createdAt: '12:20', customerName: 'T. Sommer', storeId: 's-elberfeld', merchantId: 'm-frische',
    status: 'CANCELLED', merchantTask: 'REJECTED', paymentStatus: 'VOIDED', deliveryStatus: 'NONE',
    fulfillment: 'delivery', service: 'standard',
    lines: [{ offerId: 'o-seife-e', productId: 'p-seife', quantity: 1, unitPriceMinor: 199, titleSnapshot: 'Handseife Zitrone · 300 ml' }],
    quote: quote(199, 390, 20, 34, 'drone'), address: 'Obere Sehlhofstraße 3, Wuppertal',
    droneId: null, pickupCode: '', deliveryCode: '',
    timeline: baseTimeline('Storniert', 'Kunde hat vor der Vorbereitung storniert.'),
    note: 'Storniert, Autorisierung aufgehoben.',
  },
  {
    id: 'SK-1054', createdAt: '14:05', customerName: 'B. Yildiz', storeId: 's-barmen', merchantId: 'm-barmen',
    status: 'PENDING', merchantTask: 'NEW', paymentStatus: 'AUTHORIZED', deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery', service: 'standard',
    lines: [{ offerId: 'o-palette-b', productId: 'p-palette', quantity: 1, unitPriceMinor: 1899, titleSnapshot: 'Wasserpalette · 36 x 1,5 L' }],
    quote: quote(1899, 990, 20, 35, 'heavy_drone'), address: 'Berliner Platz 7, Wuppertal',
    droneId: 'D-03', pickupCode: 'P-8807', deliveryCode: 'D-8807',
    timeline: baseTimeline('Bestellung angelegt', 'Schwerlast-Drohne H60 vorgesehen.'),
    note: '58 kg, Schwerlast-Drohne H60.',
  },
  {
    id: 'SK-1055', createdAt: '11:55', customerName: 'C. Neumann', storeId: 's-vohwinkel', merchantId: 'm-vorrat',
    status: 'EXPIRED', merchantTask: 'NEW', paymentStatus: 'VOIDED', deliveryStatus: 'NONE',
    fulfillment: 'delivery', service: 'standard',
    lines: [{ offerId: 'o-milch-v', productId: 'p-milch', quantity: 1, unitPriceMinor: 119, titleSnapshot: 'H-Milch 1,5 % · 1 L' }],
    quote: quote(119, 390, 18, 30, 'drone'), address: 'Bahnhofstraße 30, Wuppertal',
    droneId: null, pickupCode: '', deliveryCode: '',
    timeline: baseTimeline('Angebot abgelaufen', 'Filiale geschlossen, Autorisierung aufgehoben.'),
    note: 'Abgelaufen, keine Buchung.',
  },
  {
    id: 'SK-2001', createdAt: '12:05', customerName: 'A. Yilmaz', storeId: 's-apotheke', merchantId: 'm-apotheke',
    status: 'DELIVERED', merchantTask: 'HANDED_OVER', paymentStatus: 'CAPTURED', deliveryStatus: 'DELIVERED',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-pflaster-a', productId: 'p-pflaster', quantity: 2, unitPriceMinor: 349, titleSnapshot: 'Pflaster-Set · 20 Stück' },
      { offerId: 'o-vitamin-a', productId: 'p-vitamin', quantity: 1, unitPriceMinor: 599, titleSnapshot: 'Vitamin C Brausetabletten · 20 Stück' },
    ],
    quote: quote(1297, 390, 15, 28, 'drone'), address: 'Alter Markt 6, Wuppertal',
    droneId: 'D-05', pickupCode: 'P-9001', deliveryCode: 'D-9001',
    timeline: [
      ...baseTimeline('Bestellung angelegt', 'Apothekenbestellung, Zahlung autorisiert.'),
      { at: '12:18', label: 'Start freigegeben', detail: 'Drohne D-05 zum Alter Markt.', actor: 'Flugbetrieb' },
      { at: '12:31', label: 'Gelandet', detail: 'Abgabestelle Alter Markt 6, Empfang bestätigt.', actor: 'Flugbetrieb' },
    ],
    note: 'Vollständig abgeschlossen. Apothekenprodukte, keine Beratung.',
  },
  {
    id: 'SK-2002', createdAt: '14:01', customerName: 'A. Yilmaz', storeId: 's-apotheke', merchantId: 'm-apotheke',
    status: 'IN_TRANSIT', merchantTask: 'HANDED_OVER', paymentStatus: 'CAPTURED', deliveryStatus: 'IN_TRANSIT',
    fulfillment: 'delivery', service: 'express',
    lines: [
      { offerId: 'o-desinfektion-a', productId: 'p-desinfektion', quantity: 1, unitPriceMinor: 449, titleSnapshot: 'Handdesinfektion · 250 ml' },
      { offerId: 'o-pflaster-a', productId: 'p-pflaster', quantity: 1, unitPriceMinor: 349, titleSnapshot: 'Pflaster-Set · 20 Stück' },
    ],
    quote: quote(798, 390, 14, 26, 'drone'), address: 'Berliner Platz 7, Wuppertal',
    droneId: 'D-06', pickupCode: 'P-9002', deliveryCode: 'D-9002',
    timeline: [
      ...baseTimeline('Bestellung angelegt', 'Apothekenbestellung, Express.'),
      { at: '14:10', label: 'Start freigegeben', detail: 'Drohne D-06 im Korridor nach Barmen.', actor: 'Flugbetrieb' },
    ],
    note: 'Drohne im Flug zur Abgabestelle Berliner Platz 7.',
  },
  {
    id: 'SK-2003', createdAt: '14:18', customerName: 'A. Yilmaz', storeId: 's-apotheke', merchantId: 'm-apotheke',
    status: 'PENDING', merchantTask: 'NEW', paymentStatus: 'AUTHORIZED', deliveryStatus: 'ASSIGNED',
    fulfillment: 'delivery', service: 'standard',
    lines: [
      { offerId: 'o-pflaster-a', productId: 'p-pflaster', quantity: 1, unitPriceMinor: 349, titleSnapshot: 'Pflaster-Set · 20 Stück' },
      { offerId: 'o-vitamin-a', productId: 'p-vitamin', quantity: 1, unitPriceMinor: 599, titleSnapshot: 'Vitamin C Brausetabletten · 20 Stück' },
    ],
    quote: quote(948, 390, 15, 28, 'drone'), address: 'Alter Markt 6, Wuppertal',
    droneId: 'D-01', pickupCode: 'P-9003', deliveryCode: 'D-9003',
    timeline: baseTimeline('Bestellung angelegt', 'Apothekenbestellung, Zahlung autorisiert.'),
    note: 'Wartet auf Annahme durch die Apotheke.',
  },

];

export const CURRENT_CUSTOMER_ID = 'c-demo';
const currentOrderIds = new Set(['SK-1041', 'SK-1043', 'SK-1047', 'SK-1050', 'SK-2001', 'SK-2002', 'SK-2003']);

export const initialOrders: Order[] = seedOrders.map((order) => {
  const payloadKg = order.lines.reduce((sum, line) => {
    const product = products.find((item) => item.id === line.productId);
    return sum + (product?.weightKg ?? 0) * line.quantity;
  }, 0);
  const weightFeeMinor = Math.round(Math.max(0, payloadKg - 5) * 25);
  const isCurrent = currentOrderIds.has(order.id);
  const store = stores.find((item) => item.id === order.storeId);
  const destination = findDestination(order.address);
  const distanceKm = order.fulfillment === 'delivery' && store
    ? Math.max(0.4, Math.round(Math.hypot(store.x - destination.x, store.y - destination.y) * MAP_KM_PER_UNIT * 10) / 10)
    : 0;
  const method = order.quote.method;
  const baseFeeMinor = method === 'drone' ? 290 : method === 'heavy_drone' ? 490 : method === 'car' ? 650 : 0;
  const perKmFeeMinor = method === 'drone' ? 22 : method === 'heavy_drone' ? 32 : method === 'car' ? 65 : 0;
  const distanceFeeMinor = method ? Math.round(distanceKm * perKmFeeMinor) : 0;
  const deliveryFeeMinor = baseFeeMinor + distanceFeeMinor;
  const serviceFeeMinor = order.service === 'express' ? 250 : 0;
  return {
    ...order,
    customerId: isCurrent ? CURRENT_CUSTOMER_ID : 'c-other',
    customerName: isCurrent ? 'A. Yilmaz' : order.customerName,
    droneDepartAt: order.droneId
      ? order.status === 'DELIVERED'
        ? Date.now() - 3_600_000
        : order.status === 'IN_TRANSIT'
          ? Date.now() - 60_000
          : Date.now() + 45_000
      : 0,
    quote: {
      ...order.quote,
      payloadKg,
      weightFeeMinor,
      distanceKm,
      baseFeeMinor,
      distanceFeeMinor,
      perKmFeeMinor,
      deliveryFeeMinor,
      serviceFeeMinor,
      totalMinor: order.quote.itemsSubtotalMinor + deliveryFeeMinor + weightFeeMinor + serviceFeeMinor,
    },
  };
});


export const initialCart: Cart = { storeId: null, lines: [] };

export const inventoryIssues: InventoryIssue[] = [
  { id: 'i-tomaten', offerId: 'o-tomaten-e', type: 'unavailable', label: 'Rispentomaten ausverkauft', detail: 'Elberfeld meldet 0 Bestand. Nicht verbindlich buchbar.', severity: 'critical' },
  { id: 'i-wasser', offerId: 'o-wasser-b', type: 'stale', label: 'Mineralwasser unbestätigt', detail: 'Barmen: letzter Abruf vor 14 Minuten, keine exakte Stückzahl.', severity: 'caution' },
  { id: 'i-brot', offerId: 'o-brot-b', type: 'low', label: 'Sauerteigbrot knapp', detail: 'Barmen: 4 Einheiten, Nachfrage im Mittagsfenster hoch.', severity: 'caution' },
  { id: 'i-geschlossen', offerId: 'o-wasser-v', type: 'closed', label: 'Vorratskammer Vohwinkel geschlossen', detail: 'Filiale heute geschlossen. Keine Bestellung möglich.', severity: 'critical' },
  { id: 'i-eis', offerId: 'o-eis-e', type: 'unavailable', label: 'Vanilleeis nicht im Pilot', detail: 'Kühlkette ist im Pilot nicht freigegeben.', severity: 'info' },
  { id: 'i-kaese', offerId: 'o-kaese-e', type: 'unavailable', label: 'Gouda nicht im Pilot', detail: 'Kühlkette ist im Pilot nicht freigegeben. Nicht buchbar.', severity: 'info' },
  { id: 'i-batterie', offerId: 'o-wasser-b', type: 'stale', label: 'D-04 Reserve niedrig', detail: 'Drohne D-04 ist gegroundet. Ersatzteil und Batterieprüfung offen.', severity: 'critical' },
];

export const categories = ['Alle', 'Lebensmittel', 'Backwaren', 'Getränke', 'Obst & Gemüse', 'Haushalt', 'Elektronik', 'Gesundheit'];

export const storeById = (id: string): Store | undefined => stores.find((store) => store.id === id);
export const merchantById = (id: string): Merchant | undefined => merchants.find((merchant) => merchant.id === id);
export const productById = (id: string): Product | undefined => products.find((product) => product.id === id);
export const offerById = (id: string): Offer | undefined => offers.find((offer) => offer.id === id);
export const orderById = (id: string): Order | undefined => initialOrders.find((order) => order.id === id);
