import { Router } from "express";
import { z } from "zod";
import type { AsteroidFeed } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";

const dayMs = 86_400_000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const querySchema = z
  .object({
    startDate: z.string().regex(datePattern).optional(),
    endDate: z.string().regex(datePattern).optional(),
  })
  .strict();

function utcDate(offsetDays = 0): string {
  return new Date(Date.now() + offsetDays * dayMs).toISOString().slice(0, 10);
}

function parseDate(value: string, field: string): number {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new HttpError(
      400,
      "INVALID_REQUEST",
      `${field} must be a real calendar date in YYYY-MM-DD format.`,
    );
  }
  return timestamp;
}

export function createAsteroidRouter(
  nasa: NasaClient,
  cacheTtlMs: number,
  cacheMaxEntries: number,
): Router {
  const router = Router();
  const cache = new MemoryCache<AsteroidFeed>(cacheMaxEntries);
  router.get("/", async (request, response) => {
    const parsed = querySchema.safeParse({
      startDate: request.query.startDate,
      endDate: request.query.endDate,
    });
    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Only startDate and endDate in YYYY-MM-DD format are accepted.",
      );
    }
    const startDate = parsed.data.startDate ?? utcDate();
    const endDate = parsed.data.endDate ?? utcDate(6);
    const start = parseDate(startDate, "startDate");
    const end = parseDate(endDate, "endDate");
    if (end < start) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "endDate must be on or after startDate.",
      );
    }
    if ((end - start) / dayMs > 7) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "NASA NeoWs date ranges may not be more than 7 days apart.",
      );
    }
    const cacheKey = `${startDate}:${endDate}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      response.setHeader("x-cache", "HIT");
      response.json(cached);
      return;
    }
    const feed = await nasa.getAsteroidFeed(startDate, endDate);
    cache.set(cacheKey, feed, cacheTtlMs);
    response.setHeader("cache-control", "private, max-age=60");
    response.setHeader("x-cache", "MISS");
    response.json(feed);
  });
  return router;
}
