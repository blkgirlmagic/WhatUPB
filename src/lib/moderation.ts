// ---------------------------------------------------------------------------
//  Server-side content moderation for WhatUPB anonymous messages.
//
//  Two layers:
//    1. LOCAL BLOCKLIST — instant, zero-latency.  Text is normalized first
//       (lowercase, strip punctuation, collapse repeated chars, expand
//       common contractions) so patterns catch real-world variations.
//    2. GOOGLE PERSPECTIVE API — purpose-built toxicity scorer.  Free tier.
//       Per-attribute thresholds (see PERSPECTIVE_THRESHOLDS).
//       Env: PERSPECTIVE_API_KEY
//
//  If the Perspective API is unavailable the local blocklist still provides
//  baseline protection.  Messages are allowed through (with a warning log)
//  when Perspective is down — no substitute service is used.
// ---------------------------------------------------------------------------

// ── Per-attribute Perspective thresholds ─────────────────────────────────────
// If ANY attribute score meets or exceeds its threshold → hard block.

const PERSPECTIVE_THRESHOLDS: Record<string, number> = {
  TOXICITY: 0.55,
  SEVERE_TOXICITY: 0.60,
  THREAT: 0.50,
  INSULT: 0.55,
  IDENTITY_ATTACK: 0.60,
  PROFANITY: 0.70,
};

// ── Text normalization ──────────────────────────────────────────────────────

function normalize(raw: string): string {
  let t = raw.toLowerCase().trim();

  // Strip zero-width / invisible Unicode chars
  t = t.replace(/[\u200B-\u200F\u2028-\u202F\uFEFF]/g, "");

  // Collapse spaced-out letters:  "d i e" → "die", "k y s" → "kys"
  t = t.replace(/\b([a-z])\s+(?=[a-z]\b)/g, "$1");

  // Strip punctuation except apostrophes (we need those for contractions)
  t = t.replace(/[^a-z0-9\s']/g, " ");

  // Expand common contractions so patterns don't need apostrophe variants
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

  // Collapse repeated characters:  "dieeee" → "die", "suuuck" → "suck"
  t = t.replace(/(.)\1{2,}/g, "$1$1");

  // Normalize whitespace
  t = t.replace(/\s+/g, " ").trim();

  return t;
}

// ── Local patterns ──────────────────────────────────────────────────────────
// These run against NORMALIZED text (lowercase, no punctuation except ',
// contractions expanded, repeats collapsed).

const BLOCKED_PATTERNS: RegExp[] = [
  // ── Threats & violence ──
  /\bi\s+(will|am going to|am gonna|wanna|gonna|want to|would like to)\s+(kill|hurt|stab|shoot|murder|beat|attack|slap|punch|strangle|destroy|end)\s+(you|u|him|her|them)\b/,
  /\bi\s+will\s+hurt\s+you/,
  /\b(kill|hurt|stab|shoot|murder|strangle)\s+(you|u)\b/,

  // ── "Die" / death wishes ──
  /\bhope\s+(you|u|they|he|she)\s+die/,
  /\bgo\s+die\b/,
  /\bdie\s*die\b/,
  /\b(die){2,}\b/,
  /\bjust\s+die\b/,
  /\bplease\s+die\b/,
  /\byou\s+deserve\s+to\s+die\b/,
  /\byou\s+should\s+(just\s+)?die\b/,
  /\btime\s+to\s+die\b/,
  /\byou\s+must\s+die\b/,
  /\byou\s+(need|have)\s+to\s+die\b/,
  /\byou\s+will\s+die\b/,
  /\bgo(nna|ing\s+to)\s+die\b/,

  // ── Kill yourself / KYS ──
  /kill\s*(your\s*self|yourself|urself|ur\s*self)/,
  /\bkys\b/,
  /why\s+(do not|don't|dont|wont|will not)\s+you\s+(just\s+)?kill\s+(yourself|your\s*self|urself)/,
  /\bgo\s+(kill|hang|hurt|cut)\s+(yourself|your\s*self|urself)\b/,
  /you\s+should\s+(just\s+)?(kill\s+yourself|kys|end\s+(it|your\s*life))/,

  // ── Self-harm encouragement ──
  /\bcut\s+(yourself|your\s*self|urself|your\s+wrists?)\b/,
  /\bdrink\s+bleach\b/,
  /\bjump\s+off\s+(a|the)\b/,
  /\bend\s+(your|ur)\s+(life|it)\b/,
  /\bno\s*one\s+(would|will)\s+(care|miss|notice)\s+if\s+you\s+(died|were\s+gone|killed\s+yourself)/,

  // ── Harassment / directed vulgarity ──
  /\byou\s+(fucking|fuckin|fking|fkn)\s+(suck|bitch|cunt|whore|slut|idiot|retard|moron|loser|piece)/,
  /\byou\s+suck\b/,
  /\bfuck\s*(you|u|off|yo|yourself|urself)\b/,
  /\bstfu\b/,
  /\bpiece\s+of\s+shit\b/,
  /\bkill\s+yourself\b/,
  /\b(you\s+are|you\s*re|ur)\s+(a\s+)?(worthless|pathetic|disgusting|trash|garbage|waste)\b/,
  /\bnobody\s+(loves|likes|cares\s+about)\s+(you|u)\b/,
  /\byou\s+are\s+(nothing|a\s+joke|useless)\b/,

  // ── Slurs & hate speech ──
  /n+[i1!]+g+[e3]*r+s?\b/,
  /f+[a@]+g+[o0]*t+s?\b/,
  /\bk+[i1!]+k+e+s?\b/,
  /\btr+[a@]+nn+(y|ie|ies)\b/,
  /\bch+[i1!]+nk+s?\b/,
  /\bsp+[i1!]+c+s?\b/,
  /\bwetback/,
  /\bcoon(s)?\b/,
  /n[i1!]gg(a|er|ers|as)\b/,
  /\bret+a+r+d+(s|ed)?\b/,

  // ── Sexual harassment ──
  /\b(send|show)\s*(me\s*)?(nudes|tits|dick\s*pic|boobs|ass\s*pic)/,
  /\b(want|wanna|gonna)\s+(to\s+)?(rape|fuck|grope)\s+(you|u|her|him)\b/,
];

function localBlocklistCheck(
  normalizedText: string
): { blocked: true; pattern: string } | { blocked: false } {
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(normalizedText)) {
      return { blocked: true, pattern: pattern.source.substring(0, 50) };
    }
  }
  return { blocked: false };
}

// ── Google Perspective API ──────────────────────────────────────────────────

const PERSPECTIVE_ATTRIBUTES = Object.keys(
  PERSPECTIVE_THRESHOLDS
) as (keyof typeof PERSPECTIVE_THRESHOLDS)[];

async function perspectiveModerate(
  text: string
): Promise<
  | { available: true; allowed: true; scores: Record<string, number> }
  | { available: true; allowed: false; reason: string; scores: Record<string, number>; triggerAttr: string; triggerScore: number }
  | { available: false }
> {
  const key = process.env.PERSPECTIVE_API_KEY;
  if (!key) {
    console.warn("[moderation] PERSPECTIVE_API_KEY not set — Perspective unavailable");
    return { available: false };
  }

  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${key}`;

  try {
    const requestedAttributes: Record<string, object> = {};
    for (const attr of PERSPECTIVE_ATTRIBUTES) {
      requestedAttributes[attr] = {};
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        comment: { text },
        requestedAttributes,
        languages: ["en"],
      }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "(unreadable)");
      console.error(
        `[moderation] Perspective API ${res.status}: ${errBody.substring(0, 300)}`
      );
      return { available: false };
    }

    const data = await res.json();
    const attrScores = data.attributeScores || {};

    // Build scores map
    const scores: Record<string, number> = {};
    for (const attr of PERSPECTIVE_ATTRIBUTES) {
      scores[attr] = attrScores[attr]?.summaryScore?.value ?? 0;
    }

    // DEBUG: log every call so you can see raw scores in Vercel logs
    console.log("[moderation scores]", scores);

    // Check each attribute against its own threshold
    for (const attr of PERSPECTIVE_ATTRIBUTES) {
      const threshold = PERSPECTIVE_THRESHOLDS[attr];
      if (scores[attr] >= threshold) {
        console.warn(
          `[moderation] Perspective BLOCKED — ${attr}=${scores[attr].toFixed(4)} >= threshold ${threshold}`
        );
        return {
          available: true,
          allowed: false,
          reason: "Message blocked for safety.",
          scores,
          triggerAttr: attr,
          triggerScore: scores[attr],
        };
      }
    }

    return { available: true, allowed: true, scores };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[moderation] Perspective fetch error: ${msg}`);
    return { available: false };
  }
}

