import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { moderateWithHive } from "@/lib/moderation";
import { checkRateLimit } from "@/lib/rate-limit";
import { logModerationBlock } from "@/lib/moderation-log";
import { checkContentFilter, logBlockedMessage } from "@/lib/content-filter";
import { checkPoliticalFilter } from "@/lib/political-filter";
import { checkKeywordFallback, logCrisisIntercept, CRISIS_MESSAGE, ABUSE_MESSAGE } from "@/lib/crisis-interceptor";
import { sendNewMessageNotification } from "@/lib/email";
import { getSupabase as getServiceSupabase } from "@/lib/supabase";

// --- Supabase admin-free client for anonymous RPC calls ---
// No cookies needed — this route has no user session.
function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// --- Generic client error (never reveals why it failed) ---

const GENERIC_ERROR = { error: "Message could not be sent. Please try again." };

// --- Structured server-side logging ---

type RejectReason =
  | "missing_params"
  | "captcha_failed"
  | "captcha_misconfigured"
  | "validation_empty"
  | "validation_length"
  | "validation_links"
  | "crisis_intercept"
  | "abuse_intercept"
  | "content_filter"
  | "political_filter"
  | "rate_limit"
  | "recipient_not_found"
  | "rpc_error"
  | "unknown_error";

function logRejection(
  reason: RejectReason,
  ip: string,
  extra?: Record<string, unknown>
) {
  console.warn(
    JSON.stringify({
      event: "message_rejected",
      reason,
      ip: ip !== "unknown" ? hashIP(ip) : "unknown",
      timestamp: new Date().toISOString(),
      ...extra,
    })
  );
}

// --- Spam detection ---

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const MAX_LINKS = 2;

function validateContent(
  content: string
): { valid: true } | { valid: false; reason: RejectReason } {
  const trimmed = content?.trim();

  if (!trimmed || trimmed.length < 1) {
    return { valid: false, reason: "validation_empty" };
  }
  if (trimmed.length < 6) {
    return { valid: false, reason: "validation_length" };
  }
  if (trimmed.length > 1000) {
    return { valid: false, reason: "validation_length" };
  }

  const linkMatches = trimmed.match(URL_REGEX);
  if (linkMatches && linkMatches.length > MAX_LINKS) {
    return { valid: false, reason: "validation_links" };
  }

  return { valid: true };
}

// --- Turnstile verification ---

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    logRejection("captcha_misconfigured", ip);
    return false;
  }

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", ip);

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      body: formData,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );

  const data = await response.json();
  return data.success === true;
}

// --- IP hashing ---

function hashIP(ip: string): string {
  return crypto
    .createHash("sha256")
    .update(ip + "_whatupb_rate_limit")
    .digest("hex")
    .substring(0, 16);
}

// --- POST handler ---

