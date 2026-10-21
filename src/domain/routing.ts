/** Graph, fleet, capacity and times are illustrative simulation inputs. */
export type Scenario = 'normal' | 'blocked' | 'full' | 'offline' | 'weather';
export interface Station { id: string; name: string; district: string; lat: number; lng: number; free: number; total: number; status: 'online' | 'offline' }
export interface GraphNode { id: string; name: string; lat: number; lng: number; kind: 'hub' | 'station' | 'waypoint' }
export interface GraphEdge { id: string; from: string; to: string; minutes: number }
export interface Vehicle { id: string; name: string; status: 'available' | 'charging' | 'in_transit'; batteryPercent: number; nodeId: string }
export const stations: Station[] = [
  { id: 'Z01', name: 'Station Elberfeld', district: 'Elberfeld', lat: 51.2555, lng: 7.1546, free: 8, total: 12, status: 'online' },
  { id: 'Z02', name: 'Station Haspel', district: 'Haspel', lat: 51.2622, lng: 7.182, free: 3, total: 12, status: 'online' },
  { id: 'Z03', name: 'Station Barmen', district: 'Barmen', lat: 51.2695, lng: 7.1986, free: 6, total: 16, status: 'online' },
];
export const nodes: GraphNode[] = [
  { id: 'HUB', name: 'Demo-Hub Elberfeld', lat: 51.2566, lng: 7.1458, kind: 'hub' },
  { id: 'W01', name: 'Knoten Haspel-West', lat: 51.2593, lng: 7.1686, kind: 'waypoint' },
  { id: 'W02', name: 'Knoten Unterbarmen', lat: 51.266, lng: 7.1903, kind: 'waypoint' },
  { id: 'WX', name: 'Alternative Nord', lat: 51.2684, lng: 7.163, kind: 'waypoint' },
  ...stations.map(station => ({ id: station.id, name: station.name, lat: station.lat, lng: station.lng, kind: 'station' as const })),
];
export const edges: GraphEdge[] = [
  { id: 'E01', from: 'HUB', to: 'W01', minutes: 3 },
  { id: 'E02', from: 'W01', to: 'Z01', minutes: 2 },
  { id: 'E03', from: 'W01', to: 'Z02', minutes: 4 },
  { id: 'E04', from: 'Z02', to: 'W02', minutes: 2 },
  { id: 'E05', from: 'W02', to: 'Z03', minutes: 3 },
  { id: 'E06', from: 'HUB', to: 'WX', minutes: 4 },
  { id: 'E07', from: 'WX', to: 'W01', minutes: 3 },
  { id: 'E08', from: 'WX', to: 'Z02', minutes: 6 },
  { id: 'E09', from: 'Z01', to: 'HUB', minutes: 5 },
  { id: 'E10', from: 'Z02', to: 'W01', minutes: 4 },
  { id: 'E11', from: 'Z03', to: 'W02', minutes: 3 },
  { id: 'E12', from: 'W02', to: 'Z02', minutes: 2 },
  { id: 'E13', from: 'W01', to: 'HUB', minutes: 3 },
];
export const fleet: Vehicle[] = [
  { id: 'A', name: 'Drohne A', status: 'available', batteryPercent: 88, nodeId: 'HUB' },
  { id: 'B', name: 'Drohne B', status: 'charging', batteryPercent: 34, nodeId: 'HUB' },
  { id: 'C', name: 'Drohne C', status: 'in_transit', batteryPercent: 62, nodeId: 'W02' },
];
export const scenarioLabels: Record<Scenario, string> = { normal: 'Normaler Ablauf', blocked: 'Korridor gesperrt', full: 'Zielstation voll', offline: 'Zielstation ausgefallen', weather: 'Wetterbedingte Pause' };

