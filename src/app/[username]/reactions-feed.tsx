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

    // Optimistic removal
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
        // Rollback
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

  if (reactions.length === 0) return null;

  return (
    <div className="mt-10 w-full animate-fade-in-up">
      {/* Section divider */}
      <div className="flex items-center gap-3 mb-5">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-xs text-zinc-600 uppercase tracking-widest">
          Reactions
        </span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      {/* Feed */}
      <div className="flex flex-col gap-3">
        {reactions.map((reaction) => (
          <div key={reaction.id} className="reaction-card group">
            <p className="text-zinc-300 text-sm whitespace-pre-wrap break-words leading-relaxed">
              {reaction.content}
            </p>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-zinc-600 tabular-nums">
                {formatDate(reaction.created_at)}
              </span>
              {isOwner && (
                <button
                  onClick={() => handleDelete(reaction.id)}
                  disabled={deletingId === reaction.id}
                  className="text-xs text-zinc-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  type="button"
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
