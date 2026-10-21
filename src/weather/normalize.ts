import type { WeatherLocation } from "./locations";
import type { ForecastHour, WeatherResponse } from "./types";

const HOUR = 60 * 60 * 1000;
/** Anzeige-/Cachepolicy der Demo, keine validierte Grenze für einen Flugbetrieb. */
export const DEMO_FORECAST_MAX_AGE_MS = 24 * HOUR;

export const WEATHER_LIMITATIONS = [
  "Vorhersage aus einem Wettermodell, keine Live-Messung.",
  "Globale Modellauflösung für Wuppertal ungefähr 9 km; lokale Hindernisse und Wind zwischen Gebäuden sind nicht aufgelöst.",
  "Temperatur in 2 m und Wind in 10 m über Modellgelände; keine Wetterdaten für eine geplante Flughöhe.",
  "Sichtweite, Vereisung und lokale Gewitter-/Blitzbeobachtungen fehlen. Böen sind je nach Modell nicht verfügbar.",
  "Belegte Fahrzeuggrenzen, lokale Messungen und weitere Pflichtprüfungen fehlen. Keine Flugfreigabe.",
] as const;

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function number(value: unknown, nonNegative = false): number | null {
  return typeof value === "number" && Number.isFinite(value) && (!nonNegative || value >= 0) ? value : null;
}

function timestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const result = Date.parse(value);
  return Number.isFinite(result) ? result : null;
}

export interface ForecastMetadata {
  fetchedAt: number | null;
  checkedAt: number | null;
  expiresAt: number | null;
  fromCache: boolean;
  forceStale?: boolean;
}

