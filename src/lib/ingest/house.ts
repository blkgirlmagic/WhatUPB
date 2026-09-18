/**
 * house.ts — House PTR ingestion orchestrator.
 *
 * Full flow:
 *   1. Download the House Clerk {YEAR}FD.zip index for the current year.
 *   2. Parse the XML to get all PTR entries (FilingType = "P").
 *   3. Query Supabase for which DocIDs are already in capitol_disclosures.
 *   4. For each new DocID, fetch and parse the PTR PDF.
 *   5. Normalize each raw transaction row.
 *   6. Upsert to Supabase using external_id as the conflict key.
 *
 * Deduplication: external_id is "house-{DocID}". The upsert uses
 * onConflict: "external_id" so repeated runs are idempotent.
 *
 * This module is SERVER-SIDE ONLY. Import only from API routes or
 * server actions, never from client components.
 */

import { createClient } from "@supabase/supabase-js";
import type { HouseIndexEntry, IngestResult, RawHouseTransaction } from "@/types/capitol";
import { fetchHousePtrIndex, housePtrPdfUrl, houseExternalId } from "./house-index";
import { fetchAndParsePtrPdf } from "./house-pdf";
import {
  normalizeAmount,
  normalizeAssetType,
  normalizeTransactionType,
  parseMDY,
  calcDelayDays,
  formatHouseOfficial,
} from "./normalize";

const SOURCE_AGENCY = "U.S. House of Representatives";

// Rate-limit: be respectful of the House Clerk server.
// 300 ms between PDF fetches is conservative but safe for a government server.
const FETCH_DELAY_MS = 300;

// Maximum PDFs to process in a single ingest run to stay within
// Vercel's function timeout (60s on Pro, 10s on Hobby).
// The index is checked regardless; only NEW DocIDs count toward this cap.
const MAX_NEW_PER_RUN = 20;

// ── Supabase client (service-role, server-only) ───────────────────────────────

function getIngestClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "[Ingest] Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY"
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

// ── Known DocIDs query ────────────────────────────────────────────────────────

/**
 * Return the set of external_ids already stored for House records.
 * Used to skip already-ingested DocIDs without fetching their PDFs again.
 */
async function fetchKnownHouseIds(
  supabase: ReturnType<typeof getIngestClient>
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("capitol_disclosures")
    .select("external_id")
    .eq("chamber", "House")
    .eq("source_agency", SOURCE_AGENCY);

  if (error) {
    console.error("[Ingest] Failed to query known House IDs:", error);
    return new Set();
  }

  return new Set((data ?? []).map((r: { external_id: string }) => r.external_id));
}

// ── Row builder ───────────────────────────────────────────────────────────────

/**
 * Build a Supabase insert row from one raw transaction and its index entry.
 * Returns null if any required field cannot be resolved.
 */
function buildRow(
  tx: RawHouseTransaction,
  entry: HouseIndexEntry,
  pdfUrl: string
): Record<string, unknown> | null {
  const tradeDateIso = parseMDY(tx.transactionDate);
  const disclosureDateIso = parseMDY(entry.filingDate);

  if (!tradeDateIso || !disclosureDateIso) {
    console.warn(
      `[Ingest] Cannot parse dates for DocID ${entry.docId}: ` +
      `trade="${tx.transactionDate}" disclosure="${entry.filingDate}"`
    );
    return null;
  }

  if (!tx.assetDescription.trim()) {
    console.warn(`[Ingest] Empty asset description for DocID ${entry.docId} — skipping row.`);
    return null;
  }

  const { min, max, label } = normalizeAmount(tx.amountRaw);
  const delayDays = calcDelayDays(tradeDateIso, disclosureDateIso);
  const assetType = normalizeAssetType(tx.assetTypeRaw, tx.assetDescription);
  const transactionType = normalizeTransactionType(tx.transactionTypeRaw);
  const official = formatHouseOfficial(
    entry.first,
    entry.last,
    entry.prefix,
    entry.suffix,
    entry.stateDst
  );

  return {
    official,
    chamber: "House",
    filer_office: entry.stateDst || null,
    asset_description: tx.assetDescription,
    asset_type_raw: tx.assetTypeRaw || null,
    asset_type: assetType,
    transaction_type: transactionType,
    ticker: tx.ticker || null,
    owner: tx.owner || null,
    amount_min: min,
    amount_max: max,
    amount_label: label,
    trade_date: tradeDateIso,
    disclosure_date: disclosureDateIso,
    delay_days: delayDays,
    source_agency: SOURCE_AGENCY,
    source_url: pdfUrl,
    external_id: houseExternalId(entry.docId),
    filing_year: parseInt(entry.year, 10) || new Date().getFullYear(),
  };
}

