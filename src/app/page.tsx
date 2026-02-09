import Link from "next/link";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      {/* Subtle radial glow behind hero */}
      <div
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07]"
        style={{
          background:
            "radial-gradient(circle, var(--denim-400) 0%, transparent 70%)",
        }}
      />

      <div className="text-center max-w-lg relative">
        {/* Logo */}
        <h1 className="text-6xl sm:text-7xl font-bold tracking-tight animate-fade-in-up">
          <span className="bg-gradient-to-r from-denim-200 via-denim-100 to-white bg-clip-text text-transparent">
            WhatUPB
          </span>
        </h1>

        {/* Tagline */}
        <p className="text-zinc-400 text-lg sm:text-xl mt-4 mb-2 animate-fade-in-up-delay-1 leading-relaxed">
          Share your link. Get real talk from anyone.
        </p>
        <p className="text-zinc-500 text-sm mb-10 animate-fade-in-up-delay-2">
          Anonymous. Honest. Abuse blocked automatically.
        </p>

        {/* CTA buttons */}
        {user ? (
          <div className="flex flex-col gap-3 animate-fade-in-up-delay-3">
            <Link href="/inbox" className="btn-primary text-base py-3.5 animate-glow-pulse">
              Go to Inbox
            </Link>
            <Link href="/settings" className="btn-secondary py-3">
              Settings
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3 animate-fade-in-up-delay-3">
            <Link
              href="/signup"
              className="btn-primary text-base py-3.5 animate-glow-pulse"
            >
              Create Your Link
            </Link>
            <Link href="/login" className="btn-secondary py-3">
              Log In
            </Link>
          </div>
        )}

        {/* Social proof / trust */}
        <div className="mt-12 animate-fade-in-up-delay-4">
          <div className="flex items-center justify-center gap-6 text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-emerald-500/70"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Abuse auto-blocked
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-emerald-500/70"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              Fully anonymous
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5 text-emerald-500/70"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              Takes 30 seconds
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 text-center">
        <p className="text-xs text-zinc-600">
          Built for honest conversations. No human review of messages — ever.
        </p>
      </footer>
    </div>
  );
}
