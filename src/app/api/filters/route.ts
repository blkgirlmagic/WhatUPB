import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

async function getAuthenticatedSupabase() {
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
            // Server Component context
          }
        },
      },
    }
  );
}

// GET: Fetch current keyword filters
export async function GET() {
  const supabase = await getAuthenticatedSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Premium gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json(
      { error: "Premium required for keyword filters." },
      { status: 403 }
    );
  }

  const { data: filters } = await supabase
    .from("keyword_filters")
    .select("id, keyword")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ filters: filters ?? [] });
}

// POST: Add keyword filters (comma-separated string or array)
export async function POST(request: NextRequest) {
  const supabase = await getAuthenticatedSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Premium gate
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  if (!profile?.is_premium) {
    return NextResponse.json(
      { error: "Premium required for keyword filters." },
      { status: 403 }
    );
  }

  let body: { keywords?: string[] | string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Accept comma-separated string or array
  let keywords: string[];
  if (typeof body.keywords === "string") {
    keywords = body.keywords
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0 && k.length <= 100);
  } else if (Array.isArray(body.keywords)) {
    keywords = body.keywords
      .map((k) => String(k).trim().toLowerCase())
      .filter((k) => k.length > 0 && k.length <= 100);
  } else {
    return NextResponse.json(
      { error: "keywords must be a string or array" },
      { status: 400 }
    );
  }

  if (keywords.length === 0) {
    return NextResponse.json(
      { error: "No valid keywords provided." },
      { status: 400 }
    );
  }

  // Cap at 50 keywords total
  const { count } = await supabase
    .from("keyword_filters")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const remaining = 50 - (count ?? 0);
  if (remaining <= 0) {
    return NextResponse.json(
      { error: "Maximum 50 keyword filters reached." },
      { status: 400 }
    );
  }

  const toInsert = keywords.slice(0, remaining).map((keyword) => ({
    user_id: user.id,
    keyword,
  }));

  const { data: inserted, error } = await supabase
    .from("keyword_filters")
    .upsert(toInsert, { onConflict: "user_id,keyword" })
    .select("id, keyword");

  if (error) {
    console.error("[filters] Insert error:", error.message);
    return NextResponse.json(
      { error: "Failed to save filters." },
      { status: 500 }
    );
  }

  return NextResponse.json({ filters: inserted }, { status: 201 });
}

// DELETE: Remove a keyword filter by id
export async function DELETE(request: NextRequest) {
  const supabase = await getAuthenticatedSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const filterId = searchParams.get("id");

  if (!filterId) {
    return NextResponse.json(
      { error: "Filter id required." },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("keyword_filters")
    .delete()
    .eq("id", filterId)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete filter." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
