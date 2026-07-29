import { describe, expect, it, vi } from "vitest";
import { MemoryCache } from "../lib/cache.js";

describe("MemoryCache", () => {
  it("evicts the least recently used entry at its size limit", () => {
    const cache = new MemoryCache<number>(2);
    cache.set("a", 1, 1_000);
    cache.set("b", 2, 1_000);
    expect(cache.get("a")).toBe(1);
    cache.set("c", 3, 1_000);
    expect(cache.get("a")).toBe(1);
    expect(cache.get("b")).toBeUndefined();
    expect(cache.get("c")).toBe(3);
  });

  it("removes expired entries", () => {
    vi.useFakeTimers();
    const cache = new MemoryCache<number>();
    cache.set("a", 1, 10);
    vi.advanceTimersByTime(11);
    expect(cache.get("a")).toBeUndefined();
    vi.useRealTimers();
  });
});
