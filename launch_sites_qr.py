#!/usr/bin/env python3
"""Start the Fly2You production site and the Vite mockup, expose both through
Cloudflare Quick Tunnels, and write a labelled QR code per public URL.

Usage:
    python3 launch_sites_qr.py
    python3 launch_sites_qr.py --rebuild
    python3 launch_sites_qr.py --prod-port 3000 --mockup-port 4173

The QR images (qr-mockup.png, qr-prod.png) are written next to this script.
Keep the process running; Ctrl+C stops the servers and both tunnels.
"""
from __future__ import annotations

import argparse
import os
import re
import signal
import socket
import subprocess
import sys
import threading
import time
import urllib.request
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import qrcode
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
MOCKUP_DIR = ROOT / "Mockup" / "app"
MOCKUP_DIST = MOCKUP_DIR / "dist"
CLOUDFLARED = ROOT / ".tools" / "cloudflared"
TUNNEL_URL_RE = re.compile(r"https://[a-z0-9-]+\.trycloudflare\.com")
FONT_BOLD = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_REGULAR = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"


def log(message: str) -> None:
    print(message, flush=True)


def newest_mtime(paths: list[Path]) -> float:
    newest = 0.0
    for path in paths:
        if not path.exists():
            continue
        if path.is_file():
            newest = max(newest, path.stat().st_mtime)
            continue
        for item in path.rglob("*"):
            if item.is_file():
                newest = max(newest, item.stat().st_mtime)
    return newest


def run_build(cwd: Path, label: str) -> None:
    log(f"[{label}] build required, running npm run build ...")
    result = subprocess.run(["npm", "run", "build"], cwd=cwd)
    if result.returncode != 0:
        raise SystemExit(f"[{label}] build failed with exit code {result.returncode}")


def port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.5)
        return sock.connect_ex(("127.0.0.1", port)) == 0


def wait_for_http(url: str, timeout: float = 120.0) -> None:
    opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
    deadline = time.time() + timeout
    last_error: Exception | None = None
    while time.time() < deadline:
        try:
            with opener.open(url, timeout=2) as response:
                if response.status < 500:
                    return
        except Exception as error:  # connection refused while starting
            last_error = error
        time.sleep(0.5)
    raise SystemExit(f"{url} did not become ready: {last_error}")


def resolve_cloudflared() -> str:
    if os.environ.get("CLOUDFLARED_BIN"):
        return os.environ["CLOUDFLARED_BIN"]
    if CLOUDFLARED.exists():
        return str(CLOUDFLARED)
    found = subprocess.run(["which", "cloudflared"], capture_output=True, text=True)
    if found.returncode == 0 and found.stdout.strip():
        return found.stdout.strip().splitlines()[0]
    log("cloudflared missing, installing into .tools via scripts/install-cloudflared.mjs ...")
    result = subprocess.run(["node", "scripts/install-cloudflared.mjs"], cwd=ROOT)
    if result.returncode != 0 or not CLOUDFLARED.exists():
        raise SystemExit("cloudflared could not be installed")
    return str(CLOUDFLARED)


class StaticServer:
    """Serve the prebuilt Vite mockup on a local port."""

    def __init__(self, directory: Path, port: int) -> None:
        handler = partial(_QuietHandler, directory=str(directory))

        class _Server(ThreadingHTTPServer):
            daemon_threads = True
            allow_reuse_address = True

        self.httpd = _Server(("127.0.0.1", port), handler)
        self.thread = threading.Thread(target=self.httpd.serve_forever, daemon=True)

    def start(self) -> None:
        self.thread.start()

    def stop(self) -> None:
        self.httpd.shutdown()
        self.httpd.server_close()


class _QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, fmt: str, *args) -> None:  # noqa: A003 - stdlib signature
        log(f"[mockup] {self.address_string()} {fmt % args}")


