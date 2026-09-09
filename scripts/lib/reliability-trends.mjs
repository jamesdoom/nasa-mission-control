export const reliabilityThresholds = {
  windowDays: 30,
  apiP95LatencyMs: 5_000,
  routeFailureRatio: 0.05,
  staleFallbackRatio: 0.1,
  minimumLatencySamples: 10,
  minimumStaleSamples: 10,
  minimumCacheSamples: 20,
  minimumCacheHitRatio: 0.2,
  validationFailures: 1,
};

const monitoredRoutes = [
  "apod",
  "asteroids",
  "space-weather",
  "earth",
  "media",
];

function dailyCoverage(samples, now) {
  const end = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  );
  const dates = Array.from(
    { length: reliabilityThresholds.windowDays },
    (_, index) =>
      new Date(end - (reliabilityThresholds.windowDays - index) * 86_400_000)
        .toISOString()
        .slice(0, 10),
  );
  const missingDatesByRoute = Object.fromEntries(
    monitoredRoutes.map((name) => [
      name,
      dates.filter(
        (date) =>
          samples
            .filter(
              (sample) =>
                sample.checkedAt?.slice(0, 10) === date &&
                Number.isFinite(Date.parse(sample.checkedAt)),
            )
            .flatMap((sample) => sample.routes ?? [])
            .filter((route) => route.name === name).length < 2,
      ),
    ]),
  );
  return {
    startDate: dates[0],
    endDate: dates.at(-1),
    requiredDays: dates.length,
    completeDays: dates.filter((date) =>
      Object.values(missingDatesByRoute).every(
        (missing) => !missing.includes(date),
      ),
    ).length,
    missingDatesByRoute,
    complete: Object.values(missingDatesByRoute).every(
      (missing) => missing.length === 0,
    ),
  };
}

function percentile(values, proportion) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((first, second) => first - second);
  return sorted[Math.ceil(sorted.length * proportion) - 1] ?? null;
}

function increment(target, source) {
  for (const [key, value] of Object.entries(source ?? {})) {
    if (typeof value === "number") target[key] = (target[key] ?? 0) + value;
  }
}

