// ---------------------------------------------------------------------------
//  Server-side content moderation for WhatUPB anonymous messages.
//
//  Primary: HIVE TEXT MODERATION API
//    POST https://api.thehive.ai/v3/hive/text-moderation
//    Bearer token auth with HIVE_API_KEY
//
//  Score thresholds (any score ≥ threshold → block):
//    self_harm ≥ 0.7   → crisis response (988 Lifeline resources)
//    hate ≥ 0.7        → abuse response (community guidelines violation)
//    harassment ≥ 0.7  → abuse response (community guidelines violation)
//    violence ≥ 0.7    → abuse response (community guidelines violation)
//
//  Fallback: If the Hive API is unreachable the API route falls back to
//  hardcoded keyword patterns in crisis-interceptor.ts.
// ---------------------------------------------------------------------------

export type ModerationAction = "crisis" | "abuse";

export interface HiveModerationResult {
  available: boolean;
  blocked: boolean;
  action: ModerationAction | null;
  scores: Record<string, number> | null;
  triggerCategory?: string;
  triggerScore?: number;
}

const HIVE_URL = "https://api.thehive.ai/v3/hive/text-moderation";

// Score thresholds — self_harm is checked FIRST so crisis always takes
// priority over abuse when both categories fire simultaneously.
const THRESHOLDS: [string, number, ModerationAction][] = [
  ["self_harm", 0.7, "crisis"],
  ["hate", 0.7, "abuse"],
  ["harassment", 0.7, "abuse"],
  ["violence", 0.7, "abuse"],
];

/**
 * Moderate message text using the Hive Text Moderation API.
 *
 * Returns `{ available: false }` if the API is unreachable — the caller
 * should fall back to hardcoded keyword patterns.
 */
export async function moderateWithHive(
  text: string
): Promise<HiveModerationResult> {
  const apiKey = process.env.HIVE_API_KEY;
  if (!apiKey) {
    console.warn("[moderation] HIVE_API_KEY not set — Hive unavailable");
    return { available: false, blocked: false, action: null, scores: null };
  }

  try {
    const res = await fetch(HIVE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ text_data: text }),
      signal: AbortSignal.timeout(8_000),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => "(unreadable)");
      console.error(
        `[moderation] Hive API ${res.status}: ${errBody.substring(0, 300)}`
      );
      return { available: false, blocked: false, action: null, scores: null };
    }

    const data = await res.json();

    // Hive response shape: status[0].response.output[0].classes[]
    const classes: { class: string; score: number }[] =
      data?.status?.[0]?.response?.output?.[0]?.classes ?? [];

    // Build scores map
    const scores: Record<string, number> = {};
    for (const entry of classes) {
      scores[entry.class] = entry.score;
    }

    // DEBUG: log every call so you can see raw scores in Vercel logs
    console.log("[moderation] Hive scores:", JSON.stringify(scores));

    // Check thresholds — self_harm first (crisis), then hate/harassment/violence
    for (const [category, threshold, action] of THRESHOLDS) {
      const score = scores[category] ?? 0;
      if (score >= threshold) {
        console.warn(
          `[moderation] Hive BLOCKED — ${category}=${score.toFixed(4)} >= ${threshold}`
        );
        return {
          available: true,
          blocked: true,
          action,
          scores,
          triggerCategory: category,
          triggerScore: score,
        };
      }
    }

    return { available: true, blocked: false, action: null, scores };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[moderation] Hive fetch error: ${msg}`);
    return { available: false, blocked: false, action: null, scores: null };
  }
}
