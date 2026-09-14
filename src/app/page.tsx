import Link from "next/link";
import { DiagonalLines } from "@/components/diagonal-lines";
import MainNav from "@/components/main-nav";
import { createClient } from "@/lib/supabase-server";

const intelCards = [
  { label: "ETH Fees", value: "+14%", trend: "up" },
  { label: "CLARITY Act", value: "Updated", trend: "neutral" },
  { label: "New Disclosures", value: "3 Today", trend: "neutral" },
  { label: "SOL DEX Volume", value: "+18%", trend: "up" },
  { label: "New Token Launches", value: "12 This Week", trend: "neutral" },
  { label: "BTC Dominance", value: "54.2%", trend: "up" },
  { label: "SEC Comment Period", value: "Closes in 6d", trend: "down" },
  { label: "Base Activity", value: "+31%", trend: "up" },
];

const sectionCards = [
  {
    slug: "/capitol",
    tag: "Capitol",
    headline: "Government Financial Disclosures",
    body: "Stocks, ETFs, options, and crypto transactions reported by Congress and federal officials — tracked and searchable.",
    stat: "12 new disclosures this week",
  },
  {
    slug: "/policy",
    tag: "Policy",
    headline: "CLARITY Act & Crypto Regulation",
    body: "CLARITY Act, SEC rulemaking, CFTC jurisdiction, DeFi legislation and stablecoin frameworks — mapped in real time.",
    stat: "2 bills updated yesterday",
  },
  {
    slug: "/chains",
    tag: "Chains",
    headline: "Blockchain Network Activity",
    body: "Live metrics across Ethereum, Solana, Bitcoin, Base, Arbitrum and more — fees, volume, TVL, and stablecoin flows.",
    stat: "7 chains tracked",
  },
  {
    slug: "/tokens",
    tag: "Tokens",
    headline: "Digital Asset Intelligence",
    body: "Infrastructure, DeFi, AI, DePIN, gaming, and new token launches — with funding, chain, category, and risk context.",
    stat: "8 launches this week",
  },
  {
    slug: "/signals",
    tag: "Signals",
    headline: "Cross-Data Intelligence",
    body: "Where market activity, blockchain data, government disclosures, and policy news intersect — the connections others miss.",
    stat: "4 signals active",
  },
];

export default async function Home() {
  // Auth check is preserved but we don't gate the landing page on it
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />

      <MainNav />

      {/* Hero */}
      <section className="wb-hero">
        <div className="wb-hero-inner">
          <div className="wb-hero-eyebrow">Crypto Intelligence · Public Data</div>
          <h1 className="wb-hero-headline">
            Follow the Money.
            <br />
            Follow the Policy.
            <br />
            Follow the Chain.
          </h1>
          <p className="wb-hero-sub">
            WhatUPB tracks government disclosures, crypto policy, blockchain
            activity and emerging digital assets — connecting the signals behind
            the market.
          </p>
          <div className="wb-hero-ctas">
            <Link href="/signals" className="wb-btn-primary">
              Explore Signals <span className="wb-arrow">↗</span>
            </Link>
            <Link href="/capitol" className="wb-btn-ghost">
              View Capitol Disclosures <span className="wb-arrow">↗</span>
            </Link>
          </div>

          {/* Intelligence cards strip */}
          <div className="wb-intel-strip">
            {intelCards.map((card, i) => (
              <div key={i} className={`wb-intel-card trend-${card.trend}`}>
                <span className="wb-intel-label">{card.label}</span>
                <span className="wb-intel-value">{card.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Today's brief banner */}
      <div className="wb-today-banner">
        <span className="wb-today-tag">Today on WhatUPB</span>
        <span className="wb-today-sep">—</span>
        <span className="wb-today-text">
          12 new congressional disclosures · CLARITY Act update · Ethereum fees
          +14% · 8 new token launches
        </span>
      </div>

      {/* Section cards */}
      <section className="wb-sections">
        <div className="wb-sections-inner">
          {sectionCards.map((card) => (
            <Link key={card.slug} href={card.slug} className="wb-section-card">
              <div className="wb-section-tag">{card.tag}</div>
              <div className="wb-section-headline">{card.headline}</div>
              <p className="wb-section-body">{card.body}</p>
              <div className="wb-section-footer">
                <span className="wb-section-stat">{card.stat}</span>
                <span className="wb-section-arrow">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <div className="wb-bottom-cta">
        <div className="wb-bc-title">
          Intelligence at the intersection of
          <br />
          markets, policy, and the chain.
        </div>
        <p className="wb-bc-sub">
          Built for investors, researchers, and anyone who wants to understand
          where digital assets and government oversight are heading.
        </p>
        <Link href="/signals" className="wb-bc-btn">
          Explore Signals <span className="wb-arrow">↗</span>
        </Link>
      </div>

      {/* Footer */}
      <footer className="wb-footer">
        <div className="wb-footer-top">
          <div className="wb-footer-brand">
            <span className="wb-footer-wordmark">WhatUPB</span>
            <p className="wb-footer-tagline">
              Government disclosures, crypto policy,
              <br />
              and blockchain activity — connected.
            </p>
          </div>
          <div className="wb-footer-links-col">
            <div className="wb-footer-col-label">Navigate</div>
            <div className="wb-footer-links-row">
              <Link href="/capitol">Capitol</Link>
              <Link href="/policy">Policy</Link>
              <Link href="/chains">Chains</Link>
              <Link href="/tokens">Tokens</Link>
              <Link href="/signals">Signals</Link>
              <Link href="/about">About</Link>
            </div>
          </div>
          <div className="wb-footer-links-col">
            <div className="wb-footer-col-label">Legal</div>
            <div className="wb-footer-links-row">
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <Link href="/support">Support</Link>
            </div>
          </div>
        </div>
        <div className="wb-footer-bottom">
          <span>© 2026 WhatUPB. All Rights Reserved.</span>
          <span className="wb-footer-disc">
            For informational purposes only. Not financial advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
