import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { moderateMessage } from "@/lib/moderation";

const GENERIC_ERROR = {
  error: "Reply could not be sent. Please try again.",
};

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ messageId: string }> }
) {
  const { messageId } = await params;

  // 1. Authenticate — only the inbox owner can reply
  const cookieStore = await cookies();
  const supabase = createServerClient(
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
      { error: "Reply cannot be empty." },
      { status: 400 }
    );
  }
  if (content.length > 1000) {
    return NextResponse.json(
      { error: "Reply is too long (max 1000 characters)." },
      { status: 400 }
    );
  }

  // 3. Verify the message belongs to this user
  const { data: message, error: msgErr } = await supabase
    .from("messages")
    .select("id, recipient_id")
    .eq("id", messageId)
    .single();

  if (msgErr || !message) {
    return NextResponse.json({ error: "Message not found." }, { status: 404 });
  }

  if (message.recipient_id !== user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // 4. Moderate reply — HARD GUARD, same as messages
  const moderation = await moderateMessage(content);
  if (!moderation.allowed) {
    return NextResponse.json(
      { error: "Reply blocked for safety." },
      { status: 403 }
    );
  }

  // 5. Insert reply — NO IP logging for privacy
  const { data: reply, error: insertErr } = await supabase
    .from("replies")
    .insert({
      message_id: messageId,
      author_id: user.id,
      content,
    })
    .select("id, content, created_at")
    .single();

  if (insertErr) {
    console.error("[reply] Insert error:", insertErr.message);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }

  return NextResponse.json({ success: true, reply }, { status: 201 });
}
