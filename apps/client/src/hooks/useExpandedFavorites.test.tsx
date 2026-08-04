import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { MediaItem } from "@mission-control/shared";
import { missions } from "../data/missions";
import { useMediaFavorites } from "./useMediaFavorites";
import { useMissionFavorites } from "./useMissionFavorites";

const media: MediaItem = {
  nasaId: "TEST-1",
  title: "Test image",
  description: "A NASA test image.",
  mediaType: "image",
  dateCreated: "2024-01-01T00:00:00Z",
  center: "JSC",
  photographer: null,
  keywords: ["test"],
  previewUrl: "https://example.com/test.jpg",
};

describe("expanded Flight Log favorites", () => {
  beforeEach(() => localStorage.clear());

  it("saves and removes validated NASA media", () => {
    const { result } = renderHook(() => useMediaFavorites());
    act(() => result.current.toggle(media));
    expect(result.current.isFavorite(media.nasaId)).toBe(true);
    act(() => result.current.toggle(media));
    expect(result.current.favorites).toEqual([]);
  });

  it("resolves stored mission slugs against the curated archive", () => {
    localStorage.setItem(
      "mission-control:mission-favorites:v1",
      JSON.stringify([missions[0]?.slug, "unknown-mission"]),
    );
    const { result } = renderHook(() => useMissionFavorites());
    expect(result.current.favorites.map((mission) => mission.slug)).toEqual([
      missions[0]?.slug,
    ]);
  });

  it("discards malformed media storage", () => {
    localStorage.setItem(
      "mission-control:media-favorites:v1",
      JSON.stringify([media, { nasaId: 42 }]),
    );
    const { result } = renderHook(() => useMediaFavorites());
    expect(result.current.favorites).toEqual([media]);
  });
});
