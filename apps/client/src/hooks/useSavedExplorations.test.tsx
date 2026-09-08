import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useSavedExplorations } from "./useSavedExplorations";

describe("saved explorations", () => {
  beforeEach(() => localStorage.clear());
  it("synchronizes mounted readers and preserves another saved view", () => {
    const first = renderHook(() => useSavedExplorations());
    const second = renderHook(() => useSavedExplorations());
    act(() => {
      first.result.current.save("/media?q=Mars", "Mars");
    });
    expect(second.result.current.items).toHaveLength(1);
    act(() => {
      second.result.current.save(
        "/learn?track=mars-evidence#step-mission",
        "Learning",
      );
    });
    expect(first.result.current.items).toHaveLength(2);
    act(() => {
      second.result.current.save("/media?q=Mars", "Mars again");
    });
    expect(first.result.current.items).toHaveLength(2);
    first.unmount();
    second.unmount();
    const restored = renderHook(() => useSavedExplorations());
    expect(restored.result.current.items[0]?.title).toBe("Mars again");
  });
  it("ignores corrupt and external saved targets", () => {
    localStorage.setItem(
      "mission-control:saved-explorations:v1",
      JSON.stringify([
        { path: "//evil.example", title: "Bad", savedAt: "2026-09-08" },
        { path: 42 },
      ]),
    );
    const hook = renderHook(() => useSavedExplorations());
    expect(hook.result.current.items).toEqual([]);
  });
  it("retains session state when storage rejects a write", () => {
    const hook = renderHook(() => useSavedExplorations());
    const blocked = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("Full");
      });
    act(() => {
      expect(hook.result.current.save("/missions/curiosity", "Curiosity")).toBe(
        false,
      );
    });
    hook.unmount();
    const restored = renderHook(() => useSavedExplorations());
    expect(restored.result.current.items).toHaveLength(1);
    blocked.mockRestore();
    act(() => {
      restored.result.current.remove("/missions/curiosity");
    });
  });
});
