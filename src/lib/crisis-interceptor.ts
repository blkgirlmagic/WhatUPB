// ---------------------------------------------------------------------------
//  Server-side crisis keyword interceptor for WhatUPB.
//
//  Runs BEFORE the Perspective API and all other content filters.
//  When a message contains self-harm / suicidal ideation phrases, it:
//    1. Blocks the message from being sent
//    2. Returns a crisis resource response to the sender
//    3. Logs the intercept (timestamp + IP hash ONLY — no message content)
//
//  This is a safety net because the Perspective API does NOT reliably
//  catch self-harm language.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

// ── Text normalization (mirrors crisis-detection.ts client-side logic) ───────

function normalizeText(raw: string): string {
  let t = raw.toLowerCase().trim();

  // Strip zero-width / invisible Unicode chars
  t = t.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, "");

  // Collapse spaced-out letters: "k i l l" → "kill"
  t = t.replace(/\b([a-z])\s+(?=[a-z]\b)/g, "$1");

  // Strip punctuation except apostrophes (needed for contraction expansion)
  t = t.replace(/[^a-z0-9\s']/g, " ");

  // Expand common contractions
  t = t.replace(/\bdon'?t\b/g, "do not");
  t = t.replace(/\bwon'?t\b/g, "will not");
  t = t.replace(/\bcan'?t\b/g, "can not");
  t = t.replace(/\bdidn'?t\b/g, "did not");
  t = t.replace(/\bisn'?t\b/g, "is not");
  t = t.replace(/\bwasn'?t\b/g, "was not");
  t = t.replace(/\bwouldn'?t\b/g, "would not");
  t = t.replace(/\bcouldn'?t\b/g, "could not");
  t = t.replace(/\bshouldn'?t\b/g, "should not");
  t = t.replace(/\bi'?m\b/g, "i am");
  t = t.replace(/\bi'?ll\b/g, "i will");
  t = t.replace(/\bi'?ve\b/g, "i have");
  t = t.replace(/\byou'?re\b/g, "you are");
  t = t.replace(/\byou'?ll\b/g, "you will");
  t = t.replace(/\bwhat'?s\b/g, "what is");
  t = t.replace(/\bthat'?s\b/g, "that is");
  t = t.replace(/\blet'?s\b/g, "let us");
  t = t.replace(/\bthere'?s\b/g, "there is");

  // Collapse repeated characters: "suuuicide" → "suicide"
  t = t.replace(/(.)\1{2,}/g, "$1$1");

  // Normalize whitespace
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

// ── Crisis trigger phrases ──────────────────────────────────────────────────
// These are self-harm / suicidal ideation phrases that Perspective API misses.
// Includes the requested phrases plus common misspellings and variations.

const CRISIS_PHRASES: RegExp[] = [
  // --- Requested core phrases ---
  /\bi wish i was not alive\b/,
  /\bi wish i wasnt alive\b/,
  /\bi wish i wasn alive\b/,
  /\bi do not want to be here\b/,
  /\bi dont want to be here\b/,
  /\bi want to die\b/,
  /\bi wanna die\b/,
  /\bi wana die\b/,
  /\bend my life\b/,
  /\bkill myself\b/,
  /\bkil myself\b/,
  /\bkill myslf\b/,
  /\bkill myself\b/,
  /\bnot worth living\b/,
  /\bbetter off dead\b/,
  /\bbeter off dead\b/,
  /\bwant to disappear\b/,
  /\bwanna disappear\b/,
  /\bwant to dissapear\b/,
  /\bwanna dissapear\b/,
  /\bcan not go on\b/,
  /\bcant go on\b/,
  /\bno reason to live\b/,
  /\bno reason to be alive\b/,

  // --- Additional variations & misspellings ---
  /\bi wish i were dead\b/,
  /\bi wish i was dead\b/,
  /\bi wish i waz dead\b/,
  /\bi want to end it\b/,
  /\bi want to end it all\b/,
  /\bi wanna end it\b/,
  /\bi wanna end it all\b/,
  /\btake my own life\b/,
  /\btake my life\b/,
  /\bi am going to kill myself\b/,
  /\bi am gonna kill myself\b/,
  /\bgoing to kill myself\b/,
  /\bgonna kill myself\b/,
  /\bsuicid(e|al)\b/,
  /\bsuiside\b/,
  /\bsucide\b/,
  /\bsucidal\b/,
  /\bi do not want to live\b/,
  /\bi dont want to live\b/,
  /\bi do not want to exist\b/,
  /\bi dont want to exist\b/,
  /\blife is not worth it\b/,
  /\blife isnt worth it\b/,
  /\blife is not worth living\b/,
  /\bnothing to live for\b/,
  /\bnobody would miss me\b/,
  /\bno one would miss me\b/,
  /\bnoone would miss me\b/,
  /\bworld is better without me\b/,
  /\beveryone is better without me\b/,
  /\beveryone be better without me\b/,
  /\bhurt myself\b/,
  /\bharm myself\b/,
  /\bself harm\b/,
  /\bselfharm\b/,
  /\bcut myself\b/,
];

// ── Crisis resource message ─────────────────────────────────────────────────

export const CRISIS_MESSAGE =
  "It sounds like you might be going through something heavy. You\u2019re not alone. " +
  "Text or call 988 (Suicide & Crisis Lifeline) \u2014 free, confidential, 24/7. \uD83D\uDC99";

// ── Public API ──────────────────────────────────────────────────────────────

export interface CrisisInterceptResult {
  intercepted: boolean;
}

/**
 * Check message text against crisis keyword safety net.
 * Runs BEFORE Perspective API and all other content filters.
 * Returns { intercepted: true } if the message matches self-harm patterns.
 */
export function checkCrisisIntercept(text: string): CrisisInterceptResult {
  const normalized = normalizeText(text);
  const intercepted = CRISIS_PHRASES.some((pattern) => pattern.test(normalized));
  return { intercepted };
}

// ── Logging to crisis_intercepts table ──────────────────────────────────────
// Stores ONLY timestamp and IP hash — NO message content is ever stored.

function getAnonSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fire-and-forget log of a crisis intercept.
 * Only stores timestamp and hashed IP — never stores message content.
 */
export async function logCrisisIntercept(
  ipHash: string | null
): Promise<void> {
  try {
    const supabase = getAnonSupabase();
    const { error } = await supabase.rpc("log_crisis_intercept", {
      p_ip_hash: ipHash,
    });

    if (error) {
      console.error(
        "[crisis-interceptor] Failed to log intercept:",
        error.message
      );
    }
  } catch (err) {
    console.error(
      "[crisis-interceptor] Unexpected logging error:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
