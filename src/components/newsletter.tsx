"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ──────────────────────────────────────────────────────

interface SubscribeResult {
  alreadySubscribed: boolean;
}

interface FormProps {
  onSuccess: (result: SubscribeResult) => void;
  source: string;
  compact?: boolean;
}

// ── API call ───────────────────────────────────────────────────

async function submitSubscription(
  email: string,
  source: string
): Promise<{ ok: true; alreadySubscribed: boolean } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    });

    const data = await res.json();

    if (!res.ok) {
      return { ok: false, error: data.error || "Something went wrong. Please try again." };
    }

    return { ok: true, alreadySubscribed: data.alreadySubscribed === true };
  } catch {
    return { ok: false, error: "Connection error. Please try again." };
  }
}

// ── Shared email form ──────────────────────────────────────────

function NewsletterForm({ onSuccess, source, compact }: FormProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();

    // Client-side pre-check
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setError("");

    const result = await submitSubscription(trimmed, source);

    if (!result.ok) {
      setError(result.error);
      setLoading(false);
      return;
    }

    // Only set localStorage AFTER Supabase confirms success
    if (!result.alreadySubscribed) {
      try {
        localStorage.setItem(SUBSCRIBED_KEY, "true");
      } catch {}
    }

    setLoading(false);
    onSuccess({ alreadySubscribed: result.alreadySubscribed });
  };

  return (
    <form
      className={`wb-nl-form${compact ? " compact" : ""}`}
      onSubmit={handleSubmit}
      noValidate
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="wb-nl-input"
        required
        disabled={loading}
      />
      <button type="submit" className="wb-nl-submit" disabled={loading}>
        {loading ? "Joining…" : "JOIN FREE →"}
      </button>
      {error && <p className="wb-nl-error">{error}</p>}
    </form>
  );
}

// ── Success state ──────────────────────────────────────────────

function SuccessState({
  onClose,
  alreadySubscribed,
  compact,
}: {
  onClose: () => void;
  alreadySubscribed: boolean;
  compact?: boolean;
}) {
  return (
    <div className={`wb-nl-success${compact ? " compact" : ""}`}>
      <div className="wb-nl-success-icon">✓</div>
      <div className="wb-nl-success-title">
        {alreadySubscribed ? "Already subscribed." : "You're in."}
      </div>
      <p className="wb-nl-success-sub">
        {alreadySubscribed
          ? "You're already on the WhatUPB Brief."
          : "Welcome to the WhatUPB Brief. Check your inbox for confirmation."}
      </p>
      <button className="wb-btn-primary" onClick={onClose}>
        Close
      </button>
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────────────

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewsletterModal({ isOpen, onClose }: NewsletterModalProps) {
  const [result, setResult] = useState<SubscribeResult | null>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      // Reset on next open
      setResult(null);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="wb-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      <div className="wb-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="wb-modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>

        {result ? (
          <SuccessState
            onClose={onClose}
            alreadySubscribed={result.alreadySubscribed}
          />
        ) : (
          <>
            <div className="wb-modal-tag">JOIN WHATUPB</div>
            <h2 className="wb-modal-title">Get the WhatUPB Brief</h2>
            <p className="wb-modal-sub">
              Weekly intelligence connecting government disclosures, crypto
              policy, blockchain metrics, and digital asset activity.
            </p>

            <NewsletterForm
              onSuccess={setResult}
              source="join_free"
            />

            <p className="wb-modal-fine">
              Free newsletter. No trading calls. Unsubscribe anytime.
            </p>

            <div className="wb-modal-includes">
              <div className="wb-modal-includes-label">What&apos;s included</div>
              <div className="wb-modal-includes-list">
                <span className="wb-modal-include-item">📋 Congressional disclosures</span>
                <span className="wb-modal-include-item">⚖️ Policy &amp; legislation updates</span>
                <span className="wb-modal-include-item">⛓️ On-chain network data</span>
                <span className="wb-modal-include-item">🪙 Digital asset intelligence</span>
                <span className="wb-modal-include-item">🔗 Signal analysis</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Popup (delayed) ────────────────────────────────────────────

const DISMISS_KEY = "wb-nl-dismissed";
const SUBSCRIBED_KEY = "wb-nl-subscribed";
const DISMISS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 days ms

function shouldShowPopup(): boolean {
  try {
    if (localStorage.getItem(SUBSCRIBED_KEY) === "true") {
      return false;
    }
    const raw = localStorage.getItem(DISMISS_KEY);
    if (raw) {
      const ts = parseInt(raw, 10);
      if (!isNaN(ts) && Date.now() - ts < DISMISS_TTL) {
        return false;
      }
    }
  } catch {
    return false;
  }
  return true;
}

function dismissPopup() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
  } catch {}
}

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    if (!shouldShowPopup()) return;

    function trigger() {
      if (triggered.current) return;
      triggered.current = true;
      setVisible(true);
    }

    const timer = setTimeout(trigger, 35000);

    // OR trigger after 40% scroll depth
    function onScroll() {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      if (total > 100 && scrolled / total >= 0.4) {
        trigger();
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function handleClose() {
    dismissPopup();
    setVisible(false);
  }

  function handleSuccess(_r: SubscribeResult) {
    // localStorage already set inside NewsletterForm after API confirms;
    // just close the popup — the subscribed flag prevents it from returning.
    setVisible(false);
  }

  // ESC to dismiss
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className="wb-popup-overlay"
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-label="Newsletter signup"
    >
      <div className="wb-popup" onClick={(e) => e.stopPropagation()}>
        <button
          className="wb-popup-close"
          onClick={handleClose}
          aria-label="Dismiss newsletter popup"
        >
          ✕
        </button>

        <div className="wb-popup-tag">FREE NEWSLETTER</div>
        <div className="wb-popup-title">Get the WhatUPB Brief</div>
        <p className="wb-popup-sub">
          Weekly intelligence on government disclosures, crypto policy, and
          blockchain activity.
        </p>
        <NewsletterForm
          onSuccess={handleSuccess}
          source="homepage_popup"
          compact
        />
        <p className="wb-popup-fine">Free. No trading calls. Unsubscribe anytime.</p>
      </div>
    </div>
  );
}
