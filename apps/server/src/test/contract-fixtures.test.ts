import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { NasaClient } from "../lib/nasa-client.js";

async function fixture(name: string): Promise<unknown> {
  const path = fileURLToPath(new URL(`fixtures/nasa/${name}`, import.meta.url));
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

describe("sanitized NASA contract fixtures", () => {
  it("keeps captured APOD and NeoWs shapes compatible with normalization", async () => {
    const apod = await fixture("apod-2024-01-01.json");
    const neo = await fixture("neows-feed.json");
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(Response.json(apod))
      .mockResolvedValueOnce(Response.json(neo));
    const client = new NasaClient({
      apiKey: "fixture-key",
      timeoutMs: 1_000,
      fetchImpl,
    });
    await expect(client.getApod("2024-01-01")).resolves.toMatchObject({
      date: "2024-01-01",
      mediaType: "image",
    });
    await expect(
      client.getAsteroidFeed("2026-07-29", "2026-07-29"),
    ).resolves.toMatchObject({ totalCount: 1 });
  });

  it("turns fixture schema drift into a stable failure", async () => {
    const payload = (await fixture("apod-2024-01-01.json")) as Record<
      string,
      unknown
    >;
    delete payload.media_type;
    const client = new NasaClient({
      apiKey: "fixture-key",
      timeoutMs: 1_000,
      fetchImpl: vi.fn().mockResolvedValue(Response.json(payload)),
    });
    await expect(client.getApod("2024-01-01")).rejects.toMatchObject({
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  });
});
