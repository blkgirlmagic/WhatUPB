/**
 * GET /api/policy/ingest
 *
 * Cron-safe ingestion endpoint for the WhatUPB Policy pipeline.
 * Requires Authorization: Bearer <CRON_SECRET> header.
 *
 * Query params:
 *   ?dry_run=true  — Fetch and normalise from FR API but do NOT write to Supabase.
 *                    Returns sample records as JSON for inspection.
 *
 * Vercel cron will call this without ?dry_run.
 */

import { NextRequest, NextResponse } from "next/server";
import { ingestFederalRegister } from "@/lib/policy/ingest";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  // --- Auth ---
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET not configured" },
      { status: 503 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // --- Dry-run flag ---
  const dryRun = req.nextUrl.searchParams.get("dry_run") === "true";

  // --- Check Supabase credentials (unless dry run) ---
  if (!dryRun) {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase credentials not configured" },
        { status: 503 }
      );
    }
  }

  try {
    const result = await ingestFederalRegister(dryRun);

    return NextResponse.json({
      ok: true,
      dryRun,
      source: result.source,
      newRecords: result.newRecords,
      skipped: result.skipped,
      errors: result.errors,
      durationMs: result.durationMs,
      ...(dryRun && result.sample
        ? {
            totalFetched: result.sample.length,
            sample: result.sample,
          }
        : {}),
    });
  } catch (err) {
    console.error("[/api/policy/ingest] Error:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
