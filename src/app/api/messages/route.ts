import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { moderateMessage } from "@/lib/moderation";
import { checkRateLimit } from "@/lib/rate-limit";
import { logModerationBlock } from "@/lib/moderation-log";
import { checkContentFilter, logBlockedMessage } from "@/lib/content-filter";
import { checkPoliticalFilter } from "@/lib/political-filter";
import { checkCrisisIntercept, logCrisisIntercept, CRISIS_MESSAGE } from "@/lib/crisis-interceptor";
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
  | "moderation_blocked"
  | "content_filter"
  | "political_filter"
  | "crisis_intercept"
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

    // ─── 5.2. CRISIS KEYWORD SAFETY NET ───────────────────────────────
    // Two-layer check: queries crisis_keywords DB table first (cached 5 min),
    // then falls back to hardcoded regex patterns if DB is unreachable.
    // Runs BEFORE Perspective API and all other content filters.
    // Blocks the message and shows crisis resources to the sender.
    // Logs ONLY timestamp + IP hash — NO message content stored.
    const crisisCheck = await checkCrisisIntercept(content.trim());
    if (crisisCheck.intercepted) {
      console.warn(`[crisis-intercept] Self-harm language detected (source: ${crisisCheck.source}) — blocking message, showing resources`);
      logRejection("crisis_intercept", clientIP, { source: crisisCheck.source });
      // Fire-and-forget: log to crisis_intercepts table (timestamp + IP only)
      logCrisisIntercept(ipHash).catch(() => {});
      // Fire-and-forget: also log to blocked_messages for admin dashboard visibility
      logBlockedMessage("crisis_intercept", ipHash).catch(() => {});
      return NextResponse.json(
        { crisis: true, message: CRISIS_MESSAGE },
        { status: 200 }
      );
    }

    // 5.4. Political content filter — blocks slogans, calls to action,
    //      partisan rhetoric, and geopolitical conflict statements.
    //      Runs BEFORE content filter and Perspective API.
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
    //      Runs BEFORE Perspective API to save quota on obvious violations.
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

    // 6. Content moderation — HARD GUARD
    // Flow: moderate → allowed? → save.  NEVER save → moderate.
    // If moderation says no, return 403 immediately.  No DB write happens.
    const moderation = await moderateMessage(content.trim());
    if (!moderation.allowed) {
      console.warn(`[reject] moderation_blocked — blockedBy=${moderation.blockedBy}`, moderation.scores ?? {});
      logRejection("moderation_blocked", clientIP, {
        blockedBy: moderation.blockedBy,
        scores: moderation.scores,
      });
      // Fire-and-forget: log moderation block to Supabase
      logModerationBlock({
        blockedBy: moderation.blockedBy || "local",
        reason: "moderation_blocked",
        scores: moderation.scores || null,
        ipHash,
        recipientId,
      }).catch(() => {});
      return NextResponse.json(GENERIC_ERROR, { status: 403 });
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
