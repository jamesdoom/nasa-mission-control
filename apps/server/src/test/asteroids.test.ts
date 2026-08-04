import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { AsteroidFeed } from "@mission-control/shared";
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
const feed: AsteroidFeed = {
  startDate: "2026-07-29",
  endDate: "2026-07-30",
  totalCount: 0,
  potentiallyHazardousCount: 0,
  closestApproachKm: null,
  asteroids: [],
};

describe("GET /api/asteroids", () => {
  it("returns and caches a normalized date-range feed", async () => {
    const getAsteroidFeed = vi.fn().mockResolvedValue(feed);
    const app = createApp(env, { getAsteroidFeed } as unknown as NasaClient);
    const path = "/api/asteroids?startDate=2026-07-29&endDate=2026-07-30";
    const first = await request(app).get(path);
    const second = await request(app).get(path);
    expect(first.status).toBe(200);
    expect(first.body).toEqual(feed);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(getAsteroidFeed).toHaveBeenCalledOnce();
  });

  it.each([
    ["startDate=2026-02-30&endDate=2026-03-01", "real calendar date"],
    ["startDate=2026-07-30&endDate=2026-07-29", "on or after"],
    ["startDate=2026-07-01&endDate=2026-07-10", "more than 7 days"],
  ])("rejects invalid ranges: %s", async (query, message) => {
    const app = createApp(env, {
      getAsteroidFeed: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app).get(`/api/asteroids?${query}`);
    expect(response.status).toBe(400);
    const body: unknown = response.body;
    expect(body).toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
    expect(JSON.stringify(body)).toContain(message);
  });
});
