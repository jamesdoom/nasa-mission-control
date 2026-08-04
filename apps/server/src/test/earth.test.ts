import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { EarthObservation } from "@mission-control/shared";
import { createApp } from "../app.js";
import type { Env } from "../config/env.js";
import type { NasaClient } from "../lib/nasa-client.js";

const env: Env = {
  NODE_ENV: "test",
  NASA_API_KEY: "DEMO_KEY",
  PORT: 3001,
  CLIENT_ORIGIN: "http://localhost:5173",
  NASA_REQUEST_TIMEOUT_MS: 30000,
  NASA_CACHE_TTL_MS: 300000,
  NASA_CACHE_MAX_ENTRIES: 100,
};
const observation: EarthObservation = {
  date: "2026-08-01",
  latestAvailableDate: "2026-08-01",
  collection: "natural",
  images: [
    {
      id: "20260801004554",
      caption: "Earth from DSCOVR",
      capturedAtUtc: "2026-08-01T00:45:54.000Z",
      centroid: { latitude: 5.3, longitude: -156.2 },
      imageUrl: "https://epic.gsfc.nasa.gov/example.jpg",
      thumbnailUrl: "https://epic.gsfc.nasa.gov/example-thumb.jpg",
      downloadUrl: "https://epic.gsfc.nasa.gov/example.png",
    },
  ],
  dailyComposite: {
    title: "MODIS Terra corrected-reflectance true color",
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    imageUrl: "https://gibs.earthdata.nasa.gov/example.jpg",
    sourceUrl: "https://earthdata.nasa.gov/data/tools/gibs",
  },
};

describe("GET /api/earth", () => {
  it("returns and caches a normalized Earth observation", async () => {
    const getEarthObservation = vi.fn().mockResolvedValue(observation);
    const app = createApp(env, {
      getEarthObservation,
    } as unknown as NasaClient);
    const first = await request(app).get("/api/earth?collection=natural");
    const second = await request(app).get("/api/earth?collection=natural");
    expect(first.status).toBe(200);
    expect(first.body).toEqual(observation);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(getEarthObservation).toHaveBeenCalledOnce();
  });

  it("does not cache an empty upstream observation", async () => {
    const emptyObservation = { ...observation, images: [] };
    const getEarthObservation = vi.fn().mockResolvedValue(emptyObservation);
    const app = createApp(env, {
      getEarthObservation,
    } as unknown as NasaClient);
    const first = await request(app).get("/api/earth?collection=enhanced");
    const second = await request(app).get("/api/earth?collection=enhanced");
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("MISS");
    expect(getEarthObservation).toHaveBeenCalledTimes(2);
  });

  it.each(["date=2026-02-30", "date=2030-01-01", "collection=infrared"])(
    "rejects invalid Earth searches: %s",
    async (query) => {
      const app = createApp(env, {
        getEarthObservation: vi.fn(),
      } as unknown as NasaClient);
      expect((await request(app).get(`/api/earth?${query}`)).status).toBe(400);
    },
  );
});
