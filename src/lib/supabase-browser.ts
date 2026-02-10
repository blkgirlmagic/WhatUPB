import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Fallback to placeholder during build/prerender — the client is only
  // actually used at runtime in the browser where env vars are injected.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

  return createBrowserClient(url, key)
}
