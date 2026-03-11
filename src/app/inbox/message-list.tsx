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

const REPORT_REASONS = [
  { value: "threatening", label: "Threatening / Violence" },
  { value: "harassment", label: "Harassment / Bullying" },
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "other", label: "Other" },
] as const;

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
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportMessageId, setReportMessageId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const { error } = await supabase.from("messages").delete().eq("id", id);
    if (!error) {
      setMessages(messages.filter((m) => m.id !== id));
    }
    setDeletingId(null);
  }

  // ── Report message flow ──────────────────────────────────
  function handleReport(messageId: string) {
    setReportMessageId(messageId);
    setReportReason("");
    setReportDetails("");
    setShowReportModal(true);
  }

  async function handleReportSubmit() {
    if (!reportMessageId || !reportReason || submittingReport) return;
    setSubmittingReport(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast("You must be logged in to report.", "error"); return; }
      const { error } = await supabase.from("message_reports").insert({
        message_id: reportMessageId,
        reporter_id: user.id,
        reason: reportReason,
        details: reportDetails.trim() || null,
      });
      if (error) {
        if (error.code === "23505") { toast("You\u2019ve already reported this message."); }
        else { toast("Failed to submit report. Try again.", "error"); console.error("[report] Insert error:", error.message); }
        return;
      }
      const { error: deleteError } = await supabase.from("messages").delete().eq("id", reportMessageId);
      if (deleteError) { console.error("[report] Delete error:", deleteError.message); }
      setMessages((prev) => prev.filter((m) => m.id !== reportMessageId));
      toast("Message reported. Thanks for keeping WhatUPB safe \uD83D\uDC99");
      setShowReportModal(false);
      setReportMessageId(null);
      setReportReason("");
      setReportDetails("");
    } catch { toast("Failed to submit report. Try again.", "error"); }
    finally { setSubmittingReport(false); }
  }

  // ── Reactions ────────────────────────────────────────────
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
        if (res.status === 403) { toast("Reaction blocked \u2014 keep it respectful.", "error"); }
        else { toast(data.error || "Failed to post reaction.", "error"); }
        return;
      }
      toast("Reaction posted! It\u2019s now on your profile.");
      setReactionText("");
      setShowReactionModal(false);
    } catch { toast("Failed to post reaction. Try again.", "error"); }
    finally { setSendingReaction(false); }
  }

  function handleQuickReact(emoji: string) {
    toast(`${emoji} reaction noted!`);
  }

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    if (!mounted) {
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "UTC" });
    }
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
  }

  const generateShareImage = useCallback(async (msg: Message) => {
    setSharingId(msg.id);
    const html2canvas = (await import("html2canvas")).default;
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "-9999px";
    container.style.top = "0";
    document.body.appendChild(container);

    const card = document.createElement("div");
    card.style.cssText = `width:1080px;height:1920px;background:linear-gradient(165deg,#F4F3F8 0%,#EEEDF4 40%,#E2DFF0 60%,#F4F3F8 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:120px 100px;position:relative;overflow:hidden;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;`;

    const glow = document.createElement("div");
    glow.style.cssText = `position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(155,142,232,0.15) 0%,transparent 70%);top:30%;left:50%;transform:translate(-50%,-50%);pointer-events:none;`;
    card.appendChild(glow);

    const quoteDecor = document.createElement("div");
    quoteDecor.style.cssText = `position:absolute;top:340px;left:100px;font-size:280px;line-height:1;color:rgba(155,142,232,0.1);font-family:Georgia,serif;pointer-events:none;`;
    quoteDecor.textContent = "\u201C";
    card.appendChild(quoteDecor);

    const quoteClose = document.createElement("div");
    quoteClose.style.cssText = `position:absolute;bottom:340px;right:100px;font-size:280px;line-height:1;color:rgba(155,142,232,0.1);font-family:Georgia,serif;pointer-events:none;`;
    quoteClose.textContent = "\u201D";
    card.appendChild(quoteClose);

    const contentWrap = document.createElement("div");
    contentWrap.style.cssText = `position:relative;z-index:2;width:100%;flex:1;display:flex;align-items:center;justify-content:center;`;

    const text = document.createElement("p");
    let fontSize = 52;
    if (msg.content.length > 400) fontSize = 34;
    else if (msg.content.length > 250) fontSize = 38;
    else if (msg.content.length > 150) fontSize = 44;
    else if (msg.content.length > 80) fontSize = 48;
    text.style.cssText = `color:#1A1730;font-size:${fontSize}px;line-height:1.5;font-weight:400;letter-spacing:-0.01em;text-align:center;word-break:break-word;white-space:pre-wrap;max-width:100%;`;
    text.textContent = msg.content;
    contentWrap.appendChild(text);
    card.appendChild(contentWrap);

    const bottomArea = document.createElement("div");
    bottomArea.style.cssText = `position:relative;z-index:2;width:100%;display:flex;flex-direction:column;align-items:center;gap:16px;padding-top:60px;`;

    const divider = document.createElement("div");
    divider.style.cssText = `width:60px;height:2px;background:rgba(155,142,232,0.35);border-radius:1px;margin-bottom:12px;`;
    bottomArea.appendChild(divider);

    const brand = document.createElement("div");
    brand.style.cssText = `font-size:36px;font-weight:700;letter-spacing:0.08em;color:rgba(155,142,232,0.5);`;
    brand.textContent = "WhatUPB";
    bottomArea.appendChild(brand);

    const tagline = document.createElement("div");
    tagline.style.cssText = `font-size:22px;color:rgba(155,142,232,0.3);letter-spacing:0.04em;`;
    tagline.textContent = "anonymous messages";
    bottomArea.appendChild(tagline);

    const url = document.createElement("div");
    url.style.cssText = `font-size:18px;color:rgba(155,142,232,0.2);letter-spacing:0.04em;`;
    url.textContent = "whatupb.com";
    bottomArea.appendChild(url);

    card.appendChild(bottomArea);
    container.appendChild(card);

    try {
      const canvas = await html2canvas(card, { width: 1080, height: 1920, scale: 1, backgroundColor: null, useCORS: true, logging: false });
      const dataUrl = canvas.toDataURL("image/png");
      setShareImageUrl(dataUrl);
      setShareMenuId(msg.id);
    } catch { toast("Failed to generate share image", "error"); }
    finally { document.body.removeChild(container); setSharingId(null); }
  }, [toast]);

  function closeShareMenu() { setShareMenuId(null); setShareImageUrl(null); }

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
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); closeShareMenu(); return; }
    } catch { /* Fall through */ }
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
      if (navigator.canShare?.({ files: [file] })) { await navigator.share({ files: [file] }); closeShareMenu(); return; }
    } catch { /* Fall through */ }
    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();
    toast("Image saved! Open Snapchat and add it.");
    closeShareMenu();
  }

  async function handleShareX() {
    if (!shareImageUrl) return;
    const link = document.createElement("a");
    link.download = "whatupb-message.png";
    link.href = shareImageUrl;
    link.click();
    const tweetText = encodeURIComponent("Someone sent me this on WhatUPB \uD83D\uDC40\nhttps://whatupb.com");
    window.open(`https://x.com/intent/tweet?text=${tweetText}`, "_blank");
    toast("Image saved! Attach it to your post on X.");
    closeShareMenu();
  }

  const isCapped = !isPremium && totalCount > messages.length;

  /* ── inline style helpers ──────────────────────────────── */
  const msgCard: React.CSSProperties = {
    background: "#fff",
    border: "1px solid rgba(190,185,215,0.45)",
    borderRadius: "16px",
    padding: "18px 20px",
    marginBottom: "12px",
    boxShadow: "0 1px 0 rgba(255,255,255,1) inset, 0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)",
    transition: "all 0.2s",
  };
  const actionBtn: React.CSSProperties = {
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
    padding: "4px 10px",
    borderRadius: "8px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
    color: "rgba(26,23,48,0.42)",
  };

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "0px" }}>
        {/* Upgrade banner */}
        {isCapped && (
          <div style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: "16px", border: "1px solid rgba(155,142,232,0.2)", textAlign: "center", padding: "24px 20px", marginBottom: "16px", boxShadow: "0 4px 16px rgba(100,90,160,0.08)" }}>
            <p style={{ color: "var(--ink)", fontWeight: 600, fontSize: "15px", marginBottom: "4px" }}>
              You have {totalCount - messages.length} more message{totalCount - messages.length !== 1 ? "s" : ""} waiting.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>
              Upgrade to Premium to unlock your full inbox.
            </p>
            <Link href="/settings" className="card-btn-primary" style={{ maxWidth: "100%" }}>
              Upgrade to Premium
            </Link>
          </div>
        )}

        {messages.map((msg) => {
          const isCrisis = detectCrisis(msg.content);

          return (
            <div key={msg.id} className="group" style={msgCard}>
              {/* Message text */}
              <p style={{ color: "var(--ink)", whiteSpace: "pre-wrap", wordBreak: "break-word", marginBottom: "12px", lineHeight: 1.65, fontSize: "15px" }}>
                {msg.content}
              </p>

              {/* Crisis banner */}
              {isCrisis && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", borderRadius: "12px", padding: "12px 14px", marginBottom: "12px", fontSize: "12px", lineHeight: 1.6, background: "rgba(220,38,38,0.06)", border: "1px solid rgba(220,38,38,0.2)", color: "#991b1b" }}>
                  <span style={{ flexShrink: 0, marginTop: "2px", color: "#dc2626" }} aria-hidden="true">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                    </svg>
                  </span>
                  <p>
                    <span style={{ fontWeight: 600 }}>This message may indicate distress.</span>{" "}
                    If this person needs help:{" "}
                    <a href="tel:988" style={{ textDecoration: "underline", fontWeight: 600, color: "#dc2626" }}>
                      988 Suicide &amp; Crisis Lifeline
                    </a>{" "}
                    &mdash; call or text 988. Available 24/7.
                  </p>
                </div>
              )}

              {/* Bottom row: timestamp + actions */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "12px", color: "var(--muted)", fontVariantNumeric: "tabular-nums" }}>
                  {formatDate(msg.created_at)}
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                  {/* Quick emoji reactions */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ display: "flex", alignItems: "center", gap: "2px", marginRight: "8px" }}>
                    <button onClick={() => handleQuickReact("\u2764\uFE0F")} style={{ fontSize: "14px", padding: "4px", background: "none", border: "none", cursor: "pointer", transition: "transform 0.15s" }} type="button" aria-label="Heart reaction">&#10084;&#65039;</button>
                    <button onClick={() => handleQuickReact("\uD83D\uDD25")} style={{ fontSize: "14px", padding: "4px", background: "none", border: "none", cursor: "pointer", transition: "transform 0.15s" }} type="button" aria-label="Fire reaction">&#128293;</button>
                    <button onClick={() => handleQuickReact("\uD83D\uDC40")} style={{ fontSize: "14px", padding: "4px", background: "none", border: "none", cursor: "pointer", transition: "transform 0.15s" }} type="button" aria-label="Eyes reaction">&#128064;</button>
                  </div>

                  {/* Share */}
                  <button onClick={() => generateShareImage(msg)} disabled={sharingId === msg.id} className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" style={{ ...actionBtn, color: sharingId === msg.id ? "#9B8EE8" : "rgba(26,23,48,0.42)" }} type="button">
                    {sharingId === msg.id ? (
                      <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}><circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>...</>
                    ) : (
                      <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-12.814a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0 12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>Share</>
                    )}
                  </button>

                  {/* React */}
                  <button onClick={() => setShowReactionModal(true)} className="react-toggle-btn opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" style={{ ...actionBtn, color: "#9B8EE8" }} type="button">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" /></svg>
                    React
                  </button>

                  {/* Report */}
                  <button onClick={() => handleReport(msg.id)} className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" style={{ ...actionBtn, color: "rgba(26,23,48,0.32)" }} type="button" aria-label="Report message">
                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" /></svg>
                    Report
                  </button>

                  {/* Delete */}
                  <button onClick={() => handleDelete(msg.id)} disabled={deletingId === msg.id} className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity" style={{ ...actionBtn, color: "rgba(220,38,38,0.5)" }} type="button">
                    {deletingId === msg.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Reaction modal ──────────────────────────────────── */}
      {showReactionModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowReactionModal(false)}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,23,48,0.3)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 16px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "20px", padding: "24px", boxShadow: "0 24px 60px rgba(100,90,180,0.15)" }} className="animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "var(--ink)", fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-syne), 'Syne', sans-serif", marginBottom: "4px" }}>Post a reaction</h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>This will appear on your public profile.</p>
            <textarea
              value={reactionText}
              onChange={(e) => setReactionText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReactionSend(); }
                if (e.key === "Escape") { setReactionText(""); setShowReactionModal(false); }
              }}
              placeholder="say something back to the void\u2026"
              maxLength={280}
              rows={3}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid rgba(155,142,232,0.18)", background: "rgba(255,255,255,0.8)", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: "14px", color: "#1A1730", outline: "none", resize: "none", marginBottom: "8px" }}
              disabled={sendingReaction}
              autoFocus
            />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>{reactionText.length}/280</span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button onClick={() => { setReactionText(""); setShowReactionModal(false); }} style={{ fontSize: "13px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "6px 12px" }} type="button">Cancel</button>
                <button
                  onClick={() => handleReactionSend()}
                  disabled={sendingReaction || reactionText.trim().length === 0}
                  style={{ padding: "8px 20px", fontSize: "13px", fontWeight: 600, borderRadius: "10px", border: "none", cursor: (sendingReaction || reactionText.trim().length === 0) ? "not-allowed" : "pointer", color: "#fff", background: (sendingReaction || reactionText.trim().length === 0) ? "rgba(155,142,232,0.4)" : "linear-gradient(135deg, #9B8EE8 0%, #7C6FCC 100%)", boxShadow: "0 4px 14px rgba(124,111,204,0.3)", transition: "all 0.2s", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}
                  type="button"
                >
                  {sendingReaction ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Share menu overlay ──────────────────────────────── */}
      {shareMenuId && shareImageUrl && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={closeShareMenu}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,23,48,0.3)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 16px 16px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "20px", padding: "24px", boxShadow: "0 24px 60px rgba(100,90,180,0.15)" }} className="animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            {/* Preview */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
              <img src={shareImageUrl} alt="Share preview" style={{ width: "100%", maxHeight: "60vh", objectFit: "contain", borderRadius: "12px", border: "1px solid rgba(190,185,215,0.3)", boxShadow: "0 4px 16px rgba(100,90,160,0.1)" }} />
            </div>
            <p style={{ textAlign: "center", fontSize: "13px", color: "var(--muted)", marginBottom: "20px" }}>Share this message as an image</p>

            {/* Share options grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
              <button onClick={handleShareInstagram} className="settings-platform-btn">
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #833AB4, #E1306C, #F77737)" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>Stories</span>
              </button>

              <button onClick={handleShareSnapchat} className="settings-platform-btn">
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFC00" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="black"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.253.481-.25.406-.698.887-.698.246 0 .491.098.653.237.248.21.135.745-.174 1.064-.192.196-.476.363-.761.466-.285.102-.59.148-.824.178-.084.012-.156.019-.213.027l-.022.003c-.352.055-.474.135-.568.425-.153.457-.236.883-.344 1.164-.397 1.044-1.175 1.861-2.31 2.428-.259.129-.541.24-.838.332-.017.053-.027.112-.027.175 0 .146.072.284.181.388.228.212.586.342.91.438.48.141.987.207 1.311.445.338.247.389.675.086.978-.358.36-1.225.472-1.98.472-.526 0-1.073-.063-1.48-.13-.283-.046-.533-.088-.764-.088-.261 0-.42.047-.691.106-.406.089-.925.222-1.569.222-.069 0-.14-.003-.211-.01h-.033c-.643 0-1.163-.133-1.569-.222-.271-.059-.431-.106-.691-.106-.231 0-.481.042-.764.088-.407.067-.955.13-1.48.13-.756 0-1.623-.112-1.98-.472-.303-.303-.253-.73.085-.978.324-.238.832-.304 1.311-.445.324-.096.682-.226.91-.438.11-.104.181-.242.181-.388 0-.063-.01-.122-.027-.175-.297-.092-.579-.203-.838-.332-1.136-.567-1.913-1.384-2.31-2.428-.108-.281-.191-.707-.344-1.164-.094-.29-.216-.37-.568-.425l-.022-.003c-.057-.008-.129-.015-.213-.027-.234-.03-.539-.076-.824-.178-.285-.103-.569-.27-.761-.466-.309-.319-.422-.854-.174-1.064.162-.139.407-.237.653-.237.481 0 .406.448.887.698.263.133.622.269.922.253.198 0 .326-.045.401-.09-.008-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.299-4.847C7.447 1.069 10.804.793 11.794.793h.412z" /></svg>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>Snapchat</span>
              </button>

              <button onClick={handleShareX} className="settings-platform-btn">
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", border: "1px solid rgba(190,185,215,0.4)" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="#1A1730"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>X</span>
              </button>

              <button onClick={handleDownload} className="settings-platform-btn">
                <div style={{ width: "44px", height: "44px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(155,142,232,0.08)", border: "1px solid rgba(155,142,232,0.2)" }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#9B8EE8" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
                </div>
                <span style={{ fontSize: "11px", color: "var(--muted)", marginTop: "6px" }}>Save</span>
              </button>
            </div>

            <button onClick={closeShareMenu} style={{ width: "100%", padding: "12px", fontSize: "13px", color: "var(--muted)", background: "rgba(155,142,232,0.06)", border: "1px solid rgba(155,142,232,0.15)", borderRadius: "12px", cursor: "pointer", transition: "all 0.2s", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Report modal ────────────────────────────────────── */}
      {showReportModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => { setShowReportModal(false); setReportReason(""); setReportDetails(""); }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(26,23,48,0.3)", backdropFilter: "blur(8px)" }} />
          <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: "420px", margin: "0 16px", background: "rgba(255,255,255,0.95)", backdropFilter: "blur(40px)", border: "1px solid rgba(255,255,255,0.9)", borderRadius: "20px", padding: "24px", boxShadow: "0 24px 60px rgba(100,90,180,0.15)" }} className="animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ color: "var(--ink)", fontSize: "18px", fontWeight: 700, fontFamily: "var(--font-syne), 'Syne', sans-serif", marginBottom: "4px" }}>Report message</h2>
            <p style={{ color: "var(--muted)", fontSize: "13px", marginBottom: "16px" }}>This message will be removed from your inbox and flagged for review.</p>

            {/* Reason selection */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "16px" }}>
              {REPORT_REASONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setReportReason(option.value)}
                  style={{
                    width: "100%",
                    textAlign: "left" as const,
                    padding: "10px 16px",
                    borderRadius: "12px",
                    fontSize: "13px",
                    transition: "all 0.15s",
                    border: reportReason === option.value ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(190,185,215,0.35)",
                    background: reportReason === option.value ? "rgba(245,158,11,0.06)" : "rgba(255,255,255,0.6)",
                    color: reportReason === option.value ? "#92400e" : "var(--ink)",
                    fontWeight: reportReason === option.value ? 600 : 400,
                    cursor: "pointer",
                    fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                  }}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>

            <textarea
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") { setShowReportModal(false); setReportReason(""); setReportDetails(""); } }}
              placeholder="Additional details (optional)"
              maxLength={200}
              rows={2}
              style={{ width: "100%", padding: "12px 15px", borderRadius: "12px", border: "1px solid rgba(155,142,232,0.18)", background: "rgba(255,255,255,0.8)", fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif", fontSize: "14px", color: "#1A1730", outline: "none", resize: "none", minHeight: "60px", marginBottom: "4px" }}
              disabled={submittingReport}
            />
            <span style={{ fontSize: "11px", color: "var(--muted)", display: "block", marginBottom: "16px" }}>{reportDetails.length}/200</span>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px" }}>
              <button onClick={() => { setShowReportModal(false); setReportReason(""); setReportDetails(""); }} style={{ fontSize: "13px", color: "var(--muted)", background: "none", border: "none", cursor: "pointer", padding: "6px 12px" }} type="button">Cancel</button>
              <button
                onClick={handleReportSubmit}
                disabled={submittingReport || !reportReason}
                style={{
                  background: submittingReport || !reportReason ? "rgba(245,158,11,0.3)" : "#f59e0b",
                  color: "#fff",
                  padding: "8px 20px",
                  fontSize: "13px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  border: "none",
                  cursor: submittingReport || !reportReason ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
                }}
                type="button"
              >
                {submittingReport ? "Reporting\u2026" : "Report & Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
