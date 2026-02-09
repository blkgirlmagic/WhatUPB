"use client";

import { useState, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase-browser";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/toast";

export default function SettingsClient({ username }: { username: string }) {
  const [copied, setCopied] = useState(false);
  const [generatingCard, setGeneratingCard] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const profileUrl = `https://whatupb.com/${username}`;

  // ---- Copy link ----
  function handleCopy() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    toast("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }

  // ---- Native share (mobile-first) ----
  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Send me anonymous messages!",
          text: `Send me an anonymous message on WhatUPB`,
          url: profileUrl,
        });
        toast("Shared!");
      } catch {
        // User cancelled — no error needed
      }
    } else {
      // Fallback: copy link
      handleCopy();
    }
  }

  // ---- Platform shares ----
  function handleShareTwitter() {
    const text = encodeURIComponent(
      `Send me an anonymous message! 👀\n${profileUrl}`
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
    // IG doesn't have a share URL — copy link + toast instruction
    navigator.clipboard.writeText(profileUrl);
    toast("Link copied! Paste it in your Instagram bio or story.", "info");
  }

  // ---- Story card generator (creates PNG via Canvas) ----
  const generateStoryCard = useCallback(async () => {
    setGeneratingCard(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const w = 1080;
      const h = 1920;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;

      // Background — deep indigo/denim gradient
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, "#0f0f1a");
      bgGrad.addColorStop(0.5, "#1a1a35");
      bgGrad.addColorStop(1, "#0f0f1a");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle noise texture dots
      ctx.globalAlpha = 0.03;
      for (let i = 0; i < 5000; i++) {
        const x = Math.random() * w;
        const y = Math.random() * h;
        ctx.fillStyle = "#fff";
        ctx.fillRect(x, y, 1, 1);
      }
      ctx.globalAlpha = 1;

      // Glow circle behind text
      const glowGrad = ctx.createRadialGradient(w / 2, h / 2 - 100, 0, w / 2, h / 2 - 100, 400);
      glowGrad.addColorStop(0, "rgba(99, 102, 241, 0.08)");
      glowGrad.addColorStop(1, "transparent");
      ctx.fillStyle = glowGrad;
      ctx.fillRect(0, 0, w, h);

      // Brand name
      ctx.textAlign = "center";
      ctx.fillStyle = "#a5b4fc";
      ctx.font = "bold 48px system-ui, -apple-system, sans-serif";
      ctx.fillText("WhatUPB", w / 2, h / 2 - 220);

      // Main text
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 72px system-ui, -apple-system, sans-serif";
      ctx.fillText("Send me", w / 2, h / 2 - 80);
      ctx.fillText("anonymous", w / 2, h / 2 + 10);
      ctx.fillText("messages", w / 2, h / 2 + 100);

      // Emoji
      ctx.font = "64px sans-serif";
      ctx.fillText("👀", w / 2, h / 2 + 200);

      // URL
      ctx.fillStyle = "#818cf8";
      ctx.font = "600 44px system-ui, -apple-system, sans-serif";
      ctx.fillText(`whatupb.com/${username}`, w / 2, h / 2 + 320);

      // Bottom badge
      ctx.fillStyle = "rgba(255,255,255,0.06)";
      const badgeW = 400;
      const badgeH = 50;
      const badgeX = w / 2 - badgeW / 2;
      const badgeY = h / 2 + 380;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 25);
      ctx.fill();

      ctx.fillStyle = "#6b7280";
      ctx.font = "24px system-ui, -apple-system, sans-serif";
      ctx.fillText("100% anonymous • abuse blocked", w / 2, badgeY + 34);

      // Download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `whatupb-${username}.png`;
      link.href = dataUrl;
      link.click();

      toast("Story card downloaded!");
    } catch {
      toast("Failed to generate card. Try again.", "error");
    } finally {
      setGeneratingCard(false);
    }
  }, [username, toast]);

  // ---- Logout ----
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Hidden canvas for story card generation */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Your Link */}
      <div className="card animate-fade-in-up">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
          Your Link
        </h2>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-surface-2 px-4 py-2.5 rounded-lg text-sm font-mono truncate text-denim-200 border border-border-subtle">
            whatupb.com/{username}
          </code>
          <button
            onClick={handleCopy}
            className="btn-primary py-2.5 px-4 text-sm"
          >
            {copied ? (
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 animate-check-scale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </span>
            ) : (
              "Copy"
            )}
          </button>
        </div>
      </div>

      {/* Share — primary action */}
      <div className="card animate-fade-in-up-delay-1">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-3">
          Share Your Link
        </h2>

        {/* Big share button — triggers native share sheet on mobile */}
        <button
          onClick={handleNativeShare}
          className="btn-primary w-full py-3.5 text-base mb-4"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share My Link
        </button>

        {/* Secondary platform buttons */}
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleShareTwitter}
            className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5"
            title="Share on X"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            X
          </button>
          <button
            onClick={handleShareWhatsApp}
            className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5"
            title="Share on WhatsApp"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <button
            onClick={handleShareInstagram}
            className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5"
            title="Copy for Instagram"
          >
            <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
            </svg>
            Instagram
          </button>
          <button
            onClick={handleCopy}
            className="btn-secondary flex-col py-3 px-2 text-xs gap-1.5"
            title="Copy link"
          >
            <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            Copy
          </button>
        </div>
      </div>

      {/* Story Card Generator */}
      <div className="card animate-fade-in-up-delay-2">
        <h2 className="text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1">
          Instagram Story
        </h2>
        <p className="text-xs text-zinc-600 mb-3">
          Download a story card image with your link to post on Instagram.
        </p>
        <button
          onClick={generateStoryCard}
          disabled={generatingCard}
          className="btn-secondary w-full py-3"
        >
          {generatingCard ? (
            <span className="flex items-center gap-2">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Generating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Generate Story Card
            </span>
          )}
        </button>
      </div>

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
