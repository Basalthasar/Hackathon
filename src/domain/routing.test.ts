import { describe, expect, it } from 'vitest';
import { dijkstra, edges, fleet, getScenarioStations, nodes, planRoute, stations } from './routing';

describe('directed demo routing', () => {
  it('chooses the shortest available directed path and only an available vehicle', () => {
    const plan = planRoute('Z03');
    expect(plan.available).toBe(true);
    expect(plan.path).toEqual(['HUB', 'W01', 'Z02', 'W02', 'Z03']);
    expect(plan.minutes).toBe(12);
    expect(plan.returnPath).toEqual(['Z03', 'W02', 'Z02', 'W01', 'HUB']);
    expect(plan.vehicleId).toBe('A');
    expect(fleet.find(item => item.id === plan.vehicleId)?.status).toBe('available');
    expect(plan.coordinates).toHaveLength(plan.path.length);
  });
  it.each(['Z01', 'Z02', 'Z03'])('reroutes %s through an alternative when the main corridor is blocked', targetId => {
    const normal = planRoute(targetId);
    const blocked = planRoute(targetId, 'blocked');
    expect(blocked.available).toBe(true);
    expect(blocked.path[1]).toBe('WX');
    expect(blocked.minutes).toBeGreaterThan(normal.minutes);
    expect(blocked.blockedEdgeIds).toContain('E01');
    expect(blocked.path.join('→')).not.toContain('HUB→W01');
  });
  it('never treats a full or failed target station as available', () => {
    expect(planRoute('Z02', 'full')).toMatchObject({ available: false, path: [], vehicleId: null, station: { free: 0 } });
    expect(planRoute('Z02', 'offline')).toMatchObject({ available: false, path: [], station: { status: 'offline' } });
    expect(getScenarioStations('Z02', 'full').find(item => item.id === 'Z01')?.free).toBe(stations[0].free);
    expect(stations[1].free).toBe(3);
  });
  it('distinguishes a synthetic weather stop from any real weather clearance', () => {
    const normal = planRoute('Z01');
    const stopped = planRoute('Z01', 'weather');
    expect(normal.realWeatherStatus).toBe('UNBESTIMMT');
    expect(normal.flightClearance).toBe(false);
    expect(stopped.available).toBe(false);
    expect(stopped.realWeatherStatus).toBe('UNBESTIMMT');
    expect(stopped.reasons.join(' ')).toContain('Simulierter Wetterstopp');
  });
  it('returns no path for an unknown target or a disconnected graph', () => {
    expect(planRoute('NOT_A_STATION').available).toBe(false);
    expect(dijkstra(nodes, edges, 'HUB', 'Z03', ['E01', 'E06'])).toBeNull();
    expect(dijkstra(nodes, edges, 'UNKNOWN', 'Z03')).toBeNull();
  });
  it('respects direction rather than assuming reversible corridors', () => {
    expect(dijkstra(nodes, [{ id: 'oneway', from: 'HUB', to: 'Z01', minutes: 2 }], 'Z01', 'HUB')).toBeNull();
  });
  it('does not accept negative edge costs as a valid shortest-path input', () => {
    expect(() => dijkstra(nodes, [{ id: 'bad', from: 'HUB', to: 'Z01', minutes: -1 }], 'HUB', 'Z01')).toThrow(/nichtnegative/);
  });
});
