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
      expect(new URL(journey.source.url).hostname.endsWith("nasa.gov")).toBe(
        true,
      );
    }
  });

  it("connects every expanded mission to a dedicated path", () => {
    for (const slug of ["hubble", "juno", "cassini", "artemis-i"]) {
      expect(
        discoveryJourneys.some((journey) =>
          journey.steps.some((step) => step.to === `/missions/${slug}`),
        ),
      ).toBe(true);
    }
  });
});
