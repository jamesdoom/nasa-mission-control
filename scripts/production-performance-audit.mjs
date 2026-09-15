import { maximumLayoutShiftSession } from "./lib/layout-shift.mjs";
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
const observationMs = 6000;
const budgets = {
  ttfbMs: 1_500,
  fcpMs: 3_000,
  headingReadyMs: 5_000,
  cls: 0.1,
  sameOriginTransferKb: 1_200,
};
const scenarios = [
  { name: "dashboard-desktop", pathname: "/", width: 1440, height: 900 },
  { name: "dashboard-mobile", pathname: "/", width: 390, height: 844 },
  { name: "apod-mobile", pathname: "/apod", width: 390, height: 844 },
  { name: "about-desktop", pathname: "/about", width: 1440, height: 900 },
  {
    name: "mission-archive-desktop",
    pathname: "/missions",
    width: 1440,
    height: 900,
  },
  {
    name: "mission-archive-mobile",
    pathname: "/missions",
    width: 390,
    height: 844,
  },
  {
    name: "mission-detail-desktop",
    pathname: "/missions/artemis-i",
    width: 1440,
    height: 900,
  },
];

if (baseUrl.protocol !== "https:")
  throw new Error("Production audits require an HTTPS URL.");

function round(value) {
  return value === null ? null : Math.round(value * 10) / 10;
}

function scopeForUrl(url) {
  if (!url) return "unscoped";
  try {
    return new URL(url).origin === baseUrl.origin
      ? "same-origin"
      : "third-party";
  } catch {
    return "unscoped";
  }
}

function enforce(result) {
  const failures = [];
  if (result.status !== 200)
    failures.push(`HTTP status ${String(result.status)}`);
  if (result.consoleErrors.length > 0) failures.push("browser console errors");
  if (result.pageErrors.length > 0) failures.push("uncaught page errors");
  if (result.sameOriginResourceErrors.length > 0)
    failures.push("same-origin HTTP resource errors");
  if (result.failedSameOriginResources.length > 0)
    failures.push("failed same-origin resources");
  if (result.contentReadiness.loadingPanels > 0)
    failures.push("content still loading at observation cutoff");
  if (result.horizontalOverflow) failures.push("horizontal overflow");
  if (result.metrics.ttfbMs > budgets.ttfbMs) failures.push("TTFB budget");
  if (result.metrics.fcpMs !== null && result.metrics.fcpMs > budgets.fcpMs)
    failures.push("FCP budget");
  if (result.metrics.headingReadyMs > budgets.headingReadyMs)
    failures.push("heading-ready budget");
  if (result.metrics.cls > budgets.cls) failures.push("CLS budget");
  if (result.resources.sameOriginTransferKb > budgets.sameOriginTransferKb)
    failures.push("same-origin transfer budget");
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
    const consoleDiagnostics = [];
    const pageErrors = [];
    const failedSameOriginResources = [];
    const sameOriginResourceErrors = [];
    const thirdPartyResourceErrors = [];
    page.on("console", (message) => {
      if (message.type() !== "error") return;
      const sourceUrl = message.location().url || null;
      const scope = scopeForUrl(sourceUrl);
      const diagnostic = { text: message.text(), sourceUrl, scope };
      consoleDiagnostics.push(diagnostic);
      if (scope === "same-origin") consoleErrors.push(diagnostic);
    });
    page.on("pageerror", (error) => pageErrors.push(error.message));
    page.on("response", (response) => {
      if (response.status() < 400) return;
      const resourceError = { url: response.url(), status: response.status() };
      if (new URL(response.url()).origin === baseUrl.origin)
        sameOriginResourceErrors.push(resourceError);
      else thirdPartyResourceErrors.push(resourceError);
    });
    page.on("requestfailed", (request) => {
      if (new URL(request.url()).origin === baseUrl.origin)
        failedSameOriginResources.push(request.url());
    });
    await page.addInitScript(() => {
      window.__missionControlVitals = { shifts: [], lcp: null };
      new PerformanceObserver((entries) => {
        const last = entries.getEntries().at(-1);
        if (last) window.__missionControlVitals.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((entries) => {
        for (const entry of entries.getEntries()) {
          if (!("hadRecentInput" in entry) || !entry.hadRecentInput)
            window.__missionControlVitals.shifts.push({
              startTime: entry.startTime,
              value: entry.value,
            });
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
    await page.waitForTimeout(observationMs);
    const observed = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const paint = performance.getEntriesByName("first-contentful-paint")[0];
      const sameOriginResources = performance
        .getEntriesByType("resource")
        .filter(
          (entry) => new URL(entry.name).origin === window.location.origin,
        );
      return {
        connectionAndResponseMs: navigation?.responseStart ?? 0,
        ttfbMs:
          navigation === undefined
            ? 0
            : navigation.responseStart - navigation.requestStart,
        domContentLoadedMs: navigation?.domContentLoadedEventEnd ?? 0,
        fcpMs: paint?.startTime ?? null,
        shifts: window.__missionControlVitals.shifts,
        pendingImages: [...document.images].filter(
          (image) => image.currentSrc && !image.complete,
        ).length,
        brokenImages: [...document.images].filter(
          (image) =>
            image.currentSrc && image.complete && image.naturalWidth === 0,
        ).length,
        deferredImages: [...document.images].filter(
          (image) => !image.currentSrc,
        ).length,
        loadingPanels: document.querySelectorAll(".state-panel--loading")
          .length,
        lcpMs: window.__missionControlVitals.lcp,
        horizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
        sameOriginTransferKb:
          sameOriginResources.reduce(
            (total, entry) => total + entry.encodedBodySize,
            navigation?.encodedBodySize ?? 0,
          ) / 1024,
        sameOriginResourceCount: sameOriginResources.length + 1,
        scriptCount: sameOriginResources.filter(
          (entry) => entry.initiatorType === "script",
        ).length,
        imageCount: sameOriginResources.filter(
          (entry) => entry.initiatorType === "img",
        ).length,
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
        cls: maximumLayoutShiftSession(observed.shifts),
        headingReadyMs: round(headingReadyMs),
      },
      contentReadiness: {
        deferredImages: observed.deferredImages,
        pendingImages: observed.pendingImages,
        brokenImages: observed.brokenImages,
        loadingPanels: observed.loadingPanels,
      },
      horizontalOverflow: observed.horizontalOverflow,
      resources: {
        sameOriginTransferKb: round(observed.sameOriginTransferKb),
        sameOriginResourceCount: observed.sameOriginResourceCount,
        scriptCount: observed.scriptCount,
        imageCount: observed.imageCount,
      },
      consoleErrors,
      consoleDiagnostics,
      pageErrors,
      sameOriginResourceErrors,
      thirdPartyResourceErrors,
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
  observationMs,
  measurementScope:
    "Fresh browser contexts; reduced motion; no CPU/network throttling. LCP is provisional within the observation window, not real-user Core Web Vitals.",
  budgets,
  results,
};
await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report));
if (report.status !== "ok") process.exitCode = 1;
