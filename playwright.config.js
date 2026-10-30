// Browser-Tests der Card (Chromium und WebKit, Firefox nur für den Registry-Test),
// ohne Netz: Karte, Stil und Daten liefert tests_browser/harness.js über page.route aus.
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "tests_browser",
  timeout: 120_000,
  retries: 0,
  reporter: process.env.CI ? [["list"], ["github"]] : "list",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    // Firefox prüft nur, ob sich die Card in der von Home Assistant ersetzten
    // customElements-Registry anmeldet (Issue #22). Die Karten-Tests laufen dort nicht.
    { name: "firefox", use: { ...devices["Desktop Firefox"] }, testMatch: /registry\.spec\.js/ },
  ],
});
