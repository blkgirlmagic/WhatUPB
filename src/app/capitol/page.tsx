import MainNav from "@/components/main-nav";
import { DiagonalLines } from "@/components/diagonal-lines";
import Link from "next/link";
import { getDisclosures, getDisclosureStats } from "@/lib/capitol";
import type { AssetType } from "@/types/capitol";

export const metadata = {
  title: "Capitol — WhatUPB | Government Financial Disclosures",
  description:
    "Track congressional financial disclosures: stocks, ETFs, options and crypto reported by government officials.",
};

// Revalidate every 6 hours so the page reflects new ingestion runs
// without requiring a full redeploy.
export const revalidate = 21600;

// ── Filter config ─────────────────────────────────────────────────────────────

const ASSET_FILTERS: Array<{ label: string; value: string }> = [
  { label: "All", value: "All" },
  { label: "Stocks", value: "Stock" },
  { label: "ETFs", value: "ETF" },
  { label: "Options", value: "Options" },
  { label: "Crypto", value: "Crypto" },
  { label: "Bonds", value: "Bond" },
  { label: "Other", value: "Other" },
];

// ── Type helpers ──────────────────────────────────────────────────────────────

function badgeClass(assetType: string): string {
  const map: Record<string, string> = {
    Stock: "type-stock",
    ETF: "type-etf",
    Options: "type-options",
    Crypto: "type-crypto",
    Bond: "type-bond",
    Other: "type-other",
  };
  return `wb-type-badge ${map[assetType] ?? "type-other"}`;
}

function txClass(transactionType: string): string {
  const isBuy = transactionType === "Purchase";
  return `wb-tx-badge ${isBuy ? "tx-buy" : "tx-sell"}`;
}

