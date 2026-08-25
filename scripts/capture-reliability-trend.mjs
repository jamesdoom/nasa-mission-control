import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  buildReliabilityHistory,
  reliabilityMarkdown,
} from "./lib/reliability-trends.mjs";

const baseUrl = new URL(
  process.env.PRODUCTION_URL ?? "https://nasa-mission-control-alpha.vercel.app",
);
const previousPath = path.resolve(
  process.env.RELIABILITY_PREVIOUS ??
    "artifacts/previous/reliability-history.json",
);
const outputPath = path.resolve(
  process.env.RELIABILITY_REPORT ?? "artifacts/reliability-history.json",
);
const summaryPath = path.resolve(
  process.env.RELIABILITY_SUMMARY ?? "artifacts/reliability-summary.md",
);
if (baseUrl.protocol !== "https:")
  throw new Error("Reliability trend capture requires HTTPS.");

const routeDefinitions = [
  ["apod", "/api/apod?date=2024-01-01"],
  ["asteroids", "/api/asteroids?startDate=2026-07-29&endDate=2026-07-29"],
  [
    "space-weather",
    "/api/space-weather?startDate=2024-05-10&endDate=2024-05-11&category=all",
  ],
  ["earth", "/api/earth?date=2026-08-24&collection=natural"],
  ["media", "/api/media/search?q=apollo&mediaType=image&page=1"],
];

async function request(name, pathname) {
  const startedAt = performance.now();
  try {
    const response = await fetch(new URL(pathname, baseUrl), {
      headers: {
        accept: "application/json",
        "user-agent": "nasa-mission-control-reliability-trend/1.0",
      },
      signal: AbortSignal.timeout(12_000),
    });
    const body = await response.json();
    return {
      name,
      passed:
        response.ok &&
        body !== null &&
        typeof body === "object" &&
        !Array.isArray(body),
      status: response.status,
      durationMs: Math.round(performance.now() - startedAt),
      originCache: response.headers.get("x-cache"),
      edgeCache: response.headers.get("x-vercel-cache"),
      dataStatus: response.headers.get("x-data-status"),
      error: null,
    };
  } catch (error) {
    return {
      name,
      passed: false,
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      originCache: null,
      edgeCache: null,
      dataStatus: null,
      error: error instanceof Error ? error.message : "UnknownError",
    };
  }
}

const routes = [];
for (const [name, pathname] of routeDefinitions) {
  routes.push(await request(name, pathname));
  routes.push(await request(name, pathname));
}
let processSnapshot = null;
try {
  const response = await fetch(new URL("/api/health/reliability", baseUrl), {
    headers: { "user-agent": "nasa-mission-control-reliability-trend/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (response.ok) processSnapshot = await response.json();
} catch {
  // Route evidence remains useful when a serverless process snapshot is absent.
}

let previous = null;
try {
  previous = JSON.parse(await readFile(previousPath, "utf8"));
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}
const history = buildReliabilityHistory(previous, {
  checkedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  routes,
  processSnapshot,
});
await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(path.dirname(summaryPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
await writeFile(summaryPath, reliabilityMarkdown(history), "utf8");
console.log(
  JSON.stringify({
    status: history.summary.alerts.length === 0 ? "ok" : "alert",
    outputPath,
    summary: history.summary,
  }),
);
if (history.summary.alerts.length > 0) process.exitCode = 1;
