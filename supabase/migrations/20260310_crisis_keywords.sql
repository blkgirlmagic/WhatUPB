-- ---------------------------------------------------------------------------
--  crisis_keywords — global crisis / self-harm keyword safety net
--
--  These keywords are checked BEFORE Perspective API on every message.
--  If matched, the message is blocked and the sender sees crisis resources.
--
--  This is separate from keyword_filters (which is per-user, premium-only).
--  crisis_keywords is global and applies to ALL messages on the platform.
--
--  Keywords are stored normalized (lowercase, no smart quotes).
--  The API normalizes message text the same way before matching.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.crisis_keywords (
  id          uuid          DEFAULT gen_random_uuid() PRIMARY KEY,
  keyword     text          NOT NULL UNIQUE,
  created_at  timestamptz   DEFAULT now() NOT NULL,
  active      boolean       DEFAULT true NOT NULL
);

-- RLS: public read (anon needs to query during message send), no direct writes
ALTER TABLE crisis_keywords ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read crisis_keywords"
  ON public.crisis_keywords
  FOR SELECT
  USING (true);

CREATE POLICY "No direct inserts on crisis_keywords"
  ON public.crisis_keywords
  FOR INSERT
  WITH CHECK (false);

CREATE POLICY "No direct updates on crisis_keywords"
  ON public.crisis_keywords
  FOR UPDATE
  USING (false);

CREATE POLICY "No direct deletes on crisis_keywords"
  ON public.crisis_keywords
  FOR DELETE
  USING (false);

-- Index for fast lookup
CREATE INDEX IF NOT EXISTS idx_crisis_keywords_active
  ON public.crisis_keywords (active)
  WHERE active = true;

-- ---------------------------------------------------------------------------
--  Seed data — requested crisis phrases + misspellings / variations
--
--  All stored lowercase. The API normalizes message text before matching.
--  Contractions are stored EXPANDED (don't → do not) because the API
--  expands contractions before matching.
-- ---------------------------------------------------------------------------

INSERT INTO public.crisis_keywords (keyword) VALUES
  -- Core requested phrases (contractions expanded for matching)
  ('i wish i was not alive'),
  ('i wish i wasnt alive'),
  ('i do not want to be here'),
  ('i dont want to be here'),
  ('i want to die'),
  ('end my life'),
  ('kill myself'),
  ('not worth living'),
  ('better off dead'),
  ('can not go on'),
  ('cant go on'),
  ('no reason to live'),
  ('want to end my life'),
  ('wanna end my life'),

  -- Additional variations & misspellings
  ('i wanna die'),
  ('i wana die'),
  ('kil myself'),
  ('kill myslf'),
  ('beter off dead'),
  ('want to disappear'),
  ('wanna disappear'),
  ('want to dissapear'),
  ('wanna dissapear'),
  ('no reason to be alive'),
  ('i wish i were dead'),
  ('i wish i was dead'),
  ('i wish i waz dead'),
  ('i want to end it'),
  ('i want to end it all'),
  ('i wanna end it'),
  ('i wanna end it all'),
  ('take my own life'),
  ('take my life'),
  ('i am going to kill myself'),
  ('i am gonna kill myself'),
  ('going to kill myself'),
  ('gonna kill myself'),
  ('suicide'),
  ('suicidal'),
  ('suiside'),
  ('sucide'),
  ('sucidal'),
  ('i do not want to live'),
  ('i dont want to live'),
  ('i do not want to exist'),
  ('i dont want to exist'),
  ('life is not worth it'),
  ('life isnt worth it'),
  ('life is not worth living'),
  ('nothing to live for'),
  ('nobody would miss me'),
  ('no one would miss me'),
  ('noone would miss me'),
  ('world is better without me'),
  ('everyone is better without me'),
  ('everyone be better without me'),
  ('hurt myself'),
  ('harm myself'),
  ('self harm'),
  ('selfharm'),
  ('cut myself'),
  ('end it all')
ON CONFLICT (keyword) DO NOTHING;

-- ---------------------------------------------------------------------------
--  SECURITY DEFINER function to fetch active crisis keywords.
--  Called from the API route via supabase.rpc(). Bypasses RLS read policy
--  for consistent access from the anon client.
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_crisis_keywords()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    SELECT json_agg(keyword)
    FROM public.crisis_keywords
    WHERE active = true
  );
END;
$$;
