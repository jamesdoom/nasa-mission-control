import { expect, test, type Page } from "@playwright/test";

async function capturePortfolioScreenshot(
  page: Page,
  options: Parameters<Page["screenshot"]>[0],
): Promise<void> {
  if (process.env.UPDATE_SCREENSHOTS === "true") {
    await page.screenshot(options);
  }
}

const testImage = `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="1000" viewBox="0 0 1600 1000">
    <defs><radialGradient id="space"><stop stop-color="#4087bd"/><stop offset=".35" stop-color="#122b52"/><stop offset="1" stop-color="#020611"/></radialGradient></defs>
    <rect width="1600" height="1000" fill="url(#space)"/>
    <circle cx="760" cy="480" r="260" fill="none" stroke="#86d9ee" stroke-width="24" opacity=".35"/>
    <circle cx="760" cy="480" r="170" fill="#06101f" stroke="#ffb340" stroke-width="5" opacity=".8"/>
  </svg>
`)}`;

const apod = {
  date: "2024-01-01",
  title: "NGC 1232: A Grand Design Spiral Galaxy",
  explanation: "A source-checked description of a distant spiral galaxy.",
  mediaType: "image",
  mediaUrl: testImage,
  hdUrl: null,
  thumbnailUrl: null,
  copyright: "Test Observatory",
};

const asteroidFeed = {
  startDate: "2026-07-29",
  endDate: "2026-07-30",
  totalCount: 2,
  potentiallyHazardousCount: 1,
  closestApproachKm: 2_000_000,
  asteroids: [
    {
      id: "123",
      name: "(2026 TEST)",
      jplUrl: "https://ssd.jpl.nasa.gov/example",
      potentiallyHazardous: true,
      sentryObject: false,
      diameterMeters: { min: 100, max: 200 },
      approach: {
        date: "2026-07-29",
        dateTimeUtc: "2026-07-29T12:00:00.000Z",
        velocityKph: 50_000,
        missDistanceKm: 2_000_000,
        missDistanceLunar: 5.2,
      },
    },
    {
      id: "456",
      name: "(2026 SAFE)",
      jplUrl: "https://ssd.jpl.nasa.gov/example-safe",
      potentiallyHazardous: false,
      sentryObject: false,
      diameterMeters: { min: 20, max: 45 },
      approach: {
        date: "2026-07-30",
        dateTimeUtc: "2026-07-30T18:00:00.000Z",
        velocityKph: 80_000,
        missDistanceKm: 5_000_000,
        missDistanceLunar: 13,
      },
    },
  ],
};

const mediaItem = {
  nasaId: "AS11-40-5903",
  title: "Buzz Aldrin on the Lunar Surface",
  description: "Apollo 11 lunar module pilot Buzz Aldrin works on the Moon.",
  mediaType: "image",
  dateCreated: "1969-07-20T00:00:00Z",
  center: "JSC",
  photographer: "Neil Armstrong",
  keywords: ["Apollo 11", "Moon", "Lunar surface"],
  previewUrl: testImage,
};

async function mockMedia(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/api/media/search",
    async (route) => {
      const url = new URL(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          query: url.searchParams.get("q") ?? "apollo",
          mediaType: url.searchParams.get("mediaType") ?? "all",
          page: Number(url.searchParams.get("page") ?? 1),
          pageSize: 24,
          totalHits: 25,
          totalPages: 2,
          items: [mediaItem],
        }),
      });
    },
  );
  await page.route(
    (url) => url.pathname === `/api/media/${mediaItem.nasaId}`,
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...mediaItem,
          assets: [{ url: testImage, label: "original.jpg", kind: "image" }],
          playbackUrl: testImage,
          downloadUrl: testImage,
        }),
      });
    },
  );
}

const spaceWeatherFeed = {
  startDate: "2026-07-27",
  endDate: "2026-08-03",
  category: "all",
  counts: { flare: 1, cme: 1, storm: 1 },
  events: [
    {
      id: "2026-08-03T10:00:00-FLR-001",
      category: "flare",
      title: "Solar flare M1.2",
      startTimeUtc: "2026-08-03T10:00:00.000Z",
      endTimeUtc: "2026-08-03T10:10:00.000Z",
      location: "N10E20",
      activeRegion: 14494,
      instruments: ["GOES: EXIS"],
      summary: "An observed burst of solar X-ray activity.",
      measurements: [
        {
          label: "Flare class",
          value: "M1.2",
          explanation: "GOES X-ray classification reported by DONKI.",
        },
      ],
      linkedEventIds: [],
      sourceUrl: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/FLR/1/-1",
    },
    {
      id: "2026-08-03T08:00:00-CME-001",
      category: "cme",
      title: "Coronal mass ejection",
      startTimeUtc: "2026-08-03T08:00:00.000Z",
      endTimeUtc: null,
      location: "N10E20",
      activeRegion: 14494,
      instruments: ["SOHO: LASCO/C2"],
      summary: "A plasma eruption observed leaving the Sun.",
      measurements: [
        {
          label: "Estimated speed",
          value: "600 km/s",
          explanation: "Modeled radial speed from the selected CME analysis.",
        },
      ],
      linkedEventIds: ["2026-08-03T10:00:00-FLR-001"],
      sourceUrl: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/CME/1/-1",
    },
    {
      id: "2026-08-02T15:00:00-GST-001",
      category: "storm",
      title: "Geomagnetic storm observation",
      startTimeUtc: "2026-08-02T15:00:00.000Z",
      endTimeUtc: null,
      location: "Earth",
      activeRegion: null,
      instruments: ["NOAA"],
      summary: "Minor observed geomagnetic activity",
      measurements: [
        {
          label: "Peak Kp",
          value: "5.67",
          explanation:
            "Minor observed geomagnetic activity; observed 2026-08-02T18:00:00.000Z.",
        },
      ],
      linkedEventIds: ["2026-07-30T16:53:00-CME-001"],
      sourceUrl: "https://webtools.ccmc.gsfc.nasa.gov/DONKI/view/GST/1/-1",
    },
  ],
};

async function mockSpaceWeather(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/api/space-weather",
    async (route) => {
      const url = new URL(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...spaceWeatherFeed,
          category: url.searchParams.get("category") ?? "all",
        }),
      });
    },
  );
}

const earthObservation = {
  date: "2026-08-01",
  latestAvailableDate: "2026-08-01",
  collection: "natural",
  images: [0, 1].map((index) => ({
    id: `epic-${String(index)}`,
    caption: "This image was taken by NASA's EPIC camera aboard DSCOVR.",
    capturedAtUtc: `2026-08-01T0${String(index)}:45:54.000Z`,
    centroid: { latitude: 5.3, longitude: -156.2 },
    imageUrl: testImage,
    thumbnailUrl: testImage,
    downloadUrl: testImage,
  })),
  dailyComposite: {
    title: "MODIS Terra corrected-reflectance true color",
    layer: "MODIS_Terra_CorrectedReflectance_TrueColor",
    imageUrl: testImage,
    sourceUrl: "https://earthdata.nasa.gov/data/tools/gibs",
  },
};

async function mockEarth(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/api/earth",
    async (route) => {
      const url = new URL(route.request().url());
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          ...earthObservation,
          date: url.searchParams.get("date") ?? earthObservation.date,
          collection: url.searchParams.get("collection") ?? "natural",
        }),
      });
    },
  );
}

async function mockApod(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/api/apod",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(apod),
      });
    },
  );
}

async function mockAsteroids(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/api/asteroids",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(asteroidFeed),
      });
    },
  );
}

test("loads APOD, saves it, and preserves it in the Flight Log", async ({
  page,
}) => {
  await mockApod(page);
  await mockAsteroids(page);
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Explore beyond the horizon." }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/dashboard.png",
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByRole("button", { name: `Save ${apod.title} to favorites` })
    .click();
  await page.getByRole("link", { name: "Flight Log" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
  await page.getByText("Add note or tags", { exact: true }).click();
  await page.getByLabel("Personal note").fill("Revisit for nebula colors");
  await page.getByLabel("Custom collection").fill("Deep sky study");
  await page.getByLabel("Tags").fill("nebula, color");
  await page.getByRole("button", { name: "Save details" }).click();
  await expect(
    page.getByText("Personal details saved on this device."),
  ).toBeVisible();
  await page.getByLabel("Search saved records").fill("Deep sky study");
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
  await page.getByLabel("View name").fill("Deep sky notes");
  await page.getByRole("button", { name: "Save current view" }).click();
  await expect(
    page.getByRole("link", { name: "Deep sky notes" }),
  ).toBeVisible();
  await page.getByRole("radio", { name: /APOD/ }).click();
  await expect(page).toHaveURL(/collection=apod/);
  await page.getByLabel("Search saved records").fill("no matching record");
  await expect(page.getByText("No saved records match")).toBeVisible();
  await page.getByRole("button", { name: "Clear archive controls" }).click();
  await expect(page).toHaveURL(/\/favorites$/);
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
});

test("keeps archive dates in the URL", async ({ page }) => {
  await mockApod(page);
  await page.goto("/apod?date=2024-01-01");
  await expect(page.getByLabel("Observation date")).toHaveValue("2024-01-01");
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
});

test("recovers from a transient APOD failure without losing the selected date", async ({
  page,
}) => {
  let attempts = 0;
  await page.route(
    (url) => url.pathname === "/api/apod",
    async (route) => {
      attempts += 1;
      if (attempts <= 2) {
        await route.fulfill({
          status: 503,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: "UPSTREAM_UNAVAILABLE",
              message: "NASA did not respond in time.",
              requestId: "test-recovery",
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
  await page.goto("/apod?date=2024-01-01");
  await expect(page.getByText("NASA did not respond in time.")).toBeVisible();
  await expect(page.getByText("Reference: test-recovery")).toBeVisible();
  await page.getByRole("button", { name: "Retry transmission" }).click();
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
  await expect(page).toHaveURL(/date=2024-01-01/);
});

test("provides an operable mobile navigation menu", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApod(page);
  await mockAsteroids(page);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await expect(menu).toHaveAttribute("aria-expanded", "false");
  await menu.click();
  await expect(menu).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page.getByRole("button", { name: /Explore/ }).click();
  await expect(
    page.getByRole("link", { name: "Asteroid Watch", exact: true }),
  ).toBeVisible();
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/mobile-navigation.png",
    fullPage: false,
    animations: "disabled",
  });
  await page.getByRole("link", { name: "Asteroid Watch", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Asteroid Watch" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("guides a first visit through clear, accessible starting choices", async ({
  page,
}) => {
  await mockApod(page);
  await mockAsteroids(page);
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Start with one clear path" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /See what is passing Earth/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Follow a landmark mission/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Investigate a space question/ }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Know what the data labels mean" }),
  ).toBeVisible();

  await page.getByRole("button", { name: /Explore/ }).click();
  const explore = page.getByRole("navigation", { name: "Primary" });
  await expect(explore.getByText("Observe now")).toBeVisible();
  await expect(explore.getByText("Explore NASA")).toBeVisible();
  await expect(explore.getByText("Learn and compare")).toBeVisible();
});

test("keeps primary journey controls usable at a 320px zoom-equivalent width", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await mockApod(page);
  await mockAsteroids(page);
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Toggle navigation" });
  await expect(menu).toBeVisible();
  const menuBox = await menu.boundingBox();
  expect(menuBox?.width ?? 0).toBeGreaterThanOrEqual(44);
  expect(menuBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("keeps a learning session operable with keyboard and accessibility preferences", async ({
  page,
}) => {
  await page.emulateMedia({
    reducedMotion: "reduce",
    forcedColors: "active",
  });
  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto("/learn?track=mars-evidence");

  const firstStep = page
    .getByRole("checkbox", {
      name: "Mark step complete",
    })
    .first();
  await firstStep.focus();
  await page.keyboard.press("Space");
  await expect(firstStep).toBeChecked();

  const firstAnswer = page.getByRole("radio").first();
  await firstAnswer.focus();
  await page.keyboard.press("ArrowDown");
  await expect(
    page.getByRole("radio", {
      name: "The environment may once have been habitable",
    }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Check answer" }).focus();
  await page.keyboard.press("Enter");
  await expect(page.getByText("Correct.")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);

  await page.emulateMedia({ media: "print" });
  await expect(
    page.getByRole("heading", { name: "Learner evidence sheet" }),
  ).toBeVisible();
  await expect(page.locator(".site-header")).toBeHidden();
});

test("explores, sorts, opens, and saves an asteroid encounter", async ({
  page,
}) => {
  await mockAsteroids(page);
  await page.goto(
    "/asteroids?startDate=2026-07-29&endDate=2026-07-30&sort=closest",
  );
  await expect(
    page.getByRole("heading", { name: "Asteroid Watch" }),
  ).toBeVisible();
  await expect(
    page.getByText("Potentially hazardous does not mean dangerous today."),
  ).toBeVisible();
  await page.getByLabel("Sort encounters").selectOption("fastest");
  await expect(page).toHaveURL(/sort=fastest/);
  await page.getByRole("radio", { name: "Diameter estimate" }).click();
  await expect(page).toHaveURL(/metric=diameter/);
  await expect(
    page.getByRole("heading", { name: "Put the numbers in perspective" }),
  ).toBeVisible();
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/asteroid-watch.png",
    fullPage: true,
    animations: "disabled",
  });
  const encounter = page
    .getByRole("article")
    .filter({ hasText: "(2026 TEST)" });
  await encounter.getByRole("link", { name: "Open encounter →" }).click();
  await expect(page).toHaveURL(/\/asteroids\/123/);
  await expect(
    page.getByText("Potentially hazardous asteroid", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Save to Flight Log" }).click();
  await page.getByRole("link", { name: "Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Asteroid encounters" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "(2026 TEST)" }),
  ).toBeVisible();
});

test("searches and inspects the NASA media archive", async ({ page }) => {
  await mockMedia(page);
  await page.goto("/media?q=apollo&mediaType=all&page=1");
  await expect(
    page.getByRole("heading", { name: "NASA Media Library" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: mediaItem.title }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "image", exact: true }).click();
  await expect(page).toHaveURL(/mediaType=image/);
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/media-library.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("link", { name: `Open ${mediaItem.title}` }).click();
  await expect(page).toHaveURL(/\/media\/AS11-40-5903/);
  await expect(
    page.getByRole("heading", { name: mediaItem.title }),
  ).toBeVisible();
  await expect(page.getByText("Neil Armstrong")).toBeVisible();
  await page.getByRole("button", { name: "Save to Flight Log" }).click();
  await page.getByRole("link", { name: "Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Media discoveries" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: mediaItem.title }),
  ).toBeVisible();
});

test("filters observed DONKI space weather events", async ({ page }) => {
  await mockSpaceWeather(page);
  await page.goto(
    "/space-weather?startDate=2026-07-27&endDate=2026-08-03&category=all",
  );
  await expect(
    page.getByRole("heading", { name: "Space Weather Center" }),
  ).toBeVisible();
  await expect(
    page.getByText("Research data—not an operational forecast."),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Geomagnetic storm observation" }),
  ).toBeVisible();
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/space-weather.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.getByRole("radio", { name: "Solar flares" }).click();
  await expect(page).toHaveURL(/category=flare/);
});

test("browses EPIC frames and keeps Earth observation state in the URL", async ({
  page,
}) => {
  await mockEarth(page);
  await page.goto("/earth?date=2026-08-01&collection=natural");
  await expect(
    page.getByRole("heading", { name: "Earth Observatory" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Our world in daylight" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Show Earth image 2 of 2" }).click();
  await expect(page).toHaveURL(/image=2/);
  await page.getByRole("radio", { name: "Enhanced color" }).click();
  await expect(page).toHaveURL(/collection=enhanced/);
  await expect(
    page.getByRole("heading", { name: "Our world in daylight" }),
  ).toBeVisible();
  await page.locator("main").click({ position: { x: 10, y: 10 } });
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/earth-observatory.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("filters and opens a source-backed mission record", async ({ page }) => {
  await page.goto("/missions");
  await expect(
    page.getByRole("heading", { name: "Mission Archive" }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Destination", exact: true })
    .selectOption("Mars");
  await expect(page).toHaveURL(/destination=Mars/);
  await expect(page.getByRole("heading", { name: "Curiosity" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Apollo 11" })).toHaveCount(0);
  await page
    .getByRole("link", { name: "Open Curiosity mission archive" })
    .click();
  await expect(page).toHaveURL(/\/missions\/curiosity$/);
  await expect(
    page.getByRole("heading", { name: "Defining moments" }),
  ).toBeVisible();
  await expect(page.getByText("Curated record", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Save to Flight Log" }).click();
  await page.getByRole("link", { name: "Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Mission records" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Curiosity" })).toBeVisible();
  await page
    .getByRole("link", { name: "Open Curiosity mission archive" })
    .click();
  await page.locator("main").click({ position: { x: 10, y: 10 } });
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/mission-archive.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("compares mission profiles across a merged chronology", async ({
  page,
}) => {
  await page.goto("/missions?destination=Moon");
  await page.getByRole("checkbox", { name: /Apollo 11/ }).click();
  await expect(page).toHaveURL(/compare=apollo-11/);
  await page.getByRole("checkbox", { name: /Artemis I/ }).click();
  await expect(page).toHaveURL(/compare=apollo-11%2Cartemis-i/);
  await page.getByRole("link", { name: "Open comparison" }).click();
  await expect(page).toHaveURL(
    /\/missions\/compare\?missions=apollo-11%2Cartemis-i/,
  );
  await expect(page).toHaveTitle("Mission Comparison | NASA Mission Control");
  await expect(
    page.getByRole("heading", { name: "Mission parameters" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Across mission time" }),
  ).toBeVisible();
  await page.getByLabel("Bookmark name").fill("Moon program comparison");
  await page.getByRole("button", { name: "Save comparison" }).click();
  await expect(
    page.getByRole("link", { name: "Moon program comparison" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("link", { name: "Moon program comparison" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("explores celestial scale with shareable measurement state", async ({
  page,
}) => {
  await page.goto("/scale-lab?profiles=moon%2Cmars%2Csaturn");
  await expect(page).toHaveTitle(
    "Celestial Scale Laboratory | NASA Mission Control",
  );
  await expect(
    page.getByRole("heading", {
      name: "How far does the reference span reach?",
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "One-way light time" }).click();
  await expect(page).toHaveURL(/metric=signal/);
  await expect(
    page.getByRole("heading", { name: "How long would a signal need?" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("region", { name: "How long would a signal need?" })
      .getByText("1.3 seconds"),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("shows portfolio evidence, API status, and the expanded mission archive", async ({
  page,
}) => {
  await page.route(
    (url) => url.pathname === "/api/health",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          status: "ok",
          service: "mission-control-api",
          checkedAt: "2026-08-19T15:00:00.000Z",
        }),
      });
    },
  );
  await page.goto("/about");
  await expect(
    page.getByRole("heading", { name: "Mission Control API online" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "From unstable public data to a dependable learning experience",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", {
      name: "Follow the evidence through Mission Control",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Open Mission Archive →" }),
  ).toHaveAttribute("href", "/missions");
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/portfolio-case-study.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto("/missions");
  await page.getByRole("button", { name: /Moon/ }).click();
  await expect(page).toHaveURL(/destination=Moon/);
  await expect(
    page.getByRole("heading", { name: "Artemis I", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("combobox", { name: "Destination", exact: true })
    .selectOption("Sun");
  await expect(page).toHaveURL(/destination=Sun/);
  await expect(
    page.getByRole("heading", { name: "Parker Solar Probe" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Open Parker Solar Probe mission archive" })
    .click();
  await expect(page).toHaveURL(/\/missions\/parker-solar-probe$/);
  await expect(page.getByText("NASA / Bill Ingalls")).toBeVisible();
  await page.goto("/missions/artemis-i");
  await expect(
    page.getByRole("heading", { name: "Continue through the record" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Best images from Artemis I/ }),
  ).toBeVisible();
  await expect(page.getByText(/next scheduled status review/i)).toBeVisible();
});

test("follows a guided discovery path into mission history and back", async ({
  page,
}) => {
  await page.goto("/discover");
  await expect(page).toHaveTitle("Guided Discovery | NASA Mission Control");
  const journey = page
    .getByRole("article")
    .filter({ hasText: "Reconstruct Apollo 11 through evidence" });
  await journey
    .getByRole("button", {
      name: "Save Reconstruct Apollo 11 through evidence to Flight Log",
    })
    .click();
  await journey
    .getByRole("link", { name: "Open instrument →" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/missions\/apollo-11$/);
  await expect(
    page.getByRole("heading", {
      name: "Connect this record to live Mission Control",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open guided path" }).click();
  await expect(page).toHaveURL(/\/discover#moon-then-now$/);
  await expect(
    page.getByRole("heading", {
      name: "Reconstruct Apollo 11 through evidence",
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "1 saved record" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Guided discovery paths" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Export backup" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Resume path →" }).click();
  await expect(page).toHaveURL(/\/discover#moon-then-now$/);
});

test("follows a source-checked science story into its first evidence chapter", async ({
  page,
}) => {
  await page.goto("/discover#science-stories");
  await expect(
    page.getByRole("heading", { name: "Investigate one big question" }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Begin science story →" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/stories\/mars-habitability$/);
  await expect(
    page.getByRole("heading", { name: "Reading the record of a wetter Mars" }),
  ).toBeVisible();
  await expect(
    page.getByText("Habitability is not evidence", { exact: false }),
  ).toBeVisible();
  await expect(page.getByText("Curated record").first()).toBeVisible();
  await page.getByRole("link", { name: "Open chapter 1 →" }).click();
  await expect(page).toHaveURL(/\/missions\/curiosity$/);
  await expect(
    page.getByRole("heading", { name: "Curiosity", exact: true, level: 1 }),
  ).toBeVisible();
});

test("connects Artemis I to its guided lunar investigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/missions/artemis-i");
  await page.getByRole("link", { name: "Open guided path" }).click();
  await expect(page).toHaveURL(/\/discover#artemis-return-moon$/);
  const journey = page
    .getByRole("article")
    .filter({ hasText: "Rehearse a return to the Moon" });
  await expect(
    journey.getByRole("heading", { name: "Rehearse a return to the Moon" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  await expect(
    journey.getByRole("link", {
      name: "Verify context with NASA Artemis I ↗",
    }),
  ).toHaveAttribute("href", "https://www.nasa.gov/mission/artemis-i/");
  await journey
    .getByRole("button", {
      name: "Save Rehearse a return to the Moon to Flight Log",
    })
    .click();
  await journey.getByRole("link", { name: "Open instrument →" }).nth(1).click();
  await expect(page).toHaveURL(/\/earth$/);
});

test("opens Artemis I from guided path nine at the top of the record", async ({
  page,
}) => {
  await page.goto("/discover#artemis-return-moon");
  const journey = page
    .getByRole("article")
    .filter({ hasText: "Rehearse a return to the Moon" });
  await expect(
    journey.getByRole("heading", { name: "Rehearse a return to the Moon" }),
  ).toBeVisible();
  await journey
    .getByRole("link", { name: "Open instrument →" })
    .first()
    .click();

  await expect(page).toHaveURL(/\/missions\/artemis-i$/);
  await expect(
    page.getByRole("heading", { name: "Artemis I", exact: true }),
  ).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
});

test("scores and explains source-checked space trivia", async ({ page }) => {
  await page.goto("/trivia?difficulty=cadet");
  await expect(page).toHaveTitle("Space Trivia | NASA Mission Control");
  await expect(
    page.getByRole("heading", { name: "Space Trivia" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Sea of Tranquility/ }).click();
  await expect(page.getByText("Correct trajectory")).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Verify with NASA Apollo 11/ }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "specialist" }).click();
  await expect(page).toHaveURL(/difficulty=specialist/);
  await expect(page.getByText(/Which spacecraft became/)).toBeVisible();
  await page.getByRole("radio", { name: "Planets" }).click();
  await expect(page).toHaveURL(/difficulty=specialist&category=planets/);
  await expect(page.getByText(/What system lowered Curiosity/)).toBeVisible();
  await expect(page.getByText("0/1")).toBeVisible();
  await page.locator("main").click({ position: { x: 10, y: 10 } });
  await capturePortfolioScreenshot(page, {
    path: "docs/screenshots/space-trivia.png",
    fullPage: true,
    animations: "disabled",
  });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("navigates the mission index with global command search", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Open command search" }),
  ).toBeVisible();
  await page.keyboard.press("Control+K");
  const dialog = page.getByRole("dialog", { name: "Command search" });
  await expect(dialog).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
  await page.getByRole("combobox").fill("Parker Solar Probe");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/missions\/parker-solar-probe$/);
  await expect(
    page.getByRole("heading", { name: "Parker Solar Probe" }),
  ).toBeVisible();
});

test("searches local, saved, and NASA records from one discovery index", async ({
  page,
}) => {
  await mockMedia(page);
  await page.addInitScript(() => {
    localStorage.setItem(
      "mission-control:mission-favorites:v1",
      JSON.stringify(["artemis-i"]),
    );
  });
  await page.goto("/search?q=Artemis");

  await expect(
    page.getByRole("heading", { name: "Search the mission index" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Rehearse a return to the Moon" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: mediaItem.title }),
  ).toBeVisible();
  await page.getByRole("radio", { name: "Flight Log" }).click();
  await expect(page).toHaveURL(/\/search\?q=Artemis&source=saved$/);
  await expect(page.getByText("Saved mission · Moon")).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("explores the mission archive through an accessible destination map", async ({
  page,
}) => {
  await page.goto("/missions/map");
  await expect(
    page.getByRole("heading", { name: "Solar-system mission map" }),
  ).toBeVisible();
  await page
    .getByRole("button", {
      name: "Outer Solar System: 3 archive missions",
    })
    .click();
  await expect(page).toHaveURL(/destination=Outer\+Solar\+System/);
  await expect(page.getByText("3 missions displayed")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Voyager 1" })).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});
