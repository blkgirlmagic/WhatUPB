/**
 * Policy ingestion orchestrator.
 *
 * Calls the Federal Register fetcher and upserts results into Supabase
 * policy_events table using service-role key (server-side only).
 *
 * Idempotent: onConflict external_id means re-running is always safe.
 */

import { createClient } from "@supabase/supabase-js";
import { fetchFederalRegisterEvents } from "./federal-register";
import type { PolicyIngestResult } from "@/types/policy";
import type { PolicyEvent } from "@/types/policy";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}

/** Upsert a batch of events into Supabase. Returns { inserted, skipped }. */
async function upsertEvents(
  events: PolicyEvent[]
): Promise<{ inserted: number; skipped: number; errors: number }> {
  if (events.length === 0) return { inserted: 0, skipped: 0, errors: 0 };

  const supabase = getSupabaseAdmin();

  // Supabase upsert with onConflict handles idempotency
  const { data, error } = await supabase
    .from("policy_events")
    .upsert(events, {
      onConflict: "external_id",
      ignoreDuplicates: true, // don't update existing rows — only insert new
    })
    .select("id");

  if (error) {
    console.error("Supabase upsert error:", error);
    return { inserted: 0, skipped: events.length, errors: 1 };
  }

  const inserted = data?.length ?? 0;
  const skipped = events.length - inserted;

  return { inserted, skipped, errors: 0 };
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

/**
 * Run Federal Register ingestion.
 *
 * @param dryRun  If true, fetch and normalise records but do NOT write to Supabase.
 *                Returns the normalised records for inspection.
 */
export async function ingestFederalRegister(
  dryRun = false
): Promise<PolicyIngestResult & { sample?: PolicyEvent[] }> {
  const startMs = Date.now();

  console.log(`[policy/ingest] Starting Federal Register ingestion (dryRun=${dryRun})`);

  const { events, totalFetched, agencyTermPairs } =
    await fetchFederalRegisterEvents();

  console.log(
    `[policy/ingest] Fetched ${totalFetched} unique documents across ${agencyTermPairs} agency×term pairs`
  );

  if (dryRun) {
    const durationMs = Date.now() - startMs;
    console.log(`[policy/ingest] Dry run complete — ${totalFetched} records (no DB writes)`);
    return {
      newRecords: 0,
      skipped: 0,
      errors: 0,
      durationMs,
      source: "federal_register",
      sample: events.slice(0, 10), // return first 10 for inspection
    };
  }

  const { inserted, skipped, errors } = await upsertEvents(events);

  const durationMs = Date.now() - startMs;
  console.log(
    `[policy/ingest] Done — inserted=${inserted} skipped=${skipped} errors=${errors} duration=${durationMs}ms`
  );

  return {
    newRecords: inserted,
    skipped,
    errors,
    durationMs,
    source: "federal_register",
  };
}
