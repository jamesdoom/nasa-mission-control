import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useLearningProgress } from "./useLearningProgress";

describe("useLearningProgress", () => {
  afterEach(() => localStorage.clear());
  it("validates, persists, exports, and resets bounded progress", () => {
    const { result, unmount } = renderHook(() => useLearningProgress());
    act(() => {
      result.current.toggleStep("mars-evidence", "story");
      result.current.passCheck("mars-evidence");
      result.current.saveReflection("mars-evidence", "Evidence needs context.");
    });
    expect(result.current.tracks["mars-evidence"]).toMatchObject({
      completedSteps: ["story"],
      checkPassed: true,
      reflection: "Evidence needs context.",
    });
    expect(result.current.exportJson()).toContain("mars-evidence");
    unmount();
    const restored = renderHook(() => useLearningProgress());
    expect(
      restored.result.current.tracks["mars-evidence"]?.completedSteps,
    ).toEqual(["story"]);
    act(() => restored.result.current.reset());
    expect(
      localStorage.getItem("mission-control:learning-progress:v1"),
    ).toBeNull();
  });
});
