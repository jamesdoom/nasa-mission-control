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

test("loads APOD, saves it, and preserves it in the Flight Log", async ({
  page,
}) => {
  await mockApod(page);
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
});
