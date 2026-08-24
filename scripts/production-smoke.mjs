import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const defaultUrl = "https://nasa-mission-control-alpha.vercel.app";
const baseUrl = new URL(
  process.env.PRODUCTION_URL ?? process.argv[2] ?? defaultUrl,
);
const outputPath = path.resolve(
  process.env.SMOKE_REPORT ?? "artifacts/production-smoke.json",
);
const thresholds = {
  attempts: 2,
  requestTimeoutMs: 10_000,
  healthLatencyMs: 1_500,
  apiLatencyMs: 5_000,
  pageLatencyMs: 3_000,
};

if (baseUrl.protocol !== "https:")
  throw new Error("Production and preview smoke checks require HTTPS.");

const checks = [
  {
    name: "api-health",
    pathname: "/api/health",
    expectedStatus: 200,
    maxLatencyMs: thresholds.healthLatencyMs,
    validate: (body, headers) =>
      body?.status === "ok" &&
      body?.service === "mission-control-api" &&
      !Number.isNaN(Date.parse(body?.checkedAt)) &&
      headers.get("cache-control")?.includes("no-store"),
  },
  {
    name: "apod-archive",
    pathname: "/api/apod?date=2024-01-01",
    expectedStatus: 200,
    maxLatencyMs: thresholds.apiLatencyMs,
    validate: (body, headers) =>
      body?.date === "2024-01-01" &&
      typeof body?.title === "string" &&
      headers.get("cache-control")?.includes("public") &&
      ["HIT", "MISS"].includes(headers.get("x-cache") ?? ""),
  },
  {
    name: "media-search",
    pathname: "/api/media/search?q=apollo&mediaType=image&page=1",
    expectedStatus: 200,
    maxLatencyMs: thresholds.apiLatencyMs,
    validate: (body, headers) =>
      body?.query === "apollo" &&
      Array.isArray(body?.items) &&
      headers.get("cache-control")?.includes("public"),
  },
  {
    name: "api-validation",
    pathname: "/api/asteroids?startDate=not-a-date",
    expectedStatus: 400,
    maxLatencyMs: thresholds.healthLatencyMs,
    validate: (body, headers) =>
      body?.error?.code === "INVALID_REQUEST" &&
      typeof body?.error?.requestId === "string" &&
      headers.get("cache-control")?.includes("no-store"),
  },
  ...["/", "/missions/artemis-i", "/favorites", "/about"].map((pathname) => ({
    name: `spa-${pathname === "/" ? "dashboard" : pathname.slice(1).replaceAll("/", "-")}`,
    pathname,
    expectedStatus: 200,
    maxLatencyMs: thresholds.pageLatencyMs,
    html: true,
    validate: (body) => body.includes('<div id="root"></div>'),
  })),
];

async function runAttempt(check) {
  const startedAt = performance.now();
  try {
    const response = await fetch(new URL(check.pathname, baseUrl), {
      headers: {
        accept: check.html ? "text/html" : "application/json",
        "user-agent": "nasa-mission-control-production-smoke/2.0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(thresholds.requestTimeoutMs),
    });
    const durationMs = Math.round(performance.now() - startedAt);
    const body = check.html ? await response.text() : await response.json();
    const contractValid = check.validate(body, response.headers);
    return {
      passed:
        response.status === check.expectedStatus &&
        durationMs <= check.maxLatencyMs &&
        contractValid,
      status: response.status,
      durationMs,
      contractValid,
      originCache: response.headers.get("x-cache"),
      edgeCache: response.headers.get("x-vercel-cache"),
      error: null,
    };
  } catch (error) {
    const cause =
      error instanceof Error &&
      error.cause &&
      typeof error.cause === "object" &&
      "code" in error.cause &&
      typeof error.cause.code === "string"
        ? error.cause.code
        : null;
    return {
      passed: false,
      status: 0,
      durationMs: Math.round(performance.now() - startedAt),
      contractValid: false,
      originCache: null,
      edgeCache: null,
      error: error instanceof Error ? error.message : "Unknown error",
      errorCode: cause,
    };
  }
}

const results = [];
for (const check of checks) {
  const attempts = [];
  for (let index = 0; index < thresholds.attempts; index += 1) {
    const attempt = await runAttempt(check);
    attempts.push(attempt);
    if (attempt.passed) break;
  }
  results.push({
    name: check.name,
    pathname: check.pathname,
    expectedStatus: check.expectedStatus,
    maxLatencyMs: check.maxLatencyMs,
    passed: attempts.some((attempt) => attempt.passed),
    attempts,
  });
}

const allAttempts = results.flatMap((result) => result.attempts);
const originCacheSamples = allAttempts.filter(
  (attempt) => attempt.originCache !== null,
);
const edgeCacheSamples = allAttempts.filter(
  (attempt) => attempt.edgeCache !== null,
);
const report = {
  status: results.every((result) => result.passed) ? "ok" : "failed",
  checkedAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  thresholds,
  cache: {
    originSamples: originCacheSamples.length,
    originHits: originCacheSamples.filter(
      (attempt) => attempt.originCache === "HIT",
    ).length,
    edgeSamples: edgeCacheSamples.length,
    edgeHits: edgeCacheSamples.filter((attempt) => attempt.edgeCache === "HIT")
      .length,
  },
  results,
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(JSON.stringify(report));
if (report.status !== "ok") process.exitCode = 1;
