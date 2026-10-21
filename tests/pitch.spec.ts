import { test, expect, type Page, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { WEATHER_LOCATIONS } from '../src/weather/locations';
import type { WeatherResponse } from '../src/weather/types';

const STORAGE = 'dronedeliver-pitch-v1';
const TILE_REQUEST = /https:\/\/[^/]*tile\.openstreetmap\.org\/.*\.png/;
const TRANSPARENT_TILE = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a6GkAAAAASUVORK5CYII=', 'base64');
const runtimeErrors = new WeakMap<Page, string[]>();

/** Network fixtures exercise rendering, not the real provider integration. */
function weatherFixture(locationId: string): WeatherResponse {
  const location = WEATHER_LOCATIONS.find(item => item.id === locationId) ?? WEATHER_LOCATIONS[0];
  const now = Date.now();
  return {
    location, provenance: 'ONLINE_FORECAST', status: 'partial', label: 'Aktuell abgerufene Wettervorhersage',
    fetchedAt: new Date(now).toISOString(), checkedAt: new Date(now).toISOString(),
    providerUpdatedAt: new Date(now - 30 * 60_000).toISOString(), expiresAt: new Date(now + 60 * 60_000).toISOString(),
    requestedWindow: { from: new Date(now).toISOString(), to: new Date(now + 24 * 60 * 60_000).toISOString() },
    hours: Array.from({ length: 24 }, (_, index) => ({
      time: new Date(now + index * 60 * 60_000).toISOString(), temperatureC: 14, windSpeedMps: 3.2,
      windFromDegrees: 225, precipitationMm: 0.1, precipitationPeriodHours: 1, symbolCode: 'partlycloudy_day', gustMps: null,
    })),
    missingFields: ['Böen', 'Sichtweite', 'Vereisung', 'Flughöhenwetter'],
    assessment: { status: 'UNBESTIMMT', reasons: ['Testvorhersage ohne vollständige Pflichtdaten.'] },
    heights: { temperatureMetresAboveGround: 2, windMetresAboveGround: 10, forecastGroundElevationMetres: 150, flightAltitudeAvailable: false },
    limitations: ['Nur Browser-Testfixture; keine Prüfung der MET-Norway-Anbindung.'],
    attribution: { text: 'MET Norway', sourceUrl: 'https://www.met.no/', licenseUrl: 'https://creativecommons.org/licenses/by/4.0/', changes: 'Browser-Testfixture' },
  };
}
const nav = (page: Page, name: string) => page.getByRole('navigation', { name: 'Mobile Hauptnavigation' }).getByRole('button', { name, exact: true });
const cartDialog = (page: Page) => page.getByRole('dialog', { name: 'Deine Tasche', exact: true });
const productButton = (page: Page, name = 'Bio Haferflocken', store = 'Talmarkt Elberfeld') => page.getByRole('button', { name: `${name} von ${store} hinzufügen`, exact: true });
async function savedSession(page: Page) { return page.evaluate(key => JSON.parse(localStorage.getItem(key) ?? '{}'), STORAGE); }
async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
}
async function openCart(page: Page) {
  await page.getByRole('button', { name: /Tasche ansehen/ }).click();
  const dialog = cartDialog(page);
  await expect(dialog).toBeVisible();
  return dialog;
}
async function startOrder(page: Page, pickup = false) {
  await productButton(page).click();
  const dialog = await openCart(page);
  if (pickup) await dialog.getByRole('button', { name: /Abholen ohne Gebühr/ }).click();
  else await dialog.getByRole('button', { name: /Fahrrad als Alternative/ }).click();
  await dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true }).click();
  await dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Deine Lieferung. Im Blick.' })).toBeVisible();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
}
async function step(page: Page, count = 1) {
  for (let index = 0; index < count; index++) await page.getByRole('button', { name: 'Nächster Schritt', exact: true }).click();
}
async function expectFocusIn(dialog: Locator) {
  expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => {
    if (message.type() === 'error' && !/Failed to load resource|ERR_INTERNET_DISCONNECTED|ERR_FAILED/.test(message.text())) errors.push(message.text());
  });
  await page.route('**/api/weather?*', async route => {
    const id = new URL(route.request().url()).searchParams.get('locationId') ?? 'HUB';
    await route.fulfill({ json: weatherFixture(id) });
  });
  // Avoid external tile traffic in automated checks. Separate tests cover failure UI.
  await page.route(TILE_REQUEST, route => route.fulfill({ contentType: 'image/png', body: TRANSPARENT_TILE }));
  await page.goto('/');
  await expect(page).toHaveURL('http://127.0.0.1:3000/');
  await expect(page).toHaveTitle(/Fly2You/);
  await expect(page.getByRole('button', { name: 'Fly2You Startseite', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pitch-Menü', exact: true })).toHaveAttribute('aria-label', 'Pitch-Menü');
  await expect(page.getByText(/DroneDeliver|LOKAL\. VERBUNDEN\.|FÜR DEINEN ALLTAG\. FÜR UNSER TAL\.|UM DIE ECKE, ONLINE ENTDECKT|DAS TAL VERBINDET/)).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /Dein Einkauf/ })).toBeVisible();
  await expect.poll(async () => (await savedSession(page)).version).toBe(2);
});