export async function POST(request: NextRequest) {
  const clientIP =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  try {
    const body = await request.json();
    const { recipientId, content, turnstileToken } = body;

    // 1. Parameter validation
    if (
      !recipientId ||
      typeof recipientId !== "string" ||
      !content ||
      typeof content !== "string"
    ) {
      console.warn("[reject] missing_params — recipientId or content missing/invalid");
      logRejection("missing_params", clientIP);
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    // 2. Verify Turnstile CAPTCHA — only if the client sent a token AND server
    //    has the secret key.  If no token is sent, skip (frontend may not have
    //    the widget yet).  If a token IS sent but invalid → reject.
    if (turnstileToken && typeof turnstileToken === "string" && process.env.TURNSTILE_SECRET_KEY) {
      const turnstileValid = await verifyTurnstile(turnstileToken, clientIP);
      if (!turnstileValid) {
        console.warn("[reject] captcha_failed — Turnstile token invalid");
        logRejection("captcha_failed", clientIP);
        return NextResponse.json(GENERIC_ERROR, { status: 403 });
      }
    }

    // 3. Server-side content validation
    const contentCheck = validateContent(content);
    if (!contentCheck.valid) {
      console.warn(`[reject] validation — reason=${contentCheck.reason}, length=${content.trim().length}`);
      logRejection(contentCheck.reason, clientIP, {
        contentLength: content.length,
      });
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    // 4. Hash IP (needed for rate limiting + logging)
    const ipHash = clientIP !== "unknown" ? hashIP(clientIP) : null;

    // 5. In-memory rate limiting (per IP hash)
    const rateCheck = checkRateLimit(ipHash);
    if (!rateCheck.allowed) {
      console.warn(`[reject] rate_limit — resetMs=${rateCheck.resetMs}`);
      logRejection("rate_limit", clientIP, {
        resetMs: rateCheck.resetMs,
      });
      // Fire-and-forget: log rate-limit block to Supabase
      logModerationBlock({
        blockedBy: "rate_limit",
        reason: "rate_limit",
        scores: null,
        ipHash,
        recipientId,
      }).catch(() => {});
      return NextResponse.json({ error: "Slow down" }, { status: 429 });
    }

    // 5.4. Political content filter — blocks slogans, calls to action,
    //      partisan rhetoric, and geopolitical conflict statements.
    const politicalResult = checkPoliticalFilter(content.trim());
    if (politicalResult.blocked) {
      console.warn(
        `[reject] political_filter — reason=${politicalResult.reason}`
      );
      logRejection("political_filter", clientIP, {
        filterReason: politicalResult.reason,
      });
      // Fire-and-forget: log to blocked_messages table
      logBlockedMessage(politicalResult.reason!, ipHash).catch(() => {});
      return NextResponse.json(
        { error: "WhatUPB is for personal messages only. Political content isn't allowed here." },
        { status: 403 }
      );
    }

    // 5.5. Pre-moderation content filter — catches PII, spam, URLs, doxxing
    const filterResult = checkContentFilter(content.trim());
    if (filterResult.blocked) {
      console.warn(
        `[reject] content_filter — reason=${filterResult.reason}`
      );
      logRejection("content_filter", clientIP, {
        filterReason: filterResult.reason,
      });
      // Fire-and-forget: log to blocked_messages table
      logBlockedMessage(filterResult.reason!, ipHash).catch(() => {});
      return NextResponse.json(
        { error: "Message contains restricted content" },
        { status: 403 }
      );
    }

    // ─── 6. HIVE TEXT MODERATION — primary content moderator ────────────
    // POST to https://api.thehive.ai/v3/hive/text-moderation
    // Score thresholds:
    //   self_harm ≥ 0.7  → crisis (988 Lifeline resources)
    //   hate ≥ 0.5       → abuse (community guidelines)
    //   harassment ≥ 0.5 → abuse (community guidelines)
    //   violence ≥ 0.5   → abuse (community guidelines)
    //
    // Fallback: hardcoded keyword patterns if Hive is unreachable.
    const hive = await moderateWithHive(content.trim());

    if (hive.available && hive.blocked) {
      // ── Hive flagged the message ──────────────────────────────────────
      if (hive.action === "crisis") {
        // Self-harm → show 988 resources
        console.warn(`[reject] crisis — Hive self_harm=${hive.triggerScore?.toFixed(4)}`);
        logRejection("crisis_intercept", clientIP, {
          source: "hive",
          category: hive.triggerCategory,
          score: hive.triggerScore,
        });
        logCrisisIntercept(ipHash).catch(() => {});
        logBlockedMessage("crisis_intercept", ipHash).catch(() => {});
        logModerationBlock({
          blockedBy: "hive",
          reason: "crisis_intercept",
          scores: hive.scores,
          ipHash,
          recipientId,
        }).catch(() => {});
        return NextResponse.json(
          { crisis: true, message: CRISIS_MESSAGE },
          { status: 200 }
        );
      } else {
        // Hate / harassment / violence → community guidelines
        console.warn(`[reject] abuse — Hive ${hive.triggerCategory}=${hive.triggerScore?.toFixed(4)}`);
        logRejection("abuse_intercept", clientIP, {
          source: "hive",
          category: hive.triggerCategory,
          score: hive.triggerScore,
        });
        logBlockedMessage("abuse_intercept", ipHash).catch(() => {});
        logModerationBlock({
          blockedBy: "hive",
          reason: "abuse_intercept",
          scores: hive.scores,
          ipHash,
          recipientId,
        }).catch(() => {});
        return NextResponse.json(
          { error: ABUSE_MESSAGE },
          { status: 403 }
        );
      }
    }

    if (!hive.available) {
      // ── Hive unreachable — fall back to hardcoded keyword patterns ────
      console.warn("[moderation] Hive unavailable — using keyword fallback");
      const fallback = checkKeywordFallback(content.trim());
      if (fallback.intercepted) {
        if (fallback.type === "crisis") {
          console.warn("[reject] crisis — keyword fallback matched self-harm pattern");
          logRejection("crisis_intercept", clientIP, { source: "keyword_fallback" });
          logCrisisIntercept(ipHash).catch(() => {});
          logBlockedMessage("crisis_intercept", ipHash).catch(() => {});
          return NextResponse.json(
            { crisis: true, message: CRISIS_MESSAGE },
            { status: 200 }
          );
        } else {
          console.warn("[reject] abuse — keyword fallback matched abuse pattern");
          logRejection("abuse_intercept", clientIP, { source: "keyword_fallback" });
          logBlockedMessage("abuse_intercept", ipHash).catch(() => {});
          return NextResponse.json(
            { error: ABUSE_MESSAGE },
            { status: 403 }
          );
        }
      }
      // Fallback didn't catch anything — allow through with warning
      console.warn("[moderation] Hive unavailable, keyword fallback clear — allowing message");
    }

    // 7. Call the SECURITY DEFINER function
    const supabase = getSupabase();
    const { data, error } = await supabase.rpc("send_anonymous_message", {
      p_recipient_id: recipientId,
      p_content: content.trim(),
      p_ip_hash: ipHash,
      p_turnstile_token: turnstileToken || "",
    });

    if (error) {
      console.warn(`[reject] rpc_error — ${error.message}`);
      logRejection("rpc_error", clientIP, { supabaseError: error.message });
      return NextResponse.json(GENERIC_ERROR, { status: 500 });
    }

    // The DB function returns { success, error?, message_id? }
    if (!data.success) {
      // Map DB-level rejection to a log reason
      const dbError: string = data.error || "";
      let reason: RejectReason = "unknown_error";
      if (dbError.includes("rate") || dbError.includes("Too many")) {
        reason = "rate_limit";
      } else if (dbError.includes("Recipient")) {
        reason = "recipient_not_found";
      }
      console.warn(`[reject] db_rejection — reason=${reason}, dbError="${dbError}"`);
      logRejection(reason, clientIP, { dbError });
      return NextResponse.json(GENERIC_ERROR, { status: 429 });
    }

    // Send email notification to recipient before returning response
    // Must be awaited — Vercel kills the function after response is sent,
    // so fire-and-forget async code never executes on serverless.
    try {
      const adminClient = getServiceSupabase();
      const { data: profile, error: profileError } = await adminClient
        .from("profiles")
        .select("email, email_notifications, username")
        .eq("id", recipientId)
        .single();

      console.log("[email-notif] Profile lookup:", {
        recipientId,
        email: profile?.email ? `${profile.email.substring(0, 3)}***` : null,
        email_notifications: profile?.email_notifications,
        error: profileError?.message ?? null,
      });

      if (profile?.email && profile.email_notifications !== false) {
        console.log("[email-notif] Sending email to:", profile.email.substring(0, 3) + "***");
        await sendNewMessageNotification(profile.email, recipientId, profile.username);
        console.log("[email-notif] Email sent successfully");
      } else if (!profile?.email) {
        console.log("[email-notif] Skipped: no email on profile");
      } else {
        console.log("[email-notif] Skipped: notifications disabled");
      }
    } catch (emailErr) {
      // Email failure should never block message delivery
      console.error("[email-notif] Error:", emailErr instanceof Error ? emailErr.message : emailErr);
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logRejection("unknown_error", clientIP, {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
