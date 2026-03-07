"use client";

import { Suspense, useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // --- Priority 1: detect #access_token in the hash ---
  // Implicit-flow tokens can land on /login if the hash survived a redirect.
  // The SSR browser client (PKCE) won't auto-detect these, so we parse the
  // hash ourselves and call setSession() directly.
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
          return; // don't setChecking — we're navigating away
        }

        // Tokens were invalid/expired but email was likely confirmed
        setSuccess("Email confirmed! Log in to continue.");
        setChecking(false);
        return;
      }

      // --- Priority 2: no hash token — handle query params normally ---
      if (searchParams.get("confirmed") === "true") {
        setSuccess("Email confirmed! Log in to continue.");
      } else if (searchParams.get("error") === "auth") {
        setError("Authentication failed. Please try again.");
      }
      setChecking(false);
    }

    checkHash();
  }, [searchParams, supabase.auth, router]);

  // Show spinner while checking for hash tokens (prevents false error flash)
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-denim-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Loading...</p>
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

    router.push("/inbox");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent"
          >
            WhatUPB
          </Link>
        </div>

        <h1 className="text-2xl font-bold mb-1 text-center tracking-tight">
          Welcome back
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-8">
          Log in to your account
        </p>

        {success && (
          <div className="flex items-start gap-3 bg-green-500/5 border border-green-500/20 text-green-300 px-4 py-3 rounded-xl mb-4 text-sm">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            {success}
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-4 text-sm">
            <svg
              className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              required
              className="input"
            />
          </div>
          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              required
              className="input"
            />
          </div>
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-xs text-zinc-500 hover:text-zinc-400 transition"
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="text-zinc-600 text-sm text-center mt-8">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-denim-200 hover:text-denim-100 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
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
