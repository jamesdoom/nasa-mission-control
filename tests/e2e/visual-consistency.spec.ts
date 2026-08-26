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

test("gives major route families distinct, accessible atmospheres", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "UPSTREAM_UNAVAILABLE",
            message: "Deterministic atmosphere capture",
            requestId: "atmosphere-visual-check",
            retryable: true,
          },
        }),
      }),
  );
  for (const sample of [
    { path: "/missions", mood: "mission", capture: ".missions-intro" },
    { path: "/earth", mood: "earth", capture: ".earth-intro" },
    {
      path: "/apod?date=2024-01-01",
      mood: "live",
      capture: ".page-intro",
    },
    { path: "/learn", mood: "learning", capture: ".learning-intro" },
  ]) {
    await page.goto(sample.path);
    const shell = page.locator(".app-shell");
    await expect(shell).toHaveAttribute("data-route-mood", sample.mood);
    expect(
      await shell.evaluate((element) =>
        getComputedStyle(element, "::before").getPropertyValue("top"),
      ),
    ).toBe("0px");
    await expectNoHorizontalOverflow(page);
    const contrast = await shell.evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        text: styles.getPropertyValue("--text").trim(),
        surface: styles.getPropertyValue("--surface").trim(),
      };
    });
    expect(contrast.text).toBe("#edf5ff");
    expect(contrast.surface).toBe("rgba(7, 17, 29, 0.88)");
    await captureElement(
      page.locator(sample.capture),
      `docs/screenshots/atmosphere-${sample.mood}.png`,
    );
  }
});

test("gives each live-data instrument a recognizable console signal", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.route(
    (url) => url.pathname.startsWith("/api/"),
    (route) =>
      route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({
          error: {
            code: "UPSTREAM_UNAVAILABLE",
            message: "Deterministic instrument-state capture",
            requestId: "instrument-visual-check",
            retryable: true,
          },
        }),
      }),
  );
  for (const sample of [
    {
      path: "/apod?date=2024-01-01",
      instrument: "apod",
      signal: "#b69aff",
      capture: ".date-console",
    },
    {
      path: "/asteroids",
      instrument: "asteroids",
      signal: "#ffb65c",
      capture: ".asteroid-console",
    },
    {
      path: "/space-weather",
      instrument: "donki",
      signal: "#ff8bc8",
      capture: ".weather-console",
    },
    {
      path: "/earth",
      instrument: "epic",
      signal: "#5de5c2",
      capture: ".earth-console",
    },
    {
      path: "/media",
      instrument: "media",
      signal: "#83b4ff",
      capture: ".media-console",
    },
  ]) {
    await page.goto(sample.path);
    const shell = page.locator(".app-shell");
    await expect(shell).toHaveAttribute("data-instrument", sample.instrument);
    expect(
      await shell.evaluate((element) =>
        getComputedStyle(element)
          .getPropertyValue("--instrument-signal")
          .trim(),
      ),
    ).toBe(sample.signal);
    await expectNoHorizontalOverflow(page);
    await captureElement(
      page.locator(sample.capture),
      `docs/screenshots/instrument-${sample.instrument}.png`,
    );
    await page.setViewportSize({ width: 320, height: 800 });
    await expectNoHorizontalOverflow(page);
    const controlWidth = await page
      .locator(sample.capture)
      .evaluate((element) => element.getBoundingClientRect().width);
    expect(controlWidth).toBeLessThanOrEqual(320);
    await page.setViewportSize({ width: 1366, height: 900 });
  }
});

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
    await page.goto("/missions/webb");
    await expect(
      page.getByRole("heading", {
        name: "How the mission answered its question",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);

    const evidenceHeadingGap = await page.evaluate(() => {
      const badge = document.querySelector(
        ".mission-overview--evidence .evidence-badge",
      );
      const heading = document.querySelector(".mission-overview--evidence h3");
      if (!badge || !heading) return 0;
      return (
        heading.getBoundingClientRect().top -
        badge.getBoundingClientRect().bottom
      );
    });
    expect(evidenceHeadingGap).toBeGreaterThanOrEqual(10);

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
  await expect(state).toHaveClass(/state-panel--loading/);
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
    "Current fetch failed · older validated response",
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

test("frames mission and story journeys cinematically with static reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 768, 1366]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/missions/webb");
    const flightPlan = page.getByRole("navigation", {
      name: "Mission narrative sequence",
    });
    await expect(flightPlan.getByRole("link")).toHaveCount(3);
    await expectNoHorizontalOverflow(page);
    expect(
      await page
        .locator(".mission-detail__hero > img")
        .evaluate((image) => getComputedStyle(image).animationDuration),
    ).toMatch(/^(0\.01ms|1e-05s)$/);

    await page.goto("/stories/cosmic-observatories");
    await expect(
      page.getByRole("img", {
        name: "James Webb Space Telescope standing fully assembled during testing",
      }),
    ).toBeVisible();
    await expectNoHorizontalOverflow(page);
    expect(
      await page
        .locator(".story-hero__visual img")
        .evaluate((image) => getComputedStyle(image).animationDuration),
    ).toMatch(/^(0\.01ms|1e-05s)$/);

    if (width === 320 || width === 1366) {
      await captureElement(
        page.locator(".story-hero"),
        `docs/screenshots/cinematic-story-${String(width)}.png`,
      );
      await page.goto("/missions/webb");
      await captureElement(
        page.locator(".mission-detail__hero"),
        `docs/screenshots/cinematic-mission-${String(width)}.png`,
      );
    }
  }
});

test("keeps navigation sticky and choreography optional", async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto("/missions");
  const header = page.locator(".site-header");
  expect(
    await header.evaluate((element) => getComputedStyle(element).position),
  ).toBe("sticky");
  await page.evaluate(() => window.scrollTo({ top: 900 }));
  await expect
    .poll(() =>
      header.evaluate((element) => element.getBoundingClientRect().top),
    )
    .toBe(0);
  await expect(header.getByRole("link", { name: "Dashboard" })).toBeVisible();

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  const section = page.locator("main .section").first();
  await expect(section).toHaveAttribute("data-motion-state", "revealed");
  const staticMotion = await section.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      animationName: styles.animationName,
      opacity: styles.opacity,
      transform: styles.transform,
    };
  });
  expect(staticMotion.animationName).toBe("none");
  expect(staticMotion.opacity).toBe("1");
  expect(staticMotion.transform).toBe("none");
});
