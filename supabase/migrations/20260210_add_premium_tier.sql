-- Premium tier: adds subscription tracking, keyword filters, and link themes.

-- 1. Add premium fields to profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS is_premium    BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS premium_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS link_theme    TEXT         NOT NULL DEFAULT 'dark';

-- 2. Keyword filters table (premium-only feature)
CREATE TABLE IF NOT EXISTS keyword_filters (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  keyword    TEXT NOT NULL CHECK (char_length(keyword) BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, keyword)
);

CREATE INDEX IF NOT EXISTS idx_keyword_filters_user_id ON keyword_filters(user_id);

-- RLS for keyword_filters
ALTER TABLE keyword_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY keyword_filters_select ON keyword_filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY keyword_filters_insert ON keyword_filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY keyword_filters_delete ON keyword_filters
  FOR DELETE USING (auth.uid() = user_id);

-- 3. Allow users to update their own link_theme
-- (profiles already has RLS for SELECT/UPDATE; this policy is additive)
