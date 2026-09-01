import { expect, test } from "@playwright/test";

test("renders the public landing page without desktop or mobile overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Turn messy capture into teacher-validated evidence.",
    })
  ).toBeVisible();
  await expect(
    page.locator("main").getByRole("link", { name: "How it works" })
  ).toBeVisible();
  await expect(page.locator("main#main-content")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);

  await page.screenshot({
    path: testInfo.outputPath("landing-desktop.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Turn messy capture into teacher-validated evidence.",
    })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);

  await page.screenshot({
    path: testInfo.outputPath("landing-mobile.png"),
    fullPage: true,
  });
});
