import { describe, expect, it, vi } from "vitest";
import { NasaClient } from "../lib/nasa-client.js";

describe("NasaClient", () => {
  it("maps NASA snake_case fields to the internal model", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          date: "2024-01-01",
          title: "Orbit",
          explanation: "Test",
          media_type: "video",
          url: "https://youtube.com/embed/example",
          thumbnail_url: "https://example.com/thumb.jpg",
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    await expect(client.getApod("2024-01-01")).resolves.toMatchObject({
      mediaType: "video",
      mediaUrl: "https://youtube.com/embed/example",
      hdUrl: null,
    });
    const url = fetchImpl.mock.calls[0]?.[0] as URL;
    expect(url.searchParams.get("api_key")).toBe("secret");
    expect(url.searchParams.get("thumbs")).toBe("true");
  });

  it("rejects malformed successful data", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response("{}", {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    await expect(client.getApod("2024-01-01")).rejects.toMatchObject({
      code: "UPSTREAM_UNAVAILABLE",
    });
  });
});
