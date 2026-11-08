/**
 * Basis-Pfad für statische Vorschauen (GitHub Pages) und Hilfsfunktion für
 * Dateien aus `public/`. Im normalen Betrieb ist der Präfix leer.
 */
export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

/** Ergänzt einen öffentlichen Pfad um den Basis-Pfad, z. B. `/images/x.webp`. */
export function asset(path: string): string {
  return `${basePath}${path}`;
}
