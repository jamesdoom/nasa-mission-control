import { expect, test } from "@playwright/test";

const media = {
  nasaId: "phase4-rover",
  title: "Curiosity evidence record",
  description: "A Mars rover observation.",
  mediaType: "image",
  dateCreated: "2024-01-01T00:00:00Z",
  center: "JPL",
  photographer: null,
  keywords: ["Mars"],
  previewUrl: "/assets/missions/curiosity.jpg",
};

test("follows a guided discovery into evidence, saves context, and resumes after reload", async ({
  page,
}) => {
  await page.route("**/api/media/**", (route) => {
    const url = new URL(route.request().url());
    const body = url.pathname.endsWith("/search")
      ? {
          query: url.searchParams.get("q"),
          mediaType: "image",
          page: Number(url.searchParams.get("page")),
          pageSize: 24,
          totalHits: 1,
          totalPages: 1,
          items: [media],
        }
      : {
          ...media,
          assets: [],
          playbackUrl: media.previewUrl,
          downloadUrl: media.previewUrl,
        };
    return route.fulfill({ json: body });
  });
  await page.goto("/discover#mars-field-lab");
  const missionLink = page
    .locator("#mars-field-lab a")
    .filter({ hasText: "Open instrument" })
    .first();
  await missionLink.click();
  await expect(
    page.getByRole("heading", { name: "Curiosity", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Search Curiosity imagery" }).click();
  await expect(page).toHaveURL(/q=Curiosity/);
  const search = page.url();
  await page.getByRole("link", { name: "Inspect asset" }).click();
  await expect(
    page.getByRole("heading", { name: media.title, exact: true, level: 1 }),
  ).toBeVisible();
  const detail = page.url();
  await page
    .getByRole("button", { name: "Save exploration to Flight Log" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "Exploration saved with" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Resume from Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Resume exploration and learning" }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Resume exploration and learning" }),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/phase4-flight-log.png",
    fullPage: true,
  });
  await page.getByRole("link", { name: "Resume saved exploration" }).click();
  await expect(page).toHaveURL(detail);
  await page.getByRole("link", { name: "Return to media search" }).click();
  await expect(page).toHaveURL(search);
  await page
    .getByRole("link", { name: "Return to previous exploration" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Curiosity", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Return to previous exploration" })
    .click();
  await expect(page).toHaveURL(/\/discover#mars-field-lab$/);
});

test("resumes a learning step and unfinished reflection through Flight Log", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/learn?track=mars-evidence");
  await page
    .getByRole("checkbox", { name: "Mark step complete" })
    .first()
    .check();
  await page
    .getByLabel("Your response")
    .fill("Draft: rock evidence needs context.");
  await page
    .locator("#step-mission")
    .getByRole("link", { name: "Open learning resource" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Curiosity", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "Return to previous exploration" })
    .click();
  await expect(page.locator("#step-mission")).toBeFocused();
  await expect(page.getByLabel("Your response")).toHaveValue(
    "Draft: rock evidence needs context.",
  );
  await expect(page.getByText("Not yet saved", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Resume from Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Resume exploration and learning" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Continue: Inspect Curiosity" }).click();
  await expect(page).toHaveURL(/track=mars-evidence#step-mission$/);
  await expect(page.locator("#step-mission")).toBeFocused();
  await expect(
    page.getByRole("checkbox", { name: "Mark step complete" }).first(),
  ).toBeChecked();
  await expect(page.getByLabel("Your response")).toHaveValue(
    "Draft: rock evidence needs context.",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("restores the answered trivia question and score without scoring it twice", async ({
  page,
}) => {
  await page.goto("/trivia?difficulty=cadet&category=moon");
  await page.getByRole("button", { name: /Sea of Tranquility/ }).click();
  const prompt = await page.locator(".trivia-question h2").innerText();
  await page.getByRole("link", { name: "Explore related evidence" }).click();
  await expect(
    page.getByRole("heading", { name: "Apollo 11", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Resume from Flight Log" }).click();
  await expect(
    page.getByRole("heading", { name: "Resume exploration and learning" }),
  ).toBeVisible();
  await page.reload();
  await page.getByRole("link", { name: "Resume trivia", exact: false }).click();
  await expect(page.locator(".trivia-question h2")).toHaveText(prompt);
  await expect(
    page.getByRole("button", { name: /Sea of Tranquility/ }),
  ).toBeDisabled();
  await expect(page.locator(".trivia-telemetry > div").first()).toContainText(
    "1/",
  );
  await page.getByRole("button", { name: "Next question" }).click();
  await page.reload();
  await expect(page.locator(".trivia-question h2")).not.toHaveText(prompt);
  await expect(page.locator(".trivia-telemetry > div").first()).toContainText(
    "1/",
  );
});

test("keeps unavailable storage usable and labels session-only exploration saves", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Blocked", "QuotaExceededError");
    };
  });
  await page.goto("/missions/curiosity");
  await page
    .getByRole("button", { name: "Save exploration to Flight Log" })
    .click();
  await expect(
    page.getByRole("status").filter({ hasText: "session only" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Resume from Flight Log" }).click();
  await expect(
    page.getByRole("link", { name: "Resume saved exploration" }),
  ).toBeVisible();
});
