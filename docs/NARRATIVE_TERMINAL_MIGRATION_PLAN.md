# WhatUPB → "Bloomberg Terminal for Crypto Narratives" — Migration Plan

Status: **PLAN ONLY — no code or schema has been changed yet.**
Goal: detect emerging crypto narratives before they go mainstream, by aggregating
on-chain market data (GeckoTerminal) and classifying coins into narrative
categories, then surfacing Narrative Scores / Narrative Feed / Narrative Alerts
on top of the existing WhatUPB app — without rebuilding anything that already
works.

---

## 0. What stays exactly as-is

Per "do not rebuild from scratch," these are **untouched**:

- `profiles`, the auth flow, RLS policies, Turnstile, moderation/audit trail tables
- `messages` table and the `send_anonymous_signal()` RPC (anonymous coin
  signal submission from `/[username]`) — this is the *community sentiment*
  layer and is independent from the new *market-data* layer below
- `coin_rep_scores` and the existing `/api/cron/recalculate-rep` cron (15 min)
  — this keeps computing community bullish/bearish/chaos rep scores
- `news_items` table — kept as the underlying data store for raw headlines;
  not dropped, just demoted to a secondary section (see §6.2)
- All existing pages' auth, paywall, report/share/react functionality

Two scoring systems will coexist after this migration:

| Layer | Source | Table | What it answers |
|---|---|---|---|
| Community sentiment (existing) | Anonymous user signals | `coin_rep_scores` | "What do my followers think of $TICKER?" |
| Narrative intelligence (new) | GeckoTerminal market data + keyword classifier | `narratives` | "What crypto narrative is heating up right now?" |

---

## 1. Naming map

