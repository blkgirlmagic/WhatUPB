/**
 * GET /api/capitol/ingest
 *
 * Protected House PTR ingestion endpoint.
 *
 * Security:
 *   - Requires Authorization: Bearer {CRON_SECRET} header.
 *   - Vercel Cron Jobs send this header automatically when CRON_SECRET is
 *     set in Vercel environment variables.
 *   - In local development, pass the header manually:
 *       curl -H "Authorization: Bearer <your-CRON_SECRET>" http://localhost:3000/api/capitol/ingest
 *   - Returns 401 if the secret is missing or does not match.
 *   - Returns 503 if Supabase credentials are absent.
 *
 * Automation (Vercel Cron):
 *   Add to vercel.json (create if absent):
 *   {
 *     "crons": [
 *       {
 *         "path": "/api/capitol/ingest",
 *         "schedule": "0 6 * * *"
 *       }
 *     ]
 *   }
 *   This runs daily at 06:00 UTC. Set CRON_SECRET in Vercel env vars.
 *
 * Important: This route does NOT accept browser requests and is never
 * linked from any client component. It is server-infrastructure only.
 *
 * Do NOT modify Stripe, Intelligence, newsletter, or any other routes.
 */

import { NextRequest, NextResponse } from "next/server";
import { ingestHousePtrs } from "@/lib/ingest/house";

export const maxDuration = 60; // Request up to 60s (Vercel Pro). Adjust if on Hobby plan.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // ── Auth check ────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    console.error("[Capitol Ingest] CRON_SECRET is not set.");
    return NextResponse.json(
      { error: "Ingest endpoint not configured." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization");
  const provided = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  if (!provided || provided !== cronSecret) {
    console.warn("[Capitol Ingest] Unauthorized request.");
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  // ── Supabase credentials check ────────────────────────────────────────────
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    console.error("[Capitol Ingest] Missing Supabase credentials.");
    return NextResponse.json(
      { error: "Storage service unavailable." },
      { status: 503 }
    );
  }

  // ── Optional year override (e.g. ?year=2025 for backfill) ─────────────────
  const { searchParams } = new URL(request.url);
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam, 10) : undefined;

  if (yearParam && (isNaN(year!) || year! < 2012 || year! > 2100)) {
    return NextResponse.json(
      { error: "Invalid year parameter." },
      { status: 400 }
    );
  }

  // ── Run ingestion ─────────────────────────────────────────────────────────
  console.log(`[Capitol Ingest] Starting House PTR ingestion for year=${year ?? "current"}.`);

  const result = await ingestHousePtrs(year);

  console.log("[Capitol Ingest] Completed:", result);

  return NextResponse.json({
    ok: true,
    source: "U.S. House of Representatives",
    year: year ?? new Date().getFullYear(),
    ...result,
  });
}
