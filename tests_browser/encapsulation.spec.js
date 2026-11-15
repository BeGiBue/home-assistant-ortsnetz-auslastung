// Die Card kapselt ihr Markup und ihre Styles in einem eigenen Shadow-Root. In Home
// Assistant liegt sie mit anderen Karten im Shadow-Root der Section: Ihre Regeln (:host,
// ha-card, Klassen wie .legend-row) dürfen dort nichts treffen, und fremde Regeln dürfen
// Karte, Legende und Popup nicht verändern.
import { expect, test } from "@playwright/test";
import { openCard } from "./harness.js";

test("Styles der Card bleiben in ihrem Shadow-Root, fremde Styles wirken nicht hinein", async ({ page }) => {
  await openCard(page, { size: { width: 900, height: 650 }, config: { latitude: 51.0, longitude: 10.0, zoom: 6 } });
  const state = await page.evaluate(() => {
    const card = window.__card;
    const section = card.getRootNode();
    // Nachbarkarte ohne eigenen Shadow-Root, mit denselben Namen wie in der Card.
    const other = document.createElement("ha-card");
    other.className = "legend-row popup-title ortsnetz-wrap";
    other.textContent = "Nachbar";
    section.appendChild(other);
    // Fremde Regeln in der Section, die auf Namen der Card zielen.
    const foreign = document.createElement("style");
    foreign.textContent = ".ortsnetz-legend, .ortsnetz-map { display:none !important } ha-card { border:7px solid red }";
    section.appendChild(foreign);

    const style = (element) => getComputedStyle(element);
    const inner = (selector) => card.shadowRoot.querySelector(selector);
    return {
      lightDomChildren: card.childElementCount,
      neighbour: {
        display: style(other).display,
        overflow: style(other).overflow,
        position: style(other).position,
        fontWeight: style(other).fontWeight,
      },
      host: { display: style(card).display, height: Math.round(card.getBoundingClientRect().height) },
      legendDisplay: style(inner(".ortsnetz-legend")).display,
      mapDisplay: style(inner(".ortsnetz-map")).display,
      cardBorder: style(inner("ha-card")).borderTopWidth,
      mapHeight: Math.round(inner(".ortsnetz-map").getBoundingClientRect().height),
    };
  });

  expect(state.lightDomChildren).toBe(0);
  // Unverändert wie ein unbekanntes Element: nichts von ha-card{display:block;overflow:hidden},
  // .ortsnetz-wrap{position:relative} oder .popup-title{font-weight:700}.
  expect(state.neighbour).toEqual({ display: "inline", overflow: "visible", position: "static", fontWeight: "400" });
  // :host der Card wirkt jetzt auf die Card selbst.
  expect(state.host).toEqual({ display: "block", height: 650 });
  expect(state.legendDisplay).not.toBe("none");
  expect(state.mapDisplay).not.toBe("none");
  expect(state.cardBorder).toBe("0px");
  expect(state.mapHeight).toBe(650);
});
