"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";

export default function SettingsClient({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const profileUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/${username}`;

  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleShareTwitter() {
    const text = encodeURIComponent(
      `Send me an anonymous message! ${profileUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  function handleShareWhatsApp() {
    const text = encodeURIComponent(
      `Send me an anonymous message! ${profileUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Your Link */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm text-zinc-400 mb-3">Your link</h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-zinc-800 px-4 py-2.5 rounded-lg text-sm font-mono truncate">
            {profileUrl}
          </code>
          <button
            onClick={handleCopy}
            className="bg-white text-black text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Share */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm text-zinc-400 mb-3">Share</h2>
        <div className="flex gap-3">
          <button
            onClick={handleShareTwitter}
            className="flex-1 border border-zinc-700 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-800 transition"
          >
            Twitter / X
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="flex-1 border border-zinc-700 text-white text-sm font-medium py-2.5 rounded-lg hover:bg-zinc-800 transition"
          >
            WhatsApp
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-5">
        <h2 className="text-sm text-zinc-400 mb-3">Account</h2>
        <p className="text-sm text-zinc-300 mb-4">
          Logged in as <span className="text-white font-medium">@{username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full border border-red-500/50 text-red-400 text-sm font-medium py-2.5 rounded-lg hover:bg-red-500/10 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
