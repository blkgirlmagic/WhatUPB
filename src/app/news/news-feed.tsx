"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";
import { DiagonalLines } from "@/components/diagonal-lines";

// ── Types ───────────────────────────────────────────────────────────────────

type Vibe = "bullish" | "bearish" | "chaos" | "neutral";

type NewsItem = {
  id: string;
  coin_ticker: string;
  headline: string;
  vibe: Vibe | null;
  source_url: string | null;
  signal_count: number;
  created_at: string;
};

// ── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const secs = Math.floor(diff / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

const VIBE_CONFIG: Record<Vibe, { label: string; icon: string; color: string; bg: string; border: string }> = {
  bullish: { label: "BULLISH", icon: "▲", color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.28)" },
  bearish: { label: "BEARISH", icon: "▼", color: "#ef4444", bg: "rgba(239,68,68,0.10)", border: "rgba(239,68,68,0.28)" },
  chaos:   { label: "CHAOS",   icon: "⚡", color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)" },
  neutral: { label: "NEUTRAL", icon: "●", color: "#71717a", bg: "rgba(113,113,122,0.10)", border: "rgba(113,113,122,0.22)" },
};

const VIBES: Vibe[] = ["bullish", "bearish", "chaos", "neutral"];
const REFRESH_MS = 60_000;

// ── Component ────────────────────────────────────────────────────────────────

