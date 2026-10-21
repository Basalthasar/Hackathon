/** Entirely fictional Wuppertal pitch data; no actual retailer or stock connection. */
export interface Merchant { id: string; name: string; kind: string }
export interface Store {
  id: string; merchantId: string; name: string; district: string; address: string;
  lat: number; lng: number; open: boolean;
}
export type ProductVisual = 'pantry' | 'coffee' | 'tea' | 'book' | 'soap' | 'oil' | 'pasta' | 'rice' | 'oats' | 'chocolate' | 'electronics' | 'toy' | 'flowers' | 'fruit' | 'bread';
export interface Offer {
  id: string; variantId: string; storeId: string; name: string; category: string;
  unit: string; priceMinor: number; stock: number; quality: 'confirmed' | 'unconfirmed';
  visual: ProductVisual;
}
export interface CartLine { offerId: string; quantity: number }

export const merchants: Merchant[] = [
  { id: 'M01', name: 'Talmarkt', kind: 'Supermarkt' },
  { id: 'M02', name: 'Seitenweise', kind: 'Buchhandlung' },
  { id: 'M03', name: 'Talmanufaktur', kind: 'Pflege & Zuhause' },
  { id: 'M04', name: 'Taltechnik', kind: 'Technikhandel' },
  { id: 'M05', name: 'Spielzeit', kind: 'Spielzeugladen' },
  { id: 'M06', name: 'Blütenzeit', kind: 'Blumenladen' },
];
export const stores: Store[] = [
  { id: 'S01', merchantId: 'M01', name: 'Talmarkt Elberfeld', district: 'Elberfeld', address: 'Fiktiver Standort · Neumarkt', lat: 51.2586, lng: 7.1484, open: true },
  { id: 'S02', merchantId: 'M01', name: 'Talmarkt Barmen', district: 'Barmen', address: 'Fiktiver Standort · Alter Markt', lat: 51.2697, lng: 7.1999, open: true },
  { id: 'S03', merchantId: 'M02', name: 'Seitenweise am Haspel', district: 'Haspel', address: 'Fiktiver Standort · Haspeler Straße', lat: 51.2593, lng: 7.1714, open: true },
  { id: 'S04', merchantId: 'M03', name: 'Talmanufaktur', district: 'Unterbarmen', address: 'Fiktiver Standort · Friedrich-Engels-Allee', lat: 51.2644, lng: 7.1838, open: false },
  { id: 'S05', merchantId: 'M04', name: 'Taltechnik', district: 'Elberfeld', address: 'Fiktiver Standort · Innenstadt Elberfeld', lat: 51.2615, lng: 7.1548, open: true },
  { id: 'S06', merchantId: 'M05', name: 'Spielzeit', district: 'Haspel', address: 'Fiktiver Standort · Haspel', lat: 51.263, lng: 7.1806, open: true },
  { id: 'S07', merchantId: 'M06', name: 'Blütenzeit', district: 'Barmen', address: 'Fiktiver Standort · Innenstadt Barmen', lat: 51.2705, lng: 7.1979, open: true },
];

