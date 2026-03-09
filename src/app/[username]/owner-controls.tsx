"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/toast";

export default function OwnerControls({
  username,
  initialPrompt,
  initialMood,
}: {
  username: string;
  initialPrompt: string;
  initialMood: string;
}) {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [mood, setMood] = useState(initialMood);
  const [editingPrompt, setEditingPrompt] = useState(false);
  const [editingMood, setEditingMood] = useState(false);
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

  function handlePromptBlur() {
    setEditingPrompt(false);
    if (prompt !== initialPrompt) {
      saveField("prompt_of_day", prompt);
    }
  }

  function handleMoodBlur() {
    setEditingMood(false);
    if (mood !== initialMood) {
      saveField("mood_status", mood);
    }
  }

  const pencilIcon = (
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
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125"
      />
    </svg>
  );

  return (
    <div className="mt-6 w-full animate-fade-in-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-border-subtle" />
        <span className="text-xs text-zinc-600 uppercase tracking-widest">
          Your Profile
        </span>
        <div className="flex-1 h-px bg-border-subtle" />
      </div>

      <div className="flex flex-col gap-3">
        {/* Prompt of the Day */}
        <div className="card text-left">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">
              Prompt of the Day
            </label>
            {!editingPrompt && (
              <button
                onClick={() => setEditingPrompt(true)}
                className="text-xs text-denim-300 hover:text-denim-200 transition"
                type="button"
              >
                {pencilIcon}
              </button>
            )}
          </div>
          {editingPrompt ? (
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onBlur={handlePromptBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              maxLength={100}
              placeholder="Ask your followers something..."
              className="input text-sm"
              disabled={saving}
              autoFocus
            />
          ) : (
            <p
              className="text-sm text-zinc-300 min-h-[1.5rem] cursor-pointer"
              onClick={() => setEditingPrompt(true)}
            >
              {prompt || (
                <span className="text-zinc-600 italic">Not set</span>
              )}
            </p>
          )}
          <p className="text-xs text-zinc-600 mt-1">
            Visitors see this as a conversation starter. Max 100 chars.
          </p>
        </div>

        {/* Mood Status */}
        <div className="card text-left">
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">
              Mood
            </label>
            {!editingMood && (
              <button
                onClick={() => setEditingMood(true)}
                className="text-xs text-denim-300 hover:text-denim-200 transition"
                type="button"
              >
                {pencilIcon}
              </button>
            )}
          </div>
          {editingMood ? (
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              onBlur={handleMoodBlur}
              onKeyDown={(e) => {
                if (e.key === "Enter") e.currentTarget.blur();
              }}
              maxLength={60}
              placeholder="How are you feeling?"
              className="input text-sm"
              disabled={saving}
              autoFocus
            />
          ) : (
            <p
              className="text-sm text-zinc-300 min-h-[1.5rem] cursor-pointer"
              onClick={() => setEditingMood(true)}
            >
              {mood || (
                <span className="text-zinc-600 italic">Not set</span>
              )}
            </p>
          )}
          <p className="text-xs text-zinc-600 mt-1">
            Shown as a tagline below your username. Max 60 chars.
          </p>
        </div>
      </div>
    </div>
  );
}
