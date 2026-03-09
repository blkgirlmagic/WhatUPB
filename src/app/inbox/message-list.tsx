"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";
import { useToast } from "@/components/toast";
import { detectCrisis } from "@/lib/crisis-detection";

type Message = {
  id: string;
  content: string;
  created_at: string;
};

export default function MessageList({
  initialMessages,
  isPremium,
  totalCount,
}: {
  initialMessages: Message[];
  isPremium: boolean;
  totalCount: number;
}) {
  const [mounted, setMounted] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [reactionText, setReactionText] = useState("");
  const [sendingReaction, setSendingReaction] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [shareMenuId, setShareMenuId] = useState<string | null>(null);
  const [shareImageUrl, setShareImageUrl] = useState<string | null>(null);
  const supabase = createClient();
  const { toast } = useToast();

  // Hydration guard — defer timezone-dependent rendering to the client
  useEffect(() => {
    setMounted(true);
  }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    }
    setDeletingId(null);
  }

  async function handleReactionSend() {
    const content = reactionText.trim();
    if (!content || sendingReaction) return;

    setSendingReaction(true);

    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-protection": "1" },
        body: JSON.stringify({ content }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));

        if (res.status === 403) {
          toast("Reaction blocked — keep it respectful.", "error");
        } else {
          toast(data.error || "Failed to post reaction.", "error");
        }
        return;
      }

      toast("Reaction posted! It’s now on your profile.");
      setReactionText("");
      setShowReactionModal(false);
    } catch {
      toast("Failed to post reaction. Try again.", "error");
    } finally {
      setSendingReaction(false);
    }
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);

    // Before hydration, use a timezone-safe UTC format so server
    // and client produce identical HTML (prevents hydration mismatch).
    if (!mounted) {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "UTC",
      });
    }

    // After mount, render in the user's local timezone.
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  const generateShareImage = useCallback(async (msg: Message) => {
    setSharingId(msg.id);

    // Dynamic import to avoid SSR issues
    const html2canvas = (await import("html2canvas")).default;

    // Create an offscreen container for the share card
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    // Build the share card
    const card = document.createElement("div");
    card.style.cssText = `
      width: 1080px;
      height: 1920px;
      background: linear-gradient(165deg, #0c0c10 0%, #141428 40%, #1a1a35 60%, #0c0c10 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 120px 100px;
      position: relative;
      overflow: hidden;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    `;

    // Glow effect
    const glow = document.createElement("div");
    glow.style.cssText = `
      position: absolute;
      width: 600px;
      height: 600px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(124, 106, 172, 0.12) 0%, transparent 70%);
      top: 30%;
      left: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;
    card.appendChild(glow);

    // Quote mark decoration
    const quoteDecor = document.createElement("div");
    quoteDecor.style.cssText = `
      position: absolute;
      top: 340px;
      left: 100px;
      font-size: 280px;
      line-height: 1;
      color: rgba(124, 106, 172, 0.08);
      font-family: Georgia, serif;
      pointer-events: none;
    `;
    quoteDecor.textContent = "\u201C";
    card.appendChild(quoteDecor);

    // Closing quote mark decoration (bottom right, mirrored)
    const quoteClose = document.createElement("div");
    quoteClose.style.cssText = `
      position: absolute;
      bottom: 340px;
      right: 100px;
      font-size: 280px;
      line-height: 1;
      color: rgba(124, 106, 172, 0.08);
      font-family: Georgia, serif;
      pointer-events: none;
    `;
    quoteClose.textContent = "\u201D";
    card.appendChild(quoteClose);

    // Message content area
    const contentWrap = document.createElement("div");
    contentWrap.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const text = document.createElement("p");
    // Scale font size based on message length
    let fontSize = 52;
    if (msg.content.length > 400) fontSize = 34;
    else if (msg.content.length > 250) fontSize = 38;
    else if (msg.content.length > 150) fontSize = 44;
    else if (msg.content.length > 80) fontSize = 48;

    text.style.cssText = `
      color: #ededed;
      font-size: ${fontSize}px;
      line-height: 1.5;
      font-weight: 400;
      letter-spacing: -0.01em;
      text-align: center;
      word-break: break-word;
      white-space: pre-wrap;
      max-width: 100%;
    `;
    text.textContent = msg.content;
    contentWrap.appendChild(text);
    card.appendChild(contentWrap);

    // Bottom watermark area
    const bottomArea = document.createElement("div");
    bottomArea.style.cssText = `
      position: relative;
      z-index: 2;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding-top: 60px;
    `;

    // Divider line
    const divider = document.createElement("div");
    divider.style.cssText = `
      width: 60px;
      height: 2px;
      background: rgba(124, 106, 172, 0.3);
      border-radius: 1px;
      margin-bottom: 12px;
    `;
    bottomArea.appendChild(divider);

    // Brand name
    const brand = document.createElement("div");
    brand.style.cssText = `
      font-size: 36px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: rgba(165, 180, 252, 0.5);
    `;
    brand.textContent = "WhatUPB";
    bottomArea.appendChild(brand);

    // Tagline
    const tagline = document.createElement("div");
    tagline.style.cssText = `
      font-size: 22px;
      color: rgba(165, 180, 252, 0.25);
      letter-spacing: 0.04em;
    `;
    tagline.textContent = "anonymous messages";
    bottomArea.appendChild(tagline);

    // URL
    const url = document.createElement("div");
    url.style.cssText = `
      font-size: 18px;
      color: rgba(165, 180, 252, 0.18);
      letter-spacing: 0.04em;
    `;
    url.textContent = "whatupb.com";
    bottomArea.appendChild(url);

    card.appendChild(bottomArea);
    container.appendChild(card);

    try {
      const canvas = await html2canvas(card, {
        width: 1080,
        height: 1920,
        scale: 1,
        backgroundColor: null,
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL("image/png");
      setShareImageUrl(dataUrl);
      setShareMenuId(msg.id);
    } catch {
      toast("Failed to generate share image", "error");
    } finally {
      document.body.removeChild(container);
      setSharingId(null);
    }
  }, [toast]);

  function closeShareMenu() {
    setShareMenuId(null);
    setShareImageUrl(null);
  }

  async function handleDownload() {
    if (!shareImageUrl) return;
    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();
    toast("Image saved!");
    closeShareMenu();
  }

  async function handleShareInstagram() {
    if (!shareImageUrl) return;

    try {
      const blob = await (await fetch(shareImageUrl)).blob();
      const file = new File([blob], "whatupb-message.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        closeShareMenu();
        return;
      }
    } catch {
      // Fall through to download
    }

    // Fallback: download and instruct
    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();
    toast("Image saved! Open Instagram Stories and add it.");
    closeShareMenu();
  }

  async function handleShareSnapchat() {
    if (!shareImageUrl) return;

    try {
      const blob = await (await fetch(shareImageUrl)).blob();
      const file = new File([blob], "whatupb-message.png", { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
        closeShareMenu();
        return;
      }
    } catch {
      // Fall through to download
    }

    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();
    toast("Image saved! Open Snapchat and add it.");
    closeShareMenu();
  }

  async function handleShareX() {
    if (!shareImageUrl) return;

    // Download the image first
    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();

    // Open X compose with prefilled text
    const tweetText = encodeURIComponent(
      "Someone sent me this on WhatUPB \uD83D\uDC40\nhttps://whatupb.com"
    );
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, "_blank");
    toast("Image saved! Attach it to your post on X.");
    closeShareMenu();
  }


  const isCapped = !isPremium && totalCount > messages.length;

  return (
    <>
      <div className="flex flex-col gap-3">
        {/* Upgrade banner when free tier is capped */}
        {isCapped && (
          <div className="card border-denim-500/30 bg-gradient-to-r from-surface-1 to-surface-2 text-center py-6 px-5">
            <p className="text-white font-medium text-base mb-1">
              You have {totalCount - messages.length} more message{totalCount - messages.length !== 1 ? "s" : ""} waiting.
            </p>
            <p className="text-zinc-500 text-sm mb-4">
              Upgrade to Premium to unlock your full inbox.
            </p>
            <Link
              href="/settings"
              className="btn-primary w-full py-3 text-sm"
            >
              Upgrade to Premium
            </Link>
          </div>
        )}

        {messages.map((msg) => {
          return (
            <div key={msg.id} className="card group">
              {/* Original anonymous message */}
              <p className="text-white whitespace-pre-wrap break-words mb-3 leading-relaxed">
                {msg.content}
              </p>
              {detectCrisis(msg.content) && (
                <div className="flex items-start gap-2.5 bg-amber-500/5 border border-amber-500/20 rounded-xl px-3.5 py-2.5 mb-3 text-xs leading-relaxed">
                  <span className="flex-shrink-0 mt-0.5 text-amber-400" aria-hidden="true">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </span>
                  <p className="text-amber-200/90">
                    <span className="font-medium">This message may indicate distress.</span>{" "}
                    If this person needs help:{" "}
                    <a href="tel:988" className="text-amber-300 underline hover:text-amber-200 transition">
                      988 Suicide &amp; Crisis Lifeline
                    </a>{" "}
                    &mdash; call or text 988. Available 24/7.
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-600 tabular-nums">
                  {formatDate(msg.created_at)}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => generateShareImage(msg)}
                    disabled={sharingId === msg.id}
                    className="text-xs text-zinc-600 hover:text-denim-200 transition opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1"
                    type="button"
                  >
                    {sharingId === msg.id ? (
                      <>
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                        </svg>
                        Share
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setShowReactionModal(true)}
                    className="react-toggle-btn text-xs text-denim-300 hover:text-denim-200 transition opacity-0 group-hover:opacity-100 focus:opacity-100 flex items-center gap-1"
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
                    React
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
            </div>
          );
        })}
      </div>

      {/* Reaction modal overlay */}
      {showReactionModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setShowReactionModal(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal card */}
          <div
            className="relative z-10 w-full max-w-md mx-4 bg-surface-1 border border-border-subtle rounded-2xl p-6 animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-white text-lg font-semibold mb-1">Post a reaction</h2>
            <p className="text-zinc-500 text-sm mb-4">This will appear on your public profile.</p>

            <textarea
              value={reactionText}
              onChange={(e) => setReactionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReactionSend();
                }
                if (e.key === "Escape") {
                  setReactionText("");
                  setShowReactionModal(false);
                }
              }}
              placeholder="say something back to the void…"
              maxLength={280}
              rows={3}
              className="input text-sm resize-none mb-2 w-full"
              disabled={sendingReaction}
              autoFocus
            />

            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-600">
                {reactionText.length}/280
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setReactionText("");
                    setShowReactionModal(false);
                  }}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition px-3 py-1.5"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReactionSend()}
                  disabled={sendingReaction || reactionText.trim().length === 0}
                  className="btn-primary py-1.5 px-4 text-xs"
                  type="button"
                >
                  {sendingReaction ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share menu overlay */}
      {shareMenuId && shareImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={closeShareMenu}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Share sheet */}
          <div
            className="share-sheet relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            <div className="flex justify-center mb-4">
              <img
                src={shareImageUrl}
                alt="Share preview"
                className="w-full max-h-[60vh] object-contain rounded-lg border border-border-subtle shadow-lg"
              />
            </div>

            <p className="text-center text-sm text-zinc-400 mb-5">Share this message as an image</p>

            {/* Share options grid */}
            <div className="grid grid-cols-4 gap-3 mb-5">
              <button onClick={handleShareInstagram} className="share-option">
                <div className="share-icon-wrap bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400">
                  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400 mt-1.5">Stories</span>
              </button>

              <button onClick={handleShareSnapchat} className="share-option">
                <div className="share-icon-wrap bg-yellow-400">
                  <svg className="w-5 h-5 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.253.481-.25.406-.698.887-.698.246 0 .491.098.653.237.248.21.135.745-.174 1.064-.192.196-.476.363-.761.466-.285.102-.59.148-.824.178-.084.012-.156.019-.213.027l-.022.003c-.352.055-.474.135-.568.425-.153.457-.236.883-.344 1.164-.397 1.044-1.175 1.861-2.31 2.428-.259.129-.541.24-.838.332-.017.053-.027.112-.027.175 0 .146.072.284.181.388.228.212.586.342.91.438.48.141.987.207 1.311.445.338.247.389.675.086.978-.358.36-1.225.472-1.98.472-.526 0-1.073-.063-1.48-.13-.283-.046-.533-.088-.764-.088-.261 0-.42.047-.691.106-.406.089-.925.222-1.569.222-.069 0-.14-.003-.211-.01h-.033c-.643 0-1.163-.133-1.569-.222-.271-.059-.431-.106-.691-.106-.231 0-.481.042-.764.088-.407.067-.955.13-1.48.13-.756 0-1.623-.112-1.98-.472-.303-.303-.253-.73.085-.978.324-.238.832-.304 1.311-.445.324-.096.682-.226.91-.438.11-.104.181-.242.181-.388 0-.063-.01-.122-.027-.175-.297-.092-.579-.203-.838-.332-1.136-.567-1.913-1.384-2.31-2.428-.108-.281-.191-.707-.344-1.164-.094-.29-.216-.37-.568-.425l-.022-.003c-.057-.008-.129-.015-.213-.027-.234-.03-.539-.076-.824-.178-.285-.103-.569-.27-.761-.466-.309-.319-.422-.854-.174-1.064.162-.139.407-.237.653-.237.481 0 .406.448.887.698.263.133.622.269.922.253.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.447 1.069 10.804.793 11.794.793h.412z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400 mt-1.5">Snapchat</span>
              </button>

              <button onClick={handleShareX} className="share-option">
                <div className="share-icon-wrap bg-white">
                  <svg className="w-4 h-4 text-black" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400 mt-1.5">X</span>
              </button>

              <button onClick={handleDownload} className="share-option">
                <div className="share-icon-wrap bg-surface-3 border border-border-subtle">
                  <svg className="w-5 h-5 text-denim-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                </div>
                <span className="text-xs text-zinc-400 mt-1.5">Save</span>
              </button>
            </div>

            {/* Cancel */}
            <button
              onClick={closeShareMenu}
              className="w-full py-3 text-sm text-zinc-400 hover:text-white transition rounded-xl bg-surface-2 border border-border-subtle"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
