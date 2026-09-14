-- ---------------------------------------------------------------------------
--  WhatUPB — Coin Seed Data
--
--  Run with: supabase db reset  OR  paste directly into Supabase SQL editor
--
--  Safe to run multiple times — ON CONFLICT (ticker) DO NOTHING ensures
--  existing rows are never overwritten.
--
--  Contract addresses marked -- TODO: verify were not supplied and have been
--  left NULL intentionally. Do not guess or fill in unverified addresses.
-- ---------------------------------------------------------------------------

-- ── coins ──────────────────────────────────────────────────────────────────

INSERT INTO public.coins (ticker, name, chain, contract_address) VALUES

  -- ── EVM ──────────────────────────────────────────────────────────────────
  ('DOGE',     'Dogecoin',         'evm',    NULL),                                          -- native chain, no EVM contract
  ('SHIB',     'Shiba Inu',        'evm',    '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE'),
  ('PEPE',     'Pepe',             'evm',    '0x6982508145454Ce325dDbE47a25d4ec3d2311933'),
  ('FLOKI',    'Floki',            'evm',    '0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E'),
  ('MOG',      'Mog Coin',         'evm',    '0xaaeE1A9723aaDB7afA2810263653A34bA2C21C7a'),
  ('NEIRO',    'Neiro',            'evm',    NULL),  -- TODO: verify — multiple Neiro tokens exist
  ('TURBO',    'Turbo',            'evm',    NULL),  -- TODO: verify contract address
  ('BABYDOGE', 'Baby Doge Coin',   'evm',    NULL),  -- TODO: verify (BSC vs ETH deployment)
  ('WOJAK',    'Wojak',            'evm',    NULL),  -- TODO: verify contract address
  ('ANDY',     'Andy',             'evm',    NULL),  -- TODO: verify — multiple Andy tokens exist

  -- ── Solana ───────────────────────────────────────────────────────────────
  ('BONK',     'Bonk',             'solana', 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  ('WIF',      'dogwifhat',        'solana', 'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
  ('POPCAT',   'Popcat',           'solana', NULL),  -- TODO: verify mint address
  ('MEW',      'cat in a dogs world','solana',NULL), -- TODO: verify mint address
  ('GIGA',     'Gigachad',         'solana', NULL),  -- TODO: verify mint address
  ('BOME',     'Book of Meme',     'solana', NULL),  -- TODO: verify mint address
  ('SLERF',    'Slerf',            'solana', NULL),  -- TODO: verify mint address
  ('PONKE',    'Ponke',            'solana', NULL),  -- TODO: verify mint address

  -- ── Base ─────────────────────────────────────────────────────────────────
  ('BRETT',    'Brett',            'base',   '0x532f27101965dd16442E59d40670FaF5eBB142E4'),
  ('TOSHI',    'Toshi',            'base',   NULL)   -- TODO: verify contract address

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
