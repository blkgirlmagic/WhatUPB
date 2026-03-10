// ---------------------------------------------------------------------------
//  Hardcoded keyword fallback for WhatUPB content moderation.
//
//  This file provides a FALLBACK safety net when the primary Hive Text
//  Moderation API is unreachable.  It matches messages against hardcoded
//  regex patterns for two categories:
//
//    'crisis' — Self-harm / suicidal ideation (directed at SELF)
//               → Block message, show 988 Lifeline resources
//
//    'abuse'  — Harassment / threats / death wishes (directed at RECIPIENT)
//               → Block message, show community guidelines violation
//
//  This file is ONLY called when the Hive API returns { available: false }.
// ---------------------------------------------------------------------------

import { createClient } from "@supabase/supabase-js";

// ── Text normalization ───────────────────────────────────────────────────────

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
  t = t.replace(/\bweren'?t\b/g, "were not");
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

// ── Hardcoded patterns (fallback if Hive API is unreachable) ─────────────────

// Self-harm / suicidal ideation (directed at SELF → 988 resources)
const HARDCODED_CRISIS_PATTERNS: RegExp[] = [
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
  /\bend it all\b/,
  /\bwant to end my life\b/,
  /\bwanna end my life\b/,
];

// Harassment / threats / death wishes (directed at RECIPIENT → community guidelines block)
const HARDCODED_ABUSE_PATTERNS: RegExp[] = [
  // ── Death wishes ──
  /\bi wish you were dead\b/,
  /\bi wish you wasnt alive\b/,
  /\bi wish you was not alive\b/,
  /\bi wish you were not alive\b/,
  /\bi wish you werent alive\b/,
  /\bi wish you wasnt here\b/,
  /\byou should die\b/,
  /\bu should die\b/,
  /\bgo kill yourself\b/,
  /\bgo kil yourself\b/,
  /\bgo kill urself\b/,
  /\bkys\b/,
  /\bnobody wants you here\b/,
  /\byou should end it\b/,
  /\bthe world is better without you\b/,
  /\bworld is better without you\b/,
  /\bworld be better without you\b/,
  /\beveryone is better without you\b/,
  /\bgo die\b/,
  /\bkill yourself\b/,
  /\bkil yourself\b/,
  /\bkill urself\b/,
  /\bend yourself\b/,
  /\byou should kill yourself\b/,
  /\bu should kill yourself\b/,
  /\bnobody would miss you\b/,
  /\bno one would miss you\b/,
  /\bnoone would miss you\b/,
  /\byou do not deserve to live\b/,
  /\byou dont deserve to live\b/,
  /\byou do not deserve to be alive\b/,
  /\byou should not be alive\b/,
  /\byou shouldnt be alive\b/,
  /\bhope you die\b/,
  /\bi hope you die\b/,
  /\bdrink bleach\b/,
  /\bgo hang yourself\b/,
  /\bhang yourself\b/,
  /\bneck yourself\b/,
  /\boff yourself\b/,

  // ── Direct threats / intimidation ──
  /\bfuck you up\b/,
  /\bfuk you up\b/,
  /\bfck you up\b/,
  /\bmess you up\b/,
  /\bbeat you up\b/,
  /\bbeat (you|u|yo) up\b/,
  /\bhurt you\b/,
  /\bhurt (u|yo)\b/,
  /\bcome for you\b/,
  /\bcome for (u|yo)\b/,
  /\bcoming for you\b/,
  /\bcoming for (u|yo)\b/,
  /\bfind you\b/,
  /\bfind (u|yo)\b/,
  /\byou dead\b/,
  /\bu dead\b/,
  /\byou are dead\b/,
  /\bu are dead\b/,
  /\bmake you pay\b/,
  /\bmake (u|yo) pay\b/,
  /\bgoing to get you\b/,
  /\bgonna get you\b/,
  /\bgon get you\b/,
  /\bgoing to get (u|yo)\b/,
  /\bgonna get (u|yo)\b/,
  /\bi will get you\b/,
  /\bi will get (u|yo)\b/,

  // ── Violent threats ──
  /\bchop (your|yo|ur) head\b/,
  /\bchop you\b/,
  /\bchop (u|yo)\b/,
  /\bcut (your|yo|ur) head\b/,
  /\bslit (your|yo|ur)\b/,
  /\bstab you\b/,
  /\bstab (u|yo)\b/,
  /\bstab (your|yo|ur)\b/,
  /\bchoke you\b/,
  /\bchoke (u|yo)\b/,
];

// ── Response messages ───────────────────────────────────────────────────────

export const CRISIS_MESSAGE =
  "It sounds like you might be going through something heavy. You\u2019re not alone. " +
  "Call or text 988 (Suicide & Crisis Lifeline) \u2014 free and confidential \uD83D\uDC99";

export const ABUSE_MESSAGE =
  "This message was blocked. WhatUPB is for honest, uplifting anonymous messages \u2014 not harm.";

// ── Public API ──────────────────────────────────────────────────────────────

export type InterceptType = "crisis" | "abuse";

export interface InterceptResult {
  intercepted: boolean;
  type: InterceptType | null;
}

/**
 * Hardcoded keyword fallback — ONLY called when the Hive Text Moderation
 * API is unreachable.  Synchronous regex check against normalized text.
 *
 * Abuse patterns are checked FIRST because they target the recipient
 * and should be blocked immediately without showing crisis resources.
 */
export function checkKeywordFallback(text: string): InterceptResult {
  const normalized = normalizeText(text);

  // Check ABUSE first (directed at recipient — block immediately)
  if (HARDCODED_ABUSE_PATTERNS.some((p) => p.test(normalized))) {
    return { intercepted: true, type: "abuse" };
  }

  // Then CRISIS (self-harm — show 988 resources)
  if (HARDCODED_CRISIS_PATTERNS.some((p) => p.test(normalized))) {
    return { intercepted: true, type: "crisis" };
  }

  return { intercepted: false, type: null };
}

// ── Logging ─────────────────────────────────────────────────────────────────

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
        "[keyword-fallback] Failed to log crisis intercept:",
        error.message
      );
    }
  } catch (err) {
    console.error(
      "[keyword-fallback] Unexpected logging error:",
      err instanceof Error ? err.message : String(err)
    );
  }
}
