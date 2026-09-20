"use server";

import { createClient } from "@/lib/supabase-server";

export type PolicyFeedRow = {
  external_id: string;
  agency: string;
  headline: string;
  event_type: string;
  event_date: string;
  source_url: string | null;
};

export type LoadMoreResult = {
  rows: PolicyFeedRow[];
  hasMore: boolean;
  error: boolean;
};

const PAGE_SIZE = 20;

export async function loadMorePolicyEvents(
  offset: number
): Promise<LoadMoreResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("policy_events")
    .select("external_id, agency, headline, event_type, event_date, source_url")
    .order("event_date", { ascending: false })
    .order("external_id", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) {
    console.error("[policy] loadMorePolicyEvents failed:", error.message);
    return { rows: [], hasMore: false, error: true };
  }

  const rows = (data ?? []) as PolicyFeedRow[];
  return { rows, hasMore: rows.length === PAGE_SIZE, error: false };
}
