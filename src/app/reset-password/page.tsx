"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const PASSWORD_RULES = [
  { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { key: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { key: "number", label: "One number", test: (p: string) => /[0-9]/.test(p) },
  { key: "special", label: "One special character (!@#$%^&*)", test: (p: string) => /[!@#$%^&*]/.test(p) },
] as const;

function parseHashParams(hash: string): Record<string, string> {
  const params: Record<string, string> = {};
  const raw = hash.replace(/^#/, "");
  for (const pair of raw.split("&")) {
    const [key, ...rest] = pair.split("=");
    if (key) params[key] = decodeURIComponent(rest.join("="));
  }
  return params;
}

function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionState, setSessionState] = useState<"loading" | "ready" | "error">("loading");
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const passwordChecks = useMemo(
    () => PASSWORD_RULES.map((rule) => ({ ...rule, passed: rule.test(password) })),
    [password]
  );
  const allPassed = passwordChecks.every((c) => c.passed);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  const canSubmit = allPassed && passwordsMatch && !loading;

  const passedCount = passwordChecks.filter((c) => c.passed).length;
  const strength: "none" | "weak" | "medium" | "strong" =
    password.length === 0
      ? "none"
      : passedCount <= 1
        ? "weak"
        : passedCount <= 3
          ? "medium"
          : "strong";

  // Exchange the code/token for a session on mount
  useEffect(() => {
    async function exchangeToken() {
      // Try PKCE code from query params first
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setSessionState("ready");
          return;
        }
      }

      // Try implicit flow tokens from hash
      const params = parseHashParams(window.location.hash);
      const accessToken = params["access_token"];
      const refreshToken = params["refresh_token"];
      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          window.history.replaceState(null, "", window.location.pathname);
          setSessionState("ready");
          return;
        }
      }

      // Check if there's already an active session (e.g. from cookie)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSessionState("ready");
        return;
      }

      setSessionState("error");
    }

    exchangeToken();
  }, [searchParams, supabase.auth]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setTimeout(() => router.push("/login"), 3000);
  }

  // Loading — exchanging token
  if (sessionState === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-6 h-6 border-2 border-denim-200 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400 text-sm">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid or expired link
  if (sessionState === "error") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm animate-fade-in-up text-center">
          <div className="text-center mb-8">
            <Link
              href="/"
              className="text-2xl font-bold bg-gradient-to-r from-denim-200 to-white bg-clip-text text-transparent"
            >
              WhatUPB
            </Link>
          </div>
          <div className="flex items-start gap-3 bg-red-500/5 border border-red-500/20 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm text-left">
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
            This reset link has expired or already been used. Please request a new one.
          </div>
          <Link href="/forgot-password" className="btn-secondary py-2.5 px-6">
            Request a new link
          </Link>
        </div>
      </div>
    );
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
          Set a new password
        </h1>
        <p className="text-zinc-500 text-sm text-center mb-8">
          Choose a strong password for your account.
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
            Password updated. Redirecting to login...
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

        {!success && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">
                New Password
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

            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5 block">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="input"
              />
              {confirmPassword.length > 0 && !passwordsMatch && (
                <p className="text-xs text-red-400 mt-1.5">
                  Passwords do not match.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="btn-primary py-3"
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        <p className="text-zinc-600 text-sm text-center mt-8">
          <Link
            href="/login"
            className="text-denim-200 hover:text-denim-100 transition"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
