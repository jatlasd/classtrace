import { expect, test } from "@playwright/test";

test("opens on evidence and applies optional filters on desktop", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore evidence" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Evidence", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "All evidence", exact: true })).toBeVisible();
  await page.screenshot({
    path: "output/playwright/explore-desktop.png",
    fullPage: true,
  });

  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.getByLabel("Date")).toHaveValue("all");
  await expect(page.getByLabel("Student")).toBeVisible();
  await expect(page.getByLabel("Tags")).toBeVisible();
  await expect(page.getByLabel("Class at capture")).toBeVisible();
  await expect(page.getByLabel("Photo")).toHaveValue("either");
  await expect(page.getByRole("button", { name: "Show results" })).toBeEnabled();

  await page.getByLabel("Photo").selectOption("with");
  await expect(page.getByRole("button", { name: "Update results" })).toBeEnabled();
  await page.getByRole("button", { name: "Update results" }).click();
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Applied filters" })).toContainText("With a photo");
  await expect(page.getByRole("heading", { name: "Matching evidence" })).toBeFocused();
  await page.getByRole("button", { name: "By student", exact: true }).click();
  await expect(page.getByRole("button", { name: "By student", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("list", { name: "Applied filters" })).toContainText("With a photo");
});

test("keeps Explore Evidence in one overflow-free mobile column", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore evidence" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  const firstEvidence = page.getByRole("article").first();
  if (await firstEvidence.count()) {
    const position = await firstEvidence.boundingBox();
    expect(position?.y).toBeLessThan(450);
  }
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);

  await page.screenshot({
    path: "output/playwright/explore-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await page.getByLabel("Date", { exact: true }).selectOption("range");
  await expect(page.getByLabel("Start date")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Update results" })).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