function countsBy(items, keyForItem) {
  const counts = {};
  for (const item of items) {
    const key = keyForItem(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}

function processTotals(samples) {
  const upstreamMaxima = new Map();
  const cacheMaxima = new Map();
  for (const sample of samples) {
    const snapshot = sample.processSnapshot;
    if (!snapshot || typeof snapshot.since !== "string") continue;
    for (const [upstream, state] of Object.entries(snapshot.upstreams ?? {})) {
      const key = `${snapshot.since}|${upstream}`;
      const current = upstreamMaxima.get(key) ?? {
        upstream,
        requests: 0,
        successes: 0,
        failures: {},
      };
      current.requests = Math.max(current.requests, state.requests ?? 0);
      current.successes = Math.max(current.successes, state.successes ?? 0);
      for (const [kind, count] of Object.entries(state.failures ?? {})) {
        current.failures[kind] = Math.max(current.failures[kind] ?? 0, count);
      }
      upstreamMaxima.set(key, current);
    }
    for (const [cache, state] of Object.entries(snapshot.caches ?? {})) {
      const key = `${snapshot.since}|${cache}`;
      const current = cacheMaxima.get(key) ?? {
        cache,
        hit: 0,
        miss: 0,
        stale: 0,
      };
      for (const outcome of ["hit", "miss", "stale"]) {
        current[outcome] = Math.max(current[outcome], state[outcome] ?? 0);
      }
      cacheMaxima.set(key, current);
    }
  }
  const upstreams = {};
  for (const state of upstreamMaxima.values()) {
    const aggregate = upstreams[state.upstream] ?? {
      requests: 0,
      successes: 0,
      failures: {},
    };
    aggregate.requests += state.requests;
    aggregate.successes += state.successes;
    increment(aggregate.failures, state.failures);
    upstreams[state.upstream] = aggregate;
  }
  const caches = {};
  for (const state of cacheMaxima.values()) {
    const aggregate = caches[state.cache] ?? { hit: 0, miss: 0, stale: 0 };
    aggregate.hit += state.hit;
    aggregate.miss += state.miss;
    aggregate.stale += state.stale;
    caches[state.cache] = aggregate;
  }
  return { upstreams, caches };
}

export function summarizeReliability(samples, now = new Date()) {
  const cutoff = now.valueOf() - reliabilityThresholds.windowDays * 86_400_000;
  const windowSamples = samples.filter(
    (sample) =>
      Date.parse(sample.checkedAt) >= cutoff &&
      Date.parse(sample.checkedAt) <= now.valueOf(),
  );
  windowSamples.sort(
    (a, b) => Date.parse(a.checkedAt) - Date.parse(b.checkedAt),
  );
  const routeGroups = new Map();
  for (const sample of windowSamples) {
    for (const route of sample.routes ?? []) {
      const group = routeGroups.get(route.name) ?? [];
      group.push({ checkedAt: sample.checkedAt, ...route });
      routeGroups.set(route.name, group);
    }
  }
  const routes = Object.fromEntries(
    [...routeGroups].map(([name, observations]) => {
      const durations = observations.map((item) => item.durationMs);
      const cdnSamples = observations.filter((item) =>
        ["HIT", "MISS", "STALE", "REVALIDATED", "BYPASS", "PRERENDER"].includes(
          item.edgeCache,
        ),
      );
      const cdnHits = cdnSamples.filter(
        (item) => item.edgeCache === "HIT",
      ).length;
      const cdnStale = cdnSamples.filter(
        (item) => item.edgeCache === "STALE",
      ).length;
      // Cached origin headers describe the response's creation, not this request.
      const cacheSamples = observations.filter(
        (item) =>
          ["MISS", "BYPASS", "REVALIDATED"].includes(item.edgeCache) &&
          ["HIT", "MISS", "STALE"].includes(item.originCache),
      );
      const hits = cacheSamples.filter(
        (item) => item.originCache === "HIT",
      ).length;
      const stale = observations.filter(
        (item) =>
          item.originCache === "STALE" ||
          ["stale", "stale-fallback"].includes(item.dataStatus),
      ).length;
      const failures = observations.filter((item) => !item.passed).length;
      const failedObservations = observations.filter((item) => !item.passed);
      return [
        name,
        {
          observations: observations.length,
          failures,
          failureRatio: Number((failures / observations.length).toFixed(4)),
          p50LatencyMs: percentile(durations, 0.5),
          p95LatencyMs: percentile(durations, 0.95),
          maxLatencyMs: Math.max(...durations),
          cdnCacheSamples: cdnSamples.length,
          cdnCacheHitRatio: cdnSamples.length
            ? Number((cdnHits / cdnSamples.length).toFixed(4))
            : null,
          cdnStaleResponses: cdnStale,
          originCacheSamples: cacheSamples.length,
          originCacheHitRatio:
            cacheSamples.length === 0
              ? null
              : Number((hits / cacheSamples.length).toFixed(4)),
          staleFallbacks: stale,
          staleFallbackRatio: Number((stale / observations.length).toFixed(4)),
          failureCategories: countsBy(
            failedObservations,
            (item) => item.errorCategory ?? "unknown",
          ),
          failureStatuses: countsBy(failedObservations, (item) =>
            item.status === 0 ? "transport" : String(item.status),
          ),
          failureDetails: failedObservations.map((item) => ({
            checkedAt: item.checkedAt,
            probeRequestId: item.probeRequestId ?? null,
            status: item.status,
            errorCategory: item.errorCategory ?? "unknown",
            applicationErrorCode: item.applicationErrorCode ?? null,
            durationMs: item.durationMs,
            requestId: item.requestId ?? null,
          })),
        },
      ];
    }),
  );
  const process = processTotals(windowSamples);
  const validationFailures = Object.values(process.upstreams).reduce(
    (total, upstream) => total + (upstream.failures.schema_validation ?? 0),
    0,
  );
  const alerts = [];
  const diagnostics = [];
  if (validationFailures >= reliabilityThresholds.validationFailures) {
    alerts.push(`schema_validation=${validationFailures}`);
  }
  for (const [name, route] of Object.entries(routes)) {
    if (
      route.failures >= 2 &&
      route.failureRatio > reliabilityThresholds.routeFailureRatio
    ) {
      alerts.push(`${name}.failureRatio=${route.failureRatio}`);
    }
    if (
      route.observations >= reliabilityThresholds.minimumLatencySamples &&
      route.p95LatencyMs > reliabilityThresholds.apiP95LatencyMs
    ) {
      alerts.push(`${name}.p95LatencyMs=${route.p95LatencyMs}`);
    }
    if (
      route.observations >= reliabilityThresholds.minimumStaleSamples &&
      route.staleFallbackRatio > reliabilityThresholds.staleFallbackRatio
    ) {
      alerts.push(`${name}.staleFallbackRatio=${route.staleFallbackRatio}`);
    }
    if (
      route.originCacheSamples >= reliabilityThresholds.minimumCacheSamples &&
      route.originCacheHitRatio < reliabilityThresholds.minimumCacheHitRatio
    ) {
      diagnostics.push(
        `${name}.originCacheHitRatio=${route.originCacheHitRatio}`,
      );
    }
  }
  return {
    windowDays: reliabilityThresholds.windowDays,
    sampleCount: windowSamples.length,
    coverage: dailyCoverage(samples, now),
    processSnapshotCount: windowSamples.filter(
      (sample) => sample.processSnapshot?.since,
    ).length,
    firstSampleAt: windowSamples[0]?.checkedAt ?? null,
    lastSampleAt: windowSamples.at(-1)?.checkedAt ?? null,
    routes,
    process,
    validationFailures,
    alerts,
    diagnostics,
  };
}

export function buildReliabilityHistory(previous, sample, now = new Date()) {
  const retentionCutoff = now.valueOf() - 90 * 86_400_000;
  const samples = [...(previous?.samples ?? []), sample]
    .filter((item) => Date.parse(item.checkedAt) >= retentionCutoff)
    .sort((first, second) => first.checkedAt.localeCompare(second.checkedAt));
  return {
    schemaVersion: 3,
    generatedAt: now.toISOString(),
    retentionDays: 90,
    samples,
    summary: summarizeReliability(samples, now),
  };
}

export function reliabilityMarkdown(history) {
  const summary = history.summary;
  const lines = [
    "# Reliability trend summary",
    "",
    `Rolling window: ${summary.windowDays} days · samples: ${summary.sampleCount}`,
    "",
    `Daily coverage: ${summary.coverage.completeDays}/${summary.coverage.requiredDays} completed UTC days (${summary.coverage.startDate} through ${summary.coverage.endDate}) · ${summary.coverage.complete ? "complete" : "INCOMPLETE"}. Requires two observations per monitored route per day; failed requests count as observations. Today is still in progress.`,
    "",
    "| Route | Observations | Failures | p95 latency | CDN hit ratio (n) | CDN stale | Origin hit ratio (n) | App fallback |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const [name, route] of Object.entries(summary.routes)) {
    lines.push(
      `| ${name} | ${route.observations} | ${route.failures} | ${route.p95LatencyMs} ms | ${route.cdnCacheHitRatio ?? "n/a"} (${route.cdnCacheSamples}) | ${route.cdnStaleResponses} | ${route.originCacheHitRatio ?? "n/a"} (${route.originCacheSamples}) | ${route.staleFallbacks} |`,
    );
  }
  lines.push(
    "",
    `Recorded validation failures: ${summary.validationFailures} · process snapshots: ${summary.processSnapshotCount}${summary.processSnapshotCount ? " (current-process scope only)" : " (validation coverage unavailable)"}`,
    `Alerts: ${summary.alerts.length ? summary.alerts.join(", ") : "none"}`,
    `Diagnostics: ${summary.diagnostics.length ? summary.diagnostics.join(", ") : "none"}`,
  );
  if (!summary.coverage.complete) {
    lines.push("", "Missing or insufficient daily observations:", "");
    for (const [name, dates] of Object.entries(
      summary.coverage.missingDatesByRoute,
    )) {
      if (dates.length) lines.push(`- ${name}: ${dates.join(", ")}`);
    }
  }
  const failedRoutes = Object.entries(summary.routes).filter(
    ([, route]) => route.failureDetails.length > 0,
  );
  if (failedRoutes.length > 0) {
    lines.push(
      "",
      "## Failure diagnostics",
      "",
      "| Route | Status | Category | Application code | Duration | Checked at (UTC) | Probe reference | Response reference |",
      "| --- | ---: | --- | --- | ---: | --- | --- | --- |",
    );
    for (const [name, route] of failedRoutes) {
      for (const detail of route.failureDetails) {
        lines.push(
          `| ${name} | ${detail.status || "transport"} | ${detail.errorCategory} | ${detail.applicationErrorCode ?? "n/a"} | ${detail.durationMs} ms | ${detail.checkedAt ?? "n/a"} | ${detail.probeRequestId ?? "n/a"} | ${detail.requestId ?? "n/a"} |`,
        );
      }
    }
  }
  lines.push(
    "",
    "CDN ratios use recognized x-vercel-cache observations. Origin ratios use x-cache only on CDN MISS/BYPASS/REVALIDATED responses; cached or unknown CDN responses are excluded. n/a means no eligible observations. CDN STALE is background revalidation, distinct from application stale fallback. Response references can be replayed by the CDN; probe references identify the attempted request.",
    "Failure diagnostics contain bounded categories and request references; response bodies are not retained.",
    "Counters from the same process start time are de-duplicated by maximum value before aggregation.",
  );
  return `${lines.join("\n")}\n`;
}