export default function NewsFeed({
  initialItems,
  user,
}: {
  initialItems: NewsItem[];
  user: User | null;
}) {
  const [items, setItems]           = useState<NewsItem[]>(initialItems);
  const [vibeFilter, setVibeFilter] = useState<Vibe | null>(null);
  const [tickerFilter, setTickerFilter] = useState("");
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown]   = useState(REFRESH_MS / 1000);
  const supabase = createClient();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchItems = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from("news_items")
      .select("id, coin_ticker, headline, vibe, source_url, signal_count, created_at")
      .order("created_at", { ascending: false })
      .limit(60);
    if (data) setItems(data as NewsItem[]);
    setLastRefreshed(new Date());
    setCountdown(REFRESH_MS / 1000);
    setRefreshing(false);
  }, [supabase]);

  // ── Auto-refresh every 60 s ────────────────────────────────────────────
  useEffect(() => {
    const pollInterval = setInterval(fetchItems, REFRESH_MS);

    // 1-second countdown ticker
    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchItems]);

  // ── Filtered view ─────────────────────────────────────────────────────
  const visible = items.filter((item) => {
    if (vibeFilter && item.vibe !== vibeFilter) return false;
    if (tickerFilter.trim()) {
      const t = tickerFilter.trim().toUpperCase();
      if (!item.coin_ticker.toUpperCase().includes(t)) return false;
    }
    return true;
  });

  // ── Inline style constants ────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(190,185,215,0.45)",
    borderRadius: "16px",
    padding: "18px 20px",
    marginBottom: "10px",
    boxShadow:
      "0 1px 0 rgba(255,255,255,1) inset, 0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)",
    transition: "box-shadow 0.15s",
    display: "flex",
    flexDirection: "column" as const,
    gap: "10px",
  };

  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">WhatUPB</Link>
        <div className="nav-links">
          <Link href="/news" style={{ color: "var(--ink)", fontWeight: 500 }}>Narrative Feed</Link>
          <Link href="/alerts">Narrative Alerts</Link>
          <Link href="/leaderboard">Leaderboard</Link>
          {user ? (
            <>
              <Link href="/inbox">My Inbox</Link>
              <Link href="/settings" className="nav-cta">Settings</Link>
            </>
          ) : (
            <>
              <Link href="/login">Login</Link>
              <Link href="/signup" className="nav-cta">Get Started</Link>
            </>
          )}
        </div>
      </nav>

      {/* ── Page body ────────────────────────────────────────────────────── */}
      <div className="inbox-page-wrap">

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "8px" }}>
          <div>
            <div style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontSize: "28px", fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.5px", marginBottom: "4px" }}>
              Narrative Feed
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>
              {visible.length} item{visible.length !== 1 ? "s" : ""}
              {vibeFilter || tickerFilter ? " (filtered)" : ""}
            </p>
          </div>

          {/* Live indicator */}
          <button
            onClick={fetchItems}
            disabled={refreshing}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "6px 12px", borderRadius: "50px",
              border: "1px solid rgba(34,197,94,0.25)",
              background: "rgba(34,197,94,0.06)",
              color: refreshing ? "#71717a" : "#22c55e",
              fontSize: "11px", fontWeight: 600,
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              cursor: refreshing ? "default" : "pointer",
              letterSpacing: "0.06em",
              transition: "all 0.15s",
            }}
          >
            <span style={{
              width: 7, height: 7, borderRadius: "50%",
              background: refreshing ? "#71717a" : "#22c55e",
              display: "inline-block",
              animation: refreshing ? "none" : "pulse-dot 2s ease-in-out infinite",
            }} />
            {refreshing ? "UPDATING…" : `LIVE · ${countdown}s`}
          </button>
        </div>

        {/* ── Filter bar ───────────────────────────────────────────────── */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          {/* Vibe pills */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <button
              onClick={() => setVibeFilter(null)}
              style={{
                padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 600,
                border: !vibeFilter ? "1.5px solid rgba(155,142,232,0.6)" : "1px solid rgba(155,142,232,0.18)",
                background: !vibeFilter ? "rgba(155,142,232,0.12)" : "rgba(255,255,255,0.7)",
                color: !vibeFilter ? "var(--lav)" : "var(--muted)",
                cursor: "pointer", transition: "all 0.15s",
                fontFamily: "var(--font-ibm-plex-mono), monospace",
                letterSpacing: "0.04em",
              }}
            >
              ALL
            </button>
            {VIBES.map((v) => {
              const cfg = VIBE_CONFIG[v];
              const active = vibeFilter === v;
              return (
                <button
                  key={v}
                  onClick={() => setVibeFilter(active ? null : v)}
                  style={{
                    padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700,
                    border: active ? `1.5px solid ${cfg.border}` : "1px solid rgba(155,142,232,0.15)",
                    background: active ? cfg.bg : "rgba(255,255,255,0.7)",
                    color: active ? cfg.color : "var(--muted)",
                    cursor: "pointer", transition: "all 0.15s",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  {cfg.icon} {cfg.label}
                </button>
              );
            })}
          </div>

          {/* Ticker search */}
          <input
            type="text"
            value={tickerFilter}
            onChange={(e) => setTickerFilter(e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase())}
            placeholder="Filter by ticker…"
            style={{
              padding: "7px 14px", borderRadius: "50px",
              border: tickerFilter ? "1.5px solid rgba(155,142,232,0.4)" : "1px solid rgba(155,142,232,0.18)",
              background: "rgba(255,255,255,0.7)",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              fontSize: "12px", fontWeight: 600,
              color: "var(--lav)", letterSpacing: "0.08em",
              outline: "none", width: "150px",
              transition: "border-color 0.15s",
            }}
          />
        </div>

        {/* ── News cards ───────────────────────────────────────────────── */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.25 }}>📰</div>
            <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              No news items yet
            </p>
            <p style={{ color: "var(--muted)", fontSize: "13px" }}>
              {vibeFilter || tickerFilter ? "Try clearing the filter." : "Check back soon."}
            </p>
            {(vibeFilter || tickerFilter) && (
              <button
                onClick={() => { setVibeFilter(null); setTickerFilter(""); }}
                style={{ marginTop: "16px", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", background: "none", border: "1px solid rgba(155,142,232,0.3)", color: "var(--lav)", cursor: "pointer" }}
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div>
            {visible.map((item) => {
              const cfg = item.vibe ? VIBE_CONFIG[item.vibe] : null;
              return (
                <article key={item.id} style={card}>
                  {/* Top row: vibe badge + ticker + time */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    {cfg && (
                      <span style={{
                        fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                        padding: "3px 9px", borderRadius: "4px",
                        background: cfg.bg, border: `1px solid ${cfg.border}`,
                        color: cfg.color,
                        fontFamily: "var(--font-ibm-plex-mono), monospace",
                      }}>
                        {cfg.icon} {cfg.label}
                      </span>
                    )}
                    <span style={{
                      fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em",
                      padding: "3px 9px", borderRadius: "4px",
                      background: "rgba(155,142,232,0.08)", border: "1px solid rgba(155,142,232,0.2)",
                      color: "var(--lav)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                    }}>
                      ${item.coin_ticker}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto", whiteSpace: "nowrap" as const }}>
                      {timeAgo(item.created_at)}
                    </span>
                  </div>

                  {/* Headline */}
                  {item.source_url ? (
                    <a
                      href={item.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        fontSize: "16px", fontWeight: 700, lineHeight: 1.4,
                        color: "var(--ink)", textDecoration: "none",
                        transition: "color 0.15s",
                        display: "block",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lav)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ink)")}
                    >
                      {item.headline}
                    </a>
                  ) : (
                    <p style={{
                      fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                      fontSize: "16px", fontWeight: 700, lineHeight: 1.4,
                      color: "var(--ink)", margin: 0,
                    }}>
                      {item.headline}
                    </p>
                  )}

                  {/* Footer row: signal count + source link */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "6px" }}>
                    <span style={{
                      fontSize: "11px", color: "var(--muted)",
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                      display: "flex", alignItems: "center", gap: "4px",
                    }}>
                      <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ opacity: 0.5 }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h18M3 17h18" />
                      </svg>
                      {item.signal_count.toLocaleString()} signal{item.signal_count !== 1 ? "s" : ""}
                    </span>
                    {item.source_url && (
                      <a
                        href={item.source_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "11px", color: "var(--muted)", textDecoration: "none",
                          display: "flex", alignItems: "center", gap: "3px",
                          transition: "color 0.15s",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--lav)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--muted)")}
                      >
                        Source
                        <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                      </a>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* Last refreshed */}
        <div style={{ textAlign: "center", marginTop: "16px", fontSize: "11px", color: "rgba(26,23,48,0.25)", fontFamily: "var(--font-ibm-plex-mono), monospace" }}>
          Last updated {timeAgo(lastRefreshed.toISOString())} · auto-refreshes every 60s
        </div>
      </div>

      {/* pulse-dot keyframe injected inline */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
