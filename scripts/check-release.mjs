import { readFile } from "node:fs/promises";

const semver =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/;
const files = [
  "package.json",
  "apps/client/package.json",
  "apps/server/package.json",
  "packages/shared/package.json",
];

const manifests = await Promise.all(
  files.map(async (file) => JSON.parse(await readFile(file, "utf8"))),
);
const versions = manifests.map((manifest) => manifest.version);
const version = versions[0];
if (typeof version !== "string" || !semver.test(version)) {
  throw new Error(`Root version is not valid SemVer: ${String(version)}`);
}
if (versions.some((candidate) => candidate !== version)) {
  throw new Error(`Workspace versions differ: ${versions.join(", ")}`);
}

const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const lockVersions = [
  lock.version,
  lock.packages?.[""]?.version,
  lock.packages?.["apps/client"]?.version,
  lock.packages?.["apps/server"]?.version,
  lock.packages?.["packages/shared"]?.version,
];
if (lockVersions.some((candidate) => candidate !== version)) {
  throw new Error(`Lockfile versions do not all match ${version}.`);
}

const changelog = await readFile("CHANGELOG.md", "utf8");
if (!changelog.includes(`## [${version}] - `)) {
  throw new Error(`CHANGELOG.md has no dated ${version} release section.`);
}

const tag = process.env.RELEASE_TAG;
if (tag !== undefined && tag !== `v${version}`) {
  throw new Error(`Tag ${tag} must exactly match package version v${version}.`);
}

console.log(
  JSON.stringify({
    status: "ok",
    version,
    tag: tag ?? null,
    workspaces: files.length,
  }),
);
