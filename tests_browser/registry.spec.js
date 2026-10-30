// Issue #22: Home Assistant 2026.10 ersetzt window.customElements durch ein Polyfill mit
// eigener Registry, nachdem die Card geladen wurde. Die Card muss sich dort nachträglich
// anmelden. Läuft in Chromium, WebKit und Firefox; braucht weder Karte noch WebGL.
import { expect, test } from "@playwright/test";
import { installRoutes, ORIGIN } from "./harness.js";

const PAGE = `<!doctype html><html><head><meta charset="utf-8"><title>Registry</title></head>
<body>
<script>
  // Eine Registry wie die des Polyfills: eigene Tabelle, nur die Methoden, die die Card nutzt.
  window.__makeRegistry = () => {
    const defined = new Map();
    const waiting = new Map();
    return {
      defined,
      get: (name) => defined.get(name),
      define(name, constructor) {
        defined.set(name, constructor);
        (waiting.get(name) || []).forEach((resolve) => resolve(constructor));
      },
      whenDefined(name) {
        if (defined.has(name)) return Promise.resolve(defined.get(name));
        return new Promise((resolve) => waiting.set(name, [...(waiting.get(name) || []), resolve]));
      },
    };
  };
  // Das Frontend ersetzt die Registry erst, nachdem die Card geladen ist.
  window.__swapRegistry = () => {
    const registry = window.__makeRegistry();
    Object.defineProperty(window, "customElements", { value: registry, configurable: true, writable: true });
    window.__registry = registry;
  };
  // ?early: Die Registry ist schon vor dem Laden der Card ersetzt.
  if (location.search.includes("early")) window.__swapRegistry();
</script>
<script src="/card.js"></script>
</body></html>`;

async function openPage(page, query = "") {
  await installRoutes(page);
  await page.route(`${ORIGIN}/registry.html*`, (route) => route.fulfill({ status: 200, contentType: "text/html", body: PAGE }));
  await page.goto(`${ORIGIN}/registry.html${query}`);
}

test("Card ist nach dem Laden in der ursprünglichen Registry registriert", async ({ page }) => {
  await openPage(page);
  const state = await page.evaluate(() => ({
    card: Boolean(window.customElements.get("ortsnetz-map-card")),
    editor: Boolean(window.customElements.get("ortsnetz-map-card-editor")),
  }));
  expect(state).toEqual({ card: true, editor: true });
});

test("Card meldet sich in der ersetzten Registry an (Polling)", async ({ page }) => {
  await openPage(page);
  await page.evaluate(() => window.__swapRegistry());
  expect(await page.evaluate(() => window.__registry.defined.size)).toBe(0);

  await page.waitForFunction(() => window.__registry.get("ortsnetz-map-card") && window.__registry.get("ortsnetz-map-card-editor"), null, { timeout: 5000 });
});

test("Card registriert sich sofort, wenn die Registry schon vor dem Laden ersetzt ist", async ({ page }) => {
  await openPage(page, "?early");
  const state = await page.evaluate(() => ({
    card: Boolean(window.__registry.get("ortsnetz-map-card")),
    editor: Boolean(window.__registry.get("ortsnetz-map-card-editor")),
  }));
  expect(state).toEqual({ card: true, editor: true });
});

test("Card legt in der neuen Registry dieselben Klassen an und überschreibt nichts", async ({ page }) => {
  await openPage(page);
  const result = await page.evaluate(async () => {
    const original = {
      card: window.customElements.get("ortsnetz-map-card"),
      editor: window.customElements.get("ortsnetz-map-card-editor"),
    };
    window.__swapRegistry();
    // Ein anderer Lader war schneller: dieser Eintrag darf bleiben.
    const existing = class {};
    window.__registry.define("ortsnetz-map-card", existing);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return {
      keptExisting: window.__registry.get("ortsnetz-map-card") === existing,
      editorIsSameClass: window.__registry.get("ortsnetz-map-card-editor") === original.editor,
    };
  });
  expect(result).toEqual({ keptExisting: true, editorIsSameClass: true });
});
