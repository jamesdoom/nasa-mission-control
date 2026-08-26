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
  error: passed ? null : "unavailable",
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
    routes: [route(true, 200, "MISS", "stale-fallback")],
    processSnapshot: processSnapshot(1),
  },
  now,
);
assert.equal(history.summary.sampleCount, 3);
assert.equal(history.summary.validationFailures, 1);
assert.equal(history.summary.process.upstreams["api.nasa.gov"].requests, 2);
assert.equal(history.summary.routes.apod.staleFallbacks, 2);
assert.ok(history.summary.alerts.includes("schema_validation=1"));
assert.match(reliabilityMarkdown(history), /Reliability trend summary/);
console.log(JSON.stringify({ status: "ok", assertions: 6 }));
