import { describe, expect, it, vi } from "vitest";
import { GET } from "../app/api/weather/route";
import { WEATHER_LOCATIONS } from "./locations";
import { normalizeForecast } from "./normalize";
import { createWeatherProvider } from "./provider";
import { nodes } from "../domain/routing";

const NOW = Date.parse("2026-10-21T10:30:00Z");
const HOUR = 3_600_000;

function fixture() {
  return {
    type: "Feature",
    geometry: { type: "Point", coordinates: [7.1458, 51.2566, 150] },
    properties: {
      meta: {
        updated_at: "2026-10-21T10:00:00Z",
        units: {
          air_temperature: "celsius",
          wind_speed: "m/s",
          wind_from_direction: "degrees",
          precipitation_amount: "mm",
        },
      },
      timeseries: Array.from({ length: 30 }, (_, index) => ({
        time: new Date(Math.floor(NOW / HOUR) * HOUR + index * HOUR).toISOString(),
        data: {
          instant: { details: { air_temperature: 12.3, wind_speed: 3.2, wind_from_direction: 270 } },
          next_1_hours: { details: { precipitation_amount: 0.3 }, summary: { symbol_code: "lightrain" } },
        },
      })),
    },
  };
}

function response(raw: unknown = fixture(), expires = NOW + HOUR) {
  return Response.json(raw, {
    headers: { Expires: new Date(expires).toUTCString(), "Last-Modified": "Wed, 21 Oct 2026 10:00:00 GMT" },
  });
}

function normalize(raw: unknown = fixture(), now = NOW) {
  return normalizeForecast(raw, WEATHER_LOCATIONS[0], now, {
    fetchedAt: NOW, checkedAt: NOW, expiresAt: NOW + HOUR, fromCache: false,
  });
}

describe("normalisierte Online-Vorhersage", () => {
  it("bewahrt Einheiten, Zeitbezüge und Messhöhen ohne eine Flugfreigabe zu erfinden", () => {
    const result = normalize();
    expect(result.status).toBe("available");
    expect(result.hours).toHaveLength(25);
    expect(result.hours[0]).toMatchObject({ temperatureC: 12.3, windSpeedMps: 3.2, windFromDegrees: 270, precipitationMm: 0.3, precipitationPeriodHours: 1 });
    expect(result.providerUpdatedAt).toBe("2026-10-21T10:00:00.000Z");
    expect(result.fetchedAt).toBe("2026-10-21T10:30:00.000Z");
    expect(result.assessment.status).toBe("UNBESTIMMT");
    expect(result.heights).toMatchObject({ temperatureMetresAboveGround: 2, windMetresAboveGround: 10, flightAltitudeAvailable: false });
    expect(result.missingFields).toContain("Böen");
    expect(result.missingFields).toContain("Vereisung");
  });

  it("ersetzt fehlende oder unplausible Werte niemals durch Null", () => {
    const raw = fixture();
    raw.properties.timeseries[0].data.instant.details = { air_temperature: NaN, wind_speed: -1, wind_from_direction: 361 };
    const result = normalize(raw);
    expect(result.status).toBe("partial");
    expect(result.hours[0]).toMatchObject({ temperatureC: null, windSpeedMps: null, windFromDegrees: null });
    expect(result.assessment.status).toBe("UNBESTIMMT");
  });

  it("behauptet bei abweichender Einheit keine bekannte Windgeschwindigkeit", () => {
    const raw = fixture();
    raw.properties.meta.units.wind_speed = "km/h";
    expect(normalize(raw).hours[0].windSpeedMps).toBeNull();
  });

  it("kennzeichnet fehlende Niederschlagsfelder und zeitliche Lücken", () => {
    const raw = fixture();
    raw.properties.timeseries[0].data.next_1_hours.details = {} as { precipitation_amount: number };
    raw.properties.timeseries.splice(2, 2);
    const result = normalize(raw);
    expect(result.status).toBe("partial");
    expect(result.hours[0].precipitationMm).toBeNull();
    expect(result.missingFields).toContain("Lückenlose stündliche Abdeckung der nächsten 24 Stunden");
    expect(result.assessment.status).toBe("UNBESTIMMT");
  });

  it("verteilt eine Sechsstundensumme nicht fälschlich auf Einzelstunden", () => {
    const raw = fixture() as unknown as { properties: { timeseries: { data: Record<string, unknown> }[] } };
    delete raw.properties.timeseries[0].data.next_1_hours;
    raw.properties.timeseries[0].data.next_6_hours = { details: { precipitation_amount: 4.2 }, summary: { symbol_code: "rain" } };
    expect(normalize(raw).hours[0]).toMatchObject({ precipitationMm: 4.2, precipitationPeriodHours: 6 });
  });

  it("erkennt alte und in der Zukunft datierte Anbieterstände", () => {
    for (const updated_at of ["2026-10-19T10:00:00Z", "2026-10-22T10:00:00Z"]) {
      const raw = fixture();
      raw.properties.meta.updated_at = updated_at;
      const result = normalize(raw);
      expect(result.status).toBe("stale");
      expect(result.assessment.status).toBe("UNBESTIMMT");
    }
  });
});

