import { readFile } from "node:fs/promises";

const files = {
  ci: await readFile(".github/workflows/ci.yml", "utf8"),
  release: await readFile(".github/workflows/release.yml", "utf8"),
  preview: await readFile(".github/workflows/preview-smoke.yml", "utf8"),
  trends: await readFile(".github/workflows/reliability-trends.yml", "utf8"),
  monthly: await readFile(
    ".github/workflows/monthly-product-review.yml",
    "utf8",
  ),
  operations: await readFile("docs/operations.md", "utf8"),
};

const requirements = [
  ["CI uses a clean install", files.ci, "npm ci"],
  ["CI validates release metadata", files.ci, "npm run release:check"],
  [
    "CI validates workflow contracts",
    files.ci,
    "npm run release:workflow-check",
  ],
  ["CI runs browser journeys", files.ci, "npm run test:e2e"],
  [
    "CI validates reliability aggregation",
    files.ci,
    "npm run reliability:check",
  ],
  ["release tags use SemVer shape", files.release, '"v*.*.*"'],
  [
    "release validates the exact tag",
    files.release,
    "RELEASE_TAG: ${{ github.ref_name }}",
  ],
  [
    "release validates workflow contracts",
    files.release,
    "npm run release:workflow-check",
  ],
  ["release runs resilience drill", files.release, "npm run drill:resilience"],
  ["release reviews mission sources", files.release, "npm run review:missions"],
  ["release audits editorial health", files.release, "npm run review:content"],
  ["release verifies offline output", files.release, "npm run offline:verify"],
  ["release runs browser journeys", files.release, "npm run test:e2e"],
  [
    "release validates reliability aggregation",
    files.release,
    "npm run reliability:check",
  ],
  ["release publishes only after gates", files.release, "gh release create"],
  [
    "preview checks successful deployments",
    files.preview,
    "deployment_status.state == 'success'",
  ],
  [
    "preview checks API contracts",
    files.preview,
    "scripts/production-smoke.mjs",
  ],
  [
    "rollback starts with inspection",
    files.operations,
    "vercel inspect <deployment-url>",
  ],
  [
    "rollback has production verification",
    files.operations,
    "npm run smoke:production",
  ],
  ["reliability trends run daily", files.trends, 'cron: "17 12 * * *"'],
  [
    "reliability trends restore prior evidence",
    files.trends,
    "gh run download",
  ],
  [
    "reliability trends retain rolling evidence",
    files.trends,
    "name: reliability-history",
  ],
  [
    "performance restores asset trends",
    await readFile(".github/workflows/production-performance.yml", "utf8"),
    "asset-budget-trend.json",
  ],
  [
    "monthly review validates the improvement cycle",
    files.monthly,
    "npm run review:cycle",
  ],
  [
    "monthly review retains improvement evidence",
    files.monthly,
    "improvement-cycle-${{ github.run_number }}",
  ],
  [
    "monthly review covers every accessibility mode",
    files.monthly,
    "keyboard, screen reader, zoom/reflow, high contrast, reduced motion",
  ],
];

const failures = requirements
  .filter(([, contents, expected]) => !contents.includes(expected))
  .map(([name, , expected]) => ({ name, expected }));

if (
  files.release.indexOf("gh release create") <
  files.release.indexOf("npm run test:e2e")
) {
  failures.push({
    name: "release publication follows browser journeys",
    expected: "gh release create after npm run test:e2e",
  });
}

if (failures.length > 0) {
  console.error(JSON.stringify({ status: "failed", failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(
    JSON.stringify(
      { status: "passed", checks: requirements.map(([name]) => name) },
      null,
      2,
    ),
  );
}
