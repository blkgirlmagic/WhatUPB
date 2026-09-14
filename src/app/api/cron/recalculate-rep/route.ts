import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
//  GET /api/cron/recalculate-rep
//
//  Called by Vercel Cron every 15 minutes (see vercel.json).
//  Also callable manually with the same Authorization header.
//
//  Auth: Authorization: Bearer <CRON_SECRET>
//
//  Logic:
//    1. Find all distinct coin_tickers that have at least one signal message
//    2. For each ticker, count bullish / bearish / chaos from the last 7 days
//    3. rep_score = round((bullish / total) * 100)  — defaults to 50 if no signals
//    4. Upsert into coin_rep_scores
// ---------------------------------------------------------------------------

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function GET(request: NextRequest) {
  // ── Auth ────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = getServiceClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  // ── 1. Get all distinct tickers that have ever had a signal ─────────────
  const { data: tickerRows, error: tickerErr } = await supabase
    .from("messages")
    .select("coin_ticker")
    .not("coin_ticker", "is", null);

  if (tickerErr) {
    console.error("[cron] Failed to fetch tickers:", tickerErr.message);
    return NextResponse.json({ error: tickerErr.message }, { status: 500 });
  }

  const tickers = [...new Set((tickerRows ?? []).map((r) => r.coin_ticker as string))];

  if (tickers.length === 0) {
    return NextResponse.json({ ok: true, updated: 0, message: "No signals found" });
  }

  // ── 2 & 3. Count signals per ticker and calculate score ─────────────────
  const upserts: {
    coin_ticker: string;
    rep_score: number;
    bullish_count: number;
    bearish_count: number;
    chaos_count: number;
    last_calculated: string;
  }[] = [];

  for (const ticker of tickers) {
    const { data: signals, error: signalErr } = await supabase
      .from("messages")
      .select("signal_type")
      .eq("coin_ticker", ticker)
      .not("signal_type", "is", null)
      .gte("created_at", sevenDaysAgo);

    if (signalErr) {
      console.error(`[cron] Failed to fetch signals for ${ticker}:`, signalErr.message);
      continue;
    }

    const bullish = (signals ?? []).filter((s) => s.signal_type === "bullish").length;
    const bearish = (signals ?? []).filter((s) => s.signal_type === "bearish").length;
    const chaos   = (signals ?? []).filter((s) => s.signal_type === "chaos").length;
    const total   = bullish + bearish + chaos;

    const repScore = total === 0 ? 50 : Math.round((bullish / total) * 100);

    upserts.push({
      coin_ticker:    ticker,
      rep_score:      repScore,
      bullish_count:  bullish,
      bearish_count:  bearish,
      chaos_count:    chaos,
      last_calculated: new Date().toISOString(),
    });
  }

  // ── 4. Upsert into coin_rep_scores ──────────────────────────────────────
  const { error: upsertErr } = await supabase
    .from("coin_rep_scores")
    .upsert(upserts, { onConflict: "coin_ticker" });

  if (upsertErr) {
    console.error("[cron] Upsert failed:", upsertErr.message);
    return NextResponse.json({ error: upsertErr.message }, { status: 500 });
  }

  console.log(`[cron] recalculate-rep: updated ${upserts.length} tickers`);
  return NextResponse.json({
    ok: true,
    updated: upserts.length,
    tickers: upserts.map((u) => ({ ticker: u.coin_ticker, score: u.rep_score })),
  });
}
