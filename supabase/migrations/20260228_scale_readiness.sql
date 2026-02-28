-- Scale readiness migration: additional index for replies
-- Run this in your Supabase SQL editor before launch

-- Index on replies.author_id for future "my replies" queries
CREATE INDEX IF NOT EXISTS idx_replies_author_id
  ON public.replies(author_id);