export interface ShortestPath { path: string[]; minutes: number }
export function dijkstra(graphNodes: readonly GraphNode[], graphEdges: readonly GraphEdge[], from: string, to: string, blockedEdges: readonly string[] = []): ShortestPath | null {
  const pending = new Set(graphNodes.map(node => node.id));
  if (!pending.has(from) || !pending.has(to)) return null;
  const distances = new Map<string, number>([[from, 0]]);
  const previous = new Map<string, string>();
  const blocked = new Set(blockedEdges);
  for (const edge of graphEdges) {
    if (!Number.isFinite(edge.minutes) || edge.minutes < 0) throw new Error('Dijkstra benötigt nichtnegative endliche Beispielzeiten.');
  }
  while (pending.size) {
    let current: string | undefined;
    let lowest = Infinity;
    for (const id of pending) if ((distances.get(id) ?? Infinity) < lowest) { current = id; lowest = distances.get(id)!; }
    if (!current) break;
    if (current === to) {
      const path = [to];
      while (path[0] !== from) path.unshift(previous.get(path[0])!);
      return { path, minutes: lowest };
    }
    pending.delete(current);
    for (const edge of graphEdges) {
      if (edge.from !== current || blocked.has(edge.id) || !pending.has(edge.to)) continue;
      const candidate = lowest + edge.minutes;
      if (candidate < (distances.get(edge.to) ?? Infinity)) { distances.set(edge.to, candidate); previous.set(edge.to, current); }
    }
  }
  return null;
}
export interface RoutePlan {
  targetId: string; scenario: Scenario; available: boolean; path: string[]; coordinates: [number, number][];
  minutes: number; returnMinutes: number; returnPath: string[]; missionMinutes: number;
  reasons: string[]; vehicleId: string | null; blockedEdgeIds: string[]; station: Station | null;
  isDemo: true; realWeatherStatus: 'UNBESTIMMT'; flightClearance: false;
}
export function getScenarioStations(targetId: string, scenario: Scenario): Station[] {
  return stations.map(station => ({ ...station, ...(station.id === targetId && scenario === 'full' ? { free: 0 } : {}), ...(station.id === targetId && scenario === 'offline' ? { status: 'offline' as const } : {}) }));
}
export function planRoute(targetId: string, scenario: Scenario = 'normal'): RoutePlan {
  const station = getScenarioStations(targetId, scenario).find(item => item.id === targetId) ?? null;
  const blockedEdgeIds = scenario === 'blocked' ? ['E01'] : [];
  const base: RoutePlan = { targetId, scenario, available: false, path: [], coordinates: [], minutes: 0, returnMinutes: 0, returnPath: [], missionMinutes: 0, reasons: [], vehicleId: null, blockedEdgeIds, station, isDemo: true, realWeatherStatus: 'UNBESTIMMT', flightClearance: false };
  if (!station) return { ...base, reasons: ['Die gewählte Zielstation gehört nicht zum Demo-Netz.'] };
  if (station.status !== 'online') return { ...base, reasons: ['Die Zielstation ist im Szenario ausgefallen. Neue Ankünfte werden gesperrt; bitte ein anderes Ziel wählen.'] };
  if (station.free < 1) return { ...base, reasons: ['Alle Fächer der Zielstation sind im Szenario belegt. Ohne freie Kapazität wird keine Mission simuliert.'] };
  if (scenario === 'weather') return { ...base, reasons: ['Simulierter Wetterstopp: Der Start wird verschoben. Diese Szenariowerte sind keine online abgerufene Vorhersage.', 'Reale Wetterbewertung: UNBESTIMMT. Fahrzeuggrenzen und vollständige Pflichtdaten fehlen.'] };
  const vehicle = fleet.find(item => item.status === 'available' && item.nodeId === 'HUB');
  if (!vehicle) return { ...base, reasons: ['Keine Drohne ist im Demo-Hub verfügbar.'] };
  const outbound = dijkstra(nodes, edges, 'HUB', targetId, blockedEdgeIds);
  const inbound = dijkstra(nodes, edges, targetId, 'HUB', blockedEdgeIds);
  if (!outbound || !inbound) return { ...base, reasons: ['Es existiert kein vollständiger gerichteter Demo-Weg einschließlich Rückweg.'] };
  return {
    ...base, available: true, path: outbound.path, minutes: outbound.minutes, returnPath: inbound.path, returnMinutes: inbound.minutes,
    missionMinutes: outbound.minutes + inbound.minutes + 4,
    coordinates: outbound.path.map(id => { const node = nodes.find(item => item.id === id)!; return [node.lat, node.lng]; }),
    vehicleId: vehicle.id,
    reasons: [
      scenario === 'blocked' ? 'Korridor HUB → W01 ist gesperrt. Dijkstra wählt einen verfügbaren Alternativweg über Nord.' : 'Dijkstra wählt den zeitlich kürzesten verfügbaren Weg im gerichteten Demo-Netz.',
      `${vehicle.name} ist verfügbar; B lädt, C ist unterwegs. ${station.free} von ${station.total} Fächern sind frei.`,
      `${outbound.minutes} Min. Hinweg + ${inbound.minutes} Min. Rückweg + 4 Min. illustrative Übergabezeit.`,
      'Nur Simulation. Reale Wetterbewertung: UNBESTIMMT; keine Flugfreigabe und kein Energie- oder Sicherheitsnachweis.',
    ],
  };
}
export class RoutingService { planRoute(targetId: string, scenario: Scenario = 'normal'): RoutePlan { return planRoute(targetId, scenario); } }
