import { createClient } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MessageList from "./message-list";
import { CloudLogo } from "@/components/cloud-logo";
import { DiagonalLines } from "@/components/diagonal-lines";

export default async function Inbox() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Get username
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  // Try to get premium status
  const { data: premiumData } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const isPremium = premiumData?.is_premium ?? false;

  const MESSAGE_CAP = 15;
  const PREMIUM_PAGE_SIZE = 100;

  // Get total count for free users
  let totalCount = 0;
  if (!isPremium) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("recipient_id", user.id);
    totalCount = count ?? 0;
  }

  // Free users: cap at 15 most recent. Premium: 100.
  let query = supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false });

  query = query.limit(isPremium ? PREMIUM_PAGE_SIZE : MESSAGE_CAP);

  const { data } = await query;
  const messages = data;
  const messageCount = messages?.length || 0;

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
          <Link href="/inbox" style={{ color: "var(--ink)", fontWeight: 500 }}>Inbox</Link>
          <Link href={`/${profile.username}`}>My Profile</Link>
          <Link href="/settings" className="nav-cta">Settings</Link>
        </div>
      </nav>

      {/* PAGE */}
      <div className="inbox-page-wrap">
        {/* Header */}
        <div className="anim-1" style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Inbox
          </div>
          {messageCount > 0 ? (
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>
              {isPremium
                ? `${messageCount} anonymous message${messageCount !== 1 ? "s" : ""}`
                : `${messageCount} of ${totalCount} message${totalCount !== 1 ? "s" : ""}`}
            </p>
          ) : (
            <p style={{ fontSize: "14px", color: "var(--muted)" }}>Waiting for messages&hellip;</p>
          )}
        </div>

        {/* Content */}
        {!messages || messages.length === 0 ? (
          <div className="anim-2" style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(12px)", border: "1px solid rgba(255,255,255,0.8)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 4px 12px rgba(100,90,160,0.08)" }}>
              <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="rgba(26,23,48,0.3)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "16px", marginBottom: "6px" }}>No messages yet</p>
            <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "24px", maxWidth: "280px", margin: "0 auto 24px", lineHeight: 1.6 }}>
              Share your link to start receiving anonymous messages.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.6)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.8)", borderRadius: "12px", padding: "10px 16px", marginBottom: "24px" }}>
              <code style={{ fontSize: "14px", fontFamily: "monospace", color: "#9B8EE8" }}>
                whatupb.com/{profile.username}
              </code>
            </div>
            <div style={{ display: "block" }}>
              <Link href="/settings" className="card-btn-primary" style={{ maxWidth: "240px", margin: "0 auto" }}>
                Share Your Link
              </Link>
            </div>
          </div>
        ) : (
          <div className="anim-2">
            <MessageList
              initialMessages={messages}
              isPremium={isPremium}
              totalCount={isPremium ? (messages?.length ?? 0) : totalCount}
            />
          </div>
        )}
      </div>

      {/* BOTTOM BAR (mobile) */}
      <div className="settings-bottom-bar">
        <Link href="/inbox" className="settings-bar-btn settings-bar-active">
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
        <Link href="/settings" className="settings-bar-btn">
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
