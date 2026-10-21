# FlyToYou - Startanleitung

FlyToYou ist der React-Prototyp einer drohnenzentrierten lokalen
Lieferplattform. Die Oberfläche zeigt Kunde, Händler, Flotte und Betrieb mit
Demodaten. Es gibt kein echtes Backend, keine echte Zahlung, keine echte
Drohnensteuerung und keine Live-Telemetrie.

## Schnellstart

Voraussetzung: Node.js 20 oder neuer und npm.

```bash
cd /home/basalthasar/Documents/Mockup/app
npm install
npm run dev
```

Danach öffnen:

```text
http://localhost:5173/
```

Der Dev-Server lauscht auf `0.0.0.0`, ist also auch im lokalen Netzwerk
erreichbar. Die eigene IP anzeigen:

```bash
hostname -I
```

Beispiel:

```text
http://<DEINE-IP>:5173/
```

Aktuell ist die IP dieses Rechners zum Beispiel `172.20.10.5`. Sie kann sich
nach einem Netzwerkwechsel ändern; deshalb immer `hostname -I` verwenden.

Von anderen Geräten nie `localhost` verwenden, sondern die LAN-IP des Rechners,
auf dem der Server läuft.

## Produktions-Build lokal starten

```bash
cd /home/basalthasar/Documents/Mockup/app
npm run build
npm run preview
```

Aufruf:

```text
http://localhost:4173/
```

Im LAN:

```text
http://<DEINE-IP>:4173/
```

## Server neu starten

Wenn sich die Netzwerk-IP geändert hat oder der Server hängt:

```bash
cd /home/basalthasar/Documents/Mockup/app
pkill -f "vite.*5173" 2>/dev/null || true
npm run dev
```

Neue IP:

```bash
hostname -I
```

## Windows

Voraussetzung: Node.js LTS installiert.

PowerShell:

```powershell
cd C:\Pfad\zu\Hackathon\app
npm install
npm run dev
```

Eigene IP:

```powershell
ipconfig
```

Aufruf:

```text
http://<Windows-IPv4>:5173/
```

Firewall freigeben, falls ein anderes Gerät nicht zugreifen kann
(PowerShell als Administrator):

```powershell
New-NetFirewallRule `
  -DisplayName "FlyToYou Dev 5173" `
  -Direction Inbound `
  -Protocol TCP `
  -LocalPort 5173 `
  -Action Allow
```

## Was man in der App sieht

| Rolle | Inhalt |
|---|---|
| Kunde | Suche, Angebotsvergleich, Warenkorb, Checkout, Bestellverfolgung |
| Händler | Händlerauswahl, Arbeitsliste des Demo-Kunden, Annehmen, Vorbereiten, Übergeben |
| Flotte | Drohnen, Batterie, Nutzlast, Missionen, erwarteter Start, Landung |
| Betrieb | Bestellungen, Drohnenzuweisung, Zahlungen, Ausnahmen |

Demo-Kunde ist **A. Yilmaz**. Die Händleransicht zeigt dessen Aufträge für den
ausgewählten Händler. Händleraktionen aktualisieren direkt dieselbe Bestellung
in der Kundenverfolgung.

## Ablauf zum Ausprobieren

1. Als **Kunde** ein Produkt suchen, zum Beispiel `Pflaster`.
2. Angebot wählen und in den Warenkorb legen.
3. „Preis und Zeit berechnen“.
4. Checkout öffnen und Bestellung aufgeben.
5. Als **Händler** den passenden Händler wählen und die Bestellung annehmen,
   zusammenstellen, abholbereit melden und an die Drohne übergeben.
6. Als **Kunde** zu „Bestellungen“ wechseln. Die Verfolgung öffnet die
   Bestellung mit dem aktualisierten Status.
7. Als **Flotte** den erwarteten Start beobachten. Die Drohne startet erst nach
   dem 30- bis 60-Sekunden-Fenster und nach der Händlerübergabe.
8. Die Karte zeigt die simulierte Bewegung erst bei Status „Unterwegs“.

## Karte

Die Karte nutzt OpenStreetMap-Kacheln und benötigt eine Internetverbindung.
Die Drohnenbewegung ist simuliert. Es gibt keine Live-Position und keine
Telemetrie.

## Netzwerkprobleme

Wenn ein anderes Gerät die Seite nicht erreicht:

1. Gleiches WLAN/LAN prüfen.
2. IP mit `hostname -I` prüfen.
3. Linux-Firewall prüfen:
   ```bash
   sudo ufw status
   sudo ufw allow 5173/tcp
   ```
4. Router-Einstellungen prüfen: Client-Isolation, AP-Isolation, Gastnetz.
5. Schnelltest: beide Geräte mit demselben Handy-Hotspot verbinden.
6. Bei Windows zusätzlich die Firewall-Regel oben anlegen.

## Grenzen

- Alle Daten sind Demo-Daten.
- Keine echte Zahlung, keine echte Bestandsanbindung, kein echtes Routing.
- Keine echte Flugfreigabe oder Drohnensteuerung.
- Der 30- bis 60-Sekunden-Startdelay ist simulierte Zustandslogik im Client.
- OSM-Kacheln benötigen Internet; die Karte ist keine amtliche Geodatenquelle.

## Öffentlicher Zugriff über Cloudflare Tunnel

Aktuell erreichbar unter:

```text
https://feelings-acc-blocking-followed.trycloudflare.com
```

Der Tunnel läuft lokal und leitet auf `http://127.0.0.1:5173` weiter. Start:

```bash
~/.local/bin/cloudflared tunnel --url http://127.0.0.1:5173 --no-autoupdate
```

Wichtig:

- Der Quick Tunnel hat keine Uptime-Garantie.
- Die URL ändert sich bei jedem Neustart des Tunnels.
- Für eine feste Domain ist ein benannter Cloudflare-Tunnel mit Account
  erforderlich.
- Die Website bleibt ein Demo-Prototyp ohne echte Zahlung, Lieferung oder
  Flugfreigabe.
