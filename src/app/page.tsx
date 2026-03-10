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
        background: "linear-gradient(160deg, #faf8f5 0%, #f0f0f8 50%, #f5f3ff 100%)",
        minHeight: "100vh",
      }}
    >
      {/* Subtle radial glow behind card */}
      <div
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: 600,
          height: 600,
          background: "radial-gradient(circle, rgba(139,92,246,0.06), transparent 70%)",
          filter: "blur(60px)",
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
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: 28,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 20px 60px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.9)",
        }}
      >
        {/* Logo */}
        <h1
          className="animate-fade-in-up"
          style={{
            fontFamily: "var(--font-inter), 'Inter', sans-serif",
            fontWeight: 800,
            fontSize: 52,
            letterSpacing: "-0.5px",
            marginBottom: 10,
            color: "#1a1a2e",
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
            color: "#6b7280",
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
        <p className="text-xs" style={{ color: "#9ca3af" }}>
          Built for honest conversations. No human review of messages — ever.
        </p>
        <nav aria-label="Legal" className="flex items-center justify-center gap-4 mt-2 text-xs" style={{ color: "#9ca3af" }}>
          <Link href="/" className="hover:opacity-70 transition">
            Home
          </Link>
          <span>&middot;</span>
          <Link href="/privacy" className="hover:opacity-70 transition">
            Privacy
          </Link>
          <span>&middot;</span>
          <Link href="/terms" className="hover:opacity-70 transition">
            Terms
          </Link>
          <span>&middot;</span>
          <Link href="/content-policy" className="hover:opacity-70 transition">
            Content Policy
          </Link>
          <span>&middot;</span>
          <Link href="/safety" className="hover:opacity-70 transition">
            Safety
          </Link>
          <span>&middot;</span>
          <Link href="/support" className="hover:opacity-70 transition">
            Support
          </Link>
        </nav>
      </footer>
    </div>
  );
}