class Tunnel:
    """Cloudflare Quick Tunnel with its public URL parsed from output."""

    def __init__(self, binary: str, label: str, target: str) -> None:
        self.label = label
        self.target = target
        self.process = subprocess.Popen(
            [binary, "tunnel", "--url", target, "--no-autoupdate"],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            start_new_session=True,
        )
        self.url: str | None = None
        self._ready = threading.Event()
        self._thread = threading.Thread(target=self._pump, daemon=True)
        self._thread.start()

    def _pump(self) -> None:
        assert self.process.stdout is not None
        for line in self.process.stdout:
            stripped = line.rstrip()
            if stripped:
                log(f"[{self.label}] {stripped}")
            if self.url is None:
                match = TUNNEL_URL_RE.search(stripped)
                if match:
                    self.url = match.group(0)
                    self._ready.set()
        self._ready.set()  # process exited before a URL appeared

    def wait_url(self, timeout: float = 90.0) -> str:
        if not self._ready.wait(timeout) or self.url is None:
            raise SystemExit(f"[{self.label}] no trycloudflare URL within {timeout:.0f}s")
        return self.url

    def stop(self) -> None:
        if self.process.poll() is None:
            try:
                os.killpg(self.process.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    try:
        return ImageFont.truetype(path, size)
    except OSError:
        return ImageFont.load_default(size=size)


def fit_font(text: str, path: str, start_size: int, max_width: float) -> ImageFont.ImageFont:
    size = start_size
    font = load_font(path, size)
    while size > 14:
        width = font.getlength(text)
        if width <= max_width:
            return font
        size -= 2
        font = load_font(path, size)
    return font


def write_qr(url: str, title: str, subtitle: str, output: Path) -> None:
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=12,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_image = qr.make_image(fill_color="black", back_color="white").get_image().convert("RGB")

    margin = 48
    gap = 28
    max_text_width = max(qr_image.width, 640)

    title_font = fit_font(title, FONT_BOLD, 84, max_text_width)
    subtitle_font = fit_font(subtitle, FONT_REGULAR, 32, max_text_width)
    url_font = fit_font(url, FONT_REGULAR, 26, max_text_width)

    title_h = int(title_font.getbbox("Ag")[3] - title_font.getbbox("Ag")[1])
    subtitle_h = int(subtitle_font.getbbox("Ag")[3] - subtitle_font.getbbox("Ag")[1])
    url_h = int(url_font.getbbox("Ag")[3] - url_font.getbbox("Ag")[1])

    width = max_text_width + 2 * margin
    height = margin + title_h + gap // 2 + subtitle_h + gap + qr_image.height + gap + url_h + margin

    canvas = Image.new("RGB", (width, height), "white")
    draw = ImageDraw.Draw(canvas)

    y = margin
    draw.text((width / 2, y), title, font=title_font, fill="black", anchor="ma")
    y += title_h + gap // 2
    draw.text((width / 2, y), subtitle, font=subtitle_font, fill="#333333", anchor="ma")
    y += subtitle_h + gap

    qr_x = (width - qr_image.width) // 2
    canvas.paste(qr_image, (qr_x, y))
    y += qr_image.height + gap

    draw.text((width / 2, y), url, font=url_font, fill="#333333", anchor="ma")

    canvas.save(output, "PNG")


def build_if_stale(force: bool) -> None:
    prod_marker = ROOT / ".next" / "BUILD_ID"
    prod_sources = [ROOT / "src", ROOT / "public", ROOT / "package.json", ROOT / "next.config.ts", ROOT / "tsconfig.json"]
    mockup_marker = MOCKUP_DIST / "index.html"
    mockup_sources = [MOCKUP_DIR / "src", MOCKUP_DIR / "index.html", MOCKUP_DIR / "package.json", MOCKUP_DIR / "vite.config.ts"]

    prod_stale = force or not prod_marker.exists() or prod_marker.stat().st_mtime < newest_mtime(prod_sources)
    mockup_stale = force or not mockup_marker.exists() or mockup_marker.stat().st_mtime < newest_mtime(mockup_sources)

    if prod_stale:
        run_build(ROOT, "prod")
    if mockup_stale:
        run_build(MOCKUP_DIR, "mockup")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--prod-port", type=int, default=3000, help="local port for the Next.js production server")
    parser.add_argument("--mockup-port", type=int, default=4173, help="local port for the Vite mockup dist")
    parser.add_argument("--rebuild", action="store_true", help="rebuild both sites before starting")
    parser.add_argument("--out-dir", type=Path, default=ROOT, help="directory for qr-mockup.png and qr-prod.png")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    def interrupt(*_: object) -> None:
        raise KeyboardInterrupt

    for sig in (signal.SIGTERM, signal.SIGHUP):
        signal.signal(sig, interrupt)

    if not (MOCKUP_DIST / "index.html").exists():
        log("[mockup] dist missing")
    build_if_stale(args.rebuild)

    for port in (args.prod_port, args.mockup_port):
        if port_in_use(port):
            raise SystemExit(f"Port {port} is already in use. Stop the other server or pass another port.")

    cloudflared = resolve_cloudflared()
    prod = None
    mockup = None
    tunnels: list[Tunnel] = []

    try:
        log(f"[prod] starting next start on 127.0.0.1:{args.prod_port} ...")
        prod = subprocess.Popen(
            [str(ROOT / "node_modules" / ".bin" / "next"), "start", "--hostname", "127.0.0.1", "--port", str(args.prod_port)],
            cwd=ROOT,
            start_new_session=True,
        )
        wait_for_http(f"http://127.0.0.1:{args.prod_port}/")

        log(f"[mockup] serving {MOCKUP_DIST} on 127.0.0.1:{args.mockup_port} ...")
        mockup = StaticServer(MOCKUP_DIST, args.mockup_port)
        mockup.start()
        wait_for_http(f"http://127.0.0.1:{args.mockup_port}/")

        log("[tunnel] starting Cloudflare Quick Tunnels ...")
        prod_tunnel = Tunnel(cloudflared, "tunnel-prod", f"http://127.0.0.1:{args.prod_port}")
        mockup_tunnel = Tunnel(cloudflared, "tunnel-mockup", f"http://127.0.0.1:{args.mockup_port}")
        tunnels.extend([prod_tunnel, mockup_tunnel])

        prod_url = prod_tunnel.wait_url()
        mockup_url = mockup_tunnel.wait_url()

        args.out_dir.mkdir(parents=True, exist_ok=True)
        mockup_qr = args.out_dir / "qr-mockup.png"
        prod_qr = args.out_dir / "qr-prod.png"
        write_qr(mockup_url, "MOCKUP", "Prototyp (Mockup)", mockup_qr)
        write_qr(prod_url, "PROD", "Produktions-Website", prod_qr)

        log("")
        log("=" * 72)
        log(f"MOCKUP: {mockup_url}")
        log(f"  QR:   {mockup_qr.resolve()}")
        log(f"PROD:   {prod_url}")
        log(f"  QR:   {prod_qr.resolve()}")
        log("=" * 72)
        log("Ctrl+C stops both sites and both tunnels.")

        while True:
            time.sleep(3600)
    except KeyboardInterrupt:
        pass
    finally:
        log("shutting down ...")
        for tunnel in tunnels:
            tunnel.stop()
        if mockup is not None:
            mockup.stop()
        if prod is not None and prod.poll() is None:
            try:
                os.killpg(prod.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
            try:
                prod.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(prod.pid, signal.SIGKILL)
    return 0


if __name__ == "__main__":
    sys.exit(main())
