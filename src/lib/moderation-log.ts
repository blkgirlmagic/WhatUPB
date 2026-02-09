// ---------------------------------------------------------------------------
//  Structured moderation logging — writes block metadata to Supabase.
//
//  Privacy: NO raw message content is ever stored or logged.
//  Only the verdict, Perspective scores, hashed IP, and recipient are recorded.
//
//  This uses the anon Supabase client + a SECURITY DEFINER RPC function
//  (log_moderation_block) so the API route doesn't need the service role key.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface ModerationLogEntry {
  blockedBy: "local" | "perspective" | "rate_limit";
  reason: string;
  scores?: Record<string, number> | null;
  ipHash: string | null;
  recipientId: string;
}

/**
 * Log a moderation block to the `moderation_log` table.
 * Fire-and-forget — errors are logged to console but never block the response.
 */
export async function logModerationBlock(entry: ModerationLogEntry): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.rpc("log_moderation_block", {
      p_blocked_by: entry.blockedBy,
      p_reason: entry.reason,
      p_scores: entry.scores ? JSON.stringify(entry.scores) : null,
      p_ip_hash: entry.ipHash,
      p_recipient_id: entry.recipientId,
    });

    if (error) {
      console.error("[moderation-log] Failed to write log:", error.message);
    }
  } catch (err) {
    // Never let logging failures affect the response
    console.error(
      "[moderation-log] Unexpected error:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
