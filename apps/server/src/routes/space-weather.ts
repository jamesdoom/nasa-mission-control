import { Router } from "express";
import { z } from "zod";
import type { SpaceWeatherFeed } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";

const dayMs = 86_400_000;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const querySchema = z
  .object({
    startDate: z.string().regex(datePattern).optional(),
    endDate: z.string().regex(datePattern).optional(),
    category: z.enum(["all", "flare", "cme", "storm"]).default("all"),
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
      `${field} must be a real date.`,
    );
  }
  return timestamp;
}

export function createSpaceWeatherRouter(
  nasa: NasaClient,
  cacheTtlMs: number,
  cacheMaxEntries: number,
): Router {
  const router = Router();
  const cache = new MemoryCache<SpaceWeatherFeed>(cacheMaxEntries);
  router.get("/", async (request, response) => {
    const query = { ...request.query };
    delete query.path;
    const parsed = querySchema.safeParse(query);
    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Use startDate, endDate, and a supported space weather category.",
      );
    }
    const endDate = parsed.data.endDate ?? utcDate();
    const startDate = parsed.data.startDate ?? utcDate(-7);
    const start = parseDate(startDate, "startDate");
    const end = parseDate(endDate, "endDate");
    if (end < start)
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "endDate must be on or after startDate.",
      );
    if ((end - start) / dayMs > 30)
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Space weather date ranges may not be more than 30 days apart.",
      );
    const { category } = parsed.data;
    const cacheKey = `${startDate}:${endDate}:${category}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      response.setHeader("x-cache", "HIT");
      response.json(cached);
      return;
    }
    const feed = await nasa.getSpaceWeather(startDate, endDate, category);
    cache.set(cacheKey, feed, cacheTtlMs);
    response.setHeader("cache-control", "private, max-age=60");
    response.setHeader("x-cache", "MISS");
    response.json(feed);
  });
  return router;
}
