"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";
import styles from "./NetworkMap.module.css";

export type NetworkMarker = {
  id: string;
  label: string;
  lat: number;
  lng: number;
  kind: "store" | "hub" | "station" | "courier";
  active?: boolean;
};

export type NetworkRoute = {
  id: string;
  coordinates: [number, number][];
  color?: string;
  dashed?: boolean;
};

/** Simulierter Dauerflug einer Drohne entlang eines vorbereiteten Pfads. */
export type NetworkFlight = {
  id: string;
  label: string;
  path: [number, number][];
  /** Umlaufdauer in Millisekunden. */
  durationMs?: number;
  /** Startversatz 0–1, damit nicht alle Drohnen gleichzeitig starten. */
  offset?: number;
};

export type NetworkMapProps = {
  markers: NetworkMarker[];
  routes?: NetworkRoute[];
  /** Simulierte Dauerflüge; mehrere Drohnen können gleichzeitig unterwegs sein. */
  flights?: NetworkFlight[];
  movingPosition?: [number, number] | null;
  /** Dauer der weichen Bewegung zwischen zwei Positionen in Millisekunden. */
  movingDurationMs?: number;
  mode?: "map" | "schematic";
  /** Wird gesetzt, wenn die Ansicht von außen gesteuert wird (dann ohne eigenen Schalter). */
  onModeChange?: (mode: "map" | "schematic") => void;
  /** Blendet den eingebauten Karte/Netz-Schalter aus, wenn der Aufrufer ihn bereits anbietet. */
  showModeSwitch?: boolean;
  onSelect?: (id: string) => void;
  className?: string;
  vehicleKind?: "drone" | "courier";
};

const EMPTY_ROUTES: NetworkRoute[] = [];
const EMPTY_FLIGHTS: NetworkFlight[] = [];
const CENTER: [number, number] = [51.2605, 7.1765];
const TILE_URL = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const TILE_ATTRIBUTION = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
const KIND_LABEL = { store: "Händler", hub: "Demo-Hub", station: "Station", courier: "Kurier" };
const DRONE_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="5" cy="5" r="3"/><circle cx="19" cy="5" r="3"/><circle cx="5" cy="19" r="3"/><circle cx="19" cy="19" r="3"/><path d="m7 7 10 10M7 17 17 7"/><rect x="9" y="9" width="6" height="6" rx="2" fill="currentColor"/></svg>';
const MOVING_GLYPH = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="m12 2 8 19-8-4-8 4z"/></svg>';

