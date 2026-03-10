-- ---------------------------------------------------------------------------
--  Add type column to crisis_keywords + seed abuse/harassment phrases
--
--  Two types:
--    'crisis' — self-harm / suicidal ideation → show 988 resources
--    'abuse'  — harassment directed at recipient → block with violation msg
--
--  Abuse keywords are checked in the same pipeline but produce a different
--  response: "This message was blocked. WhatUPB is for honest, uplifting
--  anonymous messages — not harm."
-- ---------------------------------------------------------------------------

-- Add type column (default 'crisis' so existing rows keep their type)
ALTER TABLE public.crisis_keywords
  ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'crisis';

-- Add check constraint for valid types
ALTER TABLE public.crisis_keywords
  DROP CONSTRAINT IF EXISTS crisis_keywords_type_check;

ALTER TABLE public.crisis_keywords
  ADD CONSTRAINT crisis_keywords_type_check
  CHECK (type IN ('crisis', 'abuse'));

-- Index for type-based queries
CREATE INDEX IF NOT EXISTS idx_crisis_keywords_type
  ON public.crisis_keywords (type, active)
  WHERE active = true;

-- ---------------------------------------------------------------------------
--  Seed abuse/harassment phrases (directed AT the recipient)
--  Stored normalized (lowercase, contractions expanded)
-- ---------------------------------------------------------------------------

INSERT INTO public.crisis_keywords (keyword, type) VALUES
  -- Core requested phrases (contractions expanded for matching)
  ('i wish you were dead', 'abuse'),
  ('i wish you wasnt alive', 'abuse'),
  ('i wish you was not alive', 'abuse'),
  ('you should die', 'abuse'),
  ('go kill yourself', 'abuse'),
  ('kys', 'abuse'),
  ('nobody wants you here', 'abuse'),
  ('you should end it', 'abuse'),
  ('the world is better without you', 'abuse'),
  ('go die', 'abuse'),

  -- Additional variations & misspellings
  ('i wish you wasnt here', 'abuse'),
  ('i wish you werent alive', 'abuse'),
  ('i wish you were not alive', 'abuse'),
  ('you should kill yourself', 'abuse'),
  ('u should kill yourself', 'abuse'),
  ('u should die', 'abuse'),
  ('go kil yourself', 'abuse'),
  ('go kill urself', 'abuse'),
  ('kill yourself', 'abuse'),
  ('kil yourself', 'abuse'),
  ('kill urself', 'abuse'),
  ('end yourself', 'abuse'),
  ('nobody would miss you', 'abuse'),
  ('no one would miss you', 'abuse'),
  ('noone would miss you', 'abuse'),
  ('everyone is better without you', 'abuse'),
  ('world be better without you', 'abuse'),
  ('you do not deserve to live', 'abuse'),
  ('you dont deserve to live', 'abuse'),
  ('you do not deserve to be alive', 'abuse'),
  ('you should not be alive', 'abuse'),
  ('you shouldnt be alive', 'abuse'),
  ('hope you die', 'abuse'),
  ('i hope you die', 'abuse'),
  ('drink bleach', 'abuse'),
  ('go hang yourself', 'abuse'),
  ('hang yourself', 'abuse'),
  ('neck yourself', 'abuse'),
  ('off yourself', 'abuse')
ON CONFLICT (keyword) DO UPDATE SET type = EXCLUDED.type;
