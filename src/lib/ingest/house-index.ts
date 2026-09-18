/**
 * house-index.ts — Download and parse the House Clerk's annual FD index ZIP.
 *
 * Primary source:
 *   https://disclosures-clerk.house.gov/public_disc/financial-pdfs/{YEAR}FD.zip
 *
 * The ZIP contains a tab-separated text file named "{YEAR}FD.txt".
 * Each row represents one financial disclosure filing.
 * FilingType "P" = Periodic Transaction Report (PTR).
 *
 * Columns (tab-separated, with header row):
 *   Prefix | Last | First | Suffix | FilingType | StateDst | Year | FilingDate | DocID
 *
 * This module is SERVER-SIDE ONLY. It is never imported by client components.
 */

import AdmZip from "adm-zip";
import type { HouseIndexEntry } from "@/types/capitol";

const HOUSE_CLERK_BASE = "https://disclosures-clerk.house.gov/public_disc";

/**
 * Download the annual financial disclosure ZIP for the given year and return
 * all PTR index entries (FilingType === "P").
 *
 * @param year - e.g. 2026
 * @returns Array of PTR index entries, or throws on network/parse error.
 */
export async function fetchHousePtrIndex(year: number): Promise<HouseIndexEntry[]> {
  const zipUrl = `${HOUSE_CLERK_BASE}/financial-pdfs/${year}FD.zip`;

  console.log(`[House] Downloading index: ${zipUrl}`);
  const res = await fetch(zipUrl, {
    // No-cache ensures we always get the latest index (updated continuously)
    headers: { "Cache-Control": "no-cache" },
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(
      `[House] Failed to download index ZIP (HTTP ${res.status}): ${zipUrl}`
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const tsvContent = extractTsvFromZip(buffer, year);
  return parseFdTsv(tsvContent, year);
}

/**
 * Extract the TSV content from the in-memory ZIP buffer.
 * The text file inside is named "{year}FD.txt" (case-insensitive match).
 */
function extractTsvFromZip(buffer: Buffer, year: number): string {
  const zip = new AdmZip(buffer);
  const entries = zip.getEntries();

  const txtEntry = entries.find((e) =>
    e.name.toLowerCase() === `${year}fd.txt`
  );

  if (!txtEntry) {
    const names = entries.map((e) => e.name).join(", ");
    throw new Error(
      `[House] Expected "${year}FD.txt" not found in ZIP. Found: ${names}`
    );
  }

  return txtEntry.getData().toString("utf8");
}

/**
 * Parse the TSV and return PTR entries only (FilingType === "P").
 *
 * The file has a header row followed by data rows, tab-separated.
 * Known columns: Prefix | Last | First | Suffix | FilingType | StateDst | Year | FilingDate | DocID
 *
 * Column indices are resolved from the header row so the parser stays correct
 * if the House Clerk ever reorders columns.
 */
function parseFdTsv(tsv: string, year: number): HouseIndexEntry[] {
  const lines = tsv.split(/\r?\n/).filter((l) => l.trim().length > 0);

  if (lines.length < 2) {
    console.warn("[House] TSV file is empty or header-only.");
    return [];
  }

  // Resolve column indices from the header row
  const headers = lines[0].split("\t").map((h) => h.trim().toLowerCase());

  const idx = (name: string) => headers.indexOf(name.toLowerCase());

  const iPrefix     = idx("prefix");
  const iLast       = idx("last");
  const iFirst      = idx("first");
  const iSuffix     = idx("suffix");
  const iFilingType = idx("filingtype");
  const iStateDst   = idx("statedst");
  const iYear       = idx("year");
  const iFilingDate = idx("filingdate");
  const iDocId      = idx("docid");

  // Positional fallbacks match the known column order (0-indexed)
  // Prefix=0, Last=1, First=2, Suffix=3, FilingType=4, StateDst=5, Year=6, FilingDate=7, DocID=8
  const get = (fields: string[], colIdx: number, fallback: number): string =>
    String((colIdx !== -1 ? fields[colIdx] : fields[fallback]) ?? "").trim();

  if ([iLast, iFirst, iFilingType, iDocId].some((i) => i === -1)) {
    console.warn(
      "[House] TSV header did not match expected columns — using positional fallbacks. " +
      `Header was: ${lines[0]}`
    );
  }

  const ptrs: HouseIndexEntry[] = [];

  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split("\t");

    const filingType = get(fields, iFilingType, 4);
    if (filingType.toUpperCase() !== "P") continue;

    const docId = get(fields, iDocId, 8);
    if (!docId) {
      console.warn(`[House] Skipping TSV row ${i}: missing DocID.`);
      continue;
    }

    // FilingDate in the TSV is M/D/YYYY (not zero-padded).
    // parseMDY() in normalize.ts handles this format.
    ptrs.push({
      prefix:     get(fields, iPrefix, 0),
      last:       get(fields, iLast, 1),
      first:      get(fields, iFirst, 2),
      suffix:     get(fields, iSuffix, 3),
      filingType: "P",
      stateDst:   get(fields, iStateDst, 5),
      year:       get(fields, iYear, 6),
      filingDate: get(fields, iFilingDate, 7),
      docId,
    });
  }

  console.log(`[House] Found ${ptrs.length} PTR entries in index for ${year}.`);
  return ptrs;
}

/**
 * Build the source URL for a House PTR PDF.
 * The year in the URL is the filing year (may differ from trade year).
 */
export function housePtrPdfUrl(docId: string, filingYear: string | number): string {
  return `${HOUSE_CLERK_BASE}/ptr-pdfs/${filingYear}/${docId}.pdf`;
}

/**
 * Build a stable external_id for a House PTR record.
 * Prefixed with "house-" so Senate records can use "senate-" without collision.
 */
export function houseExternalId(docId: string): string {
  return `house-${docId}`;
}
