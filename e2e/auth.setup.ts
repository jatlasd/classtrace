import { mkdir } from "node:fs/promises";
import path from "node:path";
import { clerk } from "@clerk/testing/playwright";
import { test as setup } from "@playwright/test";
import { authenticatedStorageStatePath } from "./support/auth-state";

setup("authenticate the visual QA user", async ({ page }) => {
  const emailAddress = process.env.E2E_CLERK_USER_EMAIL;

  if (!emailAddress) {
    throw new Error("E2E_CLERK_USER_EMAIL must be set in .env.local");
  }

  await page.goto("/sign-in");
  await clerk.signIn({ page, emailAddress });

  await mkdir(path.dirname(authenticatedStorageStatePath), { recursive: true });
  await page.context().storageState({ path: authenticatedStorageStatePath });
});
