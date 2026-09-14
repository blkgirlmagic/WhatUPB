import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "Signals — WhatUPB | Cross-Data Intelligence",
  description:
    "Intelligence connecting market activity, blockchain data, government disclosures, and crypto policy — the signals others miss.",
};

const signals = [
  {
    id: 1,
    intensity: "Strong",
    intensityType: "strong",
    category: "Chain + Policy",
    headline: "Ethereum Activity Accelerating as CLARITY Act Advances",
    summary:
      "Ethereum network activity is rising sharply across multiple metrics at the same time the CLARITY Act is advancing through House committee — suggesting institutional positioning ahead of regulatory clarity.",
    chainData: [
      { label: "Fees", value: "+14%", up: true },
      { label: "DEX Volume", value: "+26%", up: true },
      { label: "Stablecoin Inflows", value: "+11%", up: true },
    ],
    relatedPolicy: "CLARITY Act — House Committee Review",
    relatedDisclosures: "2 ETH-related disclosures (Sep 8–12)",
    relatedTokens: ["EigenLayer (EIGEN)", "Ethena (ENA)"],
    date: "Sep 14, 2026",
  },
  {
    id: 2,
    intensity: "Notable",
    intensityType: "notable",
    category: "Capitol + Crypto",
    headline: "Congressional Crypto Purchases Spike Before Senate Hearing",
    summary:
      "Three senators and two representatives disclosed crypto purchases in the 14 days leading up to a Senate Banking Committee hearing on digital asset oversight — a pattern worth monitoring.",
    chainData: [
      { label: "BTC Purchases", value: "2 trades", up: true },
      { label: "ETH Purchases", value: "3 trades", up: true },
      { label: "Avg Delay", value: "6.2 days", up: null },
    ],
    relatedPolicy: "Senate Banking Committee Hearing — Sep 3",
    relatedDisclosures: "5 disclosures in 14-day window",
    relatedTokens: ["Bitcoin (BTC)", "Ethereum (ETH)", "Solana (SOL)"],
    date: "Sep 13, 2026",
  },
  {
    id: 3,
    intensity: "Emerging",
    intensityType: "emerging",
    category: "Chain + Tokens",
    headline: "Solana Ecosystem Momentum: DEX Volume + Token Launches Align",
    summary:
      "Solana DEX volume is up 18% while 5 new Solana-based tokens launched this week — two with significant VC backing. On-chain stablecoin activity suggests fresh capital entering the ecosystem.",
    chainData: [
      { label: "DEX Volume", value: "+18%", up: true },
      { label: "Stablecoin", value: "+22%", up: true },
      { label: "New Tokens", value: "5 launches", up: true },
    ],
    relatedPolicy: "No active Solana-specific legislation",
    relatedDisclosures: "1 SOL-related disclosure (Sep 7)",
    relatedTokens: ["Grass (GRASS)", "io.net (IO)"],
    date: "Sep 12, 2026",
  },
  {
    id: 4,
    intensity: "Notable",
    intensityType: "notable",
    category: "Policy + Stablecoins",
    headline: "Stablecoin Legislation Accelerating as Treasury Guidance Drops",
    summary:
      "The Treasury's new broker reporting guidance, released September 5, coincides with new stablecoin reserve amendments in the CLARITY Act — creating a dual-front regulatory push that may affect major stablecoin issuers.",
    chainData: [
      { label: "USDT Volume", value: "+9%", up: true },
      { label: "USDC Minting", value: "+14%", up: true },
      { label: "USDe Supply", value: "+31%", up: true },
    ],
    relatedPolicy: "CLARITY Act stablecoin amendment · Treasury guidance Sep 5",
    relatedDisclosures: "No direct stablecoin disclosures",
    relatedTokens: ["Ethena (ENA)", "Usual Protocol (USUAL)"],
    date: "Sep 11, 2026",
  },
];

export default function SignalsPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">Signals</div>
          <h1 className="wb-page-title">Cross-Data Intelligence</h1>
          <p className="wb-page-sub">
            Where market activity, blockchain data, government disclosures, and
            policy intersect — connections across the data that others miss.
          </p>
          <div className="wb-page-meta">
            <span className="wb-meta-chip">Updated Sep 14, 2026</span>
            <span className="wb-meta-chip">4 signals active</span>
            <span className="wb-meta-chip wb-chip-note">
              Mock data · API connection coming soon
            </span>
          </div>
        </div>
      </div>

      <div className="wb-content">
        <div className="wb-signals-list">
          {signals.map((signal) => (
            <div key={signal.id} className={`wb-signal-card signal-${signal.intensityType}`}>
              <div className="wb-signal-top">
                <div className="wb-signal-meta">
                  <span className={`wb-signal-intensity intensity-${signal.intensityType}`}>
                    {signal.intensity}
                  </span>
                  <span className="wb-signal-cat">{signal.category}</span>
                  <span className="wb-signal-date">{signal.date}</span>
                </div>
                <h2 className="wb-signal-headline">{signal.headline}</h2>
                <p className="wb-signal-summary">{signal.summary}</p>
              </div>

              <div className="wb-signal-body">
                {/* Chain data metrics */}
                <div className="wb-signal-section">
                  <div className="wb-signal-section-label">Chain Data</div>
                  <div className="wb-signal-metrics">
                    {signal.chainData.map((d, i) => (
                      <div key={i} className="wb-signal-metric">
                        <span className="wb-sm-label">{d.label}</span>
                        <span className={`wb-sm-value ${d.up === true ? "up" : d.up === false ? "down" : ""}`}>
                          {d.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Related data */}
                <div className="wb-signal-related">
                  <div className="wb-signal-related-item">
                    <span className="wb-sr-label">Related Policy</span>
                    <span className="wb-sr-value">{signal.relatedPolicy}</span>
                  </div>
                  <div className="wb-signal-related-item">
                    <span className="wb-sr-label">Government Disclosures</span>
                    <span className="wb-sr-value">{signal.relatedDisclosures}</span>
                  </div>
                  <div className="wb-signal-related-item">
                    <span className="wb-sr-label">Related Tokens</span>
                    <div className="wb-sr-tokens">
                      {signal.relatedTokens.map((t, i) => (
                        <span key={i} className="wb-sr-token-chip">{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="wb-disclaimer">
          Signals represent editorial analysis connecting publicly available data.
          For informational purposes only. Not financial advice. Mock data — live
          integration coming soon.
        </p>
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
