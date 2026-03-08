// ---------------------------------------------------------------------------
//  Pre-moderation content filter for WhatUPB anonymous messages.
//
//  Runs BEFORE the Perspective API call to catch PII, spam, URLs, and
//  doxxing patterns instantly — saving API quota on obvious violations.
//
//  Privacy: NO raw message content is logged.  Only the reject reason
//  and hashed IP are written to the blocked_messages table.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

// ── Phone numbers (any format with 9+ digits) ───────────────────────────────

/**
 * Detect phone numbers by finding digit-heavy runs separated by common
 * phone separators (spaces, dashes, dots, parentheses).  If a run contains
 * 9 or more digits it's treated as a phone number regardless of format.
 *
 * Catches: (123) 456-7890, 123-456-890, 444-123-098, 123.456.7890,
 *          +1234567890, 123456789, and any other 9+ digit sequence.
 */
function containsPhoneNumber(text: string): boolean {
  // Find contiguous runs that start with a digit/( /+ , contain only
  // digits and phone-separator chars, and end with a digit.
  const runs = text.matchAll(/[\d(+][\d\s\-.()]+\d/g);
  for (const match of runs) {
    const digitCount = match[0].replace(/\D/g, "").length;
    if (digitCount >= 9) return true;
  }
  return false;
}

// ── Email addresses ──────────────────────────────────────────────────────────

const EMAIL_PATTERN = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;

// ── Social handles (@username) ───────────────────────────────────────────────

const SOCIAL_HANDLE_PATTERN = /(?:^|\s)@[a-zA-Z0-9_]{2,}/;

// ── URLs and links ───────────────────────────────────────────────────────────

const URL_PATTERNS: RegExp[] = [
  /https?:\/\/\S+/i,
  /\bwww\.\S+/i,
  /\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(com|net|org|io)\b/i,
];

// ── Doxxing phrases ──────────────────────────────────────────────────────────

const DOXXING_PATTERNS: RegExp[] = [
  /\blives?\s+at\b/i,
  /\bworks?\s+at\b/i,
  /\baddress\s+is\b/i,
  /\bgoes?\s+to\s+school\s+at\b/i,
  /\bhome\s+address\b/i,
];

// ── Spam detection (word/phrase repeated 3+ times) ───────────────────────────

// Consecutive identical word: "buy buy buy"
const SPAM_WORD_PATTERN = /\b(\w{2,})\b(?:\s+\1\b){2,}/i;

/**
 * Check for repeated phrases (2-5 word sequences appearing 3+ times).
 * Catches "check this out check this out check this out" etc.
 */
function hasRepeatedPhrases(text: string): boolean {
  const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 0);
  if (words.length < 6) return false;

  for (
    let phraseLen = 2;
    phraseLen <= Math.min(5, Math.floor(words.length / 3));
    phraseLen++
  ) {
    const counts = new Map<string, number>();
    for (let i = 0; i <= words.length - phraseLen; i++) {
      const phrase = words.slice(i, i + phraseLen).join(" ");
      const count = (counts.get(phrase) || 0) + 1;
      if (count >= 3) return true;
      counts.set(phrase, count);
    }
  }

  return false;
}

// ── Public API ───────────────────────────────────────────────────────────────

export interface ContentFilterResult {
  blocked: boolean;
  reason?: string;
}

/**
 * Run pre-moderation regex filter on raw message text.
 * Call this BEFORE moderateMessage() to save Perspective API quota.
 * Returns immediately if any pattern matches.
 */
export function checkContentFilter(text: string): ContentFilterResult {
  // 1. Phone numbers (9+ digits in any format)
  if (containsPhoneNumber(text)) {
    return { blocked: true, reason: "phone_number" };
  }

  // 2. Email addresses
  if (EMAIL_PATTERN.test(text)) {
    return { blocked: true, reason: "email" };
  }

  // 3. Social handles
  if (SOCIAL_HANDLE_PATTERN.test(text)) {
    return { blocked: true, reason: "social_handle" };
  }

  // 4. URLs and links
  for (const pattern of URL_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "url" };
    }
  }

  // 5. Spam patterns (repeated words/phrases)
  if (SPAM_WORD_PATTERN.test(text)) {
    return { blocked: true, reason: "spam_repetition" };
  }
  if (hasRepeatedPhrases(text)) {
    return { blocked: true, reason: "spam_repetition" };
  }

  // 6. Doxxing phrases
  for (const pattern of DOXXING_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "doxxing_phrase" };
    }
  }

  return { blocked: false };
}

// ── Logging to Supabase blocked_messages table ───────────────────────────────

// Fresh anon client per call — avoids stale singleton fetch issues on Vercel.
// Uses a SECURITY DEFINER RPC function to bypass RLS, same pattern as
// moderation-log.ts (which works reliably).
function getAnonSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/**
 * Fire-and-forget log of a blocked message to the blocked_messages table.
 * Uses anon client + SECURITY DEFINER RPC to bypass RLS.
 */
export async function logBlockedMessage(
  reason: string,
  ipHash: string | null
): Promise<void> {
  try {
    const supabase = getAnonSupabase();
    const { error } = await supabase.rpc("log_blocked_message", {
      p_reason: reason,
      p_ip_hash: ipHash,
    });

    if (error) {
      console.error(
        "[content-filter] Failed to log blocked message:",
        error.message
      );
    }
  } catch (err) {
    console.error(
      "[content-filter] Unexpected logging error:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
