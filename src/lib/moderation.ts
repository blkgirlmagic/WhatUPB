// ---------------------------------------------------------------------------
//  Server-side content moderation for WhatUPB anonymous messages.
//
//  Primary: HIVE TEXT MODERATION API
//    POST https://api.thehive.ai/v3/hive/text-moderation
//    Bearer token auth with HIVE_API_KEY
//
//  Score thresholds (any score ≥ threshold → block):
//    self_harm ≥ 0.7   → crisis response (988 Lifeline resources)
//    hate ≥ 0.5        → abuse response (community guidelines violation)
//    harassment ≥ 0.5  → abuse response (community guidelines violation)
//    violence ≥ 0.5    → abuse response (community guidelines violation)
//
//  IMPORTANT: Hive returns multiple output entries — one per classification
//  model (sexual, hate, violence, etc.).  We must iterate ALL of them.
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
//
// Violence / hate / harassment at 0.5 to catch borderline cases.
const THRESHOLDS: [string, number, ModerationAction][] = [
  ["self_harm", 0.7, "crisis"],
  ["hate", 0.5, "abuse"],
  ["harassment", 0.5, "abuse"],
  ["violence", 0.5, "abuse"],
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
        `[moderation] Hive API ${res.status}: ${errBody.substring(0, 500)}`
      );
      return { available: false, blocked: false, action: null, scores: null };
    }

    const data = await res.json();

    // ── FULL RAW RESPONSE LOG — see exact Hive output in Vercel logs ──
    console.log("[moderation] Hive FULL response:", JSON.stringify(data, null, 2));

    // Hive returns: status[0].response.output[] — an ARRAY of output entries,
    // one per classification model (sexual, hate, violence, self_harm, etc.).
    // Each entry has its own classes[] array.  We must iterate ALL entries.
    const output = data?.status?.[0]?.response?.output;
    if (!output || !Array.isArray(output) || output.length === 0) {
      console.error(
        "[moderation] Hive response has unexpected shape — no output array.",
        "Keys:", JSON.stringify(Object.keys(data || {})),
        "status[0] keys:", JSON.stringify(Object.keys(data?.status?.[0] || {}))
      );
      return { available: false, blocked: false, action: null, scores: null };
    }

    // ── Collect classes from ALL output entries ──────────────────────────
    // BUG FIX: Previously only read output[0].classes, which was just the
    // first classification model.  Violence, hate, etc. live in separate
    // output entries and were being silently skipped.
    const scores: Record<string, number> = {};
    let totalClasses = 0;

    for (let i = 0; i < output.length; i++) {
      const classes: { class: string; score: number }[] =
        output[i]?.classes ?? [];

      for (const entry of classes) {
        scores[entry.class] = entry.score;
        totalClasses++;
      }
    }

    if (totalClasses === 0) {
      console.error(
        "[moderation] Hive returned no classes across all output entries.",
        "output.length:", output.length,
        "output[0] keys:", JSON.stringify(Object.keys(output[0] || {}))
      );
      return { available: false, blocked: false, action: null, scores: null };
    }

    // Log all class names + scores so we can see exactly what Hive returns
    console.log("[moderation] Hive scores:", JSON.stringify(scores));
    console.log(
      "[moderation] Hive class names:",
      Object.keys(scores).join(", "),
      `(${totalClasses} classes from ${output.length} output entries)`
    );

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
