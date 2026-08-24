import request from "supertest";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import type {
  ApiErrorResponse,
  Apod,
  HealthStatus,
} from "@mission-control/shared";
import { createApp } from "../app.js";
import type { Env } from "../config/env.js";
import type { NasaClient } from "../lib/nasa-client.js";
import { HttpError } from "../lib/http-error.js";

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
    expect(first.headers["cache-control"]).toBe("public, max-age=300");
    expect(first.headers["cdn-cache-control"]).toBe(
      "public, max-age=86400, stale-while-revalidate=604800",
    );
    expect(second.headers["cdn-cache-control"]).toBe(
      first.headers["cdn-cache-control"],
    );
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

  it("does not cache upstream failures and returns retry guidance", async () => {
    const getApod = vi
      .fn()
      .mockRejectedValueOnce(new Error("upstream"))
      .mockResolvedValue(apod);
    const app = createApp(env, { getApod } as unknown as NasaClient);
    const failed = await request(app).get("/api/apod?date=2024-01-01");
    const recovered = await request(app).get("/api/apod?date=2024-01-01");
    expect(failed.status).toBe(500);
    expect(failed.headers["cache-control"]).toBe("no-store");
    expect(failed.headers["cdn-cache-control"]).toBeUndefined();
    expect(failed.headers["retry-after"]).toBe("30");
    const body = JSON.parse(failed.text) as ApiErrorResponse;
    expect(body.error).toMatchObject({ retryable: true });
    expect(recovered.status).toBe(200);
    expect(getApod).toHaveBeenCalledTimes(2);
  });

  it("serves an explicitly marked stale value during a retryable upstream failure", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const getApod = vi
      .fn()
      .mockResolvedValueOnce(apod)
      .mockRejectedValueOnce(
        new HttpError(503, "UPSTREAM_UNAVAILABLE", "NASA unavailable"),
      );
    const app = createApp({ ...env, NASA_CACHE_TTL_MS: 10 }, {
      getApod,
    } as unknown as NasaClient);
    await request(app).get("/api/apod?date=2024-01-01");
    vi.advanceTimersByTime(11);
    const degraded = await request(app).get("/api/apod?date=2024-01-01");
    expect(degraded.status).toBe(200);
    expect(degraded.body).toEqual(apod);
    expect(degraded.headers["x-cache"]).toBe("STALE");
    expect(degraded.headers["x-data-status"]).toBe("stale-fallback");
    expect(degraded.headers.warning).toContain("Response is stale");
    vi.useRealTimers();
  });

  it("exposes process-scoped reliability counters without caching", async () => {
    const app = createApp(env, { getApod: vi.fn() } as unknown as NasaClient);
    const response = await request(app).get("/api/health/reliability");
    expect(response.status).toBe(200);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(response.body).toMatchObject({
      scope: "current-process",
      upstreams: {},
      caches: {},
    });
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

  it("adds security headers and does not expose Express", async () => {
    const app = createApp(env, {
      getApod: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app).get("/api/health");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
    expect(response.headers["x-powered-by"]).toBeUndefined();
    expect(response.headers["cache-control"]).toBe("no-store");
    const health = response.body as HealthStatus;
    expect(health).toMatchObject({
      status: "ok",
      service: "mission-control-api",
    });
    expect(health.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("does not advertise the development CORS origin in production", async () => {
    const app = createApp({ ...env, NODE_ENV: "production" }, {
      getApod: vi.fn(),
    } as unknown as NasaClient);
    const response = await request(app)
      .get("/api/health")
      .set("origin", "https://example.com");
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("replaces unsafe caller-supplied request identifiers", async () => {
    const app = createApp(env, { getApod: vi.fn() } as unknown as NasaClient);
    const response = await request(app)
      .get("/api/health")
      .set("x-request-id", "unsafe request id");
    expect(response.headers["x-request-id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f-]{27}$/,
    );
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
