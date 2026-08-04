import request from "supertest";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type { Apod } from "@mission-control/shared";
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
const apod: Apod = {
  date: "2024-01-01",
  title: "Test nebula",
  explanation: "A distant nebula.",
  mediaType: "image",
  mediaUrl: "https://example.com/image.jpg",
  hdUrl: null,
  thumbnailUrl: null,
  copyright: null,
};

describe("GET /api/apod", () => {
  it("normalizes a successful APOD request and caches the result", async () => {
    const getApod = vi.fn().mockResolvedValue(apod);
    const app = createApp(env, { getApod } as unknown as NasaClient);
    const first = await request(app).get("/api/apod?date=2024-01-01");
    const second = await request(app).get("/api/apod?date=2024-01-01");
    expect(first.status).toBe(200);
    expect(first.body).toEqual(apod);
    expect(first.headers["x-cache"]).toBe("MISS");
    expect(second.headers["x-cache"]).toBe("HIT");
    expect(getApod).toHaveBeenCalledTimes(1);
  });

  it("rejects impossible and out-of-range dates without calling NASA", async () => {
    const getApod = vi.fn();
    const app = createApp(env, { getApod } as unknown as NasaClient);
    const response = await request(app).get("/api/apod?date=2024-02-31");
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      error: { code: "INVALID_REQUEST" },
    });
    expect(getApod).not.toHaveBeenCalled();
  });

  it("ignores hosting metadata while validating documented parameters", async () => {
    const getApod = vi.fn().mockResolvedValue(apod);
    const app = createApp(env, { getApod } as unknown as NasaClient);
    const response = await request(app).get(
      "/api/apod?date=2024-01-01&path=apod",
    );
    expect(response.status).toBe(200);
    expect(getApod).toHaveBeenCalledWith("2024-01-01");
  });

  it("rejects unsupported query parameters", async () => {
    const app = createApp(env, { getApod: vi.fn() } as unknown as NasaClient);
    const response = await request(app).get("/api/apod?count=10");
    expect(response.status).toBe(400);
  });

  it("adds security headers and does not expose Express", async () => {
    const app = createApp(env, {
      getApod: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app).get("/api/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
  });

  it("serves the SPA entry point for direct client-side routes", async () => {
    const staticDirectory = fileURLToPath(
      new URL("./fixtures/client", import.meta.url),
    );
    const app = createApp(
      env,
      { getApod: vi.fn() } as unknown as NasaClient,
      staticDirectory,
    );
    const response = await request(app).get("/apod?date=2024-01-01");
    expect(response.status).toBe(200);
    expect(response.text).toContain('<div id="root"></div>');
  });
});
