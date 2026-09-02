import { expect, test } from "@playwright/test";

test("runs the Explore Evidence question surface on desktop", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore evidence" })).toBeVisible();
  await expect(page.getByLabel("Result view")).toHaveValue("evidence");
  await expect(page.getByLabel("Date")).toHaveValue("all");
  await expect(page.getByRole("button", { name: "Show results" })).toBeEnabled();
  await expect(page.getByText(/matching records?/)).toBeVisible();
  await page.screenshot({
    path: "output/playwright/explore-desktop.png",
    fullPage: true,
  });

  await page.getByLabel("Add a condition").selectOption("photo");
  await page.getByRole("button", { name: "Add condition" }).click();
  await page.getByLabel("Photo is").selectOption("with");
  await expect(page.getByRole("status")).toContainText(
    "Question changed. Show results to apply it."
  );
  await page.getByRole("button", { name: "Show results" }).click();
  await expect(page.getByRole("status")).toContainText(
    "Results match this question."
  );

});

test("keeps Explore Evidence in one overflow-free mobile column", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore evidence" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Show results" })).toBeVisible();
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
});
