// Issue #22 mit dem echten Polyfill @webcomponents/scoped-custom-element-registry statt einer
// Attrappe: Die Card ist schon nativ registriert, dann lädt ein anderes Add-on den Polyfill
// (er ersetzt window.customElements durch eine neue, leere Registry). Der Polyfill lässt sich
// nicht zurücknehmen; die Fälle bauen deshalb aufeinander auf und laufen in dieser Reihenfolge.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

const CARD = "../custom_components/ortsnetz_map/www/ortsnetz-map-card.js";
const POLYFILL = readFileSync(
  createRequire(import.meta.url).resolve("@webcomponents/scoped-custom-element-registry"),
  "utf8",
);
const TAGS = ["ortsnetz-map-card", "ortsnetz-map-card-editor"];

let nativeCard;

function loadPolyfill() {
  (0, window.eval)(POLYFILL);
}

beforeAll(async () => {
  vi.useFakeTimers();
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  window.matchMedia = () => ({ matches: false });
  await import(CARD);
  nativeCard = window.customElements.get("ortsnetz-map-card");
});

afterAll(() => vi.useRealTimers());

describe("Card mit dem echten Polyfill (Issue #22)", () => {
  it("ist vor dem Polyfill nativ registriert", () => {
    expect(typeof nativeCard).toBe("function");
    TAGS.forEach((tag) => expect(window.customElements.get(tag)).toBeTypeOf("function"));
  });

  it("ist nach dem Laden des Polyfills in der neuen Registry nicht mehr auffindbar (der Fehler)", () => {
    const before = window.customElements;
    loadPolyfill();
    expect(window.customElements).not.toBe(before);
    TAGS.forEach((tag) => expect(window.customElements.get(tag)).toBeUndefined());
  });

  it("meldet sich danach selbst an, und wartende whenDefined-Aufrufe lösen aus", async () => {
    let resolved = false;
    window.customElements.whenDefined("ortsnetz-map-card").then(() => { resolved = true; });
    await vi.advanceTimersByTimeAsync(600);

    expect(window.customElements.get("ortsnetz-map-card")).toBe(nativeCard);
    expect(window.customElements.get("ortsnetz-map-card-editor")).toBeTypeOf("function");
    expect(resolved).toBe(true);
  });

  it("erzeugt danach funktionierende Elemente", () => {
    const element = document.createElement("ortsnetz-map-card");
    expect(element).toBeInstanceOf(nativeCard);
    expect(typeof element.setConfig).toBe("function");
  });

  it("repariert auch einen zweiten, späten Austausch (Polyfill erneut geladen) innerhalb von 10 s", async () => {
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000);
    const before = window.customElements;
    loadPolyfill();
    expect(window.customElements).not.toBe(before);
    expect(window.customElements.get("ortsnetz-map-card")).toBeUndefined();

    await vi.advanceTimersByTimeAsync(10_000);
    expect(window.customElements.get("ortsnetz-map-card")).toBe(nativeCard);
    expect(window.customElements.get("ortsnetz-map-card-editor")).toBeTypeOf("function");
    expect(document.createElement("ortsnetz-map-card")).toBeInstanceOf(nativeCard);
  });
});
