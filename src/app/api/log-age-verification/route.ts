import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const body = await request.json().catch(() => ({}));
    const userAgent = typeof body.user_agent === "string" ? body.user_agent : null;

    const supabase = getSupabase();
    await supabase.from("age_verifications").insert({
      ip_address: ip,
      verified_at: new Date().toISOString(),
      user_agent: userAgent,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
