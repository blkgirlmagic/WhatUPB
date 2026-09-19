/**
 * Federal Register API client and normalizer for WhatUPB Policy pipeline.
 *
 * Official API: https://www.federalregister.gov/developers/documentation/api/v1
 * No API key required. Free public API.
 *
 * IMPORTANT: All headline and abstract values are taken verbatim from the API.
 * No editorial interpretations or invented summaries are ever added.
 */

import type { PolicyEvent, PolicyEventType, PolicyCategory } from "@/types/policy";

const FR_API_BASE = "https://www.federalregister.gov/api/v1/documents.json";

// Search terms covering the crypto / digital-asset regulatory space
const FR_SEARCH_TERMS = [
  "cryptocurrency",
  "digital asset",
  "stablecoin",
  "decentralized finance",
] as const;

// Fields we request from the FR API (minimises payload size)
const FR_FIELDS = [
  "document_number",
  "title",
  "abstract",
  "publication_date",
  "html_url",
  "document_type",
  "agency_names",
  "agencies",
].join(",");

/** Raw shape returned by the Federal Register documents endpoint */
interface FRDocument {
  document_number: string;
  title: string;
  abstract: string | null;
  publication_date: string; // "YYYY-MM-DD"
  html_url: string;
  document_type: string;
  agency_names: string[];
  agencies?: Array<{ slug: string; name: string }>;
}

interface FRApiResponse {
  count: number;
  total_pages: number;
  results: FRDocument[];
  next_page_url?: string;
}

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/** Map FR document_type → our PolicyEventType */
function mapEventType(documentType: string): PolicyEventType {
  const t = documentType.toLowerCase();
  if (t.includes("proposed rule") || t.includes("final rule") || t === "rule") {
    return "rulemaking";
  }
  if (t.includes("guidance") || t.includes("interpretation")) {
    return "guidance";
  }
  if (t.includes("sunshine") || t.includes("meeting") || t.includes("hearing")) {
    return "hearing";
  }
  if (t.includes("notice of inquiry") || t === "notice") {
    return "notice";
  }
  if (t.includes("order") || t.includes("enforcement")) {
    return "enforcement";
  }
  return "notice"; // safe default
}

/** Map agency names → short display name */
function mapAgencyName(agencyNames: string[]): string {
  const names = agencyNames.join(" ").toLowerCase();
  if (names.includes("securities and exchange")) return "SEC";
  if (names.includes("commodity futures")) return "CFTC";
  if (names.includes("financial crimes enforcement")) return "FinCEN";
  if (names.includes("treasury")) return "Treasury";
  return agencyNames[0] ?? "Other";
}

/** Assign category: topic-keyword first, then agency fallback */
function mapCategory(
  title: string,
  abstract: string | null,
  agencyDisplay: string
): PolicyCategory {
  const text = `${title} ${abstract ?? ""}`.toLowerCase();

  if (text.includes("stablecoin")) return "Stablecoin";
  if (
    text.includes("decentralized finance") ||
    text.includes("defi") ||
    text.includes("decentralized exchange")
  )
    return "DeFi";
  if (
    text.includes("digital commodity") ||
    text.includes("digital asset commodity")
  )
    return "Digital Commodity";

  // Agency fallback
  if (agencyDisplay === "SEC") return "SEC";
  if (agencyDisplay === "CFTC") return "CFTC";
  if (agencyDisplay === "FinCEN") return "FinCEN";
  if (agencyDisplay === "Treasury") return "Treasury";

  return "Other";
}

/** Normalise a raw FR document into a PolicyEvent row */
function normalizeDocument(doc: FRDocument): PolicyEvent {
  const agencyDisplay = mapAgencyName(doc.agency_names);
  const category = mapCategory(doc.title, doc.abstract, agencyDisplay);
  const eventType = mapEventType(doc.document_type);

  return {
    external_id: `fr-${doc.document_number}`,
    source: "federal_register",
    agency: agencyDisplay,
    headline: doc.title,           // verbatim from API
    abstract: doc.abstract ?? null, // verbatim from API, or null
    event_type: eventType,
    event_date: doc.publication_date,
    source_url: doc.html_url,
    category,
  };
}

// ---------------------------------------------------------------------------
// Fetcher
// ---------------------------------------------------------------------------

/** Fetch one page of FR documents for a given agency slug + search term */
async function fetchFRPage(
  term: string,
  page: number
): Promise<FRApiResponse> {
  const params = new URLSearchParams({
    "conditions[term]": term,
    fields: FR_FIELDS,
    per_page: "100",
    page: String(page),
    order: "newest",
  });

  const url = `${FR_API_BASE}?${params.toString()}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    // 20-second timeout via AbortController
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(
      `FR API error: ${res.status} ${res.statusText} — ${url}`
    );
  }

  return res.json() as Promise<FRApiResponse>;
}

// ---------------------------------------------------------------------------
// Public export
// ---------------------------------------------------------------------------

export interface FRFetchResult {
  events: PolicyEvent[];
  totalFetched: number;
  agencyTermPairs: number;
}

/**
 * Fetch all relevant documents from the Federal Register for all configured
 * search terms. No agency filter — agency is derived from agency_names in the
 * response via mapAgencyName(). Deduplicates by external_id within this batch.
 *
 * @param maxPagesPerPair  Cap pages fetched per search term. Default 3
 *                         (≤ 300 docs per term). Increase for initial backfill.
 */
export async function fetchFederalRegisterEvents(
  maxPagesPerPair = 3
): Promise<FRFetchResult> {
  const seen = new Set<string>();
  const events: PolicyEvent[] = [];
  let agencyTermPairs = 0;

  for (const term of FR_SEARCH_TERMS) {
    agencyTermPairs++;

    for (let page = 1; page <= maxPagesPerPair; page++) {
      let data: FRApiResponse;
      try {
        data = await fetchFRPage(term, page);
      } catch (err) {
        console.error(
          `FR fetch error — term="${term}" page=${page}:`,
          err
        );
        break; // skip remaining pages for this term on error
      }

      for (const doc of data.results) {
        const externalId = `fr-${doc.document_number}`;
        if (seen.has(externalId)) continue;
        seen.add(externalId);
        events.push(normalizeDocument(doc));
      }

      // Stop paging if we've reached the last page
      if (page >= data.total_pages || data.results.length === 0) break;

      // Small polite delay between pages
      await new Promise((r) => setTimeout(r, 300));
    }

    // Polite delay between terms
    await new Promise((r) => setTimeout(r, 200));
  }

  return { events, totalFetched: events.length, agencyTermPairs };
}