test.afterEach(async ({ page }) => {
  expect(runtimeErrors.get(page) ?? [], 'Unexpected JavaScript/runtime console errors').toEqual([]);
  await expect(page.locator('nextjs-portal')).toHaveCount(0);
});

test('360px: a bicycle order reaches arrival before receipt and completes with a separate event', async ({ page }) => {
  await startOrder(page);
  await noHorizontalOverflow(page);
  await step(page, 6);
  let session = await savedSession(page);
  expect(session.orders).toHaveLength(1);
  expect(session.orders[0].delivery.status).toBe('AT_DESTINATION');
  expect(session.orders[0].orderStatus).toBe('FULFILLING');
  await expect(page.getByText('Abgeschlossen', { exact: true })).toHaveCount(0);
  await step(page);
  await expect(page.getByRole('heading', { name: 'Gut angekommen.' })).toBeVisible();
  session = await savedSession(page);
  expect(session.orders[0].delivery.status).toBe('DELIVERED');
  expect(session.orders[0].paymentStatus).toBe('CAPTURED');
  expect(session.orders[0].preparationStatus).toBe('HANDED_OVER');
  await noHorizontalOverflow(page);
});

test('360px: self-collection has no delivery job or delivery fee', async ({ page }) => {
  await startOrder(page, true);
  await expect(page.getByText('Selbstabholung · kein Lieferauftrag')).toBeVisible();
  await step(page, 4);
  await expect(page.getByRole('heading', { name: 'Gut angekommen.' })).toBeVisible();
  const order = (await savedSession(page)).orders[0];
  expect(order.delivery).toBeNull();
  expect(order.quote.deliveryFeeMinor).toBe(0);
  expect(order.quote.totalMinor).toBe(order.quote.itemsSubtotalMinor);
  await noHorizontalOverflow(page);
});

test('store switching can be cancelled or explicitly accepted without mixing stores', async ({ page }) => {
  await productButton(page).click();
  await productButton(page, 'Bio Haferflocken', 'Talmarkt Barmen').click();
  const dialog = page.getByRole('dialog', { name: 'Zu einer anderen Filiale wechseln?' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Tasche behalten', exact: true }).click();
  expect((await savedSession(page)).cart).toEqual([{ offerId: 'O01', quantity: 1 }]);
  await productButton(page, 'Bio Haferflocken', 'Talmarkt Barmen').click();
  await dialog.getByRole('button', { name: 'Filiale wechseln', exact: true }).click();
  await expect(dialog).not.toBeVisible();
  expect((await savedSession(page)).cart).toEqual([{ offerId: 'O13', quantity: 1 }]);
});

test('stale stock, sold-out goods and a closed store cannot be booked', async ({ page }) => {
  const cases = [
    { name: 'Nuss-Knuspermüsli', store: 'Talmarkt Elberfeld', label: 'Bestand unbestätigt' },
    { name: 'Tomatenpassata', store: 'Talmarkt Elberfeld', label: 'Ausverkauft' },
    { name: 'Naturseife Lavendel', store: 'Talmanufaktur', label: 'Filiale geschlossen' },
  ];
  for (const item of cases) {
    const product = page.getByRole('article').filter({ has: page.getByRole('heading', { name: item.name, exact: true }) });
    await expect(product.getByText(item.label, { exact: true })).toBeVisible();
    await expect(productButton(page, item.name, item.store)).toBeDisabled();
  }
  expect((await savedSession(page)).cart).toEqual([]);
});

test('an expired quote needs recomputation and cannot start checkout', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-21T12:00:00Z') });
  await productButton(page).click();
  const dialog = await openCart(page);
  await dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true })).toBeVisible();
  await page.clock.fastForward(121_000);
  await expect(dialog.getByText('Beispielzeitfenster · Angebot abgelaufen')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true })).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Demo-Angebot neu berechnen', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true })).toBeVisible();
  expect((await savedSession(page)).orders).toHaveLength(0);
});

