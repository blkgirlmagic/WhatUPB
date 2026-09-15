import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getReport } from "@/lib/intelligence-reports";

/**
 * GET /api/intelligence/download?session_id=cs_xxx&slug=clarity
 *
 * Security model:
 *  1. Verifies session_id with Stripe using STRIPE_SECRET_KEY (server-only).
 *  2. Confirms payment_status === "paid".
 *  3. Discovers the newest dated PDF for the slug inside Supabase Storage
 *     by listing {slug}/{YYYY-MM-DD}/ folders, sorting descending, and
 *     selecting the first .pdf file found.
 *  4. Generates a short-lived signed URL (10 min) via Supabase Storage
 *     using SUPABASE_SERVICE_ROLE_KEY (server-only — never exposed to client).
 *  5. Redirects the user to the signed URL.
 *
 * Nothing secret ever leaves the server. The client receives only a
 * time-limited signed storage URL that expires in 10 minutes.
 */

const BUCKET = "intelligence-briefs";
const SIGNED_URL_EXPIRY_SECONDS = 600; // 10 minutes

/** Returns true if the slug maps to a known report. */
function slugIsValid(slug: string): boolean {
  return !!getReport(slug);
}

/**
 * Dynamically discover the most-recently-dated PDF for a given slug.
 *
 * Bucket path convention: {slug}/{YYYY-MM-DD}/{filename}.pdf
 * Example: clarity/2026-09-14/whatupb-clarity-brief.pdf
 *
 * Steps:
 *  1. List immediate children of "{slug}/" in the bucket.
 *  2. Keep only items whose name matches YYYY-MM-DD.
 *  3. Sort descending so the newest date is first.
 *  4. List files inside that newest folder.
 *  5. Return the path to the first .pdf found.
 */
async function discoverStoragePath(
  supabase: SupabaseClient,
  slug: string
): Promise<string | null> {
  // Step 1–3: list and sort dated folders under {slug}/
  const { data: folders, error: foldersErr } = await supabase.storage
    .from(BUCKET)
    .list(slug, { limit: 100, sortBy: { column: "name", order: "desc" } });

  if (foldersErr || !folders) {
    console.error("[Intelligence] Failed to list storage folders:", foldersErr);
    return null;
  }

  const dateFolders = folders
    .filter((item) => /^\d{4}-\d{2}-\d{2}$/.test(item.name))
    .sort((a, b) => b.name.localeCompare(a.name));

  if (dateFolders.length === 0) {
    console.error("[Intelligence] No dated folders found under:", slug);
    return null;
  }

  const latestDate = dateFolders[0].name;

  // Step 4–5: list files in the newest dated folder, pick first .pdf
  const { data: files, error: filesErr } = await supabase.storage
    .from(BUCKET)
    .list(`${slug}/${latestDate}`, { limit: 50 });

  if (filesErr || !files) {
    console.error("[Intelligence] Failed to list files in dated folder:", filesErr);
    return null;
  }

  const pdf = files.find((f) => f.name.toLowerCase().endsWith(".pdf"));
  if (!pdf) {
    console.error("[Intelligence] No .pdf found in folder:", `${slug}/${latestDate}`);
    return null;
  }

  return `${slug}/${latestDate}/${pdf.name}`;
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

  if (!slugIsValid(slug)) {
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

  // Discover the newest dated PDF for this slug dynamically
  const storagePath = await discoverStoragePath(supabase, slug);
  if (!storagePath) {
    return NextResponse.json(
      { error: "Report file not found. Please contact support." },
      { status: 404 }
    );
  }

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
