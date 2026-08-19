import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import type { ApiErrorResponse } from "@mission-control/shared";
import { createApp } from "../app.js";
import type { Env } from "../config/env.js";
import { logger } from "../lib/logger.js";
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

describe("POST /api/client-errors", () => {
  it("records a bounded, structured client runtime report", async () => {
    const log = vi.spyOn(logger, "error").mockImplementation(() => undefined);
    const app = createApp(env, {} as NasaClient);
    const response = await request(app).post("/api/client-errors").send({
      kind: "error",
      message: "Lazy route failed",
      path: "/earth?collection=natural",
    });
    expect(response.status).toBe(204);
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(log).toHaveBeenCalledWith(
      "client.runtime_error",
      expect.objectContaining({
        kind: "error",
        path: "/earth?collection=natural",
      }),
    );
    log.mockRestore();
  });

  it("rejects oversized or unexpected report fields", async () => {
    const app = createApp(env, {} as NasaClient);
    const response = await request(app)
      .post("/api/client-errors")
      .send({
        kind: "error",
        message: "x".repeat(301),
        path: "/earth",
        stack: "not accepted",
      });
    expect(response.status).toBe(400);
    const body = JSON.parse(response.text) as ApiErrorResponse;
    expect(body.error).toMatchObject({ retryable: false });
  });
});
