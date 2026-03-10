-- ---------------------------------------------------------------------------
--  message_reports — user-submitted reports on inbox messages
--
--  Privacy: NO raw message content is stored. Only metadata: who reported,
--  which message (UUID reference), reason category, and optional details.
--
--  The message itself is deleted from the messages table after reporting.
--  This table serves as the audit trail for report patterns.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.message_reports (
  id           UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id   UUID          NOT NULL,
  reporter_id  UUID          NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason       TEXT          NOT NULL,
  details      TEXT,
  created_at   TIMESTAMPTZ   DEFAULT now() NOT NULL,

  -- Prevent duplicate reports: one user can only report a given message once
  CONSTRAINT uq_message_reports_message_reporter UNIQUE (message_id, reporter_id),

  -- Validate reason category
  CONSTRAINT ck_message_reports_reason CHECK (
    reason IN ('threatening', 'harassment', 'spam', 'inappropriate', 'other')
  ),

  -- Cap details length at DB level
  CONSTRAINT ck_message_reports_details_length CHECK (
    details IS NULL OR char_length(details) <= 200
  )
);

-- RLS
ALTER TABLE public.message_reports ENABLE ROW LEVEL SECURITY;

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports"
  ON public.message_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Users can read their own reports (for duplicate checking)
CREATE POLICY "Users can read own reports"
  ON public.message_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_message_reports_reporter
  ON public.message_reports (reporter_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_message_reports_message
  ON public.message_reports (message_id);

CREATE INDEX IF NOT EXISTS idx_message_reports_reason
  ON public.message_reports (reason, created_at DESC);
