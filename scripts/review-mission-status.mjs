import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const missionFile = resolve(root, "apps/client/src/data/missions.ts");
const artifactDirectory = resolve(root, "artifacts");
const artifactFile = resolve(artifactDirectory, "mission-status-review.json");
const checkSources = process.argv.includes("--check-sources");
const today = new Date();
today.setUTCHours(0, 0, 0, 0);

function addDays(date, days) {
  const result = new Date(`${date}T00:00:00Z`);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function extractRecords(source) {
  const blocks =
    source.match(
      /\{\s*slug:\s*"[^"]+"[\s\S]*?verifiedAt:\s*"\d{4}-\d{2}-\d{2}"[\s\S]*?\n\s*\},/g,
    ) ?? [];
  return blocks.map((block) => {
    const slug = block.match(/slug:\s*"([^"]+)"/)?.[1];
    const status = block.match(/status:\s*"(active|extended|completed)"/)?.[1];
    const verifiedAt = block.match(/verifiedAt:\s*"(\d{4}-\d{2}-\d{2})"/)?.[1];
    const urls = [
      ...block.matchAll(/(?:sourceUrl|url):\s*"(https:\/\/[^"]+)"/g),
    ].map((match) => match[1]);
    if (!slug || !status || !verifiedAt || urls.length < 2) {
      throw new Error(
        "A mission record is missing review metadata or official sources.",
      );
    }
    const intervalDays =
      status === "completed" ? 365 : status === "extended" ? 60 : 90;
    const dueAt = addDays(verifiedAt, intervalDays);
    return {
      slug,
      status,
      verifiedAt,
      dueAt: dueAt.toISOString().slice(0, 10),
      overdue: dueAt < today,
      sources: urls,
    };
  });
}

async function inspectSource(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12_000);
  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": "NASA-Mission-Control-Source-Review/1.0" },
    });
    return {
      url,
      status: response.status,
      ok: response.status < 400 || response.status === 403,
      restricted: response.status === 403,
    };
  } catch (error) {
    return {
      url,
      status: null,
      ok: false,
      error: error instanceof Error ? error.name : "UnknownError",
    };
  } finally {
    clearTimeout(timeout);
  }
}

const source = await readFile(missionFile, "utf8");
const records = extractRecords(source);
const sourceUrls = [...new Set(records.flatMap((record) => record.sources))];
const sourceResults = checkSources
  ? await Promise.all(sourceUrls.map(inspectSource))
  : [];
const overdue = records.filter((record) => record.overdue);
const unavailableSources = sourceResults.filter((result) => !result.ok);
const report = {
  checkedAt: new Date().toISOString(),
  policy: {
    activeDays: 90,
    extendedDays: 60,
    completedDays: 365,
    note: "Passing source checks do not confirm mission status; a human must review official NASA sources and update verifiedAt.",
  },
  counts: {
    missions: records.length,
    overdue: overdue.length,
    sourcesChecked: sourceResults.length,
    unavailableSources: unavailableSources.length,
  },
  records,
  sourceResults,
};

await mkdir(artifactDirectory, { recursive: true });
await writeFile(artifactFile, `${JSON.stringify(report, null, 2)}\n`);

if (
  records.length === 0 ||
  overdue.length > 0 ||
  unavailableSources.length > 0
) {
  console.error(
    JSON.stringify({ status: "review-required", ...report.counts }),
  );
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: "ok", ...report.counts }));
}
