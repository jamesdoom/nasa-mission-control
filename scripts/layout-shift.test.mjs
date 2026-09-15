import { test } from "node:test";
import assert from "node:assert/strict";
import { maximumLayoutShiftSession } from "./lib/layout-shift.mjs";
test("keeps precision and uses the largest session rather than the lifetime sum", () => {
  assert.equal(
    maximumLayoutShiftSession([
      { startTime: 0, value: 0.06 },
      { startTime: 900, value: 0.049 },
      { startTime: 1900, value: 0.08 },
      { startTime: 2000, value: 1, hadRecentInput: true },
    ]),
    0.109,
  );
});
test("caps continuous sessions at five seconds", () => {
  const entries = Array.from({ length: 8 }, (_, i) => ({
    startTime: i * 900,
    value: 0.01,
  }));
  assert.ok(Math.abs(maximumLayoutShiftSession(entries) - 0.06) < 0.000001);
  assert.equal(maximumLayoutShiftSession([]), 0);
});
