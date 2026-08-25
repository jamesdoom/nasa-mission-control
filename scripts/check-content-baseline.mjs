import { readFile } from "node:fs/promises";

const files = {
  missions: "apps/client/src/data/missions.ts",
  trivia: "apps/client/public/content/trivia.json",
  stories: "apps/client/src/data/storyCollections.ts",
  learning: "apps/client/src/data/learningTracks.ts",
  journeys: "apps/client/src/data/journeys.ts",
  scale: "apps/client/src/data/scaleProfiles.ts",
  baseline: "docs/content-inventory-phase-1.md",
};

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(files).map(async ([key, file]) => [
      key,
      await readFile(file, "utf8"),
    ]),
  ),
);

const countRecords = (source, key) =>
  [...source.matchAll(new RegExp(`^ {4}${key}: \\"`, "gm"))].length;

const counts = {
  missions: countRecords(contents.missions, "slug"),
  trivia: JSON.parse(contents.trivia).length,
  stories: countRecords(contents.stories, "id"),
  learning: countRecords(contents.learning, "id"),
  journeys: countRecords(contents.journeys, "id"),
  scale: countRecords(contents.scale, "id"),
};

const expectedCounts = {
  missions: 10,
  trivia: 64,
  stories: 3,
  learning: 3,
  journeys: 9,
  scale: 7,
};

const requiredBaselineTerms = [
  "Mission Archive and comparison",
  "Space Trivia",
  "Live-data explanations",
  "Guided learning",
  "Scientific stories",
  "Guided Discovery",
  "Celestial Scale Laboratory",
  "Discovery, search, and Flight Log guidance",
  "Dashboard and navigation copy",
  "About, privacy, accessibility, status, and limitations",
  "Repository and contributor documentation",
  "**Live**",
  "**Latest available**",
  "**Observed**",
  "**Modeled**",
  "**Calculated**",
  "**Curated**",
];

const failures = [];
for (const [area, expected] of Object.entries(expectedCounts)) {
  if (counts[area] !== expected) {
    failures.push(
      `${area} inventory changed from ${expected} to ${counts[area]}; review and update the baseline`,
    );
  }
}
for (const term of requiredBaselineTerms) {
  if (!contents.baseline.includes(term)) {
    failures.push(`content baseline is missing required area or term: ${term}`);
  }
}

if (failures.length > 0) {
  throw new Error(`Content baseline check failed:\n- ${failures.join("\n- ")}`);
}

console.log(JSON.stringify({ status: "ok", counts }));
