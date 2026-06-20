import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { DiagonalLines } from "@/components/diagonal-lines";
import { ChatParallax } from "@/components/chat-parallax";

type NarrativeRow = {
  id: string;
  name: string;
  score: number;
  momentum: number;
  summary: string | null;
};

function scoreColor(score: number): string {
  if (score >= 60) return "#22c55e";
  if (score <= 40) return "#ef4444";
  return "#f59e0b";
}

function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

function momentumColor(momentum: number): string {
  if (momentum > 0) return "#22c55e";
  if (momentum < 0) return "#ef4444";
  return "#71717a";
}

function momentumArrow(momentum: number): string {
  if (momentum > 0) return "▲";
  if (momentum < 0) return "▼";
  return "●";
}

const BUBBLES = [
  { cls: "cf1", label: "AI Agents", pct: "+14%" },
  { cls: "cf2", label: "DePIN", pct: "+8%" },
  { cls: "cf3", label: "Political Memes", pct: "+27%" },
  { cls: "cf4", label: "Gaming", pct: "+5%" },
  { cls: "cf5", label: "Consumer Crypto", pct: "+12%" },
  { cls: "cf6", label: "Prediction Markets", pct: "+18%" },
];

const VALUE_PROPS = [
  { title: "Find Emerging Narratives", body: "Identify themes forming across thousands of token launches." },
  { title: "Measure Real Momentum", body: "Track liquidity, volume, participation, and growth." },
  { title: "Filter Out Noise", body: "Separate sustainable narratives from short-lived hype." },
  { title: "Follow Capital Flows", body: "See where attention and liquidity are moving next." },
];

