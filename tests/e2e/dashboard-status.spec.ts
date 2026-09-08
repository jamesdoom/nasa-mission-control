import { expect, test } from "@playwright/test";

const apod = {
  date: "2024-01-01",
  title: "Briefing test image",
  explanation: "A recorded observation.",
  mediaType: "image",
  mediaUrl: "/assets/missions/curiosity.jpg",
  hdUrl: null,
  thumbnailUrl: null,
  copyright: null,
};
const asteroids = {
  startDate: "2024-01-01",
  endDate: "2024-01-07",
  totalCount: 0,
  potentiallyHazardousCount: 0,
  closestApproachKm: null,
  asteroids: [],
};
const failure = {
  error: {
    code: "UPSTREAM_UNAVAILABLE",
    message: "Test source unavailable",
    retryable: false,
  },
};

for (const sample of [
  { image: "available", scan: "available", overall: "Available" },
  { image: "available", scan: "failed", overall: "Partially available" },
  { image: "failed", scan: "available", overall: "Partially available" },
  { image: "failed", scan: "failed", overall: "Unavailable" },
  { image: "stale", scan: "stale", overall: "Stale data" },
  { image: "stale", scan: "failed", overall: "Partially available" },
]) {
  test(`dashboard reports image ${sample.image} and scan ${sample.scan}`, async ({
    page,
  }, testInfo) => {
    await page.route("**/api/**", (route) => {
      const image = new URL(route.request().url()).pathname === "/api/apod";
      const state = image ? sample.image : sample.scan;
      return route.fulfill({
        status: state === "failed" ? 503 : 200,
        contentType: "application/json",
        headers: state === "stale" ? { "x-data-status": "stale-fallback" } : {},
        body: JSON.stringify(
          state === "failed" ? failure : image ? apod : asteroids,
        ),
      });
    });
    await page.goto("/");
    const status = page.getByRole("region", { name: "Briefing data status" });
    await expect(status.locator("strong")).toHaveText(sample.overall);
    await expect(status).toContainText(
      `Daily image: ${sample.image === "failed" ? "Unavailable" : sample.image === "stale" ? "Stale fallback" : "Available"}`,
    );
    await expect(status).toContainText(
      `Asteroid Watch: ${sample.scan === "failed" ? "Unavailable" : sample.scan === "stale" ? "Stale fallback" : "Available"}`,
    );
    await expect(page.getByText("NASA // ACTIVE")).toHaveCount(0);
    await expect(page.getByText("SYSTEMS NOMINAL")).toHaveCount(0);
    if (sample.image !== "failed")
      await expect(
        page.getByRole("heading", { name: apod.title }),
      ).toBeVisible();
    if (sample.scan !== "failed") {
      await expect(
        page.getByText(/0 approaches in the returned scan/),
      ).toContainText("2024-01-01–2024-01-07");
    }
    for (const width of [320, 768, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(status).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await status.screenshot({
      path: testInfo.outputPath("briefing-status.png"),
    });
    await page.context().setOffline(true);
    await expect(status.locator("strong")).toHaveText("Offline");
    await expect(
      status.getByRole("button", { name: "Refresh briefing" }),
    ).toBeDisabled();
    if (sample.image === "failed")
      await expect(page.getByText(/No daily image is loaded/)).toBeVisible();
    else
      await expect(
        page.getByRole("heading", { name: apod.title }),
      ).toBeVisible();
    await page.context().setOffline(false);
    await expect(status.locator("strong")).toHaveText(sample.overall);
  });
}

test("dashboard keeps loading and refresh recovery truthful", async ({
  page,
}) => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  let failing = true;
  await page.route("**/api/**", async (route) => {
    await gate;
    await route.fulfill({
      status: failing ? 503 : 200,
      contentType: "application/json",
      body: JSON.stringify(
        failing
          ? failure
          : new URL(route.request().url()).pathname === "/api/apod"
            ? apod
            : asteroids,
      ),
    });
  });
  await page.goto("/");
  const status = page.getByRole("region", { name: "Briefing data status" });
  await expect(status.locator("strong")).toHaveText("Loading");
  await expect(status).toContainText(
    "Daily image: Loading. Asteroid Watch: Loading.",
  );
  release();
  await expect(status.locator("strong")).toHaveText("Unavailable");
  failing = false;
  await status.getByRole("button", { name: "Refresh briefing" }).click();
  await expect(status.locator("strong")).toHaveText("Available");
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
});
