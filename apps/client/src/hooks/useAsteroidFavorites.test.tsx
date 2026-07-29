import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Asteroid } from "@mission-control/shared";
import { useAsteroidFavorites } from "./useAsteroidFavorites";

const asteroid: Asteroid = {
  id: "123",
  name: "(2026 TEST)",
  jplUrl: "https://ssd.jpl.nasa.gov/example",
  potentiallyHazardous: true,
  sentryObject: false,
  diameterMeters: { min: 100, max: 200 },
  approach: {
    date: "2026-07-29",
    dateTimeUtc: "2026-07-29T12:00:00.000Z",
    velocityKph: 50_000,
    missDistanceKm: 2_000_000,
    missDistanceLunar: 5.2,
  },
};

describe("useAsteroidFavorites", () => {
  beforeEach(() => localStorage.clear());

  it("adds and removes a saved asteroid", () => {
    const { result } = renderHook(() => useAsteroidFavorites());
    act(() => result.current.toggle(asteroid));
    expect(result.current.isFavorite(asteroid.id)).toBe(true);
    act(() => result.current.toggle(asteroid));
    expect(result.current.favorites).toEqual([]);
  });

  it("discards malformed persisted objects", () => {
    localStorage.setItem(
      "mission-control:asteroid-favorites:v1",
      JSON.stringify([asteroid, { id: "broken", diameterMeters: null }]),
    );
    const { result } = renderHook(() => useAsteroidFavorites());
    expect(result.current.favorites).toEqual([asteroid]);
  });
});
