-- ==========================================================================
--  Security Advisor fixes — 2026-03-07
--
--  1. Pin search_path on SECURITY DEFINER functions
--  2. Drop stale / overly-permissive messages policies, recreate correct ones
--  3. Tighten moderation_log SELECT to admin only (tiptoe)
--
--  Tables verified and already correct (no changes):
--    - replies       (INSERT/SELECT/DELETE scoped to auth.uid())
--    - keyword_filters (INSERT/SELECT/DELETE scoped to auth.uid())
--    - profiles      (SELECT public by design for /[username] pages,
--                     UPDATE scoped to auth.uid())
--
--  HOW TO RUN: Paste this entire file into the Supabase SQL Editor and run.
-- ==========================================================================

BEGIN;

-- =========================================================================
-- 1. FUNCTION SEARCH PATH — pin to 'public' so search path is immutable
-- =========================================================================

-- handle_new_user: was missing search_path (flagged by Security Advisor)
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- send_anonymous_message: already set in schema.sql, but re-assert for safety
ALTER FUNCTION public.send_anonymous_message(uuid, text, text, text) SET search_path = public;

-- log_moderation_block: already set in migration, re-assert for safety
ALTER FUNCTION public.log_moderation_block(text, text, jsonb, text, uuid) SET search_path = public;


-- =========================================================================
-- 2. MESSAGES TABLE — drop ALL existing policies and recreate clean set
--
--    The Security Advisor flagged an "always true" SELECT policy.  This may
--    be a stale "Anyone can send messages" policy from an earlier schema
--    that was never dropped in production.  We nuke everything and rebuild.
-- =========================================================================

-- Drop every known (and possibly unknown) policy name on messages
DROP POLICY IF EXISTS "Anyone can send messages"        ON public.messages;
DROP POLICY IF EXISTS "No direct message inserts"       ON public.messages;
DROP POLICY IF EXISTS "Users can read own messages"     ON public.messages;
DROP POLICY IF EXISTS "Users can delete own messages"   ON public.messages;
DROP POLICY IF EXISTS "messages_select"                 ON public.messages;
DROP POLICY IF EXISTS "messages_insert"                 ON public.messages;
DROP POLICY IF EXISTS "messages_delete"                 ON public.messages;

-- INSERT: block ALL direct inserts.
-- Anonymous messages go through the SECURITY DEFINER function
-- send_anonymous_message(), which bypasses RLS.
CREATE POLICY "No direct message inserts"
  ON public.messages
  FOR INSERT
  WITH CHECK (false);

-- SELECT: only the recipient can read their own messages
CREATE POLICY "Users can read own messages"
  ON public.messages
  FOR SELECT
  USING (auth.uid() = recipient_id);

-- DELETE: only the recipient can delete their own messages
CREATE POLICY "Users can delete own messages"
  ON public.messages
  FOR DELETE
  USING (auth.uid() = recipient_id);

-- UPDATE: no policy = no updates allowed (intentional)


-- =========================================================================
-- 3. MODERATION_LOG — tighten SELECT from "any authenticated user" to
--    admin only (the tiptoe account).  The API route already checks this,
--    but defense-in-depth means the DB should enforce it too.
-- =========================================================================

DROP POLICY IF EXISTS "Authenticated users can read moderation_log"
  ON public.moderation_log;

CREATE POLICY "Only admin can read moderation_log"
  ON public.moderation_log
  FOR SELECT
  USING (
    auth.uid() = (
      SELECT id FROM public.profiles
      WHERE username = 'tiptoe'
      LIMIT 1
    )
  );


COMMIT;
