import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { classifyCoin, type NarrativeForClassification } from "@/lib/narrative-classifier";

// ---------------------------------------------------------------------------
//  GET /api/cron/ingest-geckoterminal
//
//  Called by Vercel Cron every 10 minutes (see vercel.json).
//  Also callable manually with the same Authorization header.
//
//  Auth: Authorization: Bearer <CRON_SECRET>
//
//  Logic:
//    1. Pull GeckoTerminal's Solana trending_pools feed
//    2. Extract token name / symbol / volume / liquidity / market cap / pool
//       address per pool (collapsing duplicate tickers to their
//       highest-volume pool)
//    3. Upsert into `coins`, classifying each coin into a narrative by
//       keyword match against narratives.keywords
//    4. Recompute every narrative's score + momentum from its currently
//       matched coins (volume, liquidity, coin count)
//    5. Write narrative_signals when: a narrative goes from 0 matched coins
//       to 1+, momentum jumps significantly, or matched volume spikes
//
//  This is intentionally simple: no ML/embeddings (keyword substring match
//  only), no cross-run history table (state is stored directly on
//  narratives.matched_coins / total_volume / total_liquidity and
//  overwritten each run).
//
//  NOTE: the request includes `?include=base_token,quote_token,dex` — without
//  it, GeckoTerminal's `included[]` array (where token name/symbol live) is
//  empty, which silently produces 0 extracted coins even though `data[]` has
//  pools. extractCoins() also falls back to parsing the pool's own
//  `attributes.name` (formatted "BASE / QUOTE", e.g. "PEPE / SOL") if the
//  included-token lookup still misses, and the 0-coins response includes a
//  `debug` block (pool/included counts + a raw sample) so a future failure
//  is diagnosable from the response body alone, without needing Vercel logs.
// ---------------------------------------------------------------------------

const GECKOTERMINAL_URL =
  "https://api.geckoterminal.com/api/v2/networks/solana/trending_pools?include=base_token,quote_token,dex";

const MOMENTUM_SPIKE_THRESHOLD = 15;  // score points gained in a single run
const VOLUME_SPIKE_RATIO = 1.5;       // 50%+ increase vs. last run
const VOLUME_SPIKE_MIN_USD = 5000;    // ignore noise on tiny pools

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}

// ── GeckoTerminal response shape (JSON:API) ─────────────────────────────────

type GeckoTokenAttrs = {
  name?: string;
  symbol?: string;
  address?: string;
};

type GeckoPoolAttrs = {
  address?: string;
  name?: string; // e.g. "PEPE / SOL" — used as a fallback ticker source
  volume_usd?: { h24?: string };
  reserve_in_usd?: string;
  market_cap_usd?: string | null;
  fdv_usd?: string | null;
};

type GeckoIncluded = {
  id: string;
  type: string;
  attributes?: GeckoTokenAttrs;
};

type GeckoPool = {
  id: string;
  type: string;
  attributes?: GeckoPoolAttrs;
  relationships?: {
    base_token?: { data?: { id?: string } };
  };
};

type GeckoTerminalResponse = {
  data?: GeckoPool[];
  included?: GeckoIncluded[];
};

type ExtractedCoin = {
  ticker: string;
  name: string;
  contract_address: string | null;
  pool_address: string | null;
  volume: number;
  liquidity: number;
  market_cap: number | null;
};

