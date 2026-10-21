/** Fiktive Demo-Standorte; keine geprüften oder genehmigten Landeplätze. */
export const WEATHER_LOCATIONS = [
  { id: "HUB", name: "Demo-Hub Elberfeld", latitude: 51.2566, longitude: 7.1458, kind: "hub" },
  { id: "Z01", name: "Station Elberfeld", latitude: 51.2555, longitude: 7.1546, kind: "station" },
  { id: "Z02", name: "Station Haspel", latitude: 51.2622, longitude: 7.182, kind: "station" },
  { id: "Z03", name: "Station Barmen", latitude: 51.2695, longitude: 7.1986, kind: "station" },
  { id: "W01", name: "Knoten Haspel-West", latitude: 51.2593, longitude: 7.1686, kind: "waypoint" },
  { id: "W02", name: "Knoten Unterbarmen", latitude: 51.266, longitude: 7.1903, kind: "waypoint" },
  { id: "WX", name: "Alternative Nord", latitude: 51.2684, longitude: 7.163, kind: "waypoint" },
] as const;

export type WeatherLocation = (typeof WEATHER_LOCATIONS)[number];
export type WeatherLocationId = WeatherLocation["id"];

export function findWeatherLocation(id: string): WeatherLocation | undefined {
  return WEATHER_LOCATIONS.find((location) => location.id === id);
}
