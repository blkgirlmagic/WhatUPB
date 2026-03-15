"use client";

import { useState } from "react";

/* ── Episode data ──────────────────────────────────────── */
type Episode = {
  id: string;
  title: string;
  subtitle: string;
  duration: string;
  series: string;
  audioSrc?: string;
  thumbnail?: string;
};

const SERIES = [
  {
    key: "unfiltered",
    title: "Unfiltered",
    tagline: "Raw conversations about identity, honesty, and being seen.",
    color: "#6b5ce7",
    episodes: [
      { id: "uf-01", title: "Why We Hide", subtitle: "The masks we wear online vs. IRL", duration: "12:34", series: "Unfiltered" },
      { id: "uf-02", title: "The Anonymous Effect", subtitle: "What happens when identity is removed", duration: "14:08", series: "Unfiltered" },
      { id: "uf-03", title: "Truth or Trauma", subtitle: "When honesty becomes a weapon", duration: "11:22", series: "Unfiltered" },
    ],
  },
  {
    key: "signal",
    title: "Signal",
    tagline: "Short-form drops on trends, culture, and what the internet won\u2019t say.",
    color: "#c9a84c",
    episodes: [
      { id: "sg-01", title: "Main Character Energy", subtitle: "Why everyone wants to be the protagonist", duration: "6:45", series: "Signal" },
      { id: "sg-02", title: "Digital Boundaries", subtitle: "Protecting your peace in a connected world", duration: "8:12", series: "Signal" },
      { id: "sg-03", title: "The Algorithm Knows", subtitle: "How platforms shape what you believe", duration: "7:58", series: "Signal" },
    ],
  },
  {
    key: "after-hours",
    title: "After Hours",
    tagline: "Late-night deep dives. Philosophy, feelings, and the spaces between.",
    color: "#9B8EE8",
    episodes: [
      { id: "ah-01", title: "3 AM Thoughts", subtitle: "The things you only admit in the dark", duration: "18:30", series: "After Hours" },
      { id: "ah-02", title: "Letters Never Sent", subtitle: "Reading real anonymous confessions", duration: "22:15", series: "After Hours" },
      { id: "ah-03", title: "The Space Between Us", subtitle: "Why distance makes honesty easier", duration: "16:44", series: "After Hours" },
    ],
  },
];

/* ── Styles ──────────────────────────────────────────── */
const label: React.CSSProperties = {
  fontSize: "10px",
  letterSpacing: "2.5px",
  textTransform: "uppercase",
  color: "#c9a84c",
  fontWeight: 600,
  fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
};

const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--font-playfair), 'Playfair Display', serif",
  fontStyle: "italic",
  fontSize: "26px",
  fontWeight: 700,
  color: "#1a1730",
  letterSpacing: "-0.3px",
  marginBottom: "4px",
};

const tagline: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(26,23,48,0.5)",
  lineHeight: 1.5,
  marginBottom: "18px",
};

