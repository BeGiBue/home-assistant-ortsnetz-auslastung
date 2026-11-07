<p align="center">
  <img src="https://raw.githubusercontent.com/BeGiBue/home-assistant-ortsnetz-auslastung/main/brand/icon.png?v=2" alt="Ortsnetz Map" width="160">
</p>

# Ortsnetz Map

**English** | [Deutsch](https://github.com/BeGiBue/home-assistant-ortsnetz-auslastung#deutsch)

## English

Home Assistant integration with a dashboard card for the public measuring points of [ortsnetz-auslastung.de](https://www.ortsnetz-auslastung.de/) (local low-voltage grid in Germany). The integration loads the data on the server, caches it on demand and ships the matching card. The browser never calls the external API; all data runs through Home Assistant.

<img src="https://raw.githubusercontent.com/BeGiBue/home-assistant-ortsnetz-auslastung/main/docs/assets/ortsnetz-normal-800-light.png" width="800" alt="Ortsnetz Map: Germany overview with measuring points, clusters and open legend, 800 px, light theme">

### Features

- Nearby sites are clustered up to zoom 11; from zoom 12 all single points appear. Each cluster is a pie chart of the status shares; tap or press Enter to zoom in.
- Marker color by the worst value of all measured phases; marker size by expected PV yield (kWh/kWp/day).
- Collapsible legend with the readings of the last 24 hours per status; checkboxes hide single statuses.
- Popup with L1/L2/L3, grid frequency, PV forecast and two 24-hour charts (voltage and frequency); outdated readings are shown transparent.
- Cooperative gestures (can be turned off), dark mode from the active theme, OpenFreeMap vector map without API key, visual editor.
- On-demand fetching without background polling, shared 5-minute cache; the card is loaded automatically, no dashboard resource needed.

The card is shown in German when Home Assistant is set to German, and in English otherwise.

### Requirements

- Home Assistant 2026.6.0 or newer.
- A current browser with WebGL 2 and JavaScript module workers, also on kiosk devices and in the Companion app WebView.
- Internet access from the Home Assistant server to `www.ortsnetz-auslastung.de`.

Independent community project, not part of ortsnetz-auslastung.de, OpenFreeMap / OpenStreetMap or Home Assistant. License: [AGPL-3.0-only](https://github.com/BeGiBue/home-assistant-ortsnetz-auslastung/blob/main/LICENSE).

## Deutsch

[English](https://github.com/BeGiBue/home-assistant-ortsnetz-auslastung#english) | **Deutsch**

Home-Assistant-Integration mit Dashboard-Karte für die öffentlichen Messpunkte von [ortsnetz-auslastung.de](https://www.ortsnetz-auslastung.de/). Die Integration lädt die Daten serverseitig, speichert sie bedarfsgesteuert zwischen und liefert die passende Karte mit. Der Browser ruft die externe API nicht direkt auf; alle Daten laufen über Home Assistant.

<img src="https://raw.githubusercontent.com/BeGiBue/home-assistant-ortsnetz-auslastung/main/docs/assets/ortsnetz-normal-800-light.png" width="800" alt="Ortsnetz Map: Deutschland-Übersicht mit Messpunkten, Clustern und geöffneter Legende, 800 px, helles Theme">

### Funktionen

- Standorte in der Nähe werden bis Zoom 11 zu Clustern zusammengefasst, ab Zoom 12 erscheinen alle Einzelpunkte. Jeder Cluster ist ein Tortendiagramm der Status-Anteile; Antippen oder Enter zoomt hinein.
- Markerfarbe nach dem schlechtesten Wert aller gemessenen Phasen, Markergröße nach dem erwarteten PV-Ertrag (kWh/kWp/Tag).
- Einklappbare Legende mit den Messungen der letzten 24 Stunden je Status; Häkchen blenden einzelne Status aus.
- Popup mit L1/L2/L3, Netzfrequenz, PV-Forecast und zwei 24-Stunden-Verläufen (Spannung und Frequenz); veraltete Messungen erscheinen transparent.
- Kooperative Gesten (abschaltbar), Dark Mode nach dem aktiven Theme, OpenFreeMap-Vektorkarte ohne API-Key, grafischer Editor.
- Bedarfsgesteuerter Abruf ohne Hintergrund-Polling, gemeinsamer 5-Minuten-Cache; die Karte wird automatisch geladen, keine Dashboard-Ressource nötig.

Die Karte erscheint auf Deutsch, wenn Home Assistant auf Deutsch eingestellt ist, sonst auf Englisch.

### Voraussetzungen

- Home Assistant 2026.6.0 oder neuer.
- Aktueller Browser mit WebGL 2 und JavaScript-Modul-Workern, auch auf Kiosk-Geräten und in der WebView der Companion-App.
- Internetzugriff des Home-Assistant-Servers auf `www.ortsnetz-auslastung.de`.

Unabhängiges Community-Projekt, nicht Teil von ortsnetz-auslastung.de, OpenFreeMap / OpenStreetMap oder Home Assistant. Lizenz: [AGPL-3.0-only](https://github.com/BeGiBue/home-assistant-ortsnetz-auslastung/blob/main/LICENSE).
