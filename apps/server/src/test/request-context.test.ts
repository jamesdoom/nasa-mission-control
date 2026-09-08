import request from "supertest";
import { createApp } from "../app.js";
import { parseEnv } from "../config/env.js";
import { describe, expect, it, vi } from "vitest";
import {
  applicationUpstreamBudgetMs,
  requestContext,
} from "../lib/request-context.js";
import { NasaClient } from "../lib/nasa-client.js";
import { logger } from "../lib/logger.js";

describe("request correlation and upstream deadline", () => {
  it("returns a correlated HTTP error before the monitor deadline", async () => {
    const fetchImpl: typeof fetch = (_url, options) =>
      new Promise((_resolve, reject) => {
        const signal = options?.signal;
        if (!signal) throw new Error("Missing signal");
        signal.addEventListener(
          "abort",
          () => reject(new DOMException("deadline", "TimeoutError")),
          { once: true },
        );
      });
    const env = parseEnv({
      NODE_ENV: "test",
      NASA_API_KEY: "DEMO_KEY",
      NASA_REQUEST_TIMEOUT_MS: "30000",
    });
    const app = createApp(
      env,
      new NasaClient({ apiKey: "DEMO_KEY", timeoutMs: 30_000, fetchImpl }),
    );
    const started = performance.now();
    const response = await request(app)
      .get(
        "/api/space-weather?startDate=2024-05-10&endDate=2024-05-11&category=all",
      )
      .set("x-request-id", "monitor-deadline-test");
    expect(response.status).toBe(503);
    expect(response.headers["x-request-id"]).toBe("monitor-deadline-test");
    expect(response.headers["cache-control"]).toBe("no-store");
    expect(performance.now() - started).toBeLessThan(12_000);
  }, 15_000);

  it("isolates concurrent request logs and excludes signals and secrets", async () => {
    const log = vi.spyOn(console, "info").mockImplementation(() => undefined);
    try {
      await Promise.all(
        ["first", "second"].map((requestId) =>
          requestContext.run(
            { requestId, signal: new AbortController().signal },
            async () => {
              await Promise.resolve();
              logger.info("test.event", { upstreamPath: "/DONKI/FLR" });
            },
          ),
        ),
      );
      expect(
        log.mock.calls.map(
          ([entry]) => JSON.parse(String(entry)) as { requestId: string },
        ),
      ).toEqual([
        expect.objectContaining({ requestId: "first" }),
        expect.objectContaining({ requestId: "second" }),
      ]);
      expect(JSON.stringify(log.mock.calls)).not.toContain("signal");
    } finally {
      log.mockRestore();
    }
  });

  it("uses one request deadline for all three DONKI calls", async () => {
    expect(applicationUpstreamBudgetMs).toBe(10_000);
    const controller = new AbortController();
    const signals: AbortSignal[] = [];
    const fetchImpl: typeof fetch = (_url, options) =>
      new Promise((_resolve, reject) => {
        const signal = options?.signal;
        if (!signal) throw new Error("Missing abort signal");
        signals.push(signal);
        signal.addEventListener(
          "abort",
          () =>
            reject(
              signal.reason instanceof Error
                ? signal.reason
                : new Error("Aborted"),
            ),
          {
            once: true,
          },
        );
      });
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 30_000,
      fetchImpl,
    });
    const result = requestContext.run(
      { requestId: "deadline-test", signal: controller.signal },
      () => client.getSpaceWeather("2024-05-10", "2024-05-11", "all"),
    );
    const assertion = expect(result).rejects.toMatchObject({
      status: 503,
      code: "UPSTREAM_UNAVAILABLE",
    });
    controller.abort(new DOMException("deadline", "TimeoutError"));
    await assertion;
    expect(signals).toHaveLength(3);
    expect(signals.every((signal) => signal.aborted)).toBe(true);
  });

  it("maps a body timeout to unavailable rather than malformed JSON", async () => {
    const response = Response.json({});
    vi.spyOn(response, "json").mockRejectedValue(
      new DOMException("deadline", "AbortError"),
    );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl: vi.fn().mockResolvedValue(response),
    });
    await expect(
      client.getSpaceWeather("2024-05-10", "2024-05-11", "flare"),
    ).rejects.toMatchObject({ status: 503 });
  });
});
