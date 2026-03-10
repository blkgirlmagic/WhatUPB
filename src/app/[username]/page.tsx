import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import { resolveTheme } from "@/lib/themes";
import MessageForm from "./message-form";
import ReactionsFeed from "./reactions-feed";
import OwnerToolbar from "./owner-toolbar";

// Never cache this page — auth-dependent owner controls must be fresh
export const dynamic = "force-dynamic";

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

  // Ownership gate — delegates the check to the database.
  // Ask: "does a profile exist where id = MY auth uid AND username = THIS slug?"
  // This can only return a row when the visitor literally owns this profile.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let isOwner = false;
  if (user) {
    const { data: ownerCheck } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .eq("username", username.toLowerCase())
      .maybeSingle();
    isOwner = !!ownerCheck;
  }

  const prof = profile as Record<string, unknown>;
  const { name: theme, vars: themeVars } = resolveTheme(prof.link_theme as string);
  const promptOfDay = (prof.prompt_of_day as string) ?? null;
  const moodStatus = (prof.mood_status as string) ?? null;

  return (
    <div
      className="min-h-screen flex flex-col items-center px-4 pt-12 pb-24 relative"
      data-theme={theme}
      style={{
        ...themeVars,
        background: themeVars["--background"] || "var(--background)",
        color: themeVars["--foreground"] || "var(--foreground)",
      } as React.CSSProperties}
    >
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background:
            `radial-gradient(circle, ${themeVars["--denim-400"] || "var(--denim-400)"} 0%, transparent 70%)`,
        }}
      />

      {/* Public content — identical for all visitors */}
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

      {/* Owner toolbar — discreet floating bar, only for owner on their own page */}
      {isOwner && (
        <OwnerToolbar
          username={profile.username}
          initialPrompt={promptOfDay ?? ""}
          initialMood={moodStatus ?? ""}
        />
      )}
    </div>
  );
}
