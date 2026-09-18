-- ============================================================
-- POLICY EVENTS & POLICY BILLS
-- Automated crypto policy tracking via official machine-readable
-- sources: Federal Register API and Congress.gov API.
--
-- DO NOT RUN AUTOMATICALLY.
-- Execute this in the Supabase SQL Editor for the WhatUPB project.
--
-- IDEMPOTENT: safe to run more than once. All CREATE statements
-- use IF NOT EXISTS; DROP IF EXISTS used before CREATE where needed.
--
-- Tables:
--   public.policy_events  — agency actions: rulemaking, guidance,
--                           hearings, notices (Federal Register + Congress)
--   public.policy_bills   — tracked legislation with chamber status
--                           (Congress.gov API)
-- ============================================================

-- ── TABLE: policy_events ─────────────────────────────────────────────────────
-- Maps to the "Latest Policy Updates" feed on /policy.
-- One row per agency action. Source: Federal Register API and Congress.gov hearings.

CREATE TABLE IF NOT EXISTS public.policy_events (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Deduplication key. Format:
  --   Federal Register: "fr-{document_number}"   e.g. "fr-2026-12345"
  --   Congress hearing:  "hearing-{congress}-{chamber}-{number}"
  -- Single unique index below; no inline UNIQUE to match capitol pattern.
  external_id   text        NOT NULL,

  -- Source system
  source        text        NOT NULL
                CHECK (source IN ('federal-register', 'congress-hearing', 'congress-bill-action')),

  -- Display agency name (normalized for UI — e.g. "SEC", "CFTC", "Treasury",
  -- "FinCEN", "House Financial Services", "Senate Banking")
  agency        text        NOT NULL,

  -- Headline / title from the source document (verbatim from API; never edited)
  headline      text        NOT NULL,

  -- Optional abstract / summary paragraph (from FR abstract field or hearing description)
  abstract      text,

  -- Event classification for badge display
  event_type    text        NOT NULL
                CHECK (event_type IN (
                  'rulemaking',    -- proposed or final rule
                  'guidance',      -- interpretive guidance, no-action letters
                  'hearing',       -- committee hearing
                  'legislation',   -- bill introduced or amended
                  'testimony',     -- agency head testimony to Congress
                  'notice',        -- advance notice, information requests
                  'enforcement'    -- enforcement action or consent order
                )),

  -- Publication / action date from the source (not ingestion date)
  event_date    date        NOT NULL,

  -- Canonical URL to the official document or hearing page
  source_url    text        NOT NULL,

  -- Policy category for filtering on the /policy page
  -- Maps to the six CLARITY Act areas + Congress umbrella
  category      text        NOT NULL
                CHECK (category IN (
                  'SEC',
                  'CFTC',
                  'Stablecoin',
                  'DeFi',
                  'Digital Commodity',
                  'Government Ethics',
                  'Congress',
                  'Treasury',
                  'FinCEN',
                  'Other'
                )),

  -- Ingestion metadata
  created_at    timestamptz DEFAULT now() NOT NULL,
  updated_at    timestamptz DEFAULT now() NOT NULL
);

-- ── TABLE: policy_bills ──────────────────────────────────────────────────────
-- Maps to the CLARITY Act tracker and any future tracked legislation.
-- One row per tracked bill. Source: Congress.gov API.
-- Updated in place on each ingest run — not an event log.

CREATE TABLE IF NOT EXISTS public.policy_bills (
  id                  uuid        DEFAULT gen_random_uuid() PRIMARY KEY,

  -- Deduplication key. Format: "{congress}-{bill_type}-{bill_number}"
  -- e.g. "119-HR-5403"
  external_id         text        NOT NULL,

  -- Congress number (e.g. 119)
  congress            smallint    NOT NULL,

  -- Bill type: "HR" (House Bill), "S" (Senate Bill), "HRES", "SRES", etc.
  bill_type           text        NOT NULL,

  -- Bill number (e.g. 5403)
  bill_number         integer     NOT NULL,

  -- Full official title from Congress.gov (verbatim)
  title               text        NOT NULL,

  -- Short / popular name for display (e.g. "CLARITY Act") — editorial label,
  -- set at ingestion time from a known-bills config, not auto-derived
  short_title         text,

  -- Sponsor display name (e.g. "Rep. Patrick McHenry (R-NC)")
  sponsor             text,

  -- Latest action summary text for the House chamber (verbatim from API)
  house_status        text,

  -- Latest action summary text for the Senate chamber (verbatim from API)
  senate_status       text,

  -- WhatUPB normalized overall bill status for tracker UI
  overall_status      text        NOT NULL
                      CHECK (overall_status IN (
                        'Introduced',      -- filed, not yet referred
                        'Committee',       -- referred to or in committee
                        'In Progress',     -- active floor consideration / markup
                        'Passed House',    -- passed one chamber
                        'Passed Senate',   -- passed other chamber
                        'Enrolled',        -- passed both, sent to President
                        'Enacted',         -- signed into law
                        'Failed',          -- died, vetoed, or tabled
                        'Unknown'          -- API data insufficient to classify
                      )),

  -- Verbatim latest action text from Congress.gov (most recent action)
  latest_action       text,

  -- Date of the latest action
  latest_action_date  date,

  -- Canonical Congress.gov URL for this bill
  source_url          text        NOT NULL,

  -- Ingestion metadata
  created_at          timestamptz DEFAULT now() NOT NULL,
  updated_at          timestamptz DEFAULT now() NOT NULL
);


