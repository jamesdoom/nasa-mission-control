import assert from "node:assert/strict";
import {
  buildReliabilityHistory,
  reliabilityMarkdown,
  summarizeReliability,
} from "./lib/reliability-trends.mjs";

const now = new Date("2026-08-25T12:00:00.000Z");
const route = (passed, durationMs, originCache, dataStatus = "current") => ({
  name: "apod",
  passed,
  status: passed ? 200 : 503,
  durationMs,
  originCache,
  edgeCache: "MISS",
  dataStatus,
  errorCategory: passed ? null : "http_5xx",
  applicationErrorCode: passed ? null : "UPSTREAM_UNAVAILABLE",
  requestId: passed ? null : "reliability-test-request",
});
const processSnapshot = (schemaValidation) => ({
  since: "2026-08-25T10:00:00.000Z",
  scope: "current-process",
  upstreams: {
    "api.nasa.gov": {
      requests: 2,
      successes: 1,
      failures: { schema_validation: schemaValidation },
      circuit: "closed",
    },
  },
  caches: { apod: { hit: 1, miss: 1, stale: 0, hitRatio: 0.5 } },
});
let history = buildReliabilityHistory(
  null,
  {
    checkedAt: "2026-08-25T10:00:00.000Z",
    routes: [route(true, 120, "MISS")],
    processSnapshot: processSnapshot(0),
  },
  now,
);
history = buildReliabilityHistory(
  history,
  {
    checkedAt: "2026-08-25T11:00:00.000Z",
    routes: [route(false, 6_000, "STALE", "stale")],
    processSnapshot: processSnapshot(1),
  },
  now,
);
history = buildReliabilityHistory(
  history,
  {
    checkedAt: "2026-08-25T11:30:00.000Z",
    routes: [
      route(true, 200, "MISS", "stale-fallback"),
      {
        ...route(false, 12_000, null),
        status: 0,
        errorCategory: "timeout",
        applicationErrorCode: null,
        requestId: null,
      },
    ],
    processSnapshot: processSnapshot(1),
  },
  now,
);
assert.equal(history.summary.sampleCount, 3);
assert.equal(history.summary.validationFailures, 1);
assert.equal(history.summary.process.upstreams["api.nasa.gov"].requests, 2);
assert.equal(history.summary.routes.apod.staleFallbacks, 2);
assert.ok(history.summary.alerts.includes("schema_validation=1"));
assert.deepEqual(history.summary.routes.apod.failureCategories, {
  http_5xx: 1,
  timeout: 1,
});
assert.deepEqual(history.summary.routes.apod.failureStatuses, {
  503: 1,
  transport: 1,
});
const markdown = reliabilityMarkdown(history);
assert.match(markdown, /Failure diagnostics/);
assert.match(markdown, /UPSTREAM_UNAVAILABLE/);
assert.match(markdown, /reliability-test-request/);
assert.match(markdown, /transport \| timeout/);
assert.doesNotMatch(markdown, /unavailable response body/);
console.log(JSON.stringify({ status: "ok", assertions: 12 }));

const completeDays = Array.from({ length: 30 }, (_, index) => ({
  checkedAt: new Date(Date.UTC(2026, 6, 26 + index, 12)).toISOString(),
  routes: ["apod", "asteroids", "space-weather", "earth", "media"].flatMap(
    (name) => [
      { ...route(false, 6_000, "MISS"), name },
      { ...route(true, 100, "MISS"), name },
    ],
  ),
}));
const reviewDate = new Date("2026-08-25T12:00:00Z");
const complete = summarizeReliability(completeDays, reviewDate);
assert.equal(complete.coverage.complete, true);
assert.equal(complete.coverage.completeDays, 30);
assert.ok(complete.alerts.includes("apod.failureRatio=0.5"));
assert.equal(
  summarizeReliability(completeDays.slice(1), reviewDate).coverage.complete,
  false,
);
const repeatedToday = Array.from({ length: 30 }, () => ({
  ...completeDays[0],
  checkedAt: reviewDate.toISOString(),
}));
assert.equal(
  summarizeReliability(repeatedToday, reviewDate).coverage.completeDays,
  0,
);
const partial = structuredClone(completeDays);
partial[0].routes = partial[0].routes.filter((item) => item.name !== "earth");
assert.deepEqual(
  summarizeReliability(partial, reviewDate).coverage.missingDatesByRoute.earth,
  ["2026-07-26"],
);
assert.equal(summarizeReliability([], reviewDate).coverage.complete, false);
const unsorted = summarizeReliability([...completeDays].reverse(), reviewDate);
assert.equal(unsorted.firstSampleAt, completeDays[0].checkedAt);
assert.equal(
  summarizeReliability(
    [{ checkedAt: "2027-01-01T00:00:00Z", routes: [] }],
    reviewDate,
  ).sampleCount,
  0,
);
assert.match(
  reliabilityMarkdown({ summary: complete }),
  /validation coverage unavailable/,
);
console.log(
  "Daily coverage, missing routes, ordering, future samples, and unchanged alerts: passed",
);
