import { findWeatherLocation } from "../../../weather/locations";
import { weatherProvider } from "../../../weather/provider";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nur konfigurierte Demo-Orte; niemals freie URLs oder GPS-Koordinaten. */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const ids = url.searchParams.getAll("locationId");
  const otherKeys = [...url.searchParams.keys()].some((key) => key !== "locationId");
  if (ids.length !== 1 || otherKeys || !findWeatherLocation(ids[0])) {
    return Response.json({
      error: { code: "INVALID_LOCATION", message: "Bitte einen konfigurierten Demo-Ort auswählen." },
      assessment: { status: "UNBESTIMMT", reasons: ["Kein gültiger Demo-Ort."] },
    }, { status: 400, headers: { "Cache-Control": "no-store" } });
  }
  const result = await weatherProvider.getForecast(ids[0]);
  const status = result.status !== "error" ? 200 : result.error?.code === "RATE_LIMITED" ? 429 : result.error?.code === "TIMEOUT" ? 504 : 502;
  const headers: Record<string, string> = { "Cache-Control": "no-store" };
  if (result.error?.retryAt) {
    headers["Retry-After"] = String(Math.max(1, Math.ceil((Date.parse(result.error.retryAt) - Date.now()) / 1000)));
  }
  return Response.json(result, { status, headers });
}
