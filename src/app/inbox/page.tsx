import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MessageList from "./message-list";
import AppNav from "@/components/app-nav";
import { resolveTheme } from "@/lib/themes";

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
    .select("username, link_theme")
    .eq("id", user.id)
    .single();

  // Try to get premium status (column may not exist if migration hasn't run)
  const { data: premiumData } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const isPremium = premiumData?.is_premium ?? false;

  const { name: theme, vars: themeVars } = resolveTheme(
    (profile as Record<string, unknown> | null)?.link_theme as string
  );

  const MESSAGE_CAP = 15;
  const PREMIUM_PAGE_SIZE = 100;

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
  let messages: Array<{ id: string; content: string; created_at: string }> | null = null;

  let query = supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  // Cap initial load: 50 for free, 100 for premium (prevents mega-fetches)
  query = query.limit(isPremium ? PREMIUM_PAGE_SIZE : MESSAGE_CAP);

  const { data } = await query;
  messages = data;

  const messageCount = messages?.length || 0;

  return (
    <div
      className="min-h-screen px-4 py-8"
      data-theme={theme}
      style={{
        ...themeVars,
        background: themeVars["--background"] || "var(--background)",
        color: themeVars["--foreground"] || "var(--foreground)",
      } as React.CSSProperties}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inbox</h1>
            {messageCount > 0 ? (
              <p className="text-slate-500 text-sm mt-0.5">
                {isPremium
                  ? `${messageCount} anonymous message${messageCount !== 1 ? "s" : ""}`
                  : `${messageCount} of ${totalCount} message${totalCount !== 1 ? "s" : ""}`}
                {messageCount >= 5 && " \uD83D\uDC40"}
              </p>
            ) : (
              <p className="text-slate-500 text-sm mt-0.5">Waiting for messages&hellip;</p>
            )}
          </div>
          {profile && <AppNav username={profile.username} />}
        </div>

        {/* Content */}
        {!messages || messages.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up-delay-1">
            <div className="w-16 h-16 rounded-full bg-white/60 backdrop-blur-md border border-white/30 flex items-center justify-center mx-auto mb-5 shadow-sm">
              <svg
                className="w-7 h-7 text-slate-400"
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
            <p className="text-slate-800 font-medium mb-2">No messages yet</p>
            <p className="text-slate-500 text-sm mb-6 max-w-xs mx-auto">
              Share your link to start receiving anonymous messages.
            </p>
            {profile && (
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white/30 rounded-lg px-4 py-2.5 mb-6 shadow-sm">
                <code className="text-sm font-mono text-purple-600">
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
