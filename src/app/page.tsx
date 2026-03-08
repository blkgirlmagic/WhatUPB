import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 relative"
      style={{
        backgroundImage: "url('/My_WhaUPB_home_page.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Radial glow behind card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 700,
          height: 700,
          background: "radial-gradient(circle, rgba(255,255,255,0.35), transparent 70%)",
          filter: "blur(80px)",
          zIndex: 0,
        }}
      />

      <div
        className="glass-card text-center relative"
        style={{
          zIndex: 1,
          width: 680,
          maxWidth: "100%",
          padding: "56px 48px",
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(22px)",
          WebkitBackdropFilter: "blur(22px)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.45)",
          boxShadow: "0 40px 90px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.5)",
        }}
      >
        {/* Logo */}
        <h1
          className="font-bold animate-fade-in-up"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 52,
            letterSpacing: "-0.5px",
            marginBottom: 10,
            color: "#2d2840",
          }}
        >
          WhatUPB
        </h1>

        {/* Subtitle */}
        <p
          className="animate-fade-in-up-delay-1"
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 20,
            lineHeight: 1.5,
            color: "#5a5070",
            marginBottom: 36,
          }}
        >
          Say what people really think — anonymously.
        </p>

        {/* CTA buttons */}
        {user ? (
          <div className="animate-fade-in-up-delay-2">
            <Link href="/inbox" className="home-btn home-btn-primary">
              Go to Inbox
            </Link>
            <Link href="/settings" className="home-btn home-btn-dark">
              Settings
            </Link>
          </div>
        ) : (
          <div className="animate-fade-in-up-delay-2">
            <Link href="/signup" className="home-btn home-btn-primary">
              Create Your Link
            </Link>
            <Link href="/login" className="home-btn home-btn-dark">
              Log In
            </Link>
          </div>
        )}

        {/* Trust badges */}
        <div className="home-meta animate-fade-in-up-delay-3">
          <span>&#10004; Abuse auto-blocked</span>
          <span>&#10004; Fully anonymous</span>
          <span>&#10004; Takes 30 seconds</span>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center">
        <p className="text-xs" style={{ color: "#5a5070" }}>
          Built for honest conversations. No human review of messages — ever.
        </p>
        <nav aria-label="Legal" className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: "#5a5070" }}>
          <Link href="/privacy" className="hover:opacity-70 transition">
            Privacy
          </Link>
          <span style={{ color: "#5a5070" }}>·</span>
          <Link href="/terms" className="hover:opacity-70 transition">
            Terms
          </Link>
          <span style={{ color: "#5a5070" }}>·</span>
          <Link href="/content-policy" className="hover:opacity-70 transition">
            Content Policy
          </Link>
        </nav>
      </footer>
    </div>
  );
}
