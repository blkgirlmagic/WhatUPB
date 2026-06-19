import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { DiagonalLines } from "@/components/diagonal-lines";

export const metadata: Metadata = {
  title: "WhatUPB — Narrative Leaderboard",
  description: "Which crypto narratives are gaining momentum right now, ranked live.",
};

type LeaderRow = {
  name: string;
  score: number;
  momentum: number;
};

function scoreColor(score: number): string {
  if (score >= 60) return "#22c55e";
  if (score <= 40) return "#ef4444";
  return "#f59e0b";
}

function momentumColor(momentum: number): string {
  if (momentum > 0) return "#22c55e";
  if (momentum < 0) return "#ef4444";
  return "#71717a";
}

function momentumArrow(momentum: number): string {
  if (momentum > 0) return "▲";
  if (momentum < 0) return "▼";
  return "•";
}

function momentumLabel(momentum: number): string {
  if (momentum === 0) return "0";
  const sign = momentum > 0 ? "+" : "";
  return `${sign}${momentum.toFixed(1)}`;
}

// Gold / silver / bronze badge backgrounds for the top 3 ranks.
const RANK_BADGE_BG: Record<number, string> = {
  1: "linear-gradient(135deg, #f3d27a, #c9a84c)",
  2: "linear-gradient(135deg, #d9d9e3, #a7a7b6)",
  3: "linear-gradient(135deg, #e3b685, #b67a44)",
};

export default async function LeaderboardPage() {
  const supabase = await createClient();

  const [{ data: { user } }, { data: rows, error }] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("narrative_leaders")
      .select("name, score, momentum")
      .order("momentum", { ascending: false }),
  ]);

  if (error) {
    console.error("[leaderboard] narrative_leaders query failed:", error.message);
  }

  const leaders: LeaderRow[] = (rows ?? []) as LeaderRow[];

  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">WhatUPB</Link>
        <div className="nav-links">
          <Link href="/news">Narrative Feed</Link>
          <Link href="/alerts">Narrative Alerts</Link>
          <Link href="/leaderboard" style={{ color: "var(--ink)", fontWeight: 500 }}>Leaderboard</Link>
          {user ? (
            <>
              <Link href="/inbox">My Inbox</Link>
              <Link href="/settings" className="nav-cta">Settings</Link>
            </>
          ) : (
            <>
              <Link href="/login">Log In</Link>
              <Link href="/signup" className="nav-cta">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* PAGE */}
      <div className="inbox-page-wrap">

        {/* Summary header */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--lav)", fontSize: "10px", marginBottom: "10px", letterSpacing: "0.12em", fontWeight: 700 }}>
            NARRATIVE INTELLIGENCE
          </div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: "8px" }}>
            🚀 Fastest Growing Narratives
          </div>
          <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.6, maxWidth: "560px", fontFamily: "var(--font-lora), serif" }}>
            Track which crypto narratives are gaining momentum before individual coins move.
          </p>
        </div>

        {/* Leaderboard */}
        {leaders.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.25 }}>🚀</div>
            <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              No narrative data yet
            </p>
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>
              Check back once the ingestion cron has run.
            </p>
          </div>
        ) : (
          <div>
            {leaders.map((leader, i) => {
              const rank = i + 1;
              const isTopThree = rank <= 3;
              const mColor = momentumColor(leader.momentum);
              const mArrow = momentumArrow(leader.momentum);
              const mLabel = momentumLabel(leader.momentum);
              const sColor = scoreColor(leader.score);

              return (
                <article
                  key={leader.name}
                  style={{
                    background: isTopThree ? "rgba(255,255,255,0.92)" : "#fff",
                    border: isTopThree ? "1.5px solid rgba(155,142,232,0.45)" : "1px solid rgba(190,185,215,0.45)",
                    borderRadius: "16px",
                    padding: "16px 20px",
                    marginBottom: "10px",
                    boxShadow: isTopThree
                      ? "0 1px 0 rgba(255,255,255,1) inset, 0 6px 18px rgba(155,142,232,0.18)"
                      : "0 1px 0 rgba(255,255,255,1) inset, 0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)",
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flexWrap: "wrap" as const,
                  }}
                >
                  {/* Rank badge */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      fontWeight: 700,
                      fontSize: "13px",
                      background: RANK_BADGE_BG[rank] ?? "rgba(155,142,232,0.08)",
                      color: rank <= 3 ? "#fff" : "var(--muted)",
                      border: rank <= 3 ? "none" : "1px solid rgba(155,142,232,0.2)",
                      boxShadow: rank <= 3 ? "0 2px 6px rgba(0,0,0,0.15)" : "none",
                    }}
                  >
                    #{rank}
                  </div>

                  {/* Name */}
                  <div style={{ flex: "1 1 140px", minWidth: "120px" }}>
                    <div style={{
                      color: "var(--ink)",
                      fontWeight: 700,
                      fontSize: "15px",
                      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    }}>
                      {leader.name}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{ textAlign: "right", minWidth: "64px" }}>
                    <div style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      Score
                    </div>
                    <div style={{ color: sColor, fontWeight: 700, fontSize: "16px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      {Number(leader.score).toFixed(1)}
                    </div>
                  </div>

                  {/* Momentum */}
                  <div style={{ textAlign: "right", minWidth: "84px" }}>
                    <div style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.08em", textTransform: "uppercase" as const, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      Momentum
                    </div>
                    <div style={{ color: mColor, fontWeight: 700, fontSize: "16px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                      {mArrow} {mLabel}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <footer className="landing-footer" style={{ marginTop: "48px" }}>
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo-row">
                <span className="footer-wordmark">WhatUPB</span>
              </div>
              <p className="footer-tagline">Built for honest conversations.<br />Coin signals are moderated for safety.</p>
            </div>
            <div className="footer-links-col">
              <div className="footer-col-label">Links</div>
              <div className="footer-links-row">
                <Link href="/">Home</Link>
                <Link href="/privacy">Privacy</Link>
                <Link href="/terms">Terms</Link>
                <Link href="/content-policy">Content Policy</Link>
                <Link href="/safety">Safety</Link>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>&copy; 2026 WhatUPB. All rights reserved.</span>
            <span>whatupb.com</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
