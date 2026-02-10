-- Reply threads: allows inbox owners to reply anonymously to messages.
-- No IP logging on replies for privacy.

CREATE TABLE IF NOT EXISTS replies (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content    TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fetching replies by message (used in the join query)
CREATE INDEX IF NOT EXISTS idx_replies_message_id ON replies(message_id);

-- RLS: only the message recipient (author_id) can insert/read their own replies
ALTER TABLE replies ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert replies only to messages they own
CREATE POLICY replies_insert ON replies
  FOR INSERT
  WITH CHECK (
    auth.uid() = author_id
    AND EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = replies.message_id
        AND messages.recipient_id = auth.uid()
    )
  );

-- Policy: users can read replies on their own messages
CREATE POLICY replies_select ON replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM messages
      WHERE messages.id = replies.message_id
        AND messages.recipient_id = auth.uid()
    )
  );

-- Policy: users can delete their own replies
CREATE POLICY replies_delete ON replies
  FOR DELETE
  USING (author_id = auth.uid());
