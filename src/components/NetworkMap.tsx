"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
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

export type NetworkMapProps = {
  markers: NetworkMarker[];
  routes?: NetworkRoute[];
  movingPosition?: [number, number] | null;
  mode?: "map" | "schematic";
  onSelect?: (id: string) => void;
  className?: string;
  vehicleKind?: "drone" | "courier";
};

const EMPTY_ROUTES: NetworkRoute[] = [];
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

export default function NetworkMap({ markers, routes = EMPTY_ROUTES, movingPosition = null, mode = "map", onSelect, className = "", vehicleKind = "courier" }: NetworkMapProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layersRef = useRef<LayerGroup | null>(null);
  const movingRef = useRef<Marker | null>(null);
  const movingKindRef = useRef(vehicleKind);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const onSelectRef = useRef(onSelect);
  const fittedRef = useRef("");
  const [ready, setReady] = useState(false);
  const [tileState, setTileState] = useState<"loading" | "ready" | "error">("loading");
  const [localMode, setLocalMode] = useState<"map" | "schematic" | null>(null);
  const [attempt, setAttempt] = useState(0);
  const id = useId().replace(/:/g, "");
  const displayMode = localMode ?? mode;
  const vehicleGlyph = vehicleKind === "drone" ? DRONE_GLYPH : MOVING_GLYPH;
  const vehicleLabel = vehicleKind === "drone" ? "Simulierte Drohnenposition" : "Simulierte Fahrzeugposition";

  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { setLocalMode(null); }, [mode]);

  const safeMarkers = useMemo(() => markers.filter((marker) => isCoordinate([marker.lat, marker.lng])), [markers]);
  const safeRoutes = useMemo(() => routes.map((route) => ({ ...route, coordinates: route.coordinates.filter(isCoordinate) })).filter((route) => route.coordinates.length > 1), [routes]);
  const coordinates = useMemo<[number, number][]>(() => [
    ...safeMarkers.map((marker): [number, number] => [marker.lat, marker.lng]),
    ...safeRoutes.flatMap((route) => route.coordinates),
  ], [safeMarkers, safeRoutes]);
  const boundsKey = JSON.stringify(coordinates);

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
        color: route.color || "#2466ed", weight: 4, opacity: 0.95,
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
    if (!movingPosition || !isCoordinate(movingPosition)) {
      movingRef.current?.remove();
      movingRef.current = null;
      return;
    }
    if (movingRef.current) movingRef.current.setLatLng(movingPosition);
    else {
      movingRef.current = L.marker(movingPosition, {
        icon: L.divIcon({ className: styles.markerRoot, html: `<span class="${styles.movingPin}">${vehicleGlyph}</span>`, iconSize: [44, 44], iconAnchor: [22, 22] }),
        title: vehicleLabel, alt: vehicleLabel, keyboard: false, zIndexOffset: 1000,
      }).addTo(map);
    }
  }, [movingPosition, ready, displayMode, vehicleGlyph, vehicleLabel, vehicleKind]);

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

  const retry = () => { setAttempt((current) => current + 1); setLocalMode("map"); };

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
              {safeRoutes.map((route) => <polyline key={route.id} points={route.coordinates.map((point) => { const p = projection(point); return `${p.x},${p.y}`; }).join(" ")} fill="none" stroke={route.color || "#2466ed"} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={route.dashed ? "9 9" : undefined} vectorEffect="non-scaling-stroke" />)}
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
            {movingPosition && isCoordinate(movingPosition) && (() => {
              const point = projection(movingPosition);
              return <span className={`${styles.schematicVehicle} ${styles.movingPin}`} style={{ left: `${point.x / 7.8}%`, top: `${point.y / 4.3}%` }} aria-label={vehicleLabel} dangerouslySetInnerHTML={{ __html: vehicleGlyph }} />;
            })()}
            <span className={styles.schematicNote}>Schematische Ansicht · ohne Kartenkacheln</span>
          </div>
        )}

        <div className={styles.locationTag}><span />Wuppertal <small>Demo-Gebiet</small></div>
        <div className={styles.modeSwitch} aria-label="Kartenansicht wählen">
          <button type="button" aria-pressed={displayMode === "map"} onClick={() => setLocalMode("map")}>Karte</button>
          <button type="button" aria-pressed={displayMode === "schematic"} onClick={() => setLocalMode("schematic")}>Netz</button>
        </div>

        {displayMode === "map" && tileState === "loading" && <div className={styles.loading} role="status"><span />Karte wird geladen</div>}
        {displayMode === "map" && tileState === "error" && <div className={styles.fallback} role="status">
          <span className={styles.fallbackIcon}>↗</span>
          <div><strong>Kartenkacheln nicht verfügbar</strong><p>Die Demo bleibt bedienbar. Nutze das schematische Netz.</p></div>
          <div className={styles.fallbackActions}><button type="button" onClick={() => setLocalMode("schematic")}>Netzansicht öffnen</button><button type="button" onClick={retry}>Erneut laden</button></div>
        </div>}
      </div>
      <div className={styles.legend}><span className={styles.legendDot} /><span>Fiktive Standorte · vorbereitete Demo-Routen</span><span className={styles.demoLabel}>SIMULATION</span></div>
    </div>
  );
}
