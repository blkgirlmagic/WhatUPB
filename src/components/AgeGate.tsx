"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import posthog from "posthog-js";

export default function AgeGate({ children }: { children: React.ReactNode }) {
  const [verified, setVerified] = useState<boolean | null>(null);
  const [checked, setChecked] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    async function check() {
      // 1. Cookie check — fastest, no network call
      const hasCookie = document.cookie
        .split("; ")
        .some((c) => c === "age_verified=true");
      if (hasCookie) {
        setVerified(true);
        return;
      }

      // 2. Session check — logged-in users already passed age gate at signup
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setVerified(true);
          return;
        }
      } catch {
        // Supabase unavailable — fall through to show gate
      }

      setVerified(false);
    }

    check();
  }, []);

  const handleEnter = () => {
    if (!checked) return;

    posthog.capture("age_gate_passed");

    // Log verification in the background — fire-and-forget, never blocks user
    fetch("/api/log-age-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_agent: navigator.userAgent }),
    }).catch(() => {});

    const expires = new Date();
    expires.setDate(expires.getDate() + 30);
    document.cookie = `age_verified=true; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
    setExiting(true);
    setTimeout(() => setVerified(true), 400);
  };

  // Still checking cookie or already verified — render children only
  if (verified === null || verified) {
    return <>{children}</>;
  }

  return (
    <>
      {children}
      <div
        className={`flex items-center justify-center px-4 ${
          exiting ? "animate-age-gate-exit" : ""
        }`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          background: "#0c0c10",
        }}
      >
        <div className="w-full max-w-sm text-center animate-fade-in-up">
          {/* Logo */}
          <h1 className="text-3xl font-bold tracking-tight mb-8">
            <span className="bg-gradient-to-r from-denim-200 via-denim-100 to-white bg-clip-text text-transparent">
              WhatUPB
            </span>
          </h1>

          {/* Card */}
          <div className="card-elevated p-8">
            <p className="text-zinc-300 text-sm mb-8 leading-relaxed">
              You must be 18 or older to use this site.
            </p>

            {/* Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer select-none mb-8 text-left">
              <span
                className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border transition-all duration-200 flex items-center justify-center ${
                  checked
                    ? "bg-denim-400 border-denim-400"
                    : "bg-surface-2 border-border-default hover:border-denim-400/50"
                }`}
              >
                {checked && (
                  <svg
                    className="w-3.5 h-3.5 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </span>
              <input
                type="checkbox"
                checked={checked}
                onChange={() => setChecked(!checked)}
                className="sr-only"
              />
              <span className="text-zinc-400 text-sm leading-snug">
                I confirm that I am 18 years of age or older
              </span>
            </label>

            {/* Buttons */}
            <div className="flex flex-col gap-3">
              <button
                onClick={handleEnter}
                disabled={!checked}
                className="btn-primary py-3"
              >
                Enter Site
              </button>
              <a
                href="https://google.com"
                className="btn-secondary py-2.5 text-center"
              >
                Leave
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
