-- ---------------------------------------------------------------------------
--  CoinRep schema additions
--
--  1. Extend messages with coin_ticker, signal_type, upvotes
--  2. coins          — canonical meme-coin registry
--  3. coin_rep_scores — aggregated reputation per ticker
--  4. news_items      — coin-tagged news with vibe signal
--
--  Nothing in this file touches existing tables beyond the three new
--  columns on messages. All existing RLS policies remain unchanged.
-- ---------------------------------------------------------------------------

-- ── 1. Extend messages ──────────────────────────────────────────────────────

ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS coin_ticker   TEXT,
  ADD COLUMN IF NOT EXISTS signal_type   TEXT
    CONSTRAINT ck_messages_signal_type
      CHECK (signal_type IN ('bullish', 'bearish', 'chaos')),
  ADD COLUMN IF NOT EXISTS upvotes       INTEGER NOT NULL DEFAULT 0;

-- Index so coin-feed queries stay fast
CREATE INDEX IF NOT EXISTS idx_messages_coin_ticker
  ON public.messages (coin_ticker)
  WHERE coin_ticker IS NOT NULL;

-- ── 2. coins ────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coins (
  ticker            TEXT        PRIMARY KEY,
  name              TEXT        NOT NULL,
  chain             TEXT        NOT NULL,
  contract_address  TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coins are publicly readable"
  ON public.coins
  FOR SELECT
  USING (true);

-- ── 3. coin_rep_scores ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.coin_rep_scores (
  coin_ticker      TEXT        PRIMARY KEY
    REFERENCES public.coins (ticker) ON DELETE CASCADE,
  rep_score        NUMERIC(5,2) NOT NULL DEFAULT 50
    CONSTRAINT ck_rep_score_range CHECK (rep_score BETWEEN 0 AND 100),
  bullish_count    INTEGER     NOT NULL DEFAULT 0,
  bearish_count    INTEGER     NOT NULL DEFAULT 0,
  chaos_count      INTEGER     NOT NULL DEFAULT 0,
  last_calculated  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coin_rep_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coin rep scores are publicly readable"
  ON public.coin_rep_scores
  FOR SELECT
  USING (true);

-- ── 4. news_items ───────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.news_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  coin_ticker   TEXT        NOT NULL
    REFERENCES public.coins (ticker) ON DELETE CASCADE,
  headline      TEXT        NOT NULL,
  vibe          TEXT
    CONSTRAINT ck_news_items_vibe
      CHECK (vibe IN ('bullish', 'bearish', 'chaos', 'neutral')),
  source_url    TEXT,
  signal_count  INTEGER     NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.news_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "News items are publicly readable"
  ON public.news_items
  FOR SELECT
  USING (true);

CREATE INDEX IF NOT EXISTS idx_news_items_coin_ticker
  ON public.news_items (coin_ticker, created_at DESC);
