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
-- No RLS policies — service role bypasses RLS; no client access needed.
