import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === "development" ? 1.0 : 0.2,

  // Session Replay — capture 10% of sessions, 100% on error
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Don't send events in development
  enabled: process.env.NODE_ENV === "production",
});
