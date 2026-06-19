import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// ---------------------------------------------------------------------------
//  GET /api/narratives/leaderboard
//
//  Public, read-only. Returns every row of the `narrative_leaders` view
//  (name, score, momentum), sorted by momentum descending — "which
//  narratives are gaining momentum right now." No auth required; this is
//  the same public data the /leaderboard page renders.
// ---------------------------------------------------------------------------

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("narrative_leaders")
    .select("name, score, momentum")
    .order("momentum", { ascending: false });

  if (error) {
    console.error("[api] narrative_leaders query failed:", error.message);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, narratives: data ?? [] });
}
