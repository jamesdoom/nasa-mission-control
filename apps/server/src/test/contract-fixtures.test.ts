import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { logger } from "../lib/logger.js";
import { NasaClient } from "../lib/nasa-client.js";

async function fixture(name: string): Promise<unknown> {
  const path = fileURLToPath(new URL(`fixtures/nasa/${name}`, import.meta.url));
  return JSON.parse(await readFile(path, "utf8")) as unknown;
}

function responses(...payloads: unknown[]) {
  return vi
    .fn()
    .mockImplementation(() =>
      Promise.resolve(Response.json(payloads.shift() ?? null)),
    );
}

function without(payload: unknown, path: (string | number)[]): unknown {
  const copy = structuredClone(payload);
  let current: unknown = copy;
  for (const segment of path.slice(0, -1)) {
    if (typeof segment === "number" && Array.isArray(current)) {
      current = current[segment];
    } else if (
      typeof segment === "string" &&
      current !== null &&
      typeof current === "object"
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else throw new Error(`Fixture path is invalid at ${String(segment)}.`);
  }
  const final = path.at(-1);
  if (typeof final === "number" && Array.isArray(current)) {
    current.splice(final, 1);
  } else if (
    typeof final === "string" &&
    current !== null &&
    typeof current === "object"
  ) {
    Reflect.deleteProperty(current, final);
  } else throw new Error(`Fixture path is invalid at ${String(final)}.`);
  return copy;
}

function client(...payloads: unknown[]): NasaClient {
  return new NasaClient({
    apiKey: "fixture-key",
    timeoutMs: 1_000,
    fetchImpl: responses(...payloads),
  });
}

describe("sanitized NASA contract fixtures", () => {
  it("normalizes a captured fixture for every upstream", async () => {
    const apod = await fixture("apod-2024-01-01.json");
    const neo = await fixture("neows-feed.json");
    const flare = await fixture("donki-flare.json");
    const cme = await fixture("donki-cme.json");
    const storm = await fixture("donki-storm.json");
    const epicAvailable = await fixture("epic-available.json");
    const epicNatural = await fixture("epic-natural.json");
    const mediaSearch = await fixture("media-search.json");
    const mediaManifest = await fixture("media-manifest.json");

    await expect(client(apod).getApod("2024-01-01")).resolves.toMatchObject({
      date: "2024-01-01",
      mediaType: "image",
    });
    await expect(
      client(neo).getAsteroidFeed("2026-07-29", "2026-07-29"),
    ).resolves.toMatchObject({ totalCount: 1 });
    await expect(
      client(flare, cme, storm).getSpaceWeather(
        "2024-05-10",
        "2024-05-11",
        "all",
      ),
    ).resolves.toMatchObject({ counts: { flare: 1, cme: 1, storm: 1 } });
    await expect(
      client(epicAvailable, epicNatural).getEarthObservation("natural"),
    ).resolves.toMatchObject({
      date: "2026-08-24",
      images: [{ id: "20260824005516" }],
    });
    await expect(
      client(mediaSearch).searchMedia("apollo", "image", 1, 24),
    ).resolves.toMatchObject({
      totalHits: 5909,
      items: [{ mediaType: "image" }],
    });
    const media = await client(mediaSearch, mediaManifest).getMediaDetail(
      "APOLLO_50TH_FULL_COLOR",
    );
    expect(media).toMatchObject({
      nasaId: "APOLLO_50TH_FULL_COLOR",
    });
    expect(media.downloadUrl).toContain("~orig.png");
  });

  it("turns required-field mutations into actionable drift evidence", async () => {
    const fixtures = {
      apod: await fixture("apod-2024-01-01.json"),
      neo: await fixture("neows-feed.json"),
      flare: await fixture("donki-flare.json"),
      cme: await fixture("donki-cme.json"),
      storm: await fixture("donki-storm.json"),
      epicAvailable: await fixture("epic-available.json"),
      epicNatural: await fixture("epic-natural.json"),
      mediaSearch: await fixture("media-search.json"),
      mediaManifest: await fixture("media-manifest.json"),
    };
    const cases: {
      name: string;
      payloads: unknown[];
      invoke: (nasa: NasaClient) => Promise<unknown>;
      upstreamPath: string;
      issuePath: string;
    }[] = [
      {
        name: "APOD",
        payloads: [without(fixtures.apod, ["media_type"])],
        invoke: (nasa) => nasa.getApod("2024-01-01"),
        upstreamPath: "/planetary/apod",
        issuePath: "media_type",
      },
      {
        name: "NeoWs",
        payloads: [without(fixtures.neo, ["element_count"])],
        invoke: (nasa) => nasa.getAsteroidFeed("2026-07-29", "2026-07-29"),
        upstreamPath: "/neo/rest/v1/feed",
        issuePath: "element_count",
      },
      {
        name: "DONKI flare",
        payloads: [without(fixtures.flare, [0, "flrID"])],
        invoke: (nasa) =>
          nasa.getSpaceWeather("2024-05-10", "2024-05-11", "flare"),
        upstreamPath: "/DONKI/FLR",
        issuePath: "0.flrID",
      },
      {
        name: "DONKI CME",
        payloads: [without(fixtures.cme, [0, "activityID"])],
        invoke: (nasa) =>
          nasa.getSpaceWeather("2024-05-10", "2024-05-11", "cme"),
        upstreamPath: "/DONKI/CME",
        issuePath: "0.activityID",
      },
      {
        name: "DONKI storm",
        payloads: [without(fixtures.storm, [0, "gstID"])],
        invoke: (nasa) =>
          nasa.getSpaceWeather("2024-05-10", "2024-05-11", "storm"),
        upstreamPath: "/DONKI/GST",
        issuePath: "0.gstID",
      },
      {
        name: "EPIC available dates",
        payloads: [without(fixtures.epicAvailable, [0, "date"])],
        invoke: (nasa) => nasa.getEarthObservation("natural"),
        upstreamPath: "/api/natural/all",
        issuePath: "0.date",
      },
      {
        name: "EPIC imagery",
        payloads: [
          fixtures.epicAvailable,
          without(fixtures.epicNatural, [0, "centroid_coordinates", "lat"]),
        ],
        invoke: (nasa) => nasa.getEarthObservation("natural"),
        upstreamPath: "/api/natural/date/2026-08-24",
        issuePath: "0.centroid_coordinates.lat",
      },
      {
        name: "NASA Media search",
        payloads: [
          without(fixtures.mediaSearch, [
            "collection",
            "items",
            0,
            "data",
            0,
            "nasa_id",
          ]),
        ],
        invoke: (nasa) => nasa.searchMedia("apollo", "image", 1, 24),
        upstreamPath: "/search",
        issuePath: "collection.items.0.data.0.nasa_id",
      },
      {
        name: "NASA Media manifest",
        payloads: [
          fixtures.mediaSearch,
          without(fixtures.mediaManifest, ["collection", "items", 0, "href"]),
        ],
        invoke: (nasa) => nasa.getMediaDetail("APOLLO_50TH_FULL_COLOR"),
        upstreamPath: "/search",
        issuePath: "collection.items.0.href",
      },
    ];

    for (const drift of cases) {
      const log = vi.spyOn(logger, "error").mockImplementation(() => undefined);
      await expect(
        drift.invoke(client(...drift.payloads)),
        drift.name,
      ).rejects.toMatchObject({
        status: 502,
        code: "UPSTREAM_UNAVAILABLE",
      });
      expect(log, drift.name).toHaveBeenCalledWith(
        "upstream.schema_drift",
        expect.objectContaining({
          upstreamPath: drift.upstreamPath,
          firstIssuePath: drift.issuePath,
        }),
      );
      log.mockRestore();
    }
  });
});
