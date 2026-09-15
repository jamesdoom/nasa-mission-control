import { preview } from "vite";
import { chromium } from "@playwright/test";
import { stat, writeFile } from "node:fs/promises";

const output = process.argv[2] ?? "artifacts/apod-delivery.json";
const standard = "/assets/missions/cards/curiosity.jpg";
const hd = "/assets/missions/curiosity.jpg";
const server = await preview({
  root: "apps/client",
  configFile: false,
  preview: { port: 5175, host: "127.0.0.1" },
});
const browser = await chromium.launch();
try {
  const results = [];
  for (const width of [430, 1440]) {
    const page = await browser.newPage({
      viewport: { width, height: 932 },
      deviceScaleFactor: width === 430 ? 3 : 2,
      serviceWorkers: "block",
      reducedMotion: "reduce",
    });
    const requests = [];
    page.on("request", (request) => {
      const path = new URL(request.url()).pathname;
      if (path === standard || path === hd) requests.push(path);
    });
    await page.route("**/api/apod**", (route) =>
      route.fulfill({
        json: {
          date: "2024-01-01",
          title: "Curiosity image delivery fixture",
          explanation:
            "Controlled local imagery for checking preview downloads.",
          mediaType: "image",
          mediaUrl: standard,
          hdUrl: hd,
          thumbnailUrl: null,
          copyright: null,
        },
      }),
    );
    await page.goto("http://127.0.0.1:5175/apod");
    const picture = page.locator(".apod-image");
    await picture.waitFor();
    await picture.evaluate((img) => img.decode());
    await page.screenshot({ path: output.replace(".json", `-${width}.png`) });
    results.push({
      width,
      deviceScaleFactor: width === 430 ? 3 : 2,
      selected: await picture.evaluate(
        (img) => new URL(img.currentSrc).pathname,
      ),
      requests,
      imageFileBytes: (
        await Promise.all(
          requests.map(
            async (path) => (await stat(`apps/client/public${path}`)).size,
          ),
        )
      ).reduce((a, b) => a + b, 0),
      hdLink: await page
        .getByRole("link", { name: /Open high-resolution image/ })
        .getAttribute("href"),
    });
    await page.close();
  }
  await writeFile(output, JSON.stringify(results, null, 2) + "\n");
  console.log(JSON.stringify(results));
} finally {
  await browser.close();
  await server.httpServer.close();
}
