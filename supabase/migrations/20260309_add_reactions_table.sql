-- Public reactions: short text posts from the profile owner.
-- Displayed on the public profile page as a reverse-chronological feed.
-- NOT linked to any specific message — intentionally ambiguous.

CREATE TABLE IF NOT EXISTS reactions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 280),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching reactions by author in reverse chronological order
CREATE INDEX IF NOT EXISTS idx_reactions_author_id_created
  ON reactions(author_id, created_at DESC);

-- RLS
ALTER TABLE reactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read reactions (they are public)
CREATE POLICY reactions_select ON reactions
  FOR SELECT
  USING (true);

-- Only the author can insert their own reactions
CREATE POLICY reactions_insert ON reactions
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Only the author can delete their own reactions
CREATE POLICY reactions_delete ON reactions
  FOR DELETE
  USING (auth.uid() = author_id);