function glyph(kind: NetworkMarker["kind"]) {
  const path = kind === "store"
    ? '<path d="M5 10h14v10H5zM4 10l2-6h12l2 6M9 20v-6h6v6M4 10c0 3 4 3 4 0 0 3 4 3 4 0 0 3 4 3 4 0 0 3 4 3 4 0"/>'
    : kind === "hub"
      ? '<path d="m3 9 9-5 9 5v11H3zM8 20v-7h8v7M3 9l9 5 9-5M12 4v10"/>'
      : kind === "station"
        ? '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M5 12h14M12 3v18M8 7h1M15 7h1M8 16h1M15 16h1"/>'
        : '<circle cx="5" cy="16" r="3"/><circle cx="19" cy="16" r="3"/><path d="m5 16 5-9 5 9H5l5-6h6l3 6M9 5h4M16 6h3"/>';
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

function isCoordinate(point: [number, number]) {
  return Number.isFinite(point[0]) && Number.isFinite(point[1]) && Math.abs(point[0]) <= 90 && Math.abs(point[1]) <= 180;
}

/** Position auf einem Polyline-Pfad; 0 ist Start, 1 ist Ziel. */
function pointOnPath(path: [number, number][], progress: number): [number, number] | null {
  if (!path.length) return null;
  if (path.length === 1) return path[0];
  const scaled = Math.min(1, Math.max(0, progress)) * (path.length - 1);
  const index = Math.floor(scaled);
  const from = path[index];
  const to = path[Math.min(path.length - 1, index + 1)];
  const part = scaled - index;
  return [from[0] + (to[0] - from[0]) * part, from[1] + (to[1] - from[1]) * part];
}

export default function NetworkMap({ markers, routes = EMPTY_ROUTES, flights = EMPTY_FLIGHTS, movingPosition = null, movingDurationMs = 340, mode = "map", onModeChange, showModeSwitch = true, onSelect, className = "", vehicleKind = "courier" }: NetworkMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<LayerGroup | null>(null);
  const movingRef = useRef<Marker | null>(null);
  const movingKindRef = useRef(vehicleKind);
  /** Weich interpolierte Anzeigeposition; das Fahrzeug springt nie direkt auf den neuen Wert. */
  const displayRef = useRef<[number, number] | null>(null);
  const animationRef = useRef<{ from: [number, number]; to: [number, number]; start: number; duration: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const schematicVehicleRef = useRef<HTMLSpanElement | null>(null);
  const flightMarkersRef = useRef<Map<string, Marker>>(new Map());
  const flightNodesRef = useRef<Map<string, HTMLSpanElement>>(new Map());
  const flightStartRef = useRef(0);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const fittedRef = useRef("");
  const [ready, setReady] = useState(false);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");
  const [localMode, setLocalMode] = useState<"map" | "schematic" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const id = useId().replace(/:/g, "");
  const displayMode = localMode ?? mode;
  const changeMode = (next: "map" | "schematic") => {
    if (onModeChange) { setLocalMode(null); onModeChange(next); return; }
    setLocalMode(next);
  };
  const vehicleGlyph = vehicleKind === "drone" ? DRONE_GLYPH : MOVING_GLYPH;
  const vehicleLabel = vehicleKind === "drone" ? "Simulierte Drohnenposition" : "Simulierte Fahrzeugposition";

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { setLocalMode(null); }, [mode]);

  const safeMarkers = useMemo(() => markers.filter((marker) => isCoordinate([marker.lat, marker.lng])), [markers]);
  const safeRoutes = useMemo(() => routes.map((route) => ({ ...route, coordinates: route.coordinates.filter(isCoordinate) })).filter((route) => route.coordinates.length > 1), [routes]);
  const safeFlights = useMemo(() => flights
    .map((flight) => ({ ...flight, path: flight.path.filter(isCoordinate) }))
    .filter((flight) => flight.path.length > 1), [flights]);
  const coordinates = useMemo<[number, number][]>(() => [
    ...safeMarkers.map((marker): [number, number] => [marker.lat, marker.lng]),
    ...safeRoutes.flatMap((route) => route.coordinates),
    ...safeFlights.flatMap((flight) => flight.path),
  ], [safeMarkers, safeRoutes, safeFlights]);
  const boundsKey = JSON.stringify(coordinates);

  const projection = useMemo(() => {
    const points = coordinates.length ? coordinates : [CENTER];
    const latitudes = points.map(([lat]) => lat);
    const longitudes = points.map(([, lng]) => lng);
    const south = Math.min(...latitudes) - 0.003;
    const north = Math.max(...latitudes) + 0.003;
    const west = Math.min(...longitudes) - 0.006;
    const east = Math.max(...longitudes) + 0.006;
    return ([lat, lng]: [number, number]) => ({ x: 65 + ((lng - west) / (east - west)) * 650, y: 64 + ((north - lat) / (north - south)) * 290 });
  }, [coordinates]);
  const projectionRef = useRef(projection);
  projectionRef.current = projection;
  const modeRef = useRef(displayMode);
  modeRef.current = displayMode;
  const movingTarget = movingPosition && isCoordinate(movingPosition) ? movingPosition : null;

  /** Setzt das Fahrzeug auf eine Position: Leaflet-Marker oder Knoten der Netzansicht. */
  function placeVehicle(position: [number, number]) {
    if (modeRef.current === "map") {
      movingRef.current?.setLatLng(position);
      return;
    }
    const node = schematicVehicleRef.current;
    if (!node) return;
    const point = projectionRef.current(position);
    node.style.left = `${point.x / 7.8}%`;
    node.style.top = `${point.y / 4.3}%`;
  }

  /** Lineare Bewegung von der aktuellen Anzeigeposition zur neuen Zielposition. */
  function startVehicleMotion() {
    if (rafRef.current !== null) return;
    const tick = (now: number) => {
      const animation = animationRef.current;
      if (!animation) { rafRef.current = null; return; }
      const progress = animation.duration > 0 ? Math.min(1, (now - animation.start) / animation.duration) : 1;
      const next: [number, number] = [
        animation.from[0] + (animation.to[0] - animation.from[0]) * progress,
        animation.from[1] + (animation.to[1] - animation.from[1]) * progress,
      ];
      displayRef.current = next;
      placeVehicle(next);
      if (progress >= 1) { animationRef.current = null; rafRef.current = null; return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }

  useEffect(() => {
    if (displayMode !== "map" || !canvasRef.current) return;
    let cancelled = false;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    let slowTimer: ReturnType<typeof setTimeout> | undefined;
    setTileState("loading");
    setReady(false);

    async function initialize() {
      try {
        const L = await import("leaflet");
        if (cancelled || !canvasRef.current) return;
        leafletRef.current = L;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        map = L.map(canvasRef.current, {
          center: CENTER, zoom: 13, minZoom: 11, maxZoom: 18,
          zoomControl: false, scrollWheelZoom: false,
          zoomAnimation: !reducedMotion, fadeAnimation: !reducedMotion,
          markerZoomAnimation: !reducedMotion,
        });
        mapRef.current = map;
        fittedRef.current = "";
        map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener noreferrer">Leaflet</a>');
        L.control.zoom({ position: "bottomleft", zoomInTitle: "Vergrößern", zoomOutTitle: "Verkleinern" }).addTo(map);
        const tiles = L.tileLayer(TILE_URL, {
          attribution: TILE_ATTRIBUTION, maxZoom: 19,
          updateWhenIdle: true, keepBuffer: 1,
        });
        // Standard browser caching is deliberately retained; no prefetch/offline cache.
        tiles.on("tileload", () => {
          if (!cancelled) setTileState((current) => current === "error" ? current : "ready");
          clearTimeout(slowTimer);
        });
        tiles.on("tileerror", () => { if (!cancelled) setTileState("error"); });
        tiles.addTo(map);
        layersRef.current = L.layerGroup().addTo(map);
        slowTimer = setTimeout(() => { if (!cancelled) setTileState((current) => current === "loading" ? "error" : current); }, 12000);
        observer = new ResizeObserver(() => map?.invalidateSize({ animate: false }));
        observer.observe(canvasRef.current);
        setReady(true);
      } catch {
        if (!cancelled) setTileState("error");
      }
    }

    void initialize();
    return () => {
      cancelled = true;
      clearTimeout(slowTimer);
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
      layersRef.current = null;
      movingRef.current = null;
      flightMarkersRef.current.clear();
    };
  }, [displayMode, attempt]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    const group = layersRef.current;
    if (!ready || !L || !map || !group || displayMode !== "map") return;
    group.clearLayers();
    safeRoutes.forEach((route) => {
      L.polyline(route.coordinates, { color: "#ffffff", weight: 9, opacity: 0.85, interactive: false }).addTo(group);
      L.polyline(route.coordinates, {
        color: route.color || "#165dce", weight: 4, opacity: 0.95,
        dashArray: route.dashed ? "8 9" : undefined, lineCap: "round", interactive: false,
      }).addTo(group);
    });
    safeMarkers.forEach((marker, index) => {
      const pin = L.marker([marker.lat, marker.lng], {
        icon: L.divIcon({
          className: styles.markerRoot,
          html: `<span class="${styles.pin} ${marker.active ? styles.active : ""} ${styles[marker.kind]}">${glyph(marker.kind)}<span class="${styles.pinNumber}">${index + 1}</span></span>`,
          iconSize: [44, 44], iconAnchor: [22, 22], tooltipAnchor: [0, -22],
        }),
        title: `${index + 1}. ${marker.label} · ${KIND_LABEL[marker.kind]} · fiktiver Standort`,
        alt: `${index + 1}. ${marker.label}`, keyboard: Boolean(onSelectRef.current), riseOnHover: true,
      });
      const tooltip = document.createElement("span");
      tooltip.textContent = `${marker.label} · Demo`;
      pin.bindTooltip(tooltip, { direction: "top", className: styles.tooltip });
      pin.on("click", () => onSelectRef.current?.(marker.id));
      pin.addTo(group);
      const element = pin.getElement();
      if (element) {
        element.setAttribute("aria-label", `${index + 1}. ${marker.label}, ${KIND_LABEL[marker.kind]}, fiktiver Standort`);
        if (onSelectRef.current) element.setAttribute("role", "button");
        else element.removeAttribute("tabindex");
        if (onSelectRef.current) element.setAttribute("aria-pressed", String(Boolean(marker.active)));
        if (onSelectRef.current) element.addEventListener("keydown", (event) => {
          if (event.key === " ") { event.preventDefault(); onSelectRef.current?.(marker.id); }
        });
      }
    });
    if (boundsKey !== fittedRef.current && coordinates.length) {
      map.fitBounds(L.latLngBounds(coordinates), { padding: [48, 62], maxZoom: 14, animate: false });
      fittedRef.current = boundsKey;
    }
  }, [ready, safeMarkers, safeRoutes, coordinates, boundsKey, displayMode]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!ready || !L || !map || displayMode !== "map") return;
    if (movingKindRef.current !== vehicleKind) {
      movingRef.current?.remove();
      movingRef.current = null;
      movingKindRef.current = vehicleKind;
    }
    if (!movingTarget) {
      movingRef.current?.remove();
      movingRef.current = null;
      return;
    }
    if (!movingRef.current) {
      const start = displayRef.current ?? movingTarget;
      movingRef.current = L.marker(start, {
        icon: L.divIcon({ className: styles.markerRoot, html: `<span class="${styles.movingPin}">${vehicleGlyph}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: vehicleLabel, alt: vehicleLabel, keyboard: false, zIndexOffset: 1000,
      }).addTo(map);
      displayRef.current = start;
    }
  }, [movingTarget, ready, displayMode, vehicleGlyph, vehicleLabel, vehicleKind]);

  // Neue Zielposition weich anfahren; laufende Bewegung zur selben Zielposition nicht neu starten.
  useEffect(() => {
    if (!movingTarget) {
      if (rafRef.current !== null) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
      animationRef.current = null;
      displayRef.current = null;
      return;
    }
    const running = animationRef.current;
    if (running && running.to[0] === movingTarget[0] && running.to[1] === movingTarget[1]) return;
    const from = displayRef.current;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!from || reduced || movingDurationMs <= 0) {
      displayRef.current = movingTarget;
      placeVehicle(movingTarget);
      return;
    }
    animationRef.current = { from, to: movingTarget, start: performance.now(), duration: movingDurationMs };
    startVehicleMotion();
  }, [movingTarget, movingDurationMs, displayMode, vehicleKind]);

  // Beim Wechsel der Ansicht oder des Fahrzeugs sofort an die aktuelle Anzeigeposition setzen.
  useLayoutEffect(() => {
    const position = displayRef.current ?? movingTarget;
    if (position) placeVehicle(position);
  }, [displayMode, vehicleKind, vehicleGlyph, movingTarget]);

  const flightsRef = useRef<NetworkFlight[]>(EMPTY_FLIGHTS);
  flightsRef.current = safeFlights;

  // Marker der simulierten Dauerflüge anlegen und entfernen.
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (displayMode !== "map" || !ready || !L || !map) {
      flightMarkersRef.current.forEach((marker) => marker.remove());
      flightMarkersRef.current.clear();
      return;
    }
    const wanted = new Set(safeFlights.map((flight) => flight.id));
    flightMarkersRef.current.forEach((marker, flightId) => {
      if (wanted.has(flightId)) return;
      marker.remove();
      flightMarkersRef.current.delete(flightId);
    });
    safeFlights.forEach((flight) => {
      if (flightMarkersRef.current.has(flight.id)) return;
      const start = pointOnPath(flight.path, flight.offset ?? 0) ?? flight.path[0];
      const marker = L.marker(start, {
        icon: L.divIcon({ className: styles.markerRoot, html: `<span class="${styles.movingPin}">${DRONE_GLYPH}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: flight.label, alt: flight.label, keyboard: false, zIndexOffset: 800,
      }).addTo(map);
      flightMarkersRef.current.set(flight.id, marker);
    });
  }, [ready, displayMode, safeFlights]);

  // Dauerflüge laufen gleichmäßig weiter, ohne React-Renders auszulösen.
  useEffect(() => {
    if (!safeFlights.length) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    flightStartRef.current = performance.now();
    let frame = requestAnimationFrame(function tick(now: number) {
      const elapsed = now - flightStartRef.current;
      for (const flight of flightsRef.current) {
        const duration = Math.max(2_400, flight.durationMs ?? 10_000);
        const progress = reduced ? (flight.offset ?? 0) : ((elapsed / duration + (flight.offset ?? 0)) % 1);
        const position = pointOnPath(flight.path, progress);
        if (!position) continue;
        if (modeRef.current === "map") {
          flightMarkersRef.current.get(flight.id)?.setLatLng(position);
          continue;
        }
        const node = flightNodesRef.current.get(flight.id);
        if (!node) continue;
        const point = projectionRef.current(position);
        node.style.left = `${point.x / 7.8}%`;
        node.style.top = `${point.y / 4.3}%`;
      }
      if (!reduced) frame = requestAnimationFrame(tick);
    });
    return () => cancelAnimationFrame(frame);
  }, [safeFlights.length, displayMode]);

  const retry = () => { setAttempt((current) => current + 1); changeMode("map"); };

  return (
    <div className={`${styles.root} ${className}`}>
      <div className={styles.stage}>
        {displayMode === "map" ? (
          <div ref={canvasRef} className={styles.map} aria-label="Interaktive Karte von Wuppertal mit fiktiven Demo-Standorten" />
        ) : (
          <div className={styles.schematic} aria-label="Schematisches Demo-Netz, keine geografisch genaue Karte">
            <svg className={styles.network} viewBox="0 0 780 430" preserveAspectRatio="none" aria-hidden="true">
              <defs><pattern id={`grid-${id}`} width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="currentColor" strokeWidth="0.8" /></pattern></defs>
              <rect width="780" height="430" fill={`url(#grid-${id})`} />
              <path d="M-30 350C130 315 175 400 315 300S530 255 810 165" className={styles.river} />
              {safeRoutes.map((route) => <polyline key={route.id} points={route.coordinates.map((point) => { const p = projection(point); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={route.color || "#165dce"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={route.dashed ? "9 9" : undefined} vectorEffect="non-scaling-stroke" />)}
            </svg>
            <span className={styles.regionLabel}>WUPPERTAL · DEMO-NETZ</span>
            {safeMarkers.map((marker, index) => {
              const point = projection([marker.lat, marker.lng]);
              return <div key={marker.id} className={`${styles.schematicNode} ${point.x > 470 ? styles.labelLeft : ""}`} style={{ left: `${point.x / 7.8}%`, top: `${point.y / 4.3}%` }}>
                <button type="button" className={`${styles.nodeButton} ${marker.active ? styles.active : ""} ${styles[marker.kind]}`} onClick={() => onSelectRef.current?.(marker.id)} aria-label={`${index + 1}. ${marker.label}, ${KIND_LABEL[marker.kind]}, fiktiver Standort`} aria-pressed={Boolean(marker.active)} disabled={!onSelect}>
                  <span dangerouslySetInnerHTML={{ __html: glyph(marker.kind) }} />
                  <span className={styles.pinNumber}>{index + 1}</span>
                </button>
                <span className={styles.nodeLabel}>{marker.label}<small>{KIND_LABEL[marker.kind]}</small></span>
              </div>;
            })}
            {movingTarget && (
              <span ref={schematicVehicleRef} className={`${styles.schematicVehicle} ${styles.movingPin}`} role="img" aria-label={vehicleLabel} dangerouslySetInnerHTML={{ __html: vehicleGlyph }} />
            )}
            {safeFlights.map((flight) => (
              <span
                key={flight.id}
                ref={(node) => {
                  if (!node) { flightNodesRef.current.delete(flight.id); return; }
                  flightNodesRef.current.set(flight.id, node);
                  const start = pointOnPath(flight.path, flight.offset ?? 0);
                  if (start) { const point = projectionRef.current(start); node.style.left = `${point.x / 7.8}%`; node.style.top = `${point.y / 4.3}%`; }
                }}
                className={`${styles.schematicVehicle} ${styles.movingPin}`}
                role="img"
                aria-label={flight.label}
                dangerouslySetInnerHTML={{ __html: DRONE_GLYPH }}
              />
            ))}
            <span className={styles.schematicNote}>Schematische Ansicht · ohne Kartenkacheln</span>
          </div>
        )}

        <div className={styles.locationTag}><span />Wuppertal <small>Demo-Gebiet</small></div>
        {showModeSwitch && (
          <div className={styles.modeSwitch} role="group" aria-label="Kartenansicht">
            <button type="button" aria-pressed={displayMode === "map"} onClick={() => changeMode("map")}>Karte</button>
            <button type="button" aria-pressed={displayMode === "schematic"} onClick={() => changeMode("schematic")}>Netz</button>
          </div>
        )}

        {displayMode === "map" && tileState === "loading" && <div className={styles.loading} role="status"><span />Karte wird geladen</div>}
        {displayMode === "map" && tileState === "error" && <div className={styles.fallback} role="status">
          <span className={styles.fallbackIcon}>↗</span>
          <div><strong>Kartenkacheln nicht verfügbar</strong><p>Die Demo bleibt bedienbar. Nutze das schematische Netz.</p></div>
          <div className={styles.fallbackActions}><button type="button" onClick={() => changeMode("schematic")}>Netzansicht öffnen</button><button type="button" onClick={retry}>Erneut laden</button></div>
        </div>}
      </div>
      <div className={styles.legend}><span className={styles.legendDot} /><span>Fiktive Standorte · vorbereitete Demo-Routen</span><span className={styles.demoLabel}>Simulation</span></div>
    </div>
  );
}
