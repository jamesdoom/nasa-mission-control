import type { Response } from "express";

type SharedCachePolicy = {
  browserSeconds: number;
  cdnSeconds: number;
  staleSeconds: number;
};

export const liveNasaCache: SharedCachePolicy = {
  browserSeconds: 60,
  cdnSeconds: 300,
  staleSeconds: 900,
};

export const archiveNasaCache: SharedCachePolicy = {
  browserSeconds: 300,
  cdnSeconds: 86_400,
  staleSeconds: 604_800,
};

export const mediaSearchCache: SharedCachePolicy = {
  browserSeconds: 60,
  cdnSeconds: 3_600,
  staleSeconds: 86_400,
};

export function sendSharedJson(
  response: Response,
  value: unknown,
  originCache: "HIT" | "MISS" | "STALE",
  policy: SharedCachePolicy,
  staleAgeMs?: number,
): void {
  response.setHeader(
    "cache-control",
    `public, max-age=${String(policy.browserSeconds)}`,
  );
  response.setHeader(
    "cdn-cache-control",
    `public, max-age=${String(policy.cdnSeconds)}, stale-while-revalidate=${String(policy.staleSeconds)}`,
  );
  response.setHeader("x-cache", originCache);
  if (originCache === "STALE") {
    response.setHeader(
      "warning",
      '110 - "Response is stale because NASA is unavailable"',
    );
    response.setHeader("x-data-status", "stale-fallback");
    if (staleAgeMs !== undefined)
      response.setHeader("age", String(Math.floor(staleAgeMs / 1000)));
  } else response.setHeader("x-data-status", "current");
  response.json(value);
}
