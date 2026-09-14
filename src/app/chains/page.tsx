import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "Chains — WhatUPB | Blockchain Network Activity",
  description:
    "Live blockchain metrics for Ethereum, Solana, Bitcoin, Base, Arbitrum, Optimism, and BNB Chain.",
};

const chains = [
  {
    name: "Ethereum",
    symbol: "ETH",
    color: "#627EEA",
    fees: "$4.2M",
    feesChange: "+14%",
    feesUp: true,
    dexVolume: "$1.8B",
    dexVolumeChange: "+26%",
    dexVolumeUp: true,
    tvl: "$48.2B",
    tvlChange: "+3%",
    tvlUp: true,
    stableActivity: "$12.4B",
    stableChange: "+11%",
    stableUp: true,
    transactions: "1.2M/day",
    txChange: "+8%",
    txUp: true,
  },
  {
    name: "Solana",
    symbol: "SOL",
    color: "#9945FF",
    fees: "$890K",
    feesChange: "+31%",
    feesUp: true,
    dexVolume: "$3.1B",
    dexVolumeChange: "+18%",
    dexVolumeUp: true,
    tvl: "$6.8B",
    tvlChange: "+7%",
    tvlUp: true,
    stableActivity: "$4.2B",
    stableChange: "+22%",
    stableUp: true,
    transactions: "48M/day",
    txChange: "+12%",
    txUp: true,
  },
  {
    name: "Bitcoin",
    symbol: "BTC",
    color: "#F7931A",
    fees: "$1.1M",
    feesChange: "+5%",
    feesUp: true,
    dexVolume: "$280M",
    dexVolumeChange: "+9%",
    dexVolumeUp: true,
    tvl: "$1.2B",
    tvlChange: "+2%",
    tvlUp: true,
    stableActivity: "N/A",
    stableChange: "—",
    stableUp: null,
    transactions: "420K/day",
    txChange: "+3%",
    txUp: true,
  },
  {
    name: "Base",
    symbol: "BASE",
    color: "#0052FF",
    fees: "$340K",
    feesChange: "+42%",
    feesUp: true,
    dexVolume: "$620M",
    dexVolumeChange: "+31%",
    dexVolumeUp: true,
    tvl: "$3.1B",
    tvlChange: "+18%",
    tvlUp: true,
    stableActivity: "$2.8B",
    stableChange: "+24%",
    stableUp: true,
    transactions: "2.4M/day",
    txChange: "+22%",
    txUp: true,
  },
  {
    name: "Arbitrum",
    symbol: "ARB",
    color: "#28A0F0",
    fees: "$280K",
    feesChange: "+8%",
    feesUp: true,
    dexVolume: "$480M",
    dexVolumeChange: "+12%",
    dexVolumeUp: true,
    tvl: "$4.2B",
    tvlChange: "+5%",
    tvlUp: true,
    stableActivity: "$3.1B",
    stableChange: "+9%",
    stableUp: true,
    transactions: "1.8M/day",
    txChange: "+6%",
    txUp: true,
  },
  {
    name: "Optimism",
    symbol: "OP",
    color: "#FF0420",
    fees: "$120K",
    feesChange: "−4%",
    feesUp: false,
    dexVolume: "$210M",
    dexVolumeChange: "+2%",
    dexVolumeUp: true,
    tvl: "$1.8B",
    tvlChange: "−2%",
    tvlUp: false,
    stableActivity: "$1.4B",
    stableChange: "+1%",
    stableUp: true,
    transactions: "920K/day",
    txChange: "−3%",
    txUp: false,
  },
  {
    name: "BNB Chain",
    symbol: "BNB",
    color: "#F0B90B",
    fees: "$410K",
    feesChange: "+6%",
    feesUp: true,
    dexVolume: "$840M",
    dexVolumeChange: "+9%",
    dexVolumeUp: true,
    tvl: "$5.8B",
    tvlChange: "+4%",
    tvlUp: true,
    stableActivity: "$6.2B",
    stableChange: "+7%",
    stableUp: true,
    transactions: "4.2M/day",
    txChange: "+5%",
    txUp: true,
  },
];

export default function ChainsPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">Chains</div>
          <h1 className="wb-page-title">Blockchain Network Activity</h1>
          <p className="wb-page-sub">
            Key metrics across major blockchain networks — fees, DEX volume,
            TVL, stablecoin flows, and transaction counts.
          </p>
          <div className="wb-page-meta">
            <span className="wb-meta-chip">Updated Sep 14, 2026</span>
            <span className="wb-meta-chip">7 chains tracked</span>
            <span className="wb-meta-chip wb-chip-note">
              Mock data · API connection coming soon
            </span>
          </div>
        </div>
      </div>

      <div className="wb-content">
        {/* Chain cards grid */}
        <div className="wb-chains-grid">
          {chains.map((chain) => (
            <div key={chain.name} className="wb-chain-card">
              <div className="wb-chain-header">
                <div
                  className="wb-chain-dot"
                  style={{ background: chain.color }}
                />
                <div className="wb-chain-name-wrap">
                  <span className="wb-chain-name">{chain.name}</span>
                  <span className="wb-chain-sym">{chain.symbol}</span>
                </div>
                <button className="wb-chain-detail-btn">Detail →</button>
              </div>

              <div className="wb-chain-metrics">
                <div className="wb-chain-metric">
                  <span className="wb-cm-label">Fees (24h)</span>
                  <span className="wb-cm-value">{chain.fees}</span>
                  <span className={`wb-cm-change ${chain.feesUp ? "up" : "down"}`}>
                    {chain.feesChange}
                  </span>
                </div>
                <div className="wb-chain-metric">
                  <span className="wb-cm-label">DEX Volume</span>
                  <span className="wb-cm-value">{chain.dexVolume}</span>
                  <span className={`wb-cm-change ${chain.dexVolumeUp ? "up" : "down"}`}>
                    {chain.dexVolumeChange}
                  </span>
                </div>
                <div className="wb-chain-metric">
                  <span className="wb-cm-label">TVL</span>
                  <span className="wb-cm-value">{chain.tvl}</span>
                  <span className={`wb-cm-change ${chain.tvlUp ? "up" : "down"}`}>
                    {chain.tvlChange}
                  </span>
                </div>
                <div className="wb-chain-metric">
                  <span className="wb-cm-label">Stablecoin</span>
                  <span className="wb-cm-value">{chain.stableActivity}</span>
                  <span className={`wb-cm-change ${chain.stableUp ? "up" : chain.stableUp === false ? "down" : "neutral"}`}>
                    {chain.stableChange}
                  </span>
                </div>
                <div className="wb-chain-metric">
                  <span className="wb-cm-label">Transactions</span>
                  <span className="wb-cm-value">{chain.transactions}</span>
                  <span className={`wb-cm-change ${chain.txUp ? "up" : "down"}`}>
                    {chain.txChange}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="wb-disclaimer">
          Blockchain metrics are aggregated from public on-chain data sources.
          For informational purposes only. Mock data shown — live API integration
          coming soon.
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
