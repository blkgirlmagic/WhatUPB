// ---------------------------------------------------------------------------
//  Pre-moderation content filter for WhatUPB anonymous messages.
//
//  Runs BEFORE the Perspective API call to catch PII, spam, URLs, and
//  doxxing patterns instantly — saving API quota on obvious violations.
//
//  Privacy: NO raw message content is logged.  Only the reject reason
//  and hashed IP are written to the blocked_messages table.
// ---------------------------------------------------------------------------

import { getSupabase } from "@/lib/supabase";

// ── Phone numbers (any common format) ────────────────────────────────────────

const PHONE_PATTERNS: RegExp[] = [
  /\(\d{3}\)\s*\d{3}[-.\s]?\d{4}/,          // (123) 456-7890
  /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/,         // 123-456-7890  123.456.7890
  /\+\d{10,}/,                                // +1234567890
  /\b\d{10,}\b/,                              // 10+ consecutive digits
];

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
  // 1. Phone numbers
  for (const pattern of PHONE_PATTERNS) {
    if (pattern.test(text)) {
      return { blocked: true, reason: "phone_number" };
    }
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

/**
 * Fire-and-forget log of a blocked message to the blocked_messages table.
 * Uses service role client to bypass RLS.
 */
export async function logBlockedMessage(
  reason: string,
  ipHash: string | null
): Promise<void> {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from("blocked_messages").insert({
      reason,
      ip_hash: ipHash,
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
