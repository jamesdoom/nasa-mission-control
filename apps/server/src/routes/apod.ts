import { Router } from "express";
import { z } from "zod";
import { APOD_EARLIEST_DATE, type Apod } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const querySchema = z
  .object({ date: z.string().regex(datePattern).optional() })
  .strict();

function utcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function validateDate(value: string): string {
  const timestamp = Date.parse(`${value}T00:00:00Z`);
  if (
    !Number.isFinite(timestamp) ||
    new Date(timestamp).toISOString().slice(0, 10) !== value
  ) {
    throw new HttpError(
      400,
      "INVALID_REQUEST",
      "date must be a real calendar date in YYYY-MM-DD format.",
    );
  }
  if (value < APOD_EARLIEST_DATE || value > utcToday()) {
    throw new HttpError(
      400,
      "INVALID_REQUEST",
      `date must be between ${APOD_EARLIEST_DATE} and ${utcToday()}.`,
    );
  }
  return value;
}

export function createApodRouter(
  nasa: NasaClient,
  cacheTtlMs: number,
  cacheMaxEntries: number,
): Router {
  const router = Router();
  const cache = new MemoryCache<Apod>(cacheMaxEntries);
  router.get("/", async (request, response) => {
    const parsed = querySchema.safeParse({ date: request.query.date });
    if (!parsed.success)
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Only an optional date=YYYY-MM-DD query parameter is accepted.",
      );
    const date = validateDate(parsed.data.date ?? utcToday());
    const cached = cache.get(date);
    if (cached) {
      response.setHeader("x-cache", "HIT");
      response.json(cached);
      return;
    }
    const apod = await nasa.getApod(date);
    cache.set(date, apod, cacheTtlMs);
    response.setHeader("cache-control", "private, max-age=60");
    response.setHeader("x-cache", "MISS");
    response.json(apod);
  });
  return router;
}
