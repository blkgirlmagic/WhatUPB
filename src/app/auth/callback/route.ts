import { createClient } from "@/lib/supabase-server";
import { NextResponse } from "next/server";

const SITE_URL = "https://whatupb.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Auth callback error:", error.message);
      return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
    }

    return NextResponse.redirect(`${SITE_URL}/inbox`);
  }

  // No code present — redirect to login with error
  return NextResponse.redirect(`${SITE_URL}/login?error=auth`);
}
