import type { NextConfig } from 'next';

/** GitHub Pages liefert nur statische Dateien; dort läuft die Demo ohne Server-Route. */
const staticExport = process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  allowedDevOrigins: ['*.trycloudflare.com'],
  ...(basePath ? { basePath } : {}),
  ...(staticExport ? { output: 'export' as const, images: { unoptimized: true } } : {}),
};
export default config;
