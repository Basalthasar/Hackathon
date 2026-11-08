/**
 * Herbstfenster der Demo: September bis November.
 * `getMonth()` zählt ab null, deshalb sind 8, 9 und 10 die Herbstmonate.
 */
export const AUTUMN_MONTHS: readonly number[] = [8, 9, 10];

export function isAutumnSeason(date: Date = new Date()): boolean {
  return AUTUMN_MONTHS.includes(date.getMonth());
}

export type LeafPreference = 'auto' | 'on' | 'off';

/** Gespeicherte Nutzerwahl, bewusst ohne Jahreszeit-Ersatz. */
export function parseLeafPreference(raw: string | null): LeafPreference {
  return raw === 'on' || raw === 'off' ? raw : 'auto';
}

/** Sichtbarkeit: eine ausdrückliche Wahl gewinnt, sonst entscheidet die Jahreszeit. */
export function shouldShowLeaves(preference: LeafPreference, date: Date = new Date()): boolean {
  if (preference === 'on') return true;
  if (preference === 'off') return false;
  return isAutumnSeason(date);
}
