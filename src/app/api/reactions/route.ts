import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import crypto from "crypto";
import { moderateWithHive } from "@/lib/moderation";
import { requireCsrfHeader } from "@/lib/csrf";
import { checkRateLimit } from "@/lib/rate-limit";
import { checkContentFilter, logBlockedMessage } from "@/lib/content-filter";
import { checkKeywordFallback } from "@/lib/crisis-interceptor";

const GENERIC_ERROR = {
  error: "Reaction could not be posted. Please try again.",
};

function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + "_whatupb_rate_limit")
    .digest("hex")
    .substring(0, 16);
}

async function getSupabaseClient() {
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

// ── POST — create a public reaction ──────────────────────────────────────────

export async function POST(request: NextRequest) {
  // 0a. CSRF protection
  const csrfError = requireCsrfHeader(request);
  if (csrfError) return csrfError;

  // 0b. Rate limit — 10 reactions per minute per IP
  const clientIP =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const ipHash = clientIP !== "unknown" ? hashIP(clientIP) : null;
  const rateCheck = checkRateLimit(ipHash, {
    maxRequests: 10,
    prefix: "reaction",
  });
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: "Too many reactions. Please wait a moment." },
      { status: 429 }
    );
  }

  // 1. Authenticate
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: { content?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(GENERIC_ERROR, { status: 400 });
  }

  const content = body.content?.trim();
  if (!content || content.length === 0) {
    return NextResponse.json(
      { error: "Reaction cannot be empty." },
      { status: 400 }
    );
  }
  if (content.length > 280) {
    return NextResponse.json(
      { error: "Reaction is too long (max 280 characters)." },
      { status: 400 }
    );
  }

  // 3. Content filter
  const filterResult = checkContentFilter(content);
  if (filterResult.blocked) {
    console.warn(
      `[reaction-reject] content_filter — reason=${filterResult.reason}`
    );
    logBlockedMessage(filterResult.reason!, ipHash).catch(() => {});
    return NextResponse.json(
      { error: "Reaction contains restricted content." },
      { status: 403 }
    );
  }

  // 4. Hive Text Moderation (with keyword fallback)
  const hive = await moderateWithHive(content);
  if (hive.available && hive.blocked) {
    return NextResponse.json(
      { error: "Reaction blocked for safety." },
      { status: 403 }
    );
  }
  if (!hive.available) {
    // Hive down — use keyword fallback
    const fallback = checkKeywordFallback(content);
    if (fallback.intercepted) {
      return NextResponse.json(
        { error: "Reaction blocked for safety." },
        { status: 403 }
      );
    }
  }

  // 5. Insert reaction
  const { data: reaction, error: insertErr } = await supabase
    .from("reactions")
    .insert({
      author_id: user.id,
      content,
    })
    .select("id, content, created_at")
    .single();

  if (insertErr) {
    console.error("[reaction] Insert error:", insertErr.message);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  return NextResponse.json({ success: true, reaction }, { status: 201 });
}

// ── DELETE — remove a reaction ───────────────────────────────────────────────

export async function DELETE(request: NextRequest) {
  // 0. CSRF protection
  const csrfError = requireCsrfHeader(request);
  if (csrfError) return csrfError;

  // 1. Authenticate
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Parse body
  let body: { reactionId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }

  const { reactionId } = body;
  if (!reactionId) {
    return NextResponse.json(
      { error: "Missing reaction ID." },
      { status: 400 }
    );
  }

  // 3. Delete — RLS ensures only the author can delete
  const { error: deleteErr } = await supabase
    .from("reactions")
    .delete()
    .eq("id", reactionId)
    .eq("author_id", user.id);

  if (deleteErr) {
    console.error("[reaction] Delete error:", deleteErr.message);
    return NextResponse.json(
      { error: "Could not delete reaction." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
