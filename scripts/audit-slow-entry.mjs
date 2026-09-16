import { preview } from "vite";
import assert from "node:assert/strict";
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { maximumLayoutShiftSession } from "./lib/layout-shift.mjs";

const local = process.argv.includes("--local");
const server = local
  ? await preview({
      root: "apps/client",
      configFile: false,
      preview: { host: "127.0.0.1", port: 5175 },
    })
  : null;
const base = local
  ? "http://127.0.0.1:5175"
  : "https://nasa-mission-control-alpha.vercel.app";
const browser = await chromium.launch();
const results = [];
try {
  for (const scenario of local
    ? [{ path: "/", fail: true }]
    : [
        { path: "/", fail: false },
        { path: "/apod?date=2024-01-01", fail: false },
        { path: "/", fail: true },
      ]) {
    const page = await browser.newPage({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 2,
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: 200000,
      uploadThroughput: 93750,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
    if (scenario.fail)
      await page.route("**/api/**", (route) =>
        route.fulfill({
          status: 503,
          json: {
            error: {
              code: "UPSTREAM_UNAVAILABLE",
              message: "Simulated NASA unavailability",
              retryable: false,
            },
          },
        }),
      );
    await page.addInitScript(() => {
      window.entryVitals = { lcp: null, shifts: [] };
      new PerformanceObserver((list) => {
        window.entryVitals.lcp = list.getEntries().at(-1)?.startTime ?? null;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput)
            window.entryVitals.shifts.push({
              startTime: entry.startTime,
              value: entry.value,
            });
      }).observe({ type: "layout-shift", buffered: true });
    });
    const response = await page.goto(base + scenario.path, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    await page.locator("h1").waitFor();
    await page.waitForTimeout(12000);
    const vitals = await page.evaluate(() => ({
      ...window.entryVitals,
      pendingImages: [...document.images].filter(
        (image) => image.currentSrc && !image.complete,
      ).length,
      loading: document.querySelectorAll(".state-panel--loading").length,
    }));
    await page.screenshot({
      path: `artifacts/entry-${local ? "local" : "live"}-${scenario.fail ? "failure" : scenario.path === "/" ? "home" : "apod"}.png`,
    });
    let curatedReachable = null;
    if (scenario.fail) {
      await page
        .getByRole("link", { name: /Follow a landmark mission/ })
        .click();
      await page
        .getByRole("heading", { name: "Mission Archive", exact: true })
        .waitFor();
      curatedReachable = await page
        .getByRole("heading", { name: "Apollo 11", exact: true })
        .isVisible();
    }
    results.push({
      ...scenario,
      status: response?.status(),
      lcpMs: vitals.lcp,
      cls: maximumLayoutShiftSession(vitals.shifts),
      pendingImages: vitals.pendingImages,
      loading: vitals.loading,
      curatedReachable,
    });
    await page.close();
  }
  await writeFile(
    local ? "artifacts/slow-entry-local.json" : "artifacts/slow-entry.json",
    JSON.stringify(
      {
        checkedAt: new Date().toISOString(),
        base,
        scope:
          "Lab only: 390px DPR2, 150ms latency, 1.6Mbps download, 4x CPU slowdown, fresh contexts, reduced motion, 12s observation after heading. No field INP measurement.",
        results,
      },
      null,
      2,
    ),
  );
  console.log(JSON.stringify(results));
  for (const result of results) {
    assert.equal(result.status, 200, "Entry page must load");
    assert.equal(
      result.loading,
      0,
      "Loading must settle within the observation window",
    );
    if (result.fail)
      assert.equal(
        result.curatedReachable,
        true,
        "Curated missions must remain reachable during API failure",
      );
    if (local)
      assert.ok(
        result.cls <= 0.1,
        "Failure layout must stay within the CLS budget",
      );
  }
} finally {
  await browser.close();
  await server?.close();
}
