-- ---------------------------------------------------------------------------
--  Seed: 20 meme coins
--  Safe to run multiple times (ON CONFLICT DO NOTHING).
-- ---------------------------------------------------------------------------

INSERT INTO public.coins (ticker, name, chain, contract_address) VALUES
  ('DOGE',     'Dogecoin',         'DOGE',  NULL),
  ('SHIB',     'Shiba Inu',        'ETH',   '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce'),
  ('PEPE',     'Pepe',             'ETH',   '0x6982508145454ce325ddbe47a25d4ec3d2311933'),
  ('WIF',      'dogwifhat',        'SOL',   'EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm'),
  ('BONK',     'Bonk',             'SOL',   'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263'),
  ('FLOKI',    'FLOKI',            'ETH',   '0xcf0c122c6b73ff809c693db761e7baebe62b6a2e'),
  ('BRETT',    'Brett',            'BASE',  '0x532f27101965dd16442e59d40670faf5ebb142e4'),
  ('MOG',      'Mog Coin',         'ETH',   '0xaaee1a9723aadb7afa2810263653a34ba2c21c7a'),
  ('POPCAT',   'Popcat',           'SOL',   '7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr'),
  ('TURBO',    'Turbo',            'ETH',   '0xa35923162c49cf95e6bf26623385eb431ad920d3'),
  ('MEME',     'Memecoin',         'ETH',   '0xb131f4a55907b10d1f0a50d8ab8fa09ec342cd74'),
  ('NEIRO',    'First Neiro On ETH','ETH',  '0x812ba41e071c7b7fa095a2e0e91acad12f4fb0b5'),
  ('GOAT',     'Goat',             'SOL',   'CzLSujWBLFsSjncfkh59rUFqvafWcY5tzedWJSuypump'),
  ('PNUT',     'Peanut the Squirrel','SOL', '2qEHjDLDLbuBgRYvsxhc5Tq38mTKtKkNtT6f7Ugkh7bN'),
  ('MOODENG',  'Moo Deng',         'SOL',  'ED5nyyWEzpPPiWimP8vYm7sD7TD3LAt3Q3gRTWHzc8ZD'),
  ('CHILLGUY', 'Chill Guy',        'SOL',  'Df6yfrKC8kZE3KNkrHERKzAetSxbrWeniQfyJY4Jpump'),
  ('SLERF',    'SLERF',            'SOL',  '7BgBvyjrZX1YKz4oh9mjb8ZScatkkwb8DzFx7WT2yUXp'),
  ('BOME',     'BOOK OF MEME',     'SOL',  'ukHH6c7mMyiWCf1b9pnWe25TSpkDDt3H5pQZgZ74J82'),
  ('MOTHER',   'MOTHER IGGY',      'SOL',  '3S8qX1MsMqRbiwKg6cQjev8berFgRCu2G4ySeMjehCFN'),
  ('ACT',      'Act I : The AI Prophecy','SOL', 'GJAFwWjJ3vnTsrwVn8Cnhm8zeHk3lqTTCBNpXVnuBxaU')
ON CONFLICT (ticker) DO NOTHING;

-- Seed coin_rep_scores with default 50 for each coin (so the leaderboard
-- shows something before any signals come in).
INSERT INTO public.coin_rep_scores (coin_ticker, rep_score, bullish_count, bearish_count, chaos_count)
SELECT ticker, 50.00, 0, 0, 0
FROM   public.coins
ON CONFLICT (coin_ticker) DO NOTHING;
