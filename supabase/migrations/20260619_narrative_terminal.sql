-- Narrative Terminal — Phase 1 schema
-- Adds a second, independent scoring system ("Narrative Intelligence") on top
-- of the existing community Coin Rep Score system. Nothing below touches
-- profiles, messages, send_anonymous_signal(), coins (beyond an additive
-- ALTER), coin_rep_scores, or news_items.
--
-- Run with: paste directly into the Supabase SQL editor (no CLI installed),
-- or `supabase db reset` if you set up the CLI later.

-- ── narratives ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.narratives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        UNIQUE NOT NULL,
  score           NUMERIC(5,2) NOT NULL DEFAULT 50,
  previous_score  NUMERIC(5,2) NOT NULL DEFAULT 50,
  momentum        NUMERIC(6,2) NOT NULL DEFAULT 0,
  summary         TEXT,
  keywords        TEXT[]      NOT NULL DEFAULT '{}', -- classification dictionary; tunable via SQL, no redeploy needed
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Narratives are publicly readable" ON public.narratives;
CREATE POLICY "Narratives are publicly readable"
  ON public.narratives FOR SELECT
  USING (true);

-- ── extend existing coins table (no new PK, no breaking changes) ───────────
ALTER TABLE public.coins
  ADD COLUMN IF NOT EXISTS narrative_id UUID REFERENCES public.narratives(id),
  ADD COLUMN IF NOT EXISTS volume       NUMERIC,
  ADD COLUMN IF NOT EXISTS liquidity    NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_coins_narrative_id ON public.coins (narrative_id);

-- ── narrative_signals (disambiguated from messages.signal_type) ────────────
CREATE TABLE IF NOT EXISTS public.narrative_signals (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id UUID        NOT NULL REFERENCES public.narratives(id) ON DELETE CASCADE,
  signal_type  TEXT        NOT NULL
    CONSTRAINT ck_narrative_signals_type
      CHECK (signal_type IN ('new_narrative_detected', 'momentum_spike', 'narrative_alert')),
  strength     NUMERIC(5,2) NOT NULL DEFAULT 0,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.narrative_signals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Narrative signals are publicly readable" ON public.narrative_signals;
CREATE POLICY "Narrative signals are publicly readable"
  ON public.narrative_signals FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_narrative_signals_narrative
  ON public.narrative_signals (narrative_id, created_at DESC);
