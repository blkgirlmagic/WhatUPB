-- Narrative Terminal — Phase 2 schema
-- Supports the GeckoTerminal ingestion cron (/api/cron/ingest-geckoterminal).
-- Purely additive: extends `coins` and `narratives` with columns needed to
-- store live market data and to diff each cron run against the previous one
-- (for "new narrative" / "volume spike" detection). Widens the
-- narrative_signals signal_type check to add 'volume_spike'.
--
-- Run with: paste directly into the Supabase SQL editor, after
-- 20260619_narrative_terminal.sql.

-- ── coins: live market data from GeckoTerminal ─────────────────────────────
ALTER TABLE public.coins
  ADD COLUMN IF NOT EXISTS market_cap   NUMERIC,
  ADD COLUMN IF NOT EXISTS pool_address TEXT;

-- ── narratives: last-run aggregates, used to detect new-narrative /
--    volume-spike transitions on the next cron run ─────────────────────────
ALTER TABLE public.narratives
  ADD COLUMN IF NOT EXISTS matched_coins   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_volume    NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_liquidity NUMERIC NOT NULL DEFAULT 0;

-- ── narrative_signals: add a distinct 'volume_spike' type ──────────────────
ALTER TABLE public.narrative_signals DROP CONSTRAINT IF EXISTS ck_narrative_signals_type;
ALTER TABLE public.narrative_signals
  ADD CONSTRAINT ck_narrative_signals_type
    CHECK (signal_type IN ('new_narrative_detected', 'momentum_spike', 'narrative_alert', 'volume_spike'));