test('two immediate checkout activations produce exactly one order', async ({ page }) => {
  await productButton(page).click();
  const dialog = await openCart(page);
  await dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true }).click();
  // Same event turn: a second activation reaches the busy guard before React unmounts.
  await dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true }).evaluate(element => {
    (element as HTMLButtonElement).click();
    (element as HTMLButtonElement).click();
  });
  await expect(page.getByRole('heading', { name: 'Deine Lieferung. Im Blick.' })).toBeVisible();
  await expect.poll(async () => (await savedSession(page)).orders.length).toBe(1);
  expect((await savedSession(page)).orders[0].id).toBe('DD-0001');
});

test('reload preserves cart and later the paused order progress', async ({ page }) => {
  await productButton(page).click();
  await expect.poll(async () => (await savedSession(page)).cart.length).toBe(1);
  await page.reload();
  await expect(page.getByRole('button', { name: /Tasche ansehen/ })).toBeVisible();
  const dialog = await openCart(page);
  await dialog.getByRole('button', { name: /Fahrrad als Alternative/ }).click();
  await dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true }).click();
  await dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await step(page, 3);
  await expect.poll(async () => (await savedSession(page)).orders[0].step).toBe(3);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Deine Lieferung. Im Blick.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abspielen', exact: true })).toBeVisible();
  expect((await savedSession(page)).orders[0].step).toBe(3);
  await step(page);
  expect((await savedSession(page)).orders[0].delivery.status).toBe('PICKED_UP');
});

test('station arrival, deposit, readiness and customer collection remain four events', async ({ page }) => {
  await nav(page, 'Stationen').click();
  await step(page, 2);
  await expect(page.getByText('Die Drohne ist angekommen. Das Paket ist noch nicht eingelagert.')).toBeVisible();
  expect((await savedSession(page)).stationStep).toBe(2);
  await step(page);
  await expect(page.getByText('Einlagerung simuliert. Die Abholbereitschaft folgt gesondert.')).toBeVisible();
  await step(page);
  await expect(page.getByText('Fach 07 · Die Abholung muss noch bestätigt werden.')).toBeVisible();
  expect((await savedSession(page)).stationStep).toBe(4);
  await page.getByRole('button', { name: 'Abholung in der Demo bestätigen', exact: true }).click();
  await expect(page.getByText('Die Kundenabholung wurde in dieser Demo bestätigt.')).toBeVisible();
  expect((await savedSession(page)).stationStep).toBe(5);
});