export function normalizeForecast(
  raw: unknown,
  location: WeatherLocation,
  now: number,
  metadata: ForecastMetadata,
): WeatherResponse {
  const root = record(raw);
  const properties = record(root.properties);
  const meta = record(properties.meta);
  const units = record(meta.units);
  if (!Array.isArray(properties.timeseries) || properties.timeseries.length === 0) {
    throw new Error("Wetteranbieter liefert keine auswertbare Zeitreihe.");
  }

  const missing = new Set<string>();
  const updatedAt = timestamp(meta.updated_at);
  if (updatedAt === null) missing.add("Aktualisierungszeit des Anbieters");
  const windowEnd = now + 24 * HOUR;
  const currentHour = Math.floor(now / HOUR) * HOUR;
  const hours: ForecastHour[] = [];
  const seen = new Set<number>();
  for (const row of properties.timeseries) {
    const item = record(row);
    const at = timestamp(item.time);
    if (at === null) {
      missing.add("Ungültige Prognosezeit");
      continue;
    }
    if (at < currentHour || at > windowEnd || seen.has(at)) continue;
    seen.add(at);
    const data = record(item.data);
    const details = record(record(data.instant).details);
    const periodHours = [1, 6, 12].find((period) => Object.keys(record(data[`next_${period}_hours`])).length > 0);
    const period = record(data[`next_${periodHours}_hours`]);
    const periodDetails = record(period.details);
    const summary = record(period.summary);
    const direction = units.wind_from_direction === "degrees" ? number(details.wind_from_direction, true) : null;
    const symbol = typeof summary.symbol_code === "string" && /^[a-z0-9_]{1,80}$/.test(summary.symbol_code)
      ? summary.symbol_code : null;
    const hour: ForecastHour = {
      time: new Date(at).toISOString(),
      temperatureC: units.air_temperature === "celsius" ? number(details.air_temperature) : null,
      windSpeedMps: units.wind_speed === "m/s" ? number(details.wind_speed, true) : null,
      windFromDegrees: direction !== null && direction <= 360 ? direction : null,
      precipitationMm: units.precipitation_amount === "mm" ? number(periodDetails.precipitation_amount, true) : null,
      precipitationPeriodHours: periodHours ?? null,
      symbolCode: symbol,
      gustMps: units.wind_speed_of_gust === "m/s" ? number(details.wind_speed_of_gust, true) : null,
    };
    if (hour.temperatureC === null) missing.add("Temperatur");
    if (hour.windSpeedMps === null) missing.add("Windgeschwindigkeit");
    if (hour.windFromDegrees === null) missing.add("Windrichtung");
    if (hour.precipitationMm === null) missing.add("Niederschlag");
    if (hour.symbolCode === null) missing.add("Wetterzustand");
    hours.push(hour);
  }
  hours.sort((a, b) => a.time.localeCompare(b.time));
  if (hours.length === 0) missing.add("Vorhersage für das aktuelle 24-Stunden-Fenster");
  const first = hours[0] ? Date.parse(hours[0].time) : Infinity;
  const last = hours.at(-1) ? Date.parse(hours.at(-1)!.time) : -Infinity;
  const lastPeriod = hours.at(-1)?.precipitationPeriodHours ?? 0;
  const hasGap = hours.some((hour, index) => index > 0 && Date.parse(hour.time) - Date.parse(hours[index - 1].time) > HOUR);
  if (first > now || last + lastPeriod * HOUR < windowEnd || hasGap) {
    missing.add("Lückenlose stündliche Abdeckung der nächsten 24 Stunden");
  }
  const primaryMissing = missing.size > 0;
  if (hours.some((hour) => hour.gustMps === null) || hours.length === 0) missing.add("Böen");
  missing.add("Sichtweite");
  missing.add("Vereisung");
  missing.add("Wetter in Flughöhe");
  missing.add("Lokale Gewitter-/Blitzbeobachtungen");
  const oldForecast = updatedAt !== null && (now - updatedAt > DEMO_FORECAST_MAX_AGE_MS || updatedAt > now + 5 * 60 * 1000);
  const stale = metadata.forceStale || oldForecast || (metadata.expiresAt !== null && metadata.expiresAt <= now);
  const geometry = record(root.geometry);
  const elevation = Array.isArray(geometry.coordinates) ? number(geometry.coordinates[2]) : null;
  const sourceUrl = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location.latitude.toFixed(4)}&lon=${location.longitude.toFixed(4)}`;
  return {
    location,
    provenance: metadata.fromCache ? "CACHED_FORECAST" : "ONLINE_FORECAST",
    status: stale ? "stale" : primaryMissing ? "partial" : "available",
    label: "Aktuell abgerufene Wettervorhersage",
    fetchedAt: metadata.fetchedAt === null ? null : new Date(metadata.fetchedAt).toISOString(),
    checkedAt: metadata.checkedAt === null ? null : new Date(metadata.checkedAt).toISOString(),
    providerUpdatedAt: updatedAt === null ? null : new Date(updatedAt).toISOString(),
    expiresAt: metadata.expiresAt === null ? null : new Date(metadata.expiresAt).toISOString(),
    requestedWindow: { from: new Date(now).toISOString(), to: new Date(windowEnd).toISOString() },
    hours,
    missingFields: [...missing],
    assessment: {
      status: "UNBESTIMMT",
      reasons: [
        ...(stale ? ["Gespeicherter oder zeitlich unplausibler Wetterstand; keine positive Bewertung."] : []),
        ...(primaryMissing ? ["Prognosefelder oder die zeitliche Abdeckung sind unvollständig."] : []),
        "Belegte Wettergrenzen des Fahrzeugs und ein geprüftes Betriebskonzept fehlen.",
        "Pflichtdaten für Route, Stationen, Flughöhe und vollständiges Missionsfenster sind nicht nachgewiesen.",
        "Die Wetteranzeige erteilt keine Flugfreigabe.",
      ],
    },
    heights: {
      temperatureMetresAboveGround: 2,
      windMetresAboveGround: 10,
      forecastGroundElevationMetres: elevation,
      flightAltitudeAvailable: false,
    },
    limitations: [...WEATHER_LIMITATIONS],
    attribution: {
      text: "Wetterdaten: MET Norway",
      sourceUrl,
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      changes: "Auswahl und Normalisierung der Prognose; Einheiten und Zeitintervalle werden angegeben.",
    },
  };
}

export function unavailableForecast(location: WeatherLocation, now: number): WeatherResponse {
  const response = normalizeForecast(
    { properties: { meta: {}, timeseries: [{ time: new Date(now).toISOString(), data: {} }] } },
    location,
    now,
    { fetchedAt: null, checkedAt: null, expiresAt: null, fromCache: false },
  );
  return { ...response, provenance: "UNAVAILABLE", status: "error", hours: [] };
}
