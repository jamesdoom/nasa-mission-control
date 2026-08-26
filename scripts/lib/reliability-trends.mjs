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
    (sample) => Date.parse(sample.checkedAt) >= cutoff,
  );
  const routeGroups = new Map();
  for (const sample of windowSamples) {
    for (const route of sample.routes ?? []) {
      const group = routeGroups.get(route.name) ?? [];
      group.push(route);
      routeGroups.set(route.name, group);
    }
  }
  const routes = Object.fromEntries(
    [...routeGroups].map(([name, observations]) => {
      const durations = observations.map((item) => item.durationMs);
      const cacheSamples = observations.filter((item) =>
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
      return [
        name,
        {
          observations: observations.length,
          failures,
          failureRatio: Number((failures / observations.length).toFixed(4)),
          p50LatencyMs: percentile(durations, 0.5),
          p95LatencyMs: percentile(durations, 0.95),
          maxLatencyMs: Math.max(...durations),
          cacheSamples: cacheSamples.length,
          cacheHitRatio:
            cacheSamples.length === 0
              ? null
              : Number((hits / cacheSamples.length).toFixed(4)),
          staleFallbacks: stale,
          staleFallbackRatio: Number((stale / observations.length).toFixed(4)),
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
      route.cacheSamples >= reliabilityThresholds.minimumCacheSamples &&
      route.cacheHitRatio < reliabilityThresholds.minimumCacheHitRatio
    ) {
      diagnostics.push(`${name}.cacheHitRatio=${route.cacheHitRatio}`);
    }
  }
  return {
    windowDays: reliabilityThresholds.windowDays,
    sampleCount: windowSamples.length,
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
    schemaVersion: 1,
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
    "| Route | Observations | Failures | p95 latency | Cache hit | Stale |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
  ];
  for (const [name, route] of Object.entries(summary.routes)) {
    lines.push(
      `| ${name} | ${route.observations} | ${route.failures} | ${route.p95LatencyMs} ms | ${route.cacheHitRatio ?? "n/a"} | ${route.staleFallbacks} |`,
    );
  }
  lines.push(
    "",
    `Validation failures: ${summary.validationFailures}`,
    `Alerts: ${summary.alerts.length ? summary.alerts.join(", ") : "none"}`,
    `Diagnostics: ${summary.diagnostics.length ? summary.diagnostics.join(", ") : "none"}`,
    "",
    "Counters from the same process start time are de-duplicated by maximum value before aggregation.",
  );
  return `${lines.join("\n")}\n`;
}
