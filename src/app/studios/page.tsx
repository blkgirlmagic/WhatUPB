import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { DiagonalLines } from "@/components/diagonal-lines";
import StudiosClient from "./studios-client";

export const metadata = {
  title: "Studios — CoinRep",
  description: "Original video series from CoinRep Studios. Watch MOTE, What Up B, and BETWEEN on TikTok @GetCoinRep.",
};

export default async function Studios() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="landing-page" style={{ background: "#f0eaff" }}>
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          CoinRep
        </Link>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <Link href="/safety">Safety</Link>
          <Link href="/studios" style={{ color: "var(--ink)", fontWeight: 500 }}>Studios</Link>
          {user ? (
            <Link href="/inbox" className="nav-cta">Go to Inbox</Link>
          ) : (
            <Link href="/signup" className="nav-cta">Create Account</Link>
          )}
        </div>
      </nav>

      {/* PAGE */}
      <div style={{
        position: "relative",
        zIndex: 10,
        maxWidth: "640px",
        margin: "0 auto",
        padding: "90px 24px 120px",
      }}>
        {/* Header */}
        <div className="anim-1" style={{ marginBottom: "36px" }}>
          <div style={{
            fontSize: "10px",
            letterSpacing: "2.5px",
            textTransform: "uppercase" as const,
            color: "#c9a84c",
            fontWeight: 600,
            fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
            marginBottom: "8px",
          }}>
            CoinRep Studios
          </div>
          <div style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            fontStyle: "italic",
            fontSize: "32px",
            fontWeight: 800,
            color: "#1a1730",
            letterSpacing: "-0.5px",
            lineHeight: 1.2,
            marginBottom: "10px",
          }}>
            Stories worth watching.
          </div>
          <p style={{
            fontSize: "15px",
            color: "rgba(26,23,48,0.5)",
            lineHeight: 1.6,
            maxWidth: "420px",
          }}>
            Original video series from CoinRep Studios. Whimsy, mystery,
            and anime \u2014 all on TikTok @GetCoinRep.
          </p>
        </div>

        <StudiosClient />
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <span className="footer-wordmark">CoinRep</span>
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
              <Link href="/safety">Safety</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 CoinRep. All rights reserved.</span>
          <span>coinrep.com</span>
        </div>
      </footer>
    </div>
  );
}
