import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsClient from "./settings-client";

export default async function Settings() {
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

  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Link
            href="/inbox"
            className="text-sm border border-zinc-700 px-4 py-2 rounded-lg hover:bg-zinc-800 transition"
          >
            Inbox
          </Link>
        </div>

        <SettingsClient username={profile.username} />
      </div>
    </div>
  );
}
