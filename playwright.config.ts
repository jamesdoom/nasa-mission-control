import { defineConfig, devices } from "@playwright/test";

const preview = process.env.PLAYWRIGHT_PREVIEW === "true";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:5173",
    trace: "on-first-retry",
    ...devices["Desktop Chrome"],
  },
  webServer: {
    command: preview
      ? "npm exec -w @mission-control/client -- vite preview --host 127.0.0.1 --port 5173"
      : "npm run dev -w @mission-control/client -- --host 127.0.0.1",
    url: "http://127.0.0.1:5173",
    reuseExistingServer: !process.env.CI && !preview,
    timeout: 30_000,
  },
});
