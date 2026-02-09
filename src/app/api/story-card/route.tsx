// ---------------------------------------------------------------------------
//  GET /api/story-card?username=tiptoe
//
//  Returns a 1080×1920 PNG story card for Instagram / social sharing.
//  Uses @vercel/og (Satori + resvg) — works on Vercel Edge & Node runtimes,
//  no native binary deps.
//
//  The image is cached at the CDN edge for 1 hour per username.
// ---------------------------------------------------------------------------

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username || !/^[a-z0-9_]{1,30}$/i.test(username)) {
    return new Response("Missing or invalid username", { status: 400 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "1080px",
          height: "1920px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #0f0f1a 0%, #1a1a35 50%, #0f0f1a 100%)",
          position: "relative",
        }}
      >
        {/* Radial glow */}
        <div
          style={{
            position: "absolute",
            top: "35%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "800px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
          }}
        />

        {/* Brand */}
        <div
          style={{
            fontSize: "48px",
            fontWeight: 700,
            color: "#a5b4fc",
            marginBottom: "60px",
            letterSpacing: "-1px",
          }}
        >
          WhatUPB
        </div>

        {/* Main CTA */}
        <div
          style={{
            fontSize: "76px",
            fontWeight: 800,
            color: "#ffffff",
            textAlign: "center",
            lineHeight: 1.15,
            marginBottom: "40px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Send me</span>
          <span>anonymous</span>
          <span>messages</span>
        </div>

        {/* Emoji */}
        <div style={{ fontSize: "72px", marginBottom: "60px" }}>👀</div>

        {/* URL */}
        <div
          style={{
            fontSize: "46px",
            fontWeight: 700,
            color: "#818cf8",
            marginBottom: "50px",
            letterSpacing: "-0.5px",
          }}
        >
          whatupb.com/{username}
        </div>

        {/* Trust badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(255,255,255,0.06)",
            borderRadius: "30px",
            padding: "16px 40px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              color: "#6b7280",
              fontWeight: 500,
            }}
          >
            100% anonymous · abuse blocked
          </span>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    }
  );
}
