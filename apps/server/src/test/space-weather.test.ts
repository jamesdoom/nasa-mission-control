import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { SpaceWeatherFeed } from "@mission-control/shared";
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
const feed: SpaceWeatherFeed = {
  startDate: "2026-07-27",
  endDate: "2026-08-03",
  category: "all",
  counts: { flare: 0, cme: 0, storm: 0 },
  events: [],
};

describe("GET /api/space-weather", () => {
  it("returns and caches a normalized observation feed", async () => {
    const getSpaceWeather = vi.fn().mockResolvedValue(feed);
    const app = createApp(env, { getSpaceWeather } as unknown as NasaClient);
    const path =
      "/api/space-weather?startDate=2026-07-27&endDate=2026-08-03&category=all";
    const first = await request(app).get(path);
    const second = await request(app).get(path);
    expect(first.status).toBe(200);
    expect(first.body).toEqual(feed);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(first.headers["cdn-cache-control"]).toBe(
      "public, max-age=300, stale-while-revalidate=900",
    );
    expect(getSpaceWeather).toHaveBeenCalledOnce();
  });

  it.each([
    ["startDate=2026-02-30&endDate=2026-03-01", "real date"],
    ["startDate=2026-08-03&endDate=2026-07-27", "on or after"],
    ["startDate=2026-06-01&endDate=2026-08-03", "more than 30 days"],
    ["startDate=2026-07-27&category=forecast", "supported"],
  ])("rejects invalid observation searches: %s", async (query, message) => {
    const app = createApp(env, {
      getSpaceWeather: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app).get(`/api/space-weather?${query}`);
    expect(response.status).toBe(400);
    expect(JSON.stringify(response.body)).toContain(message);
  });
});
