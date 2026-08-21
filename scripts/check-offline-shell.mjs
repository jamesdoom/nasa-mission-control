import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const dist = path.resolve("apps/client/dist");
const [serviceWorker, manifestText, indexHtml, assetNames] = await Promise.all([
  readFile(path.join(dist, "sw.js"), "utf8"),
  readFile(path.join(dist, "manifest.webmanifest"), "utf8"),
  readFile(path.join(dist, "index.html"), "utf8"),
  readdir(path.join(dist, "assets")),
]);

const manifest = JSON.parse(manifestText);
const requiredAssets = assetNames.filter(
  (name) => name.endsWith(".js") || name.endsWith(".css"),
);
const missingAssets = requiredAssets.filter(
  (name) => !serviceWorker.includes(`/assets/${name}`),
);

if (missingAssets.length > 0) {
  throw new Error(
    `Offline shell is missing built assets: ${missingAssets.join(", ")}`,
  );
}
if (!serviceWorker.includes('url.pathname.startsWith("/api/")')) {
  throw new Error(
    "Service worker must exclude live API requests from caching.",
  );
}
if (
  !indexHtml.includes('rel="manifest"') ||
  manifest.display !== "standalone"
) {
  throw new Error("Installable manifest metadata is incomplete.");
}

console.log(
  JSON.stringify({
    status: "ok",
    precachedBuildAssets: requiredAssets.length,
    apiCaching: "excluded",
    display: manifest.display,
  }),
);
