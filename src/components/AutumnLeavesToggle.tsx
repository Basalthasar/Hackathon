'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { parseLeafPreference, shouldShowLeaves, type LeafPreference } from '../demo/season';
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
    return 'auto';
  }
}

/**
 * Herbstlaub-Umschalter neben dem Theme-Schalter.
 * Standard ist die Jahreszeit (September bis November); eine Klickwahl wird gespeichert.
 * Das Paket pausiert bei `prefers-reduced-motion` von selbst.
 */
export default function AutumnLeavesToggle() {
  const [preference, setPreference] = useState<LeafPreference>('auto');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPreference(readPreference());
    setMounted(true);
  }, []);

  const enabled = mounted && shouldShowLeaves(preference);

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
