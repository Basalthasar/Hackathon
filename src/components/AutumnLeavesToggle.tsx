'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { DEFAULT_LEAF_PREFERENCE, parseLeafPreference, type LeafPreference } from '../demo/leaves';
import s from './PitchApp.module.css';

/**
 * Nur die Ahornform: das Paket zeichnet keine anderen Blattformen.
 * `ssr: false`, weil das Paket erst im Browser ein Canvas erzeugt.
 */
const FallingLeaves = dynamic(
  () => import('falling-leaves/react').then((module) => module.FallingLeaves),
  { ssr: false },
);

const STORAGE_KEY = 'fly2you-leaves';

function readPreference(): LeafPreference {
  try {
    return parseLeafPreference(localStorage.getItem(STORAGE_KEY));
  } catch {
    return DEFAULT_LEAF_PREFERENCE;
  }
}

/**
 * Herbstlaub-Umschalter neben dem Theme-Schalter.
 * Standard ist aus; eine ausdrückliche Wahl wird im Browser gespeichert.
 * Das Paket pausiert bei `prefers-reduced-motion` von selbst.
 */
export default function AutumnLeavesToggle() {
  const [preference, setPreference] = useState<LeafPreference>(DEFAULT_LEAF_PREFERENCE);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPreference(readPreference());
    setMounted(true);
  }, []);

  const enabled = mounted && preference === 'on';

  function toggle() {
    const next: LeafPreference = enabled ? 'off' : 'on';
    setPreference(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* Demo funktioniert auch ohne Speicher */ }
  }

  return (
    <>
      <button
        type="button"
        className={`${s.iconButton} ${s.leafButton}`}
        aria-label={enabled ? 'Herbstlaub ausblenden' : 'Herbstlaub einblenden'}
        aria-pressed={enabled}
        onClick={toggle}
      >
        <span aria-hidden="true">🍁</span>
      </button>
      {enabled && (
        <FallingLeaves
          fullScreen
          shapes={['maple']}
          count={34}
          speed={[0.5, 1.2]}
          wind={[-0.5, 0.7]}
          sway={[0.5, 1.4]}
          opacity={0.85}
          respectReducedMotion
        />
      )}
    </>
  );
}
