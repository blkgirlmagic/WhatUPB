import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

// Valid signup sources — anything outside this list is coerced to "website"
const VALID_SOURCES = new Set([
  "join_free",
  "homepage_popup",
  "footer",
  "website",
]);

// Server-side email regex (mirrors the one in the Postgres function)
const EMAIL_RE = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body." },
        { status: 400 }
      );
    }

    const rawEmail = body.email;
    const rawSource = body.source;

    // Validate + normalize email
    if (!rawEmail || typeof rawEmail !== "string") {
      return NextResponse.json(
        { error: "Email address is required." },
        { status: 400 }
      );
    }

    const email = rawEmail.toLowerCase().trim();
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Sanitize source
    const source =
      typeof rawSource === "string" && VALID_SOURCES.has(rawSource)
        ? rawSource
        : "website";

    // Call Supabase via the server client (anon key — SECURITY DEFINER
    // function bypasses RLS; service-role key is never needed here).
    const supabase = await createClient();

    const { data, error } = await supabase.rpc("subscribe_newsletter", {
      p_email: email,
      p_source: source,
    });

    if (error) {
      console.error("[newsletter/subscribe] Supabase RPC error:", error.message);
      return NextResponse.json(
        { error: "Subscription failed. Please try again." },
        { status: 500 }
      );
    }

    // The function always returns a JSON object — Supabase RPC unwraps it
    const result = data as {
      success: boolean;
      status?: "subscribed" | "already_subscribed";
      error?: string;
    };

    if (!result.success) {
      const msg =
        result.error === "invalid_email"
          ? "Please enter a valid email address."
          : "Subscription failed. Please try again.";
      return NextResponse.json({ error: msg }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      alreadySubscribed: result.status === "already_subscribed",
    });
  } catch (err) {
    console.error("[newsletter/subscribe] Unexpected error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}

// Reject non-POST methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
