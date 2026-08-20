import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { getMissionMapGroup, missionMapGroups } from "./solarSystemMap";

describe("solar-system mission map", () => {
  it("places every archive mission in exactly one destination group", () => {
    const mapped = missionMapGroups.flatMap((group) => group.missions);
    expect(mapped).toHaveLength(missions.length);
    expect(new Set(mapped.map((mission) => mission.slug)).size).toBe(
      missions.length,
    );
  });

  it("derives counts from archive records", () => {
    const outerSystem = getMissionMapGroup("Outer Solar System");
    expect(outerSystem?.missions.map((mission) => mission.slug)).toEqual([
      "voyager-1",
      "juno",
      "cassini",
    ]);
    expect(outerSystem?.milestoneCount).toBeGreaterThan(6);
    expect(outerSystem?.operatingCount).toBe(2);
  });

  it("rejects unknown destination state", () => {
    expect(getMissionMapGroup("Pluto")).toBeUndefined();
  });
});
