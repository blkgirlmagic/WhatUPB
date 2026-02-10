"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

type Filter = { id: string; keyword: string };

const THEME_OPTIONS = [
  { value: "dark", label: "Dark", bg: "#0c0c10", accent: "#6366f1" },
  { value: "light", label: "Light", bg: "#f8f8f8", accent: "#4f46e5" },
  { value: "purple", label: "Purple", bg: "#1a0a2e", accent: "#a855f7" },
  { value: "ocean", label: "Ocean", bg: "#0a192f", accent: "#38bdf8" },
] as const;

export default function SettingsClient({
  username,
  isPremium,
  premiumExpiresAt,
  linkTheme,
  initialFilters,
}: {
  username: string;
  isPremium: boolean;
  premiumExpiresAt: string | null;
  linkTheme: string;
  initialFilters: Filter[];
}) {
  const [copied, setCopied] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const [generatingSnapCard, setGeneratingSnapCard] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [filters, setFilters] = useState<Filter[]>(initialFilters);
  const [filterInput, setFilterInput] = useState("");
  const [savingFilters, setSavingFilters] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(linkTheme);
  const [savingTheme, setSavingTheme] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const profileUrl = `https://whatupb.com/${username}`;

  // ---- Copy link ----
  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  // ---- Native share ----
  async function handleNativeShare() {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: "Send me anonymous messages!",
          text: "Send me an anonymous message on WhatUPB",
          url: profileUrl,
        });
        toast("Shared!");
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    handleCopy();
  }

  // ---- Platform shares ----
  function handleShareTwitter() {
    const text = encodeURIComponent(
      `Send me an anonymous message! \u{1F440}\n${profileUrl}`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  }

  function handleShareWhatsApp() {
    const text = encodeURIComponent(
      `Send me an anonymous message! ${profileUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleShareInstagram() {
    navigator.clipboard.writeText(profileUrl);
    toast("Link copied! Paste it in your Instagram bio or story.", "info");
  }

  function handleShareSnapchat() {
    const url = encodeURIComponent(profileUrl);
    const text = encodeURIComponent("Send me anonymous real talk \u{1F4AC}");
    window.open(
      `https://www.snapchat.com/share?url=${url}&text=${text}`,
      "_blank"
    );
  }

  // ---- Story card ----
  const handleStoryCard = useCallback(async () => {
    setGeneratingCard(true);
    try {
      const res = await fetch(
        `/api/story-card?username=${encodeURIComponent(username)}`
      );
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const blob = await res.blob();
      const file = new File([blob], `whatupb-${username}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "WhatUPB",
            text: `Send me anonymous messages! ${profileUrl}`,
            files: [file],
          });
          toast("Shared!");
          return;
        } catch {
          // Fall through to download
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatupb-${username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await navigator.clipboard.writeText(profileUrl);
      toast(
        "Story card downloaded! Link copied — open Instagram \u2192 Add to Story \u2192 upload the image.",
        "info"
      );
    } catch {
      toast("Failed to generate story card. Try again.", "error");
    } finally {
      setGeneratingCard(false);
    }
  }, [username, profileUrl, toast]);

  // ---- Snapchat card ----
  const handleSnapCard = useCallback(async () => {
    setGeneratingSnapCard(true);
    try {
      const { generateSnapCard } = await import("@/lib/generate-snap-card");
      const blob = await generateSnapCard(username);
      const file = new File([blob], `whatupb-snap-${username}.png`, {
        type: "image/png",
      });
      if (
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [file] })
      ) {
        try {
          await navigator.share({
            title: "WhatUPB",
            text: `Send me anonymous messages! ${profileUrl}`,
            files: [file],
          });
          toast("Shared!");
          return;
        } catch {
          // Fall through
        }
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `whatupb-snap-${username}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      await navigator.clipboard.writeText(profileUrl);
      toast(
        "Snapchat card downloaded! Link copied — open Snapchat \u2192 Add to Story \u2192 upload the image.",
        "info"
      );
    } catch {
      toast("Failed to generate Snapchat card. Try again.", "error");
    } finally {
      setGeneratingSnapCard(false);
    }
  }, [username, profileUrl, toast]);

  // ---- Premium checkout ----
  async function handleUpgrade() {
    setCheckingOut(true);
    try {
      const res = await fetch("/api/create-checkout-session", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast(data.error || "Failed to start checkout.", "error");
      }
    } catch {
      toast("Failed to start checkout. Try again.", "error");
    } finally {
      setCheckingOut(false);
    }
  }

  // ---- Keyword filters ----
  async function handleAddFilters() {
    const keywords = filterInput
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter((k) => k.length > 0);
    if (keywords.length === 0) return;

    setSavingFilters(true);
    try {
      const res = await fetch("/api/filters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      if (res.ok) {
        setFilters((prev) => {
          const existingIds = new Set(prev.map((f) => f.id));
          const newFilters = (data.filters || []).filter(
            (f: Filter) => !existingIds.has(f.id)
          );
          return [...prev, ...newFilters];
        });
        setFilterInput("");
        toast("Filters saved!");
      } else {
        toast(data.error || "Failed to save filters.", "error");
      }
    } catch {
      toast("Failed to save filters.", "error");
    } finally {
      setSavingFilters(false);
    }
  }

  async function handleRemoveFilter(id: string) {
    setFilters((prev) => prev.filter((f) => f.id !== id));
    try {
      const res = await fetch(`/api/filters?id=${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast("Failed to remove filter.", "error");
        // Refetch on failure
        const refetch = await fetch("/api/filters");
        if (refetch.ok) {
          const data = await refetch.json();
          setFilters(data.filters || []);
        }
      }
    } catch {
      toast("Failed to remove filter.", "error");
    }
  }

  // ---- Theme ----
  async function handleThemeChange(theme: string) {
    setSelectedTheme(theme);
    setSavingTheme(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ link_theme: theme })
        .eq("username", username);
      if (error) {
        toast("Failed to save theme.", "error");
      } else {
        toast("Theme updated!");
      }
    } catch {
      toast("Failed to save theme.", "error");
    } finally {
      setSavingTheme(false);
    }
  }

  // ---- Logout ----
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Your Link — hero prominence */}
      <div
        className="animate-fade-in-up rounded-2xl p-6 text-center"
        style={{
          background: "var(--surface-1)",
          border: "1px solid rgba(99, 102, 241, 0.2)",
          boxShadow:
            "0 0 40px rgba(99, 102, 241, 0.06), 0 4px 24px rgba(0, 0, 0, 0.3)",
        }}
      >
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500 mb-3">
          Your Link
        </p>
        <p className="text-2xl sm:text-3xl font-bold font-mono text-white tracking-tight mb-2">
          whatupb.com/
          <span className="text-denim-300">{username}</span>
        </p>
        <p className="text-xs text-zinc-500 mb-4">
          This is your personal link — share it anywhere.
        </p>
        <button
          onClick={handleCopy}
          className="btn-primary py-2.5 px-6 text-sm"
        >
          {copied ? (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4 animate-check-scale"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Copied
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Copy Link
            </span>
          )}
        </button>
      </div>

      {/* Share — primary action */}
      <div className="card animate-fade-in-up-delay-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
          Share Your Link
        </h2>
        <p className="text-sm text-zinc-400 mb-3 font-mono">
          whatupb.com/<span className="text-denim-300">{username}</span>
        </p>
        <button
          onClick={handleNativeShare}
          className="btn-primary w-full py-3.5 text-base mb-4"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          Share My Link
        </button>
        <div className="grid grid-cols-5 gap-2">
          <button onClick={handleShareTwitter} className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5" title="Share on X">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
            X
          </button>
          <button onClick={handleShareWhatsApp} className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5" title="Share on WhatsApp">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
            WhatsApp
          </button>
          <button onClick={handleShareInstagram} className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5" title="Copy for Instagram">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
            Instagram
          </button>
          <button onClick={handleShareSnapchat} className="flex-col py-3 px-2 text-xs gap-1.5 flex items-center justify-center rounded-xl font-medium transition-all duration-200 text-white" style={{ backgroundColor: "#00AEF3" }} title="Share on Snapchat">
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.998-.263.103-.043.199-.077.291-.077.15 0 .291.057.402.156.168.148.237.375.18.59-.078.321-.446.551-.72.636-.122.04-.24.074-.36.107-.228.065-.44.132-.596.244-.18.134-.255.3-.264.493-.009.156.061.312.14.468.102.208.211.425.294.66.158.464.138.888-.064 1.26-.316.58-1.01.9-2.07.95-.15.007-.308.014-.497.018l-.076.001c-.163.004-.297.042-.397.128-.138.119-.25.314-.34.583-.013.039-.025.076-.037.112-.116.346-.24.706-.512.939-.31.265-.688.283-1.033.33-.29.04-.578.08-.85.166-.39.124-.727.372-1.1.65-.476.356-.994.738-1.66.914-.077.02-.153.035-.23.035-.093 0-.181-.022-.27-.064-.089.042-.177.064-.27.064-.077 0-.153-.015-.23-.035-.666-.176-1.183-.558-1.66-.914-.372-.278-.71-.526-1.1-.65-.272-.086-.56-.126-.85-.166-.345-.047-.723-.065-1.033-.33-.272-.233-.396-.593-.512-.939-.012-.036-.024-.073-.037-.112-.09-.269-.202-.464-.34-.583-.1-.086-.234-.124-.397-.128l-.076-.001c-.189-.004-.347-.011-.497-.018-1.06-.05-1.754-.37-2.07-.95-.202-.372-.222-.796-.064-1.26.083-.235.192-.452.294-.66.079-.156.149-.312.14-.468-.01-.193-.084-.359-.264-.493-.156-.112-.368-.18-.596-.244-.12-.033-.238-.067-.36-.107-.274-.085-.642-.315-.72-.636-.057-.215.012-.442.18-.59.111-.099.252-.156.402-.156.092 0 .188.034.291.077.339.143.698.247.998.263.198 0 .326-.045.401-.09a8.254 8.254 0 01-.033-.57c-.104-1.628-.23-3.654.3-4.848C5.447 1.069 8.806.793 9.795.793h2.41z" /></svg>
            Snapchat
          </button>
          <button onClick={handleCopy} className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5" title="Copy link">
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
            Copy
          </button>
        </div>
      </div>

      {/* Story Card Generators */}
      <div className="card animate-fade-in-up-delay-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
          Instagram Story
        </h2>
        <p className="text-xs text-zinc-600 mb-3">
          Generate a story card image to share on Instagram, Snapchat, or any platform.
        </p>
        <button onClick={handleStoryCard} disabled={generatingCard} className="btn-secondary w-full py-3">
          {generatingCard ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Generate Story Card
            </span>
          )}
        </button>
      </div>

      <div className="card animate-fade-in-up-delay-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
          Snapchat Story
        </h2>
        <p className="text-xs text-zinc-600 mb-3">
          Download a Snapchat-optimized story card with QR code.
        </p>
        <button onClick={handleSnapCard} disabled={generatingSnapCard} className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #FFFC00 0%, #FF6B00 100%)", color: "#000", opacity: generatingSnapCard ? 0.6 : 1 }}>
          {generatingSnapCard ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.998-.263.103-.043.199-.077.291-.077.15 0 .291.057.402.156.168.148.237.375.18.59-.078.321-.446.551-.72.636-.122.04-.24.074-.36.107-.228.065-.44.132-.596.244-.18.134-.255.3-.264.493-.009.156.061.312.14.468.102.208.211.425.294.66.158.464.138.888-.064 1.26-.316.58-1.01.9-2.07.95-.15.007-.308.014-.497.018l-.076.001c-.163.004-.297.042-.397.128-.138.119-.25.314-.34.583-.013.039-.025.076-.037.112-.116.346-.24.706-.512.939-.31.265-.688.283-1.033.33-.29.04-.578.08-.85.166-.39.124-.727.372-1.1.65-.476.356-.994.738-1.66.914-.077.02-.153.035-.23.035-.093 0-.181-.022-.27-.064-.089.042-.177.064-.27.064-.077 0-.153-.015-.23-.035-.666-.176-1.183-.558-1.66-.914-.372-.278-.71-.526-1.1-.65-.272-.086-.56-.126-.85-.166-.345-.047-.723-.065-1.033-.33-.272-.233-.396-.593-.512-.939-.012-.036-.024-.073-.037-.112-.09-.269-.202-.464-.34-.583-.1-.086-.234-.124-.397-.128l-.076-.001c-.189-.004-.347-.011-.497-.018-1.06-.05-1.754-.37-2.07-.95-.202-.372-.222-.796-.064-1.26.083-.235.192-.452.294-.66.079-.156.149-.312.14-.468-.01-.193-.084-.359-.264-.493-.156-.112-.368-.18-.596-.244-.12-.033-.238-.067-.36-.107-.274-.085-.642-.315-.72-.636-.057-.215.012-.442.18-.59.111-.099.252-.156.402-.156.092 0 .188.034.291.077.339.143.698.247.998.263.198 0 .326-.045.401-.09a8.254 8.254 0 01-.033-.57c-.104-1.628-.23-3.654.3-4.848C5.447 1.069 8.806.793 9.795.793h2.41z" /></svg>
              Generate Snapchat Card
            </span>
          )}
        </button>
      </div>

      {/* Upgrade to Premium / Premium Status */}
      <div
        className="card animate-fade-in-up-delay-2"
        style={
          isPremium
            ? {
                border: "1px solid rgba(168, 85, 247, 0.3)",
                boxShadow: "0 0 30px rgba(168, 85, 247, 0.08)",
              }
            : {}
        }
      >
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Plan
          </h2>
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
              isPremium
                ? "bg-purple-500/15 text-purple-300 border border-purple-500/30"
                : "bg-zinc-800 text-zinc-400 border border-zinc-700"
            }`}
          >
            {isPremium ? "Premium" : "Free"}
          </span>
        </div>

        {isPremium ? (
          <div>
            <p className="text-sm text-zinc-400 mb-3">
              Unlimited message history, keyword filters, custom themes.
            </p>
            {premiumExpiresAt && (
              <p className="text-xs text-zinc-600">
                Renews{" "}
                {new Date(premiumExpiresAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
        ) : (
          <div>
            <p className="text-sm text-zinc-400 mb-1">
              Unlock unlimited history, keyword filters, and custom link themes.
            </p>
            <p className="text-lg font-bold text-white mb-3">
              $4.99<span className="text-sm font-normal text-zinc-500">/mo</span>
            </p>
            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2"
              style={{
                background:
                  "linear-gradient(135deg, #a855f7, #7c3aed)",
                color: "#fff",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                boxShadow: "0 0 20px rgba(168, 85, 247, 0.15)",
                opacity: checkingOut ? 0.6 : 1,
              }}
            >
              <svg
                className="w-4.5 h-4.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              {checkingOut ? "Redirecting..." : "Upgrade to Premium"}
            </button>
          </div>
        )}
      </div>

      {/* Keyword Filters (Premium) */}
      {isPremium && (
        <div className="card animate-fade-in-up-delay-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Keyword Filters
            </h2>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-denim-300 hover:text-denim-200 transition"
              type="button"
            >
              {showFilters ? "Hide" : "Manage"}
            </button>
          </div>
          <p className="text-xs text-zinc-600 mb-3">
            Block messages containing specific words.{" "}
            {filters.length > 0 && (
              <span className="text-zinc-500">
                {filters.length} active filter{filters.length !== 1 && "s"}
              </span>
            )}
          </p>

          {showFilters && (
            <div className="animate-fade-in-up">
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={filterInput}
                  onChange={(e) => setFilterInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddFilters();
                    }
                  }}
                  placeholder="word1, word2, word3..."
                  className="input text-sm flex-1"
                  disabled={savingFilters}
                />
                <button
                  onClick={handleAddFilters}
                  disabled={
                    savingFilters || filterInput.trim().length === 0
                  }
                  className="btn-primary py-2 px-4 text-xs whitespace-nowrap"
                  type="button"
                >
                  {savingFilters ? "..." : "Add"}
                </button>
              </div>

              {filters.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {filters.map((f) => (
                    <span
                      key={f.id}
                      className="inline-flex items-center gap-1 bg-surface-2 border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-zinc-300"
                    >
                      {f.keyword}
                      <button
                        onClick={() => handleRemoveFilter(f.id)}
                        className="text-zinc-600 hover:text-red-400 transition ml-0.5"
                        type="button"
                        aria-label={`Remove ${f.keyword}`}
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Link Theme (Premium) */}
      {isPremium && (
        <div className="card animate-fade-in-up-delay-3">
          <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
            Link Page Theme
          </h2>
          <div className="grid grid-cols-4 gap-2">
            {THEME_OPTIONS.map((theme) => (
              <button
                key={theme.value}
                onClick={() => handleThemeChange(theme.value)}
                disabled={savingTheme}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all duration-200 ${
                  selectedTheme === theme.value
                    ? "border-denim-400 bg-surface-2"
                    : "border-border-subtle hover:border-border-default"
                }`}
                type="button"
              >
                <div
                  className="w-8 h-8 rounded-full border border-border-default"
                  style={{
                    background: theme.bg,
                    boxShadow:
                      selectedTheme === theme.value
                        ? `0 0 8px ${theme.accent}40`
                        : "none",
                  }}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mt-2.5"
                    style={{ background: theme.accent }}
                  />
                </div>
                <span className="text-xs text-zinc-400">{theme.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Account */}
      <div className="card animate-fade-in-up-delay-3">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
          Account
        </h2>
        <p className="text-sm text-zinc-400 mb-4">
          Logged in as{" "}
          <span className="text-denim-200 font-medium">@{username}</span>
        </p>
        <button
          onClick={handleLogout}
          className="w-full border border-red-500/30 text-red-400/80 text-sm font-medium py-2.5 rounded-xl hover:bg-red-500/5 hover:border-red-500/50 transition"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