const HOW_IT_WORKS_STEPS = [
  "Track trending tokens and market activity.",
  "Group projects into narratives and themes.",
  "Score narrative strength, liquidity, and momentum.",
  "Surface emerging opportunities and alerts.",
  "Monitor narrative rotation in real time.",
];

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("narratives")
    .select("id, name, score, momentum, summary")
    .order("score", { ascending: false })
    .limit(10);

  const narratives: NarrativeRow[] = rows ?? [];
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />
      <ChatParallax />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">WhatUPB</Link>
        <div className="nav-links">
          <Link href="/news">Narrative Feed</Link>
          <Link href="/alerts">Narrative Alerts</Link>
          <Link href="/leaderboard">Leaderboard</Link>
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

      {/* HERO */}
      <section className="hero">
        {BUBBLES.map((b) => (
          <div key={b.cls} className={`chat-float ${b.cls}`}>
            <div className="msg">
              {b.label} <span style={{ color: "#22c55e", fontWeight: 600 }}>{b.pct}</span>
            </div>
          </div>
        ))}

        <div className="anim-1" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 800, fontSize: "clamp(32px, 6vw, 58px)", letterSpacing: "-1.5px", lineHeight: 1.1, color: "var(--ink)", maxWidth: "740px", marginBottom: "20px" }}>
          Track Narratives Before The Market Notices.
        </div>
        <p className="hero-sub" style={{ maxWidth: "580px" }}>
          Thousands of tokens launch every day. Most disappear. WhatUPB identifies the narratives gaining real momentum before they become obvious.
        </p>
        <div className="cta-row">
          <Link href="/signup" className="btn-filled" style={{ textDecoration: "none" }}>
            Start Tracking Narratives <span className="arrow">→</span>
          </Link>
          <Link href="/leaderboard" className="btn-ghost" style={{ textDecoration: "none" }}>
            View Leaderboard
          </Link>
        </div>
      </section>

      {/* WHY WHATUPB */}
      <section className="section">
        <div className="s-title">Why WhatUPB?</div>
        <div className="steps-grid">
          {VALUE_PROPS.map((v) => (
            <div key={v.title} className="step-card">
              <div className="step-title">{v.title}</div>
              <div className="step-body">{v.body}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how-it-works" className="section">
        <div className="s-title">How It Works</div>
        <div className="steps-grid">
          {HOW_IT_WORKS_STEPS.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-num">{i + 1}</div>
              <div className="step-body">{step}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NARRATIVE BY NARRATIVE */}
      <section className="section" style={{ textAlign: "center" }}>
        <div className="s-title">The Market Moves Narrative by Narrative</div>
        <div style={{ maxWidth: "640px", margin: "0 auto", display: "flex", flexDirection: "column" as const, gap: "14px" }}>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            Most traders focus on individual coins.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            WhatUPB focuses on the narratives driving capital flows across crypto.
          </p>
          <p style={{ color: "var(--muted)", fontSize: "15px", lineHeight: 1.7, margin: 0 }}>
            When money rotates into AI, Gaming, DePIN, Political Memes, or emerging sectors, the strongest opportunities often appear before the broader market notices.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bottom-cta">
        <div className="bc-title">Stop Following Noise.<br />Start Following Narratives.</div>
        <Link href="/signup" className="bc-btn">
          Create Free Account <span className="arrow">→</span>
        </Link>
      </section>

      {/* PAGE */}
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "40px 24px 80px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--lav)", fontSize: "10px", marginBottom: "10px", letterSpacing: "0.12em", fontWeight: 700 }}>
            NARRATIVE INTELLIGENCE
          </div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--muted)", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.1em" }}>
            $ whatupb --narratives --sort=score --limit=10
          </div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--ink)", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Narrative Scores
          </div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--muted)", fontSize: "11px" }}>
            Last updated: {now} &nbsp;·&nbsp; Tracking 10 crypto narratives
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", fontSize: "11px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          <span><span style={{ color: "#22c55e" }}>●</span> Strong ≥ 60</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Neutral 40–60</span>
          <span><span style={{ color: "#ef4444" }}>●</span> Weak ≤ 40</span>
        </div>

        {/* Table */}
        {narratives.length === 0 ? (
          <div style={{ borderTop: "1px solid var(--line-col)", paddingTop: "40px", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px" }}>No narrative data yet</div>
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(190,185,215,0.45)", background: "#fff", boxShadow: "0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 100px 2fr", gap: "0 12px", padding: "10px 16px", borderBottom: "1px solid rgba(190,185,215,0.35)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" as const, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
              <span>#</span>
              <span>Narrative</span>
              <span>Score</span>
              <span>Momentum</span>
              <span>Summary</span>
            </div>

            {narratives.map((narrative, i) => {
              const color = scoreColor(narrative.score);
              const bar = scoreBar(narrative.score);
              const mColor = momentumColor(narrative.momentum);
              const mArrow = momentumArrow(narrative.momentum);
              return (
                <div key={narrative.id}
                  style={{ display: "grid", gridTemplateColumns: "36px 1fr 100px 100px 2fr", gap: "0 12px", padding: "12px 16px", borderBottom: i < narratives.length - 1 ? "1px solid rgba(190,185,215,0.2)" : "none", fontSize: "13px", alignItems: "center" }}
                >
                  <span style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{i + 1}</span>
                  <span style={{ color: "var(--lav)", fontWeight: 700, letterSpacing: "0.02em" }}>{narrative.name}</span>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "3px" }}>
                    <span style={{ color, fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{narrative.score.toFixed(1)}</span>
                    <span style={{ color, fontSize: "9px", letterSpacing: "0.04em", opacity: 0.65, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{bar}</span>
                  </div>
                  <span style={{ color: mColor, fontWeight: 700, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
                    {mArrow} {Math.abs(narrative.momentum).toFixed(1)}
                  </span>
                  <span style={{ color: "var(--ink2)", fontSize: "12.5px", lineHeight: 1.5 }}>{narrative.summary ?? "—"}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Narrative tracking CTA */}
        <div style={{ marginTop: "32px", padding: "28px", border: "1px solid rgba(155,142,232,0.2)", borderRadius: "16px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--lav)", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.08em" }}>
            $ whatupb --track-narratives
          </div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--ink)", fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
            Track Crypto Narratives in Real Time
          </div>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6, fontFamily: "var(--font-lora), serif" }}>
            Track narrative strength, momentum shifts, emerging crypto narratives, and market-wide trends across crypto.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
            <Link href="/news" className="card-btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
              Narrative Feed →
            </Link>
            <Link href="/alerts" style={{ color: "var(--muted)", fontSize: "14px", textDecoration: "none", padding: "13px 24px", border: "1px solid var(--faint)", borderRadius: "50px", fontFamily: "var(--font-lora), serif", background: "rgba(255,255,255,0.6)" }}>
              Narrative Alerts
            </Link>
          </div>
        </div>

        {/* Safety & Transparency */}
        <div id="safety" style={{ marginTop: "32px", padding: "28px", border: "1px solid rgba(155,142,232,0.2)", borderRadius: "16px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--ink)", fontSize: "18px", fontWeight: 700, marginBottom: "16px" }}>
            Safety &amp; Transparency
          </div>
          <ul style={{ display: "flex", flexDirection: "column" as const, gap: "10px", paddingLeft: 0, listStyle: "none", margin: 0 }}>
            {[
              "Not financial advice — for informational purposes only",
              "Powered by public GeckoTerminal market data",
              "No wallet connection or access required",
              "WhatUPB never takes custody of funds",
              "Narrative scores and alerts are informational signals, not trading recommendations",
            ].map((item, i) => (
              <li key={i} style={{ display: "flex", gap: "12px", alignItems: "baseline" }}>
                <span style={{ color: "var(--lav)", fontSize: "12px", flexShrink: 0 }}>●</span>
                <span style={{ color: "var(--ink2)", fontSize: "14px", lineHeight: 1.6, fontFamily: "var(--font-lora), serif" }}>
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <footer className="landing-footer" style={{ marginTop: "48px" }}>
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo-row">
                <span className="footer-wordmark">WhatUPB</span>
              </div>
              <p className="footer-tagline">Built for crypto narrative intelligence.<br />Track narrative strength, momentum shifts, meme coin reputation, and emerging market trends.</p>
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
