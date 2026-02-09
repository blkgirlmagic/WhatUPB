import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import MessageForm from "./message-form";

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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
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
      </div>

      {/* Branding link */}
      <footer className="absolute bottom-6 text-center">
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
