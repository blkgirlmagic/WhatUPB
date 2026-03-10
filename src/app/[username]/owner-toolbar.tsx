"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/toast";

export default function OwnerToolbar({
  username,
  initialPrompt,
  initialMood,
}: {
  username: string;
  initialPrompt: string;
  initialMood: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [prompt, setPrompt] = useState(initialPrompt);
  const [mood, setMood] = useState(initialMood);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  async function saveField(field: "prompt_of_day" | "mood_status", value: string) {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ [field]: value.trim() || null })
        .eq("username", username);

      if (error) {
        toast("Failed to save. Try again.", "error");
      } else {
        toast("Saved!");
      }
    } catch {
      toast("Failed to save. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Floating pill at bottom center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
        <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-1.5 py-1.5 shadow-lg">
          <Link
            href="/inbox"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859M12 3v8.25m0 0l-3-3m3 3l3-3" />
            </svg>
            Inbox
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <Link
            href="/settings"
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition px-3 py-1.5 rounded-full hover:bg-white/10"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
          <div className="w-px h-4 bg-white/10" />
          <button
            onClick={() => setExpanded(!expanded)}
            className={"flex items-center gap-1.5 text-xs transition px-3 py-1.5 rounded-full " + (expanded ? "text-white bg-white/10" : "text-zinc-400 hover:text-white hover:bg-white/10")}
            type="button"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
            </svg>
            Edit
          </button>
        </div>
      </div>

      {/* Expandable edit panel */}
      {expanded && (
        <div className="fixed inset-0 z-40" onClick={() => setExpanded(false)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-surface-1 border border-border-subtle rounded-2xl p-5 shadow-2xl animate-fade-in-up">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-zinc-300">Edit Profile</h3>
                <button
                  onClick={() => setExpanded(false)}
                  className="text-zinc-500 hover:text-white transition"
                  type="button"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Prompt of the Day */}
              <div className="mb-4">
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                  Prompt of the Day
                </label>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onBlur={() => {
                    if (prompt !== initialPrompt) saveField("prompt_of_day", prompt);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  maxLength={100}
                  placeholder="Ask visitors something..."
                  className="input text-sm w-full"
                  disabled={saving}
                />
                <p className="text-xs text-zinc-600 mt-1">Shown above the message form. Max 100 chars.</p>
              </div>

              {/* Mood / Status */}
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1.5">
                  Mood / Status
                </label>
                <input
                  type="text"
                  value={mood}
                  onChange={(e) => setMood(e.target.value)}
                  onBlur={() => {
                    if (mood !== initialMood) saveField("mood_status", mood);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") e.currentTarget.blur();
                  }}
                  maxLength={60}
                  placeholder="How are you feeling?"
                  className="input text-sm w-full"
                  disabled={saving}
                />
                <p className="text-xs text-zinc-600 mt-1">Tagline below your @handle. Max 60 chars.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
