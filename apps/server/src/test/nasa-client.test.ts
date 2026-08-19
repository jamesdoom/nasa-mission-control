import { describe, expect, it, vi } from "vitest";
import { NasaClient } from "../lib/nasa-client.js";

describe("NasaClient", () => {
  it("maps timeouts, rate limits, non-JSON, and malformed JSON to stable errors", async () => {
    const cases: { result: Promise<Response>; code: string }[] = [
      {
        result: Promise.reject(
          Object.assign(new Error("late"), { name: "TimeoutError" }),
        ),
        code: "UPSTREAM_UNAVAILABLE",
      },
      {
        result: Promise.resolve(new Response("limited", { status: 429 })),
        code: "RATE_LIMITED",
      },
      {
        result: Promise.resolve(
          new Response("html", {
            status: 200,
            headers: { "content-type": "text/html" },
          }),
        ),
        code: "UPSTREAM_UNAVAILABLE",
      },
      {
        result: Promise.resolve(
          new Response("{", {
            status: 200,
            headers: { "content-type": "application/json" },
          }),
        ),
        code: "UPSTREAM_UNAVAILABLE",
      },
    ];
    for (const { result, code } of cases) {
      const client = new NasaClient({
        apiKey: "secret",
        timeoutMs: 1000,
        fetchImpl: vi.fn().mockReturnValue(result),
      });
      await expect(client.getApod("2024-01-01")).rejects.toMatchObject({
        code,
      });
    }
  });

  it("normalizes EPIC metadata and builds exact archive and GIBS URLs", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ date: "2026-08-01" }]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify([
            {
              identifier: "20260801004554",
              caption: "Earth from DSCOVR",
              image: "epic_1b_20260801004554",
              date: "2026-08-01 00:45:54",
              centroid_coordinates: { lat: 5.3, lon: -156.2 },
            },
          ]),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    const result = await client.getEarthObservation("natural");
    expect(result).toMatchObject({
      date: "2026-08-01",
      latestAvailableDate: "2026-08-01",
      collection: "natural",
      images: [{ capturedAtUtc: "2026-08-01T00:45:54.000Z" }],
    });
    expect(result.images[0]?.imageUrl).toBe(
      "https://epic.gsfc.nasa.gov/archive/natural/2026/08/01/jpg/epic_1b_20260801004554.jpg",
    );
    const gibs = new URL(result.dailyComposite.imageUrl);
    expect(gibs.searchParams.get("VERSION")).toBe("1.3.0");
    expect(gibs.searchParams.get("BBOX")).toBe("-90,-180,90,180");
    expect(gibs.searchParams.get("TIME")).toBe("2026-08-01");
  });

  it("retries an empty EPIC response when NASA lists the date as available", async () => {
    const image = {
      identifier: "20260801004554",
      caption: "Earth from DSCOVR",
      image: "epic_RGB_20260801004554",
      date: "2026-08-01 00:45:54",
      centroid_coordinates: { lat: 5.3, lon: -156.2 },
    };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(JSON.stringify([{ date: "2026-08-01" }]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response("[]", {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify([image]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    const result = await client.getEarthObservation("enhanced", "2026-08-01");
    expect(result.images).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

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

  it("normalizes a NeoWs feed and derives responsible summary values", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          element_count: 1,
          near_earth_objects: {
            "2026-07-29": [
              {
                id: "3827572",
                name: "(2018 RL4)",
                nasa_jpl_url:
                  "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=3827572",
                estimated_diameter: {
                  meters: {
                    estimated_diameter_min: 75.25,
                    estimated_diameter_max: 168.28,
                  },
                },
                is_potentially_hazardous_asteroid: false,
                is_sentry_object: false,
                close_approach_data: [
                  {
                    close_approach_date: "2026-07-29",
                    epoch_date_close_approach: 1785347400000,
                    relative_velocity: { kilometers_per_hour: "89622.7" },
                    miss_distance: {
                      kilometers: "67051570.6",
                      lunar: "174.35",
                    },
                    orbiting_body: "Earth",
                  },
                ],
              },
            ],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    const feed = await client.getAsteroidFeed("2026-07-29", "2026-07-29");
    expect(feed).toMatchObject({
      totalCount: 1,
      potentiallyHazardousCount: 0,
      closestApproachKm: 67051570.6,
      asteroids: [
        {
          id: "3827572",
          potentiallyHazardous: false,
          approach: { velocityKph: 89622.7, missDistanceLunar: 174.35 },
        },
      ],
    });
    const url = fetchImpl.mock.calls[0]?.[0] as URL;
    expect(url.searchParams.get("api_key")).toBe("secret");
    expect(url.searchParams.get("start_date")).toBe("2026-07-29");
  });

  it("normalizes Collection+JSON media search results", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          collection: {
            metadata: { total_hits: 25 },
            items: [
              {
                data: [
                  {
                    nasa_id: "AS11-40-5903",
                    title: "Buzz Aldrin on the Moon",
                    description: "Apollo 11 lunar surface activity.",
                    media_type: "image",
                    date_created: "1969-07-20T00:00:00Z",
                    center: "JSC",
                    photographer: "Neil Armstrong",
                    keywords: ["Apollo 11", "Moon"],
                  },
                ],
                links: [
                  {
                    href: "https://images-assets.nasa.gov/image/example/thumb.jpg",
                    rel: "alternate",
                    render: "image",
                  },
                ],
              },
            ],
          },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
    );
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    await expect(
      client.searchMedia("apollo", "image", 1, 24),
    ).resolves.toMatchObject({
      totalHits: 25,
      totalPages: 2,
      items: [{ nasaId: "AS11-40-5903", center: "JSC", mediaType: "image" }],
    });
    const url = fetchImpl.mock.calls[0]?.[0] as URL;
    expect(url.hostname).toBe("images-api.nasa.gov");
    expect(url.searchParams.get("api_key")).toBeNull();
    expect(url.searchParams.get("page_size")).toBe("24");
  });

  it("normalizes DONKI flares, CMEs, and storms into one chronology", async () => {
    const payloads: Record<string, unknown> = {
      FLR: [
        {
          flrID: "2026-08-01T10:00:00-FLR-001",
          instruments: [{ displayName: "GOES: EXIS" }],
          beginTime: "2026-08-01T10:00Z",
          peakTime: "2026-08-01T10:05Z",
          endTime: "2026-08-01T10:10Z",
          classType: "M1.2",
          sourceLocation: "N10E20",
          activeRegionNum: 14494,
          note: "Observed X-ray flare.",
          link: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/FLR/1/-1",
          linkedEvents: null,
        },
      ],
      CME: [
        {
          activityID: "2026-08-01T11:00:00-CME-001",
          instruments: [{ displayName: "SOHO: LASCO/C2" }],
          startTime: "2026-08-01T11:00Z",
          sourceLocation: "N10E20",
          activeRegionNum: 14494,
          note: "CME observed to the east.",
          link: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/2/-1",
          cmeAnalyses: [
            { isMostAccurate: true, speed: 600, halfAngle: 30, type: "C" },
          ],
          linkedEvents: [{ activityID: "2026-08-01T10:00:00-FLR-001" }],
        },
      ],
      GST: [
        {
          gstID: "2026-08-02T15:00:00-GST-001",
          startTime: "2026-08-02T15:00Z",
          allKpIndex: [
            {
              observedTime: "2026-08-02T18:00Z",
              kpIndex: 5.67,
              source: "NOAA",
            },
          ],
          link: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/3/-1",
          linkedEvents: [],
        },
      ],
    };
    const fetchImpl = vi.fn().mockImplementation((url: URL) => {
      const endpoint = url.pathname.split("/").pop() ?? "";
      return Promise.resolve(
        new Response(JSON.stringify(payloads[endpoint]), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      );
    });
    const client = new NasaClient({
      apiKey: "secret",
      timeoutMs: 1000,
      fetchImpl,
    });
    const feed = await client.getSpaceWeather(
      "2026-07-27",
      "2026-08-03",
      "all",
    );
    expect(feed.counts).toEqual({ flare: 1, cme: 1, storm: 1 });
    expect(feed.events.map((event) => event.category)).toEqual([
      "storm",
      "cme",
      "flare",
    ]);
    expect(feed.events[0]).toMatchObject({
      title: "Geomagnetic storm observation",
      measurements: [{ label: "Peak Kp", value: "5.67" }],
    });
    expect(feed.events[1]).toMatchObject({
      measurements: [{ value: "600 km/s" }, { value: "60°" }],
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });
});
