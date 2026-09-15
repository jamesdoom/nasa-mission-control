import { preview } from "vite";
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const output = process.argv[2] ?? "artifacts/page-composition";
await mkdir(output, { recursive: true });
const server = await preview({
  root: "apps/client",
  configFile: false,
  preview: { port: 5175, host: "127.0.0.1" },
});
const browser = await chromium.launch();
try {
  const results = [];
  for (const width of [1440, 390]) {
    for (const route of [
      "apod",
      "missions",
      "favorites",
      "trivia",
      "earth",
      "media",
      "space-weather",
      "asteroids",
    ]) {
      const page = await browser.newPage({
        viewport: { width, height: 1000 },
        serviceWorkers: "block",
        reducedMotion: "reduce",
      });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.route("**/api/**", (request) =>
        request.fulfill({
          status: 503,
          json: {
            error: {
              code: "UPSTREAM_UNAVAILABLE",
              message: "Controlled unavailable-state layout fixture.",
              retryable: false,
            },
          },
        }),
      );
      await page.goto(`http://127.0.0.1:5175/${route}`);
      await page.locator("h1").waitFor();
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(200);
      await page.screenshot({ path: `${output}/${route}-${width}.png` });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      );
      results.push({ route, width, overflow, errors });
      await page.close();
    }
  }
  await writeFile(`${output}/results.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results));
  if (results.some((result) => result.overflow || result.errors.length))
    process.exitCode = 1;
} finally {
  await browser.close();
  await server.httpServer.close();
}
