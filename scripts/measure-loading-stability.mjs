import { preview } from "vite";
import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { maximumLayoutShiftSession } from "./lib/layout-shift.mjs";

const output = process.argv[2] ?? "artifacts/loading-stability.json";
const server = await preview({
  root: "apps/client",
  configFile: false,
  preview: { port: 5175, host: "127.0.0.1" },
});
const browser = await chromium.launch();
try {
  const results = [];
  for (const width of [390, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 900 },
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    await page.addInitScript(() => {
      window.layoutShifts = [];
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          if (!entry.hadRecentInput)
            window.layoutShifts.push({
              startTime: entry.startTime,
              value: entry.value,
            });
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.route("**/*.woff2", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      await route.continue();
    });
    await page.route("**/api/**", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const isApod = new URL(route.request().url()).pathname === "/api/apod";
      await route.fulfill({
        json: isApod
          ? {
              date: "2024-01-01",
              title: "A stable daily image",
              explanation:
                "Deterministic content for a delayed-loading measurement.",
              mediaType: "image",
              mediaUrl: "/assets/missions/curiosity.jpg",
              hdUrl: null,
              thumbnailUrl: null,
              copyright: null,
            }
          : {
              startDate: "2024-01-01",
              endDate: "2024-01-07",
              totalCount: 0,
              potentiallyHazardousCount: 0,
              closestApproachKm: null,
              asteroids: [],
            },
      });
    });
    await page.goto("http://127.0.0.1:5175/");
    await page.locator(".apod-image").waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1000);
    await page.screenshot({ path: output.replace(".json", `-${width}.png`) });
    const shifts = await page.evaluate(() => window.layoutShifts);
    results.push({ width, cls: maximumLayoutShiftSession(shifts), shifts });
    await page.close();
  }
  await writeFile(output, JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
  await server.httpServer.close();
}
