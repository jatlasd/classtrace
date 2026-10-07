import { expect, test } from "@playwright/test";

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
  await expect(page.locator("main img").first()).toBeVisible();

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
  await expect(page.locator("main img").first()).toBeVisible();

  await page.screenshot({
    path: testInfo.outputPath("landing-mobile.png"),
    fullPage: true,
  });
});

test("renders the public overview page with the whole video above the fold", async ({
  page,
}, testInfo) => {
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<!doctype html><title>player</title>" })
  );

  for (const [name, viewport] of [
    ["desktop", { width: 1440, height: 900 }],
    ["mobile", { width: 390, height: 844 }],
  ] as const) {
    await page.setViewportSize(viewport);
    await page.goto("/demo");

    await expect(
      page.getByRole("heading", { level: 1, name: "Meet ClassTrace." })
    ).toBeVisible();
    const play = page.getByRole("button", { name: /watch the overview/i });
    await expect(play).toBeVisible();
    const box = await play.boundingBox();
    expect(box && box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await expect(page.locator("iframe")).toHaveCount(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);

    await page.screenshot({
      path: testInfo.outputPath(`overview-${name}.png`),
      fullPage: true,
    });
  }

  await page.setViewportSize({ width: 844, height: 300 });
  await page.goto("/demo");
  const shortPlay = page.getByRole("button", { name: /watch the overview/i });
  expect((await shortPlay.boundingBox())?.width).toBeGreaterThanOrEqual(384);

  await page.getByRole("button", { name: /play from 0:40/i }).click();
  await expect(page.locator("iframe")).toHaveAttribute("src", /[?&]start=40(?:&|$)/);
  await expect(page.locator("iframe")).toBeInViewport();
});
