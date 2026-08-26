import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DAY_MS = 86_400_000;
const policy = JSON.parse(
  await readFile("docs/improvement-cycle.json", "utf8"),
);
const failures = [];
const requiredDomains = [
  "usability",
  "accessibility",
  "performance-and-visuals",
  "reliability",
  "content-and-citations",
  "feedback",
];
const requiredJourneys = ["first visit", "missions", "learning", "live data"];
const requiredModes = [
  "keyboard",
  "screen reader",
  "zoom and reflow",
  "high contrast",
  "reduced motion",
];
const score = (item) =>
  Number(
    ((item.impact + item.evidence + item.riskReduction) / item.effort).toFixed(
      1,
    ),
  );

if (policy.schemaVersion !== 1) failures.push("unsupported schemaVersion");
for (const domain of requiredDomains) {
  if (!policy.domains.some((item) => item.name === domain && item.owner))
    failures.push(`missing owned domain: ${domain}`);
}
for (const journey of requiredJourneys) {
  if (!policy.journeys.some((item) => item.name === journey && item.owner))
    failures.push(`missing owned journey: ${journey}`);
}
for (const mode of requiredModes) {
  if (!policy.accessibility.some((item) => item.mode === mode))
    failures.push(`missing accessibility mode: ${mode}`);
}
if (!policy.visualBaseline?.owner || !policy.visualBaseline?.reviewedAt)
  failures.push("visual baseline lacks an owner or review date");
for (const screenshot of policy.visualBaseline?.screenshots ?? []) {
  try {
    await access(screenshot);
  } catch {
    failures.push(`visual baseline does not exist: ${screenshot}`);
  }
}
if ((policy.visualBaseline?.screenshots?.length ?? 0) < 8)
  failures.push(
    "visual baseline does not cover all eight responsive/state captures",
  );
for (const item of [...policy.domains, ...policy.journeys]) {
  const evidence = item.evidence ?? item.automatedEvidence;
  if (!evidence) {
    failures.push(`missing evidence path: ${item.name}`);
    continue;
  }
  try {
    await access(evidence);
  } catch {
    failures.push(`evidence path does not exist: ${evidence}`);
  }
}
policy.backlog.forEach((item, index) => {
  if (item.priority !== index + 1)
    failures.push(`backlog priority is not contiguous: ${item.candidate}`);
  if (!item.owner || !item.nextAction)
    failures.push(`backlog item lacks owner or action: ${item.candidate}`);
  if (score(item) !== item.score)
    failures.push(`backlog score is stale: ${item.candidate}`);
});
if (!policy.limitations.length) failures.push("known limitations are empty");
const reviewed = Date.parse(`${policy.reviewedAt}T00:00:00Z`);
const due = Date.parse(`${policy.nextReviewDue}T23:59:59Z`);
const now = Date.now();
if (!Number.isFinite(reviewed) || now - reviewed > 45 * DAY_MS)
  failures.push("improvement-cycle review is missing or older than 45 days");
if (!Number.isFinite(due) || due < now)
  failures.push("improvement-cycle next review is overdue");

const report = {
  status: failures.length ? "failed" : "passed",
  reviewedAt: policy.reviewedAt,
  nextReviewDue: policy.nextReviewDue,
  ownedDomains: policy.domains.length,
  journeys: policy.journeys.length,
  accessibilityModes: policy.accessibility.length,
  backlogItems: policy.backlog.length,
  visualBaselines: policy.visualBaseline.screenshots.length,
  manualAccessibilitySessions: policy.accessibility.reduce(
    (total, item) => total + item.manualSessions,
    0,
  ),
  participantSessions: policy.journeys.reduce(
    (total, item) => total + item.participantSessions,
    0,
  ),
  failures,
};
const outputIndex = process.argv.indexOf("--output");
const output = outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
if (output) {
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`);
}
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exitCode = 1;
