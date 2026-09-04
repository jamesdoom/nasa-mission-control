import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const assetsDirectory = path.resolve("apps/client/dist/assets");
const missionCardDirectory = path.resolve(
  "apps/client/dist/assets/missions/cards",
);
const publicAssetsDirectory = path.resolve("apps/client/dist/assets");
const limits = {
  largestJavaScriptGzip: 110 * 1024,
  totalJavaScriptGzip: 190 * 1024,
  totalCssGzip: 26 * 1024,
  totalMissionCardImages: 400 * 1024,
  totalImages: 3_600 * 1024,
  totalFonts: 80 * 1024,
};

const imageExtensions = new Set([
  ".avif",
  ".gif",
  ".jpeg",
  ".jpg",
  ".png",
  ".webp",
]);
const fontExtensions = new Set([".otf", ".ttf", ".woff", ".woff2"]);

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

async function recursiveAssets(directory, extensions) {
  const entries = await readdir(directory, { withFileTypes: true });
  const assets = [];
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      assets.push(...(await recursiveAssets(filePath, extensions)));
    } else if (extensions.has(path.extname(entry.name).toLowerCase())) {
      assets.push({
        name: path.relative(publicAssetsDirectory, filePath),
        rawBytes: (await stat(filePath)).size,
      });
    }
  }
  return assets;
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
const images = await recursiveAssets(publicAssetsDirectory, imageExtensions);
const fonts = await recursiveAssets(publicAssetsDirectory, fontExtensions);
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
const totalImages = total(images, "rawBytes");
const totalFonts = total(fonts, "rawBytes");

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
enforce("Total image assets", totalImages, limits.totalImages);
enforce("Total font assets", totalFonts, limits.totalFonts);

const result = {
  status: "ok",
  assets: {
    javascriptFiles: javascript.length,
    largestJavaScriptGzipKb: kilobytes(largestJavaScript),
    totalJavaScriptGzipKb: kilobytes(totalJavaScript),
    totalCssGzipKb: kilobytes(totalCss),
    missionCardImageFiles: missionCardImages.length,
    totalMissionCardImagesKb: kilobytes(totalMissionCardImages),
    imageFiles: images.length,
    totalImagesKb: kilobytes(totalImages),
    fontFiles: fonts.length,
    totalFontsKb: kilobytes(totalFonts),
  },
  budgetsKb: {
    largestJavaScriptGzip: kilobytes(limits.largestJavaScriptGzip),
    totalJavaScriptGzip: kilobytes(limits.totalJavaScriptGzip),
    totalCssGzip: kilobytes(limits.totalCssGzip),
    totalMissionCardImages: kilobytes(limits.totalMissionCardImages),
    totalImages: kilobytes(limits.totalImages),
    totalFonts: kilobytes(limits.totalFonts),
  },
  headroomKb: {
    largestJavaScriptGzip: kilobytes(
      limits.largestJavaScriptGzip - largestJavaScript,
    ),
    totalJavaScriptGzip: kilobytes(
      limits.totalJavaScriptGzip - totalJavaScript,
    ),
    totalCssGzip: kilobytes(limits.totalCssGzip - totalCss),
    totalImages: kilobytes(limits.totalImages - totalImages),
    totalFonts: kilobytes(limits.totalFonts - totalFonts),
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
      totalImagesDeltaKb: Number(
        (latest.totalImagesKb - first.totalImagesKb).toFixed(1),
      ),
      totalFontsDeltaKb: Number(
        (latest.totalFontsKb - first.totalFontsKb).toFixed(1),
      ),
      currentHeadroomKb: result.headroomKb,
    },
  };
  await mkdir(path.dirname(path.resolve(reportPath)), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(history, null, 2)}\n`, "utf8");
}

console.log(JSON.stringify(result));
