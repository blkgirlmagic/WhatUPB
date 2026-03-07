-- Age verification log
-- Records each time a visitor confirms they are 18+ on the age gate.
-- Written by the service-role client only; no client-side access needed.

CREATE TABLE IF NOT EXISTS age_verifications (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address   TEXT        NOT NULL,
  verified_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent   TEXT
);

ALTER TABLE age_verifications ENABLE ROW LEVEL SECURITY;

-- Allow anonymous/public inserts only — no select, update, or delete.
-- Service role has full access automatically (bypasses RLS).
CREATE POLICY "Allow public insert only"
  ON age_verifications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