const product = (id: string, variantId: string, storeId: string, name: string, category: string, unit: string, priceMinor: number, stock: number, visual: ProductVisual, quality: Offer['quality'] = 'confirmed'): Offer => ({ id, variantId, storeId, name, category, unit, priceMinor, stock, visual, quality });
export const offers: Offer[] = [
  product('O01', 'V01', 'S01', 'Bio Haferflocken', 'Vorrat', '500 g · fein', 189, 18, 'oats'),
  product('O02', 'V02', 'S01', 'Talröstung Kaffee', 'Kaffee & Tee', '250 g · ganze Bohne', 790, 7, 'coffee'),
  product('O03', 'V03', 'S01', 'Penne Rigate', 'Vorrat', '500 g · Hartweizen', 229, 14, 'pasta'),
  product('O04', 'V04', 'S01', 'Bio Basmatireis', 'Vorrat', '500 g · weiß', 349, 9, 'rice'),
  product('O05', 'V05', 'S01', 'Dunkle Schokolade', 'Süßes', '100 g · 70 % Kakao', 269, 1, 'chocolate'),
  product('O06', 'V06', 'S01', 'Kräutertee Abendruhe', 'Kaffee & Tee', '20 Beutel · koffeinfrei', 399, 6, 'tea'),
  product('O07', 'V07', 'S01', 'Rote Linsen', 'Vorrat', '500 g · getrocknet', 279, 12, 'pantry'),
  product('O08', 'V08', 'S01', 'Tomatenpassata', 'Vorrat', '500 ml · Glas', 199, 0, 'pantry'),
  product('O09', 'V09', 'S01', 'Nuss-Knuspermüsli', 'Vorrat', '400 g · mit Mandeln', 459, 5, 'oats', 'unconfirmed'),
  product('O10', 'V10', 'S01', 'Olivenöl Nativ Extra', 'Vorrat', '250 ml · Glasflasche', 649, 8, 'oil'),
  product('O11', 'V11', 'S01', 'Erdnussmus', 'Vorrat', '250 g · fein', 389, 9, 'pantry'),
  product('O12', 'V12', 'S01', 'Haferdrink Natur', 'Vorrat', '1 l · ungekühlt', 219, 15, 'pantry'),
  product('O13', 'V01', 'S02', 'Bio Haferflocken', 'Vorrat', '500 g · fein', 179, 11, 'oats'),
  product('O14', 'V02', 'S02', 'Talröstung Kaffee', 'Kaffee & Tee', '250 g · ganze Bohne', 819, 5, 'coffee'),
  product('O15', 'V03', 'S02', 'Penne Rigate', 'Vorrat', '500 g · Hartweizen', 249, 16, 'pasta'),
  product('O16', 'V04', 'S02', 'Bio Basmatireis', 'Vorrat', '500 g · weiß', 329, 10, 'rice'),
  product('O17', 'V13', 'S03', 'Wuppertal zu Fuß', 'Bücher', '1 Buch · Stadtspaziergänge', 1690, 3, 'book'),
  product('O18', 'V14', 'S03', 'Zwischen den Hügeln', 'Bücher', '1 Buch · fiktiver Roman', 1490, 4, 'book'),
  product('O19', 'V15', 'S03', 'Die kleine Schwebebahn', 'Bücher', '1 Buch · fiktives Kinderbuch', 1290, 5, 'book'),
  product('O20', 'V16', 'S03', 'Notizbuch Talgedanken', 'Bücher', 'A5 · punktkariert', 890, 8, 'book'),
  product('O21', 'V17', 'S04', 'Naturseife Lavendel', 'Pflege & Zuhause', '100 g · feste Seife', 590, 5, 'soap'),
  product('O22', 'V18', 'S04', 'Handbalsam Mandel', 'Pflege & Zuhause', '50 ml · Dose', 790, 4, 'soap'),
  product('O23', 'V19', 'S04', 'Rapswachskerze', 'Pflege & Zuhause', '120 g · ohne Duft', 990, 6, 'soap'),
  product('O24', 'V20', 'S04', 'Bienenwachstücher', 'Pflege & Zuhause', '3 Stück · Set', 1290, 3, 'pantry'),
  product('O25', 'V21', 'S05', 'Wireless-Kopfhörer', 'Technik', '1 Stück · kabelloser Over-Ear', 5990, 6, 'electronics'),
  product('O26', 'V22', 'S05', 'Bluetooth-Lautsprecher', 'Technik', '1 Stück · tragbar', 3990, 5, 'electronics'),
  product('O27', 'V23', 'S05', 'USB-C-Ladegerät 65 W', 'Technik', '1 Stück · ohne Kabel', 2490, 12, 'electronics'),
  product('O28', 'V24', 'S05', 'Powerbank 10.000 mAh', 'Technik', '1 Stück · USB-C', 2990, 8, 'electronics'),
  product('O29', 'V25', 'S06', 'Holzbauklötze', 'Spielzeug', '40 Stück · natur & bunt', 2490, 7, 'toy'),
  product('O30', 'V26', 'S06', 'Plüschtier Fuchs', 'Spielzeug', '1 Stück · 25 cm', 1990, 5, 'toy'),
  product('O31', 'V27', 'S06', 'Puzzle Stadt im Tal', 'Spielzeug', '500 Teile · Stadtmotiv', 1490, 9, 'toy'),
  product('O32', 'V28', 'S06', 'Spielzeugauto aus Holz', 'Spielzeug', '1 Stück · rot', 1290, 11, 'toy'),
  product('O33', 'V29', 'S07', 'Tulpenstrauß', 'Blumen', '10 Stiele · bunter Mix', 1490, 8, 'flowers'),
  product('O34', 'V30', 'S07', 'Rosé-Mixstrauß', 'Blumen', '1 Strauß · saisonaler Mix', 2490, 6, 'flowers'),
  product('O35', 'V31', 'S07', 'Sonnenblumenstrauß', 'Blumen', '5 Stiele · gelb', 1290, 7, 'flowers'),
  product('O36', 'V32', 'S07', 'Mini-Orchidee im Topf', 'Blumen', '1 Pflanze · im Übertopf', 1190, 5, 'flowers'),
  product('O37', 'V33', 'S01', 'Bio Äpfel', 'Lebensmittel', '1 kg · feste Packung', 349, 16, 'fruit'),
  product('O38', 'V34', 'S01', 'Bananen', 'Lebensmittel', '1 kg · feste Packung', 229, 20, 'fruit'),
  product('O39', 'V35', 'S01', 'Sauerteigbrot', 'Lebensmittel', '500 g · ein Laib', 449, 9, 'bread'),
  product('O40', 'V36', 'S01', 'Cherry-Tomaten', 'Lebensmittel', '250 g · Schale', 249, 13, 'fruit'),
];
export const categories = [...new Set(offers.map(offer => offer.category))];
export const getStore = (id: string): Store | undefined => stores.find(store => store.id === id);
export const getOffer = (id: string): Offer | undefined => offers.find(offer => offer.id === id);
export function searchOffers(query = '', category = 'Alle'): Offer[] {
  const term = query.toLocaleLowerCase('de').trim();
  return offers.filter(offer => (category === 'Alle' || category === offer.category) && `${offer.name} ${offer.unit} ${getStore(offer.storeId)?.name} ${getStore(offer.storeId)?.district}`.toLocaleLowerCase('de').includes(term));
}
export const formatMoney = (minor: number): string => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(minor / 100);
