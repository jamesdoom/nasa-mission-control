import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const defaultUrl = "https://nasa-mission-control-alpha.vercel.app";
const baseUrl = new URL(
  process.env.PRODUCTION_URL ?? process.argv[2] ?? defaultUrl,
);
const outputPath = path.resolve(
  process.env.JOURNEY_REPORT ?? "artifacts/production-journeys.json",
);
const diagnosticDirectory = path.dirname(outputPath);
if (baseUrl.protocol !== "https:")
  throw new Error("Production journey checks require HTTPS.");

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  reducedMotion: "reduce",
});
await context.addInitScript(() => {
  localStorage.setItem(
    "mission-control:mission-favorites:v1",
    JSON.stringify(["apollo-11"]),
  );
  if (!localStorage.getItem("mission-control:flight-log-personalization:v1")) {
    localStorage.setItem(
      "mission-control:flight-log-personalization:v1",
      JSON.stringify({
        version: 1,
        annotations: {
          "mission:apollo-11": {
            note: "Release continuity check",
            tags: ["release"],
            collection: "Operations",
            updatedAt: "2026-01-01T00:00:00.000Z",
          },
        },
        savedViews: [],
        comparisonBookmarks: [
          {
            id: "release-comparison",
            name: "Release comparison",
            path: "/missions/compare?missions=apollo-11,artemis-i",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      }),
    );
  }
});

const page = await context.newPage();
const failures = [];
const steps = [];
page.on("pageerror", (error) => failures.push(`page: ${error.message}`));
page.on("console", (message) => {
  if (
    message.type() === "error" &&
    message.location().url.startsWith(baseUrl.origin)
  )
    failures.push(`console: ${message.text()}`);
});

async function step(name, action) {
  const startedAt = performance.now();
  const attempts = [];
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const attemptStartedAt = performance.now();
    try {
      await action();
      attempts.push({
        attempt,
        status: "ok",
        durationMs: Math.round(performance.now() - attemptStartedAt),
      });
      steps.push({
        name,
        status: "ok",
        durationMs: Math.round(performance.now() - startedAt),
        attempts,
      });
      return;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message.split("\n").slice(0, 4).join(" | ")
          : "UnknownError";
      attempts.push({
        attempt,
        status: "failed",
        durationMs: Math.round(performance.now() - attemptStartedAt),
        error: message,
        url: page.url(),
      });
      if (attempt === 1) continue;

      await mkdir(diagnosticDirectory, { recursive: true });
      const screenshot = path.join(
        diagnosticDirectory,
        `production-journey-${name}.png`,
      );
      let screenshotName = null;
      let screenshotError = null;
      try {
        await page.screenshot({ path: screenshot, fullPage: true });
        screenshotName = path.basename(screenshot);
      } catch (error) {
        screenshotError =
          error instanceof Error
            ? error.message.split("\n")[0]
            : "UnknownError";
      }
      failures.push(`${name}: ${message}`);
      steps.push({
        name,
        status: "failed",
        durationMs: Math.round(performance.now() - startedAt),
        error: message,
        screenshot: screenshotName,
        screenshotError,
        attempts,
      });
    }
  }
}

await step("curated-mission-route", async () => {
  const response = await page.goto(
    new URL("/missions/artemis-i", baseUrl).href,
    {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    },
  );
  if (response?.status() !== 200)
    throw new Error(`HTTP ${String(response?.status())}`);
  await page.getByRole("heading", { name: "Artemis I" }).waitFor();
});

await step("flight-log-local-continuity", async () => {
  await page.goto(new URL("/favorites", baseUrl).href, {
    waitUntil: "domcontentloaded",
    timeout: 15_000,
  });
  const missionRecord = page.locator(".flight-log-saved-card").filter({
    has: page.getByRole("heading", { name: "Apollo 11" }),
  });
  await missionRecord.waitFor({ timeout: 10_000 });
  await missionRecord
    .locator("summary")
    .filter({ hasText: /^Edit personal details$/ })
    .click({ timeout: 10_000 });
  await page
    .locator(".record-personalization__summary p")
    .filter({ hasText: "Release continuity check" })
    .waitFor();
  await page.getByLabel("View name").fill("Release view");
  await page.getByRole("button", { name: "Save current view" }).click();
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByRole("link", { name: "Release view" }).waitFor();
});

await step("comparison-bookmark-continuity", async () => {
  await page.goto(
    new URL("/missions/compare?missions=apollo-11,artemis-i", baseUrl).href,
    { waitUntil: "domcontentloaded" },
  );
  await page
    .getByRole("link", { name: "Release comparison" })
    .waitFor({ timeout: 10_000 });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page
    .getByRole("link", { name: "Release comparison" })
    .waitFor({ timeout: 10_000 });
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth >
      document.documentElement.clientWidth,
  );
  if (overflow) throw new Error("390px layout has horizontal overflow");
});

await browser.close();
const report = {
  status:
    failures.length === 0 && steps.every((item) => item.status === "ok")
      ? "ok"
      : "failed",
  checkedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  scope: "read-only server checks with browser-local continuity writes only",
  steps,
  failures,
};
await mkdir(diagnosticDirectory, { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report));
if (report.status !== "ok") process.exitCode = 1;
