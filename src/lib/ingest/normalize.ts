/**
 * normalize.ts — Normalization utilities for Capitol disclosure ingestion.
 *
 * These functions translate raw text from government filings into the
 * structured fields stored in public.capitol_disclosures.
 *
 * Rules:
 * - asset_description: NEVER altered — store exactly as the filing reports it.
 * - asset_type_raw: store verbatim; asset_type is our normalized classification.
 * - ETF is only assigned when the asset type or description clearly identifies
 *   the instrument as an Exchange-Traded Fund. We do not guess.
 * - delay_days is calculated from dates only. "Late" determination is intentionally
 *   omitted: the legal deadline depends on notification date, not trade date alone.
 */

import type { AssetType, TransactionType } from "@/types/capitol";

// ── Amount ranges ─────────────────────────────────────────────────────────────

interface AmountRange {
  min: number | null;
  max: number | null;
  label: string;
}

/**
 * Standard House PTR amount brackets (in dollars, not cents).
 * The label is normalized to the "–" dash form WhatUPB uses for display.
 */
const AMOUNT_BRACKETS: Array<{ pattern: RegExp; min: number | null; max: number | null; label: string }> = [
  { pattern: /1[,.]?001.*15[,.]?000/,       min: 1001,       max: 15000,      label: "$1,001 – $15,000" },
  { pattern: /15[,.]?001.*50[,.]?000/,       min: 15001,      max: 50000,      label: "$15,001 – $50,000" },
  { pattern: /50[,.]?001.*100[,.]?000/,      min: 50001,      max: 100000,     label: "$50,001 – $100,000" },
  { pattern: /100[,.]?001.*250[,.]?000/,     min: 100001,     max: 250000,     label: "$100,001 – $250,000" },
  { pattern: /250[,.]?001.*500[,.]?000/,     min: 250001,     max: 500000,     label: "$250,001 – $500,000" },
  { pattern: /500[,.]?001.*1[,.]?000[,.]?000/, min: 500001,   max: 1000000,    label: "$500,001 – $1,000,000" },
  { pattern: /1[,.]?000[,.]?001.*5[,.]?000[,.]?000/, min: 1000001, max: 5000000, label: "$1,000,001 – $5,000,000" },
  { pattern: /5[,.]?000[,.]?001.*25[,.]?000[,.]?000/, min: 5000001, max: 25000000, label: "$5,000,001 – $25,000,000" },
  { pattern: /25[,.]?000[,.]?001.*50[,.]?000[,.]?000/, min: 25000001, max: 50000000, label: "$25,000,001 – $50,000,000" },
  { pattern: /over.*50[,.]?000[,.]?000/i,    min: 50000001,   max: null,       label: "Over $50,000,000" },
  { pattern: /over.*1[,.]?000[,.]?000/i,     min: 1000001,    max: null,       label: "Over $1,000,000" },
];

export function normalizeAmount(raw: string): AmountRange {
  const cleaned = raw.replace(/[$\s]/g, "");
  for (const bracket of AMOUNT_BRACKETS) {
    if (bracket.pattern.test(cleaned)) {
      return { min: bracket.min, max: bracket.max, label: bracket.label };
    }
  }
  // Fallback: preserve raw text as label, no numeric bounds
  return { min: null, max: null, label: raw.trim() };
}

// ── Asset type normalization ───────────────────────────────────────────────────

/**
 * ETF identifiers — conservative list of name patterns that unambiguously
 * indicate an Exchange-Traded Fund in the asset description.
 * Only add to this list if the identifier is never used for mutual funds.
 */
const ETF_DESCRIPTION_PATTERNS = [
  /\bETF\b/i,
  /iShares/i,
  /\bSPDR\b/i,
  /\bProShares\b/i,
  /\bInvesco\b/i,
  /\bVanEck\b/i,
  /\bGlobal X\b/i,
  /\bARK\b.*(ETF|Fund)/i,
  /\bVanguard\b.*(ETF)/i,
  // Well-known ETF tickers that are unambiguously ETFs
  /\b(SPY|QQQ|IWM|GLD|SLV|TLT|LQD|HYG|XLF|XLE|XLK|IBIT|FBTC|ARKK|ARKG|ARKW|ARKF|BLOK|BITQ)\b/,
];

/**
 * Crypto identifiers in asset descriptions.
 */
const CRYPTO_DESCRIPTION_PATTERNS = [
  /\bBitcoin\b/i,
  /\b\bEthereum\b/i,
  /\bSolana\b/i,
  /\bRipple\b|\bXRP\b/i,
  /\bLitecoin\b/i,
  /\bCardano\b/i,
  /\bPolkadot\b/i,
  /\bChainlink\b/i,
  /\bPolygon\b|\bMATIC\b/i,
  /\bAvalanche\b/i,
  /\bDogecoin\b/i,
  /\bUniswap\b/i,
  /\bStellar\b/i,
  /\bTron\b/i,
  /\bMonero\b/i,
  /\bNear\b Protocol/i,
  /Cryptocurrency|Digital Asset|Digital Currency/i,
];

