import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "Tokens — WhatUPB | Digital Asset Intelligence",
  description:
    "Track infrastructure, DeFi, AI, DePIN, gaming tokens and new launches with funding, chain, category, and risk context.",
};

const tokens = [
  {
    project: "EigenLayer",
    token: "EIGEN",
    chain: "Ethereum",
    category: "Infrastructure",
    launchType: "Airdrop",
    launchDate: "Apr 2024",
    funding: "$167M",
    marketCap: "$1.2B",
    utility: "Restaking protocol for shared security",
    risk: "Medium",
  },
  {
    project: "Hyperliquid",
    token: "HYPE",
    chain: "Hyperliquid L1",
    category: "DeFi",
    launchType: "Fair Launch",
    launchDate: "Nov 2024",
    funding: "Bootstrapped",
    marketCap: "$4.8B",
    utility: "On-chain perpetuals DEX",
    risk: "Medium",
  },
  {
    project: "Celestia",
    token: "TIA",
    chain: "Celestia",
    category: "Infrastructure",
    launchType: "Airdrop",
    launchDate: "Oct 2023",
    funding: "$55M",
    marketCap: "$680M",
    utility: "Modular data availability layer",
    risk: "Medium",
  },
  {
    project: "Grass",
    token: "GRASS",
    chain: "Solana",
    category: "DePIN",
    launchType: "Airdrop",
    launchDate: "Oct 2024",
    funding: "$4.5M",
    marketCap: "$220M",
    utility: "Decentralized internet bandwidth sharing",
    risk: "High",
  },
  {
    project: "Aixbt",
    token: "AIXBT",
    chain: "Base",
    category: "AI",
    launchType: "Fair Launch",
    launchDate: "Dec 2024",
    funding: "N/A",
    marketCap: "$140M",
    utility: "AI crypto market intelligence agent",
    risk: "High",
  },
  {
    project: "Kaito",
    token: "KAITO",
    chain: "Ethereum",
    category: "AI",
    launchType: "Airdrop",
    launchDate: "Feb 2025",
    funding: "$53M",
    marketCap: "$310M",
    utility: "AI-powered crypto information layer",
    risk: "Medium",
  },
  {
    project: "Nyan Heroes",
    token: "NYAN",
    chain: "Solana",
    category: "Gaming",
    launchType: "IDO",
    launchDate: "Mar 2024",
    funding: "$5.5M",
    marketCap: "$28M",
    utility: "AAA cat-themed battle royale game",
    risk: "High",
  },
  {
    project: "Bera Chain",
    token: "BERA",
    chain: "Berachain",
    category: "Infrastructure",
    launchType: "Airdrop",
    launchDate: "Feb 2025",
    funding: "$142M",
    marketCap: "$890M",
    utility: "EVM-compatible L1 with PoL consensus",
    risk: "Medium",
  },
  {
    project: "Ethena",
    token: "ENA",
    chain: "Ethereum",
    category: "DeFi",
    launchType: "Airdrop",
    launchDate: "Apr 2024",
    funding: "$14M",
    marketCap: "$1.1B",
    utility: "Synthetic dollar protocol (USDe)",
    risk: "High",
  },
  {
    project: "io.net",
    token: "IO",
    chain: "Solana",
    category: "DePIN",
    launchType: "Airdrop",
    launchDate: "Jun 2024",
    funding: "$30M",
    marketCap: "$180M",
    utility: "Decentralized GPU network for AI",
    risk: "High",
  },
  {
    project: "Usual Protocol",
    token: "USUAL",
    chain: "Ethereum",
    category: "DeFi",
    launchType: "Launch",
    launchDate: "Sep 2026",
    funding: "$7M",
    marketCap: "TBD",
    utility: "Tokenized RWA-backed stablecoin",
    risk: "High",
  },
  {
    project: "Movement",
    token: "MOVE",
    chain: "Movement L2",
    category: "Infrastructure",
    launchType: "Airdrop",
    launchDate: "Dec 2024",
    funding: "$38M",
    marketCap: "$420M",
    utility: "Move language L2 on Ethereum",
    risk: "Medium",
  },
];

const filters = ["All", "Infrastructure", "DeFi", "AI", "DePIN", "Gaming", "Token Launches", "Memes"];

const riskColors: Record<string, string> = {
  Low: "risk-low",
  Medium: "risk-medium",
  High: "risk-high",
};

export default function TokensPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">Tokens</div>
          <h1 className="wb-page-title">Digital Asset Intelligence</h1>
          <p className="wb-page-sub">
            Infrastructure, DeFi, AI, DePIN, gaming, and new token launches —
            with funding, chain, category, and risk context.
          </p>
          <div className="wb-page-meta">
            <span className="wb-meta-chip">Updated Sep 14, 2026</span>
            <span className="wb-meta-chip">8 launches this week</span>
            <span className="wb-meta-chip wb-chip-note">
              Mock data · API connection coming soon
            </span>
          </div>
        </div>
      </div>

      <div className="wb-content">
        {/* Filters */}
        <div className="wb-filters">
          {filters.map((f, i) => (
            <button
              key={f}
              className={`wb-filter-btn${i === 0 ? " active" : ""}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Token cards grid */}
        <div className="wb-tokens-grid">
          {tokens.map((token, i) => (
            <div key={i} className="wb-token-card">
              <div className="wb-token-header">
                <div className="wb-token-project">{token.project}</div>
                <span className="wb-token-sym">{token.token}</span>
              </div>

              <div className="wb-token-tags">
                <span className="wb-token-chain">{token.chain}</span>
                <span className="wb-token-cat">{token.category}</span>
                <span className={`wb-token-risk ${riskColors[token.risk]}`}>
                  {token.risk} Risk
                </span>
              </div>

              <p className="wb-token-utility">{token.utility}</p>

              <div className="wb-token-meta-grid">
                <div className="wb-token-meta-item">
                  <span className="wb-tm-label">Launch Type</span>
                  <span className="wb-tm-value">{token.launchType}</span>
                </div>
                <div className="wb-token-meta-item">
                  <span className="wb-tm-label">Launch Date</span>
                  <span className="wb-tm-value">{token.launchDate}</span>
                </div>
                <div className="wb-token-meta-item">
                  <span className="wb-tm-label">Funding</span>
                  <span className="wb-tm-value">{token.funding}</span>
                </div>
                <div className="wb-token-meta-item">
                  <span className="wb-tm-label">Market Cap</span>
                  <span className="wb-tm-value wb-tm-highlight">{token.marketCap}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="wb-disclaimer">
          Token data is for informational purposes only. Not financial advice.
          Mock data shown — live API integration coming soon.
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