test('routing finds the blocked-corridor alternative and explains full, offline and weather stops', async ({ page }) => {
  await nav(page, 'Routing').click();
  await page.getByRole('combobox', { name: 'Ziel', exact: true }).selectOption('Z03');
  await expect(page.getByText('Demo-Weg gefunden', { exact: true })).toBeVisible();
  const scenario = page.getByRole('combobox', { name: 'Szenario', exact: true });
  await scenario.selectOption('blocked');
  await expect(page.getByText('Die Sperrung wird über die Nordverbindung umgangen.')).toBeVisible();
  await expect(page.getByText('WX', { exact: true })).toBeVisible();
  for (const name of ['full', 'offline', 'weather']) {
    await scenario.selectOption(name);
    await expect(page.getByText('Kein Start', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Simulation abspielen', exact: true })).toBeDisabled();
    await expect(page.getByText(/Reale Bewertung:/)).toContainText('UNBESTIMMT');
  }
  await scenario.selectOption('normal');
  await expect(page.getByRole('button', { name: 'Simulation abspielen', exact: true })).toBeEnabled();
  await noHorizontalOverflow(page);
});

test('tile failure leaves routing, attribution and a schematic fallback usable', async ({ page }) => {
  await page.unroute(TILE_REQUEST);
  await page.route(TILE_REQUEST, route => route.abort('failed'));
  await nav(page, 'Routing').click();
  await expect(page.getByText('Kartenkacheln nicht verfügbar')).toBeVisible();
  await expect(page.getByRole('link', { name: 'OpenStreetMap', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Netzansicht öffnen', exact: true }).click();
  await expect(page.getByLabel('Schematisches Demo-Netz, keine geografisch genaue Karte')).toBeVisible();
  await page.getByRole('combobox', { name: 'Szenario', exact: true }).selectOption('blocked');
  await expect(page.getByText('Demo-Weg gefunden', { exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
});

test('the prepared station simulation remains usable after losing connectivity', async ({ page, context }) => {
  await nav(page, 'Stationen').click();
  // Wait for the lazily loaded map module before simulating a network loss.
  await expect(page.getByRole('button', { name: 'Netz', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Netz', exact: true }).click();
  await context.setOffline(true);
  await step(page, 4);
  await page.getByRole('button', { name: 'Abholung in der Demo bestätigen', exact: true }).click();
  await expect(page.getByText('Die Kundenabholung wurde in dieser Demo bestätigt.')).toBeVisible();
  expect((await savedSession(page)).stationStep).toBe(5);
  await context.setOffline(false);
});

test('weather provenance stays separate from scenario values and remains explicit after reset', async ({ page }) => {
  await nav(page, 'Routing').click();
  const weather = page.getByRole('region', { name: 'Wetter entlang der Route' });
  await weather.getByRole('button', { name: 'Daten & 24-Stunden-Vorschau' }).click();
  await expect(weather.getByText('Online-Vorhersage', { exact: true })).toBeVisible();
  await page.getByRole('combobox', { name: 'Szenario', exact: true }).selectOption('weather');
  await expect(page.getByText(/Simulierter Wetterstopp:/).first()).toBeVisible();
  await expect(weather.getByText('Online-Vorhersage', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Pitch-Menü', exact: true }).click();
  const pitch = page.getByRole('dialog', { name: 'Dein Pitch. Dein Tempo.' });
  await pitch.getByRole('button', { name: 'Gesamte Demo neu starten', exact: true }).click();
  await page.getByRole('dialog', { name: 'Von vorn beginnen?' }).getByRole('button', { name: 'Demo neu starten', exact: true }).click();
  await expect(page.getByRole('heading', { name: /Dein Einkauf/ })).toBeVisible();
  await nav(page, 'Routing').click();
  await expect(page.getByRole('combobox', { name: 'Szenario', exact: true })).toHaveValue('normal');
  await expect(page.getByText(/Reale Bewertung:/)).toContainText('UNBESTIMMT');
  await expect(weather.getByText('Aktuell abgerufene Wettervorhersage')).toBeVisible();
  await weather.getByRole('button', { name: 'Daten & 24-Stunden-Vorschau' }).click();
  await expect(weather.getByText('Online-Vorhersage', { exact: true })).toBeVisible();
});

test('keyboard dialog focus, Escape, theme persistence and reduced motion work', async ({ page }) => {
  const trigger = page.getByRole('button', { name: 'Pitch-Menü', exact: true });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog', { name: 'Dein Pitch. Dein Tempo.' });
  await expect(dialog).toBeVisible();
  await expectFocusIn(dialog);
  await page.keyboard.press('Shift+Tab');
  // Native <dialog> may transfer the boundary focus to browser chrome (body).
  // Background page controls must remain unreachable; Tab returns to the modal.
  expect(await dialog.evaluate(element => element.contains(document.activeElement) || document.activeElement === document.body)).toBe(true);
  await page.keyboard.press('Tab');
  await expectFocusIn(dialog);
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await page.getByRole('button', { name: 'Dunkelmodus einschalten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Hellmodus einschalten' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  expect(await page.locator('html').evaluate(element => getComputedStyle(element).scrollBehavior)).toBe('auto');
  await noHorizontalOverflow(page);
});

test('axe: core mobile screens and cart dialog meet WCAG A/AA checks', async ({ page }) => {
  for (const screen of ['Entdecken', 'Stationen', 'Routing']) {
    if (screen !== 'Entdecken') await nav(page, screen).click();
    if (screen === 'Routing') await page.getByRole('button', { name: 'Netz', exact: true }).first().click();
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    expect(result.violations, `${screen}: ${JSON.stringify(result.violations, null, 2)}`).toEqual([]);
    await noHorizontalOverflow(page);
  }
  await nav(page, 'Entdecken').click();
  await productButton(page).click();
  await openCart(page);
  const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(result.violations, JSON.stringify(result.violations, null, 2)).toEqual([]);
});

test('each catalogue category exposes generated product photographs that actually load', async ({page})=>{
  for(const category of ['Vorrat','Kaffee & Tee','Süßes','Bücher','Pflege & Zuhause','Technik','Spielzeug','Blumen','Lebensmittel']){
    await page.getByRole('button',{name:category,exact:true}).click();
    const images=page.getByRole('article').getByRole('img');
    expect(await images.count()).toBeGreaterThan(0);
    for(const image of await images.all()){
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute('alt',/KI-generiertes Produktfoto/);
      await expect.poll(()=>image.evaluate(element=>(element as HTMLImageElement).complete&&(element as HTMLImageElement).naturalWidth>0)).toBe(true);
    }
    await noHorizontalOverflow(page);
  }
});

test('two product photos switch in a usable gallery and the selected item can be added',async({page})=>{
  await page.getByRole('button',{name:'Technik',exact:true}).click();
  await page.getByRole('button',{name:'2 Fotos · KI-generiert · Wireless-Kopfhörer ansehen',exact:true}).click();
  const dialog=page.getByRole('dialog',{name:'Wireless-Kopfhörer',exact:true});
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText('KI-generierte Produktfotos',{exact:true})).toBeVisible();
  await expect(dialog.getByText('1 / 2',{exact:true})).toBeVisible();
  const photo=dialog.getByRole('img',{name:'KI-generiertes Produktfoto: Wireless-Kopfhörer · Hauptansicht',exact:true}).first();
  await expect.poll(()=>photo.evaluate(element=>(element as HTMLImageElement).naturalWidth>0)).toBe(true);
  await dialog.getByRole('button',{name:'Nächstes Produktfoto',exact:true}).click();
  await expect(dialog.getByText('2 / 2',{exact:true})).toBeVisible();
  const second=dialog.getByRole('img',{name:'KI-generiertes Produktfoto: Wireless-Kopfhörer · Zweite Ansicht',exact:true}).first();
  await expect.poll(()=>second.evaluate(element=>(element as HTMLImageElement).naturalWidth>0)).toBe(true);
  await dialog.getByRole('button',{name:'Produktfoto 1 anzeigen',exact:true}).click();
  await expect(dialog.getByText('1 / 2',{exact:true})).toBeVisible();
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(accessibility.violations,JSON.stringify(accessibility.violations,null,2)).toEqual([]);
  await dialog.getByRole('button',{name:'In die Tasche',exact:true}).click();
  await expect(dialog).not.toBeVisible();
  await expect.poll(async()=>JSON.stringify((await savedSession(page)).cart)).toBe(JSON.stringify([{offerId:'O25',quantity:1}]));
  await noHorizontalOverflow(page);
});

test('drone is the default; chosen station persists and arrival is not collection', async({page})=>{
  await expect.poll(()=>page.getByRole('img',{name:'KI-Konzeptbild einer Lieferdrohne mit Paket über einer Stadt',exact:true}).evaluate(element=>(element as HTMLImageElement).naturalWidth>0)).toBe(true);
  await page.screenshot({path:'/tmp/fly2you-mobile-final.png'});
  await productButton(page).click();
  let dialog=await openCart(page);
  await expect(dialog.getByRole('button',{name:/Drohne.*zur Station/i})).toHaveAttribute('aria-pressed','true');
  expect((await savedSession(page)).mode).toBe('DRONE');
  await page.screenshot({path:'/tmp/fly2you-drone-cart-mobile-final.png'});
  const target=dialog.getByRole('combobox',{name:'Zielstation',exact:true});
  await target.selectOption('Z02');
  await dialog.getByRole('button',{name:'Dialog schließen',exact:true}).click();
  await page.reload();
  dialog=await openCart(page);
  await expect(dialog.getByRole('combobox',{name:'Zielstation',exact:true})).toHaveValue('Z02');
  await dialog.getByRole('button',{name:'Demo-Angebot berechnen',exact:true}).click();
  await dialog.getByRole('button',{name:'Demo-Bestellung starten',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Deine Lieferung. Im Blick.',exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Pause',exact:true}).click();
  const created=(await savedSession(page)).orders[0];
  expect(created.mode).toBe('DRONE');
  expect(created.delivery.method).toBe('DRONE');
  expect(created.quote.destinationId).toBe('Z02');
  expect(created.quote.routingScenario).toBe('normal');
  expect(created.quote.flightClearance).toBe(false);
  expect(created.quote.realWeatherStatus).toBe('UNBESTIMMT');
  expect(created.quote.deliveryFeeMinor).toBe(390);
  await step(page,6);
  let order=(await savedSession(page)).orders[0];
  expect(order.delivery.status).toBe('AT_DESTINATION');
  expect(order.orderStatus).toBe('FULFILLING');
  await step(page);
  order=(await savedSession(page)).orders[0];
  expect(order.delivery.status).toBe('STORED');
  expect(order.orderStatus).toBe('FULFILLING');
  await step(page);
  order=(await savedSession(page)).orders[0];
  expect(order.delivery.status).toBe('READY_FOR_COLLECTION');
  expect(order.orderStatus).toBe('FULFILLING');
  await expect(page.getByText('Abgeschlossen',{exact:true})).toHaveCount(0);
  const accessibility=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa']).analyze();
  expect(accessibility.violations,JSON.stringify(accessibility.violations,null,2)).toEqual([]);
  const collect=page.getByRole('button',{name:'Abholung in der Demo bestätigen',exact:true});
  await expect(collect).toBeVisible();
  await expect(page.getByRole('button',{name:'Abspielen',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Netz',exact:true}).first().click();
  await page.screenshot({path:'/tmp/fly2you-drone-tracking-final.png',fullPage:true});
  await collect.click();
  order=(await savedSession(page)).orders[0];
  expect(order.delivery.status).toBe('COLLECTED');
  expect(order.orderStatus).toBe('COMPLETED');
  await expect(page.getByRole('heading',{name:'Gut angekommen.',exact:true})).toBeVisible();
  await noHorizontalOverflow(page);
});

test('1440px: the drone landing and default station checkout fit the desktop viewport', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.getByRole('heading', { name: 'Dein Einkauf. Per Drohne zu dir.', exact: true })).toBeVisible();
  await noHorizontalOverflow(page);
  const landing = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(landing.violations, JSON.stringify(landing.violations, null, 2)).toEqual([]);
  await expect.poll(()=>page.getByRole('img',{name:'KI-Konzeptbild einer Lieferdrohne mit Paket über einer Stadt',exact:true}).evaluate(element=>(element as HTMLImageElement).naturalWidth>0)).toBe(true);
  await page.screenshot({path:'/tmp/fly2you-desktop-final.png'});
  await productButton(page).click();
  const sidebar = page.getByRole('complementary', { name: 'Warenkorb', exact: true });
  await expect(sidebar.getByRole('button', { name: /Drohne.*zur Station/i })).toHaveAttribute('aria-pressed', 'true');
  await expect(sidebar.getByRole('combobox', { name: 'Zielstation', exact: true })).toHaveValue('Z03');
  const cart = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(cart.violations, JSON.stringify(cart.violations, null, 2)).toEqual([]);
  await sidebar.screenshot({path:'/tmp/fly2you-drone-cart-desktop-final.png'});
  await noHorizontalOverflow(page);
});

test('drone quotes stop for full or offline stations and weather while alternatives remain usable', async ({ page }) => {
  await productButton(page).click();
  const cases = [
    { scenario: 'full', reason: /Alle Fächer der Zielstation sind im Szenario belegt/ },
    { scenario: 'offline', reason: /Die Zielstation ist im Szenario ausgefallen/ },
    { scenario: 'weather', reason: /Simulierter Wetterstopp: Der Start wird verschoben/ },
  ];
  for (const item of cases) {
    await nav(page, 'Routing').click();
    await page.getByRole('combobox', { name: 'Szenario', exact: true }).selectOption(item.scenario);
    await nav(page, 'Entdecken').click();
    const dialog = await openCart(page);
    const calculate = dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true });
    await expect(dialog.getByText(item.reason)).toBeVisible();
    await expect(calculate).toBeDisabled();
    await expect(dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true })).toHaveCount(0);
    await dialog.getByRole('button', { name: /Fahrrad als Alternative/ }).click();
    await expect(calculate).toBeEnabled();
    await dialog.getByRole('button', { name: /Abholen ohne Gebühr/ }).click();
    await expect(calculate).toBeEnabled();
    await dialog.getByRole('button', { name: /Drohne.*zur Station/i }).click();
    await expect(calculate).toBeDisabled();
    await dialog.getByRole('button', { name: 'Dialog schließen', exact: true }).click();
  }
  expect((await savedSession(page)).orders).toEqual([]);
  await noHorizontalOverflow(page);
});

test('an available drone detour is snapshotted and keeps its destination after routing changes and reload', async ({ page }) => {
  await nav(page, 'Routing').click();
  await page.getByRole('combobox', { name: 'Ziel', exact: true }).selectOption('Z03');
  await page.getByRole('combobox', { name: 'Szenario', exact: true }).selectOption('blocked');
  await nav(page, 'Entdecken').click();
  await productButton(page).click();
  const dialog = await openCart(page);
  await expect(dialog.getByRole('combobox', { name: 'Zielstation', exact: true })).toHaveValue('Z03');
  await dialog.getByRole('button', { name: 'Demo-Angebot berechnen', exact: true }).click();
  await dialog.getByRole('button', { name: 'Demo-Bestellung starten', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  const original = (await savedSession(page)).orders[0].quote;
  expect(original.destinationId).toBe('Z03');
  expect(original.routingScenario).toBe('blocked');
  expect(original.routeMinutes).toBeGreaterThan(0);
  expect(original.missionMinutes).toBeGreaterThan(original.routeMinutes);
  expect(original.vehicleId).toBeTruthy();
  await nav(page, 'Routing').click();
  await page.getByRole('combobox', { name: 'Ziel', exact: true }).selectOption('Z02');
  await page.getByRole('combobox', { name: 'Szenario', exact: true }).selectOption('normal');
  await nav(page, 'Lieferung').click();
  await expect(page.getByText('Station Barmen', { exact: true }).first()).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Deine Lieferung. Im Blick.', exact: true })).toBeVisible();
  await expect(page.getByText('Station Barmen', { exact: true }).first()).toBeVisible();
  expect((await savedSession(page)).orders[0].quote).toEqual(original);
  await noHorizontalOverflow(page);
});

test('legacy version-one cart migrates to the drone default without losing its contents',async({page})=>{
  await productButton(page).click();
  await page.evaluate(key=>{
    const value=JSON.parse(localStorage.getItem(key)??'{}');
    value.version=1;value.mode='BICYCLE';
    localStorage.setItem(key,JSON.stringify(value));
  },STORAGE);
  await page.reload();
  await expect.poll(async()=>(await savedSession(page)).version).toBe(2);
  const migrated=await savedSession(page);
  expect(migrated.version).toBe(2);
  expect(migrated.mode).toBe('DRONE');
  expect(migrated.cart).toEqual([{offerId:'O01',quantity:1}]);
  const dialog=await openCart(page);
  await expect(dialog.getByRole('button',{name:/Drohne.*zur Station/i})).toHaveAttribute('aria-pressed','true');
});
