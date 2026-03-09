import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { getStripe } from "@/lib/stripe";
import SettingsClient from "./settings-client";
import AppNav from "@/components/app-nav";
import { resolveTheme } from "@/lib/themes";

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

  const { name: theme, vars: themeVars } = resolveTheme(profile.link_theme);

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
    <div
      className="min-h-screen px-4 py-8"
      data-theme={theme}
      style={{
        ...themeVars,
        background: themeVars["--background"] || "var(--background)",
        color: themeVars["--foreground"] || "var(--foreground)",
      } as React.CSSProperties}
    >
      <div className="max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <AppNav username={profile.username} />
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
