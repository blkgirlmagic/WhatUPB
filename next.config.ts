import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSentryConfig(nextConfig, {
  // Sentry org & project (from sentry.io)
  org: "whatupb",
  project: "javascript-nextjs",

  // Auth token for source-map uploads (set in Vercel env vars)
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload wider set of source maps for better stack traces
  widenClientFileUpload: true,

  // Suppress source-map upload logs outside CI
  silent: !process.env.CI,

  // Automatically tree-shake Sentry debug statements to reduce bundle size
  bundleSizeOptimizations: {
    excludeDebugStatements: true,
  },
});
