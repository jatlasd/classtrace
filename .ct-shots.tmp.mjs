import { chromium } from "@playwright/test";
import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { readFileSync } from "node:fs";

const env = readFileSync("/home/jeremy/projects/classtrace/.env.local", "utf8");
for (const line of env.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
}
const base = "http://localhost:3010";
await clerkSetup({ dotenv: false });
const browser = await chromium.launch();
const shots = [
  ["desktop", { width: 1440, height: 900 }],
  ["mobile", { width: 390, height: 844 }],
];
for (const [label, viewport] of shots) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(`${base}/sign-in`);
  await clerk.signIn({ page, emailAddress: process.env.E2E_CLERK_USER_EMAIL });
  for (const route of ["/app", "/app/explore", "/app/roster", "/app/settings"]) {
    await page.goto(`${base}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    await page.screenshot({ path: `/tmp/ct-${label}${route.replaceAll("/", "-")}.png`, fullPage: false });
  }
  if (label === "desktop") {
    const link = page.locator('a[href^="/app/students/"]').first();
    if (await link.count()) {
      await link.click();
      await page.waitForLoadState("networkidle");
      await page.screenshot({ path: `/tmp/ct-desktop-student.png` });
    }
  }
  await ctx.close();
}
await browser.close();
console.log("done");
