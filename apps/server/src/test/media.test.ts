import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { MediaDetail, MediaSearch } from "@mission-control/shared";
import { createApp } from "../app.js";
import type { Env } from "../config/env.js";
import type { NasaClient } from "../lib/nasa-client.js";

const env: Env = {
  NODE_ENV: "test",
  NASA_API_KEY: "DEMO_KEY",
  PORT: 3001,
  CLIENT_ORIGIN: "http://localhost:5173",
  NASA_REQUEST_TIMEOUT_MS: 8000,
  NASA_CACHE_TTL_MS: 300000,
  NASA_CACHE_MAX_ENTRIES: 100,
};
const result: MediaSearch = {
  query: "apollo",
  mediaType: "image",
  page: 1,
  pageSize: 24,
  totalHits: 1,
  totalPages: 1,
  items: [],
};

describe("NASA media routes", () => {
  it("validates, returns, and caches media searches", async () => {
    const searchMedia = vi.fn().mockResolvedValue(result);
    const app = createApp(env, { searchMedia } as unknown as NasaClient);
    const path = "/api/media/search?q=apollo&mediaType=image&page=1";
    const first = await request(app).get(path);
    const second = await request(app).get(path);
    expect(first.status).toBe(200);
    expect(first.body).toEqual(result);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(first.headers["cdn-cache-control"]).toBe(
      "public, max-age=3600, stale-while-revalidate=86400",
    );
    expect(searchMedia).toHaveBeenCalledWith("apollo", "image", 1, 24);
  });

  it("accepts NASA IDs containing spaces on detail routes", async () => {
    const detail: MediaDetail = {
      nasaId: "APOLLO FULL COLOR",
      title: "Apollo archive",
      description: "Archive asset",
      mediaType: "image",
      dateCreated: "1969-07-20T00:00:00Z",
      center: null,
      photographer: null,
      keywords: [],
      previewUrl: null,
      assets: [],
      playbackUrl: null,
      downloadUrl: null,
    };
    const getMediaDetail = vi.fn().mockResolvedValue(detail);
    const app = createApp(env, { getMediaDetail } as unknown as NasaClient);
    const response = await request(app).get("/api/media/APOLLO%20FULL%20COLOR");
    expect(response.status).toBe(200);
    expect(response.body).toEqual(detail);
    expect(getMediaDetail).toHaveBeenCalledWith("APOLLO FULL COLOR");
  });

  it.each([
    ["q=a", "2–100 character"],
    ["q=apollo&mediaType=text", "optional media type"],
    ["q=apollo&page=0", "page from 1–100"],
  ])("rejects invalid searches: %s", async (query, message) => {
    const app = createApp(env, {
      searchMedia: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app).get(`/api/media/search?${query}`);
    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).toContain(message);
  });
});
