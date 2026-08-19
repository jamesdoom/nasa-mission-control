const defaultUrl = "https://nasa-mission-control-alpha.vercel.app";
const baseUrl = process.env.PRODUCTION_URL ?? process.argv[2] ?? defaultUrl;

if (!baseUrl.startsWith("https://")) {
  throw new Error("PRODUCTION_URL must use HTTPS.");
}

async function request(path) {
  const startedAt = performance.now();
  const response = await fetch(new URL(path, baseUrl), {
    headers: {
      accept: path.startsWith("/api/") ? "application/json" : "text/html",
      "user-agent": "nasa-mission-control-production-smoke/1.0",
    },
    redirect: "follow",
    signal: AbortSignal.timeout(10_000),
  });
  return { response, durationMs: Math.round(performance.now() - startedAt) };
}

const health = await request("/api/health");
if (!health.response.ok) {
  throw new Error(
    `Health check returned HTTP ${String(health.response.status)}.`,
  );
}
if (!health.response.headers.get("cache-control")?.includes("no-store")) {
  throw new Error("Health response must not be cached.");
}
const healthBody = await health.response.json();
if (
  healthBody?.status !== "ok" ||
  healthBody?.service !== "mission-control-api" ||
  Number.isNaN(Date.parse(healthBody?.checkedAt))
) {
  throw new Error("Health response did not match the public contract.");
}

const spa = await request("/about");
if (!spa.response.ok) {
  throw new Error(`SPA route returned HTTP ${String(spa.response.status)}.`);
}
const html = await spa.response.text();
if (!html.includes('<div id="root"></div>')) {
  throw new Error("SPA route did not return the application entry point.");
}

console.log(
  JSON.stringify({
    status: "ok",
    baseUrl,
    checkedAt: new Date().toISOString(),
    healthMs: health.durationMs,
    spaMs: spa.durationMs,
  }),
);
