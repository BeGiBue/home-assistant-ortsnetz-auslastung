// Exercise the actual vendored dependency, including its attribution sanitizer.
import { describe, expect, it } from "vitest";
import { AttributionControl, getVersion } from "../custom_components/ortsnetz_map/www/maplibre/6.4.1/maplibre-gl.mjs";

describe("MapLibre CVE-2026-85061", () => {
  it("entfernt alle benachbarten gefährlichen Attribute aus fremden Quellenangaben", () => {
    expect(getVersion()).toBe("6.4.1");
    const payload = '<details open onload="1" ontoggle="window.__injected=1">Quelle</details>' +
      '<a onclick="1" href="javascript:alert(1)" onfocus="1">Link</a>';
    const control = new AttributionControl({ compact: true });
    const map = {
      on() {},
      off() {},
      _getUIString: () => "Quellenangabe",
      getCanvasContainer: () => document.createElement("div"),
      style: {
        stylesheet: {},
        tileManagers: { external: { used: true, getSource: () => ({ attribution: payload }) } },
      },
    };
    const element = control.onAdd(map);
    document.body.appendChild(element);

    expect(element.textContent).toContain("Quelle");
    expect(element.querySelector("[onload], [ontoggle], [onclick], [onfocus], [href]")).toBeNull();
    expect(window.__injected).toBeUndefined();
    control.onRemove();
  });
});
