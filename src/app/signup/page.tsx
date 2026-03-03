"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AgeGate from "@/components/age-gate";

interface AgeData {
  month: number;
  day: number;
  year: number;
}

export default function SignUp() {
  const [phase, setPhase] = useState<"age-gate" | "signup">("age-gate");
  const [ageData, setAgeData] = useState<AgeData | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function handleAgeVerified(dob: AgeData) {
    setAgeData(dob);
    setPhase("signup");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const trimmedUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError(
        "Username must be 3-20 characters: letters, numbers, underscores only."
      );
      setLoading(false);
      return;
    }

    try {
      // Server-side signup with age validation
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: trimmedUsername,
          email,
          password,
          month: ageData!.month,
          day: ageData!.day,
          year: ageData!.year,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Signup failed. Please try again.");
        setLoading(false);
        return;
      }

      // Establish browser session
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // User created but email confirmation required before login
        setError(
          "Account created! Please check your email to confirm, then log in."
        );
        setLoading(false);
        return;
      }

      router.push("/inbox");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // Phase 1: Age gate
  if (phase === "age-gate") {
    return <AgeGate onVerified={handleAgeVerified} />;
  }

  // Phase 2: Signup form (with welcome glow)
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm animate-welcome-glow">
        <div className="animate-fade-in-up">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent"
            >
              WhatUPB
            </Link>
          </div>

          <h1 className="text-2xl font-bold mb-1 text-center tracking-tight">
            Create your link
          </h1>
          <p className="text-zinc-500 text-sm text-center mb-8">
            Takes 30 seconds. Start getting anonymous messages.
          </p>
        </div>

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
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="yourname"
              required
              className="input"
            />
            <p className="text-xs text-zinc-600 mt-1.5">
              Your link will be{" "}
              <span className="text-denim-300 font-mono">
                whatupb.com/{username.toLowerCase() || "yourname"}
              </span>
            </p>
          </div>
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
              placeholder="Min 6 characters"
              required
              minLength={6}
              className="input"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary py-3 mt-2"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-zinc-600 text-sm text-center mt-8">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-denim-200 hover:text-denim-100 transition"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
