import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";

export const metadata = {
  title: "Policy — WhatUPB | Crypto Regulation Tracker",
  description:
    "Track the CLARITY Act, SEC and CFTC rulemaking, DeFi regulation, stablecoins and digital asset legislation.",
};

const clarityStatus = {
  status: "In Progress",
  lastChange: "Sep 12, 2026 — Amendment added in House Committee",
  houseStatus: "Committee Review",
  senateStatus: "Awaiting Referral",
};

const clarityItems = [
  {
    area: "SEC",
    label: "Securities Classification",
    status: "Under Review",
    statusType: "review",
    detail:
      "Definition of digital asset securities vs. commodities under active negotiation.",
  },
  {
    area: "CFTC",
    label: "Commodity Oversight",
    status: "Supported",
    statusType: "positive",
    detail:
      "CFTC granted expanded jurisdiction over Bitcoin, Ethereum, and digital commodities.",
  },
  {
    area: "DeFi",
    label: "Decentralized Protocol Rules",
    status: "Contested",
    statusType: "negative",
    detail:
      "Debate over whether DeFi protocols constitute brokers under existing law.",
  },
  {
    area: "Stablecoins",
    label: "Stablecoin Framework",
    status: "Advancing",
    statusType: "positive",
    detail:
      "Separate stablecoin legislation moving in parallel. Reserve requirements under discussion.",
  },
  {
    area: "Digital Commodities",
    label: "Commodity Definition",
    status: "Agreed",
    statusType: "positive",
    detail:
      "BTC and ETH formally classified as digital commodities in current draft.",
  },
  {
    area: "Government Ethics",
    label: "Official Crypto Holdings",
    status: "Proposed",
    statusType: "neutral",
    detail:
      "Proposed amendment to require expedited disclosure of crypto transactions by federal officials.",
  },
];

const policyUpdates = [
  {
    date: "Sep 12, 2026",
    agency: "House Financial Services",
    headline: "CLARITY Act amendment added strengthening stablecoin reserve requirements",
    type: "legislation",
  },
  {
    date: "Sep 10, 2026",
    agency: "SEC",
    headline: "SEC extends comment period on digital asset exchange registration rules by 30 days",
    type: "rulemaking",
  },
  {
    date: "Sep 8, 2026",
    agency: "CFTC",
    headline: "CFTC Chair testifies on expanded oversight framework for crypto derivatives",
    type: "testimony",
  },
  {
    date: "Sep 5, 2026",
    agency: "Treasury",
    headline: "Treasury issues guidance on crypto tax reporting for digital asset brokers",
    type: "guidance",
  },
  {
    date: "Sep 3, 2026",
    agency: "Senate Banking",
    headline: "Senate Banking Committee schedules hearing on DeFi protocol oversight",
    type: "hearing",
  },
  {
    date: "Aug 30, 2026",
    agency: "FinCEN",
    headline: "FinCEN proposes updated AML rules for non-custodial wallets",
    type: "rulemaking",
  },
];

export default function PolicyPage() {
  return (
    <div className="wb-page">
      <div className="bloom" />
      <DiagonalLines />
      <MainNav />

      {/* Page header */}
      <div className="wb-page-header">
        <div className="wb-page-header-inner">
          <div className="wb-page-tag">Policy</div>
          <h1 className="wb-page-title">Crypto Policy & Regulation</h1>
          <p className="wb-page-sub">
            The CLARITY Act, SEC and CFTC rulemaking, DeFi frameworks, stablecoin
            legislation, and digital asset regulation — tracked as it develops.
          </p>
          <div className="wb-page-meta">
            <span className="wb-meta-chip">Updated Sep 14, 2026</span>
            <span className="wb-meta-chip wb-chip-note">
              Mock data · API connection coming soon
            </span>
          </div>
        </div>
      </div>

      <div className="wb-content">
        {/* CLARITY Act tracker */}
        <div className="wb-tracker-header">
          <div className="wb-tracker-title-row">
            <h2 className="wb-tracker-title">CLARITY Act Tracker</h2>
            <span className="wb-status-badge status-progress">
              {clarityStatus.status}
            </span>
          </div>
          <p className="wb-tracker-last-change">
            Last change: {clarityStatus.lastChange}
          </p>
          <div className="wb-chamber-row">
            <div className="wb-chamber-card">
              <span className="wb-chamber-label">House</span>
              <span className="wb-chamber-status">{clarityStatus.houseStatus}</span>
            </div>
            <div className="wb-chamber-div">→</div>
            <div className="wb-chamber-card">
              <span className="wb-chamber-label">Senate</span>
              <span className="wb-chamber-status">{clarityStatus.senateStatus}</span>
            </div>
            <div className="wb-chamber-div">→</div>
            <div className="wb-chamber-card wb-chamber-inactive">
              <span className="wb-chamber-label">President</span>
              <span className="wb-chamber-status">Pending</span>
            </div>
          </div>
        </div>

        {/* CLARITY breakdown grid */}
        <div className="wb-policy-grid">
          {clarityItems.map((item, i) => (
            <div key={i} className={`wb-policy-card policy-${item.statusType}`}>
              <div className="wb-policy-area">{item.area}</div>
              <div className="wb-policy-item-label">{item.label}</div>
              <span className={`wb-policy-status pstatus-${item.statusType}`}>
                {item.status}
              </span>
              <p className="wb-policy-detail">{item.detail}</p>
            </div>
          ))}
        </div>

        {/* Latest updates */}
        <div className="wb-section-divider">
          <h2 className="wb-section-h2">Latest Policy Updates</h2>
        </div>
        <div className="wb-updates-list">
          {policyUpdates.map((update, i) => (
            <div key={i} className="wb-update-item">
              <div className="wb-update-left">
                <span className="wb-update-date">{update.date}</span>
                <span className={`wb-update-type utype-${update.type}`}>
                  {update.type}
                </span>
              </div>
              <div className="wb-update-right">
                <span className="wb-update-agency">{update.agency}</span>
                <p className="wb-update-headline">{update.headline}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="wb-disclaimer">
          All policy information is based on publicly available legislative and
          regulatory sources. For informational purposes only. Mock data shown —
          live API integration coming soon.
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
