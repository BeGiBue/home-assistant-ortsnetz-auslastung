// Ansicht hell/dunkel/automatisch (Option theme im Editor).
import { expect, test } from "@playwright/test";
import { openCard, waitIdle } from "./harness.js";

const bgColor = (page) => page.evaluate(() => window.__card._map.getStyle().layers.find((l) => l.type === "background")?.paint?.["background-color"]);
const legendBg = (page) => page.evaluate(() => getComputedStyle(window.__card.shadowRoot.querySelector(".ortsnetz-legend")).backgroundColor);

test("feste dunkle Ansicht bei hellem Home-Assistant-Theme, Wechsel im Editor", async ({ page }, info) => {
  await openCard(page, { size: { width: 700, height: 450 }, config: { latitude: 52.52, longitude: 13.4, zoom: 9, theme: "dark" } });
  await waitIdle(page);
  expect(await bgColor(page)).toBe("#333");
  const dark = await legendBg(page);
  await page.screenshot({ path: info.outputPath("dark.png") });

  // Theme-Wechsel in HA ändert die feste Ansicht nicht.
  await page.evaluate(() => { window.__card.hass = { ...window.__card._hass, themes: { darkMode: false } }; });
  await waitIdle(page);
  expect(await bgColor(page)).toBe("#333");

  // Editor: zurück auf automatisch → helles Theme.
  await page.evaluate(() => window.__card.setConfig({ ...window.__card._config, theme: "auto" }));
  await page.waitForFunction(() => window.__card._map.getStyle()?.layers?.every((l) => l.paint?.["background-color"] !== "#333"));
  await waitIdle(page);
  expect(await legendBg(page)).not.toBe(dark);
  await page.screenshot({ path: info.outputPath("auto.png") });
});
