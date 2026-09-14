"use client";

import { useState } from "react";

/* ── Episode type ──────────────────────────────────────── */
type Episode = {
  id: string;
  ep: number;
  title: string;
  synopsis: string;
  series: string;
  tiktokUrl: string;
};

/* ── Series data ──────────────────────────────────────── */
const TIKTOK = "https://www.tiktok.com/@GetWhatUPB";

const SERIES = [
  {
    key: "mote",
    title: "MOTE",
    genre: "Whimsical Series",
    tagline: "A tiny speck of light drifts through impossible worlds \u2014 finding meaning in the smallest things.",
    color: "#c9a84c",
    gradient: "linear-gradient(135deg, #c9a84c 0%, #e8d48b 50%, #c9a84c 100%)",
    episodes: [
      { id: "mote-01", ep: 1, title: "The First Drift", synopsis: "A mote of light awakens in an endless void and begins to drift toward something it cannot name.", series: "MOTE", tiktokUrl: TIKTOK },
      { id: "mote-02", ep: 2, title: "The Garden of Echoes", synopsis: "MOTE discovers a garden where every flower replays a forgotten memory.", series: "MOTE", tiktokUrl: TIKTOK },
      { id: "mote-03", ep: 3, title: "The Clockwork Rain", synopsis: "Tiny mechanical raindrops fall upward, and MOTE must decide which one to follow.", series: "MOTE", tiktokUrl: TIKTOK },
      { id: "mote-04", ep: 4, title: "The Paper Sea", synopsis: "An origami ocean unfolds before MOTE, each wave carrying a whispered secret.", series: "MOTE", tiktokUrl: TIKTOK },
      { id: "mote-05", ep: 5, title: "The Lantern Keeper", synopsis: "MOTE meets a creature whose only purpose is to carry light it cannot see.", series: "MOTE", tiktokUrl: TIKTOK },
    ],
  },
  {
    key: "whatupb",
    title: "What Up B",
    genre: "Mystery Series",
    tagline: "Anonymous messages. Real consequences. Someone knows what you did \u2014 and they\u2019re not afraid to say it.",
    color: "#6b5ce7",
    gradient: "linear-gradient(135deg, #6b5ce7 0%, #9B8EE8 50%, #6b5ce7 100%)",
    episodes: [
      { id: "wub-01", ep: 1, title: "The Link", synopsis: "A college student shares her anonymous link as a joke. The first message changes everything.", series: "What Up B", tiktokUrl: TIKTOK },
      { id: "wub-02", ep: 2, title: "Seen", synopsis: "The messages keep coming \u2014 each one more specific, more personal, more impossible to ignore.", series: "What Up B", tiktokUrl: TIKTOK },
      { id: "wub-03", ep: 3, title: "The Thread", synopsis: "She starts connecting the clues. Someone close to her is behind the messages.", series: "What Up B", tiktokUrl: TIKTOK },
      { id: "wub-04", ep: 4, title: "Anonymous", synopsis: "Every suspect has a motive. Every friend has a secret. Trust becomes the real mystery.", series: "What Up B", tiktokUrl: TIKTOK },
      { id: "wub-05", ep: 5, title: "Delivered", synopsis: "The final message arrives. The truth was never anonymous \u2014 it was just waiting.", series: "What Up B", tiktokUrl: TIKTOK },
    ],
  },
  {
    key: "between",
    title: "BETWEEN",
    genre: "Anime Series",
    tagline: "Two frequencies collide across a dead galaxy. Connection isn\u2019t found \u2014 it\u2019s built.",
    color: "#9B8EE8",
    gradient: "linear-gradient(135deg, #1a1a2e 0%, #9B8EE8 50%, #1a1a2e 100%)",
    episodes: [
      { id: "btw-01", ep: 1, title: "Signal", synopsis: "KI broadcasts into the void. Something answers \u2014 not with words, but with a frequency that matches her own.", series: "BETWEEN", tiktokUrl: TIKTOK },
      { id: "btw-02", ep: 2, title: "Resonance", synopsis: "The Other\u2019s signal grows stronger. KI realizes they\u2019re not just communicating \u2014 they\u2019re harmonizing.", series: "BETWEEN", tiktokUrl: TIKTOK },
      { id: "btw-03", ep: 3, title: "The Dead Galaxy", synopsis: "They meet in a graveyard of stars. The amber light reveals what was lost \u2014 and what could be rebuilt.", series: "BETWEEN", tiktokUrl: TIKTOK },
      { id: "btw-04", ep: 4, title: "Fracture", synopsis: "A dissonant frequency threatens to tear them apart. To stay connected, both must change.", series: "BETWEEN", tiktokUrl: TIKTOK },
      { id: "btw-05", ep: 5, title: "The New Frequency", synopsis: "A signal neither could create alone cuts through the cosmos. The universe just got larger.", series: "BETWEEN", tiktokUrl: TIKTOK },
    ],
  },
];

