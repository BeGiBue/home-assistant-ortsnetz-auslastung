import { expect, test } from "@playwright/test";
import { openCard, waitIdle } from "./harness.js";

test("CVE-2026-85061: fremde Quellenangaben verlieren benachbarte Event-Handler", async ({ page }) => {
  await openCard(page);
  await page.evaluate(() => {
    const map = window.__card._map;
    map.addSource("untrusted-attribution", {
      type: "geojson",
      attribution: '<details open onload="1" ontoggle="window.__attributionXss=1">Fremde Quelle</details>',
      data: { type: "FeatureCollection", features: [{ type: "Feature", properties: {}, geometry: { type: "Point", coordinates: [10, 51] } }] },
    });
    map.addLayer({ id: "untrusted-attribution", type: "circle", source: "untrusted-attribution" });
  });
  await waitIdle(page);
  const attribution = page.locator(".maplibregl-ctrl-attrib-inner");
  await expect(attribution).toContainText("Fremde Quelle");
  await expect(attribution.locator("[onload], [ontoggle]")).toHaveCount(0);
  expect(await page.evaluate(() => window.__attributionXss)).toBeUndefined();
});
