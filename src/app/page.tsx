import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

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
  return "\u2588".repeat(filled) + "\u2591".repeat(10 - filled);
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
    <div style={{ minHeight: "100vh", background: "#09090b", color: "#d4d4d8", fontFamily: "var(--font-ibm-plex-mono), \'IBM Plex Mono\', \'Courier New\', monospace" }}>
      {/* Top bar */}
      <div style={{ borderBottom: "1px solid #27272a", padding: "12px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#09090b", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ color: "#22c55e", fontWeight: 700, fontSize: "15px", letterSpacing: "0.08em" }}>{"\u25b6 COINREP"}</span>
          <span style={{ color: "#52525b", fontSize: "11px" }}>MEME COIN REPUTATION TERMINAL</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {user ? (
            <>
              <Link href="/news" style={{ color: "#a1a1aa", fontSize: "12px", textDecoration: "none", padding: "5px 12px", border: "1px solid #3f3f46", borderRadius: "4px" }}>News</Link>
              <Link href="/inbox" style={{ color: "#a1a1aa", fontSize: "12px", textDecoration: "none", padding: "5px 12px", border: "1px solid #3f3f46", borderRadius: "4px" }}>Signal Feed</Link>
              <Link href="/settings" style={{ color: "#22c55e", fontSize: "12px", textDecoration: "none", padding: "5px 12px", border: "1px solid #22c55e44", borderRadius: "4px" }}>Settings</Link>
            </>
          ) : (
            <>
              <Link href="/news" style={{ color: "#a1a1aa", fontSize: "12px", textDecoration: "none", padding: "5px 12px", border: "1px solid #3f3f46", borderRadius: "4px" }}>News</Link>
              <Link href="/login" style={{ color: "#a1a1aa", fontSize: "12px", textDecoration: "none", padding: "5px 12px", border: "1px solid #3f3f46", borderRadius: "4px" }}>Login</Link>
              <Link href="/signup" style={{ color: "#09090b", fontSize: "12px", fontWeight: 700, textDecoration: "none", padding: "5px 14px", background: "#22c55e", borderRadius: "4px" }}>Get Started</Link>
            </>
          )}
        </div>
      </div>

      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: "32px" }}>
          <div style={{ color: "#52525b", fontSize: "11px", marginBottom: "8px", letterSpacing: "0.1em" }}>$ coinrep --leaderboard --sort=rep_score --limit=20</div>
          <div style={{ color: "#22c55e", fontSize: "22px", fontWeight: 700, letterSpacing: "0.04em", marginBottom: "4px" }}>MEME COIN REP SCORES</div>
          <div style={{ color: "#52525b", fontSize: "11px" }}>Last updated: {now} &nbsp;|&nbsp; Community signals: bullish / bearish / chaos</div>
        </div>

        <div style={{ display: "flex", gap: "20px", marginBottom: "20px", fontSize: "11px" }}>
          <span><span style={{ color: "#22c55e" }}>{"\u25cf"}</span> BULLISH &ge; 60</span>
          <span><span style={{ color: "#f59e0b" }}>{"\u25cf"}</span> NEUTRAL 40&ndash;60</span>
          <span><span style={{ color: "#ef4444" }}>{"\u25cf"}</span> BEARISH &le; 40</span>
        </div>

        {coins.length === 0 ? (
          <div style={{ borderTop: "1px solid #27272a", paddingTop: "40px", textAlign: "center" }}>
            <div style={{ color: "#52525b", fontSize: "13px", marginBottom: "12px" }}>NO SIGNAL DATA YET</div>
            <div style={{ color: "#3f3f46", fontSize: "11px", marginBottom: "24px" }}>Be the first to submit a signal.</div>
            <Link href="/signup" style={{ color: "#22c55e", fontSize: "12px", textDecoration: "none", padding: "8px 20px", border: "1px solid #22c55e44", borderRadius: "4px" }}>Create Account &rarr;</Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: "36px 72px 1fr 120px 60px 60px 60px 90px", gap: "0 12px", padding: "6px 12px", borderBottom: "1px solid #27272a", fontSize: "10px", color: "#52525b", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>
              <span>#</span><span>TICKER</span><span>NAME</span><span>SCORE</span>
              <span style={{ color: "#22c55e" }}>BULL</span>
              <span style={{ color: "#ef4444" }}>BEAR</span>
              <span style={{ color: "#f59e0b" }}>CHAOS</span>
              <span>CHAIN</span>
            </div>
            {coins.map((coin, i) => {
              const color = scoreColor(coin.rep_score);
              const bar = scoreBar(coin.rep_score);
              return (
                <div key={coin.coin_ticker}
                  style={{ display: "grid", gridTemplateColumns: "36px 72px 1fr 120px 60px 60px 60px 90px", gap: "0 12px", padding: "10px 12px", borderBottom: "1px solid #18181b", fontSize: "13px", alignItems: "center", transition: "background 0.1s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "#18181b")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  <span style={{ color: "#52525b", fontSize: "11px" }}>{i + 1}</span>
                  <span style={{ color, fontWeight: 700, letterSpacing: "0.05em" }}>{coin.coin_ticker}</span>
                  <span style={{ color: "#a1a1aa", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{coin.coins?.name ?? "\u2014"}</span>
                  <div style={{ display: "flex", flexDirection: "column" as const, gap: "2px" }}>
                    <span style={{ color, fontWeight: 700, fontSize: "13px" }}>{Number(coin.rep_score).toFixed(1)}</span>
                    <span style={{ color, fontSize: "9px", letterSpacing: "0.05em", opacity: 0.7 }}>{bar}</span>
                  </div>
                  <span style={{ color: "#22c55e" }}>{coin.bullish_count.toLocaleString()}</span>
                  <span style={{ color: "#ef4444" }}>{coin.bearish_count.toLocaleString()}</span>
                  <span style={{ color: "#f59e0b" }}>{coin.chaos_count.toLocaleString()}</span>
                  <span style={{ color: "#52525b", fontSize: "11px" }}>{coin.coins?.chain ?? "\u2014"}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "40px", padding: "24px", border: "1px solid #27272a", borderRadius: "6px", background: "#0f0f11" }}>
          <div style={{ color: "#22c55e", fontSize: "12px", marginBottom: "8px", letterSpacing: "0.08em" }}>$ coinrep --submit-signal</div>
          <div style={{ color: "#d4d4d8", fontSize: "15px", fontWeight: 600, marginBottom: "6px" }}>Have an opinion on a meme coin?</div>
          <p style={{ color: "#71717a", fontSize: "13px", marginBottom: "20px", lineHeight: 1.6 }}>
            Submit a bullish, bearish, or chaos signal. Anonymous and updates rep score in real time.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
            {user ? (
              <Link href="/inbox" style={{ color: "#09090b", fontSize: "13px", fontWeight: 700, textDecoration: "none", padding: "10px 20px", background: "#22c55e", borderRadius: "4px" }}>Go to Signal Feed &rarr;</Link>
            ) : (
              <>
                <Link href="/signup" style={{ color: "#09090b", fontSize: "13px", fontWeight: 700, textDecoration: "none", padding: "10px 20px", background: "#22c55e", borderRadius: "4px" }}>Create Account &rarr;</Link>
                <Link href="/login" style={{ color: "#a1a1aa", fontSize: "13px", textDecoration: "none", padding: "10px 20px", border: "1px solid #3f3f46", borderRadius: "4px" }}>Login</Link>
              </>
            )}
          </div>
        </div>

        <div style={{ marginTop: "48px", paddingTop: "20px", borderTop: "1px solid #18181b", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: "8px" }}>
          <div style={{ display: "flex", gap: "16px", fontSize: "11px" }}>
            <Link href="/privacy" style={{ color: "#52525b", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ color: "#52525b", textDecoration: "none" }}>Terms</Link>
            <Link href="/content-policy" style={{ color: "#52525b", textDecoration: "none" }}>Content Policy</Link>
            <Link href="/safety" style={{ color: "#52525b", textDecoration: "none" }}>Safety</Link>
          </div>
          <span style={{ fontSize: "11px", color: "#3f3f46" }}>&copy; 2026 CoinRep &middot; coinrep.com</span>
        </div>
      </div>
    </div>
  );
}
