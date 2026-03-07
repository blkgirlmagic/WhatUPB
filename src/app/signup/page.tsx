"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AgeGate from "@/components/age-gate";
import posthog from "posthog-js";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

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
  const [errorCode, setErrorCode] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const passedCount = passwordChecks.filter((c) => c.passed).length;
  const allPassed = passedCount === PASSWORD_RULES.length;
  const strength: "none" | "weak" | "medium" | "strong" =
    password.length === 0
      ? "none"
      : passedCount <= 1
        ? "weak"
        : passedCount <= 3
          ? "medium"
          : "strong";

  function handleAgeVerified(dob: AgeData) {
    setAgeData(dob);
    setPhase("signup");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setErrorCode("");
    setLoading(true);

    const trimmedUsername = username.trim().toLowerCase();

    if (!/^[a-z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError(
        "Username must be 3-20 characters: letters, numbers, underscores only."
      );
      setLoading(false);
      return;
    }

    if (!allPassed) {
      setError("Password doesn't meet all requirements.");
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
        if (data.code) setErrorCode(data.code);
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

      posthog.capture("user_signed_up");
      posthog.capture("link_created");
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
            {errorCode === "EMAIL_EXISTS" ? (
              <span>
                This email is already in use. Try{" "}
                <Link
                  href="/login"
                  className="text-denim-200 hover:text-denim-100 underline transition"
                >
                  logging in
                </Link>{" "}
                or use a different email.
              </span>
            ) : (
              error
            )}
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
              placeholder="Min 8 characters"
              required
              className="input"
            />

            {/* Strength indicator */}
            {password.length > 0 && (
              <div className="mt-2.5 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="flex-1 flex gap-1">
                    <div
                      className="h-1 rounded-full flex-1 transition-colors duration-200"
                      style={{
                        background:
                          strength === "weak"
                            ? "#ef4444"
                            : strength === "medium"
                              ? "#f59e0b"
                              : "#10b981",
                      }}
                    />
                    <div
                      className="h-1 rounded-full flex-1 transition-colors duration-200"
                      style={{
                        background:
                          strength === "medium"
                            ? "#f59e0b"
                            : strength === "strong"
                              ? "#10b981"
                              : "var(--surface-3)",
                      }}
                    />
                    <div
                      className="h-1 rounded-full flex-1 transition-colors duration-200"
                      style={{
                        background:
                          strength === "strong"
                            ? "#10b981"
                            : "var(--surface-3)",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-medium uppercase tracking-wider min-w-[52px] text-right"
                    style={{
                      color:
                        strength === "weak"
                          ? "#ef4444"
                          : strength === "medium"
                            ? "#f59e0b"
                            : "#10b981",
                    }}
                  >
                    {strength}
                  </span>
                </div>

                <ul className="space-y-1">
                  {passwordChecks.map((check) => (
                    <li
                      key={check.key}
                      className="flex items-center gap-2 text-xs"
                    >
                      {check.passed ? (
                        <svg
                          className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2.5}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        <svg
                          className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="9" />
                        </svg>
                      )}
                      <span
                        className={
                          check.passed ? "text-zinc-400" : "text-zinc-600"
                        }
                      >
                        {check.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <button
            type="submit"
            disabled={loading || !allPassed}
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

        <div className="flex items-center justify-center gap-4 mt-6 text-xs text-zinc-600">
          <Link href="/privacy" className="hover:text-zinc-400 transition">
            Privacy
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href="/terms" className="hover:text-zinc-400 transition">
            Terms
          </Link>
          <span className="text-zinc-700">·</span>
          <Link href="/content-policy" className="hover:text-zinc-400 transition">
            Content Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
