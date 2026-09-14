import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "Capitol — WhatUPB | Government Financial Disclosures",
  description:
    "Track congressional financial disclosures: stocks, ETFs, options and crypto reported by government officials.",
};

const disclosures = [
  {
    official: "Sen. J. Williams",
    asset: "Coinbase Global (COIN)",
    assetType: "Stock",
    transaction: "Purchase",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 8, 2026",
    disclosureDate: "Sep 12, 2026",
    delay: "4 days",
  },
  {
    official: "Rep. M. Torres",
    asset: "iShares Bitcoin ETF (IBIT)",
    assetType: "ETF",
    transaction: "Purchase",
    amount: "$15,001 – $50,000",
    tradeDate: "Sep 5, 2026",
    disclosureDate: "Sep 11, 2026",
    delay: "6 days",
  },
  {
    official: "Sen. K. Patel",
    asset: "Ethereum (ETH)",
    assetType: "Crypto",
    transaction: "Sale",
    amount: "$50,001 – $100,000",
    tradeDate: "Aug 30, 2026",
    disclosureDate: "Sep 10, 2026",
    delay: "11 days",
  },
  {
    official: "Rep. D. Chen",
    asset: "NVIDIA (NVDA) Call Option",
    assetType: "Options",
    transaction: "Purchase",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 3, 2026",
    disclosureDate: "Sep 10, 2026",
    delay: "7 days",
  },
  {
    official: "Sen. A. Brooks",
    asset: "Solana (SOL)",
    assetType: "Crypto",
    transaction: "Purchase",
    amount: "$15,001 – $50,000",
    tradeDate: "Sep 7, 2026",
    disclosureDate: "Sep 13, 2026",
    delay: "6 days",
  },
  {
    official: "Rep. L. Harris",
    asset: "MicroStrategy (MSTR)",
    assetType: "Stock",
    transaction: "Sale (Full)",
    amount: "$100,001 – $250,000",
    tradeDate: "Aug 28, 2026",
    disclosureDate: "Sep 9, 2026",
    delay: "12 days",
  },
  {
    official: "Sen. B. Nguyen",
    asset: "ARK Innovation ETF (ARKK)",
    assetType: "ETF",
    transaction: "Purchase",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 9, 2026",
    disclosureDate: "Sep 14, 2026",
    delay: "5 days",
  },
  {
    official: "Rep. S. Okonkwo",
    asset: "Bitcoin (BTC)",
    assetType: "Crypto",
    transaction: "Purchase",
    amount: "$15,001 – $50,000",
    tradeDate: "Sep 6, 2026",
    disclosureDate: "Sep 12, 2026",
    delay: "6 days",
  },
  {
    official: "Sen. R. Alvarez",
    asset: "Ripple (XRP)",
    assetType: "Crypto",
    transaction: "Sale",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 4, 2026",
    disclosureDate: "Sep 11, 2026",
    delay: "7 days",
  },
  {
    official: "Rep. T. Morrison",
    asset: "Fidelity Crypto ETF (FBTC)",
    assetType: "ETF",
    transaction: "Purchase",
    amount: "$50,001 – $100,000",
    tradeDate: "Sep 1, 2026",
    disclosureDate: "Sep 10, 2026",
    delay: "9 days",
  },
  {
    official: "Sen. C. Park",
    asset: "Amazon (AMZN) Put Option",
    assetType: "Options",
    transaction: "Purchase",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 8, 2026",
    disclosureDate: "Sep 13, 2026",
    delay: "5 days",
  },
  {
    official: "Rep. M. Osei",
    asset: "Chainlink (LINK)",
    assetType: "Crypto",
    transaction: "Purchase",
    amount: "$1,001 – $15,000",
    tradeDate: "Sep 10, 2026",
    disclosureDate: "Sep 14, 2026",
    delay: "4 days",
  },
];

const filters = ["All", "Stocks", "ETFs", "Options", "Crypto"];

export default function CapitolPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      {/* Page header */}
      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">Capitol</div>
          <h1 className="wb-page-title">Government Financial Disclosures</h1>
          <p className="wb-page-sub">
            Congressional and federal financial disclosures — stocks, ETFs,
            options, and crypto. Sourced from required government filings.
          </p>
          <div className="wb-page-meta">
            <span className="wb-meta-chip">Updated Sep 14, 2026</span>
            <span className="wb-meta-chip">12 new this week</span>
            <span className="wb-meta-chip wb-chip-note">
              Mock data · API connection coming soon
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
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
          <div className="wb-filter-spacer" />
          <div className="wb-search-wrap">
            <input
              type="text"
              placeholder="Search official or asset…"
              className="wb-search"
              readOnly
            />
          </div>
        </div>

        {/* Stats bar */}
        <div className="wb-stat-bar">
          <div className="wb-stat-item">
            <span className="wb-stat-n">12</span>
            <span className="wb-stat-l">This week</span>
          </div>
          <div className="wb-stat-div" />
          <div className="wb-stat-item">
            <span className="wb-stat-n">5</span>
            <span className="wb-stat-l">Crypto trades</span>
          </div>
          <div className="wb-stat-div" />
          <div className="wb-stat-item">
            <span className="wb-stat-n">3</span>
            <span className="wb-stat-l">ETF purchases</span>
          </div>
          <div className="wb-stat-div" />
          <div className="wb-stat-item">
            <span className="wb-stat-n">6.4 days</span>
            <span className="wb-stat-l">Avg. delay</span>
          </div>
        </div>

        {/* Table */}
        <div className="wb-table-wrap">
          <table className="wb-table">
            <thead>
              <tr>
                <th>Official</th>
                <th>Asset</th>
                <th>Type</th>
                <th>Transaction</th>
                <th>Amount Range</th>
                <th>Trade Date</th>
                <th>Disclosed</th>
                <th>Delay</th>
              </tr>
            </thead>
            <tbody>
              {disclosures.map((row, i) => (
                <tr key={i} className="wb-table-row">
                  <td className="wb-td-official">{row.official}</td>
                  <td className="wb-td-asset">{row.asset}</td>
                  <td>
                    <span className={`wb-type-badge type-${row.assetType.toLowerCase().replace(" ", "-")}`}>
                      {row.assetType}
                    </span>
                  </td>
                  <td>
                    <span className={`wb-tx-badge ${row.transaction.startsWith("Purchase") ? "tx-buy" : "tx-sell"}`}>
                      {row.transaction}
                    </span>
                  </td>
                  <td className="wb-td-amount">{row.amount}</td>
                  <td className="wb-td-date">{row.tradeDate}</td>
                  <td className="wb-td-date">{row.disclosureDate}</td>
                  <td className="wb-td-delay">{row.delay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="wb-disclaimer">
          All data is sourced from publicly available government filings. This
          is for informational purposes only and does not constitute investment
          advice. Mock data shown — live API integration coming soon.
        </p>
      </div>

      {/* Footer */}
      <footer className="wb-footer wb-footer-slim">
        <div className="wb-footer-bottom">
          <span>© 2025 WhatUPB</span>
          <Link href="/" className="wb-footer-home">
            ← Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
