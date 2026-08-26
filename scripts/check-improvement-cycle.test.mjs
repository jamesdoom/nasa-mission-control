import assert from "node:assert/strict";
import test from "node:test";

const score = ({ impact, evidence, riskReduction, effort }) =>
  Number(((impact + evidence + riskReduction) / effort).toFixed(1));

test("calculates the documented product backlog score", () => {
  assert.equal(
    score({ impact: 3, evidence: 2, riskReduction: 3, effort: 2 }),
    4,
  );
});

test("the improvement-cycle register is current and complete", async () => {
  const policy = JSON.parse(
    await import("node:fs/promises").then(({ readFile }) =>
      readFile("docs/improvement-cycle.json", "utf8"),
    ),
  );
  assert.equal(policy.schemaVersion, 1);
  assert.equal(policy.domains.length, 6);
  assert.deepEqual(
    policy.journeys.map(({ name }) => name),
    ["first visit", "missions", "learning", "live data"],
  );
  assert.equal(policy.accessibility.length, 5);
  assert.equal(policy.visualBaseline.screenshots.length, 12);
  assert.ok(policy.limitations.length >= 4);
  policy.backlog.forEach((item, index) => {
    assert.equal(item.priority, index + 1);
    assert.equal(item.score, score(item));
  });
});
