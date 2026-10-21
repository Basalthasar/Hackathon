#!/usr/bin/env node
/**
 * Start a Cloudflare Quick Tunnel for the local Next.js server.
 *
 * Works on macOS, Linux and Windows. No Cloudflare account is required.
 * The public URL changes every time the tunnel starts.
 *
 * Usage:
 *   npm run cloudflare:tunnel
 *   npm run cloudflare:tunnel -- --port 3000
 *   npm run cloudflare:tunnel -- --url http://127.0.0.1:3000
 */
import { existsSync } from 'node:fs';
import { spawn, spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const installer = join(root, 'scripts', 'install-cloudflared.mjs');
const binaryName = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
const localBinary = join(root, '.tools', binaryName);

const args = process.argv.slice(2);
const portIndex = args.indexOf('--port');
const urlIndex = args.indexOf('--url');
const port = portIndex !== -1 ? Number(args[portIndex + 1]) : 3000;
const targetUrl = urlIndex !== -1 ? args[urlIndex + 1] : `http://127.0.0.1:${port}`;

if (!Number.isFinite(port) || (urlIndex === -1 && (port < 1 || port > 65535))) {
  console.error('Invalid port. Use --port 3000.');
  process.exit(2);
}

const findBinary = () => {
  if (process.env.CLOUDFLARED_BIN) return process.env.CLOUDFLARED_BIN;
  if (existsSync(localBinary)) return localBinary;

  const lookup = spawnSync(process.platform === 'win32' ? 'where' : 'which', ['cloudflared'], {
    encoding: 'utf8',
  });
  if (lookup.status === 0) {
    return lookup.stdout.split(/\r?\n/).find(Boolean)?.trim();
  }

  console.log('cloudflared not found. Installing into .tools ...');
  const install = spawnSync(process.execPath, [installer], { stdio: 'inherit' });
  if (install.status !== 0) process.exit(install.status ?? 1);
  return localBinary;
};

const binary = findBinary();
if (!binary || !existsSync(binary)) {
  console.error('cloudflared is still missing. Run: npm run cloudflare:install');
  process.exit(1);
}

console.log(`Starting Cloudflare Quick Tunnel for ${targetUrl}`);
console.log('The public URL appears below. Stop with Ctrl+C.');
console.log('Quick tunnels have no uptime guarantee and get a new URL on every start.\n');

const child = spawn(binary, ['tunnel', '--url', targetUrl, '--no-autoupdate'], {
  stdio: 'inherit',
});

const shutdown = (signal) => {
  if (!child.killed) child.kill(signal);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
child.on('exit', (code, signal) => {
  if (signal) console.log(`Tunnel stopped (${signal}).`);
  process.exit(code ?? 0);
});
child.on('error', (error) => {
  console.error(`Could not start cloudflared: ${error.message}`);
  process.exit(1);
});
