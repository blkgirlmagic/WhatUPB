"use client";

import { useState, useRef } from "react";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function MessageForm({
  recipientId,
  username,
}: {
  recipientId: string;
  username: string;
}) {
  const [content, setContent] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const hasTurnstile = TURNSTILE_SITE_KEY.length > 0;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
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
        setError(data.error || "Failed to send message. Try again.");
        setLoading(false);
        // Reset Turnstile (token is single-use)
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

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

  if (sent) {
    return (
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-6">
        <p className="text-green-400 font-medium mb-2">Message sent!</p>
        <p className="text-zinc-400 text-sm mb-4">
          Your anonymous message has been delivered to @{username}.
        </p>
        <button
          onClick={() => setSent(false)}
          className="text-white text-sm hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSend}>
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Type your anonymous message..."
        required
        maxLength={1000}
        rows={5}
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 resize-none mb-3"
      />
      <p className="text-xs text-zinc-500 mb-3 text-right">
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
        disabled={loading || !content.trim() || (hasTurnstile && !turnstileToken)}
        className="w-full bg-white text-black font-medium py-2.5 rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
      <p className="text-xs text-zinc-500 mt-3">
        Your identity is completely anonymous. No account required.
      </p>
    </form>
  );
}
