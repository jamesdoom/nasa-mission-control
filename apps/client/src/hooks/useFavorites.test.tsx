import { renderHook, act } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import type { Apod } from "@mission-control/shared";
import { useFavorites } from "./useFavorites";

const apod: Apod = {
  date: "2024-01-01",
  title: "Test",
  explanation: "Test",
  mediaType: "image",
  mediaUrl: "https://example.com/a.jpg",
  hdUrl: null,
  thumbnailUrl: null,
  copyright: null,
};
describe("useFavorites", () => {
  beforeEach(() => localStorage.clear());
  it("adds and removes a favorite", () => {
    const { result } = renderHook(() => useFavorites());
    act(() => result.current.toggle(apod));
    expect(result.current.isFavorite(apod.date)).toBe(true);
    act(() => result.current.toggle(apod));
    expect(result.current.favorites).toHaveLength(0);
  });

  it("migrates valid legacy favorites and discards malformed entries", () => {
    localStorage.setItem(
      "mission-control:apod-favorites:v1",
      JSON.stringify([apod, { date: "not-valid" }]),
    );
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([apod]);
    expect(
      localStorage.getItem("mission-control:apod-favorites:v1"),
    ).toBeNull();
    expect(localStorage.getItem("mission-control:apod-favorites:v2")).toContain(
      '"version":2',
    );
  });

  it("recovers safely from invalid stored JSON", () => {
    localStorage.setItem("mission-control:apod-favorites:v2", "not-json");
    const { result } = renderHook(() => useFavorites());
    expect(result.current.favorites).toEqual([]);
  });
});