/**
 * Map raw asset type text from a government filing to WhatUPB's normalized
 * AssetType. The asset description is also checked for disambiguation.
 *
 * Classification policy:
 * - "Stock" only when the filing says so or common stock codes appear.
 * - "ETF" only when unambiguously indicated by type text OR description pattern.
 * - "Crypto" when the filing says Digital Asset/Cryptocurrency OR description matches.
 * - "Options" when the filing says Options or Exchange-Listed Options.
 * - "Bond" for corporate bonds, government securities, munis, treasuries.
 * - "Other" for everything ambiguous (including mutual funds, private equity, etc.)
 */
export function normalizeAssetType(
  assetTypeRaw: string,
  assetDescription: string
): AssetType {
  const rawLower = assetTypeRaw.toLowerCase();
  const descLower = assetDescription.toLowerCase();

  // ── Crypto ──────────────────────────────────────────────────────────────────
  if (
    rawLower.includes("crypto") ||
    rawLower.includes("digital asset") ||
    rawLower.includes("digital currency") ||
    CRYPTO_DESCRIPTION_PATTERNS.some((p) => p.test(assetDescription))
  ) {
    return "Crypto";
  }

  // ── Options ─────────────────────────────────────────────────────────────────
  if (
    rawLower.includes("option") ||
    rawLower.includes("exchange-listed") ||
    descLower.includes("call option") ||
    descLower.includes("put option") ||
    descLower.includes(" call ") ||
    descLower.includes(" put ")
  ) {
    return "Options";
  }

  // ── Bonds ────────────────────────────────────────────────────────────────────
  if (
    rawLower.includes("bond") ||
    rawLower.includes("treasury") ||
    rawLower.includes("t-bill") ||
    rawLower.includes("government securit") ||
    rawLower.includes("municipal") ||
    rawLower.includes("muni")
  ) {
    return "Bond";
  }

  // ── ETF — only when unambiguously identified ─────────────────────────────────
  // Type text that explicitly says ETF (not combined with Mutual Fund)
  if (
    rawLower === "etf" ||
    rawLower === "exchange-traded fund" ||
    (rawLower.includes("etf") && !rawLower.includes("mutual fund"))
  ) {
    return "ETF";
  }
  // Type says "Investment Fund" — check description for ETF identifiers.
  // If no clear ETF signal, classify as Other (not ETF, not Mutual Fund).
  if (rawLower.includes("investment fund") || rawLower.includes("mutual fund")) {
    if (ETF_DESCRIPTION_PATTERNS.some((p) => p.test(assetDescription))) {
      return "ETF";
    }
    return "Other";
  }
  // Description clearly says ETF even if type field is vague
  if (ETF_DESCRIPTION_PATTERNS.some((p) => p.test(assetDescription))) {
    return "ETF";
  }

  // ── Stock ────────────────────────────────────────────────────────────────────
  if (
    rawLower === "stock" ||
    rawLower === "common stock" ||
    rawLower === "preferred stock" ||
    rawLower.includes("stock") ||
    rawLower === "st"
  ) {
    return "Stock";
  }

  // ── Fallback ─────────────────────────────────────────────────────────────────
  return "Other";
}

// ── Transaction type normalization ────────────────────────────────────────────

/**
 * Map raw transaction type strings from filings to a normalized label.
 * Preserves specificity (Sale vs Sale (Full) vs Sale (Partial)) where available.
 */
export function normalizeTransactionType(raw: string): string {
  const cleaned = raw.trim();
  const lower = cleaned.toLowerCase();

  if (lower === "p" || lower === "purchase" || lower.startsWith("purchas")) {
    return "Purchase";
  }
  if (lower === "s (full)" || lower === "sale (full)" || lower.includes("full")) {
    return "Sale (Full)";
  }
  if (lower === "s (partial)" || lower === "sale (partial)" || lower.includes("partial")) {
    return "Sale (Partial)";
  }
  if (lower === "s" || lower === "sale" || lower.startsWith("sale")) {
    return "Sale";
  }
  if (lower.includes("exchange")) {
    return "Exchange";
  }
  // Preserve whatever was in the filing rather than silently dropping it
  return cleaned || "Other";
}

// ── Date normalization ────────────────────────────────────────────────────────

/**
 * Convert MM/DD/YYYY (House Clerk format) to ISO YYYY-MM-DD.
 * Returns null if the input cannot be parsed.
 */
export function parseMDY(dateStr: string): string | null {
  if (!dateStr) return null;
  const m = dateStr.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [, month, day, year] = m;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

/**
 * Calculate the delay in days between trade date and disclosure date.
 * Both inputs are ISO date strings (YYYY-MM-DD).
 */
export function calcDelayDays(tradeDateIso: string, disclosureDateIso: string): number {
  const trade = new Date(tradeDateIso);
  const disc = new Date(disclosureDateIso);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((disc.getTime() - trade.getTime()) / msPerDay);
}

// ── Official name formatting ──────────────────────────────────────────────────

/**
 * Build a display name for a House member from index fields.
 * Format: "Rep. FIRSTNAME LASTNAME" (or "Del." for non-voting delegates).
 */
export function formatHouseOfficial(
  first: string,
  last: string,
  prefix: string,
  suffix: string,
  stateDst: string
): string {
  // prefix may be "Mr.", "Ms.", "Dr.", or empty.
  // We standardize to "Rep." for display (delegates are a small minority;
  // the chamber field already captures "House").
  const name = [first.trim(), last.trim()].filter(Boolean).join(" ");
  const sfx = suffix.trim() ? `, ${suffix.trim()}` : "";
  return `Rep. ${name}${sfx}`;
}