| Old | New | Surface |
|---|---|---|
| Rep Scores (home page leaderboard) | **Narrative Scores** | `/` |
| News | **Narrative Feed** | `/news` (URL kept, content changes — see §6.2) |
| Signal Feed | **Narrative Alerts** | new `/alerts` page (see §6.3 for why this isn't reusing `/inbox`) |

---

## 2. Decision points (recommended defaults — flag if you want something different)

**2.1 — The "signals" table name collides with the existing concept of
`messages.signal_type`** (bullish/bearish/chaos, user-submitted). To avoid two
unrelated things both being called "signals" in the codebase, the new table
described in your spec is named **`narrative_signals`** instead of `signals`.
Same columns you asked for, just disambiguated.

**2.2 — The new `coins` spec (`id, name, symbol, narrative, volume, liquidity`)
overlaps the existing `coins` table** (`ticker` PK, `name`, `chain`,
`contract_address`). Recreating it would break three existing foreign keys
(`coin_rep_scores.coin_ticker`, `messages.coin_ticker`, `news_items.coin_ticker`).
Instead: **extend the existing table** with `narrative_id`, `volume`,
`liquidity`. `ticker` continues to serve as `symbol` — no new `id` column,
no new PK. This is the literal interpretation of "reuse, don't rebuild."

**2.3 — Signal Feed → Narrative Alerts is a global, algorithmic feed**
(new-narrative-detected / momentum-spike alerts), not a per-user inbox. The
existing `/inbox` is personal — it shows anonymous messages sent *to a specific
logged-in user* — and that's core WhatUPB functionality that isn't going away.
Recommendation: keep `/inbox` exactly as-is (rename nothing inside it), and add
a **new page `/alerts`** for the global Narrative Alerts feed. Update the nav
link label "Signal Feed" → "Narrative Alerts" to point at `/alerts` instead of
`/inbox`. Personal inbox is still reachable (e.g. linked from Settings or kept
as "My Inbox" in the nav) so nothing is lost.

**2.4 — Momentum calculation needs a "previous score" to diff against.**
Simplest approach without adding a history table: store both `score` and
`previous_score` directly on `narratives`, and set `momentum = score -
previous_score` on every ingestion run. A proper time-series
(`narrative_score_history`) can be added later if you want trend sparklines —
out of scope for this migration.

---

## 3. New database migration — `supabase/migrations/<timestamp>_narrative_terminal.sql`

```sql
-- ── narratives ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.narratives (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        UNIQUE NOT NULL,
  score           NUMERIC(5,2) NOT NULL DEFAULT 50,
  previous_score  NUMERIC(5,2) NOT NULL DEFAULT 50,
  momentum        NUMERIC(6,2) NOT NULL DEFAULT 0,
  summary         TEXT,
  keywords        TEXT[]      NOT NULL DEFAULT '{}',  -- classification dictionary lives here
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.narratives ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Narratives are publicly readable" ON public.narratives FOR SELECT USING (true);

-- ── extend existing coins table (no new PK, no breaking changes) ───────────
ALTER TABLE public.coins
  ADD COLUMN IF NOT EXISTS narrative_id UUID REFERENCES public.narratives(id),
  ADD COLUMN IF NOT EXISTS volume       NUMERIC,
  ADD COLUMN IF NOT EXISTS liquidity    NUMERIC,
  ADD COLUMN IF NOT EXISTS updated_at   TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_coins_narrative_id ON public.coins (narrative_id);

-- ── narrative_signals (the "signals" table from the spec, disambiguated) ──
CREATE TABLE IF NOT EXISTS public.narrative_signals (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  narrative_id UUID        NOT NULL REFERENCES public.narratives(id) ON DELETE CASCADE,
  signal_type  TEXT        NOT NULL
    CONSTRAINT ck_narrative_signals_type
      CHECK (signal_type IN ('new_narrative_detected', 'momentum_spike', 'narrative_alert')),
  strength     NUMERIC(5,2) NOT NULL DEFAULT 0,
  reason       TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.narrative_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Narrative signals are publicly readable" ON public.narrative_signals FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS idx_narrative_signals_narrative ON public.narrative_signals (narrative_id, created_at DESC);
```

### Seed — `supabase/seed_narratives.sql`

Seeds the 10 categories as rows in `narratives`, each with a starter keyword
list for the classification engine:

```sql
INSERT INTO public.narratives (name, summary, keywords) VALUES
  ('AI Agents',       'Autonomous AI agent and LLM-themed tokens.',           ARRAY['ai','agent','gpt','llm','bot','autonomous']),
  ('Politics',        'Election, political figure, and policy-themed tokens.', ARRAY['trump','biden','election','vote','politic','maga']),
  ('Solana Culture',  'Solana-native meme and culture coins.',                ARRAY['solana','sol','bonk','wif','popcat']),
  ('Dog Coins',       'Dog-themed meme coins.',                               ARRAY['doge','shib','floki','inu','wif','bonk']),
  ('Cat Coins',       'Cat-themed meme coins.',                               ARRAY['cat','mew','popcat','kitty']),
  ('Gaming',          'Gaming and metaverse-themed tokens.',                  ARRAY['game','gaming','play','metaverse','rpg']),
  ('Base Ecosystem',  'Tokens native to the Base L2.',                        ARRAY['base','brett','toshi']),
  ('RWA',             'Real-world-asset tokenization narratives.',            ARRAY['rwa','realworld','tokenized','treasury','bond']),
  ('DePIN',           'Decentralized physical infrastructure tokens.',       ARRAY['depin','infra','node','bandwidth','storage','wifi']),
  ('Elon/XAI',        'Elon Musk / xAI-adjacent narrative tokens.',           ARRAY['elon','musk','xai','grok','tesla','x'])
ON CONFLICT (name) DO NOTHING;
```

---

## 4. GeckoTerminal ingestion service

**New file:** `src/app/api/cron/ingest-geckoterminal/route.ts`

Same pattern as the existing `recalculate-rep` cron: `GET` handler, guarded by
`CRON_SECRET`, uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS for writes.

```
GET https://api.geckoterminal.com/api/v2/networks/solana/trending_pools
```

Logic:
1. Fetch the endpoint (no API key required for this public free-tier endpoint;
   **verify the exact response shape against a live call before finalizing
   field mapping** — GeckoTerminal's JSON:API format nests token symbol/name
   under `included[]` cross-referenced by `relationships.base_token.data.id`,
   and volume/liquidity under `attributes.volume_usd.h24` /
   `attributes.reserve_in_usd`. Treat this as the expected shape, confirm with
   one real request during implementation.
2. For each pool: extract base-token `symbol`, `name`, `volume_usd.h24`,
   `reserve_in_usd`.
3. Run the classification engine (§5) on `name + symbol` → `narrative_id`
   (nullable — "Unclassified" is a valid outcome).
4. Upsert into `coins` (`ON CONFLICT (ticker) DO UPDATE`): `name`, `chain =
   'solana'`, `volume`, `liquidity`, `narrative_id`, `updated_at = now()`.
5. Recompute narrative aggregates: for every `narrative_id` touched, sum
   `coins.volume` / `coins.liquidity`, derive a new `score` (e.g. normalized
   0–100 against the sum across all narratives), set
   `previous_score = score`, `score = <new value>`,
   `momentum = score - previous_score`, `updated_at = now()`.
6. If `momentum` crosses a threshold (e.g. `> +15`), or a narrative goes from
   zero tracked coins to 1+ for the first time, insert a row into
   `narrative_signals` (`momentum_spike` / `new_narrative_detected`
   respectively).

**`vercel.json`** — add a second cron entry (your existing `recalculate-rep`
entry stays untouched):

```json
{
  "crons": [
    { "path": "/api/cron/recalculate-rep",       "schedule": "*/15 * * * *" },
    { "path": "/api/cron/ingest-geckoterminal",  "schedule": "*/10 * * * *" }
  ]
}
```

(You're on Vercel Pro, so sub-daily cron frequency is supported — Hobby plan
caps crons at once/day, so flagging this in case that ever matters.)

---

## 5. Narrative classification engine (keyword matching)

**New file:** `src/lib/narrative-classifier.ts`

```ts
// Keyword dictionary is the single source of truth, stored on
// narratives.keywords so it can be tuned via SQL without a redeploy.
// This module just does the matching.

export function classifyCoin(
  name: string,
  symbol: string,
  narratives: { id: string; name: string; keywords: string[] }[]
): string | null {
  const haystack = `${name} ${symbol}`.toLowerCase();
  let best: { id: string; matches: number } | null = null;

  for (const n of narratives) {
    const matches = n.keywords.filter((kw) => haystack.includes(kw.toLowerCase())).length;
    if (matches > 0 && (!best || matches > best.matches)) {
      best = { id: n.id, matches };
    }
  }
  return best?.id ?? null; // null = "Unclassified"
}
```

Known limitation to flag now rather than discover later: naive substring
matching will produce false positives where keywords overlap categories
(e.g. "doge" living in both Dog Coins and general meme culture, "x" in
Elon/XAI matching almost anything). Acceptable for v1 since it's explicitly
spec'd as keyword matching; a v2 could weight keywords or require multiple
matches before classifying.

---

## 6. UI changes, file by file

### 6.1 — Home page (`src/app/page.tsx`) → Narrative Scores

- Header copy: "Meme Coin Rep Scores" → "Narrative Scores"
- Query source switches from `coin_rep_scores` JOIN `coins` to `narratives`
  ordered by `score DESC`
- Columns: `Narrative | Score | Momentum` (reuses the existing `scoreColor` /
  `scoreBar` helpers — momentum can reuse the same color thresholds, green
  positive / red negative)

### 6.2 — `/news` page (`src/app/news/page.tsx` + `news-feed.tsx`) → Narrative Feed

- Primary view becomes a table: **Narrative | Score | Momentum | Top Coins |
  Summary** — `Top Coins` is `coins` filtered by `narrative_id`, ordered by
  `volume DESC LIMIT 3`
- The existing headline-card UI (sourced from `news_items`) is **not deleted**
  — demoted to a collapsible "Recent Headlines" section underneath, reusing
  the existing vibe-badge card component as-is
- Filter bar reused as-is, just re-pointed at narrative name instead of coin
  ticker

### 6.3 — New `/alerts` page → Narrative Alerts (replaces "Signal Feed" nav link)

- New files `src/app/alerts/page.tsx` + `alerts-feed.tsx`, cloned from the
  `/news` server+client pattern (SSR initial fetch, client-side 60s polling,
  filter pills) since that pattern already exists and works
- Source: `narrative_signals` joined to `narratives.name`
- Badge per `signal_type`: 🟢 **New Narrative Detected** / 🟠 **Momentum
  Spike** / 🔵 **Narrative Alert**
- Nav label "Signal Feed" → "Narrative Alerts", link target `/inbox` → `/alerts`
  on the home page, news page, and inbox page navs
- `/inbox` itself is untouched (per §2.3) — still the personal anonymous
  message inbox, just no longer the thing the "Narrative Alerts" nav link
  points to

---

## 7. Execution order

1. **Schema** — write & run the migration in §3, then `seed_narratives.sql`
2. **Classification engine** — add `src/lib/narrative-classifier.ts`
3. **Ingestion cron** — add `/api/cron/ingest-geckoterminal/route.ts`, verify
   live GeckoTerminal response shape with one manual fetch, finalize parsing
4. **Update `vercel.json`** — add the second cron entry
5. **Env vars** — confirm `CRON_SECRET` / `SUPABASE_SERVICE_ROLE_KEY` already
   present (they are, from the previous cron) — no new secrets needed unless
   GeckoTerminal later requires a paid API key
6. **Home page** — swap data source + copy (§6.1)
7. **Narrative Feed** — restructure `/news` (§6.2)
8. **Narrative Alerts** — build new `/alerts` page, update nav links (§6.3)
9. **Manual test pass**:
   - hit `/api/cron/ingest-geckoterminal` manually with the `Authorization:
     Bearer <CRON_SECRET>` header, confirm `coins` rows get `narrative_id` /
     `volume` / `liquidity` populated
   - confirm `narratives.score` / `momentum` update on a second run
   - confirm a `narrative_signals` row appears after a manual momentum spike
     (can fake by editing a `previous_score` value directly in SQL editor)
   - load `/`, `/news`, `/alerts` and visually confirm
10. **Commit + push + redeploy**, same workflow as every change so far in
    this project (PowerShell `git add/commit/push`, Vercel auto-deploys)

---

## 8. Risks

- **GeckoTerminal response shape drift / rate limits** — public free endpoint,
  no documented SLA; if it 429s or changes shape, the ingestion cron should
  fail soft (log + skip that run) rather than throwing, so it never takes the
  whole site down
- **Keyword classifier false positives** — flagged in §5, acceptable for v1
- **Momentum without history** — the two-column approach (§2.4) means you
  can't chart momentum over time yet, only see "did it go up or down since
  last run." Fine for an alert feed, not enough for a trend graph later
- **Two scoring systems may confuse users** if both "Rep Score" (community)
  and "Narrative Score" (market data) are visible at once without clear
  labeling — make sure copy on each page is explicit about which is which

---

## 9. What this plan deliberately does NOT do

- Does not touch `messages`, `send_anonymous_signal()`, Turnstile, moderation,
  or any auth/RLS policy
- Does not drop or rename any existing table or column
- Does not change the `/inbox` personal-message experience
- Does not add a paid GeckoTerminal API key, embeddings, or ML classification
  — keyword matching only, as spec'd

---

**Nothing in this plan has been executed.** Once you confirm the decision
points in §2 (especially 2.2 and 2.3), the next message can start at Phase 1.
