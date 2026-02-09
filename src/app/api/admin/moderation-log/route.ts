// ---------------------------------------------------------------------------
//  GET /api/admin/moderation-log
//
//  Returns recent moderation blocks — metadata only, never raw content.
//  Requires an authenticated Supabase session (cookie-based auth).
//
//  Query params:
//    ?limit=50         Number of entries (default 50, max 200)
//    ?offset=0         Pagination offset
//    ?blocked_by=local Filter by blocker (local | perspective | rate_limit)
// ---------------------------------------------------------------------------

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthenticatedClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component context — safe to ignore
          }
        },
      },
    }
  );
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await getAuthenticatedClient();

    // --- Auth check ---
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // --- Parse query params ---
    const url = new URL(request.url);
    const limit = Math.min(Number(url.searchParams.get("limit")) || 50, 200);
    const offset = Math.max(Number(url.searchParams.get("offset")) || 0, 0);
    const blockedBy = url.searchParams.get("blocked_by");

    // --- Build query ---
    let query = supabase
      .from("moderation_log")
      .select("id, blocked_by, reason, scores, ip_hash, recipient_id, created_at", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (blockedBy && ["local", "perspective", "rate_limit"].includes(blockedBy)) {
      query = query.eq("blocked_by", blockedBy);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error("[admin/moderation-log] Query error:", error.message);
      return NextResponse.json(
        { error: "Failed to fetch moderation logs." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      logs: data,
      total: count,
      limit,
      offset,
    });
  } catch (err) {
    console.error(
      "[admin/moderation-log] Unexpected error:",
      err instanceof Error ? err.message : String(err)
    );
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
