import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { DiagonalLines } from "@/components/diagonal-lines";

type CoinRow = {
  coin_ticker: string;
  rep_score: number;
  bullish_count: number;
  bearish_count: number;
  chaos_count: number;
  last_calculated: string;
  coins: { name: string; chain: string } | null;
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

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: rows } = await supabase
    .from("coin_rep_scores")
    .select("coin_ticker, rep_score, bullish_count, bearish_count, chaos_count, last_calculated, coins(name, chain)")
    .order("rep_score", { ascending: false })
    .limit(20);

  const coins: CoinRow[] = (rows ?? []) as unknown as CoinRow[];
  const now = new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">WhatUPB</Link>
        <div className="nav-links">
          <Link href="/news">News</Link>
          {user ? (
            <>
              <Link href="/inbox">Signal Feed</Link>
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
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "110px 24px 80px", position: "relative", zIndex: 10 }}>

        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--muted)", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.1em" }}>
            $ whatupb --leaderboard --sort=rep_score --limit=20
          </div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--ink)", fontSize: "28px", fontWeight: 800, letterSpacing: "-0.5px", marginBottom: "4px" }}>
            Meme Coin Rep Scores
          </div>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--muted)", fontSize: "11px" }}>
            Last updated: {now} &nbsp;·&nbsp; Community signals: bullish / bearish / chaos
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "20px", fontSize: "11px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          <span><span style={{ color: "#22c55e" }}>●</span> Bullish ≥ 60</span>
          <span><span style={{ color: "#f59e0b" }}>●</span> Neutral 40–60</span>
          <span><span style={{ color: "#ef4444" }}>●</span> Bearish ≤ 40</span>
        </div>

        {/* Table */}
        {coins.length === 0 ? (
          <div style={{ borderTop: "1px solid var(--line-col)", paddingTop: "40px", textAlign: "center" }}>
            <div style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "12px" }}>No signal data yet</div>
            <div style={{ color: "var(--muted)", fontSize: "11px", marginBottom: "24px", opacity: 0.6 }}>Be the first to submit a signal.</div>
            <Link href="/signup" style={{ color: "var(--lav)", fontSize: "13px", textDecoration: "none", padding: "8px 20px", border: "1px solid rgba(155,142,232,0.35)", borderRadius: "50px", fontFamily: "var(--font-lora), serif" }}>
              Create Account →
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto", borderRadius: "16px", border: "1px solid rgba(190,185,215,0.45)", background: "#fff", boxShadow: "0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)" }}>
            {/* Column headers */}
            <div style={{ display: "grid", gridTemplateColumns: "36px 72px 1fr 130px 60px 60px 60px 80px", gap: "0 12px", padding: "10px 16px", borderBottom: "1px solid rgba(190,185,215,0.35)", fontSize: "10px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" as const, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
              <span>#</span>
              <span>Ticker</span>
              <span>Name</span>
              <span>Score</span>
              <span style={{ color: "#22c55e" }}>Bull</span>
              <span style={{ color: "#ef4444" }}>Bear</span>
              <span style={{ color: "#f59e0b" }}>Chaos</span>
              <span>Chain</span>
            </div>

            {coins.map((coin, i) => {
              const color = scoreColor(coin.rep_score);
              const bar = scoreBar(coin.rep_score);
              return (
                <div key={coin.coin_ticker}
                  style={{ display: "grid", gridTemplateColumns: "36px 72px 1fr 130px 60px 60px 60px 80px", gap: "0 12px", padding: "12px 16px", borderBottom: i < coins.length - 1 ? "1px solid rgba(190,185,215,0.2)" : "none", fontSize: "13px", alignItems: "center" }}
                >
                  <span style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{i + 1}</span>
                  <span style={{ color: "var(--lav)", fontWeight: 700, letterSpacing: "0.05em", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{coin.coin_ticker}</span>
                  <span style={{ color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{coin.coins?.name ?? "—"}</span>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "3px" }}>
                    <span style={{ color, fontWeight: 700, fontSize: "13px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{Number(coin.rep_score).toFixed(1)}</span>
                    <span style={{ color, fontSize: "9px", letterSpacing: "0.04em", opacity: 0.65, fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{bar}</span>
                  </div>
                  <span style={{ color: "#22c55e", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{coin.bullish_count.toLocaleString()}</span>
                  <span style={{ color: "#ef4444", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{coin.bearish_count.toLocaleString()}</span>
                  <span style={{ color: "#f59e0b", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{coin.chaos_count.toLocaleString()}</span>
                  <span style={{ color: "var(--muted)", fontSize: "11px", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>{coin.coins?.chain ?? "—"}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Submit signal CTA */}
        <div style={{ marginTop: "32px", padding: "28px", border: "1px solid rgba(155,142,232,0.2)", borderRadius: "16px", background: "rgba(255,255,255,0.7)", backdropFilter: "blur(12px)" }}>
          <div style={{ fontFamily: "var(--font-ibm-plex-mono), monospace", color: "var(--lav)", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.08em" }}>
            $ whatupb --submit-signal
          </div>
          <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", color: "var(--ink)", fontSize: "18px", fontWeight: 700, marginBottom: "6px" }}>
            Have an opinion on a meme coin?
          </div>
          <p style={{ color: "var(--muted)", fontSize: "14px", marginBottom: "20px", lineHeight: 1.6, fontFamily: "var(--font-lora), serif" }}>
            Submit a bullish, bearish, or chaos signal — anonymous and updates the rep score instantly.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
            {user ? (
              <Link href="/inbox" className="card-btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                Go to Signal Feed →
              </Link>
            ) : (
              <>
                <Link href="/signup" className="card-btn-primary" style={{ textDecoration: "none", display: "inline-block" }}>
                  Get Your Link — Free →
                </Link>
                <Link href="/login" style={{ color: "var(--muted)", fontSize: "14px", textDecoration: "none", padding: "13px 24px", border: "1px solid var(--faint)", borderRadius: "50px", fontFamily: "var(--font-lora), serif", background: "rgba(255,255,255,0.6)" }}>
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>

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
