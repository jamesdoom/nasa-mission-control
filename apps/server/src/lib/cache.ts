type CacheEntry<T> = {
  value: T;
  createdAt: number;
  expiresAt: number;
  staleUntil: number;
};

export type CacheLookup<T> =
  { state: "fresh" | "stale"; value: T; ageMs: number } | { state: "miss" };

export class MemoryCache<T> {
  private readonly entries = new Map<string, CacheEntry<T>>();

  constructor(private readonly maxEntries = 100) {}

  get(key: string): T | undefined {
    const lookup = this.lookup(key);
    return lookup.state === "fresh" ? lookup.value : undefined;
  }

  lookup(key: string): CacheLookup<T> {
    const entry = this.entries.get(key);
    if (!entry) return { state: "miss" };
    const now = Date.now();
    if (entry.staleUntil <= now) {
      this.entries.delete(key);
      return { state: "miss" };
    }
    this.entries.delete(key);
    this.entries.set(key, entry);
    return {
      state: entry.expiresAt > now ? "fresh" : "stale",
      value: entry.value,
      ageMs: Math.max(0, now - entry.createdAt),
    };
  }

  set(key: string, value: T, ttlMs: number, staleTtlMs = ttlMs): void {
    if (ttlMs <= 0) return;
    const now = Date.now();
    this.entries.delete(key);
    this.entries.set(key, {
      value,
      createdAt: now,
      expiresAt: now + ttlMs,
      staleUntil: now + ttlMs + Math.max(0, staleTtlMs),
    });
    while (this.entries.size > this.maxEntries) {
      const oldestKey = this.entries.keys().next().value;
      if (oldestKey === undefined) break;
      this.entries.delete(oldestKey);
    }
  }
}
