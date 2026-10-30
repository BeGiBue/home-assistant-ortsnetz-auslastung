// Regression für Issue #22: Eine andere Karte oder ein Add-on lädt den Polyfill
// @webcomponents/scoped-custom-element-registry und ersetzt window.customElements durch eine
// neue Registry. Die Card muss sich danach dort anmelden, auch lange nach dem Start.
// (Der Ablauf mit dem echten Polyfill steht in registry-polyfill.test.js.)
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const CARD = "../custom_components/ortsnetz_map/www/ortsnetz-map-card.js";
const NAMES = ["ortsnetz-map-card", "ortsnetz-map-card-editor"];

function fakeRegistry() {
  const defined = new Map();
  return {
    defined,
    get: (name) => defined.get(name),
    define(name, constructor) {
      defined.set(name, constructor);
    },
  };
}

const original = Object.getOwnPropertyDescriptor(window, "customElements");

function useRegistry(registry) {
  Object.defineProperty(window, "customElements", { value: registry, configurable: true, writable: true });
}

const hasAll = (registry) => NAMES.every((name) => registry.defined.has(name));

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  window.matchMedia = () => ({ matches: false });
});

afterEach(() => {
  vi.useRealTimers();
  if (original) Object.defineProperty(window, "customElements", original);
});

describe("Registrierung bei ausgetauschter customElements-Registry", () => {
  it("registriert sofort in der aktuellen Registry", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);
    expect(hasAll(registry)).toBe(true);
  });

  it("meldet die Card in der neuen Registry an, wenn sie kurz nach dem Start ausgetauscht wird", async () => {
    const oldRegistry = fakeRegistry();
    useRegistry(oldRegistry);
    await import(CARD);
    expect(hasAll(oldRegistry)).toBe(true);

    const newRegistry = fakeRegistry();
    useRegistry(newRegistry);
    expect(newRegistry.defined.size).toBe(0);

    await vi.advanceTimersByTimeAsync(600);
    expect(hasAll(newRegistry)).toBe(true);
    // Dieselben Klassen wie in der alten Registry, keine zweite Variante.
    NAMES.forEach((name) => expect(newRegistry.defined.get(name)).toBe(oldRegistry.defined.get(name)));
  });

  it("repariert auch einen späten Austausch, lange nach dem Start (höchstens 10 s)", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);
    await vi.advanceTimersByTimeAsync(10 * 60 * 1000); // zehn Minuten Dauerbetrieb

    const late = fakeRegistry();
    useRegistry(late);
    await vi.advanceTimersByTimeAsync(9_999);
    expect(hasAll(late)).toBe(true);
  });

  it("repariert jeden weiteren Austausch erneut", async () => {
    useRegistry(fakeRegistry());
    await import(CARD);
    for (let round = 0; round < 3; round++) {
      const next = fakeRegistry();
      useRegistry(next);
      await vi.advanceTimersByTimeAsync(10_000);
      expect(hasAll(next)).toBe(true);
    }
  });

  it("meldet sofort an, wenn Home Assistant die Position wechselt (location-changed)", async () => {
    useRegistry(fakeRegistry());
    await import(CARD);
    await vi.advanceTimersByTimeAsync(60_000);

    const late = fakeRegistry();
    useRegistry(late);
    window.dispatchEvent(new Event("location-changed"));
    expect(hasAll(late)).toBe(true);
  });

  it("meldet beim Sichtbarkeitswechsel sofort an", async () => {
    useRegistry(fakeRegistry());
    await import(CARD);
    await vi.advanceTimersByTimeAsync(60_000);

    const late = fakeRegistry();
    useRegistry(late);
    document.dispatchEvent(new Event("visibilitychange"));
    expect(hasAll(late)).toBe(true);
  });

  it("überschreibt vorhandene Einträge nicht und wirft nicht bei jedem Durchlauf", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);
    const define = vi.spyOn(registry, "define");
    const before = new Map(registry.defined);

    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(define).not.toHaveBeenCalled();
    NAMES.forEach((name) => expect(registry.defined.get(name)).toBe(before.get(name)));
  });

  it("lässt einen fremden Eintrag in der neuen Registry unangetastet", async () => {
    useRegistry(fakeRegistry());
    await import(CARD);

    const late = fakeRegistry();
    const foreign = class {};
    late.define("ortsnetz-map-card", foreign);
    useRegistry(late);
    await vi.advanceTimersByTimeAsync(10_000);
    expect(late.defined.get("ortsnetz-map-card")).toBe(foreign);
    expect(late.defined.has("ortsnetz-map-card-editor")).toBe(true);
  });

  it("verträgt eine Registry, die define ablehnt", async () => {
    const registry = fakeRegistry();
    registry.define = () => { throw new Error("already used"); };
    useRegistry(registry);
    await expect(import(CARD)).resolves.toBeDefined();
    await vi.advanceTimersByTimeAsync(30_000);
  });

  it("belastet nicht: im Dauerbetrieb genau ein Durchlauf alle 10 s", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);
    await vi.advanceTimersByTimeAsync(60_000); // Start (500 ms) ist vorbei
    const get = vi.spyOn(registry, "get");

    await vi.advanceTimersByTimeAsync(60_000);
    // 6 Durchläufe in 60 s, je zwei Namen
    expect(get).toHaveBeenCalledTimes(12);
  });
});
