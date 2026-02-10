import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import SettingsClient from "./settings-client";

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username, is_premium, premium_expires_at, link_theme")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Fetch keyword filters for premium users
  let filters: { id: string; keyword: string }[] = [];
  if (profile.is_premium) {
    const { data } = await supabase
      .from("keyword_filters")
      .select("id, keyword")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });
    filters = data ?? [];
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <Link href="/inbox" className="btn-ghost text-sm">
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
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            Inbox
          </Link>
        </div>

        <SettingsClient
          username={profile.username}
          isPremium={profile.is_premium ?? false}
          premiumExpiresAt={profile.premium_expires_at}
          linkTheme={profile.link_theme ?? "dark"}
          initialFilters={filters}
        />
      </div>
    </div>
  );
}
