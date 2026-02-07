import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MessageList from "./message-list";

export default async function Inbox() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Inbox</h1>
            <p className="text-zinc-400 text-sm">
              {messages?.length || 0} message{messages?.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/settings"
              className="text-sm border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
            >
              Settings
            </Link>
          </div>
        </div>

        {!messages || messages.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-zinc-400 mb-2">No messages yet</p>
            <p className="text-zinc-500 text-sm">
              Share your link to start receiving anonymous messages:
            </p>
            {profile && (
              <p className="text-white font-mono mt-2">
                whatupb.com/{profile.username}
              </p>
            )}
          </div>
        ) : (
          <MessageList initialMessages={messages} />
        )}
      </div>
    </div>
  );
}
