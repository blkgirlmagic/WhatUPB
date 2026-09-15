import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { getReport } from "@/lib/intelligence-reports";

/**
 * GET /api/intelligence/download?session_id=cs_xxx&slug=clarity
 *
 * Security model:
 *  1. Verifies session_id with Stripe using STRIPE_SECRET_KEY (server-only).
 *  2. Confirms payment_status === "paid".
 *  3. Generates a short-lived signed URL (10 min) via Supabase Storage
 *     using SUPABASE_SERVICE_ROLE_KEY (server-only — never exposed to client).
 *  4. Redirects the user to the signed URL.
 *
 * Nothing secret ever leaves the server. The client receives only a
 * time-limited signed storage URL that expires in 10 minutes.
 */

// Storage path pattern: "brief-{briefNumber}/{filename}.pdf"
const BUCKET = "intelligence-briefs";
const SIGNED_URL_EXPIRY_SECONDS = 600; // 10 minutes

function storagePathForSlug(slug: string): string | null {
  const report = getReport(slug);
  if (!report) return null;
  const num = report.briefNumber.padStart(3, "0");
  return `brief-${num}/whatupb-${slug}-${report.publicationDate.toLowerCase().replace(/\s+/g, "-")}.pdf`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const slug = searchParams.get("slug");

  // ── Input validation ───────────────────────────────────────────────────────
  if (!sessionId || !slug) {
    return NextResponse.json(
      { error: "Missing session_id or slug." },
      { status: 400 }
    );
  }

  const storagePath = storagePathForSlug(slug);
  if (!storagePath) {
    return NextResponse.json(
      { error: "Unknown report slug." },
      { status: 404 }
    );
  }

  // ── Stripe verification ───────────────────────────────────────────────────
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("[Intelligence] STRIPE_SECRET_KEY is not set.");
    return NextResponse.json(
      { error: "Payment verification unavailable." },
      { status: 503 }
    );
  }

  let session: Stripe.Checkout.Session;
  try {
    const stripe = new Stripe(stripeKey, { apiVersion: "2026-02-25.clover" });
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    console.error("[Intelligence] Stripe session retrieval failed:", err);
    return NextResponse.json(
      { error: "Could not verify payment session." },
      { status: 402 }
    );
  }

  if (session.payment_status !== "paid") {
    return NextResponse.json(
      { error: "Payment not confirmed." },
      { status: 402 }
    );
  }

  // ── Supabase signed URL (service-role, server-only) ────────────────────────
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[Intelligence] Missing Supabase credentials for storage.");
    return NextResponse.json(
      { error: "Storage service unavailable." },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY_SECONDS);

  if (error || !data?.signedUrl) {
    console.error("[Intelligence] Supabase signed URL error:", error);
    return NextResponse.json(
      { error: "Could not generate download link. Please contact support." },
      { status: 500 }
    );
  }

  // ── Redirect to signed URL ─────────────────────────────────────────────────
  return NextResponse.redirect(data.signedUrl);
}