describe("MET-Adapter, Cache und Ausfälle", () => {
  it("deckt alle Demo-Netzknoten einschließlich der Nord-Alternative mit gleichen Orten ab", () => {
    for (const node of nodes) {
      const location = WEATHER_LOCATIONS.find((item) => item.id === node.id);
      expect(location, `Wetterort für Netzknoten ${node.id}`).toBeDefined();
      expect(location?.latitude).toBe(node.lat);
      expect(location?.longitude).toBe(node.lng);
      expect(location?.name).toBe(node.name);
    }
  });

  it("ruft die alternative Route ausschließlich über den konfigurierten WX-Ort ab", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response());
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW });
    const result = await provider.getForecast("WX");
    expect(fetcher.mock.calls[0][0]).toBe("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=51.2684&lon=7.1630");
    expect(result.location.name).toBe("Alternative Nord");
    expect(result.assessment.status).toBe("UNBESTIMMT");
  });

  it("ruft ausschließlich konfigurierte Koordinaten mit maximal vier Nachkommastellen ab", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response());
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW });
    const result = await provider.getForecast("HUB");
    const [url, init] = fetcher.mock.calls[0];
    expect(url).toBe("https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=51.2566&lon=7.1458");
    expect(new Headers(init?.headers).get("User-Agent")).toContain("github.com/Jannik440/Hackathon");
    expect(result.provenance).toBe("ONLINE_FORECAST");
    await expect(provider.getForecast("https://example.org")).rejects.toThrow("INVALID_LOCATION");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("respektiert Expires und revalidiert mit dem unveränderten Last-Modified", async () => {
    let now = NOW;
    const fetcher = vi.fn<typeof fetch>()
      .mockResolvedValueOnce(response())
      .mockResolvedValueOnce(new Response(null, { status: 304, headers: { Expires: new Date(NOW + 2 * HOUR).toUTCString() } }));
    const provider = createWeatherProvider({ fetch: fetcher, now: () => now });
    const initial = await provider.getForecast("HUB");
    now += 1000;
    expect((await provider.getForecast("HUB")).provenance).toBe("CACHED_FORECAST");
    expect(fetcher).toHaveBeenCalledTimes(1);
    now = NOW + HOUR + 1000;
    const revalidated = await provider.getForecast("HUB");
    expect(new Headers(fetcher.mock.calls[1][1]?.headers).get("If-Modified-Since")).toBe("Wed, 21 Oct 2026 10:00:00 GMT");
    expect(revalidated.fetchedAt).toBe(initial.fetchedAt);
    expect(revalidated.checkedAt).not.toBe(initial.checkedAt);
    expect(revalidated.assessment.status).toBe("UNBESTIMMT");
  });

  it("fasst gleichzeitige Abrufe desselben Ortes zusammen", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response());
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW });
    await Promise.all(Array.from({ length: 12 }, () => provider.getForecast("HUB")));
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("bewertet das Datenalter bei jedem Cachezugriff neu, unabhängig vom HTTP-Expires", async () => {
    let now = NOW;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(fixture(), NOW + 48 * HOUR));
    const provider = createWeatherProvider({ fetch: fetcher, now: () => now });
    expect((await provider.getForecast("HUB")).status).toBe("available");
    now += 25 * HOUR;
    const aged = await provider.getForecast("HUB");
    expect(aged.provenance).toBe("CACHED_FORECAST");
    expect(aged.status).toBe("stale");
    expect(aged.assessment.status).toBe("UNBESTIMMT");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("liefert bei Ausfall gespeicherte Daten ausdrücklich als veraltet", async () => {
    let now = NOW;
    const fetcher = vi.fn<typeof fetch>().mockResolvedValueOnce(response()).mockRejectedValue(new TypeError("network"));
    const sleep = vi.fn().mockResolvedValue(undefined);
    const provider = createWeatherProvider({ fetch: fetcher, now: () => now, sleep });
    await provider.getForecast("HUB");
    now += HOUR + 1;
    const result = await provider.getForecast("HUB");
    expect(result.status).toBe("stale");
    expect(result.provenance).toBe("CACHED_FORECAST");
    expect(result.error?.code).toBe("UPSTREAM_ERROR");
    expect(result.assessment.status).toBe("UNBESTIMMT");
    expect(fetcher).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledExactlyOnceWith(400);
    await provider.getForecast("HUB");
    expect(fetcher).toHaveBeenCalledTimes(3);
  });

  it("wiederholt HTTP 429 nicht und respektiert Retry-After auch für andere Orte", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 429, headers: { "Retry-After": "120" } }));
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW });
    for (const id of ["HUB", "Z01", "Z02", "HUB"]) {
      const result = await provider.getForecast(id);
      expect(result.status).toBe("error");
      expect(result.error?.code).toBe("RATE_LIMITED");
      expect(result.error?.retryAt).toBe(new Date(NOW + 120_000).toISOString());
      expect(result.assessment.status).toBe("UNBESTIMMT");
    }
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it("begrenzt auch einen hängenden Antwortbody durch Timeout", async () => {
    const stream = () => new ReadableStream({ start() { /* Antwortbody bleibt unvollständig. */ } });
    const fetcher = vi.fn<typeof fetch>().mockImplementation(async () => new Response(stream(), { headers: { "Content-Type": "application/json" } }));
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW, sleep: async () => {}, timeoutMs: 5 });
    const result = await provider.getForecast("HUB");
    expect(result.status).toBe("error");
    expect(result.error?.code).toBe("TIMEOUT");
    expect(result.hours).toEqual([]);
    expect(result.assessment.status).toBe("UNBESTIMMT");
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("akzeptiert eine kaputte JSON-Struktur nicht als Wetterdaten", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response({ properties: { timeseries: [] } }));
    const provider = createWeatherProvider({ fetch: fetcher, now: () => NOW });
    const result = await provider.getForecast("HUB");
    expect(result.error?.code).toBe("INVALID_DATA");
    expect(result.status).toBe("error");
    expect(result.assessment.status).toBe("UNBESTIMMT");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});

describe("geschlossener Wetter-Endpunkt", () => {
  it.each([
    "", "?locationId=Paris", "?locationId=HUB&lat=1", "?locationId=HUB&url=https://example.org", "?locationId=HUB&locationId=Z01",
  ])("lehnt freie Proxy-/Koordinatenparameter ab: %s", async (query) => {
    const result = await GET(new Request(`http://localhost/api/weather${query}`));
    expect(result.status).toBe(400);
    const body = await result.json();
    expect(body.error.code).toBe("INVALID_LOCATION");
    expect(body.assessment.status).toBe("UNBESTIMMT");
  });
});
