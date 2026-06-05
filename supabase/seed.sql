-- ---------------------------------------------------------------------------
--  WhatUPB — Coin Seed Data
--
--  Run with: supabase db reset  OR  paste directly into Supabase SQL editor
--
--  Safe to run multiple times — ON CONFLICT (ticker) DO NOTHING ensures
--  existing rows are never overwritten.
-- ---------------------------------------------------------------------------

-- ── coins ──────────────────────────────────────────────────────────────────

INSERT INTO public.coins (ticker, name, chain) VALUES
  ('DOGE',    'Dogecoin',              'evm'),
  ('SHIB',    'Shiba Inu',             'evm'),
  ('PEPE',    'Pepe',                  'evm'),
  ('FLOKI',   'Floki',                 'evm'),
  ('BONK',    'Bonk',                  'solana'),
  ('WIF',     'dogwifhat',             'solana'),
  ('POPCAT',  'Popcat',                'solana'),
  ('MEW',     'cat in a dogs world',   'solana'),
  ('BRETT',   'Brett',                 'base'),
  ('TOSHI',   'Toshi',                 'base'),
  ('MOG',     'Mog Coin',              'evm'),
  ('NEIRO',   'Neiro',                 'evm'),
  ('TURBO',   'Turbo',                 'evm'),
  ('BABYDOGE','Baby Doge Coin',        'evm'),
  ('WOJAK',   'Wojak',                 'evm'),
  ('ANDY',    'Andy',                  'evm'),
  ('GIGA',    'Gigachad',              'solana'),
  ('BOME',    'Book of Meme',          'solana'),
  ('SLERF',   'Slerf',                 'solana'),
  ('PONKE',   'Ponke',                 'solana')
ON CONFLICT (ticker) DO NOTHING;

-- ── coin_rep_scores — default 50/50 so the dashboard shows all coins ───────

INSERT INTO public.coin_rep_scores
  (coin_ticker, rep_score, bullish_count, bearish_count, chaos_count, last_calculated)
SELECT
  ticker,
  50.00,
  0,
  0,
  0,
  now()
FROM public.coins
ON CONFLICT (coin_ticker) DO NOTHING;
