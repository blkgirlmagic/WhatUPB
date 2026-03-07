import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import SettingsClient from "./settings-client";

export default async function Settings() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // First get username (always exists)
  const { data: baseProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!baseProfile) {
    redirect("/login");
  }

  // Try to fetch premium columns (may not exist if migration hasn't run)
  const { data: premiumProfile } = await supabase
    .from("profiles")
    .select("is_premium, premium_expires_at, link_theme, stripe_subscription_id")
    .eq("id", user.id)
    .single();

  const profile = {
    username: baseProfile.username,
    is_premium: premiumProfile?.is_premium ?? false,
    premium_expires_at: premiumProfile?.premium_expires_at ?? null,
    link_theme: premiumProfile?.link_theme ?? "dark",
    stripe_subscription_id: premiumProfile?.stripe_subscription_id ?? null,
  };

  // Determine the current plan from the Stripe subscription
  let currentPlan: "weekly" | "monthly" | "yearly" | null = null;
  if (profile.is_premium && profile.stripe_subscription_id) {
    try {
      const stripe = getStripe();
      const sub = await stripe.subscriptions.retrieve(
        profile.stripe_subscription_id
      );
      const priceId = sub.items?.data?.[0]?.price?.id;
      if (priceId) {
        if (priceId === process.env.STRIPE_PRICE_ID_WEEKLY) currentPlan = "weekly";
        else if (priceId === process.env.STRIPE_PRICE_ID_MONTHLY) currentPlan = "monthly";
        else if (priceId === process.env.STRIPE_PRICE_ID_YEARLY) currentPlan = "yearly";
      }
    } catch (err) {
      console.error("[settings] Failed to fetch subscription:", err);
    }
  }

  // Fetch email notification preference (column may not exist yet)
  const { data: notifProfile } = await supabase
    .from("profiles")
    .select("email_notifications")
    .eq("id", user.id)
    .single();

  // Fetch keyword filters for premium users (table may not exist yet)
  let filters: { id: string; keyword: string }[] = [];
  if (profile.is_premium) {
    try {
      const { data } = await supabase
        .from("keyword_filters")
        .select("id, keyword")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      filters = data ?? [];
    } catch {
      // keyword_filters table doesn't exist yet
    }
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
          currentPlan={currentPlan}
          emailNotifications={notifProfile?.email_notifications ?? true}
        />
      </div>
    </div>
  );
}