-- ── ROW LEVEL SECURITY ───────────────────────────────────────────────────────

-- policy_events
ALTER TABLE public.policy_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Policy events are publicly readable" ON public.policy_events;
CREATE POLICY "Policy events are publicly readable"
  ON public.policy_events
  FOR SELECT
  USING (true);

-- policy_bills
ALTER TABLE public.policy_bills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Policy bills are publicly readable" ON public.policy_bills;
CREATE POLICY "Policy bills are publicly readable"
  ON public.policy_bills
  FOR SELECT
  USING (true);

-- No INSERT / UPDATE / DELETE policies on either table.
-- With RLS enabled, anon and authenticated roles cannot write.
-- All writes use the service-role key in the server-side ingest route.


-- ── INDEXES: policy_events ───────────────────────────────────────────────────

-- Deduplication / upsert conflict key
CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_events_external_id
  ON public.policy_events (external_id);

-- Primary display query: recent events first
CREATE INDEX IF NOT EXISTS idx_policy_events_event_date
  ON public.policy_events (event_date DESC);

-- Filter by category (SEC, CFTC, Stablecoin, etc.)
CREATE INDEX IF NOT EXISTS idx_policy_events_category
  ON public.policy_events (category);

-- Filter by event type (rulemaking, guidance, hearing, etc.)
CREATE INDEX IF NOT EXISTS idx_policy_events_type
  ON public.policy_events (event_type);

-- Filter by source system
CREATE INDEX IF NOT EXISTS idx_policy_events_source
  ON public.policy_events (source);


-- ── INDEXES: policy_bills ────────────────────────────────────────────────────

-- Deduplication / upsert conflict key
CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_bills_external_id
  ON public.policy_bills (external_id);

-- Lookup by congress number (filter to current congress)
CREATE INDEX IF NOT EXISTS idx_policy_bills_congress
  ON public.policy_bills (congress);

-- Filter by overall status
CREATE INDEX IF NOT EXISTS idx_policy_bills_status
  ON public.policy_bills (overall_status);

-- Short-title lookup (e.g. find "CLARITY Act" row quickly)
CREATE INDEX IF NOT EXISTS idx_policy_bills_short_title_lower
  ON public.policy_bills (lower(short_title));


-- ── updated_at TRIGGERS ──────────────────────────────────────────────────────
-- Reuse the set_updated_at() function already created by the capitol migration.
-- CREATE OR REPLACE is idempotent if it was already defined.

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- policy_events trigger
DROP TRIGGER IF EXISTS trg_policy_events_updated_at ON public.policy_events;
CREATE TRIGGER trg_policy_events_updated_at
  BEFORE UPDATE ON public.policy_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- policy_bills trigger
DROP TRIGGER IF EXISTS trg_policy_bills_updated_at ON public.policy_bills;
CREATE TRIGGER trg_policy_bills_updated_at
  BEFORE UPDATE ON public.policy_bills
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ── VERIFICATION ─────────────────────────────────────────────────────────────
-- After running, confirm with:
--
--   SELECT COUNT(*) FROM public.policy_events;
--   SELECT COUNT(*) FROM public.policy_bills;
--
--   SELECT * FROM pg_policies
--     WHERE tablename IN ('policy_events', 'policy_bills');
--
--   SELECT tablename, indexname FROM pg_indexes
--     WHERE tablename IN ('policy_events', 'policy_bills')
--     ORDER BY tablename, indexname;
