import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import crypto from "crypto";

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
      typeof content !== "string" ||
      !turnstileToken ||
      typeof turnstileToken !== "string"
    ) {
      logRejection("missing_params", clientIP);
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    // 2. Verify Turnstile CAPTCHA
    const turnstileValid = await verifyTurnstile(turnstileToken, clientIP);
    if (!turnstileValid) {
      logRejection("captcha_failed", clientIP);
      return NextResponse.json(GENERIC_ERROR, { status: 403 });
    }

    // 3. Server-side content validation
    const contentCheck = validateContent(content);
    if (!contentCheck.valid) {
      logRejection(contentCheck.reason, clientIP, {
        contentLength: content.length,
      });
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    // 4. Hash IP for rate limiting
    const ipHash = clientIP !== "unknown" ? hashIP(clientIP) : null;

    // 5. Call the SECURITY DEFINER function
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("send_anonymous_message", {
      p_recipient_id: recipientId,
      p_content: content.trim(),
      p_ip_hash: ipHash,
    });

    if (error) {
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
      logRejection(reason, clientIP, { dbError });
      return NextResponse.json(GENERIC_ERROR, { status: 429 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    logRejection("unknown_error", clientIP, {
      error: err instanceof Error ? err.message : "unknown",
    });
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
