"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/toast";

type Reply = {
  id: string;
  content: string;
  created_at: string;
};

type Message = {
  id: string;
  content: string;
  created_at: string;
  replies?: Reply[];
};

export default function MessageList({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  // Focus textarea when reply form opens
  useEffect(() => {
    if (replyingTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyingTo]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    }
    setDeletingId(null);
  }

  function handleReplyOpen(messageId: string) {
    if (replyingTo === messageId) {
      setReplyingTo(null);
      setReplyText("");
    } else {
      setReplyingTo(messageId);
      setReplyText("");
    }
  }

  async function handleReplySend(messageId: string) {
    const content = replyText.trim();
    if (!content || sendingReply) return;

    setSendingReply(true);

    // Optimistic update — show reply immediately
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticReply: Reply = {
      id: optimisticId,
      content,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId
          ? { ...m, replies: [...(m.replies || []), optimisticReply] }
          : m
      )
    );
    setReplyText("");
    setReplyingTo(null);

    try {
      const res = await fetch(`/api/messages/${messageId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        // Roll back optimistic update
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  replies: (m.replies || []).filter(
                    (r) => r.id !== optimisticId
                  ),
                }
              : m
          )
        );

        if (res.status === 403) {
          toast("Reply blocked for safety.", "error");
        } else {
          toast(data.error || "Failed to send reply.", "error");
        }
        return;
      }

      const { reply: serverReply } = await res.json();

      // Replace optimistic reply with server-confirmed data
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                replies: (m.replies || []).map((r) =>
                  r.id === optimisticId ? serverReply : r
                ),
              }
            : m
        )
      );

      toast("Reply sent!");
    } catch {
      // Roll back on network error
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                replies: (m.replies || []).filter(
                  (r) => r.id !== optimisticId
                ),
              }
            : m
        )
      );
      toast("Failed to send reply. Try again.", "error");
    } finally {
      setSendingReply(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg) => {
        const replies = msg.replies || [];
        const isReplying = replyingTo === msg.id;

        return (
          <div key={msg.id} className="card group">
            {/* Original anonymous message */}
            <p className="text-white whitespace-pre-wrap break-words mb-3 leading-relaxed">
              {msg.content}
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600 tabular-nums">
                {formatDate(msg.created_at)}
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleReplyOpen(msg.id)}
                  className="reply-toggle-btn text-xs text-denim-300 hover:text-denim-200 transition opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1"
                  type="button"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                  Reply
                </button>
                <button
                  onClick={() => handleDelete(msg.id)}
                  disabled={deletingId === msg.id}
                  className="text-xs text-zinc-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                  type="button"
                >
                  {deletingId === msg.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>

            {/* Replies thread */}
            {replies.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border-subtle">
                <div className="flex flex-col gap-2">
                  {replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="reply-bubble ml-4 pl-3 border-l-2 border-denim-500/30"
                    >
                      <p className="text-zinc-300 text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {reply.content}
                      </p>
                      <span className="text-xs text-zinc-600 tabular-nums mt-1 block">
                        {reply.id.startsWith("optimistic-") ? (
                          <span className="text-denim-400 animate-subtle-pulse">
                            Sending...
                          </span>
                        ) : (
                          <>You &middot; {formatDate(reply.created_at)}</>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reply form (inline, below card content) */}
            {isReplying && (
              <div className="mt-3 pt-3 border-t border-border-subtle animate-fade-in-up">
                <textarea
                  ref={textareaRef}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReplySend(msg.id);
                    }
                    if (e.key === "Escape") {
                      setReplyingTo(null);
                      setReplyText("");
                    }
                  }}
                  placeholder="Your anonymous reply..."
                  maxLength={1000}
                  rows={2}
                  className="input text-sm resize-none mb-2"
                  disabled={sendingReply}
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-600">
                    {replyText.length}/1000
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText("");
                      }}
                      className="text-xs text-zinc-500 hover:text-zinc-300 transition px-3 py-1.5"
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleReplySend(msg.id)}
                      disabled={sendingReply || replyText.trim().length === 0}
                      className="btn-primary py-1.5 px-4 text-xs"
                      type="button"
                    >
                      {sendingReply ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