function num(value: string | null | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

type ExtractResult = {
  coins: ExtractedCoin[];
  poolsSeen: number;
  includedSeen: number;
  viaIncludedToken: number;
  viaPoolNameFallback: number;
  skipped: number;
};

function extractCoins(payload: GeckoTerminalResponse): ExtractResult {
  const pools = Array.isArray(payload.data) ? payload.data : [];
  const included = Array.isArray(payload.included) ? payload.included : [];
  const tokensById = new Map(
    included.filter((i) => i.type === "token").map((i) => [i.id, i])
  );

  // Multiple pools (different DEXes) can share a ticker — keep whichever
  // pool has the higher 24h volume.
  const byTicker = new Map<string, ExtractedCoin>();
  let viaIncludedToken = 0;
  let viaPoolNameFallback = 0;
  let skipped = 0;

  for (const pool of pools) {
    const tokenId = pool.relationships?.base_token?.data?.id;
    const token = tokenId ? tokensById.get(tokenId) : undefined;

    let symbol = token?.attributes?.symbol?.trim().toUpperCase();
    let name = token?.attributes?.name?.trim();

    if (symbol) {
      viaIncludedToken++;
    } else {
      // Fallback: GeckoTerminal pool names are conventionally formatted
      // "BASE / QUOTE" (e.g. "PEPE / SOL"), even when the included-token
      // cross-reference comes back empty (e.g. `include` wasn't honored,
      // or the relationship id didn't match anything in `included[]`).
      const poolName = pool.attributes?.name;
      const base = poolName?.split("/")[0]?.trim();
      if (base) {
        symbol = base.toUpperCase();
        name = name || base;
        viaPoolNameFallback++;
      }
    }

    if (!symbol) {
      skipped++;
      continue; // can't store/classify without a ticker
    }

    const volume = num(pool.attributes?.volume_usd?.h24);
    const liquidity = num(pool.attributes?.reserve_in_usd);
    const marketCapRaw = pool.attributes?.market_cap_usd ?? pool.attributes?.fdv_usd ?? null;

    const coin: ExtractedCoin = {
      ticker: symbol,
      name: name || symbol,
      contract_address: token?.attributes?.address ?? null,
      pool_address: pool.attributes?.address ?? null,
      volume,
      liquidity,
      market_cap: marketCapRaw != null ? num(marketCapRaw) : null,
    };

    const existing = byTicker.get(symbol);
    if (!existing || coin.volume > existing.volume) {
      byTicker.set(symbol, coin);
    }
  }

  return {
    coins: [...byTicker.values()],
    poolsSeen: pools.length,
    includedSeen: included.length,
    viaIncludedToken,
    viaPoolNameFallback,
    skipped,
  };
}

// ── Narrative aggregate recompute ───────────────────────────────────────────

type NarrativeRow = NarrativeForClassification & {
  score: number | string;
  momentum: number | string | null;
  matched_coins: number | null;
  total_volume: number | string | null;
  total_liquidity: number | string | null;
};

type HistoryInsert = {
  narrative_id: string;
  score: number;
  momentum: number;
  created_at: string;
};

type NarrativeUpdate = {
  id: string;
  name: string; // narratives.name is NOT NULL with no default — Postgres's
                // INSERT ... ON CONFLICT DO UPDATE still constructs (and
                // constraint-checks) the proposed row before it knows a
                // conflict will redirect it to an UPDATE, so this must
                // always be supplied even though the value never changes.
  score?: number;
  previous_score?: number;
  momentum?: number;
  matched_coins: number;
  total_volume: number;
  total_liquidity: number;
  updated_at: string;
};

type SignalInsert = {
  narrative_id: string;
  signal_type: "new_narrative_detected" | "momentum_spike" | "volume_spike";
  strength: number;
  reason: string;
};

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

  // ── 1. Fetch + parse trending pools (fail soft, never throw) ────────────
  let extraction: ExtractResult;
  let rawPayload: GeckoTerminalResponse;
  try {
    const res = await fetch(GECKOTERMINAL_URL, {
      headers: {
        Accept: "application/json;version=20230302",
      },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error(`[cron] GeckoTerminal returned ${res.status}`);
      return NextResponse.json({ ok: false, error: `GeckoTerminal ${res.status}` }, { status: 502 });
    }
    rawPayload = (await res.json()) as GeckoTerminalResponse;
    extraction = extractCoins(rawPayload);
  } catch (err) {
    console.error("[cron] GeckoTerminal fetch/parse failed:", err);
    return NextResponse.json({ ok: false, error: "fetch_failed" }, { status: 502 });
  }

  const coins = extraction.coins;

  if (coins.length === 0) {
    console.error(
      `[cron] extracted 0 coins — poolsSeen=${extraction.poolsSeen} includedSeen=${extraction.includedSeen} viaIncludedToken=${extraction.viaIncludedToken} viaPoolNameFallback=${extraction.viaPoolNameFallback} skipped=${extraction.skipped}`
    );
    return NextResponse.json({
      ok: true,
      coinsIngested: 0,
      message: "No coins extracted from response",
      debug: {
        poolsSeen: extraction.poolsSeen,
        includedSeen: extraction.includedSeen,
        viaIncludedToken: extraction.viaIncludedToken,
        viaPoolNameFallback: extraction.viaPoolNameFallback,
        skipped: extraction.skipped,
        samplePool: rawPayload.data?.[0] ?? null,
        sampleIncluded: rawPayload.included?.[0] ?? null,
      },
    });
  }

  // ── 2. Load narratives for classification + diffing ──────────────────────
  const { data: narrativeRows, error: narrativeErr } = await supabase
    .from("narratives")
    .select("id, name, keywords, score, momentum, matched_coins, total_volume, total_liquidity");

  if (narrativeErr) {
    console.error("[cron] Failed to load narratives:", narrativeErr.message);
    return NextResponse.json({ ok: false, error: narrativeErr.message }, { status: 500 });
  }
  const narratives = (narrativeRows ?? []) as NarrativeRow[];

  // ── 3. Classify + upsert coins ────────────────────────────────────────────
  const coinUpserts = coins.map((c) => ({
    ticker: c.ticker,
    name: c.name,
    chain: "solana",
    contract_address: c.contract_address,
    narrative_id: classifyCoin(c.name, c.ticker, narratives),
    volume: c.volume,
    liquidity: c.liquidity,
    market_cap: c.market_cap,
    pool_address: c.pool_address,
    updated_at: new Date().toISOString(),
  }));

  const { error: coinUpsertErr } = await supabase
    .from("coins")
    .upsert(coinUpserts, { onConflict: "ticker" });

  if (coinUpsertErr) {
    console.error("[cron] Coin upsert failed:", coinUpsertErr.message);
    return NextResponse.json({ ok: false, error: coinUpsertErr.message }, { status: 500 });
  }

  // ── 4. Recompute narrative aggregates + scores ────────────────────────────
  const narrativeUpdates: NarrativeUpdate[] = [];
  const signalInserts: SignalInsert[] = [];
  const now = new Date().toISOString();

  for (const n of narratives) {
    const matched = coinUpserts.filter((c) => c.narrative_id === n.id);
    const matchedCount = matched.length;
    const totalVolume = matched.reduce((sum, c) => sum + c.volume, 0);
    const totalLiquidity = matched.reduce((sum, c) => sum + c.liquidity, 0);

    const prevMatchedCount = n.matched_coins ?? 0;
    const prevVolume = Number(n.total_volume ?? 0);
    const prevScore = Number(n.score);

    if (matchedCount === 0) {
      // No live signal this run — reset trackers, leave the score alone.
      if (prevMatchedCount !== 0 || prevVolume !== 0) {
        narrativeUpdates.push({
          id: n.id,
          name: n.name,
          matched_coins: 0,
          total_volume: 0,
          total_liquidity: 0,
          updated_at: now,
        });
      }
      continue;
    }

    // Simple, bounded scoring — logarithmic so a handful of whale pools
    // can't single-handedly max out a narrative's score.
    const volumeScore = Math.min(100, Math.log10(totalVolume + 1) * 10);
    const liquidityScore = Math.min(100, Math.log10(totalLiquidity + 1) * 8);
    const coinCountScore = Math.min(100, matchedCount * 15);
    const newScore = Math.round(
      Math.max(0, Math.min(100, volumeScore * 0.4 + liquidityScore * 0.3 + coinCountScore * 0.3))
    );
    const momentum = newScore - prevScore;

    narrativeUpdates.push({
      id: n.id,
      name: n.name,
      score: newScore,
      previous_score: prevScore,
      momentum,
      matched_coins: matchedCount,
      total_volume: totalVolume,
      total_liquidity: totalLiquidity,
      updated_at: now,
    });

    // ── Signals ──────────────────────────────────────────────────────────
    if (prevMatchedCount === 0 && matchedCount > 0) {
      signalInserts.push({
        narrative_id: n.id,
        signal_type: "new_narrative_detected",
        strength: matchedCount,
        reason: `${n.name} now has ${matchedCount} trending coin${matchedCount === 1 ? "" : "s"} on Solana.`,
      });
    }

    if (momentum >= MOMENTUM_SPIKE_THRESHOLD) {
      signalInserts.push({
        narrative_id: n.id,
        signal_type: "momentum_spike",
        strength: momentum,
        reason: `${n.name} score rose ${momentum.toFixed(1)} points this run.`,
      });
    }

    const volumeJumped =
      totalVolume >= VOLUME_SPIKE_MIN_USD &&
      (prevVolume === 0 || totalVolume >= prevVolume * VOLUME_SPIKE_RATIO);
    if (volumeJumped) {
      const pct = prevVolume > 0 ? Math.round(((totalVolume - prevVolume) / prevVolume) * 100) : null;
      signalInserts.push({
        narrative_id: n.id,
        signal_type: "volume_spike",
        strength: totalVolume,
        reason: pct != null
          ? `${n.name} 24h volume jumped ${pct}% to $${Math.round(totalVolume).toLocaleString()}.`
          : `${n.name} 24h volume hit $${Math.round(totalVolume).toLocaleString()}.`,
      });
    }
  }

  if (narrativeUpdates.length > 0) {
    const { error: narrativeUpdateErr } = await supabase
      .from("narratives")
      .upsert(narrativeUpdates, { onConflict: "id" });
    if (narrativeUpdateErr) {
      console.error("[cron] Narrative update failed:", narrativeUpdateErr.message);
      return NextResponse.json({ ok: false, error: narrativeUpdateErr.message }, { status: 500 });
    }
  }

  // ── 5. Snapshot every narrative into narrative_history ────────────────────
  // One row per narrative per run, using whatever score/momentum is now
  // current — freshly recomputed this run if it was touched, otherwise
  // carried over unchanged from the load in step 2. This runs after the
  // `narratives` upsert above so the snapshot reflects what was just
  // persisted, not stale pre-run values.
  const historyInserts: HistoryInsert[] = narratives.map((n) => {
    const update = narrativeUpdates.find((u) => u.id === n.id);
    const score = update?.score ?? Number(n.score);
    const momentum = update?.momentum ?? Number(n.momentum ?? 0);
    return {
      narrative_id: n.id,
      score,
      momentum,
      created_at: now,
    };
  });

  let historyWritten = 0;
  let historyError: string | null = null;

  if (historyInserts.length > 0) {
    const { data: insertedHistory, error: historyErr } = await supabase
      .from("narrative_history")
      .insert(historyInserts)
      .select("id");

    if (historyErr) {
      console.error("[cron] History insert failed:", historyErr.message);
      historyError = historyErr.message;
    } else {
      historyWritten = insertedHistory?.length ?? 0;
      if (historyWritten !== historyInserts.length) {
        console.error(
          `[cron] History insert mismatch: attempted ${historyInserts.length}, confirmed ${historyWritten}`
        );
      }
    }
  }

  // signalsWritten only counts rows Postgres actually confirmed — never the
  // attempted count. `.select("id")` forces the insert to return the rows it
  // committed, so a partial/whole failure shows up as a shorter (or empty)
  // array rather than being assumed successful.
  let signalsWritten = 0;
  let signalError: string | null = null;

  if (signalInserts.length > 0) {
    const { data: insertedSignals, error: signalErr } = await supabase
      .from("narrative_signals")
      .insert(signalInserts)
      .select("id");

    if (signalErr) {
      // Coins + scores already saved — don't fail the whole run over this,
      // but don't pretend it succeeded either.
      console.error("[cron] Signal insert failed:", signalErr.message);
      signalError = signalErr.message;
    } else {
      signalsWritten = insertedSignals?.length ?? 0;
      if (signalsWritten !== signalInserts.length) {
        console.error(
          `[cron] Signal insert mismatch: attempted ${signalInserts.length}, confirmed ${signalsWritten}`
        );
      }
    }
  }

  console.log(
    `[cron] ingest-geckoterminal: ${coinUpserts.length} coins, ${narrativeUpdates.length} narratives updated, ${historyWritten} history rows, ${signalsWritten} signals written`
  );
  return NextResponse.json({
    ok: true,
    coinsIngested: coinUpserts.length,
    narrativesUpdated: narrativeUpdates.length,
    historyWritten,
    signalsWritten,
    ...(historyError ? { historyError } : {}),
    ...(signalError ? { signalError } : {}),
  });
}
