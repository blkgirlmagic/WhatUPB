"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Message = {
  id: string;
  content: string;
  created_at: string;
};

export default function MessageList({
  initialMessages,
}: {
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  async function handleDelete(id: string) {
    setDeletingId(id);

    const { error } = await supabase.from("messages").delete().eq("id", id);

    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    }

    setDeletingId(null);
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
      {messages.map((msg) => (
        <div key={msg.id} className="card group">
          <p className="text-white whitespace-pre-wrap break-words mb-3 leading-relaxed">
            {msg.content}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-600 tabular-nums">
              {formatDate(msg.created_at)}
            </span>
            <button
              onClick={() => handleDelete(msg.id)}
              disabled={deletingId === msg.id}
              className="text-xs text-zinc-600 hover:text-red-400 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
            >
              {deletingId === msg.id ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
