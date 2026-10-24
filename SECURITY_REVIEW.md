# Security-Review: Ortsnetz Map 3.0.0

Prüfdatum: 2026-10-24. Repository: `BeGiBue/home-assistant-ortsnetz-auslastung`.
Geprüfter Ausgangsstand: `ba9c204a7bc78ed49c80e9fe4e882367eedf18b6` (enthält den bereits gemergten README-PR #34).
Zielversion: **3.0.0**. Es wurde kein Release veröffentlicht.

## Ergebnis und Befunde

**Ein kritischer Befund wurde bestätigt und behoben:** Die mitgelieferte MapLibre-Version 5.7.1 war von CVE-2026-85061 betroffen. Die aktuelle Änderung ersetzt sie durch die gepatchte Version 6.4.1 und sichert die Korrektur durch Tests der tatsächlich ausgelieferten Bibliothek. Für den übrigen projektspezifischen Code wurde kein weiterer reproduzierbarer XSS-, Authentifizierungs-, Pfad- oder Geheimnisfehler festgestellt.

| Repository | Datei:Zeile im Ausgangsstand | Risiko / Prüfung | Schweregrad | Ergebnis / Korrektur |
| --- | --- | --- | --- | --- |
| home-assistant-ortsnetz-auslastung | `custom_components/ortsnetz_map/www/maplibre/maplibre-gl.js:46`; Ladepunkt `www/ortsnetz-map-card.js:3`, `:7`, `:127` | **CVE-2026-85061 / GHSA-jrc7-96c5-q579:** MapLibre `DOM.sanitize()` überspringt benachbarte gefährliche Attribute beim Entfernen aus einer lebenden Attributliste. Fremde Kartenstil-Quellenangaben können dadurch HTML-Event-Handler einschleusen; die Karte lädt OpenFreeMap-Stile und nutzt Quellenangaben. | **Kritisch, behoben** | MapLibre auf 6.4.1 aktualisiert. Die alte Bibliothek reproduzierbar geprüft: `<details open onload="1" ontoggle="…">` behält `ontoggle`. Die neue Version entfernt sämtliche gefährlichen Attribute. Regression gegen die ausgelieferten Module und Browser-Regression ergänzt; eigene globale Bibliotheksreferenz verhindert Übernahme einer fremden alten MapLibre-Version. Herkunft und Dateihashes stehen in `www/maplibre/UPSTREAM.md`. |
| home-assistant-ortsnetz-auslastung | `custom_components/ortsnetz_map/www/ortsnetz-map-card.js:174`, `:185`, `:857`, `:910`, `:1347` | HTML-/Attribut-/SVG-Injection aus API-Daten, Farben und Messwerten | Kein bestätigter Befund | Freitext wird escaped; Messwerte werden in endliche Zahlen konvertiert; API-Farben sind auf einfache Hex-/RGB-/HSL-Werte beschränkt. Neue Tests prüfen tatsächlich erzeugte DOM-Elemente und Event-Attribute sowie URL-Injection über Clusterfarben. |
| home-assistant-ortsnetz-auslastung | `custom_components/ortsnetz_map/__init__.py:339`, `:371`, `:391`; `const.py:17` | Unautorisierte WebSocket-Zugriffe, URL-/Pfadmanipulation über `public_id`, Abruf beliebiger Verläufe | Kein bestätigter Befund | Befehle laufen über die authentifizierte Home-Assistant-WebSocket-API. History-IDs sind auf 8–64 ASCII-Buchstaben, Ziffern, `_` und `-` begrenzt und müssen in der geladenen Punktliste vorkommen. Vorhandene Tests prüfen Pfadversuche, Newlines und unbekannte IDs ohne externe History-Anfrage. |
| home-assistant-ortsnetz-auslastung | `custom_components/ortsnetz_map/__init__.py:88`, `:109`, `:203` | Netzwerkzugriffe, TLS, Fehlerbehandlung und Request-Flut | Kein bestätigter Befund | Feste HTTPS-API-Endpunkte, HA-aiohttp-Session mit normaler TLS-Prüfung, Timeout, gemeinsame Caches, Sperren für parallele Abrufe und Fehlerpause. Keine eigenen Zugangsdaten oder Tokens; keine direkte externe Messdaten-API im Browser. |
| home-assistant-ortsnetz-auslastung | `custom_components/ortsnetz_map/__init__.py:45`, `:270` | Dateizugriff, Pfadvalidierung, Blocking I/O im Event-Loop | Kein bestätigter Befund | Statische Dateien stammen aus festen Paketpfaden. Keine benutzergesteuerten Dateinamen und keine eigenen synchronen Datei- oder HTTP-Zugriffe im Async-Laufzeitpfad; Registrierung über die asynchrone HA-HTTP-API. |
| home-assistant-ortsnetz-auslastung | `package-lock.json`; `custom_components/ortsnetz_map/www/maplibre/UPSTREAM.md` | Weitere Drittanbieter-Abhängigkeiten und bekannte Schwachstellen | Kein weiterer npm-Befund | `npm audit --json` meldet 0 Schwachstellen für die gelockten npm-Testabhängigkeiten. Der separate OSV-Abgleich für die statisch ausgelieferte MapLibre-Version fand den oben behobenen kritischen Befund; ein npm-Audit allein hätte diesen nicht erfasst. |

## Verbleibende Risiken und Prüfgrenzen

- Die öffentlichen Messdaten und die Kartenstile stammen von externen Anbietern. Verfügbarkeit, Korrektheit und Umfang dieser Inhalte bleiben eine Vertrauensannahme. Die API-Antworten haben einen Zeit-, aber keinen eigenen Byte-/Element-Grenzwert; eine sehr große Antwort kann Speicher und CPU beanspruchen. Eine Größenbegrenzung ist eine mögliche weitere Härtung, kein hier nachgewiesener hoher oder kritischer Exploit.
- aiohttp folgt für die festen API-URLs standardmäßig Redirects. Die URLs sind nicht durch Benutzer konfigurierbar, History-IDs sind streng geprüft. Ein kompromittierter API-Anbieter könnte dennoch auf andere Ziele verweisen; eine Redirect-/Origin-Beschränkung wäre zusätzliche Härtung.
- OpenFreeMap-Karteninhalte werden direkt vom Browser geladen; der Anbieter erhält dabei die normalen Netzwerk-Metadaten des Browsers. HA-Zugangsdaten werden vom Projekt nicht an diesen Anbieter übergeben.
- Das Review prüft die integrationsspezifischen Vertrauensgrenzen und die verwendeten MapLibre-Schnittstellen; es ist kein vollständiges Audit des minifizierten MapLibre-Quellcodes, von Home Assistant oder des Browsers. Ein Advisory-Abgleich ist eine zeitbezogene Prüfung, keine Garantie, dass keine Schwachstellen existieren.
- Die Browser-Tests ersetzen keine Prüfung auf einem echten iPad oder in der Home-Assistant-Companion-App.

## Tests

- `npm test`: **78 bestanden**, darunter zwei neue adversariale DOM-Tests, eine Ladeprüfung gegen fremde Bibliotheksversionen und die CVE-Regression mit der ausgelieferten MapLibre-Bibliothek.
- `node --check custom_components/ortsnetz_map/www/ortsnetz-map-card.js`: bestanden.
- `python -m compileall -q custom_components tests` unter Python 3.14.8: bestanden.
- Konsistenzprüfung von `VERSION`, Manifest, Card-Kopfzeile, README, Changelog und Release Notes: **3.0.0**, bestanden.
- Advisory-Abgleich: OSV bestätigt für 5.7.1 CVE-2026-85061 / GHSA-jrc7-96c5-q579 mit korrigierter Version 6.4.1. `npm audit --json`: 0 weitere Befunde.
- Python-Integrationstests lokal durch die Sandbox blockiert: Thread-Abschluss scheitert am asyncio-Socket mit PermissionError; kein abgeschlossener grüner Lauf. Die vorhandene HA-Matrix bleibt vor Freigabe erforderlich.
- Playwright: Browser heruntergeladen; lokaler Chromium-Start scheitert an Sandbox-Socketrechten, WebKit zusätzlich an fehlenden Systembibliotheken. Die vorhandenen Browser-Tests einschließlich neuer Attribution-XSS-Regression müssen in CI bestehen. Keine lokale Browser-Freigabe behauptet.

## Release-Freigabe

Der kritische Befund ist im ausgelieferten Bundle durch den Regressionstest behoben. Wegen der noch ausstehenden HA- und Browser-Testläufe bleibt die Release-Freigabe gesperrt. Das ersetzt die erforderlichen GitHub-Prüfungen und die Maintainer-Freigabe nicht. `main` ist geschützt; Änderungen werden als Pull Request vorbereitet. Die Veröffentlichung bleibt ein eigener, später freizugebender Schritt. Weder Tag- noch Veröffentlichungsworkflow wurden gestartet.
