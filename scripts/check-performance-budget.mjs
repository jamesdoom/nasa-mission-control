import { readdir, readFile, stat } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import path from "node:path";

const assetsDirectory = path.resolve("apps/client/dist/assets");
const missionCardDirectory = path.resolve(
  "apps/client/dist/assets/missions/cards",
);
const limits = {
  largestJavaScriptGzip: 120 * 1024,
  totalJavaScriptGzip: 186 * 1024,
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

console.log(
  JSON.stringify({
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
  }),
);
