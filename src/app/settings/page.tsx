import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getStripe } from "@/lib/stripe";
import { CloudLogo } from "@/components/cloud-logo";
import { DiagonalLines } from "@/components/diagonal-lines";
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
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          <div className="logo-mark"><CloudLogo /></div>
          WhatUPB
        </Link>
        <div className="nav-links">
          <Link href="/inbox">Inbox</Link>
          <Link href={`/${profile.username}`}>My Profile</Link>
          <Link href="/settings" className="nav-cta">Settings</Link>
        </div>
      </nav>

      {/* PAGE */}
      <div className="settings-page-wrap">
        <div className="anim-1" style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontSize: "28px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: "28px" }}>
          Settings
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

      {/* BOTTOM BAR (mobile) */}
      <div className="settings-bottom-bar">
        <Link href="/inbox" className="settings-bar-btn">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
          </svg>
          Inbox
        </Link>
        <Link href={`/${profile.username}`} className="settings-bar-btn">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
          My Link
        </Link>
        <Link href="/settings" className="settings-bar-btn settings-bar-active">
          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </Link>
      </div>
    </div>
  );
}
