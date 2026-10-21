import { findWeatherLocation } from "./locations";
import { normalizeForecast, unavailableForecast } from "./normalize";
import type { WeatherErrorCode, WeatherProvider, WeatherResponse } from "./types";

// Die Projekt-URL stammt aus dem vorhandenen Git-Remote; keine erfundene Kontaktadresse.
export const DEFAULT_MET_USER_AGENT = "Fly2YouPitch/0.1 (+https://github.com/Jannik440/Hackathon)";
const FALLBACK_CACHE_MS = 10 * 60 * 1000;
const ERROR_COOLDOWN_MS = 60 * 1000;

interface CacheEntry {
  raw: unknown;
  fetchedAt: number;
  checkedAt: number;
  expiresAt: number;
  lastModified: string | null;
}

interface ProviderOptions {
  fetch?: typeof fetch;
  now?: () => number;
  sleep?: (milliseconds: number) => Promise<void>;
  userAgent?: string;
  timeoutMs?: number;
}

class WeatherFetchError extends Error {
  constructor(public code: WeatherErrorCode, message: string, public retryAt?: number) {
    super(message);
  }
}

export function createWeatherProvider(options: ProviderOptions = {}): WeatherProvider {
  const fetcher = options.fetch ?? fetch;
  const now = options.now ?? Date.now;
  const sleep = options.sleep ?? ((milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds)));
  const timeoutMs = options.timeoutMs ?? 4500;
  const userAgent = options.userAgent ?? process.env.MET_USER_AGENT ?? DEFAULT_MET_USER_AGENT;
  const cache = new Map<string, CacheEntry>();
  const pending = new Map<string, Promise<WeatherResponse>>();
  const failures = new Map<string, { until: number; error: WeatherFetchError }>();
  let rateBlockedUntil = 0;

  function expiry(response: Response, at: number): number {
    const header = response.headers.get("expires");
    const parsed = header ? Date.parse(header) : NaN;
    return Number.isFinite(parsed) ? parsed : at + FALLBACK_CACHE_MS;
  }

  async function request(url: string, entry?: CacheEntry): Promise<{ response: Response; raw?: unknown }> {
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        fetcher(url, {
          headers: {
            "User-Agent": userAgent,
            Accept: "application/json",
            ...(entry?.lastModified ? { "If-Modified-Since": entry.lastModified } : {}),
          },
          cache: "no-store",
          signal: controller.signal,
        }).then(async (response) => {
          // Der Timeout umfasst auch einen unvollständig übertragenen JSON-Body.
          if (!response.ok || response.status === 304) return { response };
          try { return { response, raw: await response.json() as unknown }; }
          catch { throw new WeatherFetchError("INVALID_DATA", "Die Antwort des Wetteranbieters ist kein gültiges JSON."); }
        }),
        new Promise<{ response: Response; raw?: unknown }>((_, reject) => {
          timeout = setTimeout(() => {
            controller.abort();
            reject(new WeatherFetchError("TIMEOUT", "Der Wetteranbieter hat nicht rechtzeitig geantwortet."));
          }, timeoutMs);
        }),
      ]);
    } catch (error) {
      if (error instanceof WeatherFetchError) throw error;
      if (controller.signal.aborted) throw new WeatherFetchError("TIMEOUT", "Zeitüberschreitung beim Wetterabruf.");
      throw new WeatherFetchError("UPSTREAM_ERROR", "Der Wetteranbieter ist derzeit nicht erreichbar.");
    } finally {
      if (timeout) clearTimeout(timeout);
    }
  }

  async function load(locationId: string): Promise<WeatherResponse> {
    const location = findWeatherLocation(locationId);
    if (!location) throw new Error("INVALID_LOCATION");
    const current = now();
    const entry = cache.get(locationId);
    const normalized = (item: CacheEntry, fromCache: boolean, forceStale = false) => normalizeForecast(item.raw, location, now(), { ...item, fromCache, forceStale });
    if (entry && entry.expiresAt > current) return normalized(entry, true);

    const fail = (error: WeatherFetchError): WeatherResponse => {
      const response = entry ? normalized(entry, true, true) : unavailableForecast(location, now());
      return {
        ...response,
        error: { code: error.code, message: error.message, ...(error.retryAt ? { retryAt: new Date(error.retryAt).toISOString() } : {}) },
        assessment: { status: "UNBESTIMMT", reasons: [error.message, ...response.assessment.reasons] },
      };
    };
    if (!userAgent.trim() || userAgent.includes("\n") || userAgent.includes("\r")) {
      return fail(new WeatherFetchError("CONFIGURATION_REQUIRED", "MET_USER_AGENT muss eine gültige Projekt-/Kontaktkennung enthalten."));
    }
    if (rateBlockedUntil > current) return fail(new WeatherFetchError("RATE_LIMITED", "Der Wetteranbieter begrenzt Anfragen. Bitte später erneut versuchen.", rateBlockedUntil));
    const failure = failures.get(locationId);
    if (failure && failure.until > current) return fail(failure.error);
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${location.latitude.toFixed(4)}&lon=${location.longitude.toFixed(4)}`;
    let finalError = new WeatherFetchError("UPSTREAM_ERROR", "Wetterdaten konnten nicht geladen werden.");
    // Maximal zwei Versuche; HTTP 429 wird niemals unmittelbar wiederholt.
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const { response, raw } = await request(url, entry);
        const received = now();
        if (response.status === 429) {
          const retryAfter = response.headers.get("retry-after");
          const seconds = retryAfter !== null && /^\d+$/.test(retryAfter) ? Number(retryAfter) : NaN;
          const date = retryAfter ? Date.parse(retryAfter) : NaN;
          const wanted = Number.isFinite(seconds) ? received + seconds * 1000 : date;
          rateBlockedUntil = Math.max(received + ERROR_COOLDOWN_MS, Number.isFinite(wanted) ? wanted : 0);
          throw new WeatherFetchError("RATE_LIMITED", "Der Wetteranbieter begrenzt Anfragen. Bitte später erneut versuchen.", rateBlockedUntil);
        }
        if (response.status === 304) {
          if (!entry) throw new WeatherFetchError("INVALID_DATA", "Unveränderte Antwort ohne gespeicherten Wetterstand.");
          const refreshed = { ...entry, checkedAt: received, expiresAt: expiry(response, received) };
          cache.set(locationId, refreshed);
          failures.delete(locationId);
          return normalized(refreshed, true);
        }
        if (!response.ok) {
          const message = `Wetteranbieter meldet HTTP ${response.status}.`;
          if (response.status < 500) throw new WeatherFetchError("INVALID_DATA", message);
          throw new WeatherFetchError("UPSTREAM_ERROR", message);
        }
        const next: CacheEntry = {
          raw,
          fetchedAt: received,
          checkedAt: received,
          expiresAt: expiry(response, received),
          lastModified: response.headers.get("last-modified"),
        };
        let result: WeatherResponse;
        try { result = normalized(next, false); }
        catch { throw new WeatherFetchError("INVALID_DATA", "Die Wetterantwort enthält keine auswertbare Zeitreihe."); }
        if (response.status === 203) result.limitations.unshift("Der Anbieter markiert dieses Produkt als vorläufig oder veraltet (HTTP 203).");
        cache.set(locationId, next);
        failures.delete(locationId);
        return result;
      } catch (error) {
        finalError = error instanceof WeatherFetchError ? error : new WeatherFetchError("UPSTREAM_ERROR", "Wetterdaten konnten nicht geladen werden.");
        if (finalError.code === "RATE_LIMITED" || finalError.code === "INVALID_DATA" || attempt === 1) break;
        await sleep(400);
      }
    }
    const until = finalError.retryAt ?? now() + ERROR_COOLDOWN_MS;
    failures.set(locationId, { until, error: finalError });
    return fail(finalError);
  }

  return {
    getForecast(locationId) {
      const existing = pending.get(locationId);
      if (existing) return existing;
      const promise = load(locationId).finally(() => pending.delete(locationId));
      pending.set(locationId, promise);
      return promise;
    },
  };
}

export const weatherProvider = createWeatherProvider();
