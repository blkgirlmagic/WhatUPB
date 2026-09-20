import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import PolicyFeed from "./policy-feed";
import type { PolicyFeedRow } from "./actions";

export const dynamic = "force-dynamic";

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

const PAGE_SIZE = 20;

/** Format ISO date string "YYYY-MM-DD" → "Sep 12, 2026" without timezone shift. */
function formatEventDate(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function PolicyPage() {
  const supabase = await createClient();

  const { data: rows, error } = await supabase
    .from("policy_events")
    .select("external_id, agency, headline, event_type, event_date, source_url")
    .order("event_date", { ascending: false })
    .order("external_id", { ascending: false })
    .limit(PAGE_SIZE);

  if (error) {
    console.error("[policy] policy_events query failed:", error.message);
  }

  const policyFeed: PolicyFeedRow[] = (rows ?? []) as PolicyFeedRow[];
  const initialHasMore = policyFeed.length === PAGE_SIZE;
  const newestDate =
    policyFeed.length > 0 ? formatEventDate(policyFeed[0].event_date) : null;

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
            {newestDate && (
              <span className="wb-meta-chip">Updated {newestDate}</span>
            )}
            <span className="wb-meta-chip wb-chip-note">
              CLARITY tracker — static reference
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

        <PolicyFeed initialRows={policyFeed} initialHasMore={initialHasMore} />

        <p className="wb-disclaimer" style={{ marginTop: "2rem" }}>
          All policy information is based on publicly available legislative and
          regulatory sources. For informational purposes only.
          {newestDate && (
            <> Latest Federal Register data as of {newestDate}.</>
          )}
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