export default function StudiosClient() {
  const [nowPlaying, setNowPlaying] = useState<Episode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function handlePlay(ep: Episode) {
    setNowPlaying(ep);
    setIsPlaying(true);
  }

  return (
    <div>
      {/* ── Player ── */}
      <div
        style={{
          background: nowPlaying
            ? "linear-gradient(135deg, #1a1730 0%, #2d2450 100%)"
            : "linear-gradient(135deg, rgba(107,92,231,0.08) 0%, rgba(201,168,76,0.08) 100%)",
          border: nowPlaying
            ? "1px solid rgba(201,168,76,0.3)"
            : "1px solid rgba(107,92,231,0.15)",
          borderRadius: "20px",
          padding: "28px 24px",
          marginBottom: "36px",
          transition: "all 0.4s ease",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative glow */}
        {nowPlaying && (
          <div
            style={{
              position: "absolute",
              top: "-40px",
              right: "-40px",
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(201,168,76,0.2) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        {nowPlaying ? (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...label, color: "#c9a84c", marginBottom: "10px" }}>
              Now Playing
            </div>
            <div
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "22px",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "4px",
              }}
            >
              {nowPlaying.title}
            </div>
            <div
              style={{
                fontSize: "13px",
                color: "rgba(255,255,255,0.5)",
                marginBottom: "4px",
              }}
            >
              {nowPlaying.subtitle}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#c9a84c",
                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                marginBottom: "18px",
              }}
            >
              {nowPlaying.series} &middot; {nowPlaying.duration}
            </div>

            {/* Progress bar */}
            <div
              style={{
                width: "100%",
                height: "3px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.1)",
                marginBottom: "14px",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  height: "100%",
                  width: isPlaying ? "35%" : "0%",
                  background: "linear-gradient(90deg, #c9a84c, #6b5ce7)",
                  borderRadius: "2px",
                  transition: "width 0.3s",
                }}
              />
            </div>

            {/* Controls */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "50%",
                  border: "1.5px solid #c9a84c",
                  background: "rgba(201,168,76,0.12)",
                  color: "#c9a84c",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                type="button"
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
                {isPlaying ? "0:00" : "--:--"} / {nowPlaying.duration}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                border: "1.5px solid rgba(107,92,231,0.25)",
                background: "rgba(107,92,231,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="rgba(107,92,231,0.4)" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            </div>
            <div
              style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontStyle: "italic",
                fontSize: "18px",
                color: "rgba(26,23,48,0.35)",
                marginBottom: "6px",
              }}
            >
              Select an episode to play
            </div>
            <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.25)" }}>
              Tap any card below to start listening
            </div>
          </div>
        )}
      </div>

      {/* ── Series sections ── */}
      {SERIES.map((series, si) => (
        <div
          key={series.key}
          className={`anim-${si + 2}`}
          style={{ marginBottom: "40px" }}
        >
          <div style={label}>{series.key.replace("-", " ")}</div>
          <div style={sectionTitle}>{series.title}</div>
          <div style={tagline}>{series.tagline}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {series.episodes.map((ep) => {
              const isActive = nowPlaying?.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => handlePlay(ep)}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "16px 18px",
                    borderRadius: "16px",
                    border: isActive
                      ? `1.5px solid ${series.color}`
                      : "1px solid rgba(190,185,215,0.45)",
                    background: isActive
                      ? `linear-gradient(135deg, ${series.color}08, ${series.color}12)`
                      : "#fff",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    textAlign: "left",
                    width: "100%",
                    boxShadow: isActive
                      ? `0 4px 16px ${series.color}25`
                      : "0 1px 4px rgba(100,90,160,0.06)",
                  }}
                >
                  {/* Play icon */}
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: isActive ? series.color : "rgba(107,92,231,0.08)",
                      color: isActive ? "#fff" : series.color,
                      transition: "all 0.2s",
                    }}
                  >
                    {isActive && isPlaying ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <rect x="6" y="4" width="4" height="16" rx="1" />
                        <rect x="14" y="4" width="4" height="16" rx="1" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: isActive ? series.color : "#1a1730",
                        marginBottom: "2px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ep.title}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "rgba(26,23,48,0.45)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {ep.subtitle}
                    </div>
                  </div>

                  {/* Duration */}
                  <div
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                      color: isActive ? series.color : "rgba(26,23,48,0.35)",
                      flexShrink: 0,
                    }}
                  >
                    {ep.duration}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* ── Social links ── */}
      <div
        style={{
          textAlign: "center",
          padding: "32px 0 16px",
          borderTop: "1px solid rgba(107,92,231,0.1)",
        }}
      >
        <div style={{ ...label, marginBottom: "14px" }}>Follow WhatUPB</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          {/* TikTok */}
          <a
            href="https://www.tiktok.com/@GetWhatUPB"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "1.5px solid #c9a84c",
              background: "transparent",
              color: "#1a1730",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-lora), 'Lora', Georgia, serif",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.05a8.27 8.27 0 004.76 1.5V7.12a4.83 4.83 0 01-1-.43z" />
            </svg>
            @GetWhatUPB
          </a>

          {/* Instagram */}
          <a
            href="https://www.instagram.com/GetWhatUPB"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              borderRadius: "50px",
              border: "1.5px solid #6b5ce7",
              background: "transparent",
              color: "#1a1730",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "var(--font-lora), 'Lora', Georgia, serif",
              textDecoration: "none",
              transition: "all 0.2s",
            }}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            @GetWhatUPB
          </a>
        </div>
      </div>
    </div>
  );
}
