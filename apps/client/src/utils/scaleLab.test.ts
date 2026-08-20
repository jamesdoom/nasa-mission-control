import { describe, expect, it } from "vitest";
import {
  logarithmicScale,
  scaleMetricFrom,
  scaleSelectionFrom,
  signalTimeSeconds,
  toggleScaleSelection,
} from "./scaleLab";

describe("celestial scale laboratory", () => {
  it("validates shareable metric and profile state", () => {
    expect(scaleMetricFrom("signal")).toBe("signal");
    expect(scaleMetricFrom("unknown")).toBe("distance");
    expect(
      scaleSelectionFrom("moon,unknown,moon,mars,saturn,hubble,sun"),
    ).toEqual(["moon", "mars", "saturn", "hubble"]);
  });

  it("caps profile selection and allows removal", () => {
    expect(toggleScaleSelection(["moon", "mars"], "moon")).toEqual(["mars"]);
    expect(
      toggleScaleSelection(["moon", "mars", "saturn", "sun"], "jupiter"),
    ).toEqual(["moon", "mars", "saturn", "sun"]);
  });

  it("calculates light time and bounded logarithmic widths", () => {
    expect(signalTimeSeconds(384_400)).toBeCloseTo(1.282, 3);
    expect(logarithmicScale(483, 1_430_000_000)).toBeGreaterThanOrEqual(12);
    expect(logarithmicScale(1_430_000_000, 1_430_000_000)).toBe(100);
  });
});
