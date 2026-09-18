/**
 * capitol.ts — Server-side query helpers for the Capitol disclosures table.
 *
 * These functions run only in Server Components or API routes.
 * They use the anon client (public READ RLS policy) since disclosures
 * are public record. No service-role key required for reads.
 *
 * Import pattern in Server Components:
 *   import { getDisclosures, getDisclosureStats } from "@/lib/capitol";
 */

import { createClient } from "@supabase/supabase-js";
import type { CapitolDisclosure, DisclosureFilters, DisclosureStats, AssetType } from "@/types/capitol";

// Use anon key for reads (RLS policy allows public SELECT)
function getReadClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Missing Supabase anon credentials");
  return createClient(url, key, { auth: { persistSession: false } });
}

const TABLE = "capitol_disclosures";
const DEFAULT_LIMIT = 50;

// ── Date helpers ──────────────────────────────────────────────────────────────

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

// ── Disclosures query ─────────────────────────────────────────────────────────

/**
 * Query disclosures with optional type filter, search, and pagination.
 * Returns an empty array when the table has no records (never mock data).
 */
export async function getDisclosures(
  filters: DisclosureFilters = {}
): Promise<CapitolDisclosure[]> {
  const supabase = getReadClient();
  const {
    assetType,
    chamber,
    search,
    page = 1,
    limit = DEFAULT_LIMIT,
  } = filters;

  let query = supabase
    .from(TABLE)
    .select("*")
    .order("disclosure_date", { ascending: false })
    .order("trade_date", { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  // Asset type filter (skip when "All" or undefined)
  if (assetType && assetType !== "All") {
    query = query.eq("asset_type", assetType);
  }

  // Chamber filter
  if (chamber && chamber !== "All") {
    query = query.eq("chamber", chamber);
  }

  // Full-text search across official name and asset description
  if (search && search.trim()) {
    const term = search.trim().toLowerCase();
    // Supabase .or() with ilike for case-insensitive partial match
    query = query.or(
      `official.ilike.%${term}%,asset_description.ilike.%${term}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("[Capitol] getDisclosures error:", error);
    return [];
  }

  return (data ?? []) as CapitolDisclosure[];
}

// ── Stats query ───────────────────────────────────────────────────────────────

/**
 * Compute summary statistics from the disclosures table.
 * All values derive from real database records.
 * Returns zero counts (never fabricated) when the table is empty.
 */
export async function getDisclosureStats(): Promise<DisclosureStats> {
  const supabase = getReadClient();
  const sevenDaysAgo = daysAgoIso(7);

  // Run counts in parallel
  const [totalRes, weekRes, cryptoRes, delayRes, typeRes] = await Promise.all([
    // Total records
    supabase.from(TABLE).select("id", { count: "exact", head: true }),

    // This week (trade_date within last 7 days)
    supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .gte("trade_date", sevenDaysAgo),

    // Crypto trades
    supabase
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .eq("asset_type", "Crypto"),

    // Average delay — fetch all delay_days, compute in JS
    // (Supabase doesn't expose AVG directly in the JS client without RPC)
    supabase
      .from(TABLE)
      .select("delay_days")
      .limit(500)
      .order("trade_date", { ascending: false }),

    // Count by asset type
    supabase.from(TABLE).select("asset_type"),
  ]);

  // Average delay
  let avgDelayDays: number | null = null;
  if (delayRes.data && delayRes.data.length > 0) {
    const delays = (delayRes.data as { delay_days: number }[]).map(
      (r) => r.delay_days
    );
    avgDelayDays = parseFloat(
      (delays.reduce((a, b) => a + b, 0) / delays.length).toFixed(1)
    );
  }

  // By asset type
  const byAssetType: Partial<Record<AssetType, number>> = {};
  if (typeRes.data) {
    for (const row of typeRes.data as { asset_type: AssetType }[]) {
      byAssetType[row.asset_type] = (byAssetType[row.asset_type] ?? 0) + 1;
    }
  }

  return {
    total: totalRes.count ?? 0,
    thisWeek: weekRes.count ?? 0,
    cryptoTrades: cryptoRes.count ?? 0,
    avgDelayDays,
    byAssetType,
  };
}

// ── Total count (for pagination) ──────────────────────────────────────────────

export async function getDisclosureCount(
  filters: Omit<DisclosureFilters, "page" | "limit"> = {}
): Promise<number> {
  const supabase = getReadClient();
  const { assetType, chamber, search } = filters;

  let query = supabase
    .from(TABLE)
    .select("id", { count: "exact", head: true });

  if (assetType && assetType !== "All") query = query.eq("asset_type", assetType);
  if (chamber && chamber !== "All") query = query.eq("chamber", chamber);
  if (search?.trim()) {
    const term = search.trim().toLowerCase();
    query = query.or(`official.ilike.%${term}%,asset_description.ilike.%${term}%`);
  }

  const { count, error } = await query;
  if (error) console.error("[Capitol] getDisclosureCount error:", error);
  return count ?? 0;
}
