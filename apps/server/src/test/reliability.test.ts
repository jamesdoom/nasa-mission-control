import { describe, expect, it, vi } from "vitest";
import { MemoryCache } from "../lib/cache.js";
import { CircuitBreaker, reliability } from "../lib/reliability.js";

describe("platform resilience", () => {
  it("retains expired values only inside the bounded stale window", () => {
    vi.useFakeTimers();
    const cache = new MemoryCache<string>();
    cache.set("key", "verified", 100, 200);
    expect(cache.lookup("key").state).toBe("fresh");
    vi.advanceTimersByTime(101);
    expect(cache.lookup("key")).toMatchObject({
      state: "stale",
      value: "verified",
    });
    vi.advanceTimersByTime(200);
    expect(cache.lookup("key").state).toBe("miss");
    vi.useRealTimers();
  });

  it("isolates one upstream and allows a single recovery probe", () => {
    vi.useFakeTimers();
    reliability.reset();
    const breaker = new CircuitBreaker(2, 1_000);
    breaker.failure("api.nasa.gov");
    breaker.failure("api.nasa.gov");
    expect(breaker.permit("api.nasa.gov")).toBe(false);
    expect(breaker.permit("images-api.nasa.gov")).toBe(true);
    vi.advanceTimersByTime(1_001);
    expect(breaker.permit("api.nasa.gov")).toBe(true);
    expect(breaker.permit("api.nasa.gov")).toBe(false);
    breaker.success("api.nasa.gov");
    expect(breaker.permit("api.nasa.gov")).toBe(true);
    vi.useRealTimers();
  });
});
