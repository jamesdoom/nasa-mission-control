import { describe, expect, it } from "vitest";
import { missions } from "../data/missions";
import {
  comparisonTimeline,
  maxComparedMissions,
  missionSelectionFrom,
  toggleMissionSelection,
} from "./missionComparison";

describe("mission comparison", () => {
  it("keeps unique known selections within the comparison limit", () => {
    expect(
      missionSelectionFrom("apollo-11,unknown,apollo-11,artemis-i,juno,webb"),
    ).toEqual(["apollo-11", "artemis-i", "juno"]);
    expect(maxComparedMissions).toBe(3);
  });

  it("adds and removes missions without exceeding the limit", () => {
    expect(toggleMissionSelection(["apollo-11"], "artemis-i")).toEqual([
      "apollo-11",
      "artemis-i",
    ]);
    expect(toggleMissionSelection(["apollo-11"], "apollo-11")).toEqual([]);
    expect(
      toggleMissionSelection(["apollo-11", "artemis-i", "juno"], "webb"),
    ).toHaveLength(3);
  });

  it("merges selected mission events in chronological order", () => {
    const selected = missions.filter((mission) =>
      ["apollo-11", "artemis-i"].includes(mission.slug),
    );
    const timeline = comparisonTimeline(selected);
    expect(timeline[0]?.missionSlug).toBe("apollo-11");
    expect(timeline.at(-1)?.missionSlug).toBe("artemis-i");
    expect(timeline).toHaveLength(
      selected.reduce((total, mission) => total + mission.timeline.length, 0),
    );
  });
});
