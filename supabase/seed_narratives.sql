-- Seed data for the Narrative Intelligence system (10 tracked categories).
-- Scores/momentum here are placeholder starting values — the same numbers
-- that were temporarily hardcoded on the home page during the Phase 1
-- rename. Once a real ingestion job exists (GeckoTerminal + classifier,
-- not built yet), these rows get updated in place rather than recreated.
--
-- Run with: paste directly into the Supabase SQL editor after running
-- supabase/migrations/20260619_narrative_terminal.sql.

INSERT INTO public.narratives (name, score, previous_score, momentum, summary, keywords) VALUES
  ('AI Agents',       82, 67.8, 14.2, 'Autonomous agent tokens accelerating as on-chain AI tooling narratives gain traction.',
    ARRAY['ai','agent','gpt','llm','bot','autonomous']),
  ('Solana Culture',  76, 69.5, 6.5,  'Sustained interest across Solana-native meme and culture tokens.',
    ARRAY['solana','sol','bonk','wif','popcat']),
  ('Dog Coins',       71, 74.1, -3.1, 'Cooling slightly after a strong run; still the largest tracked category by volume.',
    ARRAY['doge','shib','floki','inu','wif','bonk']),
  ('Elon/XAI',        68, 46.3, 21.7, 'Spiking on renewed attention around xAI and Grok-adjacent token activity.',
    ARRAY['elon','musk','xai','grok','tesla','x']),
  ('Gaming',          59, 56.6, 2.4,  'Modest, steady growth as on-chain gaming tokens re-enter conversation.',
    ARRAY['game','gaming','play','metaverse','rpg']),
  ('Base Ecosystem',  55, 50.2, 4.8,  'Base-native tokens gaining ground as L2 activity increases.',
    ARRAY['base','brett','toshi']),
  ('Cat Coins',       48, 53.6, -5.6, 'Losing momentum relative to dog-themed counterparts this week.',
    ARRAY['cat','mew','popcat','kitty']),
  ('RWA',             44, 42.8, 1.2,  'Real-world-asset narratives holding steady, no major catalysts yet.',
    ARRAY['rwa','realworld','tokenized','treasury','bond']),
  ('DePIN',           39, 41.0, -2.0, 'Infrastructure-themed tokens trading quietly, below recent averages.',
    ARRAY['depin','infra','node','bandwidth','storage','wifi']),
  ('Politics',        33, 41.4, -8.4, 'Attention fading as the news cycle moves away from election-adjacent tokens.',
    ARRAY['trump','biden','election','vote','politic','maga'])
ON CONFLICT (name) DO NOTHING;
