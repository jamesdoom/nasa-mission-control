import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const assetsDirectory = path.resolve("apps/client/dist/assets");
const missionCardDirectory = path.resolve(
  "apps/client/dist/assets/missions/cards",
);
const limits = {
  largestJavaScriptGzip: 110 * 1024,
  totalJavaScriptGzip: 184 * 1024,
  totalCssGzip: 23 * 1024,
  totalMissionCardImages: 400 * 1024,
};

async function compressedAssets(extension) {
  const names = (await readdir(assetsDirectory)).filter((name) =>
    name.endsWith(extension),
  );
  return Promise.all(
    names.map(async (name) => {
      const filePath = path.join(assetsDirectory, name);
      return {
        name,
        rawBytes: (await stat(filePath)).size,
        gzipBytes: gzipSync(await readFile(filePath)).length,
      };
    }),
  );
}

async function rawAssets(directory, extension) {
  const names = (await readdir(directory)).filter((name) =>
    name.endsWith(extension),
  );
  return Promise.all(
    names.map(async (name) => ({
      name,
      rawBytes: (await stat(path.join(directory, name))).size,
    })),
  );
}

function total(assets, field) {
  return assets.reduce((sum, asset) => sum + asset[field], 0);
}

function kilobytes(bytes) {
  return Number((bytes / 1024).toFixed(1));
}

function enforce(label, actual, limit) {
  if (actual > limit)
    throw new Error(
      `${label} is ${kilobytes(actual)} kB; budget is ${kilobytes(limit)} kB.`,
    );
}

const javascript = await compressedAssets(".js");
const styles = await compressedAssets(".css");
const missionCardImages = await rawAssets(missionCardDirectory, ".jpg");
if (javascript.length === 0 || styles.length === 0)
  throw new Error("Build assets are missing. Run npm run build first.");
if (missionCardImages.length !== 10)
  throw new Error(
    `Expected 10 optimized mission card images; found ${missionCardImages.length}.`,
  );

const largestJavaScript = Math.max(
  ...javascript.map(({ gzipBytes }) => gzipBytes),
);
const totalJavaScript = total(javascript, "gzipBytes");
const totalCss = total(styles, "gzipBytes");
const totalMissionCardImages = total(missionCardImages, "rawBytes");

enforce(
  "Largest JavaScript asset",
  largestJavaScript,
  limits.largestJavaScriptGzip,
);
enforce("Total JavaScript", totalJavaScript, limits.totalJavaScriptGzip);
enforce("Total CSS", totalCss, limits.totalCssGzip);
enforce(
  "Total mission card images",
  totalMissionCardImages,
  limits.totalMissionCardImages,
);

const result = {
  status: "ok",
  assets: {
    javascriptFiles: javascript.length,
    largestJavaScriptGzipKb: kilobytes(largestJavaScript),
    totalJavaScriptGzipKb: kilobytes(totalJavaScript),
    totalCssGzipKb: kilobytes(totalCss),
    missionCardImageFiles: missionCardImages.length,
    totalMissionCardImagesKb: kilobytes(totalMissionCardImages),
  },
  budgetsKb: {
    largestJavaScriptGzip: kilobytes(limits.largestJavaScriptGzip),
    totalJavaScriptGzip: kilobytes(limits.totalJavaScriptGzip),
    totalCssGzip: kilobytes(limits.totalCssGzip),
    totalMissionCardImages: kilobytes(limits.totalMissionCardImages),
  },
  headroomKb: {
    largestJavaScriptGzip: kilobytes(
      limits.largestJavaScriptGzip - largestJavaScript,
    ),
    totalJavaScriptGzip: kilobytes(
      limits.totalJavaScriptGzip - totalJavaScript,
    ),
    totalCssGzip: kilobytes(limits.totalCssGzip - totalCss),
  },
};

const reportPath = process.env.ASSET_BUDGET_REPORT;
if (reportPath) {
  let previous = { samples: [] };
  try {
    previous = JSON.parse(
      await readFile(
        process.env.ASSET_BUDGET_PREVIOUS ??
          "artifacts/previous/asset-budget-trend.json",
        "utf8",
      ),
    );
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const now = new Date();
  const cutoff = now.valueOf() - 90 * 86_400_000;
  const samples = [
    ...(Array.isArray(previous.samples) ? previous.samples : []),
    { measuredAt: now.toISOString(), ...result.assets },
  ].filter((sample) => Date.parse(sample.measuredAt) >= cutoff);
  const first = samples[0];
  const latest = samples.at(-1);
  const history = {
    schemaVersion: 1,
    generatedAt: now.toISOString(),
    retentionDays: 90,
    samples,
    trend: {
      sampleCount: samples.length,
      totalJavaScriptGzipDeltaKb: Number(
        (latest.totalJavaScriptGzipKb - first.totalJavaScriptGzipKb).toFixed(1),
      ),
      totalCssGzipDeltaKb: Number(
        (latest.totalCssGzipKb - first.totalCssGzipKb).toFixed(1),
      ),
      currentHeadroomKb: result.headroomKb,
    },
  };
  await mkdir(path.dirname(path.resolve(reportPath)), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result));