// ── Main ingest function ──────────────────────────────────────────────────────

/**
 * Run a full House PTR ingestion pass for the given year.
 * Defaults to the current calendar year.
 *
 * @returns IngestResult summary
 */
export async function ingestHousePtrs(year?: number): Promise<IngestResult> {
  const startMs = Date.now();
  const targetYear = year ?? new Date().getFullYear();
  const result: IngestResult = {
    newRecords: 0,
    skipped: 0,
    parseFailures: 0,
    failedDocIds: [],
    durationMs: 0,
  };

  const supabase = getIngestClient();

  // Step 1: Download and parse the index
  let allPtrs: HouseIndexEntry[];
  try {
    allPtrs = await fetchHousePtrIndex(targetYear);
  } catch (err) {
    console.error("[Ingest] Failed to download House index:", err);
    result.durationMs = Date.now() - startMs;
    return result;
  }

  console.log(`[Ingest] House index has ${allPtrs.length} PTR entries for ${targetYear}.`);

  // Step 2: Which DocIDs do we already have?
  const knownIds = await fetchKnownHouseIds(supabase);

  // Filter to new entries, then sort newest FilingDate first so each run
  // processes the most recently filed PTRs before older ones.
  const newEntries = allPtrs
    .filter((e) => !knownIds.has(houseExternalId(e.docId)))
    .sort((a, b) => new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime());

  console.log(
    `[Ingest] ${newEntries.length} new PTR(s) to process ` +
    `(${allPtrs.length - newEntries.length} already ingested).`
  );

  if (newEntries.length === 0) {
    result.skipped = allPtrs.length;
    result.durationMs = Date.now() - startMs;
    return result;
  }

  // Cap per-run to stay within function timeout — newest first
  const toProcess = newEntries.slice(0, MAX_NEW_PER_RUN);
  if (newEntries.length > MAX_NEW_PER_RUN) {
    console.log(
      `[Ingest] Capped at ${MAX_NEW_PER_RUN} per run. ` +
      `${newEntries.length - MAX_NEW_PER_RUN} will be processed on the next run.`
    );
  }

  // Step 3–6: Fetch, parse, normalize, upsert
  for (let i = 0; i < toProcess.length; i++) {
    const entry = toProcess[i];
    const pdfUrl = housePtrPdfUrl(entry.docId, entry.year || targetYear);

    if (i > 0) {
      // Rate-limit between PDF fetches
      await new Promise((r) => setTimeout(r, FETCH_DELAY_MS));
    }

    // Fetch and parse PDF
    const rawTransactions: RawHouseTransaction[] = await fetchAndParsePtrPdf(
      entry.docId,
      entry.year || targetYear
    );

    if (rawTransactions.length === 0) {
      result.parseFailures++;
      result.failedDocIds.push(entry.docId);
      continue;
    }

    // Build and upsert rows
    const rows: Record<string, unknown>[] = [];
    for (const tx of rawTransactions) {
      const row = buildRow(tx, entry, pdfUrl);
      if (row) rows.push(row);
    }

    if (rows.length === 0) {
      result.parseFailures++;
      result.failedDocIds.push(entry.docId);
      continue;
    }

    // For multi-transaction PTRs, append a sequence number to external_id
    // to keep each transaction's external_id unique.
    const rowsWithIds = rows.map((row, idx) => ({
      ...row,
      external_id:
        rows.length === 1
          ? row.external_id
          : `${row.external_id}-${idx + 1}`,
    }));

    const { error: upsertError } = await supabase
      .from("capitol_disclosures")
      .upsert(rowsWithIds, {
        onConflict: "external_id",
        ignoreDuplicates: true,
      });

    if (upsertError) {
      console.error(
        `[Ingest] Upsert failed for DocID ${entry.docId}:`,
        upsertError
      );
      result.parseFailures++;
      result.failedDocIds.push(entry.docId);
    } else {
      result.newRecords += rowsWithIds.length;
      console.log(
        `[Ingest] DocID ${entry.docId}: inserted ${rowsWithIds.length} record(s).`
      );
    }
  }

  result.skipped = allPtrs.length - toProcess.length;
  result.durationMs = Date.now() - startMs;

  console.log(
    `[Ingest] Done. new=${result.newRecords} failures=${result.parseFailures} ` +
    `skipped=${result.skipped} duration=${result.durationMs}ms`
  );

  return result;
}
