import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";

const DAY_MS = 86_400_000;

export const normalizeTriviaPrompt = (prompt) =>
  prompt
    .toLocaleLowerCase("en-US")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

export const backlogScore = (item) =>
  Number(
    (
      (item.traffic + item.usabilityEvidence + item.contentRisk) /
      item.effort
    ).toFixed(1),
  );

const words = (value) => value.trim().split(/\s+/u).filter(Boolean).length;
const ageInDays = (date, now) =>
  Math.floor(
    (now.getTime() - new Date(`${date}T00:00:00Z`).getTime()) / DAY_MS,
  );
const urlsIn = (source) => [
  ...new Set(source.match(/https:\/\/[^\s"')]+/gu) ?? []),
];
const datesIn = (source) =>
  [...source.matchAll(/verifiedAt:\s*"(\d{4}-\d{2}-\d{2})"/gu)].map(
    (match) => match[1],
  );

async function checkLinks(urls) {
  const failures = [];
  const warnings = [];
  let cursor = 0;
  const workers = Array.from({ length: 6 }, async () => {
    while (cursor < urls.length) {
      const url = urls[cursor++];
      try {
        const response = await fetch(url, {
          headers: { "user-agent": "nasa-mission-control-editorial-audit/1.0" },
          redirect: "follow",
          signal: AbortSignal.timeout(12_000),
        });
        if (response.status === 404 || response.status === 410) {
          failures.push(`broken source (${response.status}): ${url}`);
        } else if (!response.ok) {
          warnings.push(`source returned ${response.status}: ${url}`);
        }
      } catch (error) {
        warnings.push(`source could not be reached: ${url} (${error.message})`);
      }
    }
  });
  await Promise.all(workers);
  return { failures, warnings };
}

export async function auditEditorialHealth({
  now = new Date(),
  checkSourceLinks = false,
} = {}) {
  const paths = {
    policy: "docs/editorial-maintenance.json",
    trivia: "apps/client/public/content/trivia.json",
    missions: "apps/client/src/data/missions.ts",
    stories: "apps/client/src/data/storyCollections.ts",
    learning: "apps/client/src/data/learningTracks.ts",
    enrichment: "apps/client/src/data/educationalEnrichment.ts",
    journeys: "apps/client/src/data/journeys.ts",
    scale: "apps/client/src/data/scaleProfiles.ts",
  };
  const loaded = Object.fromEntries(
    await Promise.all(
      Object.entries(paths).map(async ([key, path]) => [
        key,
        await readFile(path, "utf8"),
      ]),
    ),
  );
  const policy = JSON.parse(loaded.policy);
  const trivia = JSON.parse(loaded.trivia);
  const failures = [];
  const warnings = [];
  const duplicatePrompts = Object.entries(
    trivia.reduce((groups, question) => {
      const normalized = normalizeTriviaPrompt(question.prompt);
      groups[normalized] = [...(groups[normalized] ?? []), question.id];
      return groups;
    }, {}),
  ).filter(([, ids]) => ids.length > 1);
  if (duplicatePrompts.length) {
    failures.push(
      `duplicate trivia prompts: ${duplicatePrompts.map(([, ids]) => ids.join(", ")).join("; ")}`,
    );
  }

  const topics = trivia.reduce((counts, question) => {
    counts[question.category] = (counts[question.category] ?? 0) + 1;
    return counts;
  }, {});
  const citedTrivia = trivia.filter(
    (question) =>
      question.source?.url && question.source?.label && question.verifiedAt,
  );
  const citationCoverage = (citedTrivia.length / trivia.length) * 100;
  const clarityCoverage =
    (trivia.filter(
      (question) =>
        words(question.prompt) <= policy.targets.maximumTriviaPromptWords &&
        words(question.explanation) >=
          policy.targets.minimumTriviaExplanationWords &&
        words(question.explanation) <=
          policy.targets.maximumTriviaExplanationWords,
    ).length /
      trivia.length) *
    100;

  if (trivia.length < policy.targets.minimumTriviaQuestions) {
    failures.push(
      `trivia coverage is ${trivia.length}; target is ${policy.targets.minimumTriviaQuestions}`,
    );
  }
  for (const [topic, count] of Object.entries(topics)) {
    if (count < policy.targets.minimumTriviaQuestionsPerExistingTopic) {
      failures.push(
        `${topic} has ${count} trivia questions; target is ${policy.targets.minimumTriviaQuestionsPerExistingTopic}`,
      );
    }
  }
  if (citationCoverage < policy.targets.citationCoveragePercent) {
    failures.push(
      `trivia citation coverage is ${citationCoverage.toFixed(1)}%`,
    );
  }
  if (clarityCoverage < 100)
    failures.push(`trivia clarity coverage is ${clarityCoverage.toFixed(1)}%`);

  const freshnessChecks = [
    [
      "trivia",
      trivia.map((question) => question.verifiedAt),
      policy.targets.maximumDaysSinceTriviaVerification,
    ],
    [
      "stories",
      datesIn(loaded.stories),
      policy.targets.maximumDaysSinceStoryVerification,
    ],
    [
      "learning",
      datesIn(loaded.enrichment),
      policy.targets.maximumDaysSinceLearningVerification,
    ],
  ];
  for (const [area, dates, maximumAge] of freshnessChecks) {
    if (
      !dates.length ||
      dates.some((date) => !date || ageInDays(date, now) > maximumAge)
    ) {
      failures.push(
        `${area} contains a missing or overdue verification date (limit ${maximumAge} days)`,
      );
    }
  }
  if (
    ageInDays(policy.reviewedAt, now) >
    policy.targets.maximumDaysSinceEditorialReview
  ) {
    failures.push(
      `monthly editorial review is overdue: last reviewed ${policy.reviewedAt}`,
    );
  }
  if (new Date(`${policy.nextReviewDue}T23:59:59Z`) < now) {
    failures.push(`editorial review due date passed: ${policy.nextReviewDue}`);
  }
  if (policy.backlogScoredAt < policy.reviewedAt) {
    failures.push(
      "editorial backlog was not re-scored after the latest review",
    );
  }
  policy.backlog.forEach((item, index) => {
    if (item.priority !== index + 1)
      failures.push(`backlog priority is not contiguous at ${item.candidate}`);
    if (backlogScore(item) !== item.score)
      failures.push(`backlog score is stale for ${item.candidate}`);
  });

  const structuralSources = [
    loaded.missions,
    loaded.stories,
    loaded.learning,
    loaded.journeys,
    loaded.scale,
  ];
  const sourceUrls = [
    ...new Set(
      structuralSources
        .flatMap(urlsIn)
        .concat(trivia.map((q) => q.source?.url).filter(Boolean)),
    ),
  ];
  const minimumSourceCounts = [
    ["missions", urlsIn(loaded.missions).length, 20],
    ["stories", urlsIn(loaded.stories).length, 6],
    ["learning tracks", urlsIn(loaded.learning).length, 6],
    ["guided journeys", urlsIn(loaded.journeys).length, 9],
    ["scale profiles", urlsIn(loaded.scale).length, 7],
  ];
  minimumSourceCounts.forEach(([area, count, minimum]) => {
    if (count < minimum)
      failures.push(
        `${area} has ${count} source URLs; expected at least ${minimum}`,
      );
  });

  if (checkSourceLinks) {
    const links = await checkLinks(sourceUrls);
    failures.push(...links.failures);
    warnings.push(...links.warnings);
  }

  return {
    status: failures.length ? "failed" : "passed",
    generatedAt: now.toISOString(),
    review: {
      ownerCount: new Set(policy.areas.map((area) => area.owner)).size,
      areaCount: policy.areas.length,
      reviewedAt: policy.reviewedAt,
      nextReviewDue: policy.nextReviewDue,
      backlogScoredAt: policy.backlogScoredAt,
    },
    targets: {
      triviaQuestions: trivia.length,
      triviaByTopic: topics,
      triviaCitationCoveragePercent: Number(citationCoverage.toFixed(1)),
      triviaClarityCoveragePercent: Number(clarityCoverage.toFixed(1)),
      uniqueSourceUrls: sourceUrls.length,
    },
    failures,
    warnings,
  };
}

async function main() {
  const checkSourceLinks = process.argv.includes("--check-links");
  const outputIndex = process.argv.indexOf("--output");
  const outputPath =
    outputIndex >= 0 ? process.argv[outputIndex + 1] : undefined;
  const report = await auditEditorialHealth({ checkSourceLinks });
  if (outputPath) {
    await mkdir(dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(report, null, 2)}\n`);
  }
  console.log(JSON.stringify(report, null, 2));
  if (report.failures.length) process.exitCode = 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await main();
}
