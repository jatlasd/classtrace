import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const allowedDevOrigin = process.env.CLASSTRACE_ALLOWED_DEV_ORIGIN?.trim();

const nextConfig: NextConfig = {
  ...(process.env.NODE_ENV !== "production" && allowedDevOrigin
    ? { allowedDevOrigins: [allowedDevOrigin] }
    : undefined),

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default withSentryConfig(nextConfig, {
  org: "personal-zo3",
  project: "classtrace",
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
});
