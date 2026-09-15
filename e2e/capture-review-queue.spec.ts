import { expect, test, type Locator, type Page } from "@playwright/test";

async function clearDraftsAndOpenCapture(page: Page): Promise<void> {
  await page.addInitScript(() => {
    window.sessionStorage.clear();
  });
  await page.goto("/app", { waitUntil: "domcontentloaded" });
  await expect(page.getByLabel("What happened?")).toBeVisible({
    timeout: 30_000,
  });
}

async function captureDraft(page: Page, text: string): Promise<void> {
  const composer = page.getByLabel("What happened?");
  await composer.fill(text);
  const captureButton = page
    .getByRole("region", { name: "Capture desk" })
    .getByRole("button", { name: /Capture/ });
  await expect(captureButton).toBeEnabled();
  await captureButton.click();
  await expect(page.getByRole("button", { name: /Drafts to review/ })).toBeVisible();
}

async function expectVisibleFocusInsideDialog(
  page: Page,
  dialog: Locator
): Promise<void> {
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  expect(
    await focused.evaluate((element) => {
      const dialogElement = element.closest('[role="dialog"]');
      return Boolean(
        dialogElement &&
          dialogElement.contains(element) &&
          !element.closest("[hidden], [aria-hidden='true']")
      );
    })
  ).toBe(true);
  await expect(dialog.locator(":focus")).toBeVisible();
}

test.describe("capture review queue focus", () => {
  test("keeps native Tab inside visible queue controls", async ({ page }) => {
    test.setTimeout(60_000);
    await clearDraftsAndOpenCapture(page);
    await captureDraft(page, "@Mary used a reading strategy independently #reading");
    await captureDraft(page, "@Mary explained the next step clearly #reading");
    await captureDraft(page, "@Mary completed the task independently #practice");

    await page.getByRole("button", { name: /Drafts to review, 3/ }).click();
    const dialog = page.getByRole("dialog", { name: "Drafts to review" });
    await expect(dialog).toBeVisible();
    const closeButton = dialog.getByRole("button", {
      name: "Close drafts to review",
    });
    await expect(closeButton).toBeFocused();

    await page.keyboard.press("Shift+Tab");
    await expectVisibleFocusInsideDialog(page, dialog);
    await page.keyboard.press("Tab");
    await expectVisibleFocusInsideDialog(page, dialog);

    await dialog.locator("li > button[aria-expanded]").first().click();
    await expectVisibleFocusInsideDialog(page, dialog);
    for (let index = 0; index < 14; index += 1) {
      await page.keyboard.press("Tab");
      await expectVisibleFocusInsideDialog(page, dialog);
    }
  });

  test("keeps an invalid original edit inside the mobile review sheet", async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width: 390, height: 844 });
    await clearDraftsAndOpenCapture(page);
    await captureDraft(page, "@Mary used a reading strategy independently #reading");

    await page.getByRole("button", { name: "Review", exact: true }).click();
    const dialog = page.getByRole("dialog", { name: "Drafts to review" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "Edit original capture" }).click();
    const sourceNote = dialog.getByLabel("Original capture");
    await sourceNote.fill("This edit has no student mention.");
    const saveSourceButton = dialog.getByRole("button", {
      name: "Save original capture",
    });
    await saveSourceButton.focus();
    await page.keyboard.press("Enter");

    const alert = dialog.getByRole("alert").last();
    await expect(alert).toBeVisible();
    await expect(sourceNote).toHaveAttribute("aria-invalid", "true");
    await expect(sourceNote).toHaveAttribute(
      "aria-describedby",
      await alert.getAttribute("id") ?? ""
    );
    await expect(alert).toBeFocused();
    await expectVisibleFocusInsideDialog(page, dialog);
    await expect(page.locator(".fixed.inset-0")).toBeVisible();
  });
});
