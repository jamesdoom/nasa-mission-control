import { logger } from "./logger.js";

export type UpstreamFailure =
  | "circuit_open"
  | "http_4xx"
  | "http_5xx"
  | "malformed_json"
  | "network"
  | "rate_limit"
  | "schema_validation"
  | "timeout";

type UpstreamState = {
  requests: number;
  successes: number;
  failures: Record<UpstreamFailure, number>;
  circuit: "closed" | "open" | "half_open";
};

type CacheState = { hit: number; miss: number; stale: number };

const failureKinds: UpstreamFailure[] = [
  "circuit_open",
  "http_4xx",
  "http_5xx",
  "malformed_json",
  "network",
  "rate_limit",
  "schema_validation",
  "timeout",
];

function failures(): Record<UpstreamFailure, number> {
  return Object.fromEntries(failureKinds.map((kind) => [kind, 0])) as Record<
    UpstreamFailure,
    number
  >;
}

class ReliabilityTelemetry {
  private readonly startedAt = new Date().toISOString();
  private readonly upstreams = new Map<string, UpstreamState>();
  private readonly caches = new Map<string, CacheState>();

  private upstream(name: string): UpstreamState {
    const existing = this.upstreams.get(name);
    if (existing) return existing;
    const created: UpstreamState = {
      requests: 0,
      successes: 0,
      failures: failures(),
      circuit: "closed",
    };
    this.upstreams.set(name, created);
    return created;
  }

  request(name: string): void {
    this.upstream(name).requests += 1;
  }
  success(name: string): void {
    this.upstream(name).successes += 1;
  }
  failure(name: string, kind: UpstreamFailure): void {
    this.upstream(name).failures[kind] += 1;
    logger.error("upstream.failure_categorized", {
      upstream: name,
      category: kind,
    });
  }
  circuit(name: string, state: UpstreamState["circuit"]): void {
    this.upstream(name).circuit = state;
    logger.info("upstream.circuit_state", { upstream: name, state });
  }
  cache(name: string, outcome: keyof CacheState): void {
    const state = this.caches.get(name) ?? { hit: 0, miss: 0, stale: 0 };
    state[outcome] += 1;
    this.caches.set(name, state);
  }
  snapshot(): object {
    return {
      since: this.startedAt,
      scope: "current-process",
      upstreams: Object.fromEntries(this.upstreams),
      caches: Object.fromEntries(
        [...this.caches].map(([name, value]) => [
          name,
          {
            ...value,
            hitRatio:
              value.hit + value.miss === 0
                ? null
                : Number((value.hit / (value.hit + value.miss)).toFixed(4)),
          },
        ]),
      ),
    };
  }
  reset(): void {
    this.upstreams.clear();
    this.caches.clear();
  }
}

export const reliability = new ReliabilityTelemetry();

type BreakerState = {
  failures: number;
  openedAt: number | null;
  probeActive: boolean;
};

export class CircuitBreaker {
  private readonly states = new Map<string, BreakerState>();
  constructor(
    private readonly threshold = 3,
    private readonly resetMs = 30_000,
  ) {}

  permit(upstream: string): boolean {
    const state = this.states.get(upstream);
    if (!state?.openedAt) return true;
    if (Date.now() - state.openedAt < this.resetMs || state.probeActive)
      return false;
    state.probeActive = true;
    reliability.circuit(upstream, "half_open");
    return true;
  }
  success(upstream: string): void {
    this.states.delete(upstream);
    reliability.circuit(upstream, "closed");
  }
  failure(upstream: string): void {
    const state = this.states.get(upstream) ?? {
      failures: 0,
      openedAt: null,
      probeActive: false,
    };
    state.failures += 1;
    state.probeActive = false;
    if (state.failures >= this.threshold) {
      state.openedAt = Date.now();
      reliability.circuit(upstream, "open");
    }
    this.states.set(upstream, state);
  }
}
