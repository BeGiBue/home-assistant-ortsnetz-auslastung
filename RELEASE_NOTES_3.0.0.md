# 3.0.0

- **Ortsnetz Map ist im offiziellen HACS-Katalog.** Neuinstallationen erfolgen über die HACS-Suche nach „Ortsnetz Map“.
- Bestehende Custom-Repository-Installationen können zum Katalog wechseln: zuerst die Verfügbarkeit prüfen, dann nur den Eintrag unter „Benutzerdefinierte Repositories“ entfernen. **Die Installation nicht deinstallieren.** HACS aktualisieren und die weiterhin installierte Integration sowie vorhandene Dashboard-Karten prüfen. Die README beschreibt die Schritte vollständig.
- **Kritische XSS-Lücke CVE-2026-85061 / GHSA-jrc7-96c5-q579 behoben:** MapLibre GL JS 5.7.1 durch 6.4.1 ersetzt. Die Lücke lag in der HTML-Bereinigung fremder Quellenangaben; zusätzliche Tests prüfen die gepatchte Bibliothek. Alle Module und Worker werden weiterhin lokal von Home Assistant ausgeliefert.
- Security-Review des Backends, der WebSocket-Befehle und der Dashboard-Card sowie zusätzliche Sicherheits-Regressionstests. Einzelheiten und Prüfgrenzen stehen in `SECURITY_REVIEW.md`.

Die Major-Version 3.0.0 kennzeichnet die Aufnahme in den offiziellen HACS-Katalog; eine Major-Version bedeutet nicht automatisch Breaking Changes. Die Domain `ortsnetz_map`, bestehende Konfiguration, WebSocket-Befehle und `custom:ortsnetz-map-card` bleiben erhalten.

**Browser-Anforderung:** Das Sicherheitsupdate auf MapLibre 6 benötigt WebGL 2 und JavaScript-Modul-Worker. Ältere Kiosk-Browser gegebenenfalls vor dem Update aktualisieren; ein Update auf echter Companion-App/iPad-Hardware bleibt vor Veröffentlichung zu prüfen.

Diese Datei bereitet Release Notes vor. Das Anlegen eines Pull Requests veröffentlicht noch kein Release.
