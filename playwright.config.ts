import { defineConfig, devices } from "@playwright/test";
import { config as loadEnv } from "dotenv";
import { authenticatedStorageStatePath } from "./e2e/support/auth-state";

loadEnv({ path: ".env.local", quiet: true });

const baseURL = "http://localhost:3000";

export default defineConfig({
  testDir: "./e2e",
  outputDir: "output/playwright/test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  globalSetup: "./e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: "auth-setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "authenticated-chromium",
      dependencies: ["auth-setup"],
      testMatch: /(?:authenticated-page|landing-page)\.spec\.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: authenticatedStorageStatePath,
      },
    },
  ],
});
