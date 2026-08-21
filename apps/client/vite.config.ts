import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

function fieldConsolePlugin(): Plugin {
  return {
    name: "field-console-service-worker",
    generateBundle(_options, bundle) {
      const generated = Object.values(bundle)
        .map((entry) => `/${entry.fileName}`)
        .filter((file) => /\.(?:js|css)$/.test(file))
        .sort();
      const precache = [
        "/",
        "/index.html",
        "/favicon.svg",
        "/manifest.webmanifest",
        "/assets/fonts/dm-sans-latin.woff2",
        "/assets/fonts/space-mono-bold-latin.woff2",
        "/assets/fonts/space-mono-regular-latin.woff2",
        "/assets/milky-way-960.webp",
        ...generated,
      ];
      const buildId = createHash("sha256")
        .update(precache.join("|"))
        .digest("hex")
        .slice(0, 10);
      const template = readFileSync(
        new URL("./service-worker.template.js.txt", import.meta.url),
        "utf8",
      );
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source: template
          .replace("__BUILD_ID__", buildId)
          .replace("__PRECACHE_URLS__", JSON.stringify(precache)),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), fieldConsolePlugin()],
  server: { proxy: { "/api": "http://localhost:3001" } },
  test: { environment: "jsdom", setupFiles: "./src/test/setup.ts", css: true },
});
