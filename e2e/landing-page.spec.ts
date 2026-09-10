import { expect, test, type Page } from "@playwright/test";

async function expectHighlightedRowsToRemainDistinct(page: Page) {
  const highlightedSlots = page.locator('.public-landing .slot[data-set="true"]');
  await expect(highlightedSlots.first()).toHaveCSS(
    "text-decoration-line",
    "underline",
  );
  const styles = await highlightedSlots.first().evaluate((slot) => {
    const { backgroundColor, fontSize, lineHeight } = getComputedStyle(slot);
    return { backgroundColor, fontSize, lineHeight };
  });
  expect(styles.backgroundColor).not.toBe("rgba(0, 0, 0, 0)");
  expect(
    Number.parseFloat(styles.lineHeight) / Number.parseFloat(styles.fontSize),
  ).toBeGreaterThanOrEqual(1.19);
}

test("renders the public landing page without desktop or mobile overflow", async ({
  page,
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Write one sentence about one student.",
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
  await expectHighlightedRowsToRemainDistinct(page);

  await page.screenshot({
    path: testInfo.outputPath("landing-desktop.png"),
    fullPage: true,
  });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Write one sentence about one student.",
    })
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await expectHighlightedRowsToRemainDistinct(page);

  await page.screenshot({
    path: testInfo.outputPath("landing-mobile.png"),
    fullPage: true,
  });
});
