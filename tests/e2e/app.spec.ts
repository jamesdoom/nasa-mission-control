import { expect, test, type Page } from "@playwright/test";

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
  await page.screenshot({
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
});

test("keeps archive dates in the URL", async ({ page }) => {
  await mockApod(page);
  await page.goto("/apod?date=2024-01-01");
  await expect(page.getByLabel("Observation date")).toHaveValue("2024-01-01");
  await expect(page.getByRole("heading", { name: apod.title })).toBeVisible();
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
  await page.screenshot({
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
  await page.screenshot({
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
