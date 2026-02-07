import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import crypto from "crypto";

// --- Spam detection ---

const URL_REGEX = /https?:\/\/[^\s]+/gi;
const MAX_LINKS = 2;

function validateContent(content: string): { valid: boolean; error?: string } {
  const trimmed = content?.trim();

  if (!trimmed || trimmed.length < 1) {
    return { valid: false, error: "Message cannot be empty." };
  }
  if (trimmed.length > 1000) {
    return { valid: false, error: "Message is too long (max 1000 characters)." };
  }

  const linkMatches = trimmed.match(URL_REGEX);
  if (linkMatches && linkMatches.length > MAX_LINKS) {
    return { valid: false, error: "Message contains too many links." };
  }

  return { valid: true };
}

// --- Turnstile verification ---

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    console.error("TURNSTILE_SECRET_KEY is not configured");
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
  try {
    const body = await request.json();
    const { recipientId, content, turnstileToken } = body;

    // 1. Parameter validation
    if (!recipientId || typeof recipientId !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid recipient." },
        { status: 400 }
      );
    }
    if (!content || typeof content !== "string") {
      return NextResponse.json(
        { error: "Missing message content." },
        { status: 400 }
      );
    }
    if (!turnstileToken || typeof turnstileToken !== "string") {
      return NextResponse.json(
        { error: "CAPTCHA verification required." },
        { status: 400 }
      );
    }

    // 2. Verify Turnstile CAPTCHA
    const clientIP =
      request.headers.get("cf-connecting-ip") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const turnstileValid = await verifyTurnstile(turnstileToken, clientIP);
    if (!turnstileValid) {
      return NextResponse.json(
        { error: "CAPTCHA verification failed. Please try again." },
        { status: 403 }
      );
    }

    // 3. Server-side content validation
    const contentCheck = validateContent(content);
    if (!contentCheck.valid) {
      return NextResponse.json(
        { error: contentCheck.error },
        { status: 400 }
      );
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
      console.error("Supabase RPC error:", error);
      return NextResponse.json(
        { error: "Failed to send message. Please try again." },
        { status: 500 }
      );
    }

    // The DB function returns { success, error?, message_id? }
    if (!data.success) {
      return NextResponse.json(
        { error: data.error },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: true, messageId: data.message_id },
      { status: 201 }
    );
  } catch (err) {
    console.error("API route error:", err);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
