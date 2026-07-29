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
});
