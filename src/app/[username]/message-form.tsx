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
  const [showCrisisIntercept, setShowCrisisIntercept] = useState(false);
  const [crisisInterceptMessage, setCrisisInterceptMessage] = useState("");

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

      if (data.crisis) {
        setCrisisInterceptMessage(data.message);
        setShowCrisisIntercept(true);
        setLoading(false);
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            data.error || "Message blocked — threats and abuse aren’t allowed. Try rephrasing."
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

  function handleCrisisInterceptDismiss() {
    setShowCrisisIntercept(false);
    setCrisisInterceptMessage("");
    setContent("");
  }

  if (sent) {
    return (
      <div className="anim-2 profile-main-card" style={{ textAlign: "center", padding: "40px 28px" }}>
        <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, fontSize: "18px", color: "var(--ink)", marginBottom: "4px" }}>Message sent!</p>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "24px" }}>
          Your anonymous message was delivered to @{username}.
        </p>
        <button onClick={() => setSent(false)} style={{ padding: "10px 24px", borderRadius: "50px", border: "1px solid var(--faint)", background: "rgba(255,255,255,0.6)", color: "var(--muted)", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}>
          Send another message
        </button>
      </div>
    );
  }

  if (showCrisisIntercept) {
    return (
      <div className="anim-2 profile-main-card" style={{ textAlign: "center", padding: "40px 24px" }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#3b82f6" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
          </svg>
        </div>
        <p style={{ color: "var(--ink2)", fontSize: "15px", lineHeight: 1.6, marginBottom: "24px" }}>
          {crisisInterceptMessage}
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <a href="tel:988" className="card-btn-primary" style={{ textAlign: "center", textDecoration: "none" }}>
            Call or Text 988
          </a>
          <a href="https://988lifeline.org/chat/" target="_blank" rel="noopener noreferrer" style={{ display: "block", width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid rgba(59,130,246,0.25)", background: "rgba(59,130,246,0.08)", color: "#2563eb", fontSize: "14px", textAlign: "center", textDecoration: "none", transition: "all 0.2s" }}>
            Chat Online Now
          </a>
          <button type="button" onClick={handleCrisisInterceptDismiss} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "none", background: "transparent", color: "var(--muted)", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const isOverLimit = content.length > 900;

  return (
    <>
      <form onSubmit={handleSubmitAttempt} className="anim-2 profile-main-card">
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", color: "#991b1b", padding: "12px 16px", borderRadius: "12px", marginBottom: "16px", fontSize: "14px" }}>
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {prompt && (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontSize: "10.5px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "var(--muted)", fontWeight: 500, marginBottom: "6px" }}>
              They want to know:
            </div>
            <div style={{ fontSize: "16px", fontStyle: "italic", fontWeight: 400, color: "var(--lav)", lineHeight: 1.5 }}>
              &ldquo;{prompt}&rdquo;
            </div>
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
          className="profile-textarea"
        />

        <div style={{ textAlign: "right", fontSize: "11.5px", color: isOverLimit ? "#E57373" : "rgba(26,23,48,0.25)", marginBottom: "16px", fontVariantNumeric: "tabular-nums" }}>
          {content.length} / 1000
        </div>

        {hasTurnstile && (
          <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
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
          disabled={loading || !content.trim() || (hasTurnstile && !turnstileToken)}
          className="card-btn-primary"
          style={{ marginBottom: "14px" }}
        >
          {loading ? "Sending..." : "Send Message"}
        </button>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", fontSize: "12.5px", color: "var(--muted)" }}>
          <span style={{ fontSize: "13px" }}>{"🔒"}</span>
          Completely anonymous. No account needed.
        </div>
      </form>

      {showCrisisModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
          <div
            style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setShowCrisisModal(false)}
          />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "380px", background: "rgba(255,255,255,0.92)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.95)", borderRadius: "22px", padding: "28px 24px" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="#f59e0b" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <p style={{ fontFamily: "var(--font-syne), 'Syne', sans-serif", fontWeight: 700, color: "var(--ink)", textAlign: "center", marginBottom: "8px" }}>
              You&apos;re not alone
            </p>
            <p style={{ color: "var(--muted)", fontSize: "14px", textAlign: "center", lineHeight: 1.6, marginBottom: "24px" }}>
              If you&apos;re going through something hard, help is available 24/7. Text or call{" "}
              <a href="tel:988" style={{ color: "var(--lav)", textDecoration: "underline", fontWeight: 500 }}>988</a>{" "}
              anytime.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <a href="tel:988" className="card-btn-primary" style={{ textAlign: "center", textDecoration: "none" }}>
                Call or Text 988
              </a>
              <button type="button" onClick={handleCrisisContinue} style={{ width: "100%", padding: "13px", borderRadius: "12px", border: "1px solid var(--faint)", background: "transparent", color: "var(--muted)", fontSize: "14px", cursor: "pointer", transition: "all 0.2s" }}>
                Continue Sending
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
