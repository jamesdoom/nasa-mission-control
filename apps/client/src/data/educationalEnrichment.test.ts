import { describe, expect, it } from "vitest";
import { missions } from "./missions";
import { storyCollections } from "./storyCollections";
import { learningTracks } from "./learningTracks";
import {
  learningEnrichment,
  missionEnrichment,
  storyEnrichment,
} from "./educationalEnrichment";

describe("educational enrichment integrity", () => {
  it("covers every mission with instruments, results, and an honest status note", () => {
    expect(Object.keys(missionEnrichment).sort()).toEqual(
      missions.map((mission) => mission.slug).sort(),
    );
    for (const mission of missions) {
      const entry = missionEnrichment[mission.slug];
      expect(entry).toBeDefined();
      if (!entry)
        throw new Error(`Missing mission enrichment: ${mission.slug}`);
      expect(entry.instruments.length).toBeGreaterThanOrEqual(3);
      expect(entry.results.length).toBeGreaterThanOrEqual(2);
      expect(entry.statusNote.length).toBeGreaterThan(25);
      expect(mission.verifiedAt).toBe("2026-08-26");
    }
  });

  it("gives every story one caption per chapter and a bounded conclusion", () => {
    expect(Object.keys(storyEnrichment).sort()).toEqual(
      storyCollections.map((story) => story.id).sort(),
    );
    for (const story of storyCollections) {
      const entry = storyEnrichment[story.id];
      expect(entry).toBeDefined();
      if (!entry) throw new Error(`Missing story enrichment: ${story.id}`);
      expect(entry.captions).toHaveLength(story.chapters.length);
      expect(entry.captions.every((caption) => caption.length > 20)).toBe(true);
      expect(entry.conclusion.length).toBeGreaterThan(80);
    }
  });

  it("gives every learning track a second prompt, synthesis, terms, and review date", () => {
    expect(Object.keys(learningEnrichment).sort()).toEqual(
      learningTracks.map((track) => track.id).sort(),
    );
    for (const track of learningTracks) {
      const entry = learningEnrichment[track.id];
      expect(entry).toBeDefined();
      if (!entry) throw new Error(`Missing learning enrichment: ${track.id}`);
      expect(entry.secondReflection.length).toBeGreaterThan(40);
      expect(entry.completion.length).toBeGreaterThan(70);
      expect(entry.terms.length).toBeGreaterThanOrEqual(2);
      expect(entry.verifiedAt).toBe("2026-08-26");
    }
  });
});
