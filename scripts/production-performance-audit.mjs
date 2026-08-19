import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const defaultUrl = "https://nasa-mission-control-alpha.vercel.app";
const baseUrl = new URL(
  process.env.PRODUCTION_URL ?? process.argv[2] ?? defaultUrl,
);
const outputPath = path.resolve(
  process.env.PERFORMANCE_REPORT ?? "artifacts/production-performance.json",
);
const budgets = {
  ttfbMs: 1_500,
  fcpMs: 3_000,
  headingReadyMs: 5_000,
  cls: 0.1,
};
const scenarios = [
  { name: "dashboard-desktop", pathname: "/", width: 1440, height: 900 },
  { name: "dashboard-mobile", pathname: "/", width: 390, height: 844 },
  { name: "about-desktop", pathname: "/about", width: 1440, height: 900 },
];

if (baseUrl.protocol !== "https:")
  throw new Error("Production audits require an HTTPS URL.");

function round(value) {
  return value === null ? null : Math.round(value * 10) / 10;
}

function enforce(result) {
  const failures = [];
  if (result.status !== 200)
    failures.push(`HTTP status ${String(result.status)}`);
  if (result.consoleErrors.length > 0) failures.push("browser console errors");
  if (result.pageErrors.length > 0) failures.push("uncaught page errors");
  if (result.failedSameOriginResources.length > 0)
    failures.push("failed same-origin resources");
  if (result.horizontalOverflow) failures.push("horizontal overflow");
  if (result.metrics.ttfbMs > budgets.ttfbMs) failures.push("TTFB budget");
  if (result.metrics.fcpMs !== null && result.metrics.fcpMs > budgets.fcpMs)
    failures.push("FCP budget");
  if (result.metrics.headingReadyMs > budgets.headingReadyMs)
    failures.push("heading-ready budget");
  if (result.metrics.cls > budgets.cls) failures.push("CLS budget");
  return failures;
}

const browser = await chromium.launch({ headless: true });
const results = [];
try {
  const warmupContext = await browser.newContext();
  const warmupPage = await warmupContext.newPage();
  await warmupPage.goto(new URL("/api/health", baseUrl).href, {
    waitUntil: "domcontentloaded",
    timeout: 20_000,
  });
  await warmupContext.close();

  for (const scenario of scenarios) {
    const context = await browser.newContext({
      viewport: { width: scenario.width, height: scenario.height },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedSameOriginResources = [];
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).origin === baseUrl.origin)
        failedSameOriginResources.push(request.url());
    });
    await page.addInitScript(() => {
      window.__missionControlVitals = { cls: 0, lcp: null };
      new PerformanceObserver((entries) => {
        const last = entries.getEntries().at(-1);
        if (last) window.__missionControlVitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (!("hadRecentInput" in entry) || !entry.hadRecentInput)
            window.__missionControlVitals.cls += entry.value;
        }
      }).observe({ type: "layout-shift", buffered: true });
    });
    const startedAt = performance.now();
    const response = await page.goto(new URL(scenario.pathname, baseUrl).href, {
      waitUntil: "domcontentloaded",
      timeout: 20_000,
    });
    await page.getByRole("heading", { level: 1 }).first().waitFor({
      state: "visible",
      timeout: budgets.headingReadyMs,
    });
    const headingReadyMs = performance.now() - startedAt;
    await page.waitForTimeout(1_500);
    const observed = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByName("first-contentful-paint")[0];
      return {
        connectionAndResponseMs: navigation?.responseStart ?? 0,
        ttfbMs:
          navigation === undefined
            ? 0
            : navigation.responseStart - navigation.requestStart,
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
        fcpMs: paint?.startTime ?? null,
        cls: window.__missionControlVitals.cls,
        lcpMs: window.__missionControlVitals.lcp,
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      };
    });
    const result = {
      name: scenario.name,
      url: page.url(),
      status: response?.status() ?? 0,
      viewport: { width: scenario.width, height: scenario.height },
      metrics: {
        connectionAndResponseMs: round(observed.connectionAndResponseMs),
        ttfbMs: round(observed.ttfbMs),
        domContentLoadedMs: round(observed.domContentLoadedMs),
        fcpMs: round(observed.fcpMs),
        lcpMs: round(observed.lcpMs),
        cls: round(observed.cls),
        headingReadyMs: round(headingReadyMs),
      },
      horizontalOverflow: observed.horizontalOverflow,
      consoleErrors,
      pageErrors,
      failedSameOriginResources,
    };
    results.push({ ...result, failures: enforce(result) });
    await context.close();
  }
} finally {
  await browser.close();
}

const report = {
  status: results.every(({ failures }) => failures.length === 0)
    ? "ok"
    : "failed",
  checkedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  budgets,
  results,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report));
if (report.status !== "ok") process.exitCode = 1;
