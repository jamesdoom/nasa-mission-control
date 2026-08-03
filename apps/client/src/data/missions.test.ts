import { describe, expect, it } from "vitest";
import { missions } from "./missions";

describe("curated mission archive", () => {
  it("keeps every record source-backed and uniquely addressable", () => {
    expect(new Set(missions.map((mission) => mission.slug)).size).toBe(
      missions.length,
    );
    for (const mission of missions) {
      expect(mission.timeline.length).toBeGreaterThanOrEqual(4);
      expect(mission.sources.length).toBeGreaterThanOrEqual(2);
      expect(
        mission.sources.every((source) =>
          new URL(source.url).hostname.endsWith("nasa.gov"),
        ),
      ).toBe(true);
      expect(mission.image.nasaId).not.toBe("");
      expect(mission.verifiedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
