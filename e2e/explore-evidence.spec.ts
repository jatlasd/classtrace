import { expect, test, type Locator } from "@playwright/test";

function relativeLuminance(color: string): number {
  const channels = color.match(/[\d.]+/g)?.slice(0, 3).map(Number);
  if (!channels || channels.length !== 3) {
    throw new Error(`Could not parse rendered color: ${color}`);
  }

  const [red, green, blue] = channels.map((channel) => {
    const value = channel / 255;
    return value <= 0.04045
      ? value / 12.92
      : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

async function renderedContrast(
  foreground: Locator,
  background: Locator
): Promise<number> {
  const [foregroundColor, backgroundColor] = await Promise.all([
    foreground.evaluate((element) => getComputedStyle(element).color),
    background.evaluate((element) => getComputedStyle(element).backgroundColor),
  ]);
  const foregroundLuminance = relativeLuminance(foregroundColor);
  const backgroundLuminance = relativeLuminance(backgroundColor);
  return (
    (Math.max(foregroundLuminance, backgroundLuminance) + 0.05) /
    (Math.min(foregroundLuminance, backgroundLuminance) + 0.05)
  );
}

test("opens on evidence and applies optional filters on desktop", async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  await expect(page.getByText("Ask questions of the evidence you reviewed and saved.")).toBeVisible();
  await expect(page.getByRole("button", { name: /^Filter by student/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Evidence", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  await expect(page.getByRole("heading", { name: "All evidence", exact: true })).toBeVisible();
  expect(
    await renderedContrast(
      page.getByRole("link", { name: "Capture", exact: true }),
      page.locator("body")
    )
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    await renderedContrast(
      page.getByText("Ask questions of the evidence you reviewed and saved."),
      page.locator("body")
    )
  ).toBeGreaterThanOrEqual(4.5);
  await page.screenshot({
    path: "output/playwright/explore-desktop.png",
    fullPage: false,
  });

  await page.getByRole("button", { name: "Filters", exact: true }).click();
  await expect(page.getByLabel("Date", { exact: true })).toHaveValue("all");
  await expect(page.getByLabel("Student", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Tags", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Class at capture", { exact: true })).toBeVisible();
  await expect(page.getByLabel("Photo", { exact: true })).toHaveValue("either");
  await page.getByText("How filters work", { exact: true }).click();
  await expect(page.getByText(/Evidence must match every filter you set/)).toBeVisible();
  await expect(page.getByText(/What evidence did I save for Mary recently/)).toBeVisible();
  await page.getByText("How filters work", { exact: true }).click();
  await page.getByRole("region", { name: "Filter evidence" }).screenshot({ path: "output/playwright/explore-filters-desktop.png" });
  await expect(page.getByRole("button", { name: "Show results" })).toBeEnabled();

  await page.getByLabel("Photo", { exact: true }).selectOption("with");
  await expect(page.getByRole("button", { name: "Update results" })).toBeEnabled();
  await page.getByRole("button", { name: "Update results" }).click();
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  await expect(page.getByRole("list", { name: "Applied filters" })).toContainText("With a photo");
  await expect(page.getByRole("heading", { name: "Matching evidence" })).toBeFocused();
  await page.getByRole("button", { name: "Group by student", exact: true }).click();
  await expect(page.getByRole("button", { name: "Group by student", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("list", { name: "Applied filters" })).toContainText("With a photo");
});

test("keeps Explore Evidence in one overflow-free mobile column", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/app/explore", { waitUntil: "domcontentloaded" });

  await expect(page.getByRole("heading", { name: "Explore" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Filters", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Filter evidence" })).toBeHidden();
  const firstEvidence = page.getByRole("article").first();
  if (await firstEvidence.count()) {
    const position = await firstEvidence.boundingBox();
    const primaryNavigation = await page
      .getByRole("navigation", { name: "Primary" })
      .boundingBox();
    expect(position).not.toBeNull();
    expect(primaryNavigation).not.toBeNull();
    expect(position!.y).toBeLessThan(primaryNavigation!.y);
  }
  expect(
    await renderedContrast(
      page.getByText("Ask questions of the evidence you reviewed and saved."),
      page.locator("body")
    )
  ).toBeGreaterThanOrEqual(4.5);
  expect(
    await renderedContrast(
      page.getByRole("link", { name: "Students" }),
      page.locator("body")
    )
  ).toBeGreaterThanOrEqual(4.5);
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
      )
    )
    .toBe(true);

  await page.screenshot({
    path: "output/playwright/explore-mobile.png",
    fullPage: false,
  });
  await page.getByRole("button", { name: /^Filter by date/ }).click();
  await expect(page.getByLabel("Date", { exact: true })).toBeFocused();
  await page.getByLabel("Date", { exact: true }).selectOption("range");
  await expect(page.getByLabel("Start date")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByRole("button", { name: "Update results" })).toBeDisabled();
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await page.getByRole("region", { name: "Filter evidence" }).screenshot({ path: "output/playwright/explore-filters-mobile.png" });
});
