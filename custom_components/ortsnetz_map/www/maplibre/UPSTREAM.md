# MapLibre GL JS 6.4.1

Source: npm package [`maplibre-gl@6.4.1`](https://www.npmjs.com/package/maplibre-gl/v/6.4.1), BSD-3-Clause; bundled license notices are preserved in `LICENSE.txt`.

Upgrade reason: [CVE-2026-85061 / GHSA-jrc7-96c5-q579](https://github.com/maplibre/maplibre-gl-js/security/advisories/GHSA-jrc7-96c5-q579), critical XSS sanitizer bypass affecting versions before 6.4.1. `tests_js/maplibre-security.test.js` exercises the actual shipped attribution sanitizer; `tests_browser/security.spec.js` covers source attributions in a browser.

The npm release's production modules (`dist/maplibre-gl.mjs`, `dist/maplibre-gl-shared.mjs`, `dist/maplibre-gl-worker.mjs`) are in `6.4.1/`. Only their final `sourceMappingURL` comments are removed because development source maps are not shipped. The CSS and license are copied unchanged. `maplibre-gl.js` is this integration's small module adapter; it exposes the library under `window.ortsnetzMapLibre` so another card's MapLibre global cannot select an older vulnerable implementation.

The version directory keeps module and worker URLs distinct across upgrades, including when the browser has cached older assets. All runtime files are served by Home Assistant under `/ortsnetz_map/maplibre/`; no npm installation or CDN is needed on a user's Home Assistant instance.

Reproducible upstream package download: `npm pack maplibre-gl@6.4.1`. SHA-512 of the downloaded `maplibre-gl-6.4.1.tgz`:

```text
2b3c502ad7c1bbfa52cf50bec96d61352f5eca3da1da50bbb9f7408bafd212dd7bee7de801f0df9949ac9517c975763b45e00505c9efc2caa68b2a0386d03d19
```

SHA-256 of the files shipped here (after source-map comment removal):

| File | SHA-256 |
| --- | --- |
| `6.4.1/maplibre-gl.mjs` | `82ebdbd57bde03ffbe4c75e595624e48ba0f00b021f96fff7d407f846d791307` |
| `6.4.1/maplibre-gl-shared.mjs` | `a6ab4bd4c29de2637221b999630c7ef1d5441666b068e6e7d34eca1e9c014e4d` |
| `6.4.1/maplibre-gl-worker.mjs` | `c22d32c786e65fd94d80079955cb2221dadf5d63eff2dd854c5eb2e68c8ef910` |
| `maplibre-gl.css` | `8e2dbbab312dc57656fbb76e9fa5308c75c9d7c7ba5808a7d55bcdb64cc813fa` |
| `LICENSE.txt` | `ee5fc05a0677eaf69601d2c7db0d9ecd6cc27c3abc1d0733bc9ed34707cf8ef2` |

For later updates, repeat the advisory check for the vendored version separately from `npm audit`: the repository's npm lockfile covers its test tools, while this production dependency is shipped as static files.
