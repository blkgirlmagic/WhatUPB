// ── Capitol Disclosures — shared TypeScript types ────────────────────────────
// Mirrors the shape of public.capitol_disclosures in Supabase.
// Server-side query helpers live in src/lib/capitol.ts.

export type Chamber = "House" | "Senate";

/**
 * Normalized asset classification used by WhatUPB UI.
 * Classification must follow the underlying government filing.
 * ETF is only used when the filing clearly identifies an ETF.
 */
export type AssetType = "Stock" | "ETF" | "Options" | "Crypto" | "Bond" | "Other";

export type TransactionType =
  | "Purchase"
  | "Sale"
  | "Sale (Full)"
  | "Sale (Partial)"
  | "Exchange"
  | "Other";

// ── Database row shape (matches Supabase SELECT *) ───────────────────────────

export interface CapitolDisclosure {
  id: string;
  official: string;
  chamber: Chamber;
  filer_office: string | null;
  /** Exact asset text from the filing — never altered */
  asset_description: string;
  /** Raw asset type string from the filing — preserved verbatim */
  asset_type_raw: string | null;
  /** Normalized WhatUPB classification */
  asset_type: AssetType;
  transaction_type: string;
  ticker: string | null;
  owner: string | null;
  amount_min: number | null;
  amount_max: number | null;
  amount_label: string;
  trade_date: string;        // "YYYY-MM-DD"
  disclosure_date: string;   // "YYYY-MM-DD"
  /** disclosure_date - trade_date in calendar days */
  delay_days: number;
  source_agency: string;
  source_url: string;
  external_id: string;
  filing_year: number;
  created_at: string;
  updated_at: string;
}

// ── Query / filter options ────────────────────────────────────────────────────

export interface DisclosureFilters {
  assetType?: AssetType | "All";
  chamber?: Chamber | "All";
  search?: string;
  page?: number;
  limit?: number;
}

// ── Stats shape returned by getDisclosureStats() ─────────────────────────────

export interface DisclosureStats {
  total: number;
  thisWeek: number;
  cryptoTrades: number;
  avgDelayDays: number | null;
  byAssetType: Partial<Record<AssetType, number>>;
}

// ── Ingestion types (server-side only) ───────────────────────────────────────

/** One entry from the House Clerk's {YEAR}FD.xml index */
export interface HouseIndexEntry {
  last: string;
  first: string;
  prefix: string;
  suffix: string;
  filingType: string;     // "P" = PTR
  stateDst: string;       // e.g. "TX-01"
  year: string;
  filingDate: string;     // "MM/DD/YYYY"
  docId: string;
}

/** One transaction row extracted from a House PTR PDF */
export interface RawHouseTransaction {
  assetDescription: string;
  assetTypeRaw: string;
  transactionTypeRaw: string;
  notificationDate: string | null;  // "MM/DD/YYYY" — may be absent in paper filings
  transactionDate: string;          // "MM/DD/YYYY"
  amountRaw: string;
  owner: string | null;
  ticker: string | null;
  comment: string | null;
}

/** Result of a full ingest run */
export interface IngestResult {
  newRecords: number;
  skipped: number;
  parseFailures: number;
  failedDocIds: string[];
  durationMs: number;
}
