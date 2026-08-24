import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import {
  annotationKey,
  useFlightLogPersonalization,
} from "./useFlightLogPersonalization";

describe("Flight Log personalization", () => {
  beforeEach(() => localStorage.clear());

  it("saves bounded record details, views, and comparison bookmarks", () => {
    const { result } = renderHook(() => useFlightLogPersonalization());
    const key = annotationKey("mission", "apollo-11");
    act(() =>
      result.current.saveAnnotation(key, {
        note: "Review the landing timeline",
        collection: "Moon research",
        tags: ["Apollo", "Moon", "Apollo"],
      }),
    );
    expect(result.current.annotations[key]).toMatchObject({
      collection: "Moon research",
      tags: ["Apollo", "Moon"],
    });
    act(() =>
      result.current.saveView("Moon records", "collection=missions&q=moon"),
    );
    expect(result.current.savedViews[0]?.name).toBe("Moon records");
    act(() =>
      result.current.saveComparison(
        "Moon missions",
        "/missions/compare?missions=apollo-11,artemis-i",
      ),
    );
    expect(result.current.comparisonBookmarks[0]?.path).toContain("apollo-11");
  });

  it("recovers from malformed storage and removes empty annotations", () => {
    localStorage.setItem(
      "mission-control:flight-log-personalization:v1",
      "broken",
    );
    const { result } = renderHook(() => useFlightLogPersonalization());
    expect(result.current.annotations).toEqual({});
    const key = annotationKey("apod", "2026-08-24");
    act(() =>
      result.current.saveAnnotation(key, {
        note: "x",
        collection: "",
        tags: [],
      }),
    );
    act(() =>
      result.current.saveAnnotation(key, {
        note: "",
        collection: "",
        tags: [],
      }),
    );
    expect(result.current.annotations[key]).toBeUndefined();
  });
});
