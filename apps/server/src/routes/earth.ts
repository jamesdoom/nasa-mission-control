import { Router } from "express";
import { z } from "zod";
import type { EarthObservation } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";
import {
  archiveNasaCache,
  liveNasaCache,
  sendSharedJson,
} from "../lib/response-cache.js";

const querySchema = z
  .object({
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    collection: z.enum(["natural", "enhanced"]).default("natural"),
  })
  .strict();

function validateDate(value: string | undefined): string | undefined {
  if (!value) return undefined;
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
  if (value > new Date().toISOString().slice(0, 10)) {
    throw new HttpError(
      400,
      "INVALID_REQUEST",
      "date cannot be in the future.",
    );
  }
  return value;
}

export function createEarthRouter(
  nasa: NasaClient,
  cacheTtlMs: number,
  cacheMaxEntries: number,
): Router {
  const router = Router();
  const cache = new MemoryCache<EarthObservation>(cacheMaxEntries);
  router.get("/", async (request, response) => {
    const parsed = querySchema.safeParse({
      date: request.query.date,
      collection: request.query.collection,
    });
    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Use an optional real date and a natural or enhanced collection.",
      );
    }
    const date = validateDate(parsed.data.date);
    const cachePolicy = date ? archiveNasaCache : liveNasaCache;
    const cacheKey = `${parsed.data.collection}:${date ?? "latest"}`;
    const cached = cache.get(cacheKey);
    if (cached) {
      sendSharedJson(response, cached, "HIT", cachePolicy);
      return;
    }
    const observation = await nasa.getEarthObservation(
      parsed.data.collection,
      date,
    );
    const hasImages = observation.images.length > 0;
    if (hasImages) {
      cache.set(cacheKey, observation, cacheTtlMs);
    }
    if (hasImages) {
      sendSharedJson(response, observation, "MISS", cachePolicy);
    } else {
      response.setHeader("cache-control", "no-store");
      response.setHeader("x-cache", "MISS");
      response.json(observation);
    }
  });
  return router;
}
