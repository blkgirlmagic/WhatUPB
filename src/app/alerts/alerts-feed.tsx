"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase-browser";
import { DiagonalLines } from "@/components/diagonal-lines";

// ── Types ───────────────────────────────────────────────────────────────────

export type SignalType = "new_narrative_detected" | "momentum_spike" | "narrative_alert";

export type Alert = {
  id: string;
  signal_type: SignalType;
  strength: number;
  reason: string | null;
  created_at: string;
  narratives: { name: string } | null;
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

const SIGNAL_CONFIG: Record<SignalType, { label: string; icon: string; color: string; bg: string; border: string }> = {
  new_narrative_detected: { label: "NEW NARRATIVE", icon: "🟢", color: "#22c55e", bg: "rgba(34,197,94,0.10)", border: "rgba(34,197,94,0.28)" },
  momentum_spike:         { label: "MOMENTUM SPIKE", icon: "🟠", color: "#f59e0b", bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.28)" },
  narrative_alert:        { label: "ALERT",           icon: "🔵", color: "#3b82f6", bg: "rgba(59,130,246,0.10)", border: "rgba(59,130,246,0.26)" },
};

const SIGNAL_TYPES: SignalType[] = ["new_narrative_detected", "momentum_spike", "narrative_alert"];
const REFRESH_MS = 60_000;

// ── Component ────────────────────────────────────────────────────────────────

export default function AlertsFeed({
  initialAlerts,
  user,
}: {
  initialAlerts: Alert[];
  user: User | null;
}) {
  const [alerts, setAlerts]           = useState<Alert[]>(initialAlerts);
  const [typeFilter, setTypeFilter]   = useState<SignalType | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [refreshing, setRefreshing]   = useState(false);
  const [countdown, setCountdown]     = useState(REFRESH_MS / 1000);
  const supabase = createClient();
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchAlerts = useCallback(async () => {
    setRefreshing(true);
    const { data } = await supabase
      .from("narrative_signals")
      .select("id, signal_type, strength, reason, created_at, narratives(name)")
      .order("created_at", { ascending: false })
      .limit(60);
    if (data) setAlerts(data as unknown as Alert[]);
    setLastRefreshed(new Date());
    setCountdown(REFRESH_MS / 1000);
    setRefreshing(false);
  }, [supabase]);

  // ── Auto-refresh every 60 s ────────────────────────────────────────────
  useEffect(() => {
    const pollInterval = setInterval(fetchAlerts, REFRESH_MS);

    countdownRef.current = setInterval(() => {
      setCountdown((c) => (c <= 1 ? REFRESH_MS / 1000 : c - 1));
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [fetchAlerts]);

  // ── Filtered view ─────────────────────────────────────────────────────
  const visible = alerts.filter((a) => !typeFilter || a.signal_type === typeFilter);

  // ── Inline style constants ────────────────────────────────────────────
  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(190,185,215,0.45)",
    borderRadius: "16px",
    padding: "18px 20px",
    marginBottom: "10px",
    boxShadow:
      "0 1px 0 rgba(255,255,255,1) inset, 0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)",
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
          <Link href="/news">Narrative Feed</Link>
          <Link href="/alerts" style={{ color: "var(--ink)", fontWeight: 500 }}>Narrative Alerts</Link>
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
              Narrative Alerts
            </div>
            <p style={{ fontSize: "13px", color: "var(--muted)" }}>
              {visible.length} alert{visible.length !== 1 ? "s" : ""}
              {typeFilter ? " (filtered)" : ""}
            </p>
          </div>

          {/* Live indicator */}
          <button
            onClick={fetchAlerts}
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
        <div style={{ marginBottom: "20px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
          <button
            onClick={() => setTypeFilter(null)}
            style={{
              padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 600,
              border: !typeFilter ? "1.5px solid rgba(155,142,232,0.6)" : "1px solid rgba(155,142,232,0.18)",
              background: !typeFilter ? "rgba(155,142,232,0.12)" : "rgba(255,255,255,0.7)",
              color: !typeFilter ? "var(--lav)" : "var(--muted)",
              cursor: "pointer",
              fontFamily: "var(--font-ibm-plex-mono), monospace",
              letterSpacing: "0.04em",
            }}
          >
            ALL
          </button>
          {SIGNAL_TYPES.map((t) => {
            const cfg = SIGNAL_CONFIG[t];
            const active = typeFilter === t;
            return (
              <button
                key={t}
                onClick={() => setTypeFilter(active ? null : t)}
                style={{
                  padding: "6px 14px", borderRadius: "50px", fontSize: "12px", fontWeight: 700,
                  border: active ? `1.5px solid ${cfg.border}` : "1px solid rgba(155,142,232,0.15)",
                  background: active ? cfg.bg : "rgba(255,255,255,0.7)",
                  color: active ? cfg.color : "var(--muted)",
                  cursor: "pointer",
                  fontFamily: "var(--font-ibm-plex-mono), monospace",
                  letterSpacing: "0.05em",
                }}
              >
                {cfg.icon} {cfg.label}
              </button>
            );
          })}
        </div>

        {/* ── Alert cards ──────────────────────────────────────────────── */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <div style={{ fontSize: "32px", marginBottom: "12px", opacity: 0.25 }}>📡</div>
            <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "15px", marginBottom: "6px" }}>
              No alerts yet
            </p>
            <p style={{ color: "var(--muted)", fontSize: "13px", maxWidth: "320px", margin: "0 auto" }}>
              {typeFilter
                ? "Try clearing the filter."
                : "Alerts fire when a new narrative is detected or an existing one spikes in momentum."}
            </p>
            {typeFilter && (
              <button
                onClick={() => setTypeFilter(null)}
                style={{ marginTop: "16px", padding: "8px 20px", borderRadius: "50px", fontSize: "13px", background: "none", border: "1px solid rgba(155,142,232,0.3)", color: "var(--lav)", cursor: "pointer" }}
              >
                Clear filter
              </button>
            )}
          </div>
        ) : (
          <div>
            {visible.map((alert) => {
              const cfg = SIGNAL_CONFIG[alert.signal_type];
              return (
                <article key={alert.id} style={card}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <span style={{
                      fontSize: "10px", fontWeight: 700, letterSpacing: "0.08em",
                      padding: "3px 9px", borderRadius: "4px",
                      background: cfg.bg, border: `1px solid ${cfg.border}`,
                      color: cfg.color,
                      fontFamily: "var(--font-ibm-plex-mono), monospace",
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span style={{
                      fontSize: "11px", fontWeight: 700, letterSpacing: "0.04em",
                      padding: "3px 9px", borderRadius: "4px",
                      background: "rgba(155,142,232,0.08)", border: "1px solid rgba(155,142,232,0.2)",
                      color: "var(--lav)",
                    }}>
                      {alert.narratives?.name ?? "Unknown"}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--muted)", marginLeft: "auto", whiteSpace: "nowrap" as const }}>
                      {timeAgo(alert.created_at)}
                    </span>
                  </div>

                  <p style={{
                    fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                    fontSize: "16px", fontWeight: 700, lineHeight: 1.4,
                    color: "var(--ink)", margin: 0,
                  }}>
                    {alert.reason ?? "Narrative score shift detected."}
                  </p>

                  <span style={{
                    fontSize: "11px", color: "var(--muted)",
                    fontFamily: "var(--font-ibm-plex-mono), monospace",
                  }}>
                    strength {Number(alert.strength).toFixed(1)}
                  </span>
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

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.4; transform: scale(0.75); }
        }
      `}</style>
    </div>
  );
}
