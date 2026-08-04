import { Router } from "express";
import { z } from "zod";
import type { MediaDetail, MediaSearch } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";

const pageSize = 24;
const searchSchema = z
  .object({
    q: z.string().trim().min(2).max(100),
    mediaType: z.enum(["all", "image", "video", "audio"]).default("all"),
    page: z.coerce.number().int().min(1).max(100).default(1),
  })
  .strict();
const idSchema = z.string().trim().min(1).max(200);

export function createMediaRouter(
  nasa: NasaClient,
  cacheTtlMs: number,
  cacheMaxEntries: number,
): Router {
  const router = Router();
  const searchCache = new MemoryCache<MediaSearch>(cacheMaxEntries);
  const detailCache = new MemoryCache<MediaDetail>(cacheMaxEntries);

  router.get("/search", async (request, response) => {
    const parsed = searchSchema.safeParse({
      q: request.query.q,
      mediaType: request.query.mediaType,
      page: request.query.page,
    });
    if (!parsed.success) {
      throw new HttpError(
        400,
        "INVALID_REQUEST",
        "Provide a 2–100 character query, an optional media type, and a page from 1–100.",
      );
    }
    const { q, mediaType, page } = parsed.data;
    const cacheKey = `${q.toLowerCase()}:${mediaType}:${String(page)}`;
    const cached = searchCache.get(cacheKey);
    if (cached) {
      response.setHeader("x-cache", "HIT");
      response.json(cached);
      return;
    }
    const result = await nasa.searchMedia(q, mediaType, page, pageSize);
    searchCache.set(cacheKey, result, cacheTtlMs);
    response.setHeader("cache-control", "private, max-age=60");
    response.setHeader("x-cache", "MISS");
    response.json(result);
  });

  router.get("/:nasaId", async (request, response) => {
    const parsed = idSchema.safeParse(request.params.nasaId);
    if (!parsed.success) {
      throw new HttpError(400, "INVALID_REQUEST", "Invalid NASA media ID.");
    }
    const cached = detailCache.get(parsed.data);
    if (cached) {
      response.setHeader("x-cache", "HIT");
      response.json(cached);
      return;
    }
    const detail = await nasa.getMediaDetail(parsed.data);
    detailCache.set(parsed.data, detail, cacheTtlMs);
    response.setHeader("cache-control", "private, max-age=300");
    response.setHeader("x-cache", "MISS");
    response.json(detail);
  });

  return router;
}
