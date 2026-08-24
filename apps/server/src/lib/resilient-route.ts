import type { Response } from "express";
import type { MemoryCache } from "./cache.js";
import { HttpError } from "./http-error.js";
import { reliability } from "./reliability.js";
import { sendSharedJson } from "./response-cache.js";

type Policy = Parameters<typeof sendSharedJson>[3];

export async function sendResilient<T>(options: {
  response: Response;
  cache: MemoryCache<T>;
  cacheName: string;
  key: string;
  ttlMs: number;
  staleTtlMs: number;
  policy: Policy;
  load: () => Promise<T>;
  cacheable?: (value: T) => boolean;
}): Promise<void> {
  const cached = options.cache.lookup(options.key);
  if (cached.state === "fresh") {
    reliability.cache(options.cacheName, "hit");
    sendSharedJson(options.response, cached.value, "HIT", options.policy);
    return;
  }
  reliability.cache(options.cacheName, "miss");
  try {
    const value = await options.load();
    const cacheable = options.cacheable?.(value) ?? true;
    if (cacheable)
      options.cache.set(options.key, value, options.ttlMs, options.staleTtlMs);
    if (cacheable) {
      sendSharedJson(options.response, value, "MISS", options.policy);
    } else {
      options.response.setHeader("cache-control", "no-store");
      options.response.setHeader("x-cache", "MISS");
      options.response.setHeader("x-data-status", "current");
      options.response.json(value);
    }
  } catch (error: unknown) {
    const canFallback = error instanceof HttpError && error.status >= 500;
    if (cached.state === "stale" && canFallback) {
      reliability.cache(options.cacheName, "stale");
      sendSharedJson(
        options.response,
        cached.value,
        "STALE",
        options.policy,
        cached.ageMs,
      );
      return;
    }
    throw error;
  }
}
