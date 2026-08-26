import test from "node:test";
import assert from "node:assert/strict";
import {
  auditEditorialHealth,
  backlogScore,
  normalizeTriviaPrompt,
} from "./audit-editorial-health.mjs";

test("normalizes punctuation and case before duplicate comparison", () => {
  assert.equal(normalizeTriviaPrompt("Mars: Red Planet?"), "mars red planet");
  assert.equal(normalizeTriviaPrompt("MARS — red planet!"), "mars red planet");
});

test("calculates the documented evidence score", () => {
  assert.equal(
    backlogScore({
      traffic: 3,
      usabilityEvidence: 2,
      contentRisk: 3,
      effort: 2,
    }),
    4,
  );
});

test("current editorial evidence satisfies the maintenance targets", async () => {
  const report = await auditEditorialHealth({
    now: new Date("2026-08-26T12:00:00Z"),
  });
  assert.equal(report.status, "passed", JSON.stringify(report.failures));
  assert.equal(report.targets.triviaCitationCoveragePercent, 100);
  assert.equal(report.targets.triviaClarityCoveragePercent, 100);
});
