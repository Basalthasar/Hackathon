#!/usr/bin/env node
/**
 * Install a local cloudflared binary without adding an npm dependency.
 *
 * Works on macOS (Intel/Apple Silicon), Linux (x64/arm64) and Windows x64.
 * The binary is written to .tools/ inside the repository and ignored by git.
 *
 * Usage:
 *   node scripts/install-cloudflared.mjs
 *   node scripts/install-cloudflared.mjs --force
 *   CLOUDFLARED_BIN=/absolute/path/to/cloudflared npm run cloudflare:tunnel
 */
import { chmod, copyFile, mkdir, rm, stat } from 'node:fs/promises';
import { createWriteStream } from 'node:fs';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const toolsDir = join(root, '.tools');
const binaryName = process.platform === 'win32' ? 'cloudflared.exe' : 'cloudflared';
const binaryPath = join(toolsDir, binaryName);
const force = process.argv.includes('--force');

const assetFor = () => {
  const { platform, arch } = process;
  if (platform === 'darwin' && arch === 'x64') return 'cloudflared-darwin-amd64.tgz';
  if (platform === 'darwin' && arch === 'arm64') return 'cloudflared-darwin-arm64.tgz';
  if (platform === 'linux' && arch === 'x64') return 'cloudflared-linux-amd64';
  if (platform === 'linux' && arch === 'arm64') return 'cloudflared-linux-arm64';
  if (platform === 'win32' && arch === 'x64') return 'cloudflared-windows-amd64.exe';
  return null;
};

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
};

const download = async (url, target) => {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok || !response.body) {
    throw new Error(`Download failed: ${response.status} ${response.statusText}`);
  }
  await pipeline(Readable.fromWeb(response.body), createWriteStream(target));
};

const main = async () => {
  if (process.env.CLOUDFLARED_BIN) {
    console.log(`Using CLOUDFLARED_BIN=${process.env.CLOUDFLARED_BIN}`);
    return;
  }

  if (!force && await exists(binaryPath)) {
    console.log(`cloudflared already installed: ${binaryPath}`);
    return;
  }

  const asset = assetFor();
  if (!asset) {
    throw new Error(`No cloudflared asset for ${process.platform}/${process.arch}. Install it manually and set CLOUDFLARED_BIN.`);
  }

  await mkdir(toolsDir, { recursive: true });
  const tempPath = join(toolsDir, asset);
  const url = `https://github.com/cloudflare/cloudflared/releases/latest/download/${asset}`;
  console.log(`Downloading ${asset} ...`);
  await download(url, tempPath);

  if (asset.endsWith('.tgz')) {
    const extracted = spawnSync('tar', ['-xzf', tempPath, '-C', toolsDir], { stdio: 'inherit' });
    if (extracted.status !== 0) {
      throw new Error('Could not extract the macOS archive. Is tar installed?');
    }
    await rm(tempPath, { force: true });
  } else {
    await copyFile(tempPath, binaryPath);
    await rm(tempPath, { force: true });
  }

  if (process.platform !== 'win32') await chmod(binaryPath, 0o755);
  if (process.platform === 'darwin') {
    // Downloads made by Node normally carry no quarantine flag. Remove it if present.
    spawnSync('xattr', ['-d', 'com.apple.quarantine', binaryPath], { stdio: 'ignore' });
  }
  console.log(`Installed: ${binaryPath}`);
  console.log('Start a tunnel with: npm run cloudflare:tunnel');
};

main().catch((error) => {
  console.error(`cloudflared installation failed: ${error.message}`);
  console.error('Manual fallback: install cloudflared and set CLOUDFLARED_BIN to its absolute path.');
  process.exit(1);
});
