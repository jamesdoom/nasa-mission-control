import { describe, expect, it } from "vitest";
import {
  localDiscoveryIndex,
  relatedDiscoveryResults,
  searchDiscoveryIndex,
} from "./discoveryIndex";

describe("discovery intelligence", () => {
  it("filters cross-record metadata facets", () => {
    const results = searchDiscoveryIndex("", undefined, {
      destination: "Moon",
      evidence: "curated",
    });
    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every(
        (item) =>
          item.metadata.destination === "Moon" &&
          item.metadata.evidence === "curated",
      ),
    ).toBe(true);
  });

  it("explains recommendations with explicit shared metadata", () => {
    const artemis = localDiscoveryIndex.find(
      (item) => item.id === "mission-artemis-i",
    );
    expect(artemis).toBeDefined();
    const related = relatedDiscoveryResults(artemis ? [artemis] : []);
    expect(related.length).toBeGreaterThan(0);
    expect(
      related.every((item) =>
        item.reasons.every((reason) =>
          /^(Destination|Evidence|Topic):/.test(reason),
        ),
      ),
    ).toBe(true);
  });
});
