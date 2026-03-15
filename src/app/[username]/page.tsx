import { createClient } from "@/lib/supabase-server";
import { notFound } from "next/navigation";
import Link from "next/link";

import { DiagonalLines } from "@/components/diagonal-lines";
import { resolveTheme } from "@/lib/themes";
import MessageForm from "./message-form";
import ReactionsFeed from "./reactions-feed";
import OwnerToolbar from "./owner-toolbar";

export default async function PublicProfile({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, username, link_theme, prompt_of_day, mood_status")
    .eq("username", username.toLowerCase())
    .single();

  if (!profile) {
    notFound();
  }

  const { data: reactions } = await supabase
    .from("reactions")
    .select("id, content, created_at")
    .eq("author_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const isOwner = user?.id === profile.id;

  // Count messages sent to this profile in the last 24 hours
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count: todayCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", profile.id)
    .gte("created_at", twentyFourHoursAgo);
  const messagesToday = todayCount ?? 0;

  const prof = profile as Record<string, unknown>;
  const promptOfDay = (prof.prompt_of_day as string) ?? null;
  const moodStatus = (prof.mood_status as string) ?? null;
  const { name: themeName, vars: themeVars } = resolveTheme(profile.link_theme);

  return (
    <div className="landing-page" data-theme={themeName} style={themeVars as React.CSSProperties}>
      {/* Bloom */}
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          WhatUPB
        </Link>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#safety">Safety</a>
          <Link href="/studios">Studios</Link>
          {isOwner ? (
            <Link href="/inbox" className="nav-cta">Go to Inbox</Link>
          ) : (
            <Link href="/signup" className="nav-cta">Get Started</Link>
          )}
        </div>
      </nav>

      {/* PAGE */}
      <div className="profile-page-wrap">

        {/* Profile Header */}
        <div className="anim-1" style={{ textAlign: "center", marginBottom: "32px", width: "min(520px, 100%)" }}>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            <span style={{ color: "#c9a84c" }}>@</span>{profile.username}
          </div>
          {moodStatus && (
            <div style={{ fontSize: "15px", fontStyle: "italic", fontWeight: 300, color: "var(--muted)", lineHeight: 1.5 }}>
              {moodStatus}
            </div>
          )}
          {!moodStatus && (
            <div style={{ fontSize: "15px", color: "var(--muted)", lineHeight: 1.5 }}>
              Send an anonymous message
            </div>
          )}
        </div>

        {/* Main Message Card */}
        <MessageForm
          recipientId={profile.id}
          username={profile.username}
          prompt={promptOfDay ?? undefined}
        />

        {/* Social proof counter + viral CTA */}
        <div className="anim-3" style={{ textAlign: "center", marginTop: "16px", marginBottom: "20px", width: "min(520px, 100%)" }}>
          <p style={{
            fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
            fontSize: "12px",
            color: "#c9a84c",
            fontWeight: 500,
            letterSpacing: "0.3px",
            marginBottom: "14px",
          }}>
            {messagesToday === 0
              ? "Be the first to send something today \u{1F5A4}"
              : messagesToday <= 5
                ? `\u{1F5A4} ${messagesToday} ${messagesToday === 1 ? "person" : "people"} sent something today`
                : `\u{1F5A4} ${messagesToday} people have already said something \u{2014} don\u{2019}t be the last.`}
          </p>
          {!isOwner && (
            <Link
              href="/signup"
              style={{
                display: "block",
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                textDecoration: "none",
                fontSize: "15px",
                fontWeight: 700,
                color: "#fff",
                textAlign: "center",
                background: "#6b5ce7",
                boxShadow: "0 4px 16px rgba(107,92,231,0.35)",
                fontFamily: "var(--font-lora), 'Lora', Georgia, serif",
                transition: "all 0.2s",
              }}
            >
              Get your own link &rarr;
            </Link>
          )}
        </div>

        <ReactionsFeed reactions={reactions ?? []} isOwner={isOwner} />
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <span className="footer-wordmark">WhatUPB</span>
            </div>
            <p className="footer-tagline">
              Built for honest conversations.<br />Messages are moderated for safety.
            </p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-label">Links</div>
            <div className="footer-links-row">
              <Link href="/">Home</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <a href="/#safety">Safety</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 WhatUPB. All rights reserved.</span>
          <span>whatupb.com</span>
        </div>
      </footer>

      {isOwner && (
        <OwnerToolbar
          username={profile.username}
          initialPrompt={promptOfDay ?? ""}
          initialMood={moodStatus ?? ""}
        />
      )}
    </div>
  );
}
