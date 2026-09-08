import assert from "node:assert/strict";
import { probeRoute } from "./lib/reliability-probe.mjs";
import {
  summarizeReliability,
  reliabilityThresholds,
} from "./lib/reliability-trends.mjs";
const now = new Date();
const observations = [
  "HIT",
  "STALE",
  "MISS",
  "BYPASS",
  "REVALIDATED",
  "PRERENDER",
  null,
].map((edgeCache) => ({
  name: "test",
  passed: true,
  status: 200,
  durationMs: 100,
  edgeCache,
  originCache: "MISS",
  dataStatus: "current",
}));
observations[3].originCache = "HIT";
const summary = summarizeReliability(
  [{ checkedAt: now.toISOString(), routes: observations }],
  now,
);
assert.equal(summary.routes.test.cdnCacheSamples, 6);
assert.equal(summary.routes.test.cdnCacheHitRatio, 0.1667);
assert.equal(summary.routes.test.cdnStaleResponses, 1);
assert.equal(summary.routes.test.originCacheSamples, 3);
assert.equal(summary.routes.test.originCacheHitRatio, 0.3333);
assert.equal(summary.routes.test.staleFallbacks, 0);
const historical = summarizeReliability(
  [
    {
      checkedAt: now.toISOString(),
      routes: [{ ...observations[0], edgeCache: undefined }],
    },
  ],
  now,
);
assert.equal(historical.routes.test.originCacheHitRatio, null);
assert.equal(historical.routes.test.cdnCacheHitRatio, null);
const failing = summarizeReliability(
  [
    {
      checkedAt: now.toISOString(),
      routes: Array.from({ length: 20 }, () => ({
        ...observations[0],
        passed: false,
        durationMs: 6000,
        dataStatus: "stale-fallback",
      })),
    },
  ],
  now,
);
assert.deepEqual(failing.alerts, [
  "test.failureRatio=1",
  "test.p95LatencyMs=6000",
  "test.staleFallbackRatio=1",
]);
assert.equal(reliabilityThresholds.apiP95LatencyMs, 5000);
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const success = await probeRoute("test", new URL("https://example.com"), {
  fetchImpl: async (_url, options) => {
    assert.match(options.headers["x-request-id"], /^[a-f0-9-]{36}$/);
    const response = Response.json(
      { ok: true },
      { headers: { "x-request-id": "cached-reference" } },
    );
    response.json = async () => {
      await wait(35);
      return { ok: true };
    };
    return response;
  },
});
assert.equal(success.passed, true);
assert.ok(success.durationMs >= 30);
assert.equal(success.requestId, "cached-reference");
assert.notEqual(success.probeRequestId, success.requestId);
const timeout = await probeRoute("test", new URL("https://example.com"), {
  timeoutMs: 10,
  fetchImpl: async (_url, { signal }) => {
    const response = Response.json({});
    response.json = async () => {
      await wait(25);
      signal.throwIfAborted();
      return {};
    };
    return response;
  },
});
assert.equal(timeout.errorCategory, "timeout");
assert.equal(timeout.passed, false);
assert.equal(timeout.status, 200);
assert.ok(timeout.durationMs >= 20);
assert.ok(timeout.probeRequestId);
console.log(
  "Cache-layer, alert-preservation, correlation and body-timeout checks passed.",
);
