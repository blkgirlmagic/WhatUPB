// ---------------------------------------------------------------------------
//  Client-side crisis detection for WhatUPB.
//
//  Detects self-directed distress keywords in message text and returns a
//  boolean flag.  This is a passive UI helper — it does NOT block messages,
//  store data, or identify senders.  All detection runs in the browser.
//
//  The normalization logic mirrors moderation.ts but is duplicated here
//  intentionally so this module has zero server-side dependencies.
// ---------------------------------------------------------------------------

// ── Text normalization (client-safe) ─────────────────────────────────────────

function normalizeCrisisText(raw: string): string {
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
  t = t.replace(/\bwouldn'?t\b/g, "would not");
  t = t.replace(/\bcouldn'?t\b/g, "could not");
  t = t.replace(/\bshouldn'?t\b/g, "should not");
  t = t.replace(/\bi'?m\b/g, "i am");
  t = t.replace(/\bi'?ll\b/g, "i will");
  t = t.replace(/\byou'?re\b/g, "you are");
  t = t.replace(/\byou'?ll\b/g, "you will");
  t = t.replace(/\bwhat'?s\b/g, "what is");
  t = t.replace(/\bthat'?s\b/g, "that is");
  t = t.replace(/\blet'?s\b/g, "let us");

  // Collapse repeated characters: "suuuicide" → "suicide"
  t = t.replace(/(.)\1{2,}/g, "$1$1");

  // Normalize whitespace
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

// ── Crisis patterns ──────────────────────────────────────────────────────────
// These match self-directed distress phrases against normalized text.
// They intentionally do NOT overlap with the server-side BLOCKED_PATTERNS
// (which target threats directed at *others*).

const CRISIS_PATTERNS: RegExp[] = [
  /\bkill myself\b/,
  /\bend my life\b/,
  /\bwant to die\b/,
  /\bdo not want to be here\b/,
  /\bsuicid(e|al)\b/,
  /\bself harm\b/,
  /\bhurt myself\b/,
  /\bend it all\b/,
  /\bno reason to live\b/,
  /\bcan not go on\b/,
  /\bbetter off dead\b/,
  /\bwish i (was|were) dead\b/,
  /\btake my own life\b/,
  /\bnot worth living\b/,
];

// ── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns true if the text contains phrases indicating self-directed
 * distress or suicidal ideation.  Runs entirely on the client — no data
 * is sent to any server.
 */
export function detectCrisis(text: string): boolean {
  const normalized = normalizeCrisisText(text);
  return CRISIS_PATTERNS.some((pattern) => pattern.test(normalized));
}
