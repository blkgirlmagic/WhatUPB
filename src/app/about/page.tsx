import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "About — WhatUPB | Crypto Intelligence Platform",
  description:
    "WhatUPB tracks government financial disclosures, crypto policy, blockchain activity, and emerging digital assets — connecting the signals behind the market.",
};

const pillars = [
  {
    tag: "Capitol",
    href: "/capitol",
    headline: "Government Financial Disclosures",
    body: "We track required financial disclosures from Congressional members and federal officials — surfacing stock, ETF, options, and crypto transactions as they're filed. No interpretation, just the data.",
  },
  {
    tag: "Policy",
    href: "/policy",
    headline: "Crypto Regulation & Legislation",
    body: "The regulatory environment for digital assets is shifting fast. We follow the CLARITY Act, SEC rulemaking, CFTC jurisdiction, DeFi and stablecoin legislation — updated as it happens.",
  },
  {
    tag: "Chains",
    href: "/chains",
    headline: "Blockchain Network Activity",
    body: "Raw on-chain metrics across major networks — fees, DEX volume, TVL, stablecoin flows, and transaction counts. We track what the chains are actually doing, not what's being said about them.",
  },
  {
    tag: "Tokens",
    href: "/tokens",
    headline: "Digital Asset Intelligence",
    body: "New launches, funding rounds, infrastructure plays, DeFi protocols, AI tokens, DePIN, gaming — with chain, category, utility, and risk context so you can orient before you dig deeper.",
  },
  {
    tag: "Signals",
    href: "/signals",
    headline: "Cross-Data Intelligence",
    body: "The most valuable insight sits at the intersection. Signals connect government disclosures, policy developments, blockchain metrics, and token activity into editorial analysis.",
  },
];

export default function AboutPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">About</div>
          <h1 className="wb-page-title">What Is WhatUPB?</h1>
          <p className="wb-page-sub">
            Crypto intelligence and public data — connected. We track government
            disclosures, crypto policy, blockchain activity, and emerging digital
            assets in one place.
          </p>
        </div>
      </div>

      <div className="wb-content">
        {/* Mission */}
        <div className="wb-about-mission">
          <div className="wb-about-headline-row">
            <h2 className="wb-about-h2">Follow the Money. Follow the Policy. Follow the Chain.</h2>
          </div>
          <p className="wb-about-body">
            Digital assets don't operate in isolation. They're shaped by
            legislation moving through Congress, regulatory decisions at the SEC
            and CFTC, and the on-chain activity of the networks themselves.
            Government officials trade crypto. Policy shifts market structure.
            Chain activity signals institutional positioning.
          </p>
          <p className="wb-about-body">
            WhatUPB was built to connect these dots. We aggregate publicly
            available government data, legislative tracking, and blockchain
            metrics into a single intelligence layer — so researchers, investors,
            and informed observers can see the full picture, not just one slice
            of it.
          </p>
        </div>

        {/* What we cover */}
        <div className="wb-section-divider">
          <h2 className="wb-section-h2">What We Cover</h2>
        </div>
        <div className="wb-about-pillars">
          {pillars.map((p) => (
            <Link key={p.tag} href={p.href} className="wb-about-pillar">
              <div className="wb-about-pillar-tag">{p.tag}</div>
              <div className="wb-about-pillar-headline">{p.headline}</div>
              <p className="wb-about-pillar-body">{p.body}</p>
              <span className="wb-about-pillar-cta">Explore {p.tag} →</span>
            </Link>
          ))}
        </div>

        {/* Principles */}
        <div className="wb-section-divider">
          <h2 className="wb-section-h2">Our Principles</h2>
        </div>
        <div className="wb-about-principles">
          <div className="wb-principle">
            <div className="wb-principle-num">01</div>
            <div className="wb-principle-content">
              <div className="wb-principle-title">Public Data Only</div>
              <p className="wb-principle-body">
                Every data point we surface is drawn from publicly available
                sources — government filings, legislative records, regulatory
                announcements, and on-chain data. We don't use private data
                feeds or proprietary intelligence.
              </p>
            </div>
          </div>
          <div className="wb-principle">
            <div className="wb-principle-num">02</div>
            <div className="wb-principle-content">
              <div className="wb-principle-title">No Financial Advice</div>
              <p className="wb-principle-body">
                WhatUPB is an intelligence and research platform, not a financial
                advisor. Nothing here constitutes investment advice. We present
                data and analysis — decisions are yours.
              </p>
            </div>
          </div>
          <div className="wb-principle">
            <div className="wb-principle-num">03</div>
            <div className="wb-principle-content">
              <div className="wb-principle-title">Editorial Independence</div>
              <p className="wb-principle-body">
                Signals are written editorial analysis connecting data points
                across sources. We follow the data where it leads, without
                agenda or sponsorship influence.
              </p>
            </div>
          </div>
          <div className="wb-principle">
            <div className="wb-principle-num">04</div>
            <div className="wb-principle-content">
              <div className="wb-principle-title">Built for Longevity</div>
              <p className="wb-principle-body">
                This isn't a meme tracker or a speculation machine. WhatUPB is
                structured around the durable forces shaping digital assets:
                government, regulation, infrastructure, and capital flows.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="wb-about-cta">
          <div className="wb-about-cta-title">Start with Signals</div>
          <p className="wb-about-cta-body">
            The best place to get oriented is the Signals page — editorial
            analysis connecting the dots across our data sources.
          </p>
          <Link href="/signals" className="wb-btn-primary">
            Explore Signals <span className="wb-arrow">↗</span>
          </Link>
        </div>
      </div>

      <footer className="wb-footer wb-footer-slim">
        <div className="wb-footer-bottom">
          <span>© 2025 WhatUPB</span>
          <Link href="/" className="wb-footer-home">← Home</Link>
        </div>
      </footer>
    </div>
  );
}
