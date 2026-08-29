import { expect, test } from "@playwright/test";

test("opens the authenticated settings page", async ({ page }, testInfo) => {
  await page.goto("/app/settings");

  await expect(page).toHaveURL(/\/app\/settings(?:\?.*)?$/);
  await expect(
    page.getByRole("heading", { name: "Account and workspace" })
  ).toBeVisible();
  await expect(page.locator(".authenticated-app")).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("authenticated-class-trace.png"),
    fullPage: true,
  });
});
