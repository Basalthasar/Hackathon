import type { WeatherLocation } from "./locations";

export interface ForecastHour {
  /** UTC, Prognosezeitpunkt; Niederschlag und Symbol beziehen sich auf das folgende Intervall. */
  time: string;
  temperatureC: number | null;
  windSpeedMps: number | null;
  windFromDegrees: number | null;
  precipitationMm: number | null;
  precipitationPeriodHours: number | null;
  symbolCode: string | null;
  gustMps: number | null;
}

export type WeatherErrorCode =
  | "INVALID_LOCATION"
  | "CONFIGURATION_REQUIRED"
  | "TIMEOUT"
  | "RATE_LIMITED"
  | "UPSTREAM_ERROR"
  | "INVALID_DATA";

export interface WeatherResponse {
  location: WeatherLocation;
  provenance: "ONLINE_FORECAST" | "CACHED_FORECAST" | "UNAVAILABLE";
  status: "available" | "partial" | "stale" | "error";
  label: "Aktuell abgerufene Wettervorhersage";
  /** Letzter tatsächlicher Download dieses Datensatzes; 304 verändert diesen Wert nicht. */
  fetchedAt: string | null;
  /** Letzte Antwort des Anbieters einschließlich 304. */
  checkedAt: string | null;
  providerUpdatedAt: string | null;
  expiresAt: string | null;
  requestedWindow: { from: string; to: string };
  hours: ForecastHour[];
  missingFields: string[];
  assessment: { status: "UNBESTIMMT"; reasons: string[] };
  heights: {
    temperatureMetresAboveGround: 2;
    windMetresAboveGround: 10;
    forecastGroundElevationMetres: number | null;
    flightAltitudeAvailable: false;
  };
  limitations: string[];
  error?: { code: WeatherErrorCode; message: string; retryAt?: string };
  attribution: { text: string; sourceUrl: string; licenseUrl: string; changes: string };
}

export interface WeatherProvider {
  getForecast(locationId: string): Promise<WeatherResponse>;
}
