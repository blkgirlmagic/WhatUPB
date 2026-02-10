import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username")?.trim();

  if (!username || !/^[a-zA-Z0-9_-]{1,30}$/.test(username)) {
    return new Response(
      JSON.stringify({ ok: false, error: "Invalid username" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const link = `whatupb.com/${username}`;
  const fullUrl = `https://whatupb.com/${username}`;
  // QR code via external API (no native deps needed on edge)
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fullUrl)}&bgcolor=000000&color=ffffff&format=png`;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0a0a0a 0%, #1a0a2e 50%, #0a0a0a 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow effect */}
        <div
          style={{
            position: "absolute",
            top: 400,
            left: 200,
            width: 680,
            height: 680,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(106,90,205,0.2) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Fire emojis */}
        <div style={{ fontSize: 80, marginBottom: 20, display: "flex" }}>
          {"\u{1F525}\u{1F525}\u{1F525}"}
        </div>

        {/* Main heading */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "white",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textShadow: "0 0 40px rgba(106,90,205,0.6)",
            marginBottom: 50,
          }}
        >
          <span>Send anonymous</span>
          <span>msgs {"\u{1F440}"}</span>
        </div>

        {/* QR Code */}
        <div
          style={{
            display: "flex",
            padding: 20,
            borderRadius: 20,
            border: "2px solid rgba(106,90,205,0.5)",
            backgroundColor: "rgba(0,0,0,0.5)",
            marginBottom: 30,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrUrl}
            width={300}
            height={300}
            style={{ borderRadius: 8 }}
            alt="QR Code"
          />
        </div>

        {/* Scan me */}
        <div
          style={{
            fontSize: 32,
            fontWeight: 700,
            color: "rgba(255,255,255,0.6)",
            letterSpacing: "0.1em",
            marginBottom: 40,
            display: "flex",
          }}
        >
          SCAN ME
        </div>

        {/* Link pill */}
        <div
          style={{
            display: "flex",
            padding: "16px 48px",
            borderRadius: 40,
            backgroundColor: "rgba(106,90,205,0.25)",
            border: "2px solid rgba(106,90,205,0.5)",
            marginBottom: 40,
          }}
        >
          <span style={{ fontSize: 40, fontWeight: 700, color: "white" }}>
            {link}
          </span>
        </div>

        {/* Branding */}
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#6A5ACD",
            textShadow: "0 0 30px rgba(106,90,205,0.5)",
            marginBottom: 10,
            display: "flex",
          }}
        >
          WhatUPB
        </div>

        <div
          style={{
            fontSize: 36,
            color: "rgba(255,255,255,0.5)",
            marginBottom: 60,
            display: "flex",
          }}
        >
          anonymous real talk {"\u{1F4AC}"}
        </div>

        {/* Swipe up arrow */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255,255,255,0.4)"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              letterSpacing: "0.1em",
              marginTop: 8,
            }}
          >
            SWIPE UP
          </span>
        </div>

        {/* Bottom emojis */}
        <div style={{ fontSize: 60, marginTop: 60, display: "flex" }}>
          {"\u{1F440}  \u{1F525}  \u{1F440}"}
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
    }
  );
}
