import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import MessageForm from "./message-form";
import ReactionsFeed from "./reactions-feed";

/* ------------------------------------------------------------------ *
 *  Theme system — maps the saved `link_theme` value to CSS overrides
 *  that cascade to every child via custom properties.
 * ------------------------------------------------------------------ */
const THEMES: Record<string, Record<string, string>> = {
  dark: {
    /* Uses the global :root defaults — no overrides needed */
  },
  light: {
    "--background": "#f8f8f8",
    "--foreground": "#1a1a2e",
    "--denim-200": "#6a5a96",
    "--denim-300": "#7a6aa6",
    "--denim-400": "#6a5a96",
    "--denim-500": "#5a4a86",
    "--surface-1": "rgba(0, 0, 0, 0.04)",
    "--surface-2": "rgba(0, 0, 0, 0.07)",
    "--surface-3": "rgba(0, 0, 0, 0.10)",
    "--border-subtle": "rgba(0, 0, 0, 0.10)",
    "--border-default": "rgba(0, 0, 0, 0.18)",
  },
  purple: {
    "--background": "#1a0a2e",
    "--denim-200": "#d8b4fe",
    "--denim-300": "#c084fc",
    "--denim-400": "#a855f7",
    "--denim-500": "#9333ea",
    "--surface-1": "rgba(168, 85, 247, 0.06)",
    "--surface-2": "rgba(168, 85, 247, 0.10)",
    "--surface-3": "rgba(168, 85, 247, 0.15)",
    "--border-subtle": "rgba(168, 85, 247, 0.12)",
    "--border-default": "rgba(168, 85, 247, 0.25)",
  },
  ocean: {
    "--background": "#0a192f",
    "--denim-200": "#bae6fd",
    "--denim-300": "#7dd3fc",
    "--denim-400": "#38bdf8",
    "--denim-500": "#0ea5e9",
    "--surface-1": "rgba(56, 189, 248, 0.06)",
    "--surface-2": "rgba(56, 189, 248, 0.10)",
    "--surface-3": "rgba(56, 189, 248, 0.15)",
    "--border-subtle": "rgba(56, 189, 248, 0.10)",
    "--border-default": "rgba(56, 189, 248, 0.20)",
  },
};

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, link_theme")
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

  const theme = (profile as Record<string, unknown>).link_theme as string ?? "dark";
  const themeVars = THEMES[theme] ?? THEMES.dark;

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
          <p className="profile-text-muted text-sm">
            Send an anonymous message
          </p>
        </div>
        <MessageForm recipientId={profile.id} username={profile.username} />
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
