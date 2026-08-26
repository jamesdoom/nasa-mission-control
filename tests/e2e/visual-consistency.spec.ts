import { expect, test, type Locator, type Page } from "@playwright/test";

const viewportMatrix = [
  { name: "mobile-320", width: 320, height: 700 },
  { name: "tablet-768", width: 768, height: 900 },
  { name: "laptop-1366", width: 1366, height: 768 },
  { name: "large-1920", width: 1920, height: 1080 },
  { name: "zoom-200", width: 640, height: 800 },
] as const;

const apod = {
  date: "2024-01-01",
  title: "NGC 1232: A Grand Design Spiral Galaxy",
  explanation: "A source-checked description of a distant spiral galaxy.",
  mediaType: "image",
  mediaUrl:
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800'%3E%3Crect width='1200' height='800' fill='%23081424'/%3E%3Ccircle cx='600' cy='400' r='220' fill='%233e74ff' opacity='.55'/%3E%3C/svg%3E",
  hdUrl: null,
  thumbnailUrl: null,
  copyright: "Test Observatory",
};

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document.documentElement.scrollWidth <=
          document.documentElement.clientWidth,
      ),
    )
    .toBe(true);
}

async function captureElement(locator: Locator, path: string): Promise<void> {
  if (process.env.UPDATE_SCREENSHOTS !== "true") return;
  await locator.screenshot({ path, animations: "disabled" });
}

test("keeps shared mission patterns aligned across the responsive matrix", async ({
  page,
}) => {
  for (const viewport of viewportMatrix) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/missions");
    await expect(
      page.getByRole("heading", { name: "Mission Archive" }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const filters = page.locator(".mission-filters");
    const filterBox = await filters.boundingBox();
    expect(filterBox?.width ?? Infinity).toBeLessThanOrEqual(viewport.width);

    if (viewport.name === "mobile-320" || viewport.name === "tablet-768") {
      await captureElement(
        page.locator(".mission-filter-section"),
        `docs/screenshots/visual-${viewport.name}-filters.png`,
      );
    }
  }
});

test("keeps mission evidence and source blocks balanced at laptop and large widths", async ({
  page,
}) => {
  for (const viewport of viewportMatrix.filter(({ width }) => width >= 1366)) {
    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/missions/juno");
    await expect(
      page.getByRole("heading", {
        name: "How the mission answered its question",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const terms = page.locator(".mission-terms");
    const spacing = await page.evaluate(() => {
      const termsBox = document
        .querySelector(".mission-terms")
        ?.getBoundingClientRect();
      const timelineBox = document
        .querySelector(".mission-timeline")
        ?.getBoundingClientRect();
      return termsBox && timelineBox ? timelineBox.top - termsBox.bottom : 0;
    });
    expect(spacing).toBeGreaterThanOrEqual(56);
    await captureElement(
      page.locator(".mission-overview--evidence"),
      `docs/screenshots/visual-${viewport.name}-mission-evidence.png`,
    );
    await expect(terms).toBeVisible();
  }
});

test("keeps loading, error, and recovered content panels visually stable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 800 });
  let resolveRequest: (() => void) | undefined;
  const releaseRequest = new Promise<void>((resolve) => {
    resolveRequest = resolve;
  });
  let attempt = 0;
  await page.route(
    (url) => url.pathname === "/api/apod",
    async (route) => {
      attempt += 1;
      if (attempt <= 2) {
        if (attempt === 1) await releaseRequest;
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "UPSTREAM_UNAVAILABLE",
              message: "NASA did not respond in time.",
              requestId: "visual-state-check",
              retryable: true,
            },
          }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apod),
      });
    },
  );
  await page.goto("/apod?date=2024-01-01", { waitUntil: "domcontentloaded" });
  const state = page.locator(".state-panel");
  await expect(state).toContainText("Loading the selected APOD record");
  await captureElement(state, "docs/screenshots/visual-loading-state.png");

  resolveRequest?.();
  await expect(state).toContainText("NASA data unavailable");
  await expectNoHorizontalOverflow(page);
  await captureElement(state, "docs/screenshots/visual-error-state.png");

  await page.getByRole("button", { name: "Try again" }).click();
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("keeps empty and stale-degraded guidance aligned and actionable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/missions?destination=Moon&vehicle=rover");
  const emptyState = page.locator(".mission-results .state-panel");
  await expect(emptyState).toContainText(
    "No missions match this telemetry profile",
  );
  await expect(
    emptyState.getByRole("button", { name: "Show all missions" }),
  ).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await captureElement(emptyState, "docs/screenshots/visual-empty-state.png");

  await page.clock.setFixedTime(new Date("2026-08-26T13:00:00Z"));
  await page.route(
    (url) => url.pathname === "/api/apod",
    async (route) => {
      await route.fulfill({
        status: 200,
        headers: { "x-data-status": "stale-fallback" },
        contentType: "application/json",
        body: JSON.stringify(apod),
      });
    },
  );
  await page.goto("/apod?date=2024-01-01");
  const staleState = page.locator(".data-status");
  await expect(staleState).toContainText("Stale fallback");
  await expect(staleState).toContainText(
    "NASA was unavailable; showing an older validated response",
  );
  await expectNoHorizontalOverflow(page);
  await captureElement(
    staleState,
    "docs/screenshots/visual-stale-degraded-state.png",
  );
});

test("keeps mission and story evidence paths readable at long-form widths", async ({
  page,
}) => {
  for (const width of [320, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/missions/juno");
    const missionPath = page.getByRole("navigation", {
      name: "Mission evidence path",
    });
    await expect(missionPath.getByRole("link")).toHaveCount(4);
    await expectNoHorizontalOverflow(page);

    await page.goto("/stories/mars-habitability");
    const storyPath = page.getByRole("navigation", {
      name: "Story evidence path",
    });
    await expect(storyPath.getByRole("link")).toHaveCount(4);
    await expectNoHorizontalOverflow(page);
    const widestParagraph = await page
      .locator(".story-chapters p")
      .evaluateAll((paragraphs) =>
        Math.max(
          ...paragraphs.map((item) => item.getBoundingClientRect().width),
        ),
      );
    expect(widestParagraph).toBeLessThanOrEqual(760);

    if (width === 320 || width === 1366) {
      await page.locator(".skip-link").evaluate((item) => {
        item.style.visibility = "hidden";
      });
      await captureElement(
        page.locator("#story-chapters"),
        `docs/screenshots/phase-2-story-${String(width)}.png`,
      );
    }
  }
});
