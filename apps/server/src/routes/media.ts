import { Router } from "express";
import { z } from "zod";
import type { MediaDetail, MediaSearch } from "@mission-control/shared";
import { MemoryCache } from "../lib/cache.js";
import { HttpError } from "../lib/http-error.js";
import type { NasaClient } from "../lib/nasa-client.js";
import { sendResilient } from "../lib/resilient-route.js";
import { archiveNasaCache, mediaSearchCache } from "../lib/response-cache.js";

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
    await sendResilient({
      response,
      cache: searchCache,
      cacheName: "media-search",
      key: cacheKey,
      ttlMs: cacheTtlMs,
      staleTtlMs: 86_400_000,
      policy: mediaSearchCache,
      load: () => nasa.searchMedia(q, mediaType, page, pageSize),
    });
  });

  router.get("/:nasaId", async (request, response) => {
    const parsed = idSchema.safeParse(request.params.nasaId);
    if (!parsed.success) {
      throw new HttpError(400, "INVALID_REQUEST", "Invalid NASA media ID.");
    }
    await sendResilient({
      response,
      cache: detailCache,
      cacheName: "media-detail",
      key: parsed.data,
      ttlMs: cacheTtlMs,
      staleTtlMs: 604_800_000,
      policy: archiveNasaCache,
      load: () => nasa.getMediaDetail(parsed.data),
    });
  });

  return router;
}