/* ── Shared styles ──────────────────────────────────────── */
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

const taglineStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(26,23,48,0.5)",
  lineHeight: 1.5,
  marginBottom: "18px",
};

/* ── Component ──────────────────────────────────────────── */
export default function StudiosClient() {
  const [selected, setSelected] = useState<Episode | null>(null);

  return (
    <div>
      {/* ── Now Watching hero ── */}
      <div
        style={{
          background: selected
            ? "linear-gradient(135deg, #1a1730 0%, #2d2450 100%)"
            : "linear-gradient(135deg, rgba(107,92,231,0.08) 0%, rgba(201,168,76,0.08) 100%)",
          border: selected
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
        {selected && (
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

        {selected ? (
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ ...label, color: "#c9a84c", marginBottom: "10px" }}>
              Now Watching
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
              {selected.title}
            </div>
            <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
              {selected.synopsis}
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#c9a84c",
                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                marginBottom: "18px",
              }}
            >
              {selected.series} &middot; Episode {selected.ep}
            </div>

            <a
              href={selected.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 22px",
                borderRadius: "50px",
                border: "1.5px solid #c9a84c",
                background: "rgba(201,168,76,0.12)",
                color: "#c9a84c",
                fontSize: "13px",
                fontWeight: 600,
                fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                textDecoration: "none",
                transition: "all 0.2s",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch on TikTok
            </a>
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375v0c0-.621.504-1.125 1.125-1.125h9.75c.621 0 1.125.504 1.125 1.125v0c0 .621.504 1.125 1.125 1.125h1.5m0 0a1.125 1.125 0 001.125-1.125M3.375 19.5h-1.5A1.125 1.125 0 01.75 18.375v0M21.75 18.375V5.625A1.125 1.125 0 0020.625 4.5H3.375A1.125 1.125 0 002.25 5.625v12.75" />
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
              Select an episode to watch
            </div>
            <div style={{ fontSize: "12px", color: "rgba(26,23,48,0.25)" }}>
              Tap any card below to preview
            </div>
          </div>
        )}
      </div>

      {/* ── Series sections ── */}
      {SERIES.map((series, si) => (
        <div
          key={series.key}
          className={`anim-${si + 2}`}
          style={{ marginBottom: "44px" }}
        >
          <div style={label}>{series.genre}</div>
          <div style={sectionTitle}>{series.title}</div>
          <div style={taglineStyle}>{series.tagline}</div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {series.episodes.map((ep) => {
              const isActive = selected?.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => setSelected(ep)}
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "14px",
                    padding: "14px 16px",
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
                  {/* Thumbnail */}
                  <div
                    style={{
                      width: "52px",
                      height: "52px",
                      borderRadius: "12px",
                      flexShrink: 0,
                      background: series.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: isActive ? `0 2px 8px ${series.color}40` : "0 1px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                        color: series.key === "between" ? "#fff" : "#1a1730",
                        opacity: 0.7,
                        letterSpacing: "0.5px",
                      }}
                    >
                      EP{ep.ep}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                        color: isActive ? series.color : "rgba(26,23,48,0.35)",
                        letterSpacing: "1px",
                        textTransform: "uppercase",
                        marginBottom: "3px",
                      }}
                    >
                      Episode {ep.ep}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                        fontSize: "15px",
                        fontWeight: 700,
                        color: isActive ? series.color : "#1a1730",
                        marginBottom: "3px",
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
                        lineHeight: 1.4,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {ep.synopsis}
                    </div>
                  </div>

                  {/* Watch button */}
                  <a
                    href={ep.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: isActive ? series.color : "rgba(107,92,231,0.08)",
                      color: isActive ? "#fff" : series.color,
                      transition: "all 0.2s",
                      textDecoration: "none",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </a>
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
        <div style={{ ...label, marginBottom: "14px" }}>Watch on</div>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
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
              fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
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
              fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
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
