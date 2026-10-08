import { readFile } from "node:fs/promises";
import { describe, expect, it, vi } from "vitest";
import { NasaClient } from "../lib/nasa-client.js";

async function fixture(name: string): Promise<unknown> {
  return JSON.parse(
    await readFile(new URL(`fixtures/nasa/${name}`, import.meta.url), "utf8"),
  ) as unknown;
}

function requestUrl(input: Parameters<typeof fetch>[0] | undefined): URL {
  if (input === undefined) throw new Error("Missing upstream request.");
  return new URL(input instanceof Request ? input.url : input);
}

describe("DONKI public API migration", () => {
  it("uses the replacement endpoints without disclosing the NASA key", async () => {
    const payloads: Record<string, unknown> = {
      FLR: await fixture("donki-flare.json"),
      CME: await fixture("donki-cme.json"),
      GST: await fixture("donki-storm.json"),
    };
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation((input) => {
      const url = requestUrl(input);
      expect(url.origin).toBe("https://ccmc.gsfc.nasa.gov");
      expect(url.searchParams.get("startDate")).toBe("2024-05-10");
      expect(url.searchParams.get("endDate")).toBe("2024-05-11");
      expect([...url.searchParams.keys()].sort()).toEqual([
        "endDate",
        "startDate",
      ]);
      return Promise.resolve(
        Response.json(payloads[url.pathname.split("/").at(-1) ?? ""]),
      );
    });
    const client = new NasaClient({
      apiKey: "server-secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    const feed = await client.getSpaceWeather(
      "2024-05-10",
      "2024-05-11",
      "all",
    );
    expect(feed.counts).toEqual({ flare: 1, cme: 1, storm: 1 });
    expect(
      fetchImpl.mock.calls.map(([input]) => requestUrl(input).pathname),
    ).toEqual([
      "/DONKI-API/get/FLR",
      "/DONKI-API/get/CME",
      "/DONKI-API/get/GST",
    ]);
  });

  it.each([
    ["flare", "FLR"],
    ["cme", "CME"],
    ["storm", "GST"],
  ] as const)(
    "requests only the selected %s category and preserves an empty feed",
    async (category, endpoint) => {
      const fetchImpl = vi
        .fn<typeof fetch>()
        .mockResolvedValue(Response.json([]));
      const client = new NasaClient({
        apiKey: "server-secret",
        timeoutMs: 1000,
        fetchImpl,
      });
      const feed = await client.getSpaceWeather(
        "2024-05-10",
        "2024-05-11",
        category,
      );
      expect(feed.events).toEqual([]);
      expect(fetchImpl).toHaveBeenCalledTimes(1);
      expect(requestUrl(fetchImpl.mock.calls[0]?.[0]).pathname).toBe(
        `/DONKI-API/get/${endpoint}`,
      );
    },
  );

  it("rejects a non-JSON category response instead of serving an incomplete feed", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockImplementation((input) =>
      Promise.resolve(
        requestUrl(input).pathname.endsWith("CME")
          ? new Response("<html>moved</html>", {
              headers: { "content-type": "text/html" },
            })
          : Response.json([]),
      ),
    );
    const client = new NasaClient({
      apiKey: "server-secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    await expect(
      client.getSpaceWeather("2024-05-10", "2024-05-11", "all"),
    ).rejects.toMatchObject({
      status: 502,
      code: "UPSTREAM_UNAVAILABLE",
    });
  });
});
