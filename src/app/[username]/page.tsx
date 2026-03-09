import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { resolveTheme } from "@/lib/themes";
import MessageForm from "./message-form";
import ReactionsFeed from "./reactions-feed";
import OwnerControls from "./owner-controls";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, link_theme, prompt_of_day, mood_status")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    notFound();
  }

  // Fetch public reactions for this profile
  const { data: reactions } = await supabase
    .from("reactions")
    .select("id, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Check if the current visitor is the profile owner
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  const prof = profile as Record<string, unknown>;
  const { name: theme, vars: themeVars } = resolveTheme(prof.link_theme as string);
  const promptOfDay = (prof.prompt_of_day as string) ?? null;
  const moodStatus = (prof.mood_status as string) ?? null;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-20 pb-24 relative"
      data-theme={theme}
      style={{
        ...themeVars,
        background: themeVars["--background"] || "var(--background)",
        color: themeVars["--foreground"] || "var(--foreground)",
      } as React.CSSProperties}
    >
      {/* Owner navigation — only visible to the logged-in profile owner */}
      {isOwner && (
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-center gap-4 py-3 px-4 bg-black/40 backdrop-blur-md border-b border-white/5">
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Inbox
          </Link>
          <span className="text-zinc-700">|</span>
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </nav>
      )}

      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background:
            `radial-gradient(circle, ${themeVars["--denim-400"] || "var(--denim-400)"} 0%, transparent 70%)`,
        }}
      />

      <div className="w-full max-w-md text-center relative">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            <span className="text-denim-200">@</span>
            {profile.username}
          </h1>
          {moodStatus && (
            <p className="text-sm profile-text-muted mt-1 italic">
              {moodStatus}
            </p>
          )}
          {!moodStatus && (
            <p className="profile-text-muted text-sm">
              Send an anonymous message
            </p>
          )}
        </div>
        <MessageForm
          recipientId={profile.id}
          username={profile.username}
          prompt={promptOfDay ?? undefined}
        />
        {isOwner && (
          <OwnerControls
            username={profile.username}
            initialPrompt={promptOfDay ?? ""}
            initialMood={moodStatus ?? ""}
          />
        )}
        <ReactionsFeed reactions={reactions ?? []} isOwner={isOwner} />
      </div>

      {/* Branding link */}
      <footer className="mt-12 mb-6 text-center">
        <a
          href="/"
          className="text-xs profile-text-faint hover:text-denim-300 transition"
        >
          whatupb.com
        </a>
      </footer>
    </div>
  );
}
