export type LeafPreference = 'on' | 'off';

/**
 * Der Herbstlaub-Effekt ist standardmäßig aus. Nur eine ausdrückliche Wahl
 * schaltet ihn ein; die Wahl wird im Browser gespeichert.
 */
export const DEFAULT_LEAF_PREFERENCE: LeafPreference = 'off';

/** Gespeicherte Nutzerwahl; alles außer „on" bedeutet aus. */
export function parseLeafPreference(raw: string | null): LeafPreference {
  return raw === 'on' ? 'on' : 'off';
}
