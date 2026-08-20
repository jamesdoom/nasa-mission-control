import { describe, expect, it } from "vitest";
import { getMission } from "./missions";
import { scaleProfiles } from "./scaleProfiles";

describe("source-checked scale profiles", () => {
  it("keeps every reference unique, finite, and linked to NASA", () => {
    expect(new Set(scaleProfiles.map(({ id }) => id)).size).toBe(
      scaleProfiles.length,
    );
    for (const profile of scaleProfiles) {
      expect(profile.distanceKm).toBeGreaterThan(0);
      expect(Number.isFinite(profile.distanceKm)).toBe(true);
      expect(new URL(profile.source.url).hostname.endsWith("nasa.gov")).toBe(
        true,
      );
      expect(profile.missionSlugs.every((slug) => getMission(slug))).toBe(true);
    }
  });
});
