import { NextRequest, NextResponse } from "next/server";
import { verifyUnsubscribeToken } from "@/lib/email";
import { getSupabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get("uid");
  const token = request.nextUrl.searchParams.get("token");

  if (!uid || !token) {
    return new NextResponse(page("Invalid link", "This unsubscribe link is invalid or expired."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  if (!verifyUnsubscribeToken(uid, token)) {
    return new NextResponse(page("Invalid link", "This unsubscribe link is invalid or expired."), {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });
  }

  try {
    const supabase = getSupabase();
    await supabase
      .from("profiles")
      .update({ email_notifications: false })
      .eq("id", uid);

    return new NextResponse(
      page(
        "Unsubscribed",
        "You've been unsubscribed from email notifications. You can re-enable them anytime in your WhatUPB settings."
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  } catch {
    return new NextResponse(
      page("Something went wrong", "Please try again or disable notifications in your settings."),
      { status: 500, headers: { "Content-Type": "text/html" } }
    );
  }
}

function page(title: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} - WhatUPB</title>
  <style>
    body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#0c0c10;color:#ededed;font-family:system-ui,-apple-system,sans-serif}
    .card{max-width:400px;text-align:center;padding:40px 32px;background:#141418;border:1px solid #2a2a35;border-radius:14px}
    h1{font-size:20px;margin:0 0 12px;font-weight:600}
    p{color:#71717a;font-size:14px;line-height:1.6;margin:0 0 24px}
    a{color:#a5b4fc;text-decoration:none;font-size:14px}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="card">
    <h1>${title}</h1>
    <p>${message}</p>
    <a href="https://whatupb.com/settings">Go to Settings</a>
  </div>
</body>
</html>`;
}
