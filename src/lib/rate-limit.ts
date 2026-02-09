// ---------------------------------------------------------------------------
//  In-memory sliding-window rate limiter for Vercel serverless functions.
//
//  Each IP hash gets a deque of timestamps.  Requests older than the window
//  are pruned on every call, and stale entries are garbage-collected
//  periodically so memory doesn't grow unbounded across warm invocations.
//
//  NOTE: On Vercel each serverless instance has its own memory, so the
//  effective limit per user is PER-INSTANCE.  This is still useful —
//  a single attacker hitting the same instance will be throttled, and
//  the Supabase RPC already has its own DB-level rate limit as a backstop.
// ---------------------------------------------------------------------------

interface SlidingWindow {
  timestamps: number[];
}

const store = new Map<string, SlidingWindow>();

// --- Configuration ---

const WINDOW_MS = 60_000;      // 1 minute
const MAX_REQUESTS = 5;        // max 5 messages per window
const GC_INTERVAL_MS = 60_000; // purge stale keys every 60 s

// --- Garbage collection (runs once per interval per warm instance) ---

let lastGC = Date.now();

function gc() {
  const now = Date.now();
  if (now - lastGC < GC_INTERVAL_MS) return;
  lastGC = now;

  const cutoff = now - WINDOW_MS;
  for (const [key, entry] of store) {
    // Remove timestamps outside the window
    while (entry.timestamps.length > 0 && entry.timestamps[0] <= cutoff) {
      entry.timestamps.shift();
    }
    // Delete empty entries
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

// --- Public API ---

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetMs: number; // ms until the oldest request in the window expires
}

/**
 * Check (and consume) a rate-limit slot for the given IP hash.
 * Returns `allowed: false` if the limit has been exceeded.
 *
 * Pass `null` to skip rate limiting (e.g. when IP is unknown).
 */
export function checkRateLimit(ipHash: string | null): RateLimitResult {
  // No IP → can't rate-limit → allow through
  if (!ipHash) {
    return { allowed: true, remaining: MAX_REQUESTS, resetMs: 0 };
  }

  gc();

  const now = Date.now();
  const cutoff = now - WINDOW_MS;

  let entry = store.get(ipHash);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(ipHash, entry);
  }

  // Prune expired timestamps
  while (entry.timestamps.length > 0 && entry.timestamps[0] <= cutoff) {
    entry.timestamps.shift();
  }

  if (entry.timestamps.length >= MAX_REQUESTS) {
    // Over limit — compute when the oldest request expires
    const resetMs = entry.timestamps[0] + WINDOW_MS - now;
    return {
      allowed: false,
      remaining: 0,
      resetMs: Math.max(resetMs, 0),
    };
  }

  // Consume a slot
  entry.timestamps.push(now);

  return {
    allowed: true,
    remaining: MAX_REQUESTS - entry.timestamps.length,
    resetMs: entry.timestamps[0] + WINDOW_MS - now,
  };
}