// ── Public API ──────────────────────────────────────────────────────────────

export interface ModerationResult {
  allowed: boolean;
  reason?: string;
  scores?: Record<string, number>;
  blockedBy?: "local" | "perspective";
}

/**
 * Moderate a message.  Call this BEFORE any database write.
 * If `allowed` is false the message MUST NOT be saved.
 */
export async function moderateMessage(
  text: string
): Promise<ModerationResult> {
  // ── Layer 1: Local blocklist (instant, no network) ──
  const cleaned = normalize(text);
  const local = localBlocklistCheck(cleaned);
  if (local.blocked) {
    console.warn(
      `[moderation] LOCAL BLOCKED — pattern="${local.pattern}" | normalized="${cleaned.substring(0, 80)}"`
    );
    return {
      allowed: false,
      reason: "Message blocked for safety.",
      blockedBy: "local",
    };
  }

  // ── Layer 2: Google Perspective API ──
  const perspective = await perspectiveModerate(text);

  if (perspective.available && !perspective.allowed) {
    return {
      allowed: false,
      reason: perspective.reason,
      scores: perspective.scores,
      blockedBy: "perspective",
    };
  }

  if (perspective.available && perspective.allowed) {
    return { allowed: true, scores: perspective.scores };
  }

  // Perspective is unavailable — allow through with local-only protection.
  // The local blocklist already ran above, so obvious toxic content was
  // already caught.  Log a warning so you can monitor availability.
  console.warn(
    "[moderation] Perspective unavailable — message allowed with local-only protection"
  );
  return { allowed: true };
}
