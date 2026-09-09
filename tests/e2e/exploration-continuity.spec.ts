import { expect, test } from "@playwright/test";

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
    page.getByRole("heading", { name: "Resume exploration" }),
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
