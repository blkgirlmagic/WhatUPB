-- ============================================================
-- CAPITOL DISCLOSURES
-- Congressional Periodic Transaction Reports (PTR) — STOCK Act
-- Supports House (Phase 1) and Senate (Phase 2)
--
-- DO NOT RUN AUTOMATICALLY.
-- Execute this in the Supabase SQL Editor for the WhatUPB project.
--
-- IDEMPOTENT: safe to run more than once. All CREATE statements
-- use IF NOT EXISTS; the policy is dropped then recreated.
-- ============================================================

-- ── Table ────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.capitol_disclosures (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Filer identity
  official         text        NOT NULL,                          -- e.g. "Rep. John Smith"
  chamber          text        NOT NULL CHECK (chamber IN ('House', 'Senate')),
  filer_office     text,                                         -- e.g. "TX-01" or "California"

  -- Asset — raw + normalized
  asset_description text       NOT NULL,                         -- exact text from filing (preserved)
  asset_type_raw    text,                                         -- raw asset type string from filing
  asset_type        text       NOT NULL                           -- WhatUPB normalized classification
                               CHECK (asset_type IN ('Stock', 'ETF', 'Options', 'Crypto', 'Bond', 'Other')),

  -- Transaction details
  transaction_type  text       NOT NULL,                         -- Purchase | Sale | Sale (Full) | Sale (Partial) | Exchange | Other
  ticker            text,                                        -- optional ticker symbol where reported
  owner             text,                                        -- Filer | Spouse | Dependent Child | Joint

  -- Amount (stored as integers for filtering; label preserved for display)
  amount_min        bigint,                                      -- lower bound in USD (null if unknown)
  amount_max        bigint,                                      -- upper bound; null = over top bracket
  amount_label      text       NOT NULL,                         -- display string, e.g. "$1,001 – $15,000"

  -- Dates
  trade_date        date       NOT NULL,
  disclosure_date   date       NOT NULL,

  -- Computed delay (days). Not a "late" flag — the legal deadline
  -- depends on notification date and has an outer 45-day limit.
  -- Stored (not generated) so it works on all Supabase Postgres configs.
  delay_days        integer    NOT NULL,                         -- disclosure_date - trade_date

  -- Provenance (required for every record)
  source_agency     text       NOT NULL,                         -- "U.S. House of Representatives" | "U.S. Senate"
  source_url        text       NOT NULL,                         -- direct URL to the PDF or electronic filing
  -- external_id is the deduplication key. No inline UNIQUE here; the named
  -- index below (idx_capitol_external_id) is the single unique constraint.
  external_id       text       NOT NULL,
  filing_year       smallint   NOT NULL,                         -- year of the filing (may differ from trade year)

  -- Ingestion metadata
  created_at        timestamptz DEFAULT now() NOT NULL,
  updated_at        timestamptz DEFAULT now() NOT NULL
);

-- ── Row Level Security ────────────────────────────────────────────────────────

-- Idempotent: ENABLE RLS is a no-op if already enabled.
ALTER TABLE public.capitol_disclosures ENABLE ROW LEVEL SECURITY;

-- Public read: disclosures are public record.
-- DROP first so re-running this script does not error.
DROP POLICY IF EXISTS "Capitol disclosures are publicly readable"
  ON public.capitol_disclosures;

CREATE POLICY "Capitol disclosures are publicly readable"
  ON public.capitol_disclosures
  FOR SELECT
  USING (true);

-- No INSERT / UPDATE / DELETE policies are defined.
-- With RLS enabled, the anon and authenticated roles cannot write to this table.
-- All writes go through the service-role key in the server-side ingest API route.

-- ── Indexes ──────────────────────────────────────────────────────────────────

-- Most common query: recent disclosures
CREATE INDEX IF NOT EXISTS idx_capitol_trade_date
  ON public.capitol_disclosures (trade_date DESC);

-- Filter by asset type
CREATE INDEX IF NOT EXISTS idx_capitol_asset_type
  ON public.capitol_disclosures (asset_type);

-- Filter by chamber (needed for Senate Phase 2 and stats queries)
CREATE INDEX IF NOT EXISTS idx_capitol_chamber
  ON public.capitol_disclosures (chamber);

-- Search by official name (case-insensitive ilike)
CREATE INDEX IF NOT EXISTS idx_capitol_official_lower
  ON public.capitol_disclosures (lower(official));

-- Search by asset description (case-insensitive ilike)
CREATE INDEX IF NOT EXISTS idx_capitol_asset_desc_lower
  ON public.capitol_disclosures (lower(asset_description));

-- Deduplication lookups and upsert conflict key — single named unique index.
CREATE UNIQUE INDEX IF NOT EXISTS idx_capitol_external_id
  ON public.capitol_disclosures (external_id);

-- Stats queries (disclosure_date range, e.g. "this week")
CREATE INDEX IF NOT EXISTS idx_capitol_disclosure_date
  ON public.capitol_disclosures (disclosure_date DESC);

-- ── updated_at trigger ───────────────────────────────────────────────────────

-- CREATE OR REPLACE is idempotent.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- DROP IF EXISTS + CREATE is idempotent.
DROP TRIGGER IF EXISTS trg_capitol_updated_at ON public.capitol_disclosures;
CREATE TRIGGER trg_capitol_updated_at
  BEFORE UPDATE ON public.capitol_disclosures
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── Verification ─────────────────────────────────────────────────────────────
-- After running, confirm with:
--   SELECT COUNT(*) FROM public.capitol_disclosures;
--   SELECT * FROM pg_policies WHERE tablename = 'capitol_disclosures';
--   SELECT indexname FROM pg_indexes WHERE tablename = 'capitol_disclosures';
