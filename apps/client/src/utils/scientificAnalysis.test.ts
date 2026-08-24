import { describe, expect, it } from "vitest";
import {
  asteroidDailyTrend,
  comparableDonkiEvents,
  earthTimeline,
} from "./scientificAnalysis";

describe("scientific analysis integrity", () => {
  it("aggregates normalized asteroid approaches without losing source measurements", () => {
    const trend = asteroidDailyTrend([
      {
        id: "1",
        name: "A",
        jplUrl: "https://example.com",
        potentiallyHazardous: false,
        sentryObject: false,
        diameterMeters: { min: 1, max: 2 },
        approach: {
          date: "2026-08-01",
          dateTimeUtc: "2026-08-01T00:00:00Z",
          velocityKph: 10,
          missDistanceKm: 30,
          missDistanceLunar: 1,
        },
      },
      {
        id: "2",
        name: "B",
        jplUrl: "https://example.com",
        potentiallyHazardous: true,
        sentryObject: false,
        diameterMeters: { min: 2, max: 3 },
        approach: {
          date: "2026-08-01",
          dateTimeUtc: "2026-08-01T01:00:00Z",
          velocityKph: 20,
          missDistanceKm: 20,
          missDistanceLunar: 1,
        },
      },
    ]);
    expect(trend).toEqual([
      { date: "2026-08-01", count: 2, hazardous: 1, closestKm: 20 },
    ]);
  });
  it("bounds DONKI comparisons and preserves EPIC sequence order", () => {
    const events = ["a", "b", "c", "d"].map((id) => ({
      id,
      category: "flare" as const,
      title: id,
      startTimeUtc: "2026-01-01T00:00:00Z",
      endTimeUtc: null,
      location: null,
      activeRegion: null,
      instruments: [],
      summary: id,
      measurements: [],
      linkedEventIds: [],
      sourceUrl: "https://example.com",
    }));
    expect(comparableDonkiEvents(events, ["a", "b", "c", "d"])).toHaveLength(3);
    expect(
      earthTimeline([
        {
          id: "one",
          caption: "Earth",
          capturedAtUtc: "2026-01-01T00:00:00Z",
          centroid: { latitude: 1, longitude: 2 },
          imageUrl: "https://example.com/a",
          thumbnailUrl: "https://example.com/b",
          downloadUrl: "https://example.com/c",
        },
      ])[0]?.sequence,
    ).toBe(1);
  });
});
