-- ---------------------------------------------------------------------------
--  Replace send_anonymous_message() with send_anonymous_signal()
--
--  Identical security posture: SECURITY DEFINER, Turnstile param forwarded
--  to the API layer, IP hash stored, length + null validation, rate-limit
--  enforcement remains in the Next.js API route (unchanged).
--
--  New params:
--    p_coin_ticker text          — nullable; omit for a plain message
--    p_signal_type text          — 'bullish' | 'bearish' | 'chaos' | null
--
--  After each insert, if a ticker is present, coin_rep_scores is upserted
--  with counts recalculated live from the messages table for that ticker.
--  rep_score = (bullish_count * 100) / total  (0–100 scale; 50 when no data)
-- ---------------------------------------------------------------------------

-- Drop the old function (API route will be updated to call the new name)
DROP FUNCTION IF EXISTS public.send_anonymous_message(uuid, text, text, text);

-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.send_anonymous_signal(
  p_recipient_id    uuid,
  p_content         text,
  p_ip_hash         text,
  p_turnstile_token text,          -- validated upstream in the API route
  p_coin_ticker     text  DEFAULT NULL,
  p_signal_type     text  DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_bullish  integer;
  v_bearish  integer;
  v_chaos    integer;
  v_total    integer;
  v_score    numeric(5,2);
BEGIN

  -- 1. Required field validation
  IF p_recipient_id IS NULL OR trim(p_content) = '' THEN
    RETURN json_build_object('success', false, 'error', 'missing_params');
  END IF;

  -- 2. Content length cap (mirrors API-layer validation)
  IF length(p_content) > 1000 THEN
    RETURN json_build_object('success', false, 'error', 'validation_length');
  END IF;

  -- 3. Signal type allowlist (only checked when a value is supplied)
  IF p_signal_type IS NOT NULL
     AND p_signal_type NOT IN ('bullish', 'bearish', 'chaos') THEN
    RETURN json_build_object('success', false, 'error', 'invalid_signal_type');
  END IF;

  -- 4. Insert message (SECURITY DEFINER bypasses the WITH CHECK(false) policy)
  INSERT INTO public.messages (recipient_id, content, sender_ip_hash, coin_ticker, signal_type)
  VALUES (p_recipient_id, trim(p_content), p_ip_hash, p_coin_ticker, p_signal_type);

  -- 5. Upsert coin_rep_scores when a ticker is present
  IF p_coin_ticker IS NOT NULL THEN

    -- Recount all signals for this ticker from the source of truth
    SELECT
      COUNT(*) FILTER (WHERE signal_type = 'bullish'),
      COUNT(*) FILTER (WHERE signal_type = 'bearish'),
      COUNT(*) FILTER (WHERE signal_type = 'chaos')
    INTO v_bullish, v_bearish, v_chaos
    FROM public.messages
    WHERE coin_ticker = p_coin_ticker;

    v_total := v_bullish + v_bearish + v_chaos;

    -- rep_score: 0–100 bullish ratio; default 50 until first signal
    v_score := CASE
      WHEN v_total = 0 THEN 50.00
      ELSE round((v_bullish * 100.0) / v_total, 2)
    END;

    INSERT INTO public.coin_rep_scores
      (coin_ticker, rep_score, bullish_count, bearish_count, chaos_count, last_calculated)
    VALUES
      (p_coin_ticker, v_score, v_bullish, v_bearish, v_chaos, now())
    ON CONFLICT (coin_ticker) DO UPDATE SET
      rep_score       = EXCLUDED.rep_score,
      bullish_count   = EXCLUDED.bullish_count,
      bearish_count   = EXCLUDED.bearish_count,
      chaos_count     = EXCLUDED.chaos_count,
      last_calculated = EXCLUDED.last_calculated;

  END IF;

  RETURN json_build_object('success', true);

END;
$$;
