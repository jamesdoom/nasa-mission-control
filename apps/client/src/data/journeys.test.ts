import { describe, expect, it } from "vitest";
import { discoveryJourneys } from "./journeys";

describe("discovery journeys", () => {
  it("uses unique internal steps and official HTTPS sources", () => {
    expect(new Set(discoveryJourneys.map((journey) => journey.id)).size).toBe(
      discoveryJourneys.length,
    );
    for (const journey of discoveryJourneys) {
      expect(journey.steps).toHaveLength(3);
      expect(journey.steps.every((step) => step.to.startsWith("/"))).toBe(true);
      expect(journey.source.url).toMatch(/^https:\/\//);
    }
  });
});
