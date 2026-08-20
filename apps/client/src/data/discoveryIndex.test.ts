import { describe, expect, it } from "vitest";
import { localDiscoveryIndex, searchDiscoveryIndex } from "./discoveryIndex";

describe("unified discovery index", () => {
  it("indexes unique instruments, missions, and guided paths", () => {
    expect(new Set(localDiscoveryIndex.map(({ id }) => id)).size).toBe(
      localDiscoveryIndex.length,
    );
    expect(
      localDiscoveryIndex.some(({ id }) => id === "mission-artemis-i"),
    ).toBe(true);
    expect(
      localDiscoveryIndex.some(({ id }) => id === "path-artemis-return-moon"),
    ).toBe(true);
  });

  it("matches every query term and supports kind filters", () => {
    expect(
      searchDiscoveryIndex("lunar flight", "mission").map(({ title }) => title),
    ).toContain("Artemis I");
    expect(searchDiscoveryIndex("lunar flight", "instrument")).toEqual([]);
  });
});
