import { describe, expect, it } from "vitest";
import { storyCollectionById, storyCollections } from "./storyCollections";

describe("source-checked story collections", () => {
  it("provides unique four-chapter narratives with official sources", () => {
    expect(new Set(storyCollections.map((story) => story.id)).size).toBe(
      storyCollections.length,
    );
    for (const story of storyCollections) {
      expect(story.chapters).toHaveLength(4);
      expect(story.milestones).toHaveLength(4);
      expect(
        story.chapters.every((chapter) => chapter.to.startsWith("/")),
      ).toBe(true);
      expect(
        new Set(story.chapters.map((chapter) => chapter.kind)).size,
      ).toBeGreaterThan(1);
      for (const source of story.sources) {
        expect(new URL(source.url).hostname.endsWith("nasa.gov")).toBe(true);
      }
    }
  });

  it("looks up known stories without inventing a fallback", () => {
    expect(storyCollectionById("mars-habitability")?.title).toMatch(/Mars/);
    expect(storyCollectionById("missing-story")).toBeUndefined();
  });
});
