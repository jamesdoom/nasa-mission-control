import { describe, expect, it } from "vitest";
import {
  flightLogCollectionFrom,
  flightLogSortFrom,
  matchesFlightLogSearch,
  sortFlightLogItems,
} from "./flightLogFilters";

describe("Flight Log organization", () => {
  it("falls back safely for unknown URL controls", () => {
    expect(flightLogCollectionFrom("unknown")).toBe("all");
    expect(flightLogSortFrom("oldest")).toBe("default");
  });

  it("matches normalized text across record metadata", () => {
    expect(matchesFlightLogSearch("  MARS ", ["Curiosity", "Mars rover"])).toBe(
      true,
    );
    expect(matchesFlightLogSearch("saturn", ["Curiosity", null])).toBe(false);
  });

  it("sorts titles without mutating the saved order", () => {
    const items = [{ title: "Voyager 2" }, { title: "Apollo 11" }];
    const sorted = sortFlightLogItems(items, "az", (item) => item.title);
    expect(sorted.map((item) => item.title)).toEqual([
      "Apollo 11",
      "Voyager 2",
    ]);
    expect(items[0]?.title).toBe("Voyager 2");
  });
});
