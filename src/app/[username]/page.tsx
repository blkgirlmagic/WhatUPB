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
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-1">@{profile.username}</h1>
        <p className="text-zinc-400 mb-6">Send an anonymous message</p>
        <MessageForm recipientId={profile.id} username={profile.username} />
      </div>
    </div>
  );
}
