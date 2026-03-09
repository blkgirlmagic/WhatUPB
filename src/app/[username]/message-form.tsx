"use client";

import { useState, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import posthog from "posthog-js";
import { detectCrisis } from "@/lib/crisis-detection";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function MessageForm({
  recipientId,
  username,
  prompt,
}: {
  recipientId: string;
  username: string;
  prompt?: string;
}) {
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const hasTurnstile = TURNSTILE_SITE_KEY.length > 0;

  const [showCrisisModal, setShowCrisisModal] = useState(false);
  const [crisisAcknowledged, setCrisisAcknowledged] = useState(false);

  async function handleSend() {
    if (!content.trim()) return;
    if (hasTurnstile && !turnstileToken) {
      setError("Please complete the verification.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId,
          content: content.trim(),
          turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Better error messages depending on status
        if (response.status === 403) {
          setError(
            "Message blocked — threats and abuse aren't allowed. Try rephrasing."
          );
        } else if (response.status === 429) {
          setError("Too many messages. Please wait a minute and try again.");
        } else {
          setError(data.error || "Failed to send message. Try again.");
        }
        setLoading(false);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      posthog.capture("message_sent");
      setSent(true);
      setContent("");
      setLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } catch {
      setError("Failed to send message. Try again.");
      setLoading(false);
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    }
  }

  function handleSubmitAttempt(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;

    if (detectCrisis(content) && !crisisAcknowledged) {
      setShowCrisisModal(true);
      return;
    }

    handleSend();
  }

  function handleCrisisContinue() {
    setShowCrisisModal(false);
    setCrisisAcknowledged(true);
    handleSend();
  }

  if (sent) {
    return (
      <div className="card-elevated text-center py-8 animate-fade-in-up">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-6 h-6 text-emerald-400 animate-check-scale"
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
        </div>
        <p className="text-white font-semibold text-lg mb-1">Message sent!</p>
        <p className="text-zinc-500 text-sm mb-6">
          Your anonymous message was delivered to @{username}.
        </p>
        <button onClick={() => setSent(false)} className="btn-ghost text-sm">
          Send another message
        </button>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmitAttempt} className="animate-fade-in-up">
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
      {prompt && (
        <div className="mb-3 text-left">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
            They want to know:
          </p>
          <p className="text-sm text-denim-200 font-medium italic">
            &ldquo;{prompt}&rdquo;
          </p>
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => {
            setContent(e.target.value);
            setCrisisAcknowledged(false);
          }}
        placeholder="Type your anonymous message..."
        required
        maxLength={1000}
        rows={5}
        className="input resize-none mb-2 min-h-[120px]"
      />
      <p className="text-xs text-zinc-600 mb-3 text-right tabular-nums">
        {content.length}/1000
      </p>
      {hasTurnstile && (
        <div className="mb-3 flex justify-center">
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={(token) => setTurnstileToken(token)}
            onExpire={() => setTurnstileToken(null)}
            onError={() => setTurnstileToken(null)}
          />
        </div>
      )}
      <button
        type="submit"
        disabled={
          loading || !content.trim() || (hasTurnstile && !turnstileToken)
        }
        className="btn-primary w-full py-3"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg
              className="w-4 h-4 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Sending...
          </span>
        ) : (
          "Send Message"
        )}
      </button>
      <div className="flex items-center justify-center gap-1.5 mt-4">
        <svg
          className="w-3 h-3 text-zinc-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
        <p className="text-xs text-zinc-600">
          Completely anonymous. No account needed.
        </p>
      </div>
    </form>

      {/* Crisis resource interstitial */}
      {showCrisisModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCrisisModal(false)}
          />
          <div className="relative z-10 w-full max-w-sm bg-surface-1 border border-border-subtle rounded-2xl p-6 animate-fade-in-up">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                />
              </svg>
            </div>
            <p className="text-white text-center font-medium mb-2">
              You&apos;re not alone
            </p>
            <p className="text-zinc-400 text-sm text-center leading-relaxed mb-6">
              If you&apos;re going through something hard, help is available
              24/7. Text or call{" "}
              <a
                href="tel:988"
                className="text-amber-300 underline hover:text-amber-200 transition font-medium"
              >
                988
              </a>{" "}
              anytime.
            </p>
            <div className="flex flex-col gap-2">
              <a
                href="tel:988"
                className="btn-primary w-full py-3 text-sm text-center"
              >
                Call or Text 988
              </a>
              <button
                type="button"
                onClick={handleCrisisContinue}
                className="w-full py-3 text-sm text-zinc-400 hover:text-white transition rounded-xl bg-surface-2 border border-border-subtle"
              >
                Continue Sending
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
