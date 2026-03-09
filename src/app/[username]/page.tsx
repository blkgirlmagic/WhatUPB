import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import MessageForm from "./message-form";
import ReactionsFeed from "./reactions-feed";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username")
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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 pt-20 pb-24 relative">
      {/* Subtle glow */}
      <div
        className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-[0.05]"
        style={{
          background:
            "radial-gradient(circle, var(--denim-400) 0%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md text-center relative">
        <div className="mb-6 animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight mb-1">
            <span className="text-denim-200">@</span>
            {profile.username}
          </h1>
          <p className="text-zinc-500 text-sm">
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
          className="text-xs text-zinc-600 hover:text-denim-300 transition"
        >
          whatupb.com
        </a>
      </footer>
    </div>
  );
}
