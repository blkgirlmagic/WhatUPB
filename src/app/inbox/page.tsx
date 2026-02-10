import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MessageList from "./message-list";

export default async function Inbox() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get username (always exists)
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  // Try to get premium status (column may not exist if migration hasn't run)
  const { data: premiumData } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const isPremium = premiumData?.is_premium ?? false;
  const MESSAGE_CAP = 50;

  // Get total count for free users
  let totalCount = 0;
  if (!isPremium) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id);
    totalCount = count ?? 0;
  }

  // Free users: cap at 50 most recent. Premium: unlimited.
  // Try with replies join first, fall back to without if replies table doesn't exist
  let messages: Array<{ id: string; content: string; created_at: string; replies?: Array<{ id: string; content: string; created_at: string }> }> | null = null;

  let query = supabase
    .from("messages")
    .select("*, replies(id, content, created_at)")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  if (!isPremium) {
    query = query.limit(MESSAGE_CAP);
  }

  const { data, error: msgError } = await query;

  if (msgError) {
    // replies table may not exist — retry without join
    let fallbackQuery = supabase
      .from("messages")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false });

    if (!isPremium) {
      fallbackQuery = fallbackQuery.limit(MESSAGE_CAP);
    }

    const { data: fallbackData } = await fallbackQuery;
    messages = fallbackData?.map((m) => ({ ...m, replies: [] })) ?? null;
  } else {
    messages = data;
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
            <p className="text-zinc-500 text-sm">
              {isPremium
                ? `${messages?.length || 0} message${messages?.length !== 1 ? "s" : ""}`
                : `${messages?.length || 0} of ${totalCount} message${totalCount !== 1 ? "s" : ""}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/settings" className="btn-ghost text-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Link>
          </div>
        </div>

        {/* Content */}
        {!messages || messages.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up-delay-1">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border-subtle flex items-center justify-center mx-auto mb-5">
              <svg
                className="w-7 h-7 text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <p className="text-white font-medium mb-2">No messages yet</p>
            <p className="text-zinc-500 text-sm mb-6 max-w-xs mx-auto">
              Share your link to start receiving anonymous messages.
            </p>
            {profile && (
              <div className="inline-flex items-center gap-2 bg-surface-1 border border-border-subtle rounded-lg px-4 py-2.5 mb-6">
                <code className="text-sm font-mono text-denim-200">
                  whatupb.com/{profile.username}
                </code>
              </div>
            )}
            <div className="block">
              <Link href="/settings" className="btn-primary py-2.5 px-6 text-sm">
                Share Your Link
              </Link>
            </div>
          </div>
        ) : (
          <div className="animate-fade-in-up-delay-1">
            <MessageList
              initialMessages={messages}
              isPremium={isPremium}
              totalCount={isPremium ? (messages?.length ?? 0) : totalCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
