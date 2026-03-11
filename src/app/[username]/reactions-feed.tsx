"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/toast";

type Reaction = {
  id: string;
  content: string;
  created_at: string;
};

export default function ReactionsFeed({
  reactions: initialReactions,
  isOwner,
}: {
  reactions: Reaction[];
  isOwner: boolean;
}) {
  const [reactions, setReactions] = useState(initialReactions);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  function formatDate(dateStr: string) {
    if (!mounted) {
      return new Date(dateStr).toLocaleDateString("en-US", {
        timeZone: "UTC",
        month: "short",
        day: "numeric",
      });
    }
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);

    if (diffMin < 1) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  async function handleDelete(reactionId: string) {
    setDeletingId(reactionId);
    setReactions((prev) => prev.filter((r) => r.id !== reactionId));

    try {
      const res = await fetch("/api/reactions", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-protection": "1",
        },
        body: JSON.stringify({ reactionId }),
      });

      if (!res.ok) {
        setReactions(initialReactions);
        toast("Failed to delete reaction.", "error");
      }
    } catch {
      setReactions(initialReactions);
      toast("Failed to delete reaction.", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (reactions.length === 0) {
    return (
      <div className="anim-3" style={{ width: "min(520px, 100%)", marginTop: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(155,142,232,0.12)" }} />
          <div style={{ fontSize: "10.5px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>Reactions</div>
          <div style={{ flex: 1, height: "1px", background: "rgba(155,142,232,0.12)" }} />
        </div>
        <p style={{ textAlign: "center", fontSize: "14px", color: "var(--muted)", fontStyle: "italic", padding: "24px 0" }}>
          nothing yet. someone&apos;s being mysterious.
        </p>
      </div>
    );
  }

  return (
    <div className="anim-3" style={{ width: "min(520px, 100%)", marginTop: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "14px" }}>
        <div style={{ flex: 1, height: "1px", background: "rgba(155,142,232,0.12)" }} />
        <div style={{ fontSize: "10.5px", letterSpacing: "2.5px", textTransform: "uppercase" as const, color: "var(--muted)", fontWeight: 500, whiteSpace: "nowrap" }}>Reactions</div>
        <div style={{ flex: 1, height: "1px", background: "rgba(155,142,232,0.12)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {reactions.map((reaction) => (
          <div key={reaction.id} className="profile-reaction-card">
            <p style={{ fontSize: "14px", fontStyle: "italic", color: "var(--ink2)", lineHeight: 1.6, marginBottom: "8px", opacity: 0.75, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              &ldquo;{reaction.content}&rdquo;
            </p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "11.5px", color: "rgba(26,23,48,0.28)", fontVariantNumeric: "tabular-nums" }}>
                {formatDate(reaction.created_at)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleDelete(reaction.id)}
                  disabled={deletingId === reaction.id}
                  type="button"
                  style={{ fontSize: "12px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", opacity: 0.5, transition: "all 0.2s", padding: "2px 6px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.color = "#ef4444"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.5"; e.currentTarget.style.color = "var(--muted)"; }}
                >
                  {deletingId === reaction.id ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
