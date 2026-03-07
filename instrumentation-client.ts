import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: 'https://t.whatupb.com',
  ui_host: 'https://us.posthog.com',
  defaults: '2026-01-30'
})
