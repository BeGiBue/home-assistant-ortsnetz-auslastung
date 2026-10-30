// Regression für Issue #22: Home Assistant 2026.10 ersetzt window.customElements durch ein
// Polyfill mit eigener Registry. Die Card muss sich danach in der neuen Registry anmelden.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const CARD = "../custom_components/ortsnetz_map/www/ortsnetz-map-card.js";
const NAMES = ["ortsnetz-map-card", "ortsnetz-map-card-editor"];

function fakeRegistry() {
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
      return new Promise((resolve) => {
        waiting.set(name, [...(waiting.get(name) || []), resolve]);
      });
    },
  };
}

const original = Object.getOwnPropertyDescriptor(window, "customElements");

function useRegistry(registry) {
  Object.defineProperty(window, "customElements", { value: registry, configurable: true, writable: true });
}

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
    NAMES.forEach((name) => expect(registry.defined.has(name)).toBe(true));
  });

  it("meldet die Card nachträglich in der neuen Registry an, wenn das Frontend sie austauscht", async () => {
    const oldRegistry = fakeRegistry();
    useRegistry(oldRegistry);
    await import(CARD);
    NAMES.forEach((name) => expect(oldRegistry.defined.has(name)).toBe(true));

    // Das Frontend setzt sein Polyfill ein; die Card steht dort noch nicht.
    const newRegistry = fakeRegistry();
    useRegistry(newRegistry);
    expect(newRegistry.defined.size).toBe(0);

    await vi.advanceTimersByTimeAsync(600);
    NAMES.forEach((name) => expect(newRegistry.defined.has(name)).toBe(true));
    // Dieselben Klassen wie in der alten Registry, keine zweite Variante.
    NAMES.forEach((name) => expect(newRegistry.defined.get(name)).toBe(oldRegistry.defined.get(name)));
  });

  it("meldet nach whenDefined('home-assistant') an, ohne auf den Timer zu warten", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);

    registry.defined.clear(); // Registry wurde zurückgesetzt, die Card fehlt
    registry.define("home-assistant", class {});
    await Promise.resolve();
    await Promise.resolve();
    NAMES.forEach((name) => expect(registry.defined.has(name)).toBe(true));
  });

  it("überschreibt vorhandene Einträge nicht und wirft nicht bei mehrfachem Aufruf", async () => {
    const registry = fakeRegistry();
    useRegistry(registry);
    await import(CARD);
    const define = vi.spyOn(registry, "define");
    const before = new Map(registry.defined);

    await vi.advanceTimersByTimeAsync(30000);
    expect(define).not.toHaveBeenCalled();
    NAMES.forEach((name) => expect(registry.defined.get(name)).toBe(before.get(name)));
  });

  it("verträgt eine Registry, die define ablehnt", async () => {
    const registry = fakeRegistry();
    registry.define = () => { throw new Error("already used"); };
    useRegistry(registry);
    await expect(import(CARD)).resolves.toBeDefined();
    await vi.advanceTimersByTimeAsync(1000);
  });
});
