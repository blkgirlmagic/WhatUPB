"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import posthog from "posthog-js";

import { DiagonalLines } from "@/components/diagonal-lines";

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const raw = hash.replace(/^#/, "");
  for (const pair of raw.split("&")) {
    const [key, ...rest] = pair.split("=");
    if (key) params[key] = decodeURIComponent(rest.join("="));
  }
  return params;
}

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  useEffect(() => {
    async function checkHash() {
      const params = parseHashParams(window.location.hash);
      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];

      if (accessToken && refreshToken) {
        const { error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (!sessionError) {
          window.history.replaceState(null, "", window.location.pathname);
          router.replace("/inbox");
          return;
        }

        setSuccess("Email confirmed! Log in to continue.");
        setChecking(false);
        return;
      }

      if (searchParams.get("confirmed") === "true") {
        setSuccess("Email confirmed! Log in to continue.");
      } else if (searchParams.get("error") === "auth") {
        setError("Authentication failed. Please try again.");
      }
      setChecking(false);
    }

    checkHash();
  }, [searchParams, supabase.auth, router]);

  if (checking) {
    return (
      <div className="landing-page" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <DiagonalLines />
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 24, height: 24, border: "2px solid rgba(155,142,232,0.3)", borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px" }} className="animate-spin" />
          <p style={{ color: "rgba(26,23,48,0.42)", fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    posthog.capture("user_logged_in");
    router.push("/inbox");
    router.refresh();
  }

  const inputStyle = (focused: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "13px 16px",
    borderRadius: "11px",
    border: `1px solid ${focused ? "#9B8EE8" : "rgba(155,142,232,0.2)"}`,
    background: focused ? "#fff" : "rgba(255,255,255,0.8)",
    fontFamily: "var(--font-lora), 'Lora', Georgia, serif",
    fontSize: "15px",
    color: "#1A1730",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: focused
      ? "0 0 0 3px rgba(155,142,232,0.12), inset 0 1px 3px rgba(0,0,0,0.04)"
      : "inset 0 1px 3px rgba(0,0,0,0.04)",
  });

  return (
    <div className="landing-page">
      {/* Bloom */}
      <div style={{
        position: "fixed", zIndex: 0, pointerEvents: "none",
        left: "50%", top: "-60px", transform: "translateX(-50%)",
        width: "900px", height: "440px",
        background: "radial-gradient(ellipse at 50% 0%, rgba(155,142,232,0.10) 0%, rgba(196,187,245,0.06) 40%, transparent 70%)",
        filter: "blur(30px)",
      }} />

      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          WhatUPB
        </Link>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <a href="/#safety">Safety</a>
          <a href="#">Blog</a>
          <Link href="/signup" className="nav-cta">Sign Up</Link>
        </div>
      </nav>

      {/* PAGE */}
      <div className="login-page-wrap">

        {/* Login Card */}
        <div className="login-card card-in" style={{
          width: "min(420px, 100%)",
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          border: "1px solid rgba(255,255,255,0.95)",
          borderRadius: "24px",
          padding: "40px 36px 36px",
          boxShadow: "0 24px 60px rgba(100,90,180,0.1), 0 4px 16px rgba(100,90,180,0.06), inset 0 1px 0 #fff",
          position: "relative",
          overflow: "hidden",
        }}>
          {/* Shimmer line */}
          <div style={{
            position: "absolute", top: 0, left: "15%", right: "15%", height: "1px",
            background: "linear-gradient(90deg, transparent, rgba(155,142,232,0.5), transparent)",
          }} />

          {/* Wordmark */}
          <div className="anim-1" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 800, fontSize: "20px", color: "#9B8EE8", letterSpacing: "-0.3px", marginBottom: "6px" }}>
            WhatUPB
          </div>

          <h1 className="anim-2" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontWeight: 800, fontSize: "26px", color: "#1A1730", textAlign: "center", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            Welcome back
          </h1>
          <p className="anim-3" style={{ fontSize: "14px", color: "rgba(26,23,48,0.42)", textAlign: "center", marginBottom: "30px" }}>
            Log in to your account
          </p>

          {success && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)", color: "#065f46", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", fontSize: "14px" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              {success}
            </div>
          )}

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", fontSize: "14px" }}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="anim-4" style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "10.5px", letterSpacing: "2px", textTransform: "uppercase" as const, color: "rgba(26,23,48,0.42)", fontWeight: 500, marginBottom: "7px", display: "block", fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
                Email
              </label>
              <input
                type="email"
                placeholder="you@email.com"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                style={inputStyle(emailFocused)}
              />
            </div>

            {/* Password */}
            <div className="anim-4" style={{ marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "7px" }}>
                <label style={{ fontSize: "10.5px", letterSpacing: "2px", textTransform: "uppercase" as const, color: "rgba(26,23,48,0.42)", fontWeight: 500, fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace" }}>
                  Password
                </label>
                <Link href="/forgot-password" style={{ fontSize: "12.5px", color: "#9B8EE8", textDecoration: "none", transition: "color 0.2s" }}>
                  Forgot password?
                </Link>
              </div>
              <input
                type="password"
                placeholder="Your password"
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                style={inputStyle(passwordFocused)}
              />
            </div>

            {/* Log In button */}
            <button
              type="submit"
              disabled={loading}
              className="anim-5 card-btn-primary"
              style={{ marginBottom: "16px" }}
            >
              {loading ? "Logging in\u2026" : "Log In"}
            </button>
          </form>


          {/* Sign up row */}
          <div className="anim-8" style={{ textAlign: "center", fontSize: "13.5px", color: "rgba(26,23,48,0.42)", marginTop: "20px" }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" style={{ color: "#9B8EE8", textDecoration: "none", fontWeight: 500, transition: "color 0.2s" }}>
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <span className="footer-wordmark">WhatUPB</span>
            </div>
            <p className="footer-tagline">
              Built for honest conversations.<br />No human review of messages &mdash; ever.
            </p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-label">Links</div>
            <div className="footer-links-row">
              <Link href="/">Home</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <a href="/#safety">Safety</a>
              <a href="#">Support</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2025 WhatUPB. All rights reserved.</span>
          <span>whatupb.com</span>
        </div>
      </footer>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
