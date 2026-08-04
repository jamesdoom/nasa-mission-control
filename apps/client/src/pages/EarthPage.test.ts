import { describe, expect, it } from "vitest";
import { collectionSearchParams } from "./EarthPage";

describe("Earth collection navigation", () => {
  it("preserves the resolved date and selected frame", () => {
    const current = new URLSearchParams({
      collection: "natural",
      image: "7",
    });
    const next = collectionSearchParams(current, "enhanced", "2026-08-02");
    expect(next.toString()).toBe("collection=enhanced&date=2026-08-02&image=7");
  });
});