function formatDate(iso: string): string {
  const d = new Date(iso + "T00:00:00Z");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

function formatDelay(days: number): string {
  return `${days} day${days !== 1 ? "s" : ""}`;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function CapitolPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; q?: string; page?: string }>;
}) {
  const params = await searchParams;

  // Validate type param — only accept known asset types
  const rawType = params.type ?? "All";
  const validTypes = ASSET_FILTERS.map((f) => f.value);
  const assetType = validTypes.includes(rawType)
    ? (rawType as AssetType | "All")
    : "All";

  const search = params.q?.trim() ?? "";
  const page = Math.max(1, parseInt(params.page ?? "1", 10) || 1);

  // Fetch real records from Supabase
  const [disclosures, stats] = await Promise.all([
    getDisclosures({ assetType, search, page, limit: 50 }),
    getDisclosureStats(),
  ]);

  const hasRecords = disclosures.length > 0 || stats.total > 0;
  const isFiltered = assetType !== "All" || search.length > 0;

  // Build updated-at label from latest disclosure_date
  const latestDate =
    disclosures.length > 0
      ? formatDate(disclosures[0].disclosure_date)
      : null;

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
            Congressional Periodic Transaction Reports — stocks, ETFs, options,
            and crypto. Sourced directly from required government filings.
          </p>
          <div className="wb-page-meta">
            {latestDate && (
              <span className="wb-meta-chip">Latest: {latestDate}</span>
            )}
            {stats.total > 0 && (
              <span className="wb-meta-chip">{stats.total.toLocaleString()} total records</span>
            )}
            <span className="wb-meta-chip">
              Source: U.S. House of Representatives
            </span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="wb-content">

        {/* Filters — functional via URL search params */}
        <div className="wb-filters">
          {ASSET_FILTERS.map((f) => {
            const isActive = assetType === f.value;
            const href = buildFilterHref(f.value, search);
            return (
              <Link
                key={f.value}
                href={href}
                className={`wb-filter-btn${isActive ? " active" : ""}`}
              >
                {f.label}
              </Link>
            );
          })}
          <div className="wb-filter-spacer" />
          <form method="GET" action="/capitol" className="wb-search-wrap">
            {assetType !== "All" && (
              <input type="hidden" name="type" value={assetType} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search official or asset…"
              className="wb-search"
            />
          </form>
        </div>

        {/* Stats bar — only when real data exists */}
        {stats.total > 0 && (
          <div className="wb-stat-bar">
            <div className="wb-stat-item">
              <span className="wb-stat-n">{stats.thisWeek}</span>
              <span className="wb-stat-l">This week</span>
            </div>
            <div className="wb-stat-div" />
            <div className="wb-stat-item">
              <span className="wb-stat-n">{stats.cryptoTrades}</span>
              <span className="wb-stat-l">Crypto trades</span>
            </div>
            <div className="wb-stat-div" />
            <div className="wb-stat-item">
              <span className="wb-stat-n">{stats.byAssetType["Stock"] ?? 0}</span>
              <span className="wb-stat-l">Stock trades</span>
            </div>
            <div className="wb-stat-div" />
            <div className="wb-stat-item">
              <span className="wb-stat-n">
                {stats.avgDelayDays !== null
                  ? `${stats.avgDelayDays}d`
                  : "—"}
              </span>
              <span className="wb-stat-l">Avg. delay</span>
            </div>
          </div>
        )}

        {/* Empty state — truthful, never falls back to mock data */}
        {!hasRecords && (
          <div className="wb-empty-state">
            {isFiltered ? (
              <>
                <p className="wb-empty-title">No disclosures match this filter.</p>
                <p className="wb-empty-sub">
                  Try clearing the filter or searching by official name or asset.
                </p>
                <Link href="/capitol" className="wb-btn-ghost">
                  Clear filters
                </Link>
              </>
            ) : (
              <>
                <p className="wb-empty-title">
                  House PTR data is being ingested.
                </p>
                <p className="wb-empty-sub">
                  Congressional financial disclosures will appear here once the
                  first ingestion run completes. Data is sourced directly from
                  the U.S. House of Representatives Office of the Clerk.
                </p>
              </>
            )}
          </div>
        )}

        {/* Filtered empty state (has data globally, but not for this filter) */}
        {hasRecords && disclosures.length === 0 && isFiltered && (
          <div className="wb-empty-state">
            <p className="wb-empty-title">No disclosures match this filter.</p>
            <p className="wb-empty-sub">
              {search
                ? `No results for "${search}" in this category.`
                : `No ${assetType} disclosures in the current dataset.`}
            </p>
            <Link href="/capitol" className="wb-btn-ghost">
              Clear filters
            </Link>
          </div>
        )}

        {/* Table */}
        {disclosures.length > 0 && (
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
                  <th>Filing</th>
                </tr>
              </thead>
              <tbody>
                {disclosures.map((row) => (
                  <tr key={row.id} className="wb-table-row">
                    <td className="wb-td-official">
                      {row.official}
                      {row.filer_office && (
                        <span className="wb-td-office"> · {row.filer_office}</span>
                      )}
                    </td>
                    <td className="wb-td-asset">
                      {row.asset_description}
                      {row.ticker && (
                        <span className="wb-td-ticker"> ({row.ticker})</span>
                      )}
                    </td>
                    <td>
                      <span className={badgeClass(row.asset_type)}>
                        {row.asset_type}
                      </span>
                    </td>
                    <td>
                      <span className={txClass(row.transaction_type)}>
                        {row.transaction_type}
                      </span>
                    </td>
                    <td className="wb-td-amount">{row.amount_label}</td>
                    <td className="wb-td-date">{formatDate(row.trade_date)}</td>
                    <td className="wb-td-date">{formatDate(row.disclosure_date)}</td>
                    <td className="wb-td-delay">{formatDelay(row.delay_days)}</td>
                    <td className="wb-td-source">
                      <a
                        href={row.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="wb-source-link"
                        title="View official filing (PDF)"
                      >
                        PTR ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {disclosures.length === 50 && (
          <div className="wb-pagination">
            {page > 1 && (
              <Link
                href={buildPageHref(page - 1, assetType, search)}
                className="wb-page-btn"
              >
                ← Previous
              </Link>
            )}
            <span className="wb-page-indicator">Page {page}</span>
            <Link
              href={buildPageHref(page + 1, assetType, search)}
              className="wb-page-btn"
            >
              Next →
            </Link>
          </div>
        )}

        <p className="wb-disclaimer">
          All data is sourced from the{" "}
          <a
            href="https://disclosures-clerk.house.gov/FinancialDisclosure"
            target="_blank"
            rel="noopener noreferrer"
          >
            U.S. House of Representatives Office of the Clerk
          </a>{" "}
          pursuant to the STOCK Act (5 U.S.C. App. § 103(l)). For
          informational purposes only. Not investment advice.
        </p>
      </div>

      {/* Footer */}
      <footer className="wb-footer wb-footer-slim">
        <div className="wb-footer-bottom">
          <span>© 2026 WhatUPB</span>
          <Link href="/" className="wb-footer-home">
            ← Home
          </Link>
        </div>
      </footer>
    </div>
  );
}

// ── URL helpers ───────────────────────────────────────────────────────────────

function buildFilterHref(type: string, search: string): string {
  const params = new URLSearchParams();
  if (type !== "All") params.set("type", type);
  if (search) params.set("q", search);
  const qs = params.toString();
  return `/capitol${qs ? `?${qs}` : ""}`;
}

function buildPageHref(
  page: number,
  type: string,
  search: string
): string {
  const params = new URLSearchParams();
  if (type !== "All") params.set("type", type);
  if (search) params.set("q", search);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return `/capitol${qs ? `?${qs}` : ""}`;
}
