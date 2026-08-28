import assert from "node:assert/strict";
import {
  buildReliabilityHistory,
  reliabilityMarkdown,
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
