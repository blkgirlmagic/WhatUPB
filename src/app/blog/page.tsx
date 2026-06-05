import type { Metadata } from "next";
import Link from "next/link";
import { DiagonalLines } from "@/components/diagonal-lines";

export const metadata: Metadata = {
  title: "Blog — WhatUPB",
  description: "Updates, stories, and behind-the-scenes from the WhatUPB team.",
};

const POSTS = [
  {
    slug: "why-we-built-whatupb",
    title: "Why We Built WhatUPB",
    excerpt:
      "The internet is full of noise. We wanted to build a place where people could say what they really think — anonymously, safely, and without judgment.",
    date: "Mar 15, 2026",
    tag: "Origin Story",
    tagColor: "#c9a84c",
  },
  {
    slug: "safety-first-how-moderation-works",
    title: "Safety First: How Moderation Works",
    excerpt:
      "Every message on WhatUPB passes through real-time content filters, crisis detection, and abuse prevention — before it ever reaches your inbox.",
    date: "Mar 12, 2026",
    tag: "Safety",
    tagColor: "#10b981",
  },
  {
    slug: "introducing-studios",
    title: "Introducing WhatUPB Studios",
    excerpt:
      "We're launching original video series — MOTE, What Up B, and BETWEEN — stories born from the anonymous messages people actually send.",
    date: "Mar 10, 2026",
    tag: "Product",
    tagColor: "#6b5ce7",
  },
  {
    slug: "the-power-of-anonymous-kindness",
    title: "The Power of Anonymous Kindness",
    excerpt:
      "What happens when you let people say nice things without attaching their name? Turns out — a lot of people just want to make someone's day.",
    date: "Mar 8, 2026",
    tag: "Culture",
    tagColor: "#e879a0",
  },
  {
    slug: "premium-is-here",
    title: "Premium Is Here — Unlock Your Full Inbox",
    excerpt:
      "Unlimited message history, keyword filters, custom themes, and more. Starting at $0.99/week.",
    date: "Mar 5, 2026",
    tag: "Launch",
    tagColor: "#c9a84c",
  },
];

export default function BlogPage() {
  return (
    <div className="landing-page">
      <div className="bloom" />
      <DiagonalLines />

      {/* NAV */}
      <nav className="landing-nav">
        <Link href="/" className="nav-logo">
          WhatUPB
        </Link>
        <div className="nav-links">
          <a href="/#how-it-works">How it works</a>
          <Link href="/studios">Studios</Link>
          <Link href="/blog" style={{ color: "var(--ink)", fontWeight: 500 }}>Blog</Link>
          <Link href="/signup" className="nav-cta">Get Started</Link>
        </div>
      </nav>

      {/* HEADER */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "48px 20px 0" }}>
        <div className="anim-1" style={{ marginBottom: "12px" }}>
          <div style={{
            fontSize: "10px", letterSpacing: "2.5px", textTransform: "uppercase" as const,
            color: "#c9a84c", fontWeight: 600,
            fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
          }}>
            WhatUPB Blog
          </div>
        </div>
        <h1 className="anim-1" style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', serif",
          fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 800,
          color: "var(--ink)", letterSpacing: "-0.5px", lineHeight: 1.15,
          marginBottom: "12px",
        }}>
          Updates &amp; Stories
        </h1>
        <p className="anim-2" style={{
          fontSize: "16px", color: "var(--muted)", lineHeight: 1.6,
          maxWidth: "480px", marginBottom: "48px",
        }}>
          Behind the scenes, product updates, and the culture of honest conversations.
        </p>

        {/* POSTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingBottom: "64px" }}>
          {POSTS.map((post, i) => (
            <article
              key={post.slug}
              className={`anim-${Math.min(i + 2, 7)}`}
              style={{
                background: "#fff",
                border: "1px solid rgba(190,185,215,0.45)",
                borderRadius: "18px",
                padding: "24px",
                boxShadow: "0 1px 0 rgba(255,255,255,1) inset, 0 4px 6px rgba(100,90,160,0.06), 0 10px 20px rgba(100,90,160,0.08)",
                transition: "all 0.2s",
                cursor: "pointer",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                <span style={{
                  fontSize: "10px", fontWeight: 700, letterSpacing: "0.5px",
                  textTransform: "uppercase" as const,
                  padding: "3px 10px", borderRadius: "50px",
                  background: `${post.tagColor}15`, color: post.tagColor,
                  border: `1px solid ${post.tagColor}30`,
                }}>
                  {post.tag}
                </span>
                <span style={{
                  fontSize: "12px", color: "var(--muted)",
                  fontFamily: "var(--font-ibm-plex-mono), 'IBM Plex Mono', monospace",
                }}>
                  {post.date}
                </span>
              </div>
              <h2 style={{
                fontFamily: "var(--font-playfair), 'Playfair Display', serif",
                fontSize: "20px", fontWeight: 700,
                color: "var(--ink)", letterSpacing: "-0.3px",
                marginBottom: "8px", lineHeight: 1.3,
              }}>
                {post.title}
              </h2>
              <p style={{
                fontSize: "14px", color: "var(--muted)", lineHeight: 1.6,
              }}>
                {post.excerpt}
              </p>
            </article>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo-row">
              <span className="footer-wordmark">WhatUPB</span>
            </div>
            <p className="footer-tagline">
              Built for honest conversations.<br />Messages are moderated for safety.
            </p>
          </div>
          <div className="footer-links-col">
            <div className="footer-col-label">Links</div>
            <div className="footer-links-row">
              <Link href="/">Home</Link>
              <Link href="/blog">Blog</Link>
              <Link href="/privacy">Privacy</Link>
              <Link href="/terms">Terms</Link>
              <Link href="/content-policy">Content Policy</Link>
              <a href="/#safety">Safety</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; 2026 WhatUPB. All rights reserved.</span>
          <span>whatupb.com</span>
        </div>
      </footer>
    </div>
  );
}
